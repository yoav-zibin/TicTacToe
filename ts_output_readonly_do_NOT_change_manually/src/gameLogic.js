var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 3;
    gameLogic.COLS = 3;
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
        return { board: getInitialBoard(), delta: null, ship: 0, start: 0 };
    }
    gameLogic.getInitialState = getInitialState;
    /**
     * Return the winner (either 'X' or 'O') or '' if there is no winner.
     * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
     * E.g., getWinner returns 'X' for the following board:
     *     [['X', 'O', ''],
     *      ['X', 'O', ''],
     *      ['X', '', '']]
     */
    function setShip(board, state, row, col) {
        var shipNum = state.ship;
        var isStart = 0;
        if (shipNum != 5) {
            if (board[row][col] === 'O') {
                throw new Error("already set!");
            }
            else
                board[row][col] = 'O';
        }
        else {
            isStart = 1;
        }
        return { board: board, delta: { row: row, col: col }, ship: shipNum + 1, start: isStart };
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
    function getShip(board) {
        var shipNum = 0;
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (board[i][j] == 'O') {
                    shipNum++;
                }
            }
        }
        return shipNum;
    }
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col.
     */
    function createMove(stateBeforeMove, row, col, turnIndexBeforeMove) {
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        var board = stateBeforeMove.board;
        /**set ship */
        if (stateBeforeMove.ship != 5 && stateBeforeMove.start != 1) {
            console.log("setting ship");
            var shipState = setShip(board, stateBeforeMove, row, col);
            return { endMatchScores: null, turnIndex: 1 - turnIndexBeforeMove, state: shipState };
        }
        if (board[row][col] === 'X' || board[row][col] === 'M') {
            console.log("already shoot!");
            throw new Error("already shoot!");
        }
        if (getWinner(board) !== '') {
            throw new Error("Can only make a move if the game is not over!");
        }
        var boardAfterMove = angular.copy(board);
        //boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
        if (board[row][col] === '')
            boardAfterMove[row][col] = 'M';
        else
            boardAfterMove[row][col] = 'X';
        var winner = getWinner(boardAfterMove);
        var shipNum = getShip(boardAfterMove);
        var endMatchScores;
        var turnIndex;
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
        var state = { delta: delta, board: boardAfterMove, ship: shipNum, start: 1 };
        return { endMatchScores: endMatchScores, turnIndex: turnIndex, state: state };
    }
    gameLogic.createMove = createMove;
    function createInitialMove() {
        return { endMatchScores: null, turnIndex: 0,
            state: getInitialState() };
    }
    gameLogic.createInitialMove = createInitialMove;
    function forSimpleTestHtml() {
        var move = gameLogic.createMove(null, 0, 0, 0);
        log.log("move=", move);
    }
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map