declare var $rootScope: angular.IScope;
declare var $location: angular.ILocationService;
declare var $timeout: angular.ITimeoutService;
declare var $interval: angular.IIntervalService;

interface ISet {
  key: string;
  value: any;
  visibleToPlayerIndexes?: number[];
}
interface ISetVisibility {
  key: string;
  visibleToPlayerIndexes?: number[];
}
interface ISetRandomInteger {
  key: string;
  from: number;
  to: number;
}
interface IDelete {
  key: string;
}
interface IShuffle {
  keys: string[];
}
interface ISetTurn {
  turnIndex: number;
}
interface IEndMatch {
  endMatchScores: number[];
}
interface IOperation {
  set?: ISet;
  setVisibility?: ISetVisibility;
  setRandomInteger?: ISetRandomInteger;
  delete?: IDelete;
  shuffle?: IShuffle;
  setTurn?: ISetTurn;
  endMatch?: IEndMatch;
}
declare type IMove = IOperation[];
interface IState {
  [index: string]: any;
}
interface IIsMoveOk {
  move: IMove;
  turnIndexBeforeMove : number;
  turnIndexAfterMove: number;
  stateBeforeMove: IState;
  stateAfterMove: IState;
  numberOfPlayers: number;
}
interface IPlayerInfo {
  avatarImageUrl: string;
  displayName: string;
  playerId: string;
}
declare type PlayMode = string | number;
interface IUpdateUI extends IIsMoveOk {
  playersInfo: IPlayerInfo[];
  yourPlayerIndex: number;
  playMode: PlayMode;
  moveNumber: number;
  randomSeed: string;
  endMatchScores?: number[];
}
interface IGame {
  isMoveOk(move: IIsMoveOk): boolean;
  updateUI(update: IUpdateUI): void;
  minNumberOfPlayers: number;
  maxNumberOfPlayers: number;
}
interface IGameService {
  setGame(game: IGame): void;
  makeMove(move: IMove): void;
}
declare var gameService: IGameService;

interface IAlphaBetaLimits {
  millisecondsLimit? : number;
  maxDepth? : number;
}
interface IAlphaBetaService {
  alphaBetaDecision(
    move: IMove,
    playerIndex: number,
    getNextStates: (move: IMove, playerIndex: number) => IMove[],
    getStateScoreForIndex0: (move: IMove, playerIndex: number) => number,
    // If you want to see debugging output in the console, then surf to game.html?debug
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
  setLanguage(language: string, codeToL10N: StringDictionary): void;
}
declare var translate: ITranslateService;

interface IResizeGameAreaService {
  setWidthToHeight(widthToHeightRatio: number): void;
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
