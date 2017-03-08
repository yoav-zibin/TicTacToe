interface SupportedLanguages {
  en: string, iw: string,
  pt: string, zh: string,
  el: string, fr: string,
  hi: string, es: string,
};




module game {

  export let direction: boolean = true;
  export function flipDirection() { direction = !direction; }

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
  // For community games.
  export let proposals: number[][] = null;
  export let yourPlayerInfo: IPlayerInfo = null;

  export function init($rootScope_: angular.IScope, $timeout_: angular.ITimeoutService) {
    $rootScope = $rootScope_;
    $timeout = $timeout_;
    registerServiceWorker();
    translate.setTranslations(getTranslations());
    translate.setLanguage('en');
    resizeGameAreaService.setWidthToHeight(1);
    gameService.setGame({
      updateUI: updateUI,
      communityUI: communityUI,
      getStateForOgImage: null,
    });
  }

  function registerServiceWorker() {
    // I prefer to use appCache over serviceWorker
    // (because iOS doesn't support serviceWorker, so we have to use appCache)
    // I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
    if (!window.applicationCache && 'serviceWorker' in navigator) {
      let n: any = navigator;
      log.log('Calling serviceWorker.register');
      n.serviceWorker.register('service-worker.js').then(function(registration: any) {
        log.log('ServiceWorker registration successful with scope: ',    registration.scope);
      }).catch(function(err: any) {
        log.log('ServiceWorker registration failed: ', err);
      });
    }
  }

  function getTranslations(): Translations {
    return {};
  }

  export function communityUI(communityUI: ICommunityUI) {
    log.info("Game got communityUI:", communityUI);
    // If only proposals changed, then do NOT call updateUI. Then update proposals.
    let nextUpdateUI: IUpdateUI = {
        playersInfo: [],
        playMode: communityUI.yourPlayerIndex,
        numberOfPlayers: communityUI.numberOfPlayers,
        state: communityUI.state,
        turnIndex: communityUI.turnIndex,
        endMatchScores: communityUI.endMatchScores,
        yourPlayerIndex: communityUI.yourPlayerIndex,
      };
    if (angular.equals(yourPlayerInfo, communityUI.yourPlayerInfo) &&
        currentUpdateUI && angular.equals(currentUpdateUI, nextUpdateUI)) {
      // We're not calling updateUI to avoid disrupting the player if he's in the middle of a move.
    } else {
      // Things changed, so call updateUI.
      updateUI(nextUpdateUI);
    }
    // This must be after calling updateUI, because we nullify things there (like playerIdToProposal&proposals&etc)
    yourPlayerInfo = communityUI.yourPlayerInfo;
    let playerIdToProposal = communityUI.playerIdToProposal;
    didMakeMove = !!playerIdToProposal[communityUI.yourPlayerInfo.playerId];
    proposals = [];
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
  }
  export function isProposal(row: number, col: number) {
    return proposals && proposals[row][col] > 0;
  }
  export function isProposal1(row: number, col: number) {
    return proposals && proposals[row][col] == 1;
  }
  export function isProposal2(row: number, col: number) {
    return proposals && proposals[row][col] == 2;
  }

