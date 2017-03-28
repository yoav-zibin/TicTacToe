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
    //gameStage = GameStage.PlacingCue; // XXX: placing cue not implemented yet
    _gameStage = GameStage.Aiming;
}
else {
    _gameStage = GameStage.Aiming;
}
var _firstTouchBall;
var _pocketedBalls = [];
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
function createBallModel(x, y, ballNumber, pocketed, radius) {
    var ballType;
    if (ballNumber == 0)
        ballType = BallType.Cue;
    else if (ballNumber == 8)
        ballType = BallType.Eight;
    else if (ballNumber > 8)
        ballType = BallType.Stripes;
    else
        ballType = BallType.Solids;
    var theBall = {
        Position: { X: x, Y: y },
        Pocketed: pocketed,
        Radius: radius,
        BallType: ballType,
        Number: ballNumber,
    };
    return theBall;
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
// create ball bodies
var textureScale = gameState.CueBall.Radius * 2 / GameplayConsts.TextureSize;
// cue ball
var cueBall = Bodies.circle(gameState.CueBall.Position.X, gameState.CueBall.Position.Y, gameState.CueBall.Radius, {
    isStatic: false,
    collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
    restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
    render: { fillStyle: 'white', strokeStyle: 'black' },
    label: 'Ball 0'
});
World.add(_world, cueBall);
// eight ball
World.add(_world, Bodies.circle(gameState.EightBall.Position.X, gameState.EightBall.Position.Y, gameState.EightBall.Radius, {
    isStatic: false,
    collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
    restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
    render: { sprite: { texture: 'imgs/8.png', xScale: textureScale, yScale: textureScale } },
    label: 'Ball 8'
}));
// solid balls
for (var _b = 0, _c = gameState.SolidBalls; _b < _c.length; _b++) {
    var ball = _c[_b];
    World.add(_world, Bodies.circle(ball.Position.X, ball.Position.Y, ball.Radius, {
        isStatic: false,
        collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
        restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
        render: { sprite: { texture: 'imgs/' + String(ball.Number) + '.png', xScale: textureScale, yScale: textureScale } },
        label: 'Ball ' + String(ball.Number)
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
        label: 'Ball ' + String(ball.Number)
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
Matter.Events.on(mouseConstraint, 'mousedown', function (event) {
});
// EVENT: shoot cue ball on mouseup
Matter.Events.on(mouseConstraint, 'mouseup', function (event) {
    var mouseUpPosition = event.mouse.mouseupPosition;
    var cuePosition = cueBall.position;
    // only shoot cue ball when the mouse is around the cue ball
    var dist = distanceBetweenVectors(mouseUpPosition, cuePosition);
    var distLimit = gameState.CueBall.Radius * GameplayConsts.ClickDistanceLimit;
    console.log("dist ", dist, " limit ", distLimit);
    if (dist < distLimit) {
        shootClick(cueBall);
    }
});
// EVENT: handle pocket and ball collision
Matter.Events.on(_engine, 'collisionStart', function (event) {
    for (var _i = 0, _a = event.pairs; _i < _a.length; _i++) {
        var pair = _a[_i];
        //console.log(pair.bodyA.label, pair.bodyB.label);
        if (pair.bodyA.label == 'Pocket' && pair.bodyB.label.indexOf('Ball') >= 0) {
            // pocket - ball collision
            // destroy the ball body
            World.remove(_world, pair.bodyB);
            // get the ball number
            var ballBody = pair.bodyB;
            var ballNumber = Number(ballBody.label.split(' ')[1]);
            // create the ball model and add to pocketed balls
            var ballModel = createBallModel(ballBody.position.x, ballBody.position.y, ballNumber, true, gameState.CueBall.Radius);
            _pocketedBalls.push(ballModel);
        }
        if (pair.bodyA.label.indexOf('Ball') >= 0 && pair.bodyB.label.indexOf('Ball') >= 0) {
            // ball - ball collision
            if (_firstTouchBall == null) {
                var ballNumberA = Number(pair.bodyA.label.split(' ')[1]);
                var ballNumberB = Number(pair.bodyB.label.split(' ')[1]);
                // XXX: It always sets 'pocketed' to false for touched balls
                if (ballNumberA != 0 && ballNumberB == 0) {
                    // B is cue
                    _firstTouchBall = createBallModel(pair.bodyA.position.x, pair.bodyA.position.y, ballNumberA, false, gameState.CueBall.Radius);
                }
                else if (ballNumberA == 0 && ballNumberB != 0) {
                    // A is cue
                    _firstTouchBall = createBallModel(pair.bodyB.position.x, pair.bodyB.position.y, ballNumberB, false, gameState.CueBall.Radius);
                }
            }
        }
    }
});
// EVENT: update
Matter.Events.on(_render, 'afterRender', function () {
    // draw the render line
    if (_gameStage == GameStage.Aiming) {
        var distLimit = gameState.CueBall.Radius * GameplayConsts.ClickDistanceLimit;
        if (_renderLength < distLimit)
            drawGuideLine(_render.context, cueBall);
    }
    // send return state when all bodies are sleeping
    if (_gameStage == GameStage.CueHit && isWorldSleeping(_world)) {
        _gameStage = GameStage.NetworkSent;
        // send the move over network here
        console.log("player's turn is done");
        var theReturnState = {
            PocketedBalls: _pocketedBalls,
            TouchedBall: _firstTouchBall,
        };
        console.log(theReturnState);
    }
});
Render.run(_render);
Engine.run(_engine);
//# sourceMappingURL=example_state.js.map