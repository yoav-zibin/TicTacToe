// the game stage
var GameStage;
(function (GameStage) {
    GameStage[GameStage["PlacingCue"] = 1] = "PlacingCue";
    GameStage[GameStage["Aiming"] = 2] = "Aiming";
    GameStage[GameStage["CueHit"] = 3] = "CueHit";
    GameStage[GameStage["NetworkSent"] = 4] = "NetworkSent";
})(GameStage || (GameStage = {}));
// bunch of game play constants
var GameplayConsts;
(function (GameplayConsts) {
    GameplayConsts.CollisionCategoryCue = 0x0001;
    GameplayConsts.CollisionCategoryNormalBalls = 0x0002;
    GameplayConsts.CollisionMaskAllBalls = 0x0003;
    GameplayConsts.CollisionMaskCueOnly = 0x0001;
    GameplayConsts.CollisionMaskMouse = 0x0000;
    GameplayConsts.BallRestitution = 0.9;
    GameplayConsts.BallFriction = 0.01;
    GameplayConsts.TextureSize = 256.0; // texture is 256x256
})(GameplayConsts || (GameplayConsts = {}));
;
// using shortcuts
var Engine = Matter.Engine, Render = Matter.Render, Runner = Matter.Runner, Composites = Matter.Composites, MouseConstraint = Matter.MouseConstraint, Mouse = Matter.Mouse, World = Matter.World, Query = Matter.Query, Svg = Matter.Svg, Bodies = Matter.Bodies;
// Get initial game state
var gameState = GameLogic.getInitialState();
// Globals
var _engine = Engine.create(), _world = _engine.world;
var _render = Render.create({
    element: document.getElementById("canvas-container"),
    engine: _engine,
    options: {
        height: gameState.PoolBoard.Height,
        width: gameState.PoolBoard.Width,
    }
});
_engine.world.gravity.y = 0;
var renderOptions = _render.options;
renderOptions.wireframes = false;
renderOptions.background = 'green';
var _renderLength = 0.0; // the guideline _renderLength
var _gameStage;
if (gameState.CanMoveCueBall) {
    //gameStage = GameStage.PlacingCue; // XXX: placing cue not implemented yet
    _gameStage = GameStage.Aiming;
}
else {
    _gameStage = GameStage.Aiming;
}
function shootClick(cueBall) {
    //if (!isHumanTurn()) return;
    if (_gameStage != GameStage.Aiming)
        return;
    _gameStage = GameStage.CueHit;
    var forcePosition = {
        x: cueBall.position.x + 1.0 * Math.cos(cueBall.angle),
        y: cueBall.position.y + 1.0 * Math.sin(cueBall.angle)
    };
    var force = _renderLength * 0.0008;
    console.log("force pos: ", forcePosition);
    console.log("render len: ", _renderLength);
    Matter.Body.applyForce(cueBall, forcePosition, {
        x: force * cueBall.mass * Math.cos(cueBall.angle),
        y: force * cueBall.mass * Math.sin(cueBall.angle)
    });
    // reset render len
    _renderLength = 0.0;
    _engine.enableSleeping = true;
}
function isWorldSleeping(world) {
    var bodies = Matter.Composite.allBodies(world);
    var sleeping = bodies.filter(function (body) { return body.isSleeping; });
    var isWorldSleeping = bodies.length === sleeping.length;
    return isWorldSleeping;
}
// helper method to get distance between 2 vectors
function distanceBetweenVectors(vec1, vec2) {
    var xsq = Math.pow(vec1.x - vec2.x, 2);
    var ysq = Math.pow(vec1.y - vec2.y, 2);
    return Math.sqrt(xsq + ysq);
}
// create pockets
for (var _i = 0, _a = gameState.PoolBoard.Pockets; _i < _a.length; _i++) {
    var pocket = _a[_i];
    World.add(_world, Bodies.circle(pocket.Position.X, pocket.Position.Y, pocket.Radius, {
        isStatic: true,
        render: { fillStyle: 'black' },
        label: 'Pocket'
    }));
}
// create ball bodies
var textureScale = gameState.CueBall.Radius * 2 / GameplayConsts.TextureSize;
// cue ball
var cueBall = Bodies.circle(gameState.CueBall.Position.X, gameState.CueBall.Position.Y, gameState.CueBall.Radius, {
    isStatic: false,
    collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
    restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
    render: { fillStyle: 'white', strokeStyle: 'black' },
    label: 'Ball'
});
World.add(_world, cueBall);
// eight ball
World.add(_world, Bodies.circle(gameState.EightBall.Position.X, gameState.EightBall.Position.Y, gameState.EightBall.Radius, {
    isStatic: false,
    collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
    restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
    render: { sprite: { texture: 'imgs/8.png', xScale: textureScale, yScale: textureScale } },
    label: 'Ball'
}));
// solid balls
for (var _b = 0, _c = gameState.SolidBalls; _b < _c.length; _b++) {
    var ball = _c[_b];
    World.add(_world, Bodies.circle(ball.Position.X, ball.Position.Y, ball.Radius, {
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/' + String(ball.Number) + '.png', xScale: textureScale, yScale: textureScale } },
        label: 'Ball'
    }));
}
// striped balls
for (var _d = 0, _e = gameState.StripedBalls; _d < _e.length; _d++) {
    var ball = _e[_d];
    World.add(_world, Bodies.circle(ball.Position.X, ball.Position.Y, ball.Radius, {
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/' + String(ball.Number) + '.png', xScale: textureScale, yScale: textureScale } },
        label: 'Ball'
    }));
}
var mouse = Mouse.create(_render.canvas), mouseConstraint = MouseConstraint.create(_engine, {
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
    var mousePosition = event.mouse.position;
    var cuePosition = cueBall.position;
    var horizontalDistance = cuePosition.x - mousePosition.x;
    var verticalDistance = cuePosition.y - mousePosition.y;
    var angle = Math.atan2(verticalDistance, horizontalDistance);
    _renderLength = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
    Matter.Body.setAngle(cueBall, angle);
});
// EVENT: shoot cue ball on mouseup
Matter.Events.on(mouseConstraint, 'mouseup', function (event) {
    var mouseUpPosition = event.mouse.mouseupPosition;
    var cuePosition = cueBall.position;
    // only shoot cue ball when the mouse is around the cue ball
    var dist = distanceBetweenVectors(mouseUpPosition, cuePosition);
    var distLimit = gameState.CueBall.Radius * 10;
    console.log("dist ", dist, " limit ", distLimit);
    if (dist < distLimit) {
        shootClick(cueBall);
    }
});
// EVENT: handle pocket and ball collision
Matter.Events.on(_engine, 'collisionStart', function (event) {
    for (var _i = 0, _a = event.pairs; _i < _a.length; _i++) {
        var pair = _a[_i];
        console.log(pair.bodyA.label, pair.bodyB.label);
    }
});
// EVENT: update
Matter.Events.on(_render, 'afterRender', function () {
    if (_gameStage == GameStage.CueHit && isWorldSleeping(_world)) {
        _gameStage = GameStage.NetworkSent;
        // send the move over network here
        console.log("player's turn is done");
    }
});
Render.run(_render);
Engine.run(_engine);
//# sourceMappingURL=example_state.js.map