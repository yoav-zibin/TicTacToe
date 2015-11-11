/**
 * This is the logic service for chess. The game board is represented as a
 * 2D array (9*7). All elements are listed below:
 *
 * WLion:      White Lion          BLion:      Black Lion
 * WTiger:     White Tiger         BTiger:     Black Tiger
 * WDog:       White Dog           BDog:       Black Dog
 * WCat:       White Cat           BCat:       Black Cat
 * WMouse:     White Mouse         BMouse:     Black Mouse
 * WLeopard:   White Leopard       BLeopard:   Black Leopard
 * WWolf:      White Wolf          BWolf:      Black Wolf
 * WElephant:  White Elephant      BElephant:  Black Elephant
 * WTrap:      White Trap          BTrap:      Black Trap
 * WDen:       White Home          BDen:       Black Home
 *
 * L: Land                       R: River
 *
 *
 *
 * Example - The initial state:
 *
 *        0     1     2     3     4     5     6
 * 0:  [['WLion', 'L', 'WTrap', 'WDen', 'WTrap', 'L', 'WTiger'],
 * 1:  ['L', 'WDog', 'L', 'WTrap', 'L', 'WCat', 'L'],
 * 2:  ['WMouse', 'L', 'WLeopard', 'L', 'WWolf', 'L', 'WElephant'],
 * 3:  ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
 * 4:  ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
 * 5:  ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
 * 6:  ['BElephant', 'L', 'BWolf', 'L', 'BLeopard', 'L', 'BMouse'],
 * 7:  ['L', 'BCat', 'L', 'BTrap', 'L', 'BDog', 'L'],
 * 8:  ['BTiger', 'L', 'BTrap', 'BDen', 'BTrap', 'L', 'BLion']]
 *
 * Note: The number of row and col are both zero based
 *
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * The move operation is an array consist of several parts:
 *
 * 0 - setTurn: {setTurn: {turnIndex: 0}}
 * 0 - endMatch: {endMatch: {endMatchScores: [1, 0]}}
 * 1 - setBoard: {set: {key: 'board', value: [[...], ..., [...]]}}
 * 2 - setDeltaFrom: {set: {key: 'deltaFrom', value: {row: row, col: col}}}
 * 3 - setDeltaTo: {set: {key: 'deltaTo', value: {row: row, col: col}}}
 *
 * Notes: move[0] can be either setTurn or endMatch
 *
 */
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 9;
    gameLogic.COLS = 7;
    gameLogic.BlackTraps = [{ row: 8, col: 2 }, { row: 7, col: 3 }, { row: 8, col: 4 }];
    gameLogic.WhiteTraps = [{ row: 0, col: 2 }, { row: 1, col: 3 }, { row: 0, col: 4 }];
    gameLogic.RiverPos = [{ row: 3, col: 1 }, { row: 3, col: 2 },
        { row: 3, col: 4 }, { row: 3, col: 5 }, { row: 4, col: 1 }, { row: 4, col: 2 },
        { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 5, col: 1 }, { row: 5, col: 2 },
        { row: 5, col: 4 }, { row: 5, col: 5 }];
    gameLogic.BlackDen = { row: 8, col: 3 };
    gameLogic.WhiteDen = { row: 0, col: 3 };
    /**
     * Returns the initial Jungle board, which is a 9x7 matrix containing ''.
    **/
    function getInitialBoard() {
        return [['WLion', 'L', 'WTrap', 'WDen', 'WTrap', 'L', 'WTiger'],
            ['L', 'WDog', 'L', 'WTrap', 'L', 'WCat', 'L'],
            ['WMouse', 'L', 'WLeopard', 'L', 'WWolf', 'L', 'WElephant'],
            ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
            ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
            ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
            ['BElephant', 'L', 'BWolf', 'L', 'BLeopard', 'L', 'BMouse'],
            ['L', 'BCat', 'L', 'BTrap', 'L', 'BDog', 'L'],
            ['BTiger', 'L', 'BTrap', 'BDen', 'BTrap', 'L', 'BLion']];
    }
    gameLogic.getInitialBoard = getInitialBoard;
    /**
     * Returns true if the game ended in a tie because there are no available moves for any pieces
     * Even it is almost impossible to happen in this game, I also write this function
    **/
    function isTie(board, turnIndexBeforeMove) {
        var turn = getTurn(turnIndexBeforeMove);
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                var curPiece = board[i][j];
                var curPosition = { row: i, col: j };
                if (curPiece[0] !== turn) {
                    continue;
                }
                switch (curPiece.substring(1)) {
                    case "Mouse":
                        if (canMouseMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
                            return false;
                        }
                        break;
                    case "Cat":
                        if (canCatMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
                            return false;
                        }
                        break;
                    case "Wolf":
                        if (canWolfMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
                            return false;
                        }
                        break;
                    case "Dog":
                        if (canDogMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
                            return false;
                        }
                        break;
                    case "Leopard":
                        if (canLeopardMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
                            return false;
                        }
                        break;
                    case "Tiger":
                        if (canTigerMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
                            return false;
                        }
                        break;
                    case "Lion":
                        if (canLionMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
                            return false;
                        }
                        break;
                    case "Elephant":
                        if (canElephantMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
                            return false;
                        }
                        break;
                    default: break;
                }
            }
        }
        return true;
    }
    /**
     * Returns turnIndex initial
     * 0: Black;    1: White
    **/
    function getTurn(turnIndex) {
        return (turnIndex === 0 ? 'B' : 'W');
    }
    gameLogic.getTurn = getTurn;
    /**
     * Returns Opponent's turnIndex
     * 0: Black;    1: White
    **/
    // function getOpponentTurn(turnIndex: number):string {
    //   return (turnIndex === 0 ? 'W' : 'B');
    // }
    /**
     * Returns id (int) for specific animal (string)
     * 0: Mouse;    1: Cat;    2: Wolf;    3: Dog;    4: Leopard;
     * 5: Tiger;  6: Lion;   7: Elephant
    **/
    function getIdFromAnimal(animal) {
        switch (animal) {
            case 'Mouse': return 0;
            case 'Cat': return 1;
            case 'Wolf': return 2;
            case 'Dog': return 3;
            case 'Leopard': return 4;
            case 'Tiger': return 5;
            case 'Lion': return 6;
            case 'Elephant': return 7;
        }
    }
    /**
     * Return true if the position out of board
    **/
    function isOutBoard(deltaFrom) {
        if (deltaFrom.row < 0 || deltaFrom.row >= gameLogic.ROWS
            || deltaFrom.col < 0 || deltaFrom.col >= gameLogic.COLS) {
            return true;
        }
        return false;
    }
    /**
     * Return true if the position is player's own trap
    **/
    function isOwnTrap(turnIndexBeforeMove, deltaFrom) {
        if (turnIndexBeforeMove === 0) {
            for (var _i = 0; _i < gameLogic.BlackTraps.length; _i++) {
                var trap = gameLogic.BlackTraps[_i];
                if (angular.equals(trap, deltaFrom)) {
                    return true;
                }
            }
            return false;
        }
        else if (turnIndexBeforeMove === 1) {
            for (var _a = 0; _a < gameLogic.WhiteTraps.length; _a++) {
                var trap = gameLogic.WhiteTraps[_a];
                if (angular.equals(trap, deltaFrom)) {
                    return true;
                }
            }
            return false;
        }
        else {
        }
    }
    /**
     * Return true if the position is in river
    **/
    function isInRiver(deltaFrom) {
        for (var _i = 0; _i < gameLogic.RiverPos.length; _i++) {
            var pos = gameLogic.RiverPos[_i];
            if (angular.equals(pos, deltaFrom)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Return true if the position is in Black trap
    **/
    function isBlackTrap(deltaFrom) {
        for (var _i = 0; _i < gameLogic.BlackTraps.length; _i++) {
            var pos = gameLogic.BlackTraps[_i];
            if (angular.equals(pos, deltaFrom)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Return true if the position is in White trap
    **/
    function isWhiteTrap(deltaFrom) {
        for (var _i = 0; _i < gameLogic.WhiteTraps.length; _i++) {
            var pos = gameLogic.WhiteTraps[_i];
            if (angular.equals(pos, deltaFrom)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Return true if the position is in Black trap
    **/
    function isBlackDen(deltaFrom) {
        if (angular.equals(gameLogic.BlackDen, deltaFrom)) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Return true if the position is in Black trap
    **/
    function isWhiteDen(deltaFrom) {
        if (angular.equals(gameLogic.WhiteDen, deltaFrom)) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Return true if the position is player's own den
    **/
    function isOwnDen(turnIndexBeforeMove, deltaFrom) {
        if (turnIndexBeforeMove === 0) {
            if (angular.equals(deltaFrom, gameLogic.BlackDen)) {
                return true;
            }
            return false;
        }
        else if (turnIndexBeforeMove === 1) {
            if (angular.equals(deltaFrom, gameLogic.WhiteDen)) {
                return true;
            }
            return false;
        }
        else {
        }
    }
    /**
     * Return true if the position has no chess piece
    **/
    function noChessPiece(board, deltaFrom) {
        var row = deltaFrom.row;
        var col = deltaFrom.col;
        if (board[row][col] === 'L' || board[row][col] === 'R'
            || board[row][col] === 'WTrap' || board[row][col] === 'WDen'
            || board[row][col] === 'BTrap' || board[row][col] === 'BDen') {
            return true;
        }
        return false;
    }
    /**
     * Return true if the position has player's own chess piece
    **/
    function isOwnChessPiece(board, turnIndexBeforeMove, deltaFrom) {
        var row = deltaFrom.row;
        var col = deltaFrom.col;
        if (noChessPiece(board, deltaFrom)) {
            return false;
        }
        else {
            if (board[row][col].charAt(0) === 'B' && turnIndexBeforeMove === 0) {
                return true;
            }
            if (board[row][col].charAt(0) === 'W' && turnIndexBeforeMove === 1) {
                return true;
            }
            return false;
        }
    }
    /**
     * Return the winner (either 'W' or 'B') or '' if there is no winner
    **/
    function getWinner(board) {
        if (board[gameLogic.BlackDen.row][gameLogic.BlackDen.col] !== 'BDen') {
            return 'W';
        }
        else if (board[gameLogic.WhiteDen.row][gameLogic.WhiteDen.col] !== 'WDen') {
            return 'B';
        }
        else {
            return '';
        }
    }
    /**
     * Returns the list of available positions for animal
     * that who can only move on land but not jump through river
     * include: Cat, Wolf, Dog, Leopard, Elephant
    **/
    function getLandAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom) {
        var possibleMoves = [];
        // for any animal there are at most four possible moves
        // up， down, left, right
        var upMove = { row: deltaFrom.row - 1, col: deltaFrom.col };
        var downMove = { row: deltaFrom.row + 1, col: deltaFrom.col };
        var leftMove = { row: deltaFrom.row, col: deltaFrom.col - 1 };
        var rightMove = { row: deltaFrom.row, col: deltaFrom.col + 1 };
        if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, upMove)) {
            possibleMoves.push(upMove);
        }
        if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, downMove)) {
            possibleMoves.push(downMove);
        }
        if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, leftMove)) {
            possibleMoves.push(leftMove);
        }
        if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, rightMove)) {
            possibleMoves.push(rightMove);
        }
        return possibleMoves;
    }
    /**
     * Returns true if the land animal can move to destination
     * include: Cat, Wolf, Dog, Leopard, Elephant
    **/
    function canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo) {
        // cannot out board, in river or own den
        if (isOutBoard(deltaTo) || isInRiver(deltaTo) || isOwnDen(turnIndexBeforeMove, deltaTo)) {
            return false;
        }
        // can only move one cell throw up, down, left or right direction
        if (deltaFrom.row !== deltaTo.row && deltaFrom.col !== deltaTo.col) {
            return false;
        }
        else if (deltaFrom.row === deltaTo.row) {
            if (Math.abs(deltaFrom.col - deltaTo.col) !== 1) {
                return false;
            }
        }
        else if (deltaFrom.col === deltaTo.col) {
            if (Math.abs(deltaFrom.row - deltaTo.row) !== 1) {
                return false;
            }
        }
        else if (angular.equals(deltaFrom, deltaTo)) {
            return false;
        }
        else { }
        ;
        return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
    }
    /**
     * Return true if Mouse is in the water when Lion/Tiger want to fly through river
    **/
    function isMouseOnWay(board, deltaFrom, deltaTo) {
        // move through parallel direction
        if (deltaFrom.row === deltaTo.row) {
            var temp1;
            var temp2;
            if (deltaFrom.col < deltaTo.col) {
                temp1 = board[deltaFrom.row][deltaFrom.col + 1];
                temp2 = board[deltaFrom.row][deltaFrom.col + 2];
            }
            else {
                temp1 = board[deltaFrom.row][deltaFrom.col - 1];
                temp2 = board[deltaFrom.row][deltaFrom.col - 2];
            }
            if (temp1.substring(1) === "Mouse" || temp2.substring(1) === "Mouse") {
                return true;
            }
            return false;
        }
        else {
            var temp1;
            var temp2;
            var temp3;
            if (deltaFrom.row < deltaTo.row) {
                temp1 = board[deltaFrom.row + 1][deltaFrom.col];
                temp2 = board[deltaFrom.row + 2][deltaFrom.col];
                temp3 = board[deltaFrom.row + 3][deltaFrom.col];
            }
            else {
                temp1 = board[deltaFrom.row - 1][deltaFrom.col];
                temp2 = board[deltaFrom.row - 2][deltaFrom.col];
                temp3 = board[deltaFrom.row - 3][deltaFrom.col];
            }
            if (temp1.substring(1) === "Mouse" || temp2.substring(1) === "Mouse"
                || temp3.substring(1) === "Mouse") {
                return true;
            }
            return false;
        }
    }
    /**
     * Returns the list of available positions for animal
     * that who can move on land and also jump through river
     * include: Tiger, Lion
    **/
    function getFlyAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom) {
        var possibleMoves = [];
        // for any animal there are at most four possible moves
        // up， down, left, right
        var upMove = { row: deltaFrom.row - 1, col: deltaFrom.col };
        if (isInRiver(upMove)) {
            // rat is not on the way, can fly throguh river
            if (!isMouseOnWay(board, deltaFrom, upMove)) {
                upMove.row = upMove.row - 3;
                if (canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, upMove)) {
                    possibleMoves.push(upMove);
                }
            }
        }
        else {
            if (canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, upMove)) {
                possibleMoves.push(upMove);
            }
        }
        var downMove = { row: deltaFrom.row + 1, col: deltaFrom.col };
        if (isInRiver(downMove)) {
            if (!isMouseOnWay(board, deltaFrom, downMove)) {
                downMove.row = downMove.row + 3;
                if (canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, downMove)) {
                    possibleMoves.push(downMove);
                }
            }
        }
        else {
            if (canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, downMove)) {
                possibleMoves.push(downMove);
            }
        }
        var leftMove = { row: deltaFrom.row, col: deltaFrom.col - 1 };
        if (isInRiver(leftMove)) {
            if (!isMouseOnWay(board, deltaFrom, leftMove)) {
                leftMove.col = leftMove.col - 2;
                if (canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, leftMove)) {
                    possibleMoves.push(leftMove);
                }
            }
        }
        else {
            if (canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, leftMove)) {
                possibleMoves.push(leftMove);
            }
        }
        var rightMove = { row: deltaFrom.row, col: deltaFrom.col + 1 };
        if (isInRiver(rightMove)) {
            if (!isMouseOnWay(board, deltaFrom, rightMove)) {
                rightMove.col = rightMove.col + 2;
                if (canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, rightMove)) {
                    possibleMoves.push(rightMove);
                }
            }
        }
        else {
            if (canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, rightMove)) {
                possibleMoves.push(rightMove);
            }
        }
        return possibleMoves;
    }
    /**
     * Returns true if the fly animal can move to destination
     * include: Tiger, Lion
    **/
    function canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo) {
        // cannot out board, in river or own den
        if (isOutBoard(deltaTo) || isInRiver(deltaTo) || isOwnDen(turnIndexBeforeMove, deltaTo)) {
            return false;
        }
        // can only move one cell throw up, down, left or right direction
        if (deltaFrom.row !== deltaTo.row && deltaFrom.col !== deltaTo.col) {
            return false;
        }
        else if (deltaFrom.row === deltaTo.row) {
            // no fly: diff 1     fly: diff 3
            if (Math.abs(deltaFrom.col - deltaTo.col) !== 1 && Math.abs(deltaFrom.col - deltaTo.col) !== 3) {
                return false;
            }
        }
        else if (deltaFrom.col === deltaTo.col) {
            // no fly: diff 1     fly: diff 4
            if (Math.abs(deltaFrom.row - deltaTo.row) !== 1 && Math.abs(deltaFrom.row - deltaTo.row) !== 4) {
                return false;
            }
        }
        else if (angular.equals(deltaFrom, deltaTo)) {
            return false;
        }
        else { }
        ;
        // move throw parallel direction
        if (deltaFrom.row === deltaTo.row) {
            var deltaNext;
            // move throw right direction
            if (deltaFrom.col < deltaTo.col) {
                deltaNext = { row: deltaFrom.row, col: deltaFrom.col + 1 };
                if (isInRiver(deltaNext)) {
                    if (deltaTo.col - deltaFrom.col === 1) {
                        return false;
                    }
                    else {
                        if (isMouseOnWay(board, deltaFrom, deltaTo)) {
                            return false;
                        }
                        else {
                            return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
                        }
                    }
                }
                else {
                    // fly on land is illegal
                    if (deltaTo.col - deltaFrom.col === 3) {
                        return false;
                    }
                    else {
                        return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
                    }
                }
            }
            else {
                deltaNext = { row: deltaFrom.row, col: deltaFrom.col - 1 };
                if (isInRiver(deltaNext)) {
                    if (deltaFrom.col - deltaTo.col === 1) {
                        return false;
                    }
                    else {
                        if (isMouseOnWay(board, deltaFrom, deltaTo)) {
                            return false;
                        }
                        else {
                            return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
                        }
                    }
                }
                else {
                    // fly on land is illegal
                    if (deltaFrom.col - deltaTo.col === 3) {
                        return false;
                    }
                    else {
                        return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
                    }
                }
            }
        }
        else {
            var deltaNext;
            // move throw down direction
            if (deltaFrom.row < deltaTo.row) {
                deltaNext = { row: deltaFrom.row + 1, col: deltaFrom.col };
                if (isInRiver(deltaNext)) {
                    if (deltaTo.col - deltaFrom.col === 1) {
                        return false;
                    }
                    else {
                        if (isMouseOnWay(board, deltaFrom, deltaTo)) {
                            return false;
                        }
                        else {
                            return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
                        }
                    }
                }
                else {
                    // fly on land is illegal
                    if (deltaTo.col - deltaFrom.col === 4) {
                        return false;
                    }
                    else {
                        return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
                    }
                }
            }
            else {
                deltaNext = { row: deltaFrom.row - 1, col: deltaFrom.col };
                if (isInRiver(deltaNext)) {
                    if (deltaFrom.col - deltaTo.col === 1) {
                        return false;
                    }
                    else {
                        if (isMouseOnWay(board, deltaFrom, deltaTo)) {
                            return false;
                        }
                        else {
                            return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
                        }
                    }
                }
                else {
                    // fly on land is illegal
                    if (deltaFrom.col - deltaTo.col === 4) {
                        return false;
                    }
                    else {
                        return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
                    }
                }
            }
        }
    }
    /**
     * Returns the list of available positions for animal
     * that who can move on land and also swim in river
     * include: Mouse
    **/
    function getSwimAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom) {
        var possibleMoves = [];
        // for any animal there are at most four possible moves
        // up， down, left, right
        var upMove = { row: deltaFrom.row - 1, col: deltaFrom.col };
        var downMove = { row: deltaFrom.row + 1, col: deltaFrom.col };
        var leftMove = { row: deltaFrom.row, col: deltaFrom.col - 1 };
        var rightMove = { row: deltaFrom.row, col: deltaFrom.col + 1 };
        if (canSwimAnimalMove(board, turnIndexBeforeMove, deltaFrom, upMove)) {
            possibleMoves.push(upMove);
        }
        if (canSwimAnimalMove(board, turnIndexBeforeMove, deltaFrom, downMove)) {
            possibleMoves.push(downMove);
        }
        if (canSwimAnimalMove(board, turnIndexBeforeMove, deltaFrom, leftMove)) {
            possibleMoves.push(leftMove);
        }
        if (canSwimAnimalMove(board, turnIndexBeforeMove, deltaFrom, rightMove)) {
            possibleMoves.push(rightMove);
        }
        return possibleMoves;
    }
    /**
     * Returns true if the fly animal can move to destination
     * include: Tiger, Lion
    **/
    function canSwimAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo) {
        // cannot out board, in river or own den
        if (isOutBoard(deltaTo) || isOwnDen(turnIndexBeforeMove, deltaTo)) {
            return false;
        }
        // can only move one cell throw up, down, left or right direction
        if (deltaFrom.row !== deltaTo.row && deltaFrom.col !== deltaTo.col) {
            return false;
        }
        else if (deltaFrom.row === deltaTo.row) {
            if (Math.abs(deltaFrom.col - deltaTo.col) !== 1) {
                return false;
            }
        }
        else if (deltaFrom.col === deltaTo.col) {
            if (Math.abs(deltaFrom.row - deltaTo.row) !== 1) {
                return false;
            }
        }
        else if (angular.equals(deltaFrom, deltaTo)) {
            return false;
        }
        else { }
        ;
        return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
    }
    /**
     * Returns true if can move
     * for final compare: no chess piece there or has chess piece there
    **/
    function canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo) {
        // no chess piece there
        if (noChessPiece(board, deltaTo)) {
            return true;
        }
        else {
            // the chess there is opponent's
            if (!isOwnChessPiece(board, turnIndexBeforeMove, deltaTo)) {
                // player's animal can only be Mouse
                var playerAnimal = board[deltaFrom.row][deltaFrom.col];
                var opponentAnimal = board[deltaTo.row][deltaTo.col];
                var playerAnimalID = getIdFromAnimal(playerAnimal.substring(1));
                var opponentAnimalID = getIdFromAnimal(opponentAnimal.substring(1));
                // opponent's animal is in player's trap
                if (isOwnTrap(turnIndexBeforeMove, deltaTo)) {
                    return true;
                }
                else {
                    // Elephant and Mouse is special
                    if (playerAnimalID >= opponentAnimalID) {
                        if (playerAnimalID === 7 && opponentAnimalID === 0) {
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                    else {
                        if (playerAnimalID === 0 && opponentAnimalID === 7) {
                            // the Mouse in river cannot eat Elephant on the land
                            // only Mouse on the land can eat Elephant
                            if (isInRiver(deltaFrom)) {
                                return false;
                            }
                            else {
                                return true;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                }
            }
            else {
                return false;
            }
        }
    }
    /**
     * Returns the list of available positions for Elephant to move
    **/
    function getElephantPossibleMoves(board, turnIndexBeforeMove, deltaFrom) {
        var possibleMoves = getLandAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
        return possibleMoves;
    }
    gameLogic.getElephantPossibleMoves = getElephantPossibleMoves;
    /**
     * Returns true if Elephant can move
    **/
    function canElephantMoveAnywhere(board, turnIndexBeforeMove, deltaFrom) {
        return getElephantPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
    }
    gameLogic.canElephantMoveAnywhere = canElephantMoveAnywhere;
    /**
     * Returns the list of available positions for Lion to move
    **/
    function getLionPossibleMoves(board, turnIndexBeforeMove, deltaFrom) {
        var possibleMoves = getFlyAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
        return possibleMoves;
    }
    gameLogic.getLionPossibleMoves = getLionPossibleMoves;
    /**
     * Returns true if Lion can move
    **/
    function canLionMoveAnywhere(board, turnIndexBeforeMove, deltaFrom) {
        return getLionPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
    }
    gameLogic.canLionMoveAnywhere = canLionMoveAnywhere;
    /**
     * Returns the list of available positions for Tiger to move
    **/
    function getTigerPossibleMoves(board, turnIndexBeforeMove, deltaFrom) {
        var possibleMoves = getFlyAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
        return possibleMoves;
    }
    gameLogic.getTigerPossibleMoves = getTigerPossibleMoves;
    /**
     * Returns true if Tiger can move
    **/
    function canTigerMoveAnywhere(board, turnIndexBeforeMove, deltaFrom) {
        return getTigerPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
    }
    gameLogic.canTigerMoveAnywhere = canTigerMoveAnywhere;
    /**
     * Returns the list of available positions for Leopard to move
    **/
    function getLeopardPossibleMoves(board, turnIndexBeforeMove, deltaFrom) {
        var possibleMoves = getLandAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
        return possibleMoves;
    }
    gameLogic.getLeopardPossibleMoves = getLeopardPossibleMoves;
    /**
     * Returns true if Leopard can move
    **/
    function canLeopardMoveAnywhere(board, turnIndexBeforeMove, deltaFrom) {
        return getLeopardPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
    }
    gameLogic.canLeopardMoveAnywhere = canLeopardMoveAnywhere;
    /**
     * Returns the list of available positions for Dog to move
    **/
    function getDogPossibleMoves(board, turnIndexBeforeMove, deltaFrom) {
        var possibleMoves = getLandAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
        return possibleMoves;
    }
    gameLogic.getDogPossibleMoves = getDogPossibleMoves;
    /**
     * Returns true if Dog can move
    **/
    function canDogMoveAnywhere(board, turnIndexBeforeMove, deltaFrom) {
        return getDogPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
    }
    gameLogic.canDogMoveAnywhere = canDogMoveAnywhere;
    /**
     * Returns the list of available positions for Wolf to move
    **/
    function getWolfPossibleMoves(board, turnIndexBeforeMove, deltaFrom) {
        var possibleMoves = getLandAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
        return possibleMoves;
    }
    gameLogic.getWolfPossibleMoves = getWolfPossibleMoves;
    /**
     * Returns true if Wolf can move
    **/
    function canWolfMoveAnywhere(board, turnIndexBeforeMove, deltaFrom) {
        return getWolfPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
    }
    gameLogic.canWolfMoveAnywhere = canWolfMoveAnywhere;
    /**
     * Returns the list of available positions for Cat to move
    **/
    function getCatPossibleMoves(board, turnIndexBeforeMove, deltaFrom) {
        var possibleMoves = getLandAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
        return possibleMoves;
    }
    gameLogic.getCatPossibleMoves = getCatPossibleMoves;
    /**
     * Returns true if Cat can move
    **/
    function canCatMoveAnywhere(board, turnIndexBeforeMove, deltaFrom) {
        return getCatPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
    }
    gameLogic.canCatMoveAnywhere = canCatMoveAnywhere;
    /**
     * Returns the list of available positions for Mouse to move
    **/
    function getMousePossibleMoves(board, turnIndexBeforeMove, deltaFrom) {
        var possibleMoves = getSwimAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
        return possibleMoves;
    }
    gameLogic.getMousePossibleMoves = getMousePossibleMoves;
    /**
     * Returns true if Mouse can move
    **/
    function canMouseMoveAnywhere(board, turnIndexBeforeMove, deltaFrom) {
        return getMousePossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
    }
    gameLogic.canMouseMoveAnywhere = canMouseMoveAnywhere;
    /**
     * Returns all the possible moves for the given board and turnIndexBeforeMove.
     * Returns an empty array if the game is over.
    **/
    // export function getPossibleMoves(board: Board, turnIndexBeforeMove: number): BoardDelta[] {
    //   var possibleMoves: BoardDelta[] = [];
    //   if(!board) {
    //     return [];
    //   }
    //   var turn = getTurn(turnIndexBeforeMove);
    //   for(var i = 0; i < ROWS; i++){
    //     for(var j = 0; j < COLS; j++){
    //       var piece = board[i][j];
    //       if(piece !== 'L' && piece !== 'R' && piece.charAt(0) === turn) {
    //         var deltaFrom: BoardDelta = {row: i, col: j};
    //         var oneCaseMoves: BoardDelta[];
    //         switch(piece.substring(1)) {
    //         case 'Elephant':
    //           oneCaseMoves = getElephantPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    //           if(oneCaseMoves.length > 0) {
    //             for(let move of oneCaseMoves) {
    //               possibleMoves.push(move);
    //             }
    //           }
    //           break;
    //         case 'Lion':
    //           oneCaseMoves = getLionPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    //           if(oneCaseMoves.length > 0) {
    //             for(let move of oneCaseMoves) {
    //               possibleMoves.push(move);
    //             }
    //           }
    //           break;
    //         case 'Tiger':
    //           oneCaseMoves = getTigerPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    //           if(oneCaseMoves.length > 0) {
    //             for(let move of oneCaseMoves) {
    //               possibleMoves.push(move);
    //             }
    //           }
    //           break;
    //         case 'Leopard':
    //           oneCaseMoves = getLeopardPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    //           if(oneCaseMoves.length > 0) {
    //             for(let move of oneCaseMoves) {
    //               possibleMoves.push(move);
    //             }
    //           }
    //           break;
    //         case 'Dog':
    //           oneCaseMoves = getDogPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    //           if(oneCaseMoves.length > 0) {
    //             for(let move of oneCaseMoves) {
    //               possibleMoves.push(move);
    //             }
    //           }
    //           break;
    //         case 'Wolf':
    //           oneCaseMoves = getWolfPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    //           if(oneCaseMoves.length > 0) {
    //             for(let move of oneCaseMoves) {
    //               possibleMoves.push(move);
    //             }
    //           }
    //           break;
    //         case 'Cat':
    //           oneCaseMoves = getCatPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    //           if(oneCaseMoves.length > 0) {
    //             for(let move of oneCaseMoves) {
    //               possibleMoves.push(move);
    //             }
    //           }
    //           break;
    //         case 'Mouse':
    //           oneCaseMoves = getMousePossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    //           if(oneCaseMoves.length > 0) {
    //             for(let move of oneCaseMoves) {
    //               possibleMoves.push(move);
    //             }
    //           }
    //           break;
    //         }
    //       }
    //     }
    //   }
    //   return possibleMoves;
    // }
    /**
     * Returns all the possible moves for the given piece.
     * Returns an empty array if the game is over.
    **/
    function getPiecePossibleMoves(board, turnIndexBeforeMove, deltaFrom) {
        var piece = board[deltaFrom.row][deltaFrom.col];
        var possibleMoves;
        switch (piece.substring(1)) {
            case 'Elephant':
                possibleMoves = getElephantPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                break;
            case 'Lion':
                possibleMoves = getLionPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                break;
            case 'Tiger':
                possibleMoves = getTigerPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                break;
            case 'Leopard':
                possibleMoves = getLeopardPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                break;
            case 'Dog':
                possibleMoves = getDogPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                break;
            case 'Wolf':
                possibleMoves = getWolfPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                break;
            case 'Cat':
                possibleMoves = getCatPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                break;
            case 'Mouse':
                possibleMoves = getMousePossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                break;
        }
        return possibleMoves;
    }
    gameLogic.getPiecePossibleMoves = getPiecePossibleMoves;
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col.
     * @deltaFrom: start position of the piece
     * @deltaTo: destination position of the piece
     * @return if the move is legal, create it; otherwise throw error
    **/
    function createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo) {
        if (!board) {
            board = getInitialBoard();
        }
        var piece = board[deltaFrom.row][deltaFrom.col];
        var destination = board[deltaTo.row][deltaTo.col];
        var turn = getTurn(turnIndexBeforeMove);
        if (deltaFrom.row === deltaTo.row && deltaFrom.col === deltaTo.col) {
            throw new Error("Cannot move to same position.");
        }
        if (destination.substring(1) === 'Den' && destination[0] === turn) {
            throw new Error("Cannot move into you own Den");
        }
        if (piece.charAt(0) !== turn) {
            // include: 'R', 'L', opponent's pieces
            if (piece === 'R' || piece === 'L') {
                throw new Error("There is no piece to move");
            }
            else {
                throw new Error("Cannot move opponent's piece");
            }
        }
        else {
            if (piece.substring(1) === 'Den' || piece.substring(1) === 'Trap') {
                throw new Error("There is no piece to move");
            }
        }
        if (getWinner(board) !== '' || isTie(board, turnIndexBeforeMove)) {
            throw new Error("Cannot make a move if the game is over!");
        }
        if (destination !== 'L' && destination !== 'R'
            && destination.substring(1) !== 'Trap' && destination.substring(1) !== 'Den') {
            if (turn === destination.charAt(0)) {
                throw new Error("One can only make a move in an empty position or capture opponent's piece!");
            }
        }
        var boardAfterMove = angular.copy(board);
        // update the board according to the moving piece
        var animal = piece.substring(1);
        switch (animal) {
            case 'Elephant':
                if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
                    if (isBlackTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BTrap';
                    }
                    else if (isWhiteTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WTrap';
                    }
                    else if (isBlackDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BDen';
                    }
                    else if (isWhiteDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WDen';
                    }
                    else {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
                    }
                    boardAfterMove[deltaTo.row][deltaTo.col] = piece;
                }
                else {
                    throw new Error("Illegal move for Elephant.");
                }
                break;
            case 'Lion':
                if (canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
                    if (isBlackTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BTrap';
                    }
                    else if (isWhiteTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WTrap';
                    }
                    else if (isBlackDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BDen';
                    }
                    else if (isWhiteDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WDen';
                    }
                    else {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
                    }
                    boardAfterMove[deltaTo.row][deltaTo.col] = piece;
                }
                else {
                    throw new Error("Illegal move for Lion.");
                }
                break;
            case 'Tiger':
                if (canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
                    if (isBlackTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BTrap';
                    }
                    else if (isWhiteTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WTrap';
                    }
                    else if (isBlackDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BDen';
                    }
                    else if (isWhiteDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WDen';
                    }
                    else {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
                    }
                    boardAfterMove[deltaTo.row][deltaTo.col] = piece;
                }
                else {
                    throw new Error("Illegal move for Lion.");
                }
                break;
            case 'Leopard':
                if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
                    if (isBlackTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BTrap';
                    }
                    else if (isWhiteTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WTrap';
                    }
                    else if (isBlackDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BDen';
                    }
                    else if (isWhiteDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WDen';
                    }
                    else {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
                    }
                    boardAfterMove[deltaTo.row][deltaTo.col] = piece;
                }
                else {
                    throw new Error("Illegal move for Lion.");
                }
                break;
            case 'Dog':
                if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
                    if (isBlackTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BTrap';
                    }
                    else if (isWhiteTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WTrap';
                    }
                    else if (isBlackDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BDen';
                    }
                    else if (isWhiteDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WDen';
                    }
                    else {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
                    }
                    boardAfterMove[deltaTo.row][deltaTo.col] = piece;
                }
                else {
                    throw new Error("Illegal move for Lion.");
                }
                break;
            case 'Wolf':
                if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
                    if (isBlackTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BTrap';
                    }
                    else if (isWhiteTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WTrap';
                    }
                    else if (isBlackDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BDen';
                    }
                    else if (isWhiteDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WDen';
                    }
                    else {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
                    }
                    boardAfterMove[deltaTo.row][deltaTo.col] = piece;
                }
                else {
                    throw new Error("Illegal move for Lion.");
                }
                break;
            case 'Cat':
                if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
                    if (isBlackTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BTrap';
                    }
                    else if (isWhiteTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WTrap';
                    }
                    else if (isBlackDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BDen';
                    }
                    else if (isWhiteDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WDen';
                    }
                    else {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
                    }
                    boardAfterMove[deltaTo.row][deltaTo.col] = piece;
                }
                else {
                    throw new Error("Illegal move for Lion.");
                }
                break;
            case 'Mouse':
                if (canSwimAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
                    if (isInRiver(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'R';
                    }
                    else if (isBlackTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BTrap';
                    }
                    else if (isWhiteTrap(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WTrap';
                    }
                    else if (isBlackDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'BDen';
                    }
                    else if (isWhiteDen(deltaFrom)) {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'WDen';
                    }
                    else {
                        boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
                    }
                    boardAfterMove[deltaTo.row][deltaTo.col] = piece;
                }
                else {
                    throw new Error("Illegal move for Lion.");
                }
                break;
            default:
                throw new Error("Unknown piece type!");
        }
        var winner = getWinner(boardAfterMove);
        var firstOperation;
        if (winner !== '' || isTie(boardAfterMove, 1 - turnIndexBeforeMove)) {
            // game is over
            firstOperation = {
                endMatch: {
                    endMatchScores: winner === 'B' ? [1, 0] : winner === 'W' ? [0, 1] : [0, 0]
                }
            };
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            firstOperation = { setTurn: { turnIndex: 1 - turnIndexBeforeMove } };
        }
        return [firstOperation,
            { set: { key: 'board', value: boardAfterMove } },
            { set: { key: 'deltaFrom', value: { row: deltaFrom.row, col: deltaFrom.col } } },
            { set: { key: 'deltaTo', value: { row: deltaTo.row, col: deltaTo.col } } }];
    }
    gameLogic.createMove = createMove;
    /**
     * Check if the move is OK.
     *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     *
     * The move operation is an array consist of several parts:
     *
     * 0 - setTurn: {setTurn: {turnIndex: 0}}
     * 0 - endMatch: {endMatch: {endMatchScores: [1, 0]}}
     * 1 - setBoard: {set: {key: 'board', value: [[...], ..., [...]]}}
     * 2 - setDeltaFrom: {set: {key: 'deltaFrom', value: {row: row, col: col}}}
     * 3 - setDeltaTo: {set: {key: 'deltaTo', value: {row: row, col: col}}}
     *
     * Notes: move[0] can be either setTurn or endMatch
     *
     * @returns return true if the move is ok, otherwise false.
    **/
    function isMoveOk(params) {
        var move = params.move;
        var turnIndexBeforeMove = params.turnIndexBeforeMove;
        var stateBeforeMove = params.stateBeforeMove;
        /* We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
         * to verify that move is legal. */
        try {
            var deltaFrom = move[2].set.value;
            var deltaTo = move[3].set.value;
            var board = stateBeforeMove.board;
            var expectedMove = createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo);
            if (!angular.equals(move, expectedMove)) {
                return false;
            }
        }
        catch (e) {
            // if there are any exceptions then the move is illegal
            return false;
        }
        return true;
    }
    gameLogic.isMoveOk = isMoveOk;
})(gameLogic || (gameLogic = {}));
;var game;
(function (game) {
    var animationEnded = false;
    var canMakeMove = false;
    var isComputerTurn = false;
    var lastUpdateUI = null;
    var state = null;
    var turnIndex = null;
    game.isHelpModalShown = false;
    var shouldRotateBoard = false;
    var clickCounter = 0;
    var deltaFrom = { row: -1, col: -1 };
    var deltaTo = { row: -1, col: -1 };
    var draggingPieceAvailableMoves = [];
    var gameArea;
    var draggingLines;
    var verticalDraggingLine;
    var horizontalDraggingLine;
    var draggingPiece;
    var nextZIndex = 61;
    function init() {
        console.log("Translation of 'RULES_OF_JUNGLE' is " + translate('RULES_OF_JUNGLE'));
        resizeGameAreaService.setWidthToHeight(7 / 9);
        gameService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI
        });
        // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
        document.addEventListener("animationend", animationEndedCallback, false); // standard
        document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
        document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
        dragAndDropService.addDragListener("gameArea", handleDragEvent);
    }
    game.init = init;
    function animationEndedCallback() {
        $rootScope.$apply(function () {
            log.info("Animation ended");
            animationEnded = true;
            if (isComputerTurn) {
                sendComputerMove();
            }
        });
    }
    function sendComputerMove() {
        // gameService.makeMove(
        //   aiService.createComputerMove(state.board, turnIndex,
        //     // at most 1 second for the AI to choose a move (but might be much quicker)
        //     { millisecondsLimit: 1000 }));
        $timeout(function () {
            gameService.makeMove(aiService.createComputerMove(state.board, turnIndex, { millisecondsLimit: 800 }));
        }, 500);
    }
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        animationEnded = false;
        lastUpdateUI = params;
        state = params.stateAfterMove;
        if (!state.board) {
            state.board = gameLogic.getInitialBoard();
        }
        canMakeMove = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        turnIndex = params.turnIndexAfterMove;
        // Is it the computer's turn?
        isComputerTurn = canMakeMove && params.playersInfo[params.yourPlayerIndex].playerId === '';
        if (isComputerTurn) {
            // To make sure the player won't click something and send a move instead of the computer sending a move.
            canMakeMove = false;
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            if (!state.delta) {
                // This is the first move in the match, so
                // there is not going to be an animation, so
                // call sendComputerMove() now (can happen in ?onlyAIs mode)
                sendComputerMove();
            }
        }
        // If the play mode is not pass and play then "rotate" the board
        // for the player. Therefore the board will always look from the
        // point of view of the player in single player mode...
        if (params.playMode === "playWhite") {
            shouldRotateBoard = true;
        }
        else {
            shouldRotateBoard = false;
        }
    }
    // export function cellClicked(row: number, col: number): void {
    //   log.info(["Clicked on cell:", row, col]);
    //   if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
    //     throw new Error("Throwing the error because URL has '?throwException'");
    //   }
    //   if (!canMakeMove) {
    //     return;
    //   }
    //   try {
    //     if (clickCounter === 0) {
    //       deltaFrom.row = row;
    //       deltaFrom.col = col;
    //       clickCounter++;
    //       return;
    //     } else if (clickCounter === 1) {
    //       clickCounter = 0;
    //
    //       deltaTo.row = row;
    //       deltaTo.col = col;
    //       let move = gameLogic.createMove(state.board, lastUpdateUI.turnIndexAfterMove, deltaFrom, deltaTo);
    //
    //       canMakeMove = false;
    //       gameService.makeMove(move);
    //
    //       deltaFrom.row = -1;
    //       deltaFrom.col = -1;
    //       deltaTo.row = -1;
    //       deltaTo.col = -1;
    //     } else {
    //       throw new Error("There are something wrong for click");
    //     }
    //   } catch (e) {
    //     log.info(["Illegal movement from", row, col]);
    //     return;
    //   }
    // }
    function handleDragEvent(type, clientX, clientY) {
        gameArea = document.getElementById("gameArea");
        draggingLines = document.getElementById("draggingLines");
        verticalDraggingLine = document.getElementById("verticalDraggingLine");
        horizontalDraggingLine = document.getElementById("horizontalDraggingLine");
        var x = clientX - gameArea.offsetLeft;
        var y = clientY - gameArea.offsetTop;
        // is outside gameArea?
        if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
            draggingLines.style.display = "none";
            if (draggingPiece) {
                var size = getSquareWidthHeight();
                setDraggingPieceTopLeft({ top: y - size.height / 2, left: x - size.width / 2 });
            }
            else {
                return;
            }
        }
        else {
            // draggingLines.style.display = "inline";
            // Inside gameArea. Let's find the containing board's row and col
            var col = Math.floor(gameLogic.COLS * x / gameArea.clientWidth);
            var row = Math.floor(gameLogic.ROWS * y / gameArea.clientHeight);
            var r_col = col;
            var r_row = row;
            if (shouldRotateBoard) {
                r_row = gameLogic.ROWS - row;
                r_col = gameLogic.COLS - col;
            }
            var centerXY = getSquareCenterXY(r_row, r_col);
            verticalDraggingLine.setAttribute("x1", centerXY.width.toString());
            verticalDraggingLine.setAttribute("x2", centerXY.width.toString());
            horizontalDraggingLine.setAttribute("y1", centerXY.height.toString());
            horizontalDraggingLine.setAttribute("y2", centerXY.height.toString());
            if (type === "touchstart" && deltaFrom.row < 0 && deltaFrom.col < 0) {
                // drag start
                var curPiece = state.board[r_row][r_col];
                if (curPiece && validPiece(curPiece)) {
                    deltaFrom = { row: row, col: col };
                    draggingPiece = document.getElementById('img_' + getPieceKindId(row, col) + '_' + row + 'x' + col);
                    if (draggingPiece) {
                        draggingPiece.style['z-index'] = ++nextZIndex;
                        draggingPiece.style['width'] = '115%';
                        draggingPiece.style['height'] = '115%';
                        draggingPiece.style['position'] = 'absolute';
                    }
                    draggingPieceAvailableMoves = getDraggingPieceAvailableMoves(r_row, r_col);
                    for (var i = 0; i < draggingPieceAvailableMoves.length; i++) {
                        draggingPieceAvailableMoves[i].style['border'] = "5px solid #99FF33";
                    }
                }
            }
            if (!draggingPiece) {
                draggingLines.style.display = "none";
                return;
            }
            if (type === "touchend" || type === "touchcancel" || type === "touchleave" || type === "mouseup") {
                // drag ended
                draggingLines.style.display = "none";
                deltaTo = { row: row, col: col };
                dragDone(deltaFrom, deltaTo);
            }
            else {
                // drag continue
                setDraggingPieceTopLeft(getSquareTopLeft(row, col));
                centerXY = getSquareCenterXY(row, col);
            }
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave" || type === "mouseup") {
            // drag ended
            // return the piece to it's original style (then angular will take care to hide it).
            setDraggingPieceTopLeft(getSquareTopLeft(deltaFrom.row, deltaFrom.col));
            draggingPiece.style['width'] = '100%';
            draggingPiece.style['height'] = '100%';
            draggingPiece.style['position'] = 'absolute';
            for (var i = 0; i < draggingPieceAvailableMoves.length; i++) {
                draggingPieceAvailableMoves[i].style['border'] = "1px solid #B8860B";
            }
            deltaFrom = { row: -1, col: -1 };
            deltaTo = { row: -1, col: -1 };
            draggingPiece = null;
            draggingPieceAvailableMoves = [];
        }
    }
    game.handleDragEvent = handleDragEvent;
    function validPiece(piece) {
        if (piece === "L" || piece === "R" || piece === "WTrap" || piece === "BTrap" || piece === "WDen" || piece === "BDen") {
            return false;
        }
        var turn = gameLogic.getTurn(turnIndex);
        if (turn === piece[0]) {
            return true;
        }
        else {
            return false;
        }
    }
    function getSquareWidthHeight() {
        var res = { width: gameArea.clientWidth / gameLogic.COLS, height: gameArea.clientHeight / gameLogic.ROWS };
        return res;
    }
    function getSquareCenterXY(row, col) {
        var size = getSquareWidthHeight();
        var res = { width: col * size.width + size.width / 2, height: row * size.height + size.height / 2 };
        return res;
    }
    // this function just help to continue show the dragged piece when dragging it
    function setDraggingPieceTopLeft(topleft) {
        var originalSize = getSquareTopLeft(deltaFrom.row, deltaFrom.col);
        draggingPiece.style.left = (topleft.left - originalSize.left) + "px";
        draggingPiece.style.top = (topleft.top - originalSize.top) + "px";
    }
    function getSquareTopLeft(row, col) {
        var size = getSquareWidthHeight();
        var res = { top: row * size.height, left: col * size.width };
        return res;
    }
    function dragDone(deltaFrom, deltaTo) {
        dragDoneHandler(deltaFrom, deltaTo);
    }
    function dragDoneHandler(deltaFrom, deltaTo) {
        var msg = "Dragged piece from " + deltaFrom.row + "*" + deltaFrom.col + " to " + deltaTo.row + "*" + deltaTo.col;
        log.info(msg);
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!canMakeMove) {
            return;
        }
        // need to rotate the angle if playWhite
        if (shouldRotateBoard) {
            deltaFrom.row = gameLogic.ROWS - deltaFrom.row;
            deltaFrom.col = gameLogic.COLS - deltaFrom.col;
            deltaTo.row = gameLogic.ROWS - deltaTo.row;
            deltaTo.col = gameLogic.COLS - deltaTo.col;
        }
        try {
            var move = gameLogic.createMove(state.board, lastUpdateUI.turnIndexAfterMove, deltaFrom, deltaTo);
            canMakeMove = false;
            gameService.makeMove(move);
            log.info(["Make movement from " + deltaFrom.row + "x" + deltaFrom.col + " to " + deltaTo.row + "x" + deltaTo.col]);
        }
        catch (e) {
            log.info(["Illegal movement from " + deltaFrom.row + "x" + deltaFrom.col + " to " + deltaTo.row + "x" + deltaTo.col]);
            return;
        }
    }
    function getDraggingPieceAvailableMoves(r_row, r_col) {
        var r_deltaFrom = { row: r_row, col: r_col };
        var possibleMoves = gameLogic.getPiecePossibleMoves(state.board, lastUpdateUI.turnIndexAfterMove, r_deltaFrom);
        var tempdraggingPieceAvailableMoves = [];
        for (var _i = 0; _i < possibleMoves.length; _i++) {
            var move = possibleMoves[_i];
            var r_move = move;
            if (shouldRotateBoard) {
                r_move.row = gameLogic.ROWS - r_move.row;
                r_move.col = gameLogic.COLS - r_move.col;
            }
            var tempid = "background" + r_move.row + 'x' + r_move.col;
            tempdraggingPieceAvailableMoves.push(document.getElementById(tempid));
        }
        return tempdraggingPieceAvailableMoves;
    }
    function shouldShowImage(row, col) {
        if (shouldRotateBoard) {
            row = gameLogic.ROWS - row;
            col = gameLogic.COLS - col;
        }
        var cell = state.board[row][col];
        if (cell === 'L' || cell === 'R' || cell === 'WDen' || cell === 'BDen' || cell === 'WTrap' || cell === 'BTrap') {
            return false;
        }
        else {
            return true;
        }
    }
    game.shouldShowImage = shouldShowImage;
    function isLand(row, col) {
        return !isRiver(row, col);
    }
    game.isLand = isLand;
    function isRiver(row, col) {
        if ((row >= 3 && row <= 5 && col >= 1 && col <= 2) || (row >= 3 && row <= 5 && col >= 4 && col <= 5)) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRiver = isRiver;
    function isWTrap(row, col) {
        if ((row === 0 && col === 2) || (row === 1 && col === 3) || (row === 0 && col === 4)) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isWTrap = isWTrap;
    function isBTrap(row, col) {
        if ((row === 8 && col === 2) || (row === 7 && col === 3) || (row === 8 && col === 4)) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBTrap = isBTrap;
    function isWDen(row, col) {
        if (row === 0 && col === 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isWDen = isWDen;
    function isBDen(row, col) {
        if (row === 8 && col === 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBDen = isBDen;
    // export function shouldSlowlyAppear(row: number, col: number): boolean {
    //   if(shouldRotateBoard) {
    //     row = gameLogic.ROWS - row;
    //     col = gameLogic.COLS - col;
    //   }
    //   return !animationEnded && deltaTo.row === row && deltaTo.col === col;
    // }
    function getImageSrc(row, col) {
        if (shouldRotateBoard) {
            row = gameLogic.ROWS - row;
            col = gameLogic.COLS - col;
        }
        var cell = state.board[row][col];
        return getPieceKind(cell);
    }
    game.getImageSrc = getImageSrc;
    function getPieceKind(piece) {
        switch (piece) {
            case 'WLion': return 'imgs/WLion.gif';
            case 'WTiger': return 'imgs/WTiger.gif';
            case 'WDog': return 'imgs/WDog.gif';
            case 'WCat': return 'imgs/WCat.gif';
            case 'WMouse': return 'imgs/WMouse.gif';
            case 'WLeopard': return 'imgs/WLeopard.gif';
            case 'WWolf': return 'imgs/WWolf.gif';
            case 'WElephant': return 'imgs/WElephant.gif';
            case 'BLion': return 'imgs/BLion.gif';
            case 'BTiger': return 'imgs/BTiger.gif';
            case 'BDog': return 'imgs/BDog.gif';
            case 'BCat': return 'imgs/BCat.gif';
            case 'BMouse': return 'imgs/BMouse.gif';
            case 'BLeopard': return 'imgs/BLeopard.gif';
            case 'BWolf': return 'imgs/BWolf.gif';
            case 'BElephant': return 'imgs/BElephant.gif';
            default: return '';
        }
    }
    function getPieceKindId(row, col) {
        if (shouldRotateBoard) {
            row = gameLogic.ROWS - row;
            col = gameLogic.COLS - col;
        }
        var cell = state.board[row][col];
        if (cell === 'R' || cell === 'L' || cell === 'WDen' || cell === 'BDen' || cell === 'WTrap' || cell === 'BTrap') {
            return '';
        }
        else {
            return cell;
        }
    }
    game.getPieceKindId = getPieceKindId;
    function isBlackPiece(row, col) {
        if (shouldRotateBoard) {
            row = gameLogic.ROWS - row;
            col = gameLogic.COLS - col;
        }
        var piece = state.board[row][col];
        return piece.charAt(0) === 'B' && piece !== 'BTrap' && piece !== 'BDen';
    }
    game.isBlackPiece = isBlackPiece;
    function isWhitePiece(row, col) {
        if (shouldRotateBoard) {
            row = gameLogic.ROWS - row;
            col = gameLogic.COLS - col;
        }
        var piece = state.board[row][col];
        return piece.charAt(0) === 'W' && piece !== 'WTrap' && piece !== 'WDen';
    }
    game.isWhitePiece = isWhitePiece;
    function canSelect(row, col) {
        if (!state.board) {
            return true;
        }
        if (shouldRotateBoard) {
            row = gameLogic.ROWS - row;
            col = gameLogic.COLS - col;
        }
        var piece = state.board[row][col];
        var turn = gameLogic.getTurn(turnIndex);
        if (turn === piece.charAt(0) && piece.substring(1) !== 'Den' && piece.substring(1) !== 'Trap') {
            var temp_deltaFrom = { row: row, col: col };
            var possibleMoves = gameLogic.getPiecePossibleMoves(state.board, lastUpdateUI.turnIndexAfterMove, temp_deltaFrom);
            if (possibleMoves.length > 0) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    game.canSelect = canSelect;
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        RULES_OF_JUNGLE: "Rules of Jungle",
        RULES_SLIDE1: "There are two players, black and white. Black goes first. Each player has eight different pieces representing different animals.",
        RULES_SLIDE2: "Higher ranking pieces can capture all pieces of identical or weaker ranking. However there is one exception: The mouse may capture the elephant, while the elephant cannot capture the mouse",
        RULES_SLIDE3: "The animal ranking, from strongest to weakest, is: Elephant, Lion, Tiger, Leopard, Wolf, Dog, Cat, Mouse",
        RULES_SLIDE4: "The rat is the only animal that is allowed to go onto a water square. The rat may not capture the elephant or another rat on land directly from a water square.",
        RULES_SLIDE5: "Lions and tigers are able to leap over water (either horizontally or vertically). They cannot jump over the water when a rat is on any of the intervening water squares.",
        RULES_SLIDE6: "When a piece is in an opponent's trap, any of the opponent's pieces may capture it regardless its strength. A piece in one of its own traps is unaffected.",
        CLOSE: "Close"
    });
    game.init();
});
;var aiService;
(function (aiService) {
    /**
     * Returns all the possible moves for the given board and turnIndexBeforeMove.
     * Returns an empty array if the game is over.
    **/
    function getPossibleMoves(board, turnIndexBeforeMove) {
        var possibleMoves = [];
        if (!board) {
            return [];
        }
        var turn = gameLogic.getTurn(turnIndexBeforeMove);
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                var piece = board[i][j];
                if (piece !== 'L' && piece !== 'R' && piece.charAt(0) === turn) {
                    var deltaFrom = { row: i, col: j };
                    var oneCaseMoves;
                    switch (piece.substring(1)) {
                        case 'Elephant':
                            oneCaseMoves = gameLogic.getElephantPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _i = 0; _i < oneCaseMoves.length; _i++) {
                                    var deltaTo = oneCaseMoves[_i];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Lion':
                            oneCaseMoves = gameLogic.getLionPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _a = 0; _a < oneCaseMoves.length; _a++) {
                                    var deltaTo = oneCaseMoves[_a];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Tiger':
                            oneCaseMoves = gameLogic.getTigerPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _b = 0; _b < oneCaseMoves.length; _b++) {
                                    var deltaTo = oneCaseMoves[_b];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Leopard':
                            oneCaseMoves = gameLogic.getLeopardPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _c = 0; _c < oneCaseMoves.length; _c++) {
                                    var deltaTo = oneCaseMoves[_c];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Dog':
                            oneCaseMoves = gameLogic.getDogPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _d = 0; _d < oneCaseMoves.length; _d++) {
                                    var deltaTo = oneCaseMoves[_d];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Wolf':
                            oneCaseMoves = gameLogic.getWolfPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _e = 0; _e < oneCaseMoves.length; _e++) {
                                    var deltaTo = oneCaseMoves[_e];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Cat':
                            oneCaseMoves = gameLogic.getCatPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _f = 0; _f < oneCaseMoves.length; _f++) {
                                    var deltaTo = oneCaseMoves[_f];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Mouse':
                            oneCaseMoves = gameLogic.getMousePossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _g = 0; _g < oneCaseMoves.length; _g++) {
                                    var deltaTo = oneCaseMoves[_g];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                    }
                }
            }
        }
        return possibleMoves;
    }
    aiService.getPossibleMoves = getPossibleMoves;
    /**
     * Returns the move that the computer player should do for the given board.
     * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
     * and it has either a millisecondsLimit or maxDepth field:
     * millisecondsLimit is a time limit, and maxDepth is a depth limit.
     */
    function createComputerMove(board, playerIndex, alphaBetaLimits) {
        // We use alpha-beta search, where the search states are Jungle-Board-Game moves.
        // Recal that a Jungle-Board-Game move has 3 operations:
        // 0) endMatch or setTurn
        // 1) {set: {key: 'board', value: ...}}
        // 2) {set: {key: 'delta', value: ...}}]
        // modify the ai part
        // if the play's pieces is more than 4 then, do randomSeed
        // otherwise, use alphaBeta algorithm
        var turn = gameLogic.getTurn(playerIndex);
        var pieceCount = 0;
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                var curPiece = board[i][j];
                if (curPiece[0] === turn && curPiece.substring(1) !== "Den" && curPiece.substring(1) !== "Trap") {
                    pieceCount++;
                }
            }
        }
        if (pieceCount > 4) {
            var possibleMoves = getPossibleMoves(board, playerIndex);
            var index = Math.floor(Math.random() * possibleMoves.length);
            return possibleMoves[index];
        }
        else {
            return alphaBetaService.alphaBetaDecision([null, { set: { key: 'board', value: board } }], playerIndex, getNextStates, getStateScoreForIndex0, 
            // If you want to see debugging output in the console, then surf to game.html?debug
            window.location.search === '?debug' ? getDebugStateToString : null, alphaBetaLimits);
        }
    }
    aiService.createComputerMove = createComputerMove;
    function getStateScoreForIndex0(move, playerIndex) {
        if (move[0].endMatch) {
            var endMatchScores = move[0].endMatch.endMatchScores;
            return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
                : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
                    : 0;
        }
        return 0;
    }
    function getNextStates(move, playerIndex) {
        return getPossibleMoves(move[1].set.value, playerIndex);
    }
    function getDebugStateToString(move) {
        return "\n" + move[1].set.value.join("\n") + "\n";
    }
})(aiService || (aiService = {}));
