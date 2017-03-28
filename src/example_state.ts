// the game stage
enum GameStage {
    PlacingCue = 1, // player is placing the cue ball
    Aiming, // player is ready to hit the cue ball
    CueHit, // player has hit the cue ball
    NetworkSent, // game state is sent over network
}

interface BallModel {
    Ball: Ball,
    Body: Matter.Body,
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
var cueBallModel : BallModel;
var eightBallModel : BallModel;
var solidBallModels : BallModel[] = [];
var stripedBallModels : BallModel[] = [];

function shootClick(cueBall : Matter.Body) {
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

function getBallModelFromBody(ballBody : Matter.Body) :BallModel {
    let ballNumber = Number(ballBody.label.split(' ')[1]);
    if (ballNumber == 0) {
        // cue ball
        return cueBallModel;
    } else if (ballNumber == 8) {
        // eight ball
        return eightBallModel;
    } else if (ballNumber > 8) {
        // striped ball
        return stripedBallModels[ballNumber - 9];
    } else {
        // solid ball
        return solidBallModels[ballNumber - 1];
    }
}

function syncBallModelPositions() {
    // sync cue ball pos
    cueBallModel.Ball.Position = { X: cueBallModel.Body.position.x, Y: cueBallModel.Body.position.y };
    // sync eight ball pos
    eightBallModel.Ball.Position = { X: eightBallModel.Body.position.x, Y: eightBallModel.Body.position.y };
    // sync solid ball pos
    for (let ballModel of solidBallModels) {
        ballModel.Ball.Position = { X: ballModel.Body.position.x, Y: ballModel.Body.position.y };
    }
    // sync striped ball pos
    for (let ballModel of stripedBallModels) {
        ballModel.Ball.Position = { X: ballModel.Body.position.x, Y: ballModel.Body.position.y };
    }
}

function finalize() {
    // send the move over network here
    console.log("player's turn is done");
    // sync the model positions
    syncBallModelPositions();
    // create return state
    let theReturnState : ReturnState = {
        PocketedBalls: _pocketedBalls,
        TouchedBall: _firstTouchBall,
    }
    // create IState
    let solidBalls : Ball[] = [];
    let stripedBalls : Ball[] = [];
    for (let ballModel of solidBallModels) {
        solidBalls.push(ballModel.Ball);
    }
    for (let ballModel of stripedBallModels) {
        stripedBalls.push(ballModel.Ball);
    }
    let finalState : IState = {
        SolidBalls: solidBalls,
        StripedBalls: stripedBalls,
        EightBall: eightBallModel.Ball,
        CueBall: cueBallModel.Ball,
        CanMoveCueBall: null, // set by gamelogic
        PoolBoard: gameState.PoolBoard,
        FirstMove: false, // XXX: hard code to false for now
        Player1Color: null, // set by gamelogic
        Player2Color: null, // set by gamelogic
        DeltaBalls: theReturnState,
    }
    console.log(theReturnState);
    console.log(finalState);
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

// create ball bodies and body models
let textureScale = gameState.CueBall.Radius * 2 / GameplayConsts.TextureSize;
// cue ball
let cueBallBody = Bodies.circle(gameState.CueBall.Position.X, gameState.CueBall.Position.Y,
    gameState.CueBall.Radius, <any>{ 
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { fillStyle: 'white', strokeStyle: 'black' },
        label: 'Ball 0'
    });
World.add(_world, cueBallBody);
cueBallModel = { Ball: gameState.CueBall, Body: cueBallBody };

// eight ball
let eightBallBody = Bodies.circle(gameState.EightBall.Position.X, gameState.EightBall.Position.Y,
    gameState.EightBall.Radius, <any>{ 
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/8.png', xScale: textureScale, yScale: textureScale } },
        label: 'Ball 8'
    });
World.add(_world, eightBallBody);
eightBallModel = { Ball: gameState.EightBall, Body: eightBallBody };

// solid balls
for (let ball of gameState.SolidBalls) {
    let theBallBody = Bodies.circle(ball.Position.X, ball.Position.Y, ball.Radius, <any>{
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/' + String(ball.Number) + '.png', xScale: textureScale, yScale: textureScale } },
        label: 'Ball ' + String(ball.Number)
    });
    World.add(_world, theBallBody);
    solidBallModels.push({ Ball: ball, Body: theBallBody });
}
// striped balls
for (let ball of gameState.StripedBalls) {
    let theBallBody = Bodies.circle(ball.Position.X, ball.Position.Y, ball.Radius, <any>{
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/' + String(ball.Number) + '.png', xScale: textureScale, yScale: textureScale } },
        label: 'Ball ' + String(ball.Number)
    });
    World.add(_world, theBallBody);
    stripedBallModels.push({ Ball: ball, Body: theBallBody });
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
    let cuePosition = cueBallBody.position;

    let horizontalDistance = cuePosition.x - mousePosition.x;
    let verticalDistance = cuePosition.y - mousePosition.y;

    let angle = Math.atan2(verticalDistance, horizontalDistance);

    _renderLength = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
    Matter.Body.setAngle(cueBallBody, angle);    
});
Matter.Events.on(mouseConstraint, 'mousedown', function(event) {
});
// EVENT: shoot cue ball on mouseup
Matter.Events.on(mouseConstraint, 'mouseup', function (event) {
    let mouseUpPosition = <Matter.Vector>event.mouse.mouseupPosition;
    let cuePosition = cueBallBody.position;
    // only shoot cue ball when the mouse is around the cue ball
    if (_gameStage == GameStage.Aiming /* && isHumanTurn() */) {
        let dist = distanceBetweenVectors(mouseUpPosition, cuePosition);
        let distLimit = gameState.CueBall.Radius * GameplayConsts.ClickDistanceLimit;
        if (dist < distLimit) {
            _gameStage = GameStage.CueHit;
            shootClick(cueBallBody);
        }
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
            let theBall = getBallModelFromBody(ballBody).Ball;
            theBall.Pocketed = true;
            _pocketedBalls.push(theBall);
        } 
        if (pair.bodyA.label.indexOf('Ball') >= 0 && pair.bodyB.label.indexOf('Ball') >= 0) {
            // ball - ball collision
            if (_firstTouchBall == null) {
                let ballNumberA = Number(pair.bodyA.label.split(' ')[1]);
                let ballNumberB = Number(pair.bodyB.label.split(' ')[1]);
                if (ballNumberA != 0 && ballNumberB == 0) {
                    // B is cue
                    _firstTouchBall = getBallModelFromBody(pair.bodyA).Ball;
                } else if (ballNumberA == 0 && ballNumberB != 0) {
                    // A is cue
                    _firstTouchBall = getBallModelFromBody(pair.bodyB).Ball;
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
        if (_renderLength < distLimit) drawGuideLine(_render.context, cueBallBody);
    }

    // send return state when all bodies are sleeping
    if (_gameStage == GameStage.CueHit && isWorldSleeping(_world)) {
        _gameStage = GameStage.NetworkSent;
        finalize();
    }
});

Render.run(_render);
Engine.run(_engine);
