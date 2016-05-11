interface SupportedLanguages {
  en: string, iw: string,
  pt: string, zh: string,
  el: string, fr: string,
  hi: string, es: string,
};
        
interface Translations {
  [index: string]: SupportedLanguages;
}

module game {
  // Global variables are cleared when getting updateUI.
  // I export all variables to make it easy to debug in the browser by
  // simply typing in the console, e.g.,
  // game.currentUpdateUI
  export let currentUpdateUI: IUpdateUI = null;
  export let didMakeMove: boolean = false; // You can only make one move per updateUI
  export let animationEndedTimeout: ng.IPromise<any> = null;
  export let state: IState = null;
  export let isHelpModalShown: boolean = false;

  export function init() {
    translate.setTranslations(getTranslations());
    translate.setLanguage('en');
    log.log("Translation of 'TICTACTOE_RULES_TITLE' is " + translate('TICTACTOE_RULES_TITLE'));
    resizeGameAreaService.setWidthToHeight(1);
    moveService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      checkMoveOk: gameLogic.checkMoveOk,
      updateUI: updateUI,
      gotMessageFromPlatform: null,
    });

    let w: any = window;
    if (w["HTMLInspector"]) {
      setInterval(function () {
        w["HTMLInspector"].inspect({
          excludeRules: ["unused-classes", "script-placement"],
        });
      }, 3000);
    }
  }

  function getTranslations(): Translations {
    return {
      "TICTACTOE_RULES_TITLE": {
        "en": "Rules of TicTacToe",
        "iw": "חוקי המשחק",
        "pt": "Regras de Jogo da Velha",
        "zh": "井字游戏规则",
        "el": "Κανόνες TicTacToe",
        "fr": "Règles de TicTacToe",
        "hi": "TicTacToe के नियम",
        "es": "Reglas de TicTacToe"
      },
      "TICTACTOE_RULES_SLIDE1": {
        "en": "You and your opponent take turns to mark the grid in an empty spot. The first mark is X, then O, then X, then O, etc.",
        "iw": "אתה והיריב מסמנים איקס או עיגול כל תור",
        "pt": "Você e seu oponente se revezam para marcar a grade em um local vazio. A primeira marca é X, em seguida, O, então o X, em seguida, O, etc.",
        "zh": "你和你的对手轮流标志着一个空点网格。第一个标志是X，然后与O，则X，然后O等",
        "el": "Εσείς και ο αντίπαλός σας λαμβάνουν γυρίζει για να σηματοδοτήσει το πλέγμα σε ένα κενό σημείο. Το πρώτο σήμα είναι Χ, τότε O, τότε το Χ, τότε O, κ.λπ.",
        "fr": "Vous et votre adversaire se relaient pour marquer la grille dans un endroit vide. La première marque est X, O, X, puis O, etc.",
        "hi": "आप और अपने प्रतिद्वंद्वी को लेने के लिए एक खाली जगह में ग्रिड चिह्नित करने के लिए बदल जाता है। पहले मार्क एक्स, तो हे, तो एक्स, तो हे, आदि है",
        "es": "Usted y su oponente se da vuelta para marcar la red en un espacio vacío. La primera marca es X, entonces O, entonces X, a continuación, S, etc."
      },
      "TICTACTOE_RULES_SLIDE2": {
        "en": "The first to mark a whole row, column or diagonal wins.",
        "iw": "הראשון שמסמן שורה, עמודה או אלכסון מנצח",
        "pt": "O primeiro a marcar uma linha inteira, coluna ou diagonal vitórias.",
        "zh": "第一，以纪念一整行，列或对角线胜。",
        "el": "Ο πρώτος για να σηματοδοτήσει μια ολόκληρη σειρά, στήλη ή διαγώνιο νίκες.",
        "fr": "Le premier à marquer une ligne entière, colonne ou diagonale gagne.",
        "hi": "एक पूरी पंक्ति, स्तंभ या विकर्ण जीत चिह्नित करने के लिए पहले।",
        "es": "El primero en marcar toda una fila, columna o diagonal gana."
      },
      "TICTACTOE_CLOSE": {
        "en": "Close",
        "iw": "סגור",
        "pt": "Fechar",
        "zh": "继续游戏",
        "el": "Κοντά",
        "fr": "Fermer",
        "hi": "बंद करे",
        "es": "Cerrar"
      },
    };
  }

  function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    didMakeMove = false; // Only one move per updateUI
    currentUpdateUI = params;
    clearAnimationTimeout();
    state = params.move.stateAfterMove;
    if (isFirstMove()) {
      state = gameLogic.getInitialState();
      if (isMyTurn()) makeMove(gameLogic.createInitialMove());
    } else {
      // We calculate the AI move only after the animation finishes,
      // because if we call aiService now
      // then the animation will be paused until the javascript finishes.
      animationEndedTimeout = $timeout(animationEndedCallback, 500);
    }
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
    let move = aiService.findComputerMove(currentUpdateUI.move);
    log.info("Computer move: ", move);
    makeMove(move);
  }
  
  function makeMove(move: IMove) {
    if (didMakeMove) { // Only one move per updateUI
      return;
    }
    didMakeMove = true;
    moveService.makeMove(move);
  }
  
  function isFirstMove() {
    return !currentUpdateUI.move.stateAfterMove;
  }
  
  function yourPlayerIndex() {
    return currentUpdateUI.yourPlayerIndex;
  }
  
  function isComputer() {
    return currentUpdateUI.playersInfo[currentUpdateUI.yourPlayerIndex].playerId === '';
  }
  
  function isComputerTurn() {
    return isMyTurn() && isComputer();
  }
  
  function isHumanTurn() {
    return isMyTurn() && !isComputer();
  }
  
  function isMyTurn() {
    return !didMakeMove && // you can only make one move per updateUI.
      currentUpdateUI.move.turnIndexAfterMove >= 0 && // game is ongoing
      currentUpdateUI.yourPlayerIndex === currentUpdateUI.move.turnIndexAfterMove; // it's my turn
  }

  export function cellClicked(row: number, col: number): void {
    log.info("Clicked on cell:", row, col);
    if (!isHumanTurn()) return;
    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }
    let nextMove: IMove = null;
    try {
      nextMove = gameLogic.createMove(
          state, row, col, currentUpdateUI.move.turnIndexAfterMove);
    } catch (e) {
      log.info(["Cell is already full in position:", row, col]);
      return;
    }
    // Move is legal, make it!
    makeMove(nextMove);
  }

  export function shouldShowImage(row: number, col: number): boolean {
    let cell = state.board[row][col];
    return cell !== "";
  }

  export function isPieceX(row: number, col: number): boolean {
    return state.board[row][col] === 'X';
  }

  export function isPieceO(row: number, col: number): boolean {
    return state.board[row][col] === 'O';
  }

  export function shouldSlowlyAppear(row: number, col: number): boolean {
    return state.delta &&
        state.delta.row === row && state.delta.col === col;
  }

  export function clickedOnModal(evt: Event) {
    if (evt.target === evt.currentTarget) {
      evt.preventDefault();
      evt.stopPropagation();
      isHelpModalShown = false;
    }
    return true;
  }
}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
    $rootScope['game'] = game;
    game.init();
  });
