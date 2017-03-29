// the game stage
enum GameStage {
    PlacingCue = 1, // player is placing the cue ball
    Aiming, // player is ready to hit the cue ball
    CueHit, // player has hit the cue ball
    Finalized, // game state is sent over network
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
    export const BallTextureSize = 128; // ball textures are 128x128
    export const ClickDistanceLimit = 150;
    export const ClickForceMax = 0.04;
};

module GameExample {
    // using shortcuts
    var Engine = Matter.Engine,
        Render = Matter.Render,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;

    // resources
    var _stickImg : HTMLImageElement; // cue stick png image

    // The saved game state
    var _gameState: IState;
    // Globals
    var _engine: Matter.Engine;
    var _world: Matter.World;
    var _render: Matter.Render;
    
    var _topLeftCorner : Matter.Vector; // used for bounds
    var _bottomRightCorner : Matter.Vector;
    var _renderLength = 0.0; // the guideline length. also used to calculate force
    var _mousePos: Matter.Vector; // only used to render coords (for debug purposes)
    var _gameStage: GameStage;
    var _firstTouchBall: Ball | null;
    var _pocketedBalls: Ball[] = [];
    // view models
    var cueBallModel: BallModel;
    var eightBallModel: BallModel;
    var solidBallModels: BallModel[] = [];
    var stripedBallModels: BallModel[] = [];

    function shootClick(cueBall: Matter.Body) {
        let forcePosition: Matter.Vector = {
            x: cueBall.position.x + 1.0 * Math.cos(cueBall.angle),
            y: cueBall.position.y + 1.0 * Math.sin(cueBall.angle)
        };
        let force: number = _renderLength / GameplayConsts.ClickDistanceLimit * GameplayConsts.ClickForceMax;

        console.log("force pos: ", forcePosition);
        console.log("force mag: ",  force);
        console.log("render len: ", _renderLength);

        Matter.Body.applyForce(cueBall, forcePosition, {
            x: force * Math.cos(cueBall.angle),
            y: force * Math.sin(cueBall.angle)
        });

        // reset render len
        _renderLength = 0.0;
        _engine.enableSleeping = true;
    }

    function isWorldSleeping(world: Matter.World): boolean {
        let bodies = Matter.Composite.allBodies(world);
        let sleeping = bodies.filter((body) => body.isSleeping);
        let isWorldSleeping = bodies.length === sleeping.length;
        return isWorldSleeping;
    }

    function handleBallBallCollision(bodyA: Matter.Body, bodyB: Matter.Body) {
        if (_firstTouchBall == null) {
            let ballNumberA = Number(bodyA.label.split(' ')[1]);
            let ballNumberB = Number(bodyB.label.split(' ')[1]);
            if (ballNumberA != 0 && ballNumberB == 0) {
                // B is cue
                _firstTouchBall = getBallModelFromBody(bodyA).Ball;
            } else if (ballNumberA == 0 && ballNumberB != 0) {
                // A is cue
                _firstTouchBall = getBallModelFromBody(bodyB).Ball;
            }
        }
    }

    function handlePocketBallCollision(pocketBody: Matter.Body, ballBody: Matter.Body) {
        // destroy the ball body
        World.remove(_world, ballBody);
        // get the ball number
        let ballNumber = Number(ballBody.label.split(' ')[1]);
        // create the ball model and add to pocketed balls
        let theBall = getBallModelFromBody(ballBody).Ball;
        theBall.Pocketed = true;
        _pocketedBalls.push(theBall);
    }

    // helper method to get distance between 2 vectors
    function distanceBetweenVectors(vec1: Matter.Vector, vec2: Matter.Vector): number {
        let xsq = Math.pow(vec1.x - vec2.x, 2);
        let ysq = Math.pow(vec1.y - vec2.y, 2);
        return Math.sqrt(xsq + ysq);
    }

    // creates cue ball view-model from Ball. does not add to world
    function createCueBallModel(cueBall: Ball): BallModel {
        let newCueModel = { Ball: cueBall, Body: Bodies.circle(cueBall.Position.X, cueBall.Position.Y, cueBall.Radius, <any>{
            isStatic: false,
            collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
            restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
            render: { fillStyle: 'white', strokeStyle: 'black' },
            label: 'Ball 0'
        })};
        return newCueModel;
    }

