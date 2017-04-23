/**
 * IMPORTANT: do not change anything in this file!
 * This is the API between the game and the platform,
 * and it cannot be changed.
 */

// This file describes all the services provided by the gaming platform.
// See examples for the platform at:
// https://friendlygo.com/
// https://ycheckers.com/
// https://tictactoe.ygame.us/
// The source code for these games is at:
// https://github.com/yoav-zibin
// The game developer can host the game anywhere, e.g., the games above are hosted on github.io
// and you can reach just the game (without the platform) in these urls, respectively:
// https://yoav-zibin.github.io/friendlygo/
// https://yoav-zibin.github.io/Checkers_SMG/
// https://yoav-zibin.github.io/TicTacToe/
// Test these out and see what *play modes* the platform supports:
// 1) passAndPlay: two human players (or more) playing together on one device (passing the device around).
// 2) playAgainstTheComputer: a human player against the computer (on one device obviously).
// The first two play modes are also called "single-player", even though a more accurate name would be "single-device".
// 3) onlyAIs: this play mode is just for testing purposes, in which the computer plays against itself.
// 4) multiplayer: human players playing against each other using different devices.
// The match may have viewers (a viewer can't make moves in the match). The platform
// is responsible to passing and persisting the match data. Multiplayer matches can be either 
// speed matches (where both players are connected at the same time and there is a time limit per move),
// or ping-pong matches (where one player makes a move and the opponent gets a push notification).
// 5) community: a group of players playing another group of players, e.g., US vs. UK, 
// or male vs female, or beginners vs non-beginners. Each player in a group submits a proposal,
// and the game decides when to make a move (e.g., once the same proposal is selected 3 times).

// Your game must support at least the multiplayer playMode.
// All the other playModes are optional, and you can later specify (in the developer site)
// which playModes are supported in your game.
// When your game is ready, and well tested on major mobile devices (iOS&Android),
// you can submit it in the developer site:
// https://friendlygo.com/gameDeveloper.html
// You will also need to buy a domain name for your game (e.g., GoBackgammon.us)
// and set it up on cloudflare as described here:
// https://docs.google.com/document/d/1IYopKyMarGSsJMB_i9nzyZYgGKi_vfYqltu96GshT60/edit#heading=h.auj9c2nm880v

// Althoug this API supports any number of players, the platform currently supports
// *only two-player games*. In the near future it will support multiple players.

// The *platform* is responsible for handling data (player's info, player's matches, etc),
// authentication, pairing up players, allowing players to chat, delivering notifications, etc.
// The *game* is reponsible for showing the game UI and passing the selected move to the platform.
// The game doesn't need to persist any data: everything will be handled by the platform.

// The most important object is gameService: IGameService, which allows the game to
// communicate with the platform.
// (See all the global objects below, inside the namespace gamingPlatform).
// IGameService allows the game to make a move (makeMove).
// The platform will call game.updateUI when the game 
// should change it's UI according to some state.
// So, in summary, the platform calls game.updateUI and the game then calls makeMove.
// The game may call makeMove at most once after getting an updateUI,
// and only if it's your player's turn (yourPlayerIndex == turnIndex).
interface IGameService {
  // Call this method exactly once when the game is ready to get updateUI (see IGame).
  // E.g., if your game needs to load any assets, then call setGame after
  // all assets have loaded.
  setGame(game: IGame): void;

  // After the platform calls game.updateUI, you can call makeMove at most once,
  // and only if it's your player's turn (updateUI.yourPlayerIndex == updateUI.turnIndex).
  // If a community match, you can only send a proposal once, so call makeMove only if
  // (updateUI.playerIdToProposal[updateUI.yourPlayerInfo.playerId] == undefined)
  // You must pass either move or proposal.
  // chatDescription is a text that will be shown in the community game chat,
  // e.g., in a game of chess it will describe the move such as "Q-R5".
  makeMove(move: IMove, proposal: IProposal, chatDescription: string): void;
}

// Your game must support the updateUI method.
// The other methods are optional.
interface IGame {
  // This method is called when the game state changes, e.g., if the player started a new match,
  // loaded an existing match, if an opponent made a move, etc.
  // The game should update its UI according to the game state (updateUI.state).
  // If it's your player's turn (updateUI.yourPlayerIndex == updateUI.turnIndex),
  // and your player didn't submit a proposal already (updateUI.playerIdToProposal[updateUI.yourPlayerInfo.playerId] == undefined),
  // then the UI should allow the player to make a move (and the game should call gameService.makeMove).
  updateUI(updateUI: IUpdateUI): void;

