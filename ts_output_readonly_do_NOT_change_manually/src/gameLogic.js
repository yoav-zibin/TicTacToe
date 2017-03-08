var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 10;
    gameLogic.COLS = 10;
    /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
    function getInitialBoard() {
        var board = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i][j] = '';
            }
        }
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function getInitialState() {
        return { myBoard: getInitialBoard(), yourBoard: getInitialBoard(), delta: null, ship: 0, start: 0 };
    }
    gameLogic.getInitialState = getInitialState;
    function validSet(board, row, col, leng, direction) {
        if (direction == true) {
            if ((row + leng) > 10 || row < 0 || col < 0) {
                return false;
            }
        }
        else {
            if ((col + leng) > 10 || row < 0 || col < 0) {
                return false;
            }
        }
        return true;
    }
    gameLogic.validSet = validSet;
    function setShipRow(board, state, row, col, direction) {
        var shipNum = state.ship;
        var originBoard = board;
        if (shipNum < 5) {
            if (state.start == 0) {
                if (board[row][col] === 'O') {
                    throw new Error("already set!");
                }
                else {
                    var length_1 = 5 - shipNum;
                    var compensate = 0;
                    /**give compensate to out of boundary */
                    if (!validSet(board, row, col, length_1, direction)) {
                        compensate = row + length_1 - gameLogic.ROWS;
                    }
                    /**check if already set */
                    for (var i = 0; i < length_1; i++) {
                        /**check if already set */
                        if (board[row - compensate + i][col] === 'O') {
                            window.alert("Already set ship here");
                            return { myBoard: originBoard, yourBoard: state.yourBoard, delta: null, ship: shipNum, start: state.start };
                        }
                    }
                    for (var i = 0; i < length_1; i++) {
                        board[row - compensate + i][col] = 'O';
                    }
                    shipNum++;
                    console.log("shipNum:", shipNum);
                }
            }
        }
        else {
            return { myBoard: board, yourBoard: state.yourBoard, delta: { row: row, col: col }, ship: shipNum, start: 1 };
        }
        if (shipNum == 5) {
            state.start = 1;
        }
        return { myBoard: board, yourBoard: state.yourBoard, delta: { row: row, col: col }, ship: shipNum, start: state.start };
    }
    function setShipCol(board, state, row, col, direction) {
        var shipNum = state.ship;
        var originBoard = board;
        if (shipNum < 5) {
            if (state.start == 0) {
                if (board[row][col] === 'O') {
                    throw new Error("already set!");
                }
                else {
                    var length_2 = 5 - shipNum;
                    var compensate = 0;
                    /**give compensate to out of boundary */
                    if (!validSet(board, row, col, length_2, direction)) {
                        compensate = col + length_2 - gameLogic.COLS;
                    }
                    /**check if already set */
                    for (var i = 0; i < length_2; i++) {
                        /**check if already set */
                        if (board[row][col - compensate + i] === 'O') {
                            window.alert("Already set ship here");
                            return { myBoard: originBoard, yourBoard: state.yourBoard, delta: null, ship: shipNum, start: state.start };
                        }
                    }
                    for (var i = 0; i < length_2; i++) {
                        board[row][col - compensate + i] = 'O';
                    }
                    shipNum++;
                    console.log("shipNum:", shipNum);
                }
            }
        }
        else {
            return { myBoard: board, yourBoard: state.yourBoard, delta: { row: row, col: col }, ship: shipNum, start: 1 };
        }
        if (shipNum == 5) {
            state.start = 1;
        }
        return { myBoard: board, yourBoard: state.yourBoard, delta: { row: row, col: col }, ship: shipNum, start: state.start };
    }
    function getWinner(board) {
        var sinkBoat = 0;
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (board[i][j] == 'O') {
                    console.log("sinkBoat: " + sinkBoat);
                    return '';
                }
            }
        }
        console.log("Game Ends ");
        return "I lose!";
    }
    function createMove(stateBeforeMove, row, col, turnIndexBeforeMove, whichBoard, direction) {
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        var myBoard = stateBeforeMove.myBoard;
        var yourBoard = stateBeforeMove.yourBoard;
        /**set ship */
        if (whichBoard == 0) {
            if (stateBeforeMove.start != 1) {
                console.log("setting ship");
                var shipState = void 0;
                if (direction == true) {
                    shipState = setShipRow(myBoard, stateBeforeMove, row, col, direction);
                }
                else
                    shipState = setShipCol(myBoard, stateBeforeMove, row, col, direction);
                return { endMatchScores: null, turnIndex: 0, state: shipState };
            }
            else {
                console.log("Game has started!");
                return { endMatchScores: null, turnIndex: 1, state: stateBeforeMove };
            }
        }
        else if (whichBoard == 1) {
            if (stateBeforeMove.start != 1) {
                console.log("Not Started");
                throw new Error("Not Started");
            }
            if (yourBoard[row][col] === 'X' || yourBoard[row][col] === 'M') {
                console.log("already full!");
                throw new Error("already full!");
            }
            if (getWinner(myBoard) !== '') {
                throw new Error("Can only make a move if the game is not over!");
            }
            var myBoardAfterMove = angular.copy(myBoard);
            var yourBoardAfterMove = angular.copy(yourBoard);
            //boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
            if (yourBoard[row][col] === '')
                yourBoardAfterMove[row][col] = 'M';
            else
                yourBoardAfterMove[row][col] = 'X';
            var winner = getWinner(myBoardAfterMove);
            var shipNum = stateBeforeMove.ship;
            var endMatchScores = void 0;
            var turnIndex = void 0;
            if (winner !== '') {
                // Game over.
                turnIndex = -1;
                endMatchScores = winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0];
            }
            else {
                // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
                turnIndex = 1 - turnIndexBeforeMove;
                endMatchScores = null;
            }
            var delta = { row: row, col: col };
            var state = { delta: delta, myBoard: myBoardAfterMove, yourBoard: yourBoardAfterMove, ship: shipNum, start: 1 };
            if (shipNum == 0) {
                window.alert("Game Ended!");
            }
            return { endMatchScores: endMatchScores, turnIndex: turnIndex, state: state };
        }
    }
    gameLogic.createMove = createMove;
    function createInitialMove() {
        return { endMatchScores: null, turnIndex: 0,
            state: getInitialState() };
    }
    gameLogic.createInitialMove = createInitialMove;
    /*
      export function forSimpleTestHtml() {
        var move = gameLogic.createMove(null,null, 0, 0, 0);
        log.log("move=", move);
      }
    */
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map