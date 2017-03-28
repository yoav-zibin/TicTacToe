// the game stage
enum GameStage {
    PlacingCue = 1, // player is placing the cue ball
    Aiming, // player is ready to hit the cue ball
    CueHit, // player has hit the cue ball
    NetworkSent, // game state is sent over network
}

// bunch of game play constants
module GameplayConsts {
    export const CollisionCategoryCue = 0x0001;
    export const CollisionCategoryNormalBalls = 0x0002;
    export const CollisionMaskAllBalls = 0x0003;
    export const CollisionMaskMouse = 0x0000;

    export const BallRestitution = 0.9;
    export const BallFriction = 0.01;

    export const BorderThickness = 10;
    // export const BorderClearance = 10;

    export const TextureSize = 256.0; // texture is 256x256
    export const ClickDistanceLimit = 10; // 10x the ball radius
};

// using shortcuts
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Query = Matter.Query,
    Svg = Matter.Svg,
    Bodies = Matter.Bodies;

// Get initial game state
var gameState = GameLogic.getInitialState();

// Globals
var _engine = Engine.create(),
    _world = _engine.world;
var _render = Render.create({
    element: document.getElementById("canvas-container"),
    engine: _engine,
    options: {
        height: gameState.PoolBoard.Height,
        width: gameState.PoolBoard.Width,
    }
});
_engine.world.gravity.y = 0;
let renderOptions = <any>_render.options;
renderOptions.wireframes = false;
renderOptions.background = 'green';
var _renderLength = 0.0; // the guideline _renderLength
var _gameStage : GameStage;
if (gameState.CanMoveCueBall) {
    //gameStage = GameStage.PlacingCue; // XXX: placing cue not implemented yet
    _gameStage = GameStage.Aiming;
} else {
    _gameStage = GameStage.Aiming;
}
var _firstTouchBall :Ball | null;
var _pocketedBalls :Ball[] = [];

function shootClick(cueBall : Matter.Body) {
    //if (!isHumanTurn()) return;
    if (_gameStage != GameStage.Aiming) return;
    _gameStage = GameStage.CueHit;
    let forcePosition : Matter.Vector = {
        x: cueBall.position.x + 1.0 * Math.cos(cueBall.angle),
        y: cueBall.position.y + 1.0 * Math.sin(cueBall.angle)
    };
    let force : number = _renderLength * 0.0008;

    console.log("force pos: ", forcePosition);
    console.log("render len: ", _renderLength);

    Matter.Body.applyForce(cueBall, forcePosition, 
    {
        x: force * cueBall.mass * Math.cos(cueBall.angle),
        y: force * cueBall.mass * Math.sin(cueBall.angle)
    });

    // reset render len
    _renderLength = 0.0;
    _engine.enableSleeping = true;
}

function isWorldSleeping(world : Matter.World) :boolean {
    let bodies = Matter.Composite.allBodies(world);
    let sleeping = bodies.filter((body) => body.isSleeping);
    let isWorldSleeping = bodies.length === sleeping.length;
    return isWorldSleeping;
}

// helper method to get distance between 2 vectors
function distanceBetweenVectors(vec1 : Matter.Vector, vec2 : Matter.Vector) :number {
    let xsq = Math.pow(vec1.x - vec2.x, 2);
    let ysq = Math.pow(vec1.y - vec2.y, 2);
    return Math.sqrt(xsq + ysq);
}

function createBorderBody(pocket1 : Pocket, pocket2 : Pocket, vertical : boolean) :Matter.Body {
    let x, y, width, height : number;
    if (vertical) {
        x = pocket1.Position.X;
        y = (pocket1.Position.Y + pocket2.Position.Y) / 2.0;
        width = GameplayConsts.BorderThickness;
        height = pocket2.Position.Y - pocket1.Position.Y - pocket1.Radius - pocket2.Radius;
    } else {
        x = (pocket1.Position.X + pocket2.Position.X) / 2.0;
        y = pocket1.Position.Y;
        width = pocket2.Position.X - pocket1.Position.X - pocket1.Radius - pocket2.Radius;
        height = GameplayConsts.BorderThickness;
    }
    return Bodies.rectangle(
        x, y, width, height,
        <any>{
            isStatic: true,
            render: {fillStyle: '#825201', strokeStyle: 'black' },
            label: 'Border'
        });
}

