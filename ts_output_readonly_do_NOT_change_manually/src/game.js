;
var game;
(function (game) {
    // I export all variables to make it easy to debug in the browser by
    // simply typing in the console:
    // game.state
    game.animationEnded = false;
    game.canMakeMove = false;
    game.isComputerTurn = false;
    game.move = null;
    game.state = null;
    game.isHelpModalShown = false;
    function init() {
        /*
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        log.log("Translation of 'RULES_OF_TICTACTOE' is " + translate('RULES_OF_TICTACTOE'));
        resizeGameAreaService.setWidthToHeight(1);
        moveService.setGame({
          minNumberOfPlayers: 2,
          maxNumberOfPlayers: 2,
          checkMoveOk: gameLogic.checkMoveOk,
          updateUI: updateUI
        });
    
        // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
        document.addEventListener("animationend", animationEndedCallback, false); // standard
        document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
        document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
    
        let w: any = window;
        if (w["HTMLInspector"]) {
          setInterval(function () {
            w["HTMLInspector"].inspect({
              excludeRules: ["unused-classes", "script-placement"],
            });
          }, 3000);
        }
        */
    }
    game.init = init;
    function getTranslations() {
        return {
            RULES_OF_TICTACTOE: {
                en: "Rules of Pioneers",
                iw: "חוקי המשחק",
            },
            RULES_SLIDE1: {
                en: "You and your opponent take turns to mark the grid in an empty spot. The first mark is X, then O, then X, then O, etc.",
                iw: "אתה והיריב מסמנים איקס או עיגול כל תור",
            },
            RULES_SLIDE2: {
                en: "The first to mark a whole row, column or diagonal wins.",
                iw: "הראשון שמסמן שורה, עמודה או אלכסון מנצח",
            },
            CLOSE: {
                en: "Close",
                iw: "סגור",
            },
        };
    }
    function animationEndedCallback() {
        $rootScope.$apply(function () {
            log.info("Animation ended");
            game.animationEnded = true;
            sendComputerMove();
        });
    }
    function sendComputerMove() {
        if (!game.isComputerTurn) {
            return;
        }
        game.isComputerTurn = false; // to make sure the computer can only move once.
        moveService.makeMove(aiService.findComputerMove(game.move));
    }
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        game.animationEnded = false;
        game.move = params.move;
        game.state = game.move.stateAfterMove;
        if (!game.state) {
            game.state = gameLogic.getInitialState();
        }
        game.canMakeMove = game.move.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === game.move.turnIndexAfterMove; // it's my turn
        // Is it the computer's turn?
        game.isComputerTurn = game.canMakeMove &&
            params.playersInfo[params.yourPlayerIndex].playerId === '';
        if (game.isComputerTurn) {
            // To make sure the player won't click something and send a move instead of the computer sending a move.
            game.canMakeMove = false;
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            if (!game.state.delta) {
                // This is the first move in the match, so
                // there is not going to be an animation, so
                // call sendComputerMove() now (can happen in ?onlyAIs mode)
                sendComputerMove();
            }
        }
    }
    function cellClicked(row, col) {
        /*
        log.info("Clicked on cell:", row, col);
        if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
          throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!canMakeMove) {
          return;
        }
        try {
          let nextMove = gameLogic.createMove(
              state, row, col, move.turnIndexAfterMove);
          canMakeMove = false; // to prevent making another move
          moveService.makeMove(nextMove);
        } catch (e) {
          log.info(["Cell is already full in position:", row, col]);
          return;
        }
        */
    }
    game.cellClicked = cellClicked;
    function shouldShowImage(row, col) {
        /*
        let cell = state.board[row][col];
        return cell !== "";
        */
        return true;
    }
    game.shouldShowImage = shouldShowImage;
    function isPieceX(row, col) {
        //return state.board[row][col] === 'X';
        return true;
    }
    game.isPieceX = isPieceX;
    function isPieceO(row, col) {
        //return state.board[row][col] === 'O';
        return true;
    }
    game.isPieceO = isPieceO;
    function shouldSlowlyAppear(row, col) {
        /*
        return !animationEnded &&
            state.delta &&
            state.delta.row === row && state.delta.col === col;
        */
        return false;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
    function clickedOnModal(evt) {
        /*
        if (evt.target === evt.currentTarget) {
          evt.preventDefault();
          evt.stopPropagation();
          isHelpModalShown = false;
        }
        return true;
        */
        return true;
    }
    game.clickedOnModal = clickedOnModal;
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    game.init();
});
//# sourceMappingURL=game.js.map