;
var game;
(function (game) {
    game.$rootScope = null;
    game.$timeout = null;
    // Global variables are cleared when getting updateUI.
    // I export all variables to make it easy to debug in the browser by
    // simply typing in the console, e.g.,
    // game.currentUpdateUI
    game.currentUpdateUI = null;
    game.didMakeMove = false; // You can only make one move per updateUI
    game.animationEndedTimeout = null;
    game.state = null;
    game.moveToConfirm = null;
    game.deadBoard = null;
    game.board = null;
    game.boardBeforeMove = null;
    var clickToDragPiece;
    game.hasDim = false;
    game.dim = 20; //14
    // For community games.
    game.proposals = null;
    game.yourPlayerInfo = null;
    game.shapeBoard = null;
    game.turnIdx = 0;
    game.shapeIdChosen = -1;
    game.preview = [];
    game.canConfirm = false;
    game.isYourTurn = true;
    game.anchorBoard = [];
    function init($rootScope_, $timeout_) {
        game.$rootScope = $rootScope_;
        game.$timeout = $timeout_;
        registerServiceWorker();
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        resizeGameAreaService.setWidthToHeight(0.6);
        // dragAndDropService('gameArea', handleDragEvent);
        game.gameArea = document.getElementById("gameArea");
        game.boardArea = document.getElementById("boardArea");
        game.shapeArea = document.getElementById("shapeArea");
        //TODO split the two event
        dragAndDropService.addDragListener("boardArea", handleDragEventGameArea);
        dragAndDropService.addDragListener("shapeArea", handleDragEventGameArea);
        //dragAndDropService.addDragListener("boardArea", handleDragEvent);
        gameService.setGame({
            updateUI: updateUI,
            getStateForOgImage: null,
        });
        // TODO
        game.shapeBoard = gameLogic.getAllShapeMatrix();
    }
    game.init = init;
    function getAreaSize(type) {
        var area = document.getElementById(type + "Area");
        /*
          if (type === 'shape') {
          return { width: area.offsetWidth, height: area.offsetHeight };
        }
        */
        return { width: area.clientWidth, height: area.clientHeight };
    }
    function getXYandDragTyep(clientX, clientY) {
        //TODO check if shapex and shapey is correct
        console.log("[getXYandDragTyep], clientX:", clientX, " clientY:", clientY);
        var boardX = clientX - game.gameArea.offsetLeft - game.boardArea.offsetLeft;
        var shapeX = clientX - game.gameArea.offsetLeft - game.shapeArea.offsetLeft;
        var boardY = clientY - game.gameArea.offsetTop - game.boardArea.offsetTop;
        var shapeY = clientY - game.gameArea.offsetTop - game.shapeArea.offsetTop;
        var dragType = '';
        var boardSize = getAreaSize('board');
        var shapeSize = getAreaSize('shape');
        var x, y = 0;
        if (boardX > 0 && boardX < boardSize.width && boardY > 0 && boardY < boardSize.height) {
            x = boardX;
            y = boardY;
            dragType = 'board';
            console.log("[getXYandDragTyep]board, x:", x, " y", y);
        }
        else if (shapeX < shapeSize.width && shapeY > 0 && shapeY < shapeSize.height) {
            x = shapeX;
            y = shapeY;
            dragType = 'shape';
            clearDrag('board', true);
            game.shapeIdChosen = -1;
            console.log("[getXYandDragTyep]shape, x:", x, " y", y);
        }
        else {
            console.log("[getXYandDragTyep]NOTYPE, x:", x, " y", y);
        }
        if (dragType === '') {
            clearDrag('board', false);
            clearDrag('shape', false);
        }
        return { x: x, y: y, dragType: dragType };
    }
    function getHintColor() {
        return "#FF0000";
    }
    function printBoardAnchor() {
        game.anchorBoard = gameLogic.getBoardAnchor(game.state.board, game.turnIdx);
        //console.log(gameLogic.aux_printFrame(anchorBoard, 20));
        setboardActionGroundColor(game.anchorBoard, getHintColor());
    }
    function clearBoardAnchor() {
        clearCoverBoard(game.anchorBoard, true, game.preview, true);
    }
    function handleDragEventGameArea(type, clientX, clientY) {
        if (gameLogic.endOfMatch(game.state.playerStatus)) {
            return;
        }
        if (!game.isYourTurn) {
            return;
        }
        // check if (!yourturn) return;
        var XYDrag = getXYandDragTyep(clientX, clientY);
        var x = XYDrag.x;
        var y = XYDrag.y;
        var dragType = XYDrag.dragType;
        if (dragType === '') {
            return;
        }
        var colAndRow = getRowColNum(dragType);
        var clickArea = getArea(dragType);
        var col = Math.floor(colAndRow.colsNum * x / clickArea.clientWidth);
        var row = Math.floor(colAndRow.rowsNum * y / clickArea.clientHeight);
        /*
        if (dragType === 'shape') {
          col = Math.floor(colAndRow.colsNum * x / clickArea.offsetWidth);
          row = Math.floor(colAndRow.rowsNum * y / clickArea.offsetHeight);
        }
        */
        console.log("dragType:", dragType, " col:", col, " row:", row);
        // displaying the dragging lines
        var draggingLines = document.getElementById(dragType + "DraggingLines");
        var horizontalDraggingLine = document.getElementById(dragType + "HorizontalDraggingLine");
        var verticalDraggingLine = document.getElementById(dragType + "VerticalDraggingLine");
        draggingLines.style.display = "inline";
        var centerXY = getSquareCenterXYWithType(row, col, dragType);
        verticalDraggingLine.setAttribute("x1", "" + centerXY.x);
        verticalDraggingLine.setAttribute("x2", "" + centerXY.x);
        horizontalDraggingLine.setAttribute("y1", "" + centerXY.y);
        horizontalDraggingLine.setAttribute("y2", "" + centerXY.y);
        console.log("[handleDragEventGameArea], dragtype:", dragType);
        if (dragType === 'board') {
            console.log("[handleDragEventGameArea], in board get shapeIdChosen:", game.shapeIdChosen);
            if (game.shapeIdChosen === undefined || game.shapeIdChosen == -1) {
                return;
            }
            if (!gameLogic.checkLegalMoveForGame(game.state.board, row, col, game.turnIdx, game.shapeIdChosen)) {
                clearDrag('board', false);
                game.canConfirm = false;
                return;
            }
            var boardAction = gameLogic.getBoardActionFromShapeID(row, col, game.shapeIdChosen);
            if (!angular.equals(game.preview, boardAction)) {
                clearDrag('board', false);
                console.log("set board");
                setboardActionGroundColor(boardAction, getTurnColor());
                game.preview = boardAction;
            }
            game.canConfirm = true;
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave" || type === "mouseup") {
            // drag ended
            dragDoneForBoard(row, col, dragType);
            clearDrag(dragType, false);
        }
    }
    function setSquareBackGroundColor(row, col, color) {
        document.getElementById('e2e_test_board_div_' + row + 'x' + col).style.background = color;
    }
    function setboardActionGroundColor(boardAction, color) {
        for (var i = 0; i < boardAction.length; i++) {
            for (var j = 0; j < boardAction[i].length; j++) {
                if (boardAction[i][j] === '1') {
                    setSquareBackGroundColor(i, j, color);
                }
            }
        }
    }
    function getSquareCenterXYWithType(row, col, type) {
        var size = getSquareWidthHeightWithType(type);
        return {
            x: col * size.width + size.width / 2,
            y: row * size.height + size.height / 2
        };
    }
    function getArea(type) {
        console.log("getArea:", type + "Area");
        return document.getElementById(type + "Area");
    }
    function getRowColNum(type) {
        if (type === 'board') {
            return { rowsNum: game.dim, colsNum: game.dim };
        }
        if (type === 'shape') {
            //TODO to const
            return { rowsNum: 15, colsNum: 20 };
        }
    }
    function clearCoverBoard(coverBoard, forced, otherBoard, careOther) {
        if (coverBoard === undefined) {
            return;
        }
        if (careOther &&
            (otherBoard === null ||
                otherBoard === undefined ||
                otherBoard.length != coverBoard.length ||
                otherBoard[0] === undefined ||
                otherBoard[0].length == coverBoard[0].length)) {
            careOther = false;
        }
        for (var i = 0; i < coverBoard.length; i++) {
            for (var j = 0; j < coverBoard[i].length; j++) {
                if (careOther && otherBoard[i][j] === '1') {
                    continue;
                }
                //  leave the shape on the board
                if (forced || coverBoard[i][j] === '') {
                    setSquareBackGroundColor(i, j, getBoardSquareColor(i, j));
                }
            }
        }
    }
    function clearDrag(type, forced) {
        if (type === 'board') {
            //clearBoardAnchor();
            //console.log(gameLogic.aux_printFrame(anchorBoard, 20));
            clearCoverBoard(game.preview, forced, undefined, false);
        }
        var draggingLines = document.getElementById(type + "DraggingLines");
        draggingLines.style.display = "none";
        // obsolete
        //clickToDragPiece.style.display = "none";
    }
    //TODO game.ts 92-188
    // After shape matrix is got, draw shape in board area, draggable
    function handleDragEvent(type, clientX, clientY, shapeMatrix) {
        if (!isHumanTurn() || game.passes == 2) {
            return; // if the game is over, do not display dragging effect
        }
        if (type === "touchstart" && game.moveToConfirm != null && game.deadBoard == null) {
            game.moveToConfirm = null;
            game.$rootScope.$apply();
        }
        // Center point in boardArea
        var x = clientX - game.boardArea.offsetLeft - game.gameArea.offsetLeft;
        var y = clientY - game.boardArea.offsetTop - game.gameArea.offsetTop;
        // TODO Is outside boardArea? board edges - 2
        var button = document.getElementById("button");
        if (x < 0 || x >= game.boardArea.clientWidth || y < 0 || y >= game.boardArea.clientHeight) {
            // clearClickToDrag();
            return;
        }
        // Inside boardArea. Let's find the containing square's row and col
        var col = Math.floor(game.dim * x / game.boardArea.clientWidth);
        var row = Math.floor(game.dim * y / game.boardArea.clientHeight);
        // TODO if the cell matrix is not empty, don't preview the piece
        if ((game.state.board[row][col] !== '' && game.deadBoard == null) ||
            (game.state.board[row][col] == '' && game.deadBoard != null)) {
            clearClickToDrag();
            return;
        }
        //clickToDragPiece.style.display = deadBoard == null ? "inline" : "none";
        var centerXY = getSquareCenterXY(row, col);
        // show the piece
        //let cell = document.getElementById('board' + row + 'x' + col).className = $scope.turnIndex === 0 ? 'black' : 'white';
        var topLeft = getSquareTopLeft(row, col);
        clickToDragPiece.style.left = topLeft.left + "px";
        clickToDragPiece.style.top = topLeft.top + "px";
        if (type === "touchend" || type === "touchcancel" || type === "touchleave" || type === "mouseup") {
            // drag ended
            dragDone(row, col);
        }
    }
    function clearClickToDrag() {
        clickToDragPiece.style.display = "none";
    }
    function getSquareCenterXY(row, col) {
        var size = getSquareWidthHeight();
        return {
            x: col * size.width + size.width / 2,
            y: row * size.height + size.height / 2
        };
    }
    function getSquareTopLeft(row, col) {
        var size = getSquareWidthHeight();
        return { top: row * size.height, left: col * size.width };
    }
    function getSquareWidthHeight() {
        var boardArea = document.getElementById("boardArea");
        return {
            width: boardArea.clientWidth / (game.dim),
            height: boardArea.clientHeight / (game.dim)
        };
    }
    function getSquareWidthHeightWithType(type) {
        var area = getArea(type);
        var colAndRow = getRowColNum(type);
        /*
        if (type == 'shape') {
          return {
            width: area.offsetWidth / (colAndRow.colsNum),
            height: area.offsetHeight / (colAndRow.rowsNum)
          };
        }
        */
        return {
            width: area.clientWidth / (colAndRow.colsNum),
            height: area.clientHeight / (colAndRow.rowsNum)
        };
    }
    function dragDone(row, col) {
        game.$rootScope.$apply(function () {
            if (game.deadBoard == null) {
                // moveToConfirm = {row: row, col: col};
            }
            else {
                // toggleDead(row, col);
                clearClickToDrag();
            }
        });
    }
    function getShapeNum(row, col) {
        if (row >= 0 && row < game.shapeBoard.cellToShape.length && col >= 0 && col < game.shapeBoard.cellToShape[0].length)
            return game.shapeBoard.cellToShape[row][col];
        return -1;
    }
    function shapeNumToShapeId(shapeNum) {
        if (shapeNum === -1) {
            return -1;
        }
        return shapeNum * 8;
    }
    function shapeAreaCellClicked(row, col) {
        var shapeNum = getShapeNum(row, col);
        console.log("[shapeAreaCellClicked]shapeNum:", shapeNum);
        if (!game.state.shapeStatus[game.turnIdx][shapeNum]) {
            return;
        }
        var shapeId = shapeNumToShapeId(shapeNum);
        console.log("[shapeAreaCellClicked]shapeNum:", shapeNum, " shapeIdchosen:", shapeId);
        return shapeId;
    }
    function boardAreaChooseMove(row, col) {
        if (game.shapeIdChosen === undefined || game.shapeIdChosen == -1) {
            return null;
        }
        return { row: row, col: col, shapeId: game.shapeIdChosen };
    }
    function dragDoneForBoard(row, col, dragType) {
        game.$rootScope.$apply(function () {
            if (dragType === 'board') {
                // change the board base on preview and board
                game.moveToConfirm = boardAreaChooseMove(row, col);
                console.log("[dragDoneForBoard]moveToConfirm:", game.moveToConfirm);
            }
            else if (dragType == 'shape') {
                game.shapeIdChosen = shapeAreaCellClicked(row, col);
                console.log("--------------------------");
                printBoardAnchor();
                console.log("--------------------------");
                console.log("[dragDoneForBoard]shapeIdChosen:", game.shapeIdChosen);
            }
            else {
                // toggleDead(row, col);
                clearClickToDrag();
            }
        });
    }
    //TODO
    function passClicked() {
    }
    game.passClicked = passClicked;
    //TODO
    function showConfirmButton() {
        return game.moveToConfirm != null;
    }
    game.showConfirmButton = showConfirmButton;
    function boardAreaCellClicked(row, col) {
        log.info(["Clicked on cell:", row, col]);
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!game.isYourTurn) {
            return;
        }
        if (game.shapeIdChosen === undefined || game.shapeIdChosen === -1) {
            return;
        }
        try {
            var move = gameLogic.createMove(game.state, row, col, game.shapeIdChosen, game.turnIdx);
            game.isYourTurn = false; // to prevent making another move
            //TODO make sure this is corrcet
            makeMove(move);
            game.shapeIdChosen = -1; // to reset the shape being selected
        }
        catch (e) {
            log.info(["This is an illegal move:", row, col]);
            return;
        }
    }
    function confirmClicked() {
        if (!showConfirmButton())
            return;
        log.info("confirmClicked");
        if (false) {
        }
        else {
            //confirm move
            // make move 
            clearBoardAnchor();
            boardAreaCellClicked(game.moveToConfirm.row, game.moveToConfirm.col);
            game.moveToConfirm = null;
            clearDrag('board', true);
            clearDrag('shapeArea', false);
            game.shapeIdChosen = -1;
        }
    }
    game.confirmClicked = confirmClicked;
    function registerServiceWorker() {
        // I prefer to use appCache over serviceWorker
        // (because iOS doesn't support serviceWorker, so we have to use appCache)
        // I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
        if (!window.applicationCache && 'serviceWorker' in navigator) {
            var n = navigator;
            log.log('Calling serviceWorker.register');
            n.serviceWorker.register('service-worker.js').then(function (registration) {
                log.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(function (err) {
                log.log('ServiceWorker registration failed: ', err);
            });
        }
    }
    function getTranslations() {
        return {};
    }
    function isProposal(row, col) {
        return game.proposals && game.proposals[row][col] > 0;
    }
    game.isProposal = isProposal;
    function getCellStyle(row, col) {
        if (!isProposal(row, col))
            return {};
        // proposals[row][col] is > 0
        var countZeroBased = game.proposals[row][col] - 1;
        var maxCount = game.currentUpdateUI.numberOfPlayersRequiredToMove - 2;
        var ratio = maxCount == 0 ? 1 : countZeroBased / maxCount; // a number between 0 and 1 (inclusive).
        // scale will be between 0.6 and 0.8.
        var scale = 0.6 + 0.2 * ratio;
        // opacity between 0.5 and 0.7
        var opacity = 0.5 + 0.2 * ratio;
        return {
            transform: "scale(" + scale + ", " + scale + ")",
            opacity: "" + opacity,
        };
    }
    game.getCellStyle = getCellStyle;
    function getProposalsBoard(playerIdToProposal) {
        var proposals = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            proposals[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                proposals[i][j] = 0;
            }
        }
        for (var playerId in playerIdToProposal) {
            var proposal = playerIdToProposal[playerId];
            var delta = proposal.data;
            proposals[delta.row][delta.col]++;
        }
        return proposals;
    }
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        var playerIdToProposal = params.playerIdToProposal;
        // Only one move/proposal per updateUI
        game.didMakeMove = playerIdToProposal && playerIdToProposal[game.yourPlayerInfo.playerId] != undefined;
        game.yourPlayerInfo = params.yourPlayerInfo;
        game.proposals = playerIdToProposal ? getProposalsBoard(playerIdToProposal) : null;
        if (playerIdToProposal) {
            // If only proposals changed, then return.
            // I don't want to disrupt the player if he's in the middle of a move.
            // I delete playerIdToProposal field from params (and so it's also not in currentUpdateUI),
            // and compare whether the objects are now deep-equal.
            params.playerIdToProposal = null;
            if (game.currentUpdateUI && angular.equals(game.currentUpdateUI, params))
                return;
        }
        game.currentUpdateUI = params;
        clearAnimationTimeout();
        game.state = params.state;
        if (isFirstMove()) {
            game.state = gameLogic.getInitialState();
        }
        //turnIdx = gameLogic.getTurnIdx();
        // We calculate the AI move only after the animation finishes,
        // because if we call aiService now
        // then the animation will be paused until the javascript finishes.
        game.animationEndedTimeout = game.$timeout(animationEndedCallback, 500);
    }
    game.updateUI = updateUI;
    function animationEndedCallback() {
        log.info("Animation ended");
        maybeSendComputerMove();
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            game.$timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    function maybeSendComputerMove() {
        if (!isComputerTurn())
            return;
        var currentMove = {
            endMatchScores: game.currentUpdateUI.endMatchScores,
            state: game.currentUpdateUI.state,
            turnIndex: game.currentUpdateUI.turnIndex,
        };
        var move = aiService.findComputerMove(currentMove);
        log.info("Computer move: ", move);
        makeMove(move);
    }
    function makeMove(move) {
        if (game.didMakeMove) {
            return;
        }
        game.didMakeMove = true;
        // change turnidx here
        game.turnIdx = move.turnIndex;
        if (!game.proposals) {
            gameService.makeMove(move, null);
        }
        else {
            var delta = move.state.delta;
            var myProposal = {
                data: delta,
                chatDescription: '' + (delta.row + 1) + 'x' + (delta.col + 1),
                playerInfo: game.yourPlayerInfo,
            };
            // Decide whether we make a move or not (if we have <currentCommunityUI.numberOfPlayersRequiredToMove-1> other proposals supporting the same thing).
            if (game.proposals[delta.row][delta.col] < game.currentUpdateUI.numberOfPlayersRequiredToMove - 1) {
                move = null;
            }
            gameService.makeMove(move, myProposal);
        }
    }
    function isFirstMove() {
        return !game.currentUpdateUI.state;
    }
    function yourPlayerIndex() {
        return game.currentUpdateUI.yourPlayerIndex;
    }
    function isComputer() {
        var playerInfo = game.currentUpdateUI.playersInfo[game.currentUpdateUI.yourPlayerIndex];
        // In community games, playersInfo is [].
        return playerInfo && playerInfo.playerId === '';
    }
    function isComputerTurn() {
        return isMyTurn() && isComputer();
    }
    function isHumanTurn() {
        return isMyTurn() && !isComputer();
    }
    function isMyTurn() {
        return !game.didMakeMove &&
            game.currentUpdateUI.turnIndex >= 0 &&
            game.currentUpdateUI.yourPlayerIndex === game.currentUpdateUI.turnIndex; // it's my turn
    }
    function cellClicked(row, col, shapeId) {
        log.info("Clicked on cell:", row, col, shapeId);
        if (!isHumanTurn())
            return;
        var nextMove = null;
        try {
            nextMove = gameLogic.createMove(game.state, row, col, shapeId, game.currentUpdateUI.turnIndex);
        }
        catch (e) {
            log.info(["Cell is already full in position:", row, col]);
            return;
        }
        // Move is legal, make it!
        makeMove(nextMove);
    }
    game.cellClicked = cellClicked;
    function getBoardSquareColor(row, col) {
        if (game.state.board[row][col] === '0') {
            return '#33CCFF';
        }
        else if (game.state.board[row][col] === '1') {
            return '#FF9900';
        }
        else if (game.state.board[row][col] === '2') {
            return '#FF3399';
        }
        else if (game.state.board[row][col] === '3') {
            return '#99FF33';
        }
        else {
            return '#F0F0F0';
        }
    }
    function setBoardAreaSquareStyle(row, col) {
        var color = getBoardSquareColor(row, col);
        return { background: color };
    }
    game.setBoardAreaSquareStyle = setBoardAreaSquareStyle;
    function getTurnColor() {
        var color = ['#33CCFF', '#FF9900', '#FF3399', '#99FF33'];
        return color[game.turnIdx];
    }
    function setShapeAreaSquareStyle(row, col) {
        var shapeId = game.shapeBoard.cellToShape[row][col];
        //console.log("turnidx:" + turnIdx + ":(" + row + "," + col + "):" + shapeId);
        if (shapeId != -1) {
            var color = '#C0C0C0';
            if (game.state.shapeStatus[game.turnIdx][shapeId]) {
                color = getTurnColor();
            }
            return {
                border: '1pt solid white',
                background: color
            };
        }
        return { background: '#F0F0F0' };
    }
    game.setShapeAreaSquareStyle = setShapeAreaSquareStyle;
    /*
    export function shouldShowImage(row: number, col: number): boolean {
      return state.board[row][col] !== "" || isProposal(row, col);
    }
   
   
    function isPiece(row: number, col: number, turnIndex: number, pieceKind: string): boolean {
      return state.board[row][col] === pieceKind || (isProposal(row, col) && currentUpdateUI.turnIndex == turnIndex);
    }
    
    export function isPieceX(row: number, col: number): boolean {
      return isPiece(row, col, 0, 'X');
    }
   
    export function isPieceO(row: number, col: number): boolean {
      return isPiece(row, col, 1, 'O');
    }
   
    export function shouldSlowlyAppear(row: number, col: number): boolean {
      return state.delta &&
          state.delta.row === row && state.delta.col === col;
    }
    */
})(game || (game = {}));
var app = angular.module('myApp', ['gameServices' /*,'ngScrollable'*/])
    .run(['$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        $rootScope['game'] = game;
        game.init($rootScope, $timeout);
    }]);
/*
app.controller('Demo', function ($scope:any) {
    'use strict';

    $scope.posX = 0;
    $scope.posY = 0;

    $scope.moveX = function (pixels: any) {
        $scope.posX = $scope.posX + pixels;
    };
    $scope.moveY = function (pixels : any) {
        $scope.posY = $scope.posY + pixels;
    };
    $scope.$evalAsync(function () {
        $scope.$broadcast('content.changed', 1000);
    });

    $scope.center = function () {
        $scope.posX = 600;
        $scope.posY = 410;
    };
});
*/ 
//# sourceMappingURL=game.js.map