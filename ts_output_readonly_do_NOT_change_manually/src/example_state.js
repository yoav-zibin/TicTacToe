// the game stage
var GameStage;
(function (GameStage) {
    GameStage[GameStage["PlacingCue"] = 1] = "PlacingCue";
    GameStage[GameStage["Aiming"] = 2] = "Aiming";
    GameStage[GameStage["CueHit"] = 3] = "CueHit";
    GameStage[GameStage["Finalized"] = 4] = "Finalized";
})(GameStage || (GameStage = {}));
// bunch of game play constants
var GameplayConsts;
(function (GameplayConsts) {
    GameplayConsts.CollisionCategoryCue = 0x0001;
    GameplayConsts.CollisionCategoryNormalBalls = 0x0002;
    GameplayConsts.CollisionMaskAllBalls = 0x0003;
    GameplayConsts.CollisionMaskMouse = 0x0000;
    GameplayConsts.BallRestitution = 0.9;
    GameplayConsts.BallFriction = 0.01;
    GameplayConsts.BorderThickness = 10;
    // export const BorderClearance = 10;
    GameplayConsts.TextureSize = 256.0; // texture is 256x256
    GameplayConsts.ClickDistanceLimit = 10; // 10x the ball radius
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
    _gameStage = GameStage.PlacingCue;
    //_gameStage = GameStage.Aiming;
}
else {
    _gameStage = GameStage.Aiming;
}
var _firstTouchBall;
var _pocketedBalls = [];
var cueBallModel;
var eightBallModel;
var solidBallModels = [];
var stripedBallModels = [];
function shootClick(cueBall) {
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
function handleBallBallCollision(bodyA, bodyB) {
    if (_firstTouchBall == null) {
        var ballNumberA = Number(bodyA.label.split(' ')[1]);
        var ballNumberB = Number(bodyB.label.split(' ')[1]);
        if (ballNumberA != 0 && ballNumberB == 0) {
            // B is cue
            _firstTouchBall = getBallModelFromBody(bodyA).Ball;
        }
        else if (ballNumberA == 0 && ballNumberB != 0) {
            // A is cue
            _firstTouchBall = getBallModelFromBody(bodyB).Ball;
        }
    }
}
function handlePocketBallCollision(pocketBody, ballBody) {
    // destroy the ball body
    World.remove(_world, ballBody);
    // get the ball number
    var ballNumber = Number(ballBody.label.split(' ')[1]);
    // create the ball model and add to pocketed balls
    var theBall = getBallModelFromBody(ballBody).Ball;
    theBall.Pocketed = true;
    _pocketedBalls.push(theBall);
}
// helper method to get distance between 2 vectors
function distanceBetweenVectors(vec1, vec2) {
    var xsq = Math.pow(vec1.x - vec2.x, 2);
    var ysq = Math.pow(vec1.y - vec2.y, 2);
    return Math.sqrt(xsq + ysq);
}
function createCueBallModel(cueBall) {
    return { Ball: cueBall,
        Body: Bodies.circle(cueBall.Position.X, cueBall.Position.Y, cueBall.Radius, {
            isStatic: false,
            collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
            restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
            render: { fillStyle: 'white', strokeStyle: 'black' },
            label: 'Ball 0'
        }) };
}
function createBorderBody(pocket1, pocket2, vertical) {
    var x, y, width, height;
    if (vertical) {
        x = pocket1.Position.X;
        y = (pocket1.Position.Y + pocket2.Position.Y) / 2.0;
        width = GameplayConsts.BorderThickness;
        height = pocket2.Position.Y - pocket1.Position.Y - pocket1.Radius - pocket2.Radius;
    }
    else {
        x = (pocket1.Position.X + pocket2.Position.X) / 2.0;
        y = pocket1.Position.Y;
        width = pocket2.Position.X - pocket1.Position.X - pocket1.Radius - pocket2.Radius;
        height = GameplayConsts.BorderThickness;
    }
    return Bodies.rectangle(x, y, width, height, {
        isStatic: true,
        render: { fillStyle: '#825201', strokeStyle: 'black' },
        label: 'Border'
    });
}
function getBallModelFromBody(ballBody) {
    var ballNumber = Number(ballBody.label.split(' ')[1]);
    if (ballNumber == 0) {
        return cueBallModel;
    }
    else if (ballNumber == 8) {
        return eightBallModel;
    }
    else if (ballNumber > 8) {
        return stripedBallModels[ballNumber - 9];
    }
    else {
        return solidBallModels[ballNumber - 1];
    }
}
function syncBallModelPositions() {
    // sync cue ball pos
    cueBallModel.Ball.Position = { X: cueBallModel.Body.position.x, Y: cueBallModel.Body.position.y };
    // sync eight ball pos
    eightBallModel.Ball.Position = { X: eightBallModel.Body.position.x, Y: eightBallModel.Body.position.y };
    // sync solid ball pos
    for (var _i = 0, solidBallModels_1 = solidBallModels; _i < solidBallModels_1.length; _i++) {
        var ballModel = solidBallModels_1[_i];
        ballModel.Ball.Position = { X: ballModel.Body.position.x, Y: ballModel.Body.position.y };
    }
    // sync striped ball pos
    for (var _a = 0, stripedBallModels_1 = stripedBallModels; _a < stripedBallModels_1.length; _a++) {
        var ballModel = stripedBallModels_1[_a];
        ballModel.Ball.Position = { X: ballModel.Body.position.x, Y: ballModel.Body.position.y };
    }
}
function moveCueBall(pos, useStartLine) {
    // recreates the cue ball
    World.remove(_world, cueBallModel.Body);
    var y;
    if (useStartLine) {
        y = gameState.PoolBoard.StartLine;
    }
    else {
        y = pos.y;
    }
    gameState.CueBall.Position = { X: pos.x, Y: y };
    cueBallModel = createCueBallModel(gameState.CueBall);
    World.add(_world, cueBallModel.Body);
}
function finalize() {
    // send the move over network here
    console.log("player's turn is done");
    // sync the model positions
    syncBallModelPositions();
    // create return state
    var theReturnState = {
        PocketedBalls: _pocketedBalls,
        TouchedBall: _firstTouchBall,
    };
    // create IState
    var solidBalls = [];
    var stripedBalls = [];
    for (var _i = 0, solidBallModels_2 = solidBallModels; _i < solidBallModels_2.length; _i++) {
        var ballModel = solidBallModels_2[_i];
        solidBalls.push(ballModel.Ball);
    }
    for (var _a = 0, stripedBallModels_2 = stripedBallModels; _a < stripedBallModels_2.length; _a++) {
        var ballModel = stripedBallModels_2[_a];
        stripedBalls.push(ballModel.Ball);
    }
    var finalState = {
        SolidBalls: solidBalls,
        StripedBalls: stripedBalls,
        EightBall: eightBallModel.Ball,
        CueBall: cueBallModel.Ball,
        CanMoveCueBall: null,
        PoolBoard: gameState.PoolBoard,
        FirstMove: false,
        Player1Color: null,
        Player2Color: null,
        DeltaBalls: theReturnState,
    };
    console.log(theReturnState);
    console.log(finalState);
}
function drawGuideLine(context, cueBody) {
    var startPoint = { X: cueBody.position.x, Y: cueBody.position.y };
    var endPoint = {
        X: cueBody.position.x + (_renderLength) * Math.cos(cueBody.angle),
        Y: cueBody.position.y + (_renderLength) * Math.sin(cueBody.angle)
    };
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
var pockets = gameState.PoolBoard.Pockets;
World.add(_world, [
    createBorderBody(pockets[0], pockets[3], false),
    createBorderBody(pockets[2], pockets[5], false),
    createBorderBody(pockets[0], pockets[1], true),
    createBorderBody(pockets[1], pockets[2], true),
    createBorderBody(pockets[3], pockets[4], true),
    createBorderBody(pockets[4], pockets[5], true),
]);
// create pockets
for (var _i = 0, _a = gameState.PoolBoard.Pockets; _i < _a.length; _i++) {
    var pocket = _a[_i];
    World.add(_world, Bodies.circle(pocket.Position.X, pocket.Position.Y, pocket.Radius, {
        isStatic: true,
        render: { fillStyle: 'black' },
        label: 'Pocket'
    }));
}
// create ball bodies and body models
var textureScale = gameState.CueBall.Radius * 2 / GameplayConsts.TextureSize;
// cue ball
cueBallModel = createCueBallModel(gameState.CueBall);
if (!gameState.CueBall.Pocketed)
    World.add(_world, cueBallModel.Body);
// eight ball
eightBallModel = { Ball: gameState.EightBall,
    Body: Bodies.circle(gameState.EightBall.Position.X, gameState.EightBall.Position.Y, gameState.EightBall.Radius, {
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/8.png', xScale: textureScale, yScale: textureScale } },
        label: 'Ball 8'
    }) };
if (!gameState.EightBall.Pocketed)
    World.add(_world, eightBallModel.Body);
// solid balls
for (var _b = 0, _c = gameState.SolidBalls; _b < _c.length; _b++) {
    var ball = _c[_b];
    var theBallBody = Bodies.circle(ball.Position.X, ball.Position.Y, ball.Radius, {
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/' + String(ball.Number) + '.png', xScale: textureScale, yScale: textureScale } },
        label: 'Ball ' + String(ball.Number)
    });
    if (!ball.Pocketed)
        World.add(_world, theBallBody);
    solidBallModels.push({ Ball: ball, Body: theBallBody });
}
// striped balls
for (var _d = 0, _e = gameState.StripedBalls; _d < _e.length; _d++) {
    var ball = _e[_d];
    var theBallBody = Bodies.circle(ball.Position.X, ball.Position.Y, ball.Radius, {
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/' + String(ball.Number) + '.png', xScale: textureScale, yScale: textureScale } },
        label: 'Ball ' + String(ball.Number)
    });
    if (!ball.Pocketed)
        World.add(_world, theBallBody);
    stripedBallModels.push({ Ball: ball, Body: theBallBody });
}
var mouse = Mouse.create(_render.canvas), mouseConstraint = MouseConstraint.create(_engine, {
    mouse: mouse,
});
mouseConstraint.collisionFilter.mask = GameplayConsts.CollisionMaskMouse;
World.add(_world, mouseConstraint);
// EVENT: set angle and _renderLength on mousemove
Matter.Events.on(mouseConstraint, 'mousemove', function (event) {
    // This function sets the angle and _renderLength
    var mousePosition = event.mouse.position;
    var cuePosition = cueBallModel.Body.position;
    var horizontalDistance = cuePosition.x - mousePosition.x;
    var verticalDistance = cuePosition.y - mousePosition.y;
    var angle = Math.atan2(verticalDistance, horizontalDistance);
    _renderLength = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
    Matter.Body.setAngle(cueBallModel.Body, angle);
});
Matter.Events.on(mouseConstraint, 'mousedown', function (event) {
});
// EVENT: shoot cue ball on mouseup
Matter.Events.on(mouseConstraint, 'mouseup', function (event) {
    var mouseUpPosition = event.mouse.mouseupPosition;
    if (_gameStage == GameStage.Aiming /* && isHumanTurn() */) {
        // only shoot cue ball when the mouse is around the cue ball
        var dist = distanceBetweenVectors(mouseUpPosition, cueBallModel.Body.position);
        var distLimit = gameState.CueBall.Radius * GameplayConsts.ClickDistanceLimit;
        if (dist < distLimit) {
            _gameStage = GameStage.CueHit;
            shootClick(cueBallModel.Body);
        }
    }
    else if (_gameStage == GameStage.PlacingCue) {
        // place the cue ball at mouse position
        // recreate the cue ball model (body)
        moveCueBall(mouseUpPosition, gameState.FirstMove);
        _gameStage = GameStage.Aiming;
    }
});
// EVENT: handle pocket and ball collision
Matter.Events.on(_engine, 'collisionStart', function (event) {
    // only handle collisions after player has hit the cue ball
    if (_gameStage != GameStage.CueHit)
        return;
    for (var _i = 0, _a = event.pairs; _i < _a.length; _i++) {
        var pair = _a[_i];
        if (pair.bodyA.label == 'Pocket' && pair.bodyB.label.indexOf('Ball') >= 0) {
            handlePocketBallCollision(pair.bodyA, pair.bodyB);
        }
        if (pair.bodyA.label.indexOf('Ball') >= 0 && pair.bodyB.label.indexOf('Ball') >= 0) {
            handleBallBallCollision(pair.bodyA, pair.bodyB);
        }
    }
});
// EVENT: update
Matter.Events.on(_render, 'afterRender', function () {
    // draw the render line
    if (_gameStage == GameStage.Aiming) {
        var distLimit = gameState.CueBall.Radius * GameplayConsts.ClickDistanceLimit;
        if (_renderLength < distLimit)
            drawGuideLine(_render.context, cueBallModel.Body);
    }
    // send return state when all bodies are sleeping
    if (_gameStage == GameStage.CueHit && isWorldSleeping(_world)) {
        _gameStage = GameStage.Finalized;
        finalize();
    }
});
Render.run(_render);
Engine.run(_engine);
//# sourceMappingURL=example_state.js.map