declare var $rootScope: angular.IScope;
declare var $location: angular.ILocationService;
declare var $timeout: angular.ITimeoutService;
declare var $interval: angular.IIntervalService;

// IState should be defined by the game, e.g., TicTacToe defines it as:
// interface IState { board: Board; delta: BoardDelta; }
// When the match ends, set turnIndexAfterMove -1 and endMatchScores to an array of scores.
// When the match is ongoing, set turnIndexAfterMove to a valid index and endMatchScores to null.
interface IMove {
  endMatchScores: number[];
  turnIndexAfterMove: number;
  stateAfterMove: IState;
}
interface IStateTransition {
  turnIndexBeforeMove : number;
  stateBeforeMove: IState;
  numberOfPlayers: number;
  move: IMove;
}
interface IPlayerInfo {
  avatarImageUrl: string;
  displayName: string;
  playerId: string;
}
declare type PlayMode = string | number;
interface IUpdateUI extends IStateTransition {
  playersInfo: IPlayerInfo[];
  yourPlayerIndex: number;
  playMode: PlayMode;
}
interface IGame {
  minNumberOfPlayers: number;
  maxNumberOfPlayers: number;
  checkMoveOk(stateTransition: IStateTransition): void;
  updateUI(update: IUpdateUI): void;
}
interface IMoveService {
  setGame(game: IGame): void;
  makeMove(move: IMove): void;
}
declare var moveService: IMoveService;

interface IAlphaBetaLimits {
  millisecondsLimit? : number;
  maxDepth? : number;
}
interface IAlphaBetaService {
  alphaBetaDecision(
    move: IMove,
    playerIndex: number,
    getNextStates: (state: IMove, playerIndex: number) => IMove[],
    getStateScoreForIndex0: (move: IMove, playerIndex: number) => number,
    // If you want to see debugging output in the console, then surf to index.html?debug
    getDebugStateToString: (move: IMove) => string,
    alphaBetaLimits: IAlphaBetaLimits): IMove;
}
declare var alphaBetaService: IAlphaBetaService;

interface StringDictionary {
  [index: string]: string;
}
interface ITranslateService {
  (translationId: string, interpolateParams?: StringDictionary): string;
  getLanguage(): string;
  setTranslations(idToLanguageToL10n: Translations): void;
  setLanguage(language: string): void;
}
declare var translate: ITranslateService;

interface IResizeGameAreaService {
  setWidthToHeight(widthToHeightRatio: number,
    dimensionsChanged?: (gameAreaWidth: number, gameAreaHeight: number)=>void): void;
}
declare var resizeGameAreaService: IResizeGameAreaService;

interface ILog {
  info(... args: any[]):void;
  debug(... args: any[]):void;
  warn(... args: any[]):void;
  error(... args: any[]):void;
  log(... args: any[]):void;
}
declare var log:ILog;

interface IDragAndDropService {
  addDragListener(touchElementId: string,
      handleDragEvent: (type: string, clientX: number, clientY: number, event: TouchEvent|MouseEvent) => void): void;
}
declare var dragAndDropService: IDragAndDropService;

interface ResizeMapAreaParams {
  imageId: string;
  mapId: string;
  originalWidth: number;
  originalHeight: number;
}
declare function resizeMapArea(params: ResizeMapAreaParams): void;