function createBallModel(x:number, y:number, ballNumber:number, pocketed:boolean, radius:number) :Ball {
    let ballType : BallType;
    if (ballNumber == 0) ballType = BallType.Cue;
    else if (ballNumber == 8) ballType = BallType.Eight;
    else if (ballNumber > 8) ballType = BallType.Stripes;
    else ballType = BallType.Solids;

    let theBall = {
        Position : {X: x, Y: y},
        Pocketed : pocketed,
        Radius : radius,
        BallType : ballType,
        Number : ballNumber,
    };
    return theBall;
}

function drawGuideLine(context : CanvasRenderingContext2D, cueBody : Matter.Body) {
    let startPoint = { X: cueBody.position.x, Y: cueBody.position.y };
    let endPoint = {
        X: cueBody.position.x + (_renderLength) * Math.cos(cueBody.angle),
        Y: cueBody.position.y + (_renderLength) * Math.sin(cueBody.angle)
    }
    context.globalAlpha = 0.5;
    
    context.beginPath();
    context.setLineDash([3]);
    context.moveTo(startPoint.X, startPoint.Y);
    context.lineTo(endPoint.X, endPoint.Y);
    context.strokeStyle = 'red';
    context.lineWidth = 5.5;
    context.stroke();
    context.setLineDash([]);
}

// create borders
let pockets = gameState.PoolBoard.Pockets;
World.add(_world, [
    createBorderBody(pockets[0], pockets[3], false), // top
    createBorderBody(pockets[2], pockets[5], false), // bottom
    createBorderBody(pockets[0], pockets[1], true), // left top
    createBorderBody(pockets[1], pockets[2], true), // left bottom
    createBorderBody(pockets[3], pockets[4], true), // right top
    createBorderBody(pockets[4], pockets[5], true), // right bottom
]);

// create pockets
for (let pocket of gameState.PoolBoard.Pockets) {
    World.add(_world, 
    Bodies.circle(pocket.Position.X, pocket.Position.Y, pocket.Radius,
    <any>{ 
        isStatic: true,
        render: { fillStyle: 'black' },
        label: 'Pocket'
    }));
}

// create ball bodies
let textureScale = gameState.CueBall.Radius * 2 / GameplayConsts.TextureSize;
// cue ball
let cueBall = Bodies.circle(gameState.CueBall.Position.X, gameState.CueBall.Position.Y,
    gameState.CueBall.Radius, 
    <any>{ 
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { fillStyle: 'white', strokeStyle: 'black' },
        label: 'Ball 0'
    });
World.add(_world, cueBall);
// eight ball
World.add(_world,
    Bodies.circle(gameState.EightBall.Position.X, gameState.EightBall.Position.Y,
    gameState.EightBall.Radius,
    <any>{ 
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/8.png', xScale: textureScale, yScale: textureScale } },
        label: 'Ball 8'
    }));
// solid balls
for (let ball of gameState.SolidBalls) {
    World.add(_world, 
    Bodies.circle(ball.Position.X, ball.Position.Y, ball.Radius, 
    <any>{
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/' + String(ball.Number) + '.png', xScale: textureScale, yScale: textureScale } },
        label: 'Ball ' + String(ball.Number)
    }));
}
// striped balls
for (let ball of gameState.StripedBalls) {
    World.add(_world, 
    Bodies.circle(ball.Position.X, ball.Position.Y, ball.Radius, 
    <any>{
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/' + String(ball.Number) + '.png', xScale: textureScale, yScale: textureScale } },
        label: 'Ball ' + String(ball.Number)
    }));
}

let mouse = Mouse.create(_render.canvas),
    mouseConstraint = (<any>MouseConstraint).create(_engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });
