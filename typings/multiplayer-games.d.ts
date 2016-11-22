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
interface ICommonUI extends IStateTransition {
  // -2 is a viewer; otherwise it's the player index (0/1).
  yourPlayerIndex: number;
}
// Proposals are used in community games: each player may submit a proposal, and the game will eventual selected
// the winning proposal and convert it to a move.
interface ICommunityUI extends ICommonUI {
  // You need to know your playerId to make sure you only make one proposal,
  // i.e., if (playerIdToProposal[yourPlayerId]) then you can't make another proposal.
  yourPlayerInfo: IPlayerInfo; 
  // Mapping playerId to his proposal.
  playerIdToProposal: IProposals; 
}
interface IProposal {
  playerInfo: IPlayerInfo; // the player making the proposal.
  chatDescription: string; // string representation of the proposal that will be shown in the community game chat.
  data: IProposalData; // IProposalData must be defined by the game.
}
interface IProposals {
  [playerId: string]: IProposal;
}
declare type PlayMode = string | number; // 'passAndPlay', 'playAgainstTheComputer', or a number (0/1).
interface IUpdateUI extends ICommonUI {
  playersInfo: IPlayerInfo[];
  playMode: PlayMode; 
}
interface IGame {
  minNumberOfPlayers: number;
  maxNumberOfPlayers: number;
  checkMoveOk(stateTransition: IStateTransition): void;
  updateUI(update: IUpdateUI): void;
  communityUI(communityUI: ICommunityUI): void;
  getStateForOgImage(): string;
}
interface IMoveService {
  setGame(game: IGame): void;
  makeMove(move: IMove): void;

  // For community games. move may be null.
  // I recommend that a proposal will be selected when it's chosen by 3 players.
  // When a proposal is selected, that proposal will be converted to a move
  // (and then move will be non-null).
  // Do not allow making a community move if a player already submitted his proposal, i.e.,
  // you can submit at most one proposal.
  communityMove(proposal: IProposal, move: IMove): void;
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
  alwaysLog(... args: any[]):void;
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
