interface SupportedLanguages {
  en: string, iw: string,
  pt: string, zh: string,
  el: string, fr: string,
  hi: string, es: string,
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
  export let passes: number;
  export let moveToConfirm: BoardDelta = null;
  export let deadBoard: boolean[][] = null;
  export let board: Board = null;
  export let boardBeforeMove: Board = null;
  let clickToDragPiece: HTMLImageElement;
  export let hasDim = false;
  export let dim = 14;

  // For community games.
  export let proposals: number[][] = null;
  export let yourPlayerInfo: IPlayerInfo = null;

  export let gameArea: HTMLElement;
  export let boardArea: HTMLElement;

  export let shapeBoard: ShapeBoard = null;
  export let turnIdx: number = 0;

  export function init($rootScope_: angular.IScope, $timeout_: angular.ITimeoutService) {
    $rootScope = $rootScope_;
    $timeout = $timeout_;
    registerServiceWorker();
    translate.setTranslations(getTranslations());
    translate.setLanguage('en');
    resizeGameAreaService.setWidthToHeight(0.7);
    // dragAndDropService('gameArea', handleDragEvent);
    gameArea = document.getElementById("gameArea");
    boardArea = document.getElementById("boardArea");
    dragAndDropService.addDragListener("boardArea", handleDragEvent);
    gameService.setGame({
      updateUI: updateUI,
      getStateForOgImage: null,
    });

    shapeBoard = gameLogic.getAllShapeMatrix();
  }

  //TODO game.ts 92-188
  // After shape matrix is got, draw shape in board area, draggable
  function handleDragEvent(type: any, clientX: any, clientY: any, shapeMatrix: any) {
    if (!isHumanTurn() || passes == 2) {
      return; // if the game is over, do not display dragging effect
    }
    if (type === "touchstart" && moveToConfirm != null && deadBoard == null) {
      moveToConfirm = null;
      $rootScope.$apply();
    }
    // Center point in boardArea
    let x = clientX - boardArea.offsetLeft - gameArea.offsetLeft;
    let y = clientY - boardArea.offsetTop - gameArea.offsetTop;
    // TODO Is outside boardArea? board edges - 2
    let button = document.getElementById("button");
    if (x < 0 || x >= boardArea.clientWidth || y < 0 || y >= boardArea.clientHeight) {
      // clearClickToDrag();
      return;
    }
    // Inside boardArea. Let's find the containing square's row and col
    let col = Math.floor(dim * x / boardArea.clientWidth);
    let row = Math.floor(dim * y / boardArea.clientHeight);
    // TODO if the cell matrix is not empty, don't preview the piece
    if ((board[row][col] !== '' && deadBoard == null) ||
      (board[row][col] == '' && deadBoard != null)) {
      clearClickToDrag();
      return;
    }
    clickToDragPiece.style.display = deadBoard == null ? "inline" : "none";
    let centerXY = getSquareCenterXY(row, col);
    // show the piece
    //let cell = document.getElementById('board' + row + 'x' + col).className = $scope.turnIndex === 0 ? 'black' : 'white';

    let topLeft = getSquareTopLeft(row, col);
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
    };
  }

  function dragDone(row: number, col: number) {
    $rootScope.$apply(function () {
      if (deadBoard == null) {
        // moveToConfirm = {row: row, col: col};
      } else {
        // toggleDead(row, col);
        clearClickToDrag();
      }
    });
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

  function getTranslations(): Translations {
    return {};
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
    if (isFirstMove()) {
      state = gameLogic.getInitialState();
    }

    //turnIdx = gameLogic.getTurnIdx();

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
    didMakeMove = true;

    // change turnidx here
    turnIdx = move.turnIndex;

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
      return '#33CCFF';
    } else if (state.board[row][col] === '1') {
      return '#FF9900';
    } else if (state.board[row][col] === '2') {
      return '#FF3399';
    } else if (state.board[row][col] === '3') {
      return '#99FF33';
    } else {
      return '#F0F0F0';
    }
  }

  export function setBoardAreaSquareStyle(row: number, col: number) {
    var color = getBoardSquareColor(row, col);
    return { background: color };
  }

  function getTurnColor() {
    var color = ['#33CCFF', '#FF9900', '#FF3399', '#99FF33'];
    return color[turnIdx];
  }

  export function setShapeAreaSquareStyle (row: number, col: number) {
    let shapeId: number = shapeBoard.cellToShape[row][col]
    //console.log("turnidx:" + turnIdx + ":(" + row + "," + col + "):" + shapeId);
    if (shapeId != -1) {
      let color: string = 'C0C0C0'
      if (state.shapeStatus[turnIdx][shapeId]) {
         color = getTurnColor();
      }
      return {
        border: '1pt solid white',
        background: color
      };
    }
    return { background: 'F0F0F0' };
  }


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
}

var app = angular.module('myApp', ['gameServices'/*,'ngScrollable'*/])
  .run(['$rootScope', '$timeout',
    function ($rootScope: angular.IScope, $timeout: angular.ITimeoutService) {
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