    // constructs a rectangle body as border, from pocket1 to pocket2
    function createBorderBody(pocket1: Pocket, pocket2: Pocket, vertical: boolean): Matter.Body {
        let x, y, width, height: number;
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
                render: { fillStyle: '#825201', strokeStyle: 'black' },
                label: 'Border'
            });
    }

    // gets the view-model associated with the body
    function getBallModelFromBody(ballBody: Matter.Body): BallModel {
        let ballNumber = Number(ballBody.label.split(' ')[1]);
        if (ballNumber == 0) {
            return cueBallModel;
        } else if (ballNumber == 8) {
            return eightBallModel;
        } else if (ballNumber > 8) {
            return stripedBallModels[ballNumber - 9];
        } else {
            return solidBallModels[ballNumber - 1];
        }
    }

    function syncBallModelPositions() {
        cueBallModel.Ball.Position = { X: cueBallModel.Body.position.x, Y: cueBallModel.Body.position.y };
        eightBallModel.Ball.Position = { X: eightBallModel.Body.position.x, Y: eightBallModel.Body.position.y };
        for (let ballModel of solidBallModels) {
            ballModel.Ball.Position = { X: ballModel.Body.position.x, Y: ballModel.Body.position.y };
        }
        for (let ballModel of stripedBallModels) {
            ballModel.Ball.Position = { X: ballModel.Body.position.x, Y: ballModel.Body.position.y };
        }
    }

    // clamps the position within board bounds
    function clampWithinBounds(pos : Matter.Vector) :Matter.Vector {
        let x = Math.min(_bottomRightCorner.x - GameplayConsts.BorderThickness, Math.max(pos.x, _topLeftCorner.x + GameplayConsts.BorderThickness));
        let y = Math.min(_bottomRightCorner.y - GameplayConsts.BorderThickness, Math.max(pos.y, _topLeftCorner.y + GameplayConsts.BorderThickness));
        return {x: x, y: y};
    }

    // moves the cue ball and recreates the cue ball body and model
    function moveCueBall(pos: Matter.Vector, useStartLine: boolean) {
        World.remove(_world, cueBallModel.Body);
        let y: number;
        if (useStartLine) {
            y = _gameState.PoolBoard.StartLine;
        } else {
            y = pos.y;
        }
        // clamp within bounds
        let clampedPos = clampWithinBounds({x: pos.x, y: y});
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
        let theReturnState: ReturnState = {
            PocketedBalls: _pocketedBalls,
            TouchedBall: _firstTouchBall,
        }
        // create IState
        let solidBalls: Ball[] = [];
        let stripedBalls: Ball[] = [];
        for (let ballModel of solidBallModels) {
            solidBalls.push(ballModel.Ball);
        }
        for (let ballModel of stripedBallModels) {
            stripedBalls.push(ballModel.Ball);
        }
        let finalState: IState = {
            SolidBalls: solidBalls,
            StripedBalls: stripedBalls,
            EightBall: eightBallModel.Ball,
            CueBall: cueBallModel.Ball,
            CanMoveCueBall: _gameState.CanMoveCueBall, // set by gamelogic
            PoolBoard: _gameState.PoolBoard,
            FirstMove: _gameState.FirstMove, // set by gamelogic
            Player1Color: null, // set by gamelogic
            Player2Color: null, // set by gamelogic
            DeltaBalls: theReturnState,
        }
        console.log(theReturnState);
        console.log(finalState);
        // console.log(GameLogic.createMove(finalState, 0));
    }

    function drawGuideLine(context: CanvasRenderingContext2D) {
        let cueBody = cueBallModel.Body;
        let startPoint = { x: cueBody.position.x, y: cueBody.position.y };
        let endPoint = {
            x: cueBody.position.x + _renderLength * Math.cos(cueBody.angle),
            y: cueBody.position.y + _renderLength * Math.sin(cueBody.angle)
        }
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

    function drawCueStick(context: CanvasRenderingContext2D) {
        if (_renderLength <= 0) return;
        let cueBody = cueBallModel.Body;
        let mousePos = {
            x: cueBody.position.x - _renderLength * Math.cos(cueBody.angle),
            y: cueBody.position.y - _renderLength * Math.sin(cueBody.angle)
        }
        context.save();
        context.translate(cueBody.position.x, cueBody.position.y);
        context.rotate(cueBody.angle);
        context.drawImage(_stickImg, -_stickImg.width - _renderLength, -_stickImg.height / 2);
        context.restore();
    }

    function drawGameHUD(context: CanvasRenderingContext2D) {
        context.save();
        let fontSize = 20;
        context.font = "20px Arial";
        context.fillStyle = "white";
        let textLeft = "";
        switch (_gameStage) {
            case GameStage.PlacingCue:
                textLeft = "Click to place cue ball";
                break;
            case GameStage.Aiming:
                textLeft = "Drag behind cue ball to aim";
                break;
            case GameStage.CueHit:
                if (_firstTouchBall) textLeft = "First touch: " + _firstTouchBall.Number;
                break;
            case GameStage.Finalized:
                textLeft = "Opponent's turn!";
                break;
        }
        context.textAlign = "left";
        context.fillText(textLeft, 0, fontSize);

        if ((_gameStage == GameStage.PlacingCue || _gameStage == GameStage.Aiming)) {
            // TODO: Use player turn index to get the current player
            let myColorText = "Designated group: " + AssignedBallType[_gameState.Player1Color];
            context.textAlign = "right";
            context.fillText(myColorText, context.canvas.width, fontSize);
        }

        if ((_gameStage == GameStage.Finalized || _gameStage == GameStage.CueHit) && _pocketedBalls.length != 0) {
            let statusText = "Pocketed: ";
            for (let ball of _pocketedBalls) {
                statusText += ball.Number + ",";
            }
            context.textAlign = "right";
            context.fillText(statusText, context.canvas.width, fontSize);
        }
        // show mouse coords on screen bottom
        if (_mousePos != null) {
            let coordText = "(" + _mousePos.x.toFixed(0) + "," + _mousePos.y.toFixed(0) + ")";
            context.textAlign = "center";
            context.fillText(coordText, context.canvas.width/2, context.canvas.height - fontSize);
        }
        context.restore();
    }

    export function updateUI() {
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
        let renderOptions = <any>_render.options;
        renderOptions.wireframes = false;
        renderOptions.background = 'green';
        // starting game stage
        if (_gameState.CanMoveCueBall) {
            _gameStage = GameStage.PlacingCue;
        } else {
            _gameStage = GameStage.Aiming;
        }

        // create borders
        let pockets = _gameState.PoolBoard.Pockets;
        World.add(_world, [
            createBorderBody(pockets[0], pockets[3], false), // top
            createBorderBody(pockets[2], pockets[5], false), // bottom
            createBorderBody(pockets[0], pockets[1], true), // left top
            createBorderBody(pockets[1], pockets[2], true), // left bottom
            createBorderBody(pockets[3], pockets[4], true), // right top
            createBorderBody(pockets[4], pockets[5], true), // right bottom
        ]);
        _topLeftCorner = {x: pockets[0].Position.X, y: pockets[0].Position.Y};
        _bottomRightCorner = {x: pockets[5].Position.X, y: pockets[5].Position.Y};

        // create pockets
        for (let pocket of _gameState.PoolBoard.Pockets) {
            World.add(_world,
                Bodies.circle(pocket.Position.X, pocket.Position.Y, pocket.Radius,
                    <any>{
                        isStatic: true,
                        render: { fillStyle: 'black' },
                        label: 'Pocket'
                    }));
        }

        // create ball bodies and body models
        let textureScale = _gameState.CueBall.Radius * 2 / GameplayConsts.BallTextureSize;
        // cue ball
        cueBallModel = createCueBallModel(_gameState.CueBall);
        if (!_gameState.CueBall.Pocketed && !_gameState.CanMoveCueBall) World.add(_world, cueBallModel.Body);

        // eight ball
        eightBallModel = {
            Ball: _gameState.EightBall,
            Body: Bodies.circle(_gameState.EightBall.Position.X, _gameState.EightBall.Position.Y,
                _gameState.EightBall.Radius, <any>{
                    isStatic: false,
                    collisionFilter: { category: GameplayConsts.CollisionCategoryCue, mask: GameplayConsts.CollisionMaskAllBalls },
                    restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
                    render: { sprite: { texture: 'imgs/8.png', xScale: textureScale, yScale: textureScale } },
                    label: 'Ball 8'
                })
        };
        if (!_gameState.EightBall.Pocketed) World.add(_world, eightBallModel.Body);

        // solid balls
        for (let ball of _gameState.SolidBalls) {
            let theBallBody = Bodies.circle(ball.Position.X, ball.Position.Y, ball.Radius, <any>{
                isStatic: false,
                collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
                restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
                render: { sprite: { texture: 'imgs/' + String(ball.Number) + '.png', xScale: textureScale, yScale: textureScale } },
                label: 'Ball ' + String(ball.Number)
            });
            if (!ball.Pocketed) World.add(_world, theBallBody);
            solidBallModels.push({ Ball: ball, Body: theBallBody });
        }
        // striped balls
        for (let ball of _gameState.StripedBalls) {
            let theBallBody = Bodies.circle(ball.Position.X, ball.Position.Y, ball.Radius, <any>{
                isStatic: false,
                collisionFilter: { category: GameplayConsts.CollisionCategoryNormalBalls, mask: GameplayConsts.CollisionMaskAllBalls },
                restitution: GameplayConsts.BallRestitution, frictionAir: GameplayConsts.BallFriction,
                render: { sprite: { texture: 'imgs/' + String(ball.Number) + '.png', xScale: textureScale, yScale: textureScale } },
                label: 'Ball ' + String(ball.Number)
            });
            if (!ball.Pocketed) World.add(_world, theBallBody);
            stripedBallModels.push({ Ball: ball, Body: theBallBody });
        }

        // add mouse control
        let mouse = Mouse.create(_render.canvas);
        let mouseConstraint = (<any>MouseConstraint).create(_engine, { mouse: mouse });
        mouseConstraint.collisionFilter.mask = GameplayConsts.CollisionMaskMouse;
        World.add(_world, mouseConstraint);

        // EVENT: set angle and _renderLength on mousemove
        Matter.Events.on(mouseConstraint, 'mousemove', function (event) {
            // This function sets the angle and _renderLength
            let mousePosition = event.mouse.position;
            let cuePosition = cueBallModel.Body.position;

            let horizontalDistance = cuePosition.x - mousePosition.x;
            let verticalDistance = cuePosition.y - mousePosition.y;
            let angle = Math.atan2(verticalDistance, horizontalDistance);
            _mousePos = {x: mousePosition.x, y: mousePosition.y};
            _renderLength = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
            Matter.Body.setAngle(cueBallModel.Body, angle);
        });
        Matter.Events.on(mouseConstraint, 'mousedown', function (event) {
        });
        // EVENT: shoot cue ball on mouseup
        Matter.Events.on(mouseConstraint, 'mouseup', function (event) {
            let mouseUpPosition = <Matter.Vector>event.mouse.mouseupPosition;
            if (_gameStage == GameStage.Aiming /* && isHumanTurn() */) {
                // only shoot cue ball when the mouse is around the cue ball
                let dist = distanceBetweenVectors(mouseUpPosition, cueBallModel.Body.position);
                if (dist < GameplayConsts.ClickDistanceLimit) {
                    _gameStage = GameStage.CueHit;
                    shootClick(cueBallModel.Body);
                }
            } else if (_gameStage == GameStage.PlacingCue) {
                // place the cue ball at mouse position
                // recreate the cue ball model (body)
                moveCueBall(mouseUpPosition, _gameState.FirstMove);
                _gameStage = GameStage.Aiming;
            }
        });
        // EVENT: handle pocket and ball collision
        Matter.Events.on(_engine, 'collisionStart', function (event) {
            // only handle collisions after player has hit the cue ball
            if (_gameStage != GameStage.CueHit) return;
            for (let pair of event.pairs) {
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

    export function getGameStage() :GameStage {
        return _gameStage;
    }
}

GameExample.updateUI();
