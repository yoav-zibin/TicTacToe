// Game Logic for Pool Game
var AssignedBallType;
(function (AssignedBallType) {
    AssignedBallType[AssignedBallType["Any"] = 0] = "Any";
    AssignedBallType[AssignedBallType["Stripes"] = 1] = "Stripes";
    AssignedBallType[AssignedBallType["Solids"] = 2] = "Solids";
    AssignedBallType[AssignedBallType["Eight"] = 3] = "Eight";
})(AssignedBallType || (AssignedBallType = {}));
var BallType;
(function (BallType) {
    BallType[BallType["Cue"] = 0] = "Cue";
    BallType[BallType["Stripes"] = 1] = "Stripes";
    BallType[BallType["Solids"] = 2] = "Solids";
    BallType[BallType["Eight"] = 3] = "Eight";
})(BallType || (BallType = {}));
var GameLogic;
(function (GameLogic) {
    var blackX = 264;
    var blackY = 264;
    var BallRadius = 12;
    function getInitialState() {
        var blackX = 264;
        var blackY = 264;
        var BallRadius = 12;
        var CueBall = {
            Position: { X: blackX, Y: blackY + 400 },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Cue,
            Number: 0
        };
        //Create solid balls
        var solidBalls = [];
        var Ball1 = {
            Position: { X: blackX - 2 * BallRadius, Y: blackY - 2 * BallRadius * Math.sqrt(3) },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Solids,
            Number: 1
        };
        solidBalls.push(Ball1);
        var Ball2 = {
            Position: { X: blackX + 4 * BallRadius, Y: blackY - 2 * BallRadius * Math.sqrt(3) },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Solids,
            Number: 2
        };
        solidBalls.push(Ball2);
        var Ball3 = {
            Position: { X: blackX - 3 * BallRadius, Y: blackY - BallRadius * Math.sqrt(3) },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Solids,
            Number: 3
        };
        solidBalls.push(Ball3);
        var Ball4 = {
            Position: { X: blackX + BallRadius, Y: blackY - BallRadius * Math.sqrt(3) },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Solids,
            Number: 4
        };
        solidBalls.push(Ball4);
        var Ball5 = {
            Position: { X: blackX + 2 * BallRadius, Y: blackY },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Solids,
            Number: 5
        };
        solidBalls.push(Ball5);
        var Ball6 = {
            Position: { X: blackX - BallRadius, Y: blackY + BallRadius * Math.sqrt(3) },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Solids,
            Number: 6
        };
        solidBalls.push(Ball6);
        var Ball7 = {
            Position: { X: blackX, Y: blackY + 2 * BallRadius * Math.sqrt(3) },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Solids,
            Number: 7
        };
        solidBalls.push(Ball7);
        var EightBall = {
            Position: { X: blackX, Y: blackY },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Eight,
            Number: 8
        };
        var StripeBalls = [];
        var Ball9 = {
            Position: { X: blackX - 4 * BallRadius, Y: blackY - 2 * BallRadius * Math.sqrt(3) },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Stripes,
            Number: 9
        };
        StripeBalls.push(Ball9);
        var Ball10 = {
            Position: { X: blackX, Y: blackY - 2 * BallRadius * Math.sqrt(3) },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Stripes,
            Number: 10
        };
        StripeBalls.push(Ball10);
        var Ball11 = {
            Position: { X: blackX + 2 * BallRadius, Y: blackY - 2 * BallRadius * Math.sqrt(3) },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Stripes,
            Number: 11
        };
        StripeBalls.push(Ball11);
        var Ball12 = {
            Position: { X: blackX - BallRadius, Y: blackY - BallRadius * Math.sqrt(3) },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Stripes,
            Number: 12
        };
        StripeBalls.push(Ball12);
        var Ball13 = {
            Position: { X: blackX + 3 * BallRadius, Y: blackY - BallRadius * Math.sqrt(3) },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Stripes,
            Number: 13
        };
        StripeBalls.push(Ball13);
        var Ball14 = {
            Position: { X: blackX - 2 * BallRadius, Y: blackY },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Stripes,
            Number: 14
        };
        StripeBalls.push(Ball14);
        var Ball15 = {
            Position: { X: blackX + BallRadius, Y: blackY + BallRadius * Math.sqrt(3) },
            Pocketed: false,
            Radius: BallRadius,
            BallType: BallType.Stripes,
            Number: 15
        };
        StripeBalls.push(Ball15);
        var PocketRadius = 1.5 * BallRadius;
        var Pockets = [];
        var Pocket1 = {
            Position: { X: 48, Y: 50 },
            Radius: PocketRadius
        };
        Pockets.push(Pocket1);
        var Pocket2 = {
            Position: { X: 48, Y: 481 },
            Radius: PocketRadius
        };
        Pockets.push(Pocket2);
        var Pocket3 = {
            Position: { X: 48, Y: 912 },
            Radius: PocketRadius
        };
        Pockets.push(Pocket3);
        var Pocket4 = {
            Position: { X: 482, Y: 50 },
            Radius: PocketRadius
        };
        Pockets.push(Pocket4);
        var Pocket5 = {
            Position: { X: 482, Y: 481 },
            Radius: PocketRadius
        };
        Pockets.push(Pocket5);
        var Pocket6 = {
            Position: { X: 482, Y: 912 },
            Radius: PocketRadius
        };
        Pockets.push(Pocket6);
        var PoolBoard = {
            Height: 960,
            Width: 531,
            StartLine: 696,
            Pockets: Pockets,
        };
        var CanMoveCueBall = true;
        var FirstMove = true;
        var Player1Color = AssignedBallType.Any;
        var Player2Color = AssignedBallType.Any;
        var DeltaBalls = null;
        return { SolidBalls: solidBalls,
            StripedBalls: StripeBalls,
            EightBall: EightBall,
            CueBall: CueBall,
            CanMoveCueBall: CanMoveCueBall,
            PoolBoard: PoolBoard,
            FirstMove: FirstMove,
            Player1Color: Player1Color,
            Player2Color: Player2Color,
            DeltaBalls: null
        };
    }
    GameLogic.getInitialState = getInitialState;
    /**
     * This function takes the "stateAfterMove" and uses it to create a new State that is passed back to
     * the physics engine as an "IMove" object
     */
    function isBallContained(ballNum, balls) {
        var i = 0;
        for (var _i = 0, balls_1 = balls; _i < balls_1.length; _i++) {
            var ball = balls_1[_i];
            if (ball.Number == ballNum) {
                return i;
            }
            i++;
        }
        return -1;
    }
    function createMove(stateBeforeMove, stateAfterMove, turnIndexBeforeMove, gameSettings) {
        var nextMove; // this will be returned as the next move
        stateAfterMove.CanMoveCueBall = false; // discontinuing the use of CanMoveCueBall property if it was in use
        /** FIRST SHOT AFTER MOVE
         * The following logic is ONLY for the move right after the "break" move
         * 0) Check if the BLACK ball is potted => call the state from getInitialState and keep the turn and return
         *      ELSE
         *          nextMove.state will copy ALL contents from the stateAfterMove
         *          FirstMove=false AND:
         * 1) Check if the cue ball is potted => return "CanMoveCueBall" and change the turn
         * 2) Check if no balls are touched => return "CanMoveCueBall" and change the turn
         * 3) Check if no balls are potted => change the turn
         * 4) Check if balls are potted => keep the turn
         */
        var pocketedBalls = stateAfterMove.DeltaBalls.PocketedBalls;
        var touchedFirst = stateAfterMove.DeltaBalls.TouchedBall;
        if (stateAfterMove.FirstMove) {
            // 0)
            if (isBallContained(8, pocketedBalls)) {
                nextMove.stateAfterMove = getInitialState();
                nextMove.turnIndexAfterMove = turnIndexBeforeMove;
                return nextMove;
            }
            stateAfterMove.FirstMove = false;
            nextMove.stateAfterMove = stateAfterMove; // copying the state into the returned IMove
            // 1) && 2)
            if ((isBallContained(0, pocketedBalls) != -1) || (touchedFirst == null)) {
                nextMove.stateAfterMove.CanMoveCueBall = true;
                nextMove.turnIndexAfterMove = turnIndexBeforeMove + 1 % 2;
                return nextMove;
            }
            else if (pocketedBalls.length == 0) {
                nextMove.turnIndexAfterMove = turnIndexBeforeMove + 1 % 2;
                return nextMove;
            }
            else if (pocketedBalls.length > 0) {
                nextMove.turnIndexAfterMove = turnIndexBeforeMove;
                return nextMove;
            }
            else {
                throw new TypeError("Unexpected condition during Break Shot");
            }
        }
        else {
            //~~ storing the player's color and his assigned balls
            function getMyUsableColor(color) {
                if (color == AssignedBallType.Any)
                    return null;
                else if (color == AssignedBallType.Solids)
                    return BallType.Solids;
                else if (color == AssignedBallType.Stripes)
                    return BallType.Stripes;
                else if (color == AssignedBallType.Eight)
                    return BallType.Eight;
                return null;
            }
            //~~ Reverse of the above function
            function getMyAssignableColor(col) {
                if (col == BallType.Solids)
                    return AssignedBallType.Solids;
                else if (col == BallType.Stripes)
                    return AssignedBallType.Stripes;
                else if (col == BallType.Eight)
                    return AssignedBallType.Eight;
                return null;
            }
            //~~ checking if a particular colored ball is pocketed
            function isColorBallPocketed(usableColor, balls) {
                for (var _i = 0, balls_2 = balls; _i < balls_2.length; _i++) {
                    var ball = balls_2[_i];
                    if (ball.BallType == myUsableColor)
                        return true;
                }
                return false;
            }
            var myColor; // the player's color of type AssignedBallType
            var cueBallPotted = false; // whether or not the cueBall was potted in this turn
            if (isBallContained(0, pocketedBalls) != -1)
                cueBallPotted = true;
            if (turnIndexBeforeMove == 0) {
                myColor = stateAfterMove.Player1Color;
            }
            else {
                myColor = stateAfterMove.Player2Color;
            }
            var myUsableColor = getMyUsableColor(myColor); // the player's color of type BallType
            var myBalls, yourBalls, myRemainingBalls;
            if (myColor != AssignedBallType.Any) {
                if (myColor == AssignedBallType.Solids) {
                    myBalls = stateAfterMove.SolidBalls;
                    yourBalls = stateAfterMove.StripedBalls;
                }
                else {
                    myBalls = stateAfterMove.StripedBalls;
                    yourBalls = stateAfterMove.SolidBalls;
                }
                for (var _i = 0, myBalls_1 = myBalls; _i < myBalls_1.length; _i++) {
                    var ball = myBalls_1[_i];
                    if (!ball.Pocketed)
                        myRemainingBalls.push(ball);
                }
            }
            //  6)
            if (myRemainingBalls.length == 0) {
                if (turnIndexBeforeMove == 0)
                    nextMove.stateAfterMove.Player1Color = AssignedBallType.Eight;
                else
                    nextMove.stateAfterMove.Player2Color = AssignedBallType.Eight;
            }
            //  1)
            var blackIndex = isBallContained(8, pocketedBalls);
            if (blackIndex != -1) {
                // a)
                if (isBallContained(0, pocketedBalls) != -1) {
                    if (turnIndexBeforeMove == 0)
                        nextMove.endMatchScores = [0, 1];
                    else
                        nextMove.endMatchScores = [1, 0];
                    return nextMove;
                }
                else if (myColor == AssignedBallType.Any || myRemainingBalls.length != 0) {
                    if (turnIndexBeforeMove == 0)
                        nextMove.endMatchScores = [0, 1];
                    else
                        nextMove.endMatchScores = [1, 0];
                    return nextMove;
                }
                else if (blackIndex != pocketedBalls.length - 1) {
                    if (turnIndexBeforeMove == 0)
                        nextMove.endMatchScores = [0, 1];
                    else
                        nextMove.endMatchScores = [1, 0];
                    return nextMove;
                }
                else if (!(touchedFirst.BallType == myUsableColor || touchedFirst.BallType == BallType.Eight)) {
                    if (turnIndexBeforeMove == 0)
                        nextMove.endMatchScores = [0, 1];
                    else
                        nextMove.endMatchScores = [1, 0];
                    return nextMove;
                }
                else if (pocketedBalls.length == 1) {
                    if (turnIndexBeforeMove == 0)
                        nextMove.endMatchScores = [1, 0];
                    else
                        nextMove.endMatchScores = [0, 1];
                    return nextMove;
                }
                else {
                    throw new TypeError("Unexpected condition during Winner determination");
                }
            }
            else {
                //  2), 3)
                if (touchedFirst == null || (myColor != AssignedBallType.Any && touchedFirst.BallType != myUsableColor)) {
                    nextMove.stateAfterMove.CanMoveCueBall = true;
                    nextMove.turnIndexAfterMove = turnIndexBeforeMove + 1 % 2;
                    return nextMove;
                }
                else if (pocketedBalls.length == 0) {
                    nextMove.turnIndexAfterMove = turnIndexBeforeMove + 1 % 2;
                    return nextMove;
                }
                else if (pocketedBalls.length > 0) {
                    // a)
                    if (cueBallPotted) {
                        nextMove.stateAfterMove.CanMoveCueBall = true;
                        nextMove.turnIndexAfterMove = turnIndexBeforeMove + 1 % 2;
                        return nextMove;
                    }
                    else if (myColor == AssignedBallType.Any) {
                        nextMove.turnIndexAfterMove = turnIndexBeforeMove;
                        //~~ Assigning the player his color
                        if (turnIndexBeforeMove == 0)
                            nextMove.stateAfterMove.Player1Color = getMyAssignableColor(pocketedBalls[0].BallType);
                        else
                            nextMove.stateAfterMove.Player1Color = getMyAssignableColor(pocketedBalls[0].BallType);
                        return nextMove;
                    }
                    else if (isColorBallPocketed(myUsableColor, pocketedBalls)) {
                        nextMove.turnIndexAfterMove = turnIndexBeforeMove; // keep the turn
                        return nextMove;
                    }
                    else if (!isColorBallPocketed(myUsableColor, pocketedBalls)) {
                        nextMove.stateAfterMove.CanMoveCueBall = true;
                        nextMove.turnIndexAfterMove = turnIndexBeforeMove + 1 % 2;
                        return nextMove;
                    }
                    else {
                        throw new TypeError("Unexpected condition during next turn assignment");
                    }
                }
            }
        }
        return nextMove;
    }
    GameLogic.createMove = createMove;
})(GameLogic || (GameLogic = {}));
//# sourceMappingURL=gameLogic.js.map