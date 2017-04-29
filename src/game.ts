interface SupportedLanguages {
  en: string, zh: string
};

module game {
  export let $rootScope: angular.IScope = null;
  export let $timeout: angular.ITimeoutService = null;

  // Global variables are cleared when getting updateUI.
  // I export all variables to make it easy to debug in the browser by
  // simply typing in the console, e.g.,
  // game.currentUpdateUI
  export let currentUpdateUI: IUpdateUI = null;
  export let didMakeMove: boolean = false; // You can only make one move per updateUI
  export let animationEndedTimeout: ng.IPromise<any> = null;
  export let state: IState = null;
  // similar to friendlygo
  export let passes: number;  // whose turn
  export let moveToConfirm: BoardDelta = null;
  export let deadBoard: boolean[][] = null;
  export let board: Board = null;
  export let boardBeforeMove: Board = null;
  let clickToDragPiece: HTMLImageElement;
  export let hasDim = false;
  export let dim = 14; //20
  export const SHAPEROW = 12;
  export const SHAPECOL = 23;

  export const SHOW_HINT_COLOR = false;
  let showHintColor: boolean = SHOW_HINT_COLOR;

  export const BACKGROUND_COLOR = "rgb(240, 240, 240)";//"#F0F0F0"
  export const PLAYER_1_COLOR = "#ff0066";
  export const PLAYER_2_COLOR = "#0099ff";
  export const HINT_1_COLOR = "#93FF33";
  export const HINT_2_COLOR = "#93FF33";
  export const PLAYER_1_MOVE_COLOR = "#ff4d94";
  export const PLAYER_2_MOVE_COLOR = "#66c2ff";
  export const DEFAULT_BG_USED_SHAPE = '#C0C0C0';
  export const DEFAULT_BG_NO_SHAPE = '#F0F0F0';
  // For community games.
  export let proposals: number[][] = null;
  export let yourPlayerInfo: IPlayerInfo = null;

  export let gameArea: HTMLElement;
  export let boardArea: HTMLElement;
  export let shapeArea: HTMLElement;

  export let shapeBoard: ShapeBoard = null;
  //export let currentUpdateUI.turnIndex: number = 0;
  export let shapeIdChosen: number = -1;
  export let preview: Board = [];
  export let shapePreview: Board = [];
  export let canConfirm: boolean = false;
  export let isYourTurn: boolean = true;
  export let anchorBoard: Board = []
  export let moveInBoard: boolean = true;
  export let endMatchScore: number[] = [];
  export let playerStatus: boolean[] = [];
  export let GlobalErrorMsg: string = "";

  export function init($rootScope_: angular.IScope, $timeout_: angular.ITimeoutService) {
    $rootScope = $rootScope_;
    $timeout = $timeout_;
    registerServiceWorker();
    translate.setTranslations(getTranslations());
    translate.setLanguage('en');
    resizeGameAreaService.setWidthToHeight(0.5);
    // dragAndDropService('gameArea', handleDragEvent);
    gameArea = document.getElementById("gameArea");
    boardArea = document.getElementById("boardArea");
    shapeArea = document.getElementById("shapeArea");

    //TODO split the two event
    dragAndDropService.addDragListener("gameArea", handleDragEventGameArea);
    //dragAndDropService.addDragListener("boardArea", handleDragEventGameArea);
    //dragAndDropService.addDragListener("shapeArea", handleDragEventGameArea);

    //dragAndDropService.addDragListener("boardArea", handleDragEvent);
    gameService.setGame({
      updateUI: updateUI,
      getStateForOgImage: null,
    });

    shapeBoard = gameLogic.getAllShapeMatrix_hardcode();
    showHintColor = SHOW_HINT_COLOR;
    GlobalErrorMsg = "";
    moveInBoard = true;
    for (let p = 0; p < gameLogic.GROUPNUMBER; p++) {
      endMatchScore[p] = 0;
      playerStatus[p] = true;
    }
  }

