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
    game.dim = 14; //20
    game.SHAPEROW = 12;
    game.SHAPECOL = 23;
    game.SHOW_HINT_COLOR = false;
    var showHintColor = game.SHOW_HINT_COLOR;
    game.BACKGROUND_COLOR = "rgb(240, 240, 240)"; //"#F0F0F0"
    game.PLAYER_1_COLOR = "#ff0066";
    game.PLAYER_2_COLOR = "#0099ff";
    game.HINT_1_COLOR = "#93FF33";
    game.HINT_2_COLOR = "#93FF33";
    game.PLAYER_1_MOVE_COLOR = "#ff4d94";
    game.PLAYER_2_MOVE_COLOR = "#66c2ff";
    game.DEFAULT_BG_USED_SHAPE = '#C0C0C0';
    game.DEFAULT_BG_NO_SHAPE = '#F0F0F0';
    // For community games.
    game.proposals = null;
    game.yourPlayerInfo = null;
    game.shapeBoard = null;
    //export let currentUpdateUI.turnIndex: number = 0;
    game.shapeIdChosen = -1;
    game.preview = [];
    game.shapePreview = [];
    game.canConfirm = false;
    game.isYourTurn = true;
    game.anchorBoard = [];
    game.moveInBoard = true;
    game.endMatchScore = [];
    game.playerStatus = [];
    game.GlobalErrorMsg = "";
    function init($rootScope_, $timeout_) {
        game.$rootScope = $rootScope_;
        game.$timeout = $timeout_;
        registerServiceWorker();
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        resizeGameAreaService.setWidthToHeight(0.5);
        // dragAndDropService('gameArea', handleDragEvent);
        game.gameArea = document.getElementById("gameArea");
        game.boardArea = document.getElementById("boardArea");
        game.shapeArea = document.getElementById("shapeArea");
        //TODO split the two event
        dragAndDropService.addDragListener("gameArea", handleDragEventGameArea);
        //dragAndDropService.addDragListener("boardArea", handleDragEventGameArea);
        //dragAndDropService.addDragListener("shapeArea", handleDragEventGameArea);
        //dragAndDropService.addDragListener("boardArea", handleDragEvent);
        gameService.setGame({
            updateUI: updateUI,
            getStateForOgImage: null,
        });
        game.shapeBoard = gameLogic.getAllShapeMatrix_hardcode();
        showHintColor = game.SHOW_HINT_COLOR;
        game.GlobalErrorMsg = "";
        game.moveInBoard = true;
        for (var p = 0; p < gameLogic.GROUPNUMBER; p++) {
            game.endMatchScore[p] = 0;
            game.playerStatus[p] = true;
        }
    }
    game.init = init;
    function getTranslations() {
        return {
            "CONFIRM": {
                "en": "Confirm",
                "zh": "确定"
            },
            "CANCEL": {
                "en": "Cancel",
                "zh": "取消"
            },
            "MODAL_NO_MOVES": {
                "en": "NO more moves",
                "zh": "无可选棋子"
            },
            "MODAL_WAIT_OPPONET": {
                "en": "Waiting for opponent's turn",
                "zh": "等待对手操作"
            },
            "MODAL_TEXT_FOR_SELECT_0": {
                "en": "Start your first move, select your piece and cover the top-left corner. Press the piece for hint positions",
                "zh": "开始你的第一步，选择一个棋子覆盖最左上角。点击棋子获得提示位置"
            },
            "MODAL_TEXT_FOR_SELECT_1": {
                "en": "Start your first move, select your piece and cover the bottom-right corner. Press the piece for hint positions",
                "zh": "开始你的第一步，选择一个棋子覆盖最右下角。点击棋子获得提示位置"
            },
            "MODAL_TEXT_SELECT_PIECE": {
                "en": "Select a piece by clicking or draging",
                "zh": "点击或拖动选择棋子"
            },
            "MODAL_TEXT_PUT_PIECE": {
                "en": "Place piece to touch your corner and never touch your side. Press the piece for hint positions",
                "zh": "角对角放置你的棋子，不能与自己的边相邻，点击棋子获得提示位置"
            }
        };
    }
    function getAreaSize(type) {
        var area = document.getElementById(type + "Area");
        /*
          if (type === 'shape') {
          return { width: area.offsetWidth, height: area.offsetHeight };
        }
        */
        return { width: area.clientWidth, height: area.clientHeight };
    }
    function getXYandDragType(clientX, clientY) {
        //console.log("[getXYandDragType], clientX:", clientX, " clientY:", clientY);
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
            //console.log("[getXYandDragType]board, x:", x, " y", y);
        }
        else if (shapeX < shapeSize.width && shapeY > 0 && shapeY < shapeSize.height) {
            x = shapeX;
            y = shapeY;
            dragType = 'shape';
            clearDrag('board', true);
            //shapeIdChosen = -1; // changed for dragging
            /*
            let newShapeId = shapeAreaCellClicked(x, y);
            if (newShapeId >= 0) {
      
              shapeIdChosen = newShapeId;
              console.log("[getXYandDragType ]Change ShapeId to", shapeIdChosen);
            }
            */
            //console.log("[getXYandDragTyep]shape, x:", x, " y", y);
        }
        else {
            //console.log("[getXYandDragTyep]NOTYPE, x:", x, " y", y);
        }
        if (dragType === '') {
            clearDrag('board', false);
            clearDrag('shape', false);
        }
        return { x: x, y: y, dragType: dragType };
    }
    function getHintColor() {
        var color = [game.HINT_1_COLOR, game.HINT_2_COLOR, '#00e600', '#ffc34d'];
        return color[game.currentUpdateUI.turnIndex];
        //return "#93FF33";
    }
    function printBoardAnchor() {
        game.anchorBoard = gameLogic.getBoardAnchor(game.state.board, game.state.anchorStatus, game.currentUpdateUI.turnIndex);
        //console.log(gameLogic.aux_printFrame(anchorBoard, 20));
        setboardHintColor(game.anchorBoard, getHintColor());
        //setboardActionGroundColor(anchorBoard, getHintColor());
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
        var XYDrag = getXYandDragType(clientX, clientY);
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
        printBoardAnchor();
        console.log("[handleDragEventGameArea], dragtype:", dragType);
        var checkValid = null;
        if (dragType === 'board') {
            game.moveInBoard = true;
            //console.log("[handleDragEventGameArea], in board get shapeIdChosen:", shapeIdChosen);
            if (game.shapeIdChosen === undefined || game.shapeIdChosen == -1) {
                return;
            }
            checkValid = gameLogic.checkLegalMoveForGame(game.state.board, row, col, game.currentUpdateUI.turnIndex, game.shapeIdChosen, false);
            //console.log("-------------checkvalid-----------", checkValid);
            //if (!checkValid.valid) {
            if (!checkValid) {
                // adjust row and col
                //if (((checkValid.error >> 1) && 0x1) == 1) {
                var newPos = gameLogic.adjustPositionByShapeId(row, col, game.shapeIdChosen);
                row = newPos[0];
                col = newPos[1];
                //}
                /*
                clearDrag('board', false);
                canConfirm = false;
                return;
                */
            }
            var boardAction = gameLogic.getBoardActionFromShapeID(row, col, game.shapeIdChosen);
            if (!angular.equals(game.preview, boardAction)) {
                clearDrag('board', false);
                //console.log("set board");
                setboardActionGroundColor(boardAction, getTurnColorForMove());
                //setboardActionGroundColor(boardAction, getTurnColor());
                game.preview = boardAction;
            }
            game.canConfirm = true;
        }
        else if (dragType === 'shape') {
            //console.log("[handleDragEventGameArea] SHAPE");
            if (game.moveInBoard) {
                var newShapeId = shapeAreaCellClicked(row, col);
                if (newShapeId >= 0) {
                    game.shapeIdChosen = newShapeId;
                    //console.log("[getXYandDragType]dragType === 'shape',Change ShapeId to", shapeIdChosen);
                }
                game.moveInBoard = false;
            }
            // add drag
            if (game.shapeIdChosen !== undefined && game.shapeIdChosen >= 0) {
                var shapeAction = gameLogic.getShapeActionFromShapeID(row, col, game.shapeIdChosen, game.SHAPEROW, game.SHAPECOL);
                if (!angular.equals(game.shapePreview, shapeAction)) {
                    //console.log(gameLogic.aux_printFrame(shapeAction, SHAPEROW));
                    clearDrag('shape', false);
                    setShapeActionGroundColor(shapeAction, getTurnColorForMove());
                    game.shapePreview = shapeAction;
                }
            }
            //  add over board adjust 
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave" || type === "mouseup") {
            // drag ended
            if (checkValid !== null) {
                //GlobalErrorMsg = gameLogic.getErrorMsg(checkValid.error);
            }
            dragDoneForBoard(row, col, dragType);
            clearDrag(dragType, false);
        }
    }
    function setSquareBackGroundColor(row, col, color) {
        document.getElementById('e2e_test_board_div_' + row + 'x' + col).style.background = color;
    }
    function getSquareBackGroundColor(row, col) {
        return document.getElementById('e2e_test_board_div_' + row + 'x' + col).style.background;
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
    function setShapeActionGroundColor(shapeAction, color) {
        for (var i = 0; i < shapeAction.length; i++) {
            for (var j = 0; j < shapeAction[i].length; j++) {
                if (shapeAction[i][j] === '1') {
                    setShapeSquareBackGroundColor(i, j, color);
                }
            }
        }
    }
    function setboardHintColor(boardAction, color) {
        for (var i = 0; i < boardAction.length; i++) {
            for (var j = 0; j < boardAction[i].length; j++) {
                //console.log(getSquareBackGroundColor(i, j));
                if (boardAction[i][j] === '1') {
                    if (showHintColor === true || getSquareBackGroundColor(i, j) === game.BACKGROUND_COLOR) {
                        setSquareBackGroundColor(i, j, color);
                    }
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
            return { rowsNum: game.SHAPEROW, colsNum: game.SHAPECOL };
        }
    }
    function setShapeSquareBackGroundColor(row, col, color) {
        document.getElementById('e2e_test_shape_div_' + row + 'x' + col).style.background = color;
    }
    function setShapeSquareBackDefaultGroundColor(row, col) {
        var shapeId = game.shapeBoard.cellToShape[row][col];
        var color = game.DEFAULT_BG_NO_SHAPE;
        //console.log("currentUpdateUI.turnIndex:" + currentUpdateUI.turnIndex + ":(" + row + "," + col + "):" + shapeId);
        if (game.shapeIdChosen !== undefined && game.shapeIdChosen >= 0 && shapeId === gameLogic.getShapeType(game.shapeIdChosen)) {
            color = getTurnColorForMove(); //getTurnColorForMove();
        }
        else if (shapeId != -1) {
            color = game.DEFAULT_BG_USED_SHAPE;
            if (game.state.shapeStatus[game.currentUpdateUI.turnIndex][shapeId]) {
                color = getTurnColor();
            }
        }
        document.getElementById('e2e_test_shape_div_' + row + 'x' + col).style.background = color;
    }
    function clearShapeCoverBoard() {
        for (var i = 0; i < game.SHAPEROW; i++) {
            for (var j = 0; j < game.SHAPECOL; j++) {
                setShapeSquareBackDefaultGroundColor(i, j);
            }
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
            clearShapeCoverBoard();
            clearCoverBoard(game.preview, forced, undefined, false);
        }
        else if (type === 'shape') {
            clearShapeCoverBoard();
        }
        var draggingLines = document.getElementById(type + "DraggingLines");
        if (draggingLines !== null && draggingLines.style !== null) {
            draggingLines.style.display = "none";
        }
        // obsolete
        //clickToDragPiece.style.display = "none";
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
        console.log("[shapeAreaCellClicked] (", row, ",", col, ") => shapeNum:", shapeNum, " ShapeIdChose:", game.shapeIdChosen);
        if (shapeNum < 0) {
            return;
        }
        if (!game.state.shapeStatus[game.currentUpdateUI.turnIndex][shapeNum]) {
            return;
        }
        var shapeId = shapeNumToShapeId(shapeNum);
        console.log("[shapeAreaCellClicked] (", row, ",", col, ") => shapeNum:", shapeNum, " shapeIdchosen:", shapeId);
        return shapeId;
    }
    function updateboardAction(row, col) {
        var boardAction = gameLogic.getBoardActionFromShapeID(row, col, game.shapeIdChosen);
        console.log(gameLogic.aux_printFrame(boardAction, game.dim));
        //if (!angular.equals(preview, boardAction)) {
        clearDrag('board', true);
        console.log("set board");
        console.log(gameLogic.aux_printFrame(game.preview, game.dim));
        console.log(gameLogic.aux_printFrame(boardAction, game.dim));
        //clearPreview
        //setboardActionGroundColor(boardAction, getTurnColor());
        setboardActionGroundColor(boardAction, getTurnColorForMove());
        game.preview = boardAction;
        //}
        game.canConfirm = true;
    }
    function boardAreaChooseMove(row, col) {
        if (game.shapeIdChosen === undefined || game.shapeIdChosen == -1) {
            return null;
        }
        // TODO: check legal and hint here
        if (gameLogic.checkLegalMoveForGame(game.state.board, row, col, game.currentUpdateUI.turnIndex, game.shapeIdChosen, false)) {
            return { row: row, col: col, shapeId: game.shapeIdChosen };
        }
        return null;
    }
    function dragDoneForBoard(row, col, dragType) {
        game.$rootScope.$apply(function () {
            if (dragType === 'board') {
                // change the board base on preview and board
                game.moveToConfirm = boardAreaChooseMove(row, col);
                console.log("[dragDoneForBoard]moveToConfirm:", game.moveToConfirm);
            }
            else if (dragType == 'shape') {
                var newShapeId = shapeAreaCellClicked(row, col);
                if (newShapeId >= 0) {
                    game.shapeIdChosen = newShapeId;
                    console.log("[dragDoneForBoard ]Change ShapeId to", game.shapeIdChosen);
                }
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
    function clearClickToDrag() {
        game.moveToConfirm = null;
        clearDrag('board', true);
        clearDrag('shapeArea', false);
        game.shapeIdChosen = -1;
        console.log("[clearClickToDrag]Change ShapeId to", game.shapeIdChosen);
    }
    game.clearClickToDrag = clearClickToDrag;
    function isCancelBtnEnabled() {
        return true;
    }
    game.isCancelBtnEnabled = isCancelBtnEnabled;
    //TODO
    function cancelClicked() {
        clearClickToDrag();
    }
    game.cancelClicked = cancelClicked;
    function showConfirmButton() {
        return isMyTurn() && checkLegal();
    }
    game.showConfirmButton = showConfirmButton;
    function showCancelButton() {
        // TODO only show cancel when some block is chosen
        return isMyTurn();
    }
    game.showCancelButton = showCancelButton;
    /*
    export function showRotateAndFlip() {
      return moveToConfirm !== null; // TODO check flip state
    }
    */
    function showHintBtn() {
        return isMyTurn();
    }
    game.showHintBtn = showHintBtn;
    function showRotateLeft() {
        return isMyTurn() && (game.moveToConfirm !== null); // TODO check flip state
    }
    game.showRotateLeft = showRotateLeft;
    function showRotateRight() {
        return isMyTurn() && (game.moveToConfirm !== null); // TODO check flip state
    }
    game.showRotateRight = showRotateRight;
    function showFlip() {
        return isMyTurn() && (game.moveToConfirm !== null); // TODO check flip state
    }
    game.showFlip = showFlip;
    function checkLegal() {
        return game.moveToConfirm !== null && gameLogic.checkLegalMoveForGame(game.state.board, game.moveToConfirm.row, game.moveToConfirm.col, game.currentUpdateUI.turnIndex, game.moveToConfirm.shapeId, true);
    }
    game.checkLegal = checkLegal;
    function getHint() {
        console.log("state");
        console.log(game.state);
        clearDrag('board', true);
        //let nextmove = gameLogic.getNextPossibleShape(state.anchorStatus, state.board, state.shapeStatus, currentUpdateUI.turnIndex);
        var anchorStatus = angular.copy(game.state.anchorStatus);
        var nextmoves = gameLogic.getNextPossibleMoveList(anchorStatus, game.state.board, game.state.shapeStatus, game.currentUpdateUI.turnIndex);
        console.log("HINT nextmove");
        console.log(nextmoves);
        if (nextmoves.valid) {
            var pick = -1;
            var theNextMove = null;
            if (game.shapeIdChosen != undefined && game.shapeIdChosen > 0) {
                var readyList = [];
                for (var i = 0; i < nextmoves.moves.length; i++) {
                    if (gameLogic.getShapeType(nextmoves.moves[i].shapeId) == gameLogic.getShapeType(game.shapeIdChosen)) {
                        readyList.push(i);
                    }
                }
                if (readyList.length > 0) {
                    var randPos = Math.floor(Math.random() * readyList.length);
                    pick = readyList[randPos];
                    theNextMove = nextmoves.moves[pick];
                }
            }
            if (pick == -1) {
                var optMoves = gameLogic.sortMoves(nextmoves.moves);
                theNextMove = optMoves[0];
                //pick = Math.floor(Math.random() * nextmoves.moves.length);
                //theNextMove = nextmoves.moves[pick];
            }
            game.moveToConfirm = {
                row: theNextMove.row,
                col: theNextMove.col,
                shapeId: theNextMove.shapeId
            };
            console.log("random pick");
            console.log(game.moveToConfirm);
            //TODO here find suitable or random one
            // TODO auto draw
            try {
                if (game.moveToConfirm == null) {
                    return;
                }
                game.shapeIdChosen = game.moveToConfirm.shapeId;
                // draw preview
                /*
                let boardAction = gameLogic.getBoardActionFromShapeID(moveToConfirm.row, moveToConfirm.col, moveToConfirm.shapeId);
                if (!angular.equals(preview, boardAction)) {
                  clearDrag('board', false);
                  console.log("set board");
                  setboardActionGroundColor(boardAction, getTurnColorForMove());
                  preview = boardAction;
                }
                */
                updateboardAction(game.moveToConfirm.row, game.moveToConfirm.col);
                printBoardAnchor();
                dragDoneForBoard(game.moveToConfirm.row, game.moveToConfirm.col, 'board');
            }
            catch (e) {
                console.log("EXCEPTION!:", game.moveToConfirm);
            }
        }
    }
    game.getHint = getHint;
    function getCurrentMsg() {
        var turnIdx = game.currentUpdateUI.turnIndex;
        if (game.playerStatus[turnIdx] === false) {
            return 'MODAL_NO_MOVES';
        }
        if (!isMyTurn()) {
            return 'MODAL_WAIT_OPPONET';
        }
        if (game.endMatchScore[turnIdx] == 0) {
            return 'MODAL_TEXT_FOR_SELECT_' + turnIdx;
        }
        if (game.moveToConfirm === null) {
            return 'MODAL_TEXT_SELECT_PIECE';
        }
        if (game.moveToConfirm !== null) {
            return 'MODAL_TEXT_PUT_PIECE';
        }
    }
    game.getCurrentMsg = getCurrentMsg;
    function newlyPlaced(row, col) {
        /*for the initial state, there is no newly added square*/
        if (game.preview === undefined || game.preview.length <= 0) {
            return false;
        }
        if (game.preview[row][col] === '1') {
            return true;
        }
        return false;
    }
    game.newlyPlaced = newlyPlaced;
    function shapeNewlyPlaced(row, col) {
        if (game.shapeBoard === undefined || game.shapeBoard.cellToShape.length <= 0) {
            return false;
        }
        if (game.shapeIdChosen >= 0 && game.shapeBoard.cellToShape[row][col] === gameLogic.getShapeType(game.shapeIdChosen)) {
            return true;
        }
        return false;
    }
    game.shapeNewlyPlaced = shapeNewlyPlaced;
    function getShapeIdAfter(right, left, flip) {
        if (game.shapeIdChosen === undefined || game.shapeIdChosen < 0) {
            return -1;
        }
        var originShapeId = gameLogic.getShapeType(game.shapeIdChosen);
        var operationType = gameLogic.getShapeOpType(game.shapeIdChosen);
        var rotation = operationType % 4;
        // only vertical flip. Horizontal flip <=> vertical flip + 180 rotation.
        var currentFlip = operationType >= 4;
        if (flip) {
            currentFlip = !currentFlip;
        }
        var addon = 0;
        if (left) {
            addon++;
        }
        if (right) {
            addon--;
        }
        if (currentFlip) {
            addon = -addon;
        }
        rotation = (rotation + addon + 4) % 4;
        game.shapeIdChosen = gameLogic.getShapeId(originShapeId, rotation, currentFlip);
        return game.shapeIdChosen;
    }
    function RotateAndFlip(left, right, flip) {
        if (!(showFlip() || showRotateLeft() || showRotateRight())) {
            return;
        }
        var row = game.moveToConfirm.row;
        var col = game.moveToConfirm.col;
        var shapeId = game.moveToConfirm.shapeId;
        // TODO change shapeId
        getShapeIdAfter(left, right, flip);
        var newPos = gameLogic.adjustPositionByShapeId(row, col, game.shapeIdChosen);
        row = newPos[0];
        col = newPos[1];
        updateboardAction(row, col);
        //
        printBoardAnchor();
        //~
        dragDoneForBoard(row, col, 'board');
    }
    game.RotateAndFlip = RotateAndFlip;
    function flip() {
        RotateAndFlip(false, false, true);
    }
    game.flip = flip;
    function rotateLeft() {
        RotateAndFlip(true, false, false);
    }
    game.rotateLeft = rotateLeft;
    function rotateRight() {
        RotateAndFlip(false, true, false);
    }
    game.rotateRight = rotateRight;
    var cacheIntegersTill = [];
    function getIntegersTill(number) {
        if (cacheIntegersTill[number])
            return cacheIntegersTill[number];
        var res = [];
        for (var i = 0; i < number; i++) {
            res.push(i);
        }
        cacheIntegersTill[number] = res;
        return res;
    }
    game.getIntegersTill = getIntegersTill;
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
            var move = gameLogic.createMove(game.state, row, col, game.shapeIdChosen, game.currentUpdateUI.turnIndex);
            game.isYourTurn = false; // to prevent making another move
            //TODO make sure this is corrcet
            makeMove(move);
            game.shapeIdChosen = -1; // to reset the shape being selected
            console.log("[boardAreaCellClicked] Change ShapeId to", game.shapeIdChosen);
        }
        catch (e) {
            log.info(e);
            log.info(["This is an illegal move:", row, col]);
            return;
        }
    }
    function confirmClicked() {
        if (!showConfirmButton()) {
            return;
        }
        log.info("confirmClicked");
        if (false) {
        }
        else {
            //confirm move
            // make move 
            clearBoardAnchor();
            boardAreaCellClicked(game.moveToConfirm.row, game.moveToConfirm.col);
            clearClickToDrag();
            //GlobalErrorMsg = "";
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
        // change score and update user status
        game.endMatchScore = angular.copy(gameLogic.getScore(game.state.board));
        game.playerStatus = angular.copy(game.state.playerStatus);
        for (var p = 0; p < game.endMatchScore.length; p++) {
            //document.getElementById("p" + p + "_score").innerHTML = "Score:" + endMatchScore[p] + "";
        }
        /*
        for (let p = 0; p < playerStatus.length; p++) {
          if (playerStatus[p] === false) {
            document.getElementById("p" + p + "_status").innerText = "No more moves for player " + (p+1);
          } else {
            document.getElementById("p" + p + "_status").innerText = "Go on player " + (p+1);
          }
        }
        */
        game.isYourTurn = isMyTurn();
        //currentUpdateUI.turnIndex = gameLogic.getcurrentUpdateUI.turnIndex();
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
        if (move === undefined) {
            return;
        }
        game.didMakeMove = true;
        // change currentUpdateUI.turnIndex here
        game.currentUpdateUI.turnIndex = move.turnIndex;
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
            return game.PLAYER_1_COLOR;
        }
        else if (game.state.board[row][col] === '1') {
            return game.PLAYER_2_COLOR;
        }
        else if (game.state.board[row][col] === '2') {
            return '#00e600';
        }
        else if (game.state.board[row][col] === '3') {
            return '#ffc34d';
        }
        else {
            return game.BACKGROUND_COLOR;
        }
    }
    function setBoardAreaSquareStyle(row, col) {
        var color = getBoardSquareColor(row, col);
        return { background: color };
    }
    game.setBoardAreaSquareStyle = setBoardAreaSquareStyle;
    function getTurnColor() {
        var color = [game.PLAYER_1_COLOR, game.PLAYER_2_COLOR, '#00e600', '#ffc34d'];
        return color[game.currentUpdateUI.turnIndex];
    }
    function getTurnColorForMove() {
        var color = [game.PLAYER_1_MOVE_COLOR, game.PLAYER_2_MOVE_COLOR, '#00e600', '#ffc34d'];
        return color[game.currentUpdateUI.turnIndex];
    }
    function setShapeAreaSquareStyle(row, col) {
        var shapeId = game.shapeBoard.cellToShape[row][col];
        //console.log("currentUpdateUI.turnIndex:" + currentUpdateUI.turnIndex + ":(" + row + "," + col + "):" + shapeId);
        if (shapeId != -1) {
            var color = game.DEFAULT_BG_USED_SHAPE;
            if (game.shapeIdChosen !== undefined && game.shapeIdChosen >= 0 && shapeId === gameLogic.getShapeType(game.shapeIdChosen)) {
                color = getTurnColorForMove(); //getTurnColorForMove();
            }
            else if (game.state.shapeStatus[game.currentUpdateUI.turnIndex][shapeId]) {
                color = getTurnColor();
            }
            return {
                border: '1pt solid white',
                background: color
            };
        }
        return { background: game.DEFAULT_BG_NO_SHAPE };
    }
    game.setShapeAreaSquareStyle = setShapeAreaSquareStyle;
})(game || (game = {}));
var app = angular.module('myApp', ['gameServices',])
    .run(['$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        $rootScope['game'] = game;
        game.init($rootScope, $timeout);
    }]);
//# sourceMappingURL=game.js.map