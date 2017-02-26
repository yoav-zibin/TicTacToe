var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 20;
    gameLogic.COLS = 20;
    gameLogic.OPERATIONS = 8;
    gameLogic.SHAPECOUNT = 20;
    gameLogic.SHAPEHEIGHT = 5;
    gameLogic.SHAPEWIDTH = 5;
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
    function getInitShapes() {
        var shapes = [];
        // init all shapes 
        shapes = [{
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '1', '1', '1', '1'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '1', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '1', '0', '0', '0'],
                    ['0', '1', '1', '1', '1'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '1', '1'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '1'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '1', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '1', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '1', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: -1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '1', '1', '1', '1'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            }
        ];
        return shapes;
    }
    gameLogic.getInitShapes = getInitShapes;
    function tmp_printFrame(frame) {
        var ret = "";
        for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
            ret += frame[i].toString() + "\n\r";
        }
        return ret;
    }
    gameLogic.tmp_printFrame = tmp_printFrame;
    function getShapeByTypeAndOperation(shapeType, operationType) {
        var allShapes = getInitShapes();
        log.log("shapeType:", shapeType);
        var shape = allShapes[shapeType];
        var rotation = operationType % 4;
        // only vertical flip. Horizontal flip <=> vertical flip + 180 rotation.
        var flip = Math.floor(operationType / 4);
        var retShape = angular.copy(shape);
        log.log("shapeId=", shapeType);
        log.log("rotation=", rotation);
        log.log("flip=", flip);
        log.log("origin shape");
        console.log(tmp_printFrame(shape.frame));
        // vertical flip
        if (flip == 1) {
            for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
                for (var j = 0; j < gameLogic.SHAPEWIDTH / 2; j++) {
                    var tmp = retShape.frame[i][j];
                    retShape.frame[i][j] = retShape.frame[i][gameLogic.SHAPEWIDTH - j - 1];
                    retShape.frame[i][gameLogic.SHAPEWIDTH - j - 1] = tmp;
                }
            }
        }
        log.log("After flipping Allshape:");
        console.log(tmp_printFrame(retShape.frame));
        // rotation
        var rotateAny = function (retShape, rotation) {
            var rotate90 = function (input) {
                var tmpFrame = angular.copy(input);
                for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
                    for (var j = 0; j < gameLogic.SHAPEWIDTH; j++) {
                        tmpFrame[i][j] = input[gameLogic.SHAPEHEIGHT - j - 1][i];
                    }
                }
                return tmpFrame;
            };
            var ret = angular.copy(retShape.frame);
            console.log("Before rotation:");
            console.log(tmp_printFrame(ret));
            for (var i = 0; i < rotation; i++) {
                console.log("Roate=", i);
                ret = rotate90(ret);
                console.log("After rotation:");
                console.log(tmp_printFrame(ret));
            }
            return ret;
        };
        retShape.frame = rotateAny(retShape, rotation);
        log.log("After rotation Allshape:");
        console.log(tmp_printFrame(retShape.frame));
        return retShape;
    }
    gameLogic.getShapeByTypeAndOperation = getShapeByTypeAndOperation;
    function getShapeFromShapeID(shapeId) {
        var operationType = shapeId % gameLogic.OPERATIONS;
        var shapeType = Math.floor(shapeId / gameLogic.OPERATIONS);
        return getShapeByTypeAndOperation(shapeType, operationType);
    }
    gameLogic.getShapeFromShapeID = getShapeFromShapeID;
    function getInitialState() {
        return { board: getInitialBoard(), delta: null };
    }
    gameLogic.getInitialState = getInitialState;
    function getAllMargin(shape) {
        // top, left, bottom, right
        var ret = [0, 0, 0, 0];
        // sum of all the columns
        var colSum = [0, 0, 0, 0, 0];
        // sum of all the rows
        var rowSum = [0, 0, 0, 0, 0];
        for (var i = 0; i < gameLogic.SHAPEWIDTH; i++) {
            for (var j = 0; j < gameLogic.SHAPEHEIGHT; j++) {
                if (shape.frame[i][j] == '1') {
                    rowSum[i] += 1;
                    colSum[j] += 1;
                }
            }
        }
        console.log("colSum=", colSum.toString());
        console.log("rowSum=", rowSum.toString());
        var marginVal = 1;
        // top, left margin
        for (var i = 1; i >= 0; i--) {
            if (colSum[i] > 0) {
                ret[1] = marginVal;
            }
            if (rowSum[i] > 0) {
                ret[0] = marginVal;
            }
            marginVal++;
        }
        // right, bottom margin
        marginVal = 1;
        for (var i = 3; i < gameLogic.SHAPEWIDTH; i++) {
            if (colSum[i] > 0) {
                ret[3] = marginVal;
            }
            if (rowSum[i] > 0) {
                ret[2] = marginVal;
            }
            marginVal++;
        }
        return ret;
    }
    gameLogic.getAllMargin = getAllMargin;
    function checkValidShapePlacement(row, col, shape) {
        var ret = true;
        var margins = getAllMargin(shape);
        // TODO check valid with board, center and margin
        return ret;
    }
    gameLogic.checkValidShapePlacement = checkValidShapePlacement;
    function getBoardAction(row, col, shape) {
        var board = [];
        // TODO fill the shape matrix into the board;
        return board;
    }
    gameLogic.getBoardAction = getBoardAction;
    /**
     * Returns true if the game ended in a tie because there are no empty cells.
     * E.g., isTie returns true for the following board:
     *     [['X', 'O', 'X'],
     *      ['X', 'O', 'O'],
     *      ['O', 'X', 'X']]
     */
    function isTie(board) {
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (board[i][j] === '') {
                    // If there is an empty cell then we do not have a tie.
                    return false;
                }
            }
        }
        // No empty cells, so we have a tie!
        return true;
    }
    /**
     * Return the winner (either 'X' or 'O') or '' if there is no winner.
     * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
     * E.g., getWinner returns 'X' for the following board:
     *     [['X', 'O', ''],
     *      ['X', 'O', ''],
     *      ['X', '', '']]
     */
    function getWinner(board) {
        var boardString = '';
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                var cell = board[i][j];
                boardString += cell === '' ? ' ' : cell;
            }
        }
        var win_patterns = [
            'XXX......',
            '...XXX...',
            '......XXX',
            'X..X..X..',
            '.X..X..X.',
            '..X..X..X',
            'X...X...X',
            '..X.X.X..'
        ];
        for (var _i = 0, win_patterns_1 = win_patterns; _i < win_patterns_1.length; _i++) {
            var win_pattern = win_patterns_1[_i];
            var x_regexp = new RegExp(win_pattern);
            var o_regexp = new RegExp(win_pattern.replace(/X/g, 'O'));
            if (x_regexp.test(boardString)) {
                return 'X';
            }
            if (o_regexp.test(boardString)) {
                return 'O';
            }
        }
        return '';
    }
    function checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove) {
        var ret = false;
        return ret;
    }
    gameLogic.checkLegalMove = checkLegalMove;
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col with shapeId.
     * row and col is the center point of the shape.
     * shapdId is a mix of different shape and the rotation of the shape, starts from 1, 0 is a initial
     */
    function createMove(stateBeforeMove, row, col, shapeId, turnIndexBeforeMove) {
        if (shapeId < 0) {
            throw new Error("Wrong shapeid");
        }
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        var shape = getShapeFromShapeID(shapeId);
        // if the shape placement is not on the board
        if (!checkValidShapePlacement(row, col, shape)) {
        }
        var boardAction = getBoardAction(row, col, shape);
        var board = stateBeforeMove.board;
        // TODO change to checkLegalMove function checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)
        if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
            throw new Error("One can only make a move in an empty position!");
        }
        //~
        // TODO change to IsGameOver function IsGameOver(board, boardAction, turnIndexBeforeMove)
        if (getWinner(board) !== '' || isTie(board)) {
            throw new Error("Can only make a move if the game is not over!");
        }
        //~
        var boardAfterMove = angular.copy(board);
        // TODO change to shapePlacement function, shapePlacement(boardAfterMove, row, col, shapeID, turnIndexBeforeMove)
        // TODO draw the actionBoard + turnIndexBeforeMove on the board;  
        boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
        //~
        var winner = getWinner(boardAfterMove);
        var endMatchScores;
        var turnIndex;
        if (winner !== '' || isTie(boardAfterMove)) {
            // Game over.
            turnIndex = -1;
            // TODO add endScore Function, the score is measured by the blocks unused.
            endMatchScores = winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0];
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            turnIndex = 1 - turnIndexBeforeMove;
            endMatchScores = null;
        }
        // Here delta should be all the blocks covered by the new move
        var delta = { row: row, col: col, shapeId: shapeId };
        //~
        var state = { delta: delta, board: boardAfterMove };
        return { endMatchScores: endMatchScores, turnIndex: turnIndex, state: state };
    }
    gameLogic.createMove = createMove;
    function createInitialMove() {
        return {
            endMatchScores: null, turnIndex: 0,
            state: getInitialState()
        };
    }
    gameLogic.createInitialMove = createInitialMove;
    function forSimpleTestHtml() {
        /*
        var move = gameLogic.createMove(null, 0, 0, 0, 0);
        log.log("move=", move);
        */
        var shapeId = 40;
        log.log("Test input=", shapeId);
        log.log("Expeced Type=", 0);
        log.log("Expeced rotate=", 1);
        log.log("Expeced flip=", 1);
        var shape = getShapeFromShapeID(shapeId);
        log.log("frame:", shape);
        log.log("final shape:");
        console.log(tmp_printFrame(shape.frame));
        var margins = getAllMargin(shape);
        log.log("margin=", margins);
    }
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map