  function getTranslations(): Translations {
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

  function getAreaSize(type: string): { width: number; height: number; } {
    let area: HTMLElement = document.getElementById(type + "Area");
    /*
      if (type === 'shape') {
      return { width: area.offsetWidth, height: area.offsetHeight };
    }
    */
    return { width: area.clientWidth, height: area.clientHeight };
  }

  function getXYandDragType(clientX: any, clientY: any) {
    //console.log("[getXYandDragType], clientX:", clientX, " clientY:", clientY);
    let boardX: number = clientX - gameArea.offsetLeft - boardArea.offsetLeft
    let shapeX: number = clientX - gameArea.offsetLeft - shapeArea.offsetLeft;
    let boardY: number = clientY - gameArea.offsetTop - boardArea.offsetTop;
    let shapeY: number = clientY - gameArea.offsetTop - shapeArea.offsetTop;
    let dragType: string = '';

    let boardSize: { width: number; height: number; } = getAreaSize('board');
    let shapeSize: { width: number; height: number; } = getAreaSize('shape');
    let x, y: number = 0;
    if (boardX > 0 && boardX < boardSize.width && boardY > 0 && boardY < boardSize.height) {
      x = boardX;
      y = boardY;
      dragType = 'board';
      //console.log("[getXYandDragType]board, x:", x, " y", y);
    } else if (/*(shapeIdChosen === -1 || shapeIdChosen >= 0) &&*/
      shapeX < shapeSize.width && shapeY > 0 && shapeY < shapeSize.height) {
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
    } else {
      //console.log("[getXYandDragTyep]NOTYPE, x:", x, " y", y);
    }

    if (dragType === '') {
      clearDrag('board', false);
      clearDrag('shape', false);
    }

    return { x: x, y: y, dragType: dragType };
  }

  function getHintColor() {
    var color = [HINT_1_COLOR, HINT_2_COLOR, '#00e600', '#ffc34d'];
    return color[currentUpdateUI.turnIndex];
    //return "#93FF33";
  }

  function printBoardAnchor() {
    anchorBoard = gameLogic.getBoardAnchor(state.board, state.anchorStatus, currentUpdateUI.turnIndex);
    //console.log(gameLogic.aux_printFrame(anchorBoard, 20));
    setboardHintColor(anchorBoard, getHintColor());
    //setboardActionGroundColor(anchorBoard, getHintColor());
  }

  function clearBoardAnchor() {
    clearCoverBoard(anchorBoard, true, preview, true);
  }

  function handleDragEventGameArea(type: any, clientX: any, clientY: any) {
    if (gameLogic.endOfMatch(state.playerStatus)) {
      return;
    }

    if (!isYourTurn) {
      return;
    }

    let XYDrag = getXYandDragType(clientX, clientY);

    let x: number = XYDrag.x;
    let y: number = XYDrag.y;
    let dragType: string = XYDrag.dragType;

    if (dragType === '') {
      return;
    }

    let colAndRow = getRowColNum(dragType);
    let clickArea: HTMLElement = getArea(dragType);
    let col = Math.floor(colAndRow.colsNum * x / clickArea.clientWidth);
    let row = Math.floor(colAndRow.rowsNum * y / clickArea.clientHeight);
    /*
    if (dragType === 'shape') {
      col = Math.floor(colAndRow.colsNum * x / clickArea.offsetWidth);
      row = Math.floor(colAndRow.rowsNum * y / clickArea.offsetHeight);
    }
    */
    console.log("dragType:", dragType, " col:", col, " row:", row);

    // displaying the dragging lines
    let draggingLines = document.getElementById(dragType + "DraggingLines");
    let horizontalDraggingLine = document.getElementById(dragType + "HorizontalDraggingLine");
    let verticalDraggingLine = document.getElementById(dragType + "VerticalDraggingLine");
    draggingLines.style.display = "inline";
    let centerXY = getSquareCenterXYWithType(row, col, dragType);
    verticalDraggingLine.setAttribute("x1", "" + centerXY.x);
    verticalDraggingLine.setAttribute("x2", "" + centerXY.x);
    horizontalDraggingLine.setAttribute("y1", "" + centerXY.y);
    horizontalDraggingLine.setAttribute("y2", "" + centerXY.y);

    printBoardAnchor();
    console.log("[handleDragEventGameArea], dragtype:", dragType);
    let checkValid = null;
    if (dragType === 'board') {
      moveInBoard = true;
      //console.log("[handleDragEventGameArea], in board get shapeIdChosen:", shapeIdChosen);
      if (shapeIdChosen === undefined || shapeIdChosen == -1) {
        return;
      }

      checkValid = gameLogic.checkLegalMoveForGame(state.board, row, col, currentUpdateUI.turnIndex, shapeIdChosen, false);
      //console.log("-------------checkvalid-----------", checkValid);
      //if (!checkValid.valid) {
      if (!checkValid) {
        // adjust row and col
        //if (((checkValid.error >> 1) && 0x1) == 1) {
        let newPos: number[] = gameLogic.adjustPositionByShapeId(row, col, shapeIdChosen);
        row = newPos[0];
        col = newPos[1];
        //}

        /*
        clearDrag('board', false);
        canConfirm = false;
        return;
        */
      }

      let boardAction = gameLogic.getBoardActionFromShapeID(row, col, shapeIdChosen);
      if (!angular.equals(preview, boardAction)) {
        clearDrag('board', false);
        //console.log("set board");

        setboardActionGroundColor(boardAction, getTurnColorForMove());
        //setboardActionGroundColor(boardAction, getTurnColor());
        preview = boardAction;
      }
      canConfirm = true;
    } else if (dragType === 'shape') {
      //console.log("[handleDragEventGameArea] SHAPE");
      if (moveInBoard) {
        let newShapeId = shapeAreaCellClicked(row, col);
        if (newShapeId >= 0) {
          shapeIdChosen = newShapeId;
          //console.log("[getXYandDragType]dragType === 'shape',Change ShapeId to", shapeIdChosen);
        }
        moveInBoard = false;
      }

      // add drag
      if (shapeIdChosen !== undefined && shapeIdChosen >= 0) {
        let shapeAction = gameLogic.getShapeActionFromShapeID(row, col, shapeIdChosen, SHAPEROW, SHAPECOL);
        if (!angular.equals(shapePreview, shapeAction)) {
          //console.log(gameLogic.aux_printFrame(shapeAction, SHAPEROW));
          clearDrag('shape', false);
          setShapeActionGroundColor(shapeAction, getTurnColorForMove());
          shapePreview = shapeAction;
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

  function setSquareBackGroundColor(row: number, col: number, color: string) {
    document.getElementById('e2e_test_board_div_' + row + 'x' + col).style.background = color;
  }

  function getSquareBackGroundColor(row: number, col: number) {
    return document.getElementById('e2e_test_board_div_' + row + 'x' + col).style.background;
  }

  function setboardActionGroundColor(boardAction: Board, color: string) {
    for (let i = 0; i < boardAction.length; i++) {
      for (let j = 0; j < boardAction[i].length; j++) {
        if (boardAction[i][j] === '1') {
          setSquareBackGroundColor(i, j, color);
        }
      }
    }
  }

  function setShapeActionGroundColor(shapeAction: Board, color: string) {
    for (let i = 0; i < shapeAction.length; i++) {
      for (let j = 0; j < shapeAction[i].length; j++) {
        if (shapeAction[i][j] === '1') {
          setShapeSquareBackGroundColor(i, j, color);
        }
      }
    }
  }

  function setboardHintColor(boardAction: Board, color: string) {
    for (let i = 0; i < boardAction.length; i++) {
      for (let j = 0; j < boardAction[i].length; j++) {
        //console.log(getSquareBackGroundColor(i, j));
        if (boardAction[i][j] === '1') {
          if (showHintColor === true || getSquareBackGroundColor(i, j) === BACKGROUND_COLOR) {
            setSquareBackGroundColor(i, j, color);
          }
        }
      }
    }
  }

  function getSquareCenterXYWithType(row: number, col: number, type: string) {
    let size = getSquareWidthHeightWithType(type);
    return {
      x: col * size.width + size.width / 2,
      y: row * size.height + size.height / 2
    };
  }

  function getArea(type: string): HTMLElement {
    console.log("getArea:", type + "Area");
    return document.getElementById(type + "Area");
  }

  function getRowColNum(type: string) {
    if (type === 'board') {
      return { rowsNum: dim, colsNum: dim };
    }
    if (type === 'shape') {
      //TODO to const
      return { rowsNum: SHAPEROW, colsNum: SHAPECOL };
    }
  }

  function setShapeSquareBackGroundColor(row: number, col: number, color: string) {
    document.getElementById('e2e_test_shape_div_' + row + 'x' + col).style.background = color;
  }

  function setShapeSquareBackDefaultGroundColor(row: number, col: number) {
    let shapeId: number = shapeBoard.cellToShape[row][col]
    let color: string = DEFAULT_BG_NO_SHAPE;
    //console.log("currentUpdateUI.turnIndex:" + currentUpdateUI.turnIndex + ":(" + row + "," + col + "):" + shapeId);
    if (shapeIdChosen !== undefined && shapeIdChosen >= 0 && shapeId === gameLogic.getShapeType(shapeIdChosen)) {
      color = getTurnColorForMove(); //getTurnColorForMove();
    } else if (shapeId != -1) {
      color = DEFAULT_BG_USED_SHAPE;
      if (currentUpdateUI.turnIndex >= 0 && state.shapeStatus[currentUpdateUI.turnIndex][shapeId]) {
        color = getTurnColor();
      }
    }
    document.getElementById('e2e_test_shape_div_' + row + 'x' + col).style.background = color;
  }

  function clearShapeCoverBoard() {
    for (let i = 0; i < SHAPEROW; i++) {
      for (let j = 0; j < SHAPECOL; j++) {
        setShapeSquareBackDefaultGroundColor(i, j);
      }
    }
  }

  function clearCoverBoard(coverBoard: Board, forced: boolean, otherBoard: Board, careOther: boolean) {
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

    for (let i = 0; i < coverBoard.length; i++) {
      for (let j = 0; j < coverBoard[i].length; j++) {
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

  function clearDrag(type: string, forced: boolean) {
    if (type === 'board') {
      //clearBoardAnchor();
      //console.log(gameLogic.aux_printFrame(anchorBoard, 20));
      clearShapeCoverBoard();
      clearCoverBoard(preview, forced, undefined, false);
    } else if (type === 'shape') {
      clearShapeCoverBoard();
    }

    var draggingLines = document.getElementById(type + "DraggingLines");
    if (draggingLines !== null && draggingLines.style !== null) {
      draggingLines.style.display = "none";
    }
    // obsolete
    //clickToDragPiece.style.display = "none";
  }

  function getSquareCenterXY(row: number, col: number) {
    let size = getSquareWidthHeight();
    return {
      x: col * size.width + size.width / 2,
      y: row * size.height + size.height / 2
    };
  }

  function getSquareTopLeft(row: number, col: number) {
    let size = getSquareWidthHeight();
    return { top: row * size.height, left: col * size.width }
  }

  function getSquareWidthHeight() {
    let boardArea = document.getElementById("boardArea");
    return {
      width: boardArea.clientWidth / (dim),
      height: boardArea.clientHeight / (dim)
    }
  }

  function getSquareWidthHeightWithType(type: string) {
    let area = getArea(type);
    let colAndRow = getRowColNum(type);
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

  function getShapeNum(row: number, col: number): number {
    if (row >= 0 && row < shapeBoard.cellToShape.length && col >= 0 && col < shapeBoard.cellToShape[0].length)
      return shapeBoard.cellToShape[row][col];
    return -1;
  }

  function shapeNumToShapeId(shapeNum: number): number {
    if (shapeNum === -1) {
      return -1;
    }
    return shapeNum * 8;
  }

  function shapeAreaCellClicked(row: number, col: number): number {
    let shapeNum: number = getShapeNum(row, col);
    console.log("[shapeAreaCellClicked] (", row, ",", col, ") => shapeNum:", shapeNum, " ShapeIdChose:", shapeIdChosen);
    if (shapeNum < 0) {
      return;
    }

    if (currentUpdateUI.turnIndex < 0 || !state.shapeStatus[currentUpdateUI.turnIndex][shapeNum]) {
      return;
    }

    let shapeId: number = shapeNumToShapeId(shapeNum);
    console.log("[shapeAreaCellClicked] (", row, ",", col, ") => shapeNum:", shapeNum, " shapeIdchosen:", shapeId);
    return shapeId;
  }

  function updateboardAction(row: number, col: number) {
    let boardAction = gameLogic.getBoardActionFromShapeID(row, col, shapeIdChosen);

    console.log(gameLogic.aux_printFrame(boardAction, dim));

    //if (!angular.equals(preview, boardAction)) {
    clearDrag('board', true);
    console.log("set board");

    console.log(gameLogic.aux_printFrame(preview, dim));
    console.log(gameLogic.aux_printFrame(boardAction, dim));
    //clearPreview
    //setboardActionGroundColor(boardAction, getTurnColor());
    setboardActionGroundColor(boardAction, getTurnColorForMove());

    preview = boardAction;
    //}
    canConfirm = true;
  }

  function boardAreaChooseMove(row: number, col: number): BoardDelta {
    if (shapeIdChosen === undefined || shapeIdChosen == -1) {
      return null;
    }
    // TODO: check legal and hint here
    if (gameLogic.checkLegalMoveForGame(state.board, row, col, currentUpdateUI.turnIndex, shapeIdChosen, false)) {
      return { row: row, col: col, shapeId: shapeIdChosen };
    }
    return null;
  }

  function dragDoneForBoard(row: number, col: number, dragType: string) {
    $rootScope.$apply(function () {
      if (dragType === 'board') {
        // change the board base on preview and board
        moveToConfirm = boardAreaChooseMove(row, col);
        console.log("[dragDoneForBoard]moveToConfirm:", moveToConfirm);
      } else if (dragType == 'shape') {
        let newShapeId = shapeAreaCellClicked(row, col);
        if (newShapeId >= 0) {
          shapeIdChosen = newShapeId;
          console.log("[dragDoneForBoard ]Change ShapeId to", shapeIdChosen);
        }

        console.log("--------------------------");
        printBoardAnchor();
        console.log("--------------------------");
        console.log("[dragDoneForBoard]shapeIdChosen:", shapeIdChosen);
      }
      else {
        // toggleDead(row, col);
        clearClickToDrag();
      }
    });
  }

  export function clearClickToDrag() {
    moveToConfirm = null;
    clearDrag('board', true);
    clearDrag('shapeArea', false);
    shapeIdChosen = -1
    console.log("[clearClickToDrag]Change ShapeId to", shapeIdChosen);
  }

  export function isCancelBtnEnabled() {
    return true;
  }

  //TODO
  export function cancelClicked() {
    clearClickToDrag();
  }

  export function showConfirmButton() {
    return isMyTurn() && checkLegal();
  }

  export function showCancelButton() {
    // TODO only show cancel when some block is chosen
    return isMyTurn();
  }

  /*
  export function showRotateAndFlip() {
    return moveToConfirm !== null; // TODO check flip state
  }
  */
  export function showHintBtn() {
    return isMyTurn();
  }

  export function showRotateLeft() {
    return isMyTurn() && (moveToConfirm !== null); // TODO check flip state
  }

  export function showRotateRight() {
    return isMyTurn() && (moveToConfirm !== null); // TODO check flip state
  }

  export function showFlip() {
    return isMyTurn() && (moveToConfirm !== null); // TODO check flip state
  }

  export function checkLegal() {
    return moveToConfirm !== null && gameLogic.checkLegalMoveForGame(state.board, moveToConfirm.row, moveToConfirm.col,
      currentUpdateUI.turnIndex, moveToConfirm.shapeId, true);
  }

  export function getHint() {
    console.log("state");
    console.log(state);
    clearDrag('board', true);
    //let nextmove = gameLogic.getNextPossibleShape(state.anchorStatus, state.board, state.shapeStatus, currentUpdateUI.turnIndex);
    let anchorStatus = angular.copy(state.anchorStatus);
    let nextmoves = gameLogic.getNextPossibleMoveList(anchorStatus, state.board, state.shapeStatus, currentUpdateUI.turnIndex);
    console.log("HINT nextmove");
    console.log(nextmoves);
    if (nextmoves.valid) {
      let pick: number = -1;
      let theNextMove = null;

      if (shapeIdChosen != undefined && shapeIdChosen > 0) {
        let readyList: number[] = [];
        for (let i = 0; i < nextmoves.moves.length; i++) {
          if (gameLogic.getShapeType(nextmoves.moves[i].shapeId) == gameLogic.getShapeType(shapeIdChosen)) {
            readyList.push(i);
          }
        }

        if (readyList.length > 0) {
          let randPos: number = Math.floor(Math.random() * readyList.length);
          pick = readyList[randPos];
          theNextMove = nextmoves.moves[pick];
        }
      }
      if (pick == -1) {
        let optMoves = gameLogic.sortMoves(nextmoves.moves);
        theNextMove = optMoves[0];
        
        //pick = Math.floor(Math.random() * nextmoves.moves.length);
        //theNextMove = nextmoves.moves[pick];
      }
      moveToConfirm = {
        row: theNextMove.row,
        col: theNextMove.col,
        shapeId: theNextMove.shapeId
      };

      console.log("random pick");
      console.log(moveToConfirm);
      //TODO here find suitable or random one
      // TODO auto draw
      try {
        if (moveToConfirm == null) {
          return;
        }

        shapeIdChosen = moveToConfirm.shapeId

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
        updateboardAction(moveToConfirm.row, moveToConfirm.col);
        printBoardAnchor();
        dragDoneForBoard(moveToConfirm.row, moveToConfirm.col, 'board');
      }
      catch (e) {
        console.log("EXCEPTION!:", moveToConfirm);
      }
    }
  }

  export function getCurrentMsg() {
    let turnIdx: number = currentUpdateUI.turnIndex;
    if (playerStatus[turnIdx] === false) {
      return 'MODAL_NO_MOVES';
    }
    if (!isMyTurn()) {
      return 'MODAL_WAIT_OPPONET';
    }
    if (endMatchScore[turnIdx] == 0) {
      return 'MODAL_TEXT_FOR_SELECT_' + turnIdx;
    }
    if (moveToConfirm === null) {
      return 'MODAL_TEXT_SELECT_PIECE';
    } if (moveToConfirm !== null) {
      return 'MODAL_TEXT_PUT_PIECE';
    }
  }

  export function newlyPlaced(row: number, col: number) {
    /*for the initial state, there is no newly added square*/
    if (preview === undefined || preview.length <= 0) {
      return false;
    }

    if (preview[row][col] === '1') {
      return true;
    }
    return false;
  }

  export function shapeNewlyPlaced(row: number, col: number) {
    if (shapeBoard === undefined || shapeBoard.cellToShape.length <= 0) {
      return false;
    }

    if (shapeIdChosen >= 0 && shapeBoard.cellToShape[row][col] === gameLogic.getShapeType(shapeIdChosen)) {
      return true;
    }
    return false;
  }

  function getShapeIdAfter(right: boolean, left: boolean, flip: boolean) {
    if (shapeIdChosen === undefined || shapeIdChosen < 0) {
      return -1;
    }

    let originShapeId: number = gameLogic.getShapeType(shapeIdChosen);
    let operationType: number = gameLogic.getShapeOpType(shapeIdChosen);

    let rotation: number = operationType % 4;
    // only vertical flip. Horizontal flip <=> vertical flip + 180 rotation.
    let currentFlip: boolean = operationType >= 4;
    if (flip) {
      currentFlip = !currentFlip;
    }

    let addon: number = 0;
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
    shapeIdChosen = gameLogic.getShapeId(originShapeId, rotation, currentFlip);

    return shapeIdChosen;
  }

  export function RotateAndFlip(left: boolean, right: boolean, flip: boolean) {
    if (!(showFlip() || showRotateLeft() || showRotateRight())) {
      return;
    }
    let row: number = moveToConfirm.row;
    let col: number = moveToConfirm.col;
    let shapeId: number = moveToConfirm.shapeId;
    // TODO change shapeId
    getShapeIdAfter(left, right, flip);

    let newPos: number[] = gameLogic.adjustPositionByShapeId(row, col, shapeIdChosen);
    row = newPos[0];
    col = newPos[1];

    updateboardAction(row, col);
    //
    printBoardAnchor();
    //~
    dragDoneForBoard(row, col, 'board');
  }

  export function flip() {
    RotateAndFlip(false, false, true);
  }

  export function rotateLeft() {
    RotateAndFlip(true, false, false);
  }

  export function rotateRight() {
    RotateAndFlip(false, true, false);
  }

  let cacheIntegersTill: number[][] = [];
  export function getIntegersTill(number: any): number[] {
    if (cacheIntegersTill[number]) return cacheIntegersTill[number];
    let res: number[] = [];
    for (let i = 0; i < number; i++) {
      res.push(i);
    }
    cacheIntegersTill[number] = res;
    return res;
  }


  function boardAreaCellClicked(row: number, col: number) {
    log.info(["Clicked on cell:", row, col]);
    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }

    if (!isYourTurn) {
      return;
    }

    if (shapeIdChosen === undefined || shapeIdChosen === -1) { // if the player haven't select a shape, the game should do nothing
      return;
    }
    try {
      let move = gameLogic.createMove(state, row, col, shapeIdChosen, currentUpdateUI.turnIndex);
      isYourTurn = false; // to prevent making another move
      //TODO make sure this is corrcet
      makeMove(move);
      shapeIdChosen = -1; // to reset the shape being selected
      console.log("[boardAreaCellClicked] Change ShapeId to", shapeIdChosen);
    } catch (e) {
      log.info(e);
      log.info(["This is an illegal move:", row, col]);
      return;
    }
  }

  export function confirmClicked() {
    if (!showConfirmButton()) {
      return;
    }
    log.info("confirmClicked");
    if (false) /* game is over */ {

    } else {
      //confirm move
      // make move 
      clearBoardAnchor();
      boardAreaCellClicked(moveToConfirm.row, moveToConfirm.col);
      clearClickToDrag();
      //GlobalErrorMsg = "";
    }
  }

  function registerServiceWorker() {
    // I prefer to use appCache over serviceWorker
    // (because iOS doesn't support serviceWorker, so we have to use appCache)
    // I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
    if (!window.applicationCache && 'serviceWorker' in navigator) {
      let n: any = navigator;
      log.log('Calling serviceWorker.register');
      n.serviceWorker.register('service-worker.js').then(function (registration: any) {
        log.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(function (err: any) {
        log.log('ServiceWorker registration failed: ', err);
      });
    }
  }

  export function isProposal(row: number, col: number) {
    return proposals && proposals[row][col] > 0;
  }

  export function getCellStyle(row: number, col: number): Object {
    if (!isProposal(row, col)) return {};
    // proposals[row][col] is > 0
    let countZeroBased = proposals[row][col] - 1;
    let maxCount = currentUpdateUI.numberOfPlayersRequiredToMove - 2;
    let ratio = maxCount == 0 ? 1 : countZeroBased / maxCount; // a number between 0 and 1 (inclusive).
    // scale will be between 0.6 and 0.8.
    let scale = 0.6 + 0.2 * ratio;
    // opacity between 0.5 and 0.7
    let opacity = 0.5 + 0.2 * ratio;
    return {
      transform: `scale(${scale}, ${scale})`,
      opacity: "" + opacity,
    };
  }

  function getProposalsBoard(playerIdToProposal: IProposals): number[][] {
    let proposals: number[][] = [];
    for (let i = 0; i < gameLogic.ROWS; i++) {
      proposals[i] = [];
      for (let j = 0; j < gameLogic.COLS; j++) {
        proposals[i][j] = 0;
      }
    }
    for (let playerId in playerIdToProposal) {
      let proposal = playerIdToProposal[playerId];
      let delta = proposal.data;
      proposals[delta.row][delta.col]++;
    }
    return proposals;
  }

  export function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    let playerIdToProposal = params.playerIdToProposal;
    // Only one move/proposal per updateUI
    didMakeMove = playerIdToProposal && playerIdToProposal[yourPlayerInfo.playerId] != undefined;
    yourPlayerInfo = params.yourPlayerInfo;
    proposals = playerIdToProposal ? getProposalsBoard(playerIdToProposal) : null;
    if (playerIdToProposal) {
      // If only proposals changed, then return.
      // I don't want to disrupt the player if he's in the middle of a move.
      // I delete playerIdToProposal field from params (and so it's also not in currentUpdateUI),
      // and compare whether the objects are now deep-equal.
      params.playerIdToProposal = null;
      if (currentUpdateUI && angular.equals(currentUpdateUI, params)) return;
    }

    currentUpdateUI = params;
    clearAnimationTimeout();
    state = params.state;
    if (state == null || isFirstMove()) {
      state = gameLogic.getInitialState();
    }

    // change score and update user status
    endMatchScore = angular.copy(gameLogic.getScore(state.board));
    playerStatus = angular.copy(state.playerStatus);
    for (let p = 0; p < endMatchScore.length; p++) {
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


    isYourTurn = isMyTurn()
    //currentUpdateUI.turnIndex = gameLogic.getcurrentUpdateUI.turnIndex();

    // We calculate the AI move only after the animation finishes,
    // because if we call aiService now
    // then the animation will be paused until the javascript finishes.
    animationEndedTimeout = $timeout(animationEndedCallback, 500);
  }

  function animationEndedCallback() {
    log.info("Animation ended");
    maybeSendComputerMove();
  }

  function clearAnimationTimeout() {
    if (animationEndedTimeout) {
      $timeout.cancel(animationEndedTimeout);
      animationEndedTimeout = null;
    }
  }

  function maybeSendComputerMove() {
    if (!isComputerTurn()) return;
    let currentMove: IMove = {
      endMatchScores: currentUpdateUI.endMatchScores,
      state: currentUpdateUI.state,
      turnIndex: currentUpdateUI.turnIndex,
    }
    let move = aiService.findComputerMove(currentMove);
    log.info("Computer move: ", move);
    makeMove(move);
  }

  function makeMove(move: IMove) {
    if (didMakeMove) { // Only one move per updateUI
      return;
    }
    if (move === undefined) {
      return;
    }
    
    didMakeMove = true;

    // change currentUpdateUI.turnIndex here
    currentUpdateUI.turnIndex = move.turnIndex;

    if (!proposals) {
      gameService.makeMove(move, null);
    } else {
      let delta = move.state.delta;
      let myProposal: IProposal = {
        data: delta,
        chatDescription: '' + (delta.row + 1) + 'x' + (delta.col + 1),
        playerInfo: yourPlayerInfo,
      };
      // Decide whether we make a move or not (if we have <currentCommunityUI.numberOfPlayersRequiredToMove-1> other proposals supporting the same thing).
      if (proposals[delta.row][delta.col] < currentUpdateUI.numberOfPlayersRequiredToMove - 1) {
        move = null;
      }
      gameService.makeMove(move, myProposal);
    }
  }

  function isFirstMove() {
    return !currentUpdateUI.state;
  }

  function yourPlayerIndex() {
    return currentUpdateUI.yourPlayerIndex;
  }

  function isComputer() {
    let playerInfo = currentUpdateUI.playersInfo[currentUpdateUI.yourPlayerIndex];
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
    return !didMakeMove && // you can only make one move per updateUI.
      currentUpdateUI.turnIndex >= 0 && // game is ongoing
      currentUpdateUI.yourPlayerIndex === currentUpdateUI.turnIndex; // it's my turn
  }

  export function cellClicked(row: number, col: number, shapeId: number): void {
    log.info("Clicked on cell:", row, col, shapeId);
    if (!isHumanTurn()) return;
    let nextMove: IMove = null;
    try {
      nextMove = gameLogic.createMove(
        state, row, col, shapeId, currentUpdateUI.turnIndex);
    } catch (e) {
      log.info(["Cell is already full in position:", row, col]);
      return;
    }
    // Move is legal, make it!
    makeMove(nextMove);
  }

  function getBoardSquareColor(row: number, col: number) {
    if (state.board[row][col] === '0') {
      return PLAYER_1_COLOR;
    } else if (state.board[row][col] === '1') {
      return PLAYER_2_COLOR;
    } else if (state.board[row][col] === '2') {
      return '#00e600';
    } else if (state.board[row][col] === '3') {
      return '#ffc34d';
    } else {
      return BACKGROUND_COLOR;
    }
  }

  export function setBoardAreaSquareStyle(row: number, col: number) {
    var color = getBoardSquareColor(row, col);
    return { background: color };
  }

  function getTurnColor() {
    var color = [PLAYER_1_COLOR, PLAYER_2_COLOR, '#00e600', '#ffc34d'];
    return color[currentUpdateUI.turnIndex];
  }

  function getTurnColorForMove() {
    var color = [PLAYER_1_MOVE_COLOR, PLAYER_2_MOVE_COLOR, '#00e600', '#ffc34d'];
    return color[currentUpdateUI.turnIndex];
  }

  export function setShapeAreaSquareStyle(row: number, col: number) {
    let shapeId: number = shapeBoard.cellToShape[row][col]
    //console.log("currentUpdateUI.turnIndex:" + currentUpdateUI.turnIndex + ":(" + row + "," + col + "):" + shapeId);
    if (shapeId != -1) {
      let color: string = DEFAULT_BG_USED_SHAPE;
      if (shapeIdChosen !== undefined && shapeIdChosen >= 0 && shapeId === gameLogic.getShapeType(shapeIdChosen)) {
        color = getTurnColorForMove(); //getTurnColorForMove();
      } else if (currentUpdateUI.turnIndex >= 0 && state.shapeStatus[currentUpdateUI.turnIndex][shapeId]) {
        color = getTurnColor();
      }
      return {
        border: '1pt solid white',
        background: color
      };
    }
    return { background: DEFAULT_BG_NO_SHAPE };
  }
}

var app = angular.module('myApp', ['gameServices', /*,'ngScrollable'*/])
  .run(['$rootScope', '$timeout',
    function ($rootScope: angular.IScope, $timeout: angular.ITimeoutService) {
      $rootScope['game'] = game;
      game.init($rootScope, $timeout);
    }]);
