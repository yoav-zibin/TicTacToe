var game;
(function (game) {
    var animationEnded = false;
    var canMakeMove = false;
    var isComputerTurn = false;
    var lastUpdateUI = null;
    var state = null;
    var turnIndex = null;
    game.isHelpModalShown = false;
    function init() {
        console.log("Translation of 'RULES_OF_JUNGLE' is " + translate('RULES_OF_JUNGLE'));
        resizeGameAreaService.setWidthToHeight(7 / 9);
        gameService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI
        });
        // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
        document.addEventListener("animationend", animationEndedCallback, false); // standard
        document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
        document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
    }
    game.init = init;
    function animationEndedCallback() {
        $rootScope.$apply(function () {
            log.info("Animation ended");
            animationEnded = true;
            if (isComputerTurn) {
                sendComputerMove();
            }
        });
    }
    function sendComputerMove() {
        gameService.makeMove(aiService.createComputerMove(state.board, turnIndex, 
        // at most 1 second for the AI to choose a move (but might be much quicker)
        { millisecondsLimit: 1000 }));
    }
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        animationEnded = false;
        lastUpdateUI = params;
        state = params.stateAfterMove;
        if (!state.board) {
            state.board = gameLogic.getInitialBoard();
        }
        canMakeMove = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        turnIndex = params.turnIndexAfterMove;
        // Is it the computer's turn?
        isComputerTurn = canMakeMove && params.playersInfo[params.yourPlayerIndex].playerId === '';
        if (isComputerTurn) {
            // To make sure the player won't click something and send a move instead of the computer sending a move.
            canMakeMove = false;
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            if (!state.delta) {
                // This is the first move in the match, so
                // there is not going to be an animation, so
                // call sendComputerMove() now (can happen in ?onlyAIs mode)
                sendComputerMove();
            }
        }
    }
    // export function cellClicked(row: number, col: number): void {
    //   log.info(["Clicked on cell:", row, col]);
    //   if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
    //     throw new Error("Throwing the error because URL has '?throwException'");
    //   }
    //   if (!canMakeMove) {
    //     return;
    //   }
    //   try {
    //
    //   } catch (e) {
    //     log.info(["Cell is already full in position:", row, col]);
    //     return;
    //   }
    // }
    function shouldShowImage(row, col) {
        var cell = state.board[row][col];
        if (cell === 'L' || cell === 'R' || cell === 'WDen' || cell === 'BDen' || cell === 'WTrap' || cell === 'BTrap') {
            return false;
        }
        else {
            return true;
        }
    }
    game.shouldShowImage = shouldShowImage;
    function isLand(row, col) {
        return !isRiver(row, col);
    }
    game.isLand = isLand;
    function isRiver(row, col) {
        if ((row >= 3 && row <= 5 && col >= 1 && col <= 2) || (row >= 3 && row <= 5 && col >= 4 && col <= 5)) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isRiver = isRiver;
    function isWTrap(row, col) {
        if ((row === 0 && col === 2) || (row === 1 && col === 3) || (row === 0 && col === 4)) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isWTrap = isWTrap;
    function isBTrap(row, col) {
        if ((row === 8 && col === 2) || (row === 7 && col === 3) || (row === 8 && col === 4)) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBTrap = isBTrap;
    function isWDen(row, col) {
        if (row === 0 && col === 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isWDen = isWDen;
    function isBDen(row, col) {
        if (row === 8 && col === 3) {
            return true;
        }
        else {
            return false;
        }
    }
    game.isBDen = isBDen;
    function shouldSlowlyAppear(row, col) {
        return !animationEnded &&
            state.delta &&
            state.delta.row === row && state.delta.col === col;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
    function getImageSrc(row, col) {
        var cell = state.board[row][col];
        return getPieceKind(cell);
    }
    game.getImageSrc = getImageSrc;
    function getPieceKind(piece) {
        switch (piece) {
            case 'WLion': return 'imgs/WLion.gif';
            case 'WTiger': return 'imgs/WTiger.gif';
            case 'WDog': return 'imgs/WDog.gif';
            case 'WCat': return 'imgs/WCat.gif';
            case 'WMouse': return 'imgs/WMouse.gif';
            case 'WLeopard': return 'imgs/WLeopard.gif';
            case 'WWolf': return 'imgs/WWolf.gif';
            case 'WElephant': return 'imgs/WElephant.gif';
            case 'BLion': return 'imgs/BLion.gif';
            case 'BTiger': return 'imgs/BTiger.gif';
            case 'BDog': return 'imgs/BDog.gif';
            case 'BCat': return 'imgs/BCat.gif';
            case 'BMouse': return 'imgs/BMouse.gif';
            case 'BLeopard': return 'imgs/BLeopard.gif';
            case 'BWolf': return 'imgs/BWolf.gif';
            case 'BElephant': return 'imgs/BElephant.gif';
            default: return '';
        }
    }
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        RULES_OF_JUNGLE: "Rules of Jungle",
        RULES_SLIDE1: "You and your opponent take turns to mark the grid in an empty spot. The first mark is X, then O, then X, then O, etc.",
        RULES_SLIDE2: "Higher ranking pieces can capture all pieces of identical or weaker ranking. However there is one exception: The mouse may capture the elephant, while the elephant cannot capture the mouse",
        RULES_SLIDE3: "The animal ranking, from strongest to weakest, is: Elephant, Lion, Tiger, Leopard, Wolf, Dog, Cat, Mouse",
        RULES_SLIDE4: "The rat is the only animal that is allowed to go onto a water square. The rat may not capture the elephant or another rat on land directly from a water square.",
        RULES_SLIDE5: "Lions and tigers are able to leap over water (either horizontally or vertically). They cannot jump over the water when a rat is on any of the intervening water squares.",
        RULES_SLIDE6: "When a piece is in an opponent's trap, any of the opponent's pieces may capture it regardless its strength. A piece in one of its own traps is unaffected.",
        CLOSE: "Close"
    });
    game.init();
});