  // The platform supports players sharing a match on facebook, and therefore the platform
  // needs a way to convert the match state into an image.
  // That image is also used in the platform HTML in <meta property="og:image" ...>,
  // which is why I called the mechanism to conver a state to an image 'ogImageMaker'.
  // (In the future, the platform may also send push notifications that includes an image of the state.)
  // This method is optional: if your game doesn't support it, then 
  // you won't be able to share images on Facebook.
  // In the game developer site you can enter a URL (called 'ogImageMaker')
  // that converts a state string to an image.
  // The platform will pass your URL the following parameters:
  // * state: this is the string returned from getStateForOgImage()
  // * fbId0, fbId1: the FB ids of the first and second players (if these players logged into FB).
  // * winner: the playerIndex of the winner (either 0/1 or missing).
  // * onlyBoard: either equals to "t" (true) or missing.
  // If onlyBoard=t, then the URL should created
  // a square image (of size 400x400) that contains just the board. 
  // If it's missing, then it should create an image
  // that is approximately 1200x630 (that's facebook recommendation for og:image).
  // E.g., for the game of friendlygo I created an AppEngine that does this conversion, 
  // see the code here:
  // https://github.com/yoav-zibin/friendlygo-appengine
  // I uploaded this to AppEngine, and entered this URL for ogImageMaker in the developer site:
  // https://dotted-guru-139914.appspot.com/
  // This is an example of how the platform calls the ogImageMaker URL:
  // https://dotted-guru-139914.appspot.com/?onlyBoard=t&winner=0&fbId0=10153589934097337&fbId1=10153693068502449&state=wbbxxxxxxxwbbwbbxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxwb
  // See another example for the game of checkers:
  // https://github.com/yoav-zibin/ycheckers-appengine
  getStateForOgImage(): string;
}

// Making a move either ends the game (then <endMatchScores> must be set)
// or the game continues (then <turnIndex> must be set, which determines which player plays next).
// Always set the <state> to be the state after making the move.
interface IMove {
  // When the match ends: turnIndex is -1 and endMatchScores is an array of scores.
  // When the match is ongoing: turnIndex is a valid index and endMatchScores to null.
  endMatchScores: number[]; // either null or an array of length <numberOfPlayers>.
  turnIndex: number;

  // <state> is the state after making the move.
  // IState type must be defined by the game.
  // <state> can be any plain javscript object (POJO),
  // i.e., anything that can be serialized to json
  // (e.g., you can't have DOM elements, classes, or functions in IState).
  // If your game has hidden state (e.g., in a game of poker, you can only see the cards in your hand),
  // then you should hide the relevant info in the UI.
  state: IState;
}

// Information the platform passes about a player: it's name, id, and avatar.
interface IPlayerInfo {
  // <avatarImageUrl> is either missing or a full URL (http[s]://...).
  // E.g., for FB users it's "http://graph.facebook.com/10154287448416125/picture?square=square"
  avatarImageUrl: string;

  // <displayName> may be missing (e.g., in single-player games).
  displayName: string;

  // If it's a computer player, then playerId will be ''.
  // If the playMode is single-player (passAndPlay or playAgainstTheComputer),
  // then the playerId will start with a "Y".
  // If the playMode is multiplayer, and the opponent is unknown
  // (e.g., the player started an auto-match, so the opponent is unknown),
  // then the playerId will start with a "X".
  // If the playMode is multiplayer, and the opponent is known,
  // then playerId is a long number (which can't fit in a JS number).
  playerId: string;
}

// To update the UI in both cases you need:
// - all the info in a move: state, turnIndex, endMatchScores
// - numberOfPlayers (usually 2 players).
// - yourPlayerIndex
// In a new match, state and endMatchScores are null, and turnIndex is 0
// (so the first to play is always turnIndex=0).
interface IUpdateUI extends IMove {
  numberOfPlayers: number;

  // <yourPlayerIndex> is -2 if you're a viewer; otherwise it's your player index,
  // e.g., yourPlayerIndex=0 if you're the first player.
  // If yourPlayerIndex == turnIndex, then it's your turn to make a move!
  yourPlayerIndex: number;

  // You need to know your playerId to make sure you only make one proposal,
  // i.e., if (playerIdToProposal[yourPlayerId]) then you can't make another proposal.
  yourPlayerInfo: IPlayerInfo; 

  // The array of all players.
  // If it's a community match, then playersInfo will contain some representation of the
  // two communities (e.g., if it's a match between US and UK, avatarImageUrl will be a country flag).
  playersInfo: IPlayerInfo[];

  // playMode is either 'passAndPlay', 'playAgainstTheComputer', or 
  // (if it's a multiplayer/community match) yourPlayerIndex (e.g., 0 or 1).
  playMode: PlayMode; 

  // Below are fields set only in community matches.
  // Mapping playerId to their proposal.
  playerIdToProposal: IProposals;
  
  // A move is chosen after a proposal was selected that number of times.
  // If a community match has a small number of players, this number will be small (e.g., 1),
  // and when the match has more players this number will be increased by the platform (e.g., 3 or more).
  numberOfPlayersRequiredToMove: number;
}

