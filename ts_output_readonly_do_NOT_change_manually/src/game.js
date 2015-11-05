var game;
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
        gameService.makeMove(aiService.createComputerMove(state.board, turnIndex, 
        // at most 1 second for the AI to choose a move (but might be much quicker)
        { millisecondsLimit: 1000 }));
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
            draggingLines.style.display = "inline";
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
                        // draggingPiece.style['top'] = '10%';
                        // draggingPiece.style['left'] = '10%';
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
    function shouldSlowlyAppear(row, col) {
        return !animationEnded &&
            state.delta &&
            state.delta.row === row && state.delta.col === col;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
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
