// Red turn index = 0, Blue turn index = 1
var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 8;
    gameLogic.COLS = 8;
    /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
    function getInitialBoard() {
        var board = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i][j] = '';
            }
        }
        board[4][4] = 'R';
        board[4][5] = 'B';
        board[5][4] = 'B';
        board[5][5] = 'R';
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function getInitialState() {
        return { board: getInitialBoard(), delta: null };
    }
    gameLogic.getInitialState = getInitialState;
    /**
     * calculates the number of red and blue pieces on the board
     * returns the scores as an array
     */
    function getScores(board) {
        var red = 0;
        var blue = 0;
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (board[i][j] === 'R') {
                    red = red + 1;
                }
                else if (board[i][j] === 'B') {
                    blue = blue + 1;
                }
            }
        }
        return [red, blue];
    }
    /**
     * Returns the winner of the game
     * R = Red, B = Blue, T = Tie
     */
    function getWinner(scores) {
        var blue = scores.pop();
        var red = scores.pop();
        if (red < blue) {
            return 'B';
        }
        else if (blue < red) {
            return 'R';
        }
        else {
            return 'T';
        }
    }
    //type PossibleMoves = BoardDelta[];
    /**
     * Returns a possible move from a particular i, j
     * in a particular direction specified by inci, incj
     */
    function getPossibleMove(board, i, j, inci, incj, turn) {
        var other;
        var curr;
        if (turn == 0) {
            curr = 'R';
            other = 'B';
        }
        else {
            curr = 'B';
            other = 'R';
        }
        if (i >= 0 && i < gameLogic.ROWS && j >= 0 && j < gameLogic.COLS && board[i][j] === other) {
            i = i + inci;
            j = j + incj;
            while (i >= 0 && i < gameLogic.ROWS && j >= 0 && j < gameLogic.COLS) {
                if (board[i][j] === other) {
                    i = i + inci;
                    j = j + incj;
                }
                else if (board[i][j] === curr) {
                    break;
                }
                else {
                    return { row: i, col: j };
                }
            }
        }
        return { row: -1, col: -1 };
    }
    gameLogic.getPossibleMove = getPossibleMove;
    /**
     * Returns the set of all possible moves that can be performed by a player in the current move
     */
    function getAllPossibleMoves(board, turn) {
        var possibleMoves = [];
        var temp;
        var curr;
        if (turn == 0) {
            curr = 'R';
        }
        else {
            curr = 'B';
        }
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (board[i][j] == curr) {
                    temp = getPossibleMove(board, i - 1, j, -1, 0, turn);
                    if (temp.row !== -1) {
                        possibleMoves.push(temp);
                    }
                    temp = getPossibleMove(board, i + 1, j, +1, 0, turn);
                    if (temp.row !== -1) {
                        possibleMoves.push(temp);
                    }
                    temp = getPossibleMove(board, i - 1, j - 1, -1, -1, turn);
                    if (temp.row !== -1) {
                        possibleMoves.push(temp);
                    }
                    temp = getPossibleMove(board, i + 1, j + 1, +1, +1, turn);
                    if (temp.row !== -1) {
                        possibleMoves.push(temp);
                    }
                    temp = getPossibleMove(board, i - 1, j + 1, -1, +1, turn);
                    if (temp.row !== -1) {
                        possibleMoves.push(temp);
                    }
                    temp = getPossibleMove(board, i + 1, j - 1, +1, -1, turn);
                    if (temp.row !== -1) {
                        possibleMoves.push(temp);
                    }
                    temp = getPossibleMove(board, i, j - 1, 0, -1, turn);
                    if (temp.row !== -1) {
                        possibleMoves.push(temp);
                    }
                    temp = getPossibleMove(board, i, j + 1, 0, +1, turn);
                    if (temp.row !== -1) {
                        possibleMoves.push(temp);
                    }
                }
            }
        }
        return possibleMoves;
    }
    gameLogic.getAllPossibleMoves = getAllPossibleMoves;
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col.
     */
    function createMove(stateBeforeMove, row, col, turnIndexBeforeMove) {
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        var board = stateBeforeMove.board;
        if (board[row][col] !== '') {
            throw new Error("One can only make a move in an empty position!");
        }
        var allMovesRed = getAllPossibleMoves(board, 0);
        var allMovesBlue = getAllPossibleMoves(board, 0);
        if (allMovesRed.length <= 0 && allMovesBlue.length <= 0) {
            throw new Error("Can only make a move if the game is not over!");
        }
        var found = false;
        var len;
        if (turnIndexBeforeMove === 0) {
            len = allMovesRed.length;
        }
        else {
            len = allMovesBlue.length;
        }
        for (var i = 0; i < len; i++) {
            if (turnIndexBeforeMove === 0) {
                if (allMovesRed[i].row === row && allMovesRed[i].col === col) {
                    found = true;
                    break;
                }
            }
            else {
                if (allMovesBlue[i].row === row && allMovesBlue[i].col === col) {
                    found = true;
                    break;
                }
            }
        }
        if (found === false) {
            throw new Error("Invalid Move!");
        }
        var boardAfterMove = angular.copy(board);
        boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'R' : 'B';
        var endMatchScores;
        var winner = '';
        var turnIndex;
        if (getAllPossibleMoves(boardAfterMove, 0).length <= 0 && getAllPossibleMoves(boardAfterMove, 1).length <= 0) {
            // Game over. No more moves possible
            turnIndex = -1;
            endMatchScores = getScores(boardAfterMove);
            winner = getWinner(endMatchScores);
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            turnIndex = 1 - turnIndexBeforeMove;
            endMatchScores = null;
        }
        var delta = { row: row, col: col };
        var state = { delta: delta, board: boardAfterMove };
        return {
            endMatchScores: endMatchScores,
            turnIndex: turnIndex,
            state: state
        };
    }
    gameLogic.createMove = createMove;
    /**
     * Returns the first move
     */
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