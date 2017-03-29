var Point = (function () {
    function Point() {
        this.toString = function () {
            return '(x: ${this.x}, y:${this.y})';
        };
    }
    return Point;
}());
var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 20; //14
    gameLogic.COLS = 20; //14
    gameLogic.OPERATIONS = 8;
    gameLogic.SHAPEHEIGHT = 5;
    gameLogic.SHAPEWIDTH = 5;
    gameLogic.SHAPENUMBER = 21;
    gameLogic.GROUPNUMBER = 4; /// 2
    // TODO change this
    gameLogic.STARTANCHOR4 = [0, gameLogic.COLS - 1, gameLogic.ROWS * (gameLogic.COLS - 1), gameLogic.ROWS * gameLogic.COLS - 1];
    gameLogic.STARTANCHOR = [0, gameLogic.ROWS * gameLogic.COLS - 1]; // [0, 14 * 14];
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
    function getInitShapeStatus() {
        var status = [];
        for (var j = 0; j < gameLogic.GROUPNUMBER; j++) {
            status[j] = [];
            for (var i = 0; i < gameLogic.SHAPENUMBER; i++) {
                status[j][i] = true;
            }
        }
        return status;
    }
    gameLogic.getInitShapeStatus = getInitShapeStatus;
    /*
    export function getTurnIdx() {
      return ....
    }
    */
    function getInitPlayerStatus() {
        return [true, true, true, true];
    }
    gameLogic.getInitPlayerStatus = getInitPlayerStatus;
    function getInitShapes() {
        var shapes = [];
        // init all shapes 
        shapes = [{
                id: 0, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 1, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 2, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 3, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 4, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '1', '1', '1', '1'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 5, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 6, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '1', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 7, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 8, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 9, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '1', '0', '0', '0'],
                    ['0', '1', '1', '1', '1'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 10, row: -1, column: -1,
                frame: [['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 11, row: -1, column: -1,
                frame: [['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '1', '1'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 12, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '1'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 13, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '0', '1', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '1', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 14, row: -1, column: -1,
                frame: [['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '0', '0']]
            },
            {
                id: 15, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 16, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '1', '0', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 17, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 18, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '1', '0'],
                    ['0', '1', '1', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 19, row: -1, column: -1,
                frame: [['0', '0', '0', '0', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '1', '1', '1', '0'],
                    ['0', '0', '1', '0', '0'],
                    ['0', '0', '0', '0', '0']]
            },
            {
                id: 20, row: -1, column: -1,
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
    function aux_printArray(frame) {
        var ret = "";
        for (var i = 0; i < frame.length; i++) {
            ret += frame[i].toString() + "\n\r";
        }
        return ret;
    }
    gameLogic.aux_printArray = aux_printArray;
    function aux_printFrame(frame, height) {
        var ret = "   0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9\n\r  ----------------------------------------\n\r";
        for (var i = 0; i < height; i++) {
            var tmp = angular.copy(frame[i]);
            for (var j = 0; j < tmp.length; j++) {
                if (tmp[j] == '') {
                    tmp[j] = ' ';
                }
            }
            if (i >= 10) {
                ret += "" + i + "|" + tmp.toString() + "|\n\r";
            }
            else {
                ret += " " + i + "|" + tmp.toString() + "|\n\r";
            }
        }
        ret += "  ----------------------------------------\n\r";
        return ret;
    }
    gameLogic.aux_printFrame = aux_printFrame;
    function aux_printCoordinator(numbers) {
        var ret = "";
        for (var i = 0; i < numbers.length; i++) {
            ret += "(" + parseIJ(numbers[i]).toString() + ")";
            ret += ", ";
        }
        return ret;
    }
    gameLogic.aux_printCoordinator = aux_printCoordinator;
    function getShapeByTypeAndOperation(shapeType, operationType) {
        var allShapes = getInitShapes();
        //log.log("shapeType:", shapeType);
        var shape = allShapes[shapeType];
        var rotation = operationType % 4;
        // only vertical flip. Horizontal flip <=> vertical flip + 180 rotation.
        var flip = Math.floor(operationType / 4);
        var retShape = angular.copy(shape);
        //log.log("shapeId=", shapeType);
        //log.log("rotation=", rotation);
        //log.log("flip=", flip);
        //log.log("origin shape")
        //console.log(aux_printFrame(shape.frame, SHAPEHEIGHT));
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
        //log.log("After flipping Allshape:")
        //console.log(aux_printFrame(retShape.frame, SHAPEHEIGHT));
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
            //console.log("Before rotation:");
            //console.log(aux_printFrame(ret, SHAPEHEIGHT));
            for (var i = 0; i < rotation; i++) {
                //console.log("Roate=", i);
                ret = rotate90(ret);
                //console.log("After rotation:");
                //console.log(aux_printFrame(ret, SHAPEHEIGHT));
            }
            return ret;
        };
        retShape.frame = rotateAny(retShape, rotation);
        //log.log("After rotation Allshape:")
        //console.log(aux_printFrame(retShape.frame, SHAPEHEIGHT));
        return retShape;
    }
    gameLogic.getShapeByTypeAndOperation = getShapeByTypeAndOperation;
    function getShapeType(shapeId) {
        return Math.floor(shapeId / gameLogic.OPERATIONS);
    }
    gameLogic.getShapeType = getShapeType;
    function getShapeOpType(shapeId) {
        return shapeId % gameLogic.OPERATIONS;
    }
    gameLogic.getShapeOpType = getShapeOpType;
    function getShapeFromShapeID(shapeId) {
        var operationType = getShapeOpType(shapeId);
        var shapeType = getShapeType(shapeId);
        return getShapeByTypeAndOperation(shapeType, operationType);
    }
    gameLogic.getShapeFromShapeID = getShapeFromShapeID;
    function getInitialState() {
        return {
            board: getInitialBoard(),
            delta: null,
            shapeStatus: getInitShapeStatus(),
            playerStatus: getInitPlayerStatus(),
        };
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
        //console.log("colSum=", colSum.toString());
        //console.log("rowSum=", rowSum.toString());
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
        var up = row;
        var left = col;
        var bottom = gameLogic.ROWS - 1 - row;
        var right = gameLogic.COLS - 1 - col;
        return up >= margins[0] && left >= margins[1] && bottom >= margins[2] && right >= margins[3];
    }
    gameLogic.checkValidShapePlacement = checkValidShapePlacement;
    function getBoardActionFromShapeID(row, col, shapeId) {
        var shape = getShapeFromShapeID(shapeId);
        return getBoardAction(row, col, shape);
    }
    gameLogic.getBoardActionFromShapeID = getBoardActionFromShapeID;
    function getBoardAction(row, col, shape) {
        var board = [];
        // fill the shape matrix into the board;
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i][j] = '';
            }
        }
        var margins = getAllMargin(shape);
        for (var i = -margins[0]; i <= margins[2]; i++) {
            for (var j = -margins[1]; j <= margins[3]; j++) {
                var val = shape.frame[Math.floor(gameLogic.SHAPEHEIGHT / 2) + i][Math.floor(gameLogic.SHAPEWIDTH / 2) + j];
                if (val == '1') {
                    board[row + i][col + j] = val;
                }
            }
        }
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
    function getRecomandAnchor(board, turnIndexBeforeMove) {
        var boundary = [];
        var diri = [-1, 0, 1, 0];
        var dirj = [0, 1, 0, -1];
        var dirj8 = [-1, 0, 1, 0, -1, -1, 1, 1];
        var diri8 = [0, 1, 0, -1, 1, -1, -1, 1];
        // get all boundary around turnIndexBeforeMove's teritory
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (("" + turnIndexBeforeMove) !== board[i][j]) {
                    continue;
                }
                for (var k = 0; k < dirj8.length; k++) {
                    var ni = i + diri8[k];
                    var nj = j + dirj8[k];
                    if (nj >= 0 && nj < gameLogic.COLS && ni >= 0 && ni < gameLogic.ROWS && board[ni][nj] == '') {
                        var hashcode = ni * gameLogic.COLS + nj;
                        if (boundary.indexOf(hashcode) == -1) {
                            boundary.push(hashcode);
                        }
                    }
                }
            }
        }
        console.log("boundary for ", turnIndexBeforeMove, ":");
        console.log(aux_printCoordinator(boundary));
        var ret = [];
        for (var k = 0; k < boundary.length; k++) {
            var j = boundary[k] % gameLogic.COLS;
            var i = Math.floor(boundary[k] / gameLogic.COLS);
            // check adjecent, if adjecent to any blocks, then unavailble
            var skip = false;
            for (var t = 0; t < diri.length; t++) {
                var nj = j + diri[t];
                var ni = i + dirj[t];
                if (nj >= 0 && nj < gameLogic.COLS && ni >= 0 && ni < gameLogic.ROWS && board[ni][nj] == ('' + turnIndexBeforeMove)) {
                    skip = true;
                    break;
                }
            }
            if (skip) {
                continue;
            }
            ret.push(i * gameLogic.COLS + j);
        }
        return ret;
    }
    gameLogic.getRecomandAnchor = getRecomandAnchor;
    function noPreviousMove(board, turnIndexBeforeMove) {
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (board[i][j] == '' + turnIndexBeforeMove) {
                    return false;
                }
            }
        }
        return true;
    }
    gameLogic.noPreviousMove = noPreviousMove;
    function parseIJ(hashcode) {
        var j = hashcode % gameLogic.COLS;
        var i = Math.floor(hashcode / gameLogic.COLS);
        return [i, j];
    }
    gameLogic.parseIJ = parseIJ;
    function checkSquareOverlap(board, boardAction) {
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (boardAction[i][j] == '') {
                    continue;
                }
                // conflict
                if (boardAction[i][j] == '1' && board[i][j] != '') {
                    return false;
                }
            }
        }
        return true;
    }
    gameLogic.checkSquareOverlap = checkSquareOverlap;
    function checkSquareAdj(board, boardAction, turnIndexBeforeMove) {
        var diri = [0, -1, 0, 1];
        var dirj = [-1, 0, 1, 0];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (boardAction[i][j] == '') {
                    continue;
                }
                // adjecent
                for (var k = 0; k < dirj.length; k++) {
                    var ni = i + diri[k];
                    var nj = j + dirj[k];
                    if (nj >= 0 && nj < gameLogic.COLS && ni >= 0 && ni < gameLogic.ROWS
                        && boardAction[ni][nj] != '1'
                        && board[ni][nj] == ('' + turnIndexBeforeMove)) {
                        console.log("points at (", i, ",", j, ") adjacent with:(", ni, ",", nj, ")");
                        return false;
                    }
                }
            }
        }
        return true;
    }
    gameLogic.checkSquareAdj = checkSquareAdj;
    function getBoardAnchor(board, turnIndexBeforeMove) {
        var boardAnchor = [];
        // fill the shape matrix into the board;
        for (var i = 0; i < gameLogic.ROWS; i++) {
            boardAnchor[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                boardAnchor[i][j] = '';
            }
        }
        var possibleAnchors = gameLogic.getPossibleAnchor(board, turnIndexBeforeMove);
        //console.log("[getBoardAnchor]", possibleAnchors);
        //aux_printCoordinator(possibleAnchors);
        for (var i = 0; i < possibleAnchors.length; i++) {
            var coord = gameLogic.parseIJ(possibleAnchors[i]);
            //console.log(coord);
            boardAnchor[coord[0]][coord[1]] = '1';
        }
        //console.log(aux_printFrame(boardAnchor, COLS));
        return boardAnchor;
    }
    gameLogic.getBoardAnchor = getBoardAnchor;
    function getPossibleAnchor(board, turnIndexBeforeMove) {
        var possibleAnchor = [];
        // 0. if not territory, anchor is init state
        if (noPreviousMove(board, turnIndexBeforeMove)) {
            console.log("no previous move");
            possibleAnchor.push(gameLogic.STARTANCHOR[turnIndexBeforeMove]);
        }
        else {
            possibleAnchor = getRecomandAnchor(board, turnIndexBeforeMove);
        }
        console.log(turnIndexBeforeMove);
        console.log(possibleAnchor);
        return possibleAnchor;
    }
    gameLogic.getPossibleAnchor = getPossibleAnchor;
    function checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove) {
        // 0. if not territory, anchor is init state
        var possibleAnchor = getPossibleAnchor(board, turnIndexBeforeMove);
        console.log("possible Anchors for ", turnIndexBeforeMove, " :");
        console.log(aux_printCoordinator(possibleAnchor));
        // 1.has at least one anchor
        var foundAnchor = false;
        for (var k = 0; k < possibleAnchor.length; k++) {
            var i = Math.floor(possibleAnchor[k] / gameLogic.COLS);
            var j = possibleAnchor[k] % gameLogic.COLS;
            if (boardAction[i][j] == '1') {
                foundAnchor = true;
                break;
            }
        }
        if (!foundAnchor) {
            return false;
        }
        console.log("Found anchor");
        // not conflict with existing teritory and not adjacent to teritory
        if (!checkSquareOverlap(board, boardAction) ||
            !checkSquareAdj(board, boardAction, turnIndexBeforeMove)) {
            return false;
        }
        return true;
    }
    gameLogic.checkLegalMove = checkLegalMove;
    function shapePlacement(boardAfterMove, boardAction, turnIndexBeforeMove) {
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                if (boardAction[i][j] == '1') {
                    boardAfterMove[i][j] = '' + turnIndexBeforeMove;
                }
            }
        }
    }
    gameLogic.shapePlacement = shapePlacement;
    function updateShapeStatus(shapeStatus, shapeId, turnIndexBeforeMove) {
        var ret = angular.copy(shapeStatus);
        ret[turnIndexBeforeMove][getShapeType(shapeId)] = false;
        return ret;
    }
    gameLogic.updateShapeStatus = updateShapeStatus;
    function updatePlayerStatus(playerStatus, turnIndexBeforeMove, shapeStatus, board) {
        var ret = angular.copy(playerStatus);
        // TODO check the remianing move
        return ret;
    }
    gameLogic.updatePlayerStatus = updatePlayerStatus;
    function checkLegalMoveForGame(board, row, col, turnIndexBeforeMove, shapeId) {
        console.log("[checkLegalMoveForGame]col:", col, " row", row, " SI:", shapeId);
        if (shapeId === undefined || shapeId < 0 || shapeId > 160) {
            return false;
        }
        var shape = getShapeFromShapeID(shapeId);
        if (!checkValidShapePlacement(row, col, shape)) {
            return false;
        }
        var boardAction = getBoardAction(row, col, shape);
        /*if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
          return false;
        }
        */
        if (!checkSquareOverlap(board, boardAction)) {
            return false;
        }
        return true;
    }
    gameLogic.checkLegalMoveForGame = checkLegalMoveForGame;
    /** return true if all the players die */
    function endOfMatch(playerStatus) {
        for (var i = 0; i < playerStatus.length; i++) {
            if (playerStatus[i]) {
                return false;
            }
        }
        return true;
    }
    gameLogic.endOfMatch = endOfMatch;
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
        var shapeStatus = stateBeforeMove.shapeStatus;
        if (!shapeStatus[turnIndexBeforeMove][getShapeType(shapeId)]) {
            throw new Error("Shape already been used");
        }
        var shape = getShapeFromShapeID(shapeId);
        // if the shape placement is not on the board
        // use in game.ts
        if (!checkValidShapePlacement(row, col, shape)) {
            throw new Error("Shape not on the board");
        }
        var boardAction = getBoardAction(row, col, shape);
        //console.log("boardAction:")
        //console.log(aux_printFrame(boardAction, COLS))
        var board = stateBeforeMove.board;
        var playerStatus = stateBeforeMove.playerStatus;
        //TODO export a function checkLealMove(board, row, col, turnIndexBeforeMove) // add boardAction
        if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
            throw new Error("One can only make a move in an empty position!");
        }
        // TODO change to IsGameOver function IsGameOver(board, boardAction, turnIndexBeforeMove)
        if (getWinner(board) !== '' || isTie(board)) {
            throw new Error("Can only make a move if the game is not over!");
        }
        //~
        var boardAfterMove = angular.copy(board);
        console.log("boardAfterMove:");
        console.log(aux_printFrame(boardAfterMove, gameLogic.COLS));
        shapePlacement(boardAfterMove, boardAction, turnIndexBeforeMove);
        var shapeStatusAfterMove = updateShapeStatus(shapeStatus, shapeId, turnIndexBeforeMove);
        //TODO implement the last check
        var playerStatusAferMove = updatePlayerStatus(playerStatus, turnIndexBeforeMove, shapeStatusAfterMove, boardAfterMove);
        var winner = getWinner(boardAfterMove);
        var endMatchScores;
        var turnIndex;
        // CHANGE here
        if (winner !== '' || isTie(boardAfterMove)) {
            // Game over.
            turnIndex = -1;
            // TODO add endScore Function, the score is measured by the blocks unused.
            endMatchScores = winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0];
            //~
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            // TODO change to four player
            turnIndex = 1 - turnIndexBeforeMove;
            endMatchScores = null;
        }
        //~
        // Here delta should be all the blocks covered by the new move
        var delta = { row: row, col: col, shapeId: shapeId };
        //~
        var state = {
            delta: delta,
            board: boardAfterMove,
            shapeStatus: shapeStatusAfterMove,
            playerStatus: playerStatusAferMove,
        };
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
    function transformMarginsToAbosolute(margins) {
        var ret = [];
        var CTR = Math.floor(gameLogic.SHAPEWIDTH / 2);
        ret[0] = CTR - margins[0];
        ret[1] = CTR - margins[1];
        ret[2] = CTR + margins[2];
        ret[3] = CTR + margins[3];
        return ret;
    }
    function getNextShapeFrom(shapeBoard, ColIdx) {
        var oH = shapeBoard.board.length;
        var oW = oH > 0 ? shapeBoard.board[0].length : 0;
        var start = -1;
        var i = ColIdx;
        for (; i < oW; i++) {
            var isBlank = true;
            for (var j = 0; j < oH; j++) {
                if (shapeBoard.board[j][i] === "1") {
                    isBlank = false;
                    break;
                }
            }
            if (!isBlank && start === -1) {
                start = i;
                continue;
            }
            if (isBlank && start > 0 && (i - 1 > start)) {
                return { start: start, end: i - 1 };
            }
        }
        return { start: start, end: i };
    }
    gameLogic.getNextShapeFrom = getNextShapeFrom;
    //TODO
    function getAllShapeMatrix_withWidth(width) {
        var shapeBoard = { board: [], cellToShape: [], shapeToCell: [] };
        shapeBoard.board = [];
        for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
            shapeBoard.board[i] = [];
            shapeBoard.cellToShape[i] = [];
        }
        var originSB = getAllShapeMatrix();
        var oH = originSB.board.length;
        var oW = oH > 0 ? originSB.board[0].length : 0;
        var idx = 0;
        var shapeId = 0;
        var row = 0;
        var col = 0;
        while (idx < oW) {
            var shapeIdx = getNextShapeFrom(originSB, 0);
            console.log("get ", shapeIdx.start, "-", shapeIdx.end);
            var len = shapeIdx.end - shapeIdx.start + 1;
            if (col + len >= width) {
                col = 0;
                row += gameLogic.SHAPEHEIGHT;
                for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
                    shapeBoard.board[row + i] = [];
                    shapeBoard.cellToShape[row + i] = [];
                }
            }
            for (var j = shapeIdx.start; j <= shapeIdx.end; j++) {
                for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
                    shapeBoard.board[row + i][col] = originSB.board[i][j];
                    shapeBoard.cellToShape[row + i][col] = originSB.cellToShape[i][j];
                }
                col++;
            }
            if (col < width) {
                for (var i = 0; i < gameLogic.SHAPEHEIGHT; i++) {
                    shapeBoard.board[row + i][col] = '';
                    shapeBoard.cellToShape[row + i][col] = -1;
                }
                col++;
            }
            idx = shapeIdx.end + 1;
        }
        return shapeBoard;
    }
    gameLogic.getAllShapeMatrix_withWidth = getAllShapeMatrix_withWidth;
    function getAllShapeMatrix() {
        var shapeBoard = { board: [], cellToShape: [], shapeToCell: [] };
        shapeBoard.board = [];
        var allshape = getInitShapes();
        var height = gameLogic.SHAPEHEIGHT;
        for (var i = 0; i < height; i++) {
            shapeBoard.board[i] = [];
            shapeBoard.cellToShape[i] = [];
        }
        var begin = 0;
        for (var k = 0; k < gameLogic.SHAPEHEIGHT; k++) {
            shapeBoard.board[k][begin] = '0';
            shapeBoard.cellToShape[k][begin] = -1;
        }
        begin++;
        for (var i = 0; i < allshape.length; i++) {
            var shape = allshape[i];
            var margins = getAllMargin(shape);
            var index = transformMarginsToAbosolute(margins);
            //console.log(aux_printArray(shape.frame))
            //console.log(index)
            shapeBoard.shapeToCell[i] = [];
            for (var j = index[1]; j <= index[3]; j++) {
                for (var k = 0; k < gameLogic.SHAPEHEIGHT; k++) {
                    shapeBoard.board[k][begin] = shape.frame[k][j];
                    if (shape.frame[k][j] === '1') {
                        var pos = { x: k, y: begin };
                        shapeBoard.shapeToCell[i].push(pos);
                        shapeBoard.cellToShape[k][begin] = shape.id;
                    }
                    else {
                        shapeBoard.cellToShape[k][begin] = -1;
                    }
                }
                begin++;
            }
            for (var k = 0; k < gameLogic.SHAPEHEIGHT; k++) {
                shapeBoard.board[k][begin] = '0';
                shapeBoard.cellToShape[k][begin] = -1;
            }
            begin++;
        }
        return shapeBoard;
    }
    gameLogic.getAllShapeMatrix = getAllShapeMatrix;
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
        console.log(aux_printFrame(shape.frame, gameLogic.SHAPEHEIGHT));
        var margins = getAllMargin(shape);
        log.log("margin=", margins);
        log.log(checkValidShapePlacement(0, 0, shape));
        log.log(checkValidShapePlacement(0, 1, shape));
        log.log(checkValidShapePlacement(1, 0, shape));
        log.log(checkValidShapePlacement(0, 1, shape));
        var boardAction = getBoardAction(2, 2, shape);
        console.log(aux_printFrame(boardAction, gameLogic.COLS));
    }
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
    function forSimplePlayTestHtml() {
        var board = getInitialBoard();
        var turnIndexBeforeMove = 0;
        shapePlacement(board, getBoardAction(2, 1, getShapeFromShapeID(40)), 1);
        var actionRow = [0, 4, 2, 1, 4];
        var actionCol = [1, 3, 3, 2, 5];
        var actionShapeId = [40, 40, 40, 0, 40];
        for (var i = 0; i < actionShapeId.length; i++) {
            var row = actionRow[i];
            var col = actionCol[i];
            var shapeId = actionShapeId[i];
            var shape = getShapeFromShapeID(shapeId);
            if (!checkValidShapePlacement(row, col, shape)) {
                console.log("Shape not on the board");
            }
            var boardAction = getBoardAction(row, col, shape);
            console.log("turnindex:", turnIndexBeforeMove);
            console.log("boardAction turn:", turnIndexBeforeMove, "row:", row, ", col:", col, "shape:", shapeId);
            console.log(aux_printFrame(boardAction, gameLogic.COLS));
            if (checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
                shapePlacement(board, boardAction, turnIndexBeforeMove);
                turnIndexBeforeMove = 1 - turnIndexBeforeMove;
                console.log("Board:");
                console.log(aux_printFrame(board, gameLogic.COLS));
            }
            else {
                console.log("Fail to add shape on the board. Board:");
                console.log(aux_printFrame(board, gameLogic.COLS));
            }
        }
        var shapeBoard = getAllShapeMatrix();
        console.log(aux_printArray(shapeBoard.board));
        console.log(shapeBoard.board.length, ",", shapeBoard.board[0].length);
        //let shapeBoardWWidth = getAllShapeMatrix_withWidth(20);
        //console.log(aux_printArray(shapeBoardWWidth.board));
        //console.log(shapeBoardWWidth.board.length, ",", shapeBoardWWidth.board[0].length);
        var aux_printcell = function (frame) {
            var ret = "";
            for (var i = 0; i < frame.length; i++) {
                for (var j = 0; j < frame[i].length; j++) {
                    if (frame[i][j] == undefined) {
                        frame[i][j] = " ";
                    }
                }
            }
            for (var i = 0; i < frame.length; i++) {
                ret += frame[i].toString() + "\n\r";
            }
            return ret;
        };
        console.log(aux_printcell(shapeBoard.cellToShape));
        var aux_printshape = function (frame) {
            var ret = "";
            for (var i = 0; i < frame.length; i++) {
                ret += i.toString() + ": ";
                for (var j = 0; j < frame[i].length; j++) {
                    ret += "(" + frame[i][j].x + "," + frame[i][j].y + ") ";
                }
                ret += "\n\r";
            }
            return ret;
        };
        console.log(aux_printshape(shapeBoard.shapeToCell));
    }
    gameLogic.forSimplePlayTestHtml = forSimplePlayTestHtml;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map