  export function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    didMakeMove = false; // Only one move per updateUI
    currentUpdateUI = params;
    clearAnimationTimeout();
    state = params.state;
    if (isFirstMove()) {
      state = gameLogic.getInitialState();
    }
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
    let currentMove:IMove = {
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

    if (!proposals) {
      gameService.makeMove(move);
    } else {
      let delta = move.state.delta;
      let myProposal:IProposal = {
        data: delta,
        chatDescription: '' + (delta.row + 1) + 'x' + (delta.col + 1),
        playerInfo: yourPlayerInfo,
      };
      // Decide whether we make a move or not (if we have 2 other proposals supporting the same thing).
      if (proposals[delta.row][delta.col] < 2) {
        move = null;
      }
      gameService.communityMove(myProposal, move);
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

  export function cellClickedYours(row: number, col: number, direction: boolean): void {
    log.info("Your Board cell:", row, col);
    //log.info("Game got:", row);
    if (!isHumanTurn()) return;
    let nextMove: IMove = null;
    try {
      nextMove = gameLogic.createMove(
          state, row, col, currentUpdateUI.turnIndex, 1,direction);
    } catch (e) {
      return;
    }
    // Move is legal, make it!
    makeMove(nextMove);
  }

    export function cellClickedMy(row: number, col: number, direction: boolean): void {
    log.info("My Board cell:", row, col);
    //log.info("Game got:", row);
    if (!isHumanTurn()) return;
    let nextMove: IMove = null;
    try {
      nextMove = gameLogic.createMove(
          state, row, col, currentUpdateUI.turnIndex, 0, direction);
    } catch (e) {
      log.info(["Cell is already full in position:", row, col]);
      return;
    }
    // Move is legal, make it!
    makeMove(nextMove);
  }


  export function myHover(row: number, col: number, direction: boolean): void {
    let compensate = 0;
    let length = 5-state.ship;
    let show = true;
    if(direction==true) {
      if(!gameLogic.validSet(state.myBoard, row, col, length, direction))
        compensate = row + length - gameLogic.ROWS;
      
      for(let i=0; i<length; i++) {
        if(state.myBoard[row-compensate+i][col]!=="") {
          show = false;
          break;
        }
      }
    }
    else {
      if(!gameLogic.validSet(state.myBoard, row, col, length, direction))
        compensate = col + length - gameLogic.COLS;
      
      for(let i=0; i<length; i++) {
        if(state.myBoard[row][col-compensate+i]!=="") {
          show = false;
          break;
        }
      }
    }

    if(show==true) {
      if(direction==true) {   //row
        for(let i=0; i<length; i++) { 
          document.getElementById('my' + (row-compensate+i) + 'x' + col).classList.add("myhover");
        }
      }
      else {
        for(let i=0; i<length; i++) { 
          document.getElementById('my' + row + 'x' + (col-compensate+i)).classList.add("myhover");
        }
      }
    }
  }

  export function myHoverLeave(row: number, col: number, direction: boolean): void {
    /*
    let compensate = 0;
    let length = 5-state.ship;

    if(direction==true) {
      if(!gameLogic.validSet(state.myBoard, row, col, length, direction))
        compensate = row + length - gameLogic.ROWS;
    }
    else {
      if(!gameLogic.validSet(state.myBoard, row, col, length, direction))
        compensate = col + length - gameLogic.COLS;
    }
    
    if(direction==true) {
      for(let i=0; i<length; i++) {
          document.getElementById('my' + (row-compensate+i) + 'x' + col).classList.remove("myhover");
      } 
    }
    else {
      for(let i=0; i<length; i++) {
          document.getElementById('my' + row + 'x' + (col-compensate+i)).classList.remove("myhover");
      } 
    }
*/

    if(direction==true) {
      for(let i=0; i<gameLogic.ROWS; i++) {
        if(document.getElementById('my' + i + 'x' + col).classList.contains("myhover")) {
          document.getElementById('my' + i + 'x' + col).classList.remove("myhover");
        }
      }
    }
    else {
      for(let i=0; i<gameLogic.COLS; i++) {
        if(document.getElementById('my' + row + 'x' + i).classList.contains("myhover")) {
          document.getElementById('my' + row + 'x' + i).classList.remove("myhover");
        }
      }
    }
  }


  export function yourHover(row: number, col: number): boolean {
    return state.yourBoard[row][col]==="";
  }
  

  export function shouldShowImage(row: number, col: number, whichboard: number): boolean {
    if(whichboard==0) {
      return state.myBoard[row][col] !== "" || isProposal(row, col);
    }
    else {
      return state.yourBoard[row][col] !== "" || isProposal(row, col);
    }
  }

  function isPiece(row: number, col: number, turnIndex: number, pieceKind: string, whichboard: number): boolean {
    if(whichboard==0) {
      return state.myBoard[row][col] === pieceKind || (isProposal(row, col) && currentUpdateUI.turnIndex == turnIndex);
    } 
    else {
      return state.yourBoard[row][col] === pieceKind || (isProposal(row, col) && currentUpdateUI.turnIndex == turnIndex);
    } 
}

  export function isPieceX(row: number, col: number, whichboard: number): boolean {
      return isPiece(row, col, 0, 'X', whichboard);
  }

  export function isPieceO(row: number, col: number, whichboard: number): boolean {
    return isPiece(row, col, 1, 'O', whichboard);
  }

  export function isPieceM(row: number, col: number, whichboard: number): boolean {
    return isPiece(row, col, 1, 'M', whichboard);
  }

  export function shouldSlowlyAppear(row: number, col: number): boolean {
      return state.delta &&
          state.delta.row === row && state.delta.col === col;
  }

}

angular.module('myApp', ['gameServices'])
  .run(['$rootScope', '$timeout',
    function ($rootScope: angular.IScope, $timeout: angular.ITimeoutService) {
      $rootScope['game'] = game;
      game.init($rootScope, $timeout);
    }]);