// PlayMode is either 'passAndPlay', 'playAgainstTheComputer', or 
// (if it's a multiplayer match) yourPlayerIndex (e.g., 0 or 1).
declare type PlayMode = string | number;

// A mapping of playerId to proposal.
interface IProposals {
  [playerId: string]: IProposal;
}

// Proposals are used in community games: each player may submit a proposal,
// and the game will eventual select
// the winning proposal and pass the selected move.
interface IProposal {
  playerInfo: IPlayerInfo; // the player making the proposal.
  data: IProposalData; // IProposalData must be defined by the game.
}

// You can use <alphaBetaService> to build the AI for your game, see
// https://docs.google.com/document/d/1IYopKyMarGSsJMB_i9nzyZYgGKi_vfYqltu96GshT60/edit#heading=h.xb0kyn2ocs5o
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
interface IAlphaBetaLimits {
  millisecondsLimit? : number;
  maxDepth? : number;
}

// Use <translate> to support l10n and i18n of your game.
// You can use it in your HTML as an angular directive like this:
// {{'CHATS' | translate}}
// or in your code like this:
// translate('CHATS')
// Assume your game supports English ('en') and Spanish ('es').
// Initially, you must call setTranslations to set all translations, e.g.,
// translate.setTranslations({'CHATS': {'en': 'Chats', 'es': 'Charlas'}})
// Your game will define the type SupportedLanguages, in our example:
// interface SupportedLanguages { en: string, es: string }
// In the developer site you will enter all the languages your game supports.
// The platform will allow the player to switch languages, and if the language is changed,
// the platform will call setLanguage with the new languageCode.
interface ITranslateService {
  (translationId: string, interpolateParams?: StringDictionary, languageCode?: string): string;
  getLanguage(): string;
  setTranslations(idToLanguageToL10n: Translations): void;
  setLanguage(languageCode: string): void;
}
interface Translations {
  [index: string]: SupportedLanguages;
}
interface StringDictionary {
  [index: string]: string;
}

// <resizeGameAreaService> makes sure an HTML element with id='gameArea' has
// the given width-to-height ratio.
// E.g., in a game of checkers, widthToHeightRatio is 1.
// Whenever the game iframe dimensions changes (e.g., if the device is rotated or the window is resized)
// then the service will change the width and height of 'gameArea' so that
// the width-to-height ratio is maintained.
// If <dimensionsChanged> is defined, then it will be called whenever the dimensions of 'gameArea' are changed.
interface IResizeGameAreaService {
  setWidthToHeight(widthToHeightRatio: number,
    dimensionsChanged?: (gameAreaWidth: number, gameAreaHeight: number)=>void): void;
}

// <log> is very similar to console, e.g., 
// log.warn(... args) will both call console.warn(... args)
// and it will also store the <args> in memory, and if there is an exception
// then it will pass all the logs to the platform, and the platform will
// create a bug (including the game logs, the platform logs, stack traces, etc)
// and email the game developer.
// Note that we only keep the last 100 log entries to avoid blowing up the memory.
interface ILog {
  // Only the last 100 calls are kept (the oldest call is discarded first).
  info(... args: any[]):void;
  debug(... args: any[]):void;
  warn(... args: any[]):void;
  error(... args: any[]):void;
  log(... args: any[]):void;

  // Use alwaysLog if you need to log something really important that must always be kept in memory.
  alwaysLog(... args: any[]):void;
}

// <dragAndDropService> listens to both touch and mouse events on an HTML element with
// the given id=<touchElementId>, and it "converts" mouse events to touch events.
// E.g., a mousemove is converted to touchmove if the mouse is currently pressed.
// This helps abstract away the differences between mouse and touch events
// (concept similar to pointer events, that sadly isn't well-supported: http://caniuse.com/#search=pointer).
// <handleDragEvent> is called whenever there is a mouse/touch event,
// and <type> is either:
// for touch events: event.type
// for mouse events: the equivalent touch event for the given mouse event
// (so "touchstart" for "mousedown", "touchmove" for "mousemove" if mouse is pressed, "touchend" for "mouseup")
interface IDragAndDropService {
  addDragListener(touchElementId: string,
      handleDragEvent: (type: string, clientX: number, clientY: number, event: TouchEvent|MouseEvent) => void): void;
}

// Global objects that supply the platform service.
// You can either access them like:
// gamingPlatform.log.warn('some warning');
// or import them first, e.g.,
// import log = gamingPlatform.log;
// log.warn('some warning');
declare namespace gamingPlatform {
  var gameService: IGameService;
  var alphaBetaService: IAlphaBetaService;
  var translate: ITranslateService;
  var resizeGameAreaService: IResizeGameAreaService;
  var log:ILog;
  var dragAndDropService: IDragAndDropService;
}