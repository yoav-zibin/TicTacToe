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
    GameplayConsts.BallTextureSize = 128; // ball textures are 128x128
    GameplayConsts.ClickDistanceLimit = 150;
    GameplayConsts.ClickForceMax = 0.04;
})(GameplayConsts || (GameplayConsts = {}));
;
var GameExample;
(function (GameExample) {
    // using shortcuts
    var Engine = Matter.Engine, Render = Matter.Render, MouseConstraint = Matter.MouseConstraint, Mouse = Matter.Mouse, World = Matter.World, Bodies = Matter.Bodies;
    // resources
    var _stickImg; // cue stick png image
    // The saved game state
    var _gameState;
    // Globals
    var _engine;
    var _world;
    var _render;
    var _topLeftCorner; // used for bounds
    var _bottomRightCorner;
    var _renderLength = 0.0; // the guideline length. also used to calculate force
    var _mousePos; // only used to render coords (for debug purposes)
    var _gameStage;
    var _firstTouchBall;
    var _pocketedBalls = [];
    // view models
    var cueBallModel;
    var eightBallModel;
    var solidBallModels = [];
    var stripedBallModels = [];
    function shootClick(cueBall) {
        var forcePosition = {
            x: cueBall.position.x + 1.0 * Math.cos(cueBall.angle),
            y: cueBall.position.y + 1.0 * Math.sin(cueBall.angle)
        };
        var force = _renderLength / GameplayConsts.ClickDistanceLimit * GameplayConsts.ClickForceMax;
        console.log("force pos: ", forcePosition);
        console.log("force mag: ", force);
        console.log("render len: ", _renderLength);
        Matter.Body.applyForce(cueBall, forcePosition, {
            x: force * Math.cos(cueBall.angle),
            y: force * Math.sin(cueBall.angle)
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
    // creates cue ball view-model from Ball. does not add to world
    function createCueBallModel(cueBall) {
        var newCueModel = { Ball: cueBall, Body: Bodies.circle(cueBall.Position.X, cueBall.Position.Y, cueBall.Radius, {
                isStatic: false,
                collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
                restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
                render: { fillStyle: 'white', strokeStyle: 'black' },
                label: 'Ball 0'
            }) };
        return newCueModel;
    }
    // constructs a rectangle body as border, from pocket1 to pocket2
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
    // gets the view-model associated with the body
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
        cueBallModel.Ball.Position = { X: cueBallModel.Body.position.x, Y: cueBallModel.Body.position.y };
        eightBallModel.Ball.Position = { X: eightBallModel.Body.position.x, Y: eightBallModel.Body.position.y };
        for (var _i = 0, solidBallModels_1 = solidBallModels; _i < solidBallModels_1.length; _i++) {
            var ballModel = solidBallModels_1[_i];
            ballModel.Ball.Position = { X: ballModel.Body.position.x, Y: ballModel.Body.position.y };
        }
        for (var _a = 0, stripedBallModels_1 = stripedBallModels; _a < stripedBallModels_1.length; _a++) {
            var ballModel = stripedBallModels_1[_a];
            ballModel.Ball.Position = { X: ballModel.Body.position.x, Y: ballModel.Body.position.y };
        }
    }
    // clamps the position within board bounds
    function clampWithinBounds(pos) {
        var x = Math.min(_bottomRightCorner.x - GameplayConsts.BorderThickness, Math.max(pos.x, _topLeftCorner.x + GameplayConsts.BorderThickness));
        var y = Math.min(_bottomRightCorner.y - GameplayConsts.BorderThickness, Math.max(pos.y, _topLeftCorner.y + GameplayConsts.BorderThickness));
        return { x: x, y: y };
    }
    // moves the cue ball and recreates the cue ball body and model
    function moveCueBall(pos, useStartLine) {
        World.remove(_world, cueBallModel.Body);
        var y;
        if (useStartLine) {
            y = _gameState.PoolBoard.StartLine;
        }
        else {
            y = pos.y;
        }
        // clamp within bounds
        var clampedPos = clampWithinBounds({ x: pos.x, y: y });
        _gameState.CueBall.Position = { X: clampedPos.x, Y: clampedPos.y };
        cueBallModel = createCueBallModel(_gameState.CueBall);
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
            CanMoveCueBall: _gameState.CanMoveCueBall,
            PoolBoard: _gameState.PoolBoard,
            FirstMove: _gameState.FirstMove,
            Player1Color: null,
            Player2Color: null,
            DeltaBalls: theReturnState,
        };
        console.log(theReturnState);
        console.log(finalState);
        console.log(GameLogic.createMove(finalState, 0));
    }
    function drawGuideLine(context) {
        var cueBody = cueBallModel.Body;
        var startPoint = { x: cueBody.position.x, y: cueBody.position.y };
        var endPoint = {
            x: cueBody.position.x + _renderLength * Math.cos(cueBody.angle),
            y: cueBody.position.y + _renderLength * Math.sin(cueBody.angle)
        };
        context.save();
        context.globalAlpha = 0.5;
        context.beginPath();
        context.setLineDash([3]);
        context.moveTo(startPoint.x, startPoint.y);
        context.lineTo(endPoint.x, endPoint.y);
        context.strokeStyle = 'red';
        context.lineWidth = 5.5;
        context.stroke();
        context.closePath();
        context.restore();
    }
    function drawCueStick(context) {
        if (_renderLength <= 0)
            return;
        var cueBody = cueBallModel.Body;
        var mousePos = {
            x: cueBody.position.x - _renderLength * Math.cos(cueBody.angle),
            y: cueBody.position.y - _renderLength * Math.sin(cueBody.angle)
        };
        context.save();
        context.translate(cueBody.position.x, cueBody.position.y);
        context.rotate(cueBody.angle);
        context.drawImage(_stickImg, -_stickImg.width - _renderLength, -_stickImg.height / 2);
        context.restore();
    }
    function drawGameHUD(context) {
        context.save();
        var fontSize = 20;
        context.font = "20px Arial";
        context.fillStyle = "white";
        var textLeft = "";
        switch (_gameStage) {
            case GameStage.PlacingCue:
                textLeft = "Click to place cue ball";
                break;
            case GameStage.Aiming:
                textLeft = "Drag behind cue ball to aim";
                break;
            case GameStage.CueHit:
                if (_firstTouchBall)
                    textLeft = "First touch: " + _firstTouchBall.Number;
                break;
            case GameStage.Finalized:
                textLeft = "Opponent's turn!";
                break;
        }
        context.textAlign = "left";
        context.fillText(textLeft, 0, fontSize);
        if ((_gameStage == GameStage.PlacingCue || _gameStage == GameStage.Aiming)) {
            // TODO: Use player turn index to get the current player
            var myColorText = "Designated group: " + AssignedBallType[_gameState.Player1Color];
            context.textAlign = "right";
            context.fillText(myColorText, context.canvas.width, fontSize);
        }
        if ((_gameStage == GameStage.Finalized || _gameStage == GameStage.CueHit) && _pocketedBalls.length != 0) {
            var statusText = "Pocketed: ";
            for (var _i = 0, _pocketedBalls_1 = _pocketedBalls; _i < _pocketedBalls_1.length; _i++) {
                var ball = _pocketedBalls_1[_i];
                statusText += ball.Number + ",";
            }
            context.textAlign = "right";
            context.fillText(statusText, context.canvas.width, fontSize);
        }
        // show mouse coords on screen bottom
        if (_mousePos != null) {
            var coordText = "(" + _mousePos.x.toFixed(0) + "," + _mousePos.y.toFixed(0) + ")";
            context.textAlign = "center";
            context.fillText(coordText, context.canvas.width / 2, context.canvas.height - fontSize);
        }
        context.restore();
    }
    function updateUI() {
        // TODO: get the state from server
        _gameState = GameLogic.getInitialState();
        // load resources
        _stickImg = new Image();
        _stickImg.src = 'imgs/stick.png';
        // set up matterjs
        _engine = Engine.create(),
            _world = _engine.world;
        _render = Render.create({
            element: document.getElementById("canvas-container"),
            engine: _engine,
            options: {
                height: _gameState.PoolBoard.Height,
                width: _gameState.PoolBoard.Width,
            }
        });
        _engine.world.gravity.y = 0;
        var renderOptions = _render.options;
        renderOptions.wireframes = false;
        renderOptions.background = 'green';
        // starting game stage
        if (_gameState.CanMoveCueBall) {
            _gameStage = GameStage.PlacingCue;
        }
        else {
            _gameStage = GameStage.Aiming;
        }
        // create borders
        var pockets = _gameState.PoolBoard.Pockets;
        World.add(_world, [
            createBorderBody(pockets[0], pockets[3], false),
            createBorderBody(pockets[2], pockets[5], false),
            createBorderBody(pockets[0], pockets[1], true),
            createBorderBody(pockets[1], pockets[2], true),
            createBorderBody(pockets[3], pockets[4], true),
            createBorderBody(pockets[4], pockets[5], true),
        ]);
        _topLeftCorner = { x: pockets[0].Position.X, y: pockets[0].Position.Y };
        _bottomRightCorner = { x: pockets[5].Position.X, y: pockets[5].Position.Y };
        // create pockets
        for (var _i = 0, _a = _gameState.PoolBoard.Pockets; _i < _a.length; _i++) {
            var pocket = _a[_i];
            World.add(_world, Bodies.circle(pocket.Position.X, pocket.Position.Y, pocket.Radius, {
                isStatic: true,
                render: { fillStyle: 'black' },
                label: 'Pocket'
            }));
        }
        // create ball bodies and body models
        var textureScale = _gameState.CueBall.Radius * 2 / GameplayConsts.BallTextureSize;
        // cue ball
        cueBallModel = createCueBallModel(_gameState.CueBall);
        if (!_gameState.CueBall.Pocketed && !_gameState.CanMoveCueBall)
            World.add(_world, cueBallModel.Body);
        // eight ball
        eightBallModel = {
            Ball: _gameState.EightBall,
            Body: Bodies.circle(_gameState.EightBall.Position.X, _gameState.EightBall.Position.Y, _gameState.EightBall.Radius, {
                isStatic: false,
                collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
                restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
                render: { sprite: { texture: 'imgs/8.png', xScale: textureScale, yScale: textureScale } },
                label: 'Ball 8'
            })
        };
        if (!_gameState.EightBall.Pocketed)
            World.add(_world, eightBallModel.Body);
        // solid balls
        for (var _b = 0, _c = _gameState.SolidBalls; _b < _c.length; _b++) {
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
        for (var _d = 0, _e = _gameState.StripedBalls; _d < _e.length; _d++) {
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
        // add mouse control
        var mouse = Mouse.create(_render.canvas);
        var mouseConstraint = MouseConstraint.create(_engine, { mouse: mouse });
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
            _mousePos = { x: mousePosition.x, y: mousePosition.y };
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
                if (dist < GameplayConsts.ClickDistanceLimit) {
                    _gameStage = GameStage.CueHit;
                    shootClick(cueBallModel.Body);
                }
            }
            else if (_gameStage == GameStage.PlacingCue) {
                // place the cue ball at mouse position
                // recreate the cue ball model (body)
                moveCueBall(mouseUpPosition, _gameState.FirstMove);
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
                if (_renderLength < GameplayConsts.ClickDistanceLimit) {
                    drawGuideLine(_render.context);
                    drawCueStick(_render.context);
                }
            }
            // send return state when all bodies are sleeping
            if (_gameStage == GameStage.CueHit && isWorldSleeping(_world)) {
                _gameStage = GameStage.Finalized;
                finalize();
            }
            // always render game HUD
            drawGameHUD(_render.context);
        });
        // start simulation
        Render.run(_render);
        Engine.run(_engine);
    }
    GameExample.updateUI = updateUI;
    function getGameStage() {
        return _gameStage;
    }
    GameExample.getGameStage = getGameStage;
})(GameExample || (GameExample = {}));
GameExample.updateUI();
//# sourceMappingURL=example_state.js.map