mouseConstraint.collisionFilter.mask = GameplayConsts.CollisionMaskMouse;

World.add(_world, mouseConstraint);

// EVENT: set angle and _renderLength on mousemove
Matter.Events.on(mouseConstraint, 'mousemove', function (event) {
    // This function sets the angle and _renderLength
    let mousePosition = event.mouse.position;
    let cuePosition = cueBall.position;

    let horizontalDistance = cuePosition.x - mousePosition.x;
    let verticalDistance = cuePosition.y - mousePosition.y;

    let angle = Math.atan2(verticalDistance, horizontalDistance);

    _renderLength = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
    Matter.Body.setAngle(cueBall, angle);    
});
Matter.Events.on(mouseConstraint, 'mousedown', function(event) {
});
// EVENT: shoot cue ball on mouseup
Matter.Events.on(mouseConstraint, 'mouseup', function (event) {
    let mouseUpPosition = <Matter.Vector>event.mouse.mouseupPosition;
    let cuePosition = cueBall.position;
    // only shoot cue ball when the mouse is around the cue ball
    let dist = distanceBetweenVectors(mouseUpPosition, cuePosition);
    let distLimit = gameState.CueBall.Radius * GameplayConsts.ClickDistanceLimit;
    console.log("dist ", dist, " limit ", distLimit);
    if (dist < distLimit) {
        shootClick(cueBall);
    }
});
// EVENT: handle pocket and ball collision
Matter.Events.on(_engine, 'collisionStart', function(event) {
    for (let pair of event.pairs) {
        //console.log(pair.bodyA.label, pair.bodyB.label);
        if (pair.bodyA.label == 'Pocket' && pair.bodyB.label.indexOf('Ball') >= 0) {
            // pocket - ball collision
            // destroy the ball body
            World.remove(_world, pair.bodyB);
            // get the ball number
            let ballBody = pair.bodyB;
            let ballNumber = Number(ballBody.label.split(' ')[1]);
            // create the ball model and add to pocketed balls
            let ballModel = createBallModel(ballBody.position.x, ballBody.position.y,
                ballNumber, true, gameState.CueBall.Radius);
            _pocketedBalls.push(ballModel);
        } 
        if (pair.bodyA.label.indexOf('Ball') >= 0 && pair.bodyB.label.indexOf('Ball') >= 0) {
            // ball - ball collision
            if (_firstTouchBall == null) {
                let ballNumberA = Number(pair.bodyA.label.split(' ')[1]);
                let ballNumberB = Number(pair.bodyB.label.split(' ')[1]);
                // XXX: It always sets 'pocketed' to false for touched balls
                if (ballNumberA != 0 && ballNumberB == 0) {
                    // B is cue
                    _firstTouchBall = createBallModel(pair.bodyA.position.x, 
                        pair.bodyA.position.y, ballNumberA, false, gameState.CueBall.Radius);
                } else if (ballNumberA == 0 && ballNumberB != 0) {
                    // A is cue
                    _firstTouchBall = createBallModel(pair.bodyB.position.x, 
                        pair.bodyB.position.y, ballNumberB, false, gameState.CueBall.Radius);
                }
            }
        }
    }
});
// EVENT: update
Matter.Events.on(_render, 'afterRender', function() {
    // draw the render line
    if (_gameStage == GameStage.Aiming) {
        let distLimit = gameState.CueBall.Radius * GameplayConsts.ClickDistanceLimit;
        if (_renderLength < distLimit) drawGuideLine(_render.context, cueBall);
    }

    // send return state when all bodies are sleeping
    if (_gameStage == GameStage.CueHit && isWorldSleeping(_world)) {
        _gameStage = GameStage.NetworkSent;
        // send the move over network here
        console.log("player's turn is done");
        let theReturnState = {
            PocketedBalls: _pocketedBalls,
            TouchedBall: _firstTouchBall,
        }
        console.log(theReturnState);
    }
});

Render.run(_render);
Engine.run(_engine);
