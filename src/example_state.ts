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
    export const CollisionMaskCueOnly = 0x0001;
    export const CollisionMaskMouse = 0x0000;

    export const BallRestitution = 0.9;
    export const BallFriction = 0.01;

    export const TextureSize = 256.0; // texture is 256x256
};

// using shortcuts
var Engine = Matter.Engine,
    Render = <any>Matter.Render,
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

function isWorldSleeping(world : Matter.World):boolean {
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
        label: 'Ball'
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
        label: 'Ball'
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
        label: 'Ball'
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
        label: 'Ball'
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
// EVENT: shoot cue ball on mouseup
Matter.Events.on(mouseConstraint, 'mouseup', function (event) {
    let mouseUpPosition = <Matter.Vector>event.mouse.mouseupPosition;
    let cuePosition = cueBall.position;
    // only shoot cue ball when the mouse is around the cue ball
    let dist = distanceBetweenVectors(mouseUpPosition, cuePosition);
    let distLimit = gameState.CueBall.Radius * 10;
    console.log("dist ", dist, " limit ", distLimit);
    if (dist < distLimit) {
        shootClick(cueBall);
    }
});
// EVENT: handle pocket and ball collision
Matter.Events.on(_engine, 'collisionStart', function(event) {
    for (let pair of event.pairs) {
        console.log(pair.bodyA.label, pair.bodyB.label);
    }
});
// EVENT: update
Matter.Events.on(_render, 'afterRender', function() {
    if (_gameStage == GameStage.CueHit && isWorldSleeping(_world)) {
        _gameStage = GameStage.NetworkSent;
        // send the move over network here
        console.log("player's turn is done");
    }
});

Render.run(_render);
Engine.run(_engine);
