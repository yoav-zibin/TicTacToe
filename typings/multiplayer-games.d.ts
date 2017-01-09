// IState must be defined by the game.
interface IMove {
  // When the match ends: turnIndex  is-1 and endMatchScores is an array of scores.
  // When the match is ongoing: turnIndex is a valid index and endMatchScores to null.
  endMatchScores: number[];
  turnIndex: number;
  // The state after making the move
  state: IState;
}
interface IPlayerInfo {
  avatarImageUrl: string;
  displayName: string;
  playerId: string;
}
interface ICommonUI extends IMove {
  numberOfPlayers: number;
  // -2 is a viewer; otherwise it's the player index (0/1).
  yourPlayerIndex: number;
}
type PlayMode = string | number; // 'passAndPlay', 'playAgainstTheComputer', or a number (0/1).
interface IUpdateUI extends ICommonUI {
  playersInfo: IPlayerInfo[];
  playMode: PlayMode; 
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

interface IGame {
  updateUI(updateUI: IUpdateUI): void;
  communityUI(communityUI: ICommunityUI): void;
  getStateForOgImage(): string;
}
interface IGameService {
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

interface StringDictionary {
  [index: string]: string;
}
interface ITranslateService {
  (translationId: string, interpolateParams?: StringDictionary): string;
  getLanguage(): string;
  setTranslations(idToLanguageToL10n: Translations): void;
  setLanguage(language: string): void;
}

interface IResizeGameAreaService {
  setWidthToHeight(widthToHeightRatio: number,
    dimensionsChanged?: (gameAreaWidth: number, gameAreaHeight: number)=>void): void;
}

interface ILog {
  info(... args: any[]):void;
  debug(... args: any[]):void;
  warn(... args: any[]):void;
  error(... args: any[]):void;
  log(... args: any[]):void;
  alwaysLog(... args: any[]):void;
}

interface IDragAndDropService {
  addDragListener(touchElementId: string,
      handleDragEvent: (type: string, clientX: number, clientY: number, event: TouchEvent|MouseEvent) => void): void;
}

declare namespace gamingPlatform {
  var gameService: IGameService;
  var alphaBetaService: IAlphaBetaService;
  var translate: ITranslateService;
  var resizeGameAreaService: IResizeGameAreaService;
  var log:ILog;
  var dragAndDropService: IDragAndDropService;
}