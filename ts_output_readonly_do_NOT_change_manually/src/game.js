;
var game;
(function (game) {
    game.direction = true;
    function flipDirection() { game.direction = !game.direction; }
    game.flipDirection = flipDirection;
    game.$rootScope = null;
    game.$timeout = null;
    // Global variables are cleared when getting updateUI.
    // I export all variables to make it easy to debug in the browser by
    // simply typing in the console, e.g.,
    // game.currentUpdateUI
    game.currentUpdateUI = null;
    game.didMakeMove = false; // You can only make one move per updateUI
    game.animationEndedTimeout = null;
    game.state = null;
    // For community games.
    game.proposals = null;
    game.yourPlayerInfo = null;
    function init($rootScope_, $timeout_) {
        game.$rootScope = $rootScope_;
        game.$timeout = $timeout_;
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
    game.init = init;
    function registerServiceWorker() {
        // I prefer to use appCache over serviceWorker
        // (because iOS doesn't support serviceWorker, so we have to use appCache)
        // I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
        if (!window.applicationCache && 'serviceWorker' in navigator) {
            var n = navigator;
            log.log('Calling serviceWorker.register');
            n.serviceWorker.register('service-worker.js').then(function (registration) {
                log.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(function (err) {
                log.log('ServiceWorker registration failed: ', err);
            });
        }
    }
    function getTranslations() {
        return {};
    }
    function communityUI(communityUI) {
        log.info("Game got communityUI:", communityUI);
        // If only proposals changed, then do NOT call updateUI. Then update proposals.
        var nextUpdateUI = {
            playersInfo: [],
            playMode: communityUI.yourPlayerIndex,
            numberOfPlayers: communityUI.numberOfPlayers,
            state: communityUI.state,
            turnIndex: communityUI.turnIndex,
            endMatchScores: communityUI.endMatchScores,
            yourPlayerIndex: communityUI.yourPlayerIndex,
        };
        if (angular.equals(game.yourPlayerInfo, communityUI.yourPlayerInfo) &&
            game.currentUpdateUI && angular.equals(game.currentUpdateUI, nextUpdateUI)) {
        }
        else {
            // Things changed, so call updateUI.
            updateUI(nextUpdateUI);
        }
        // This must be after calling updateUI, because we nullify things there (like playerIdToProposal&proposals&etc)
        game.yourPlayerInfo = communityUI.yourPlayerInfo;
        var playerIdToProposal = communityUI.playerIdToProposal;
        game.didMakeMove = !!playerIdToProposal[communityUI.yourPlayerInfo.playerId];
        game.proposals = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            game.proposals[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                game.proposals[i][j] = 0;
            }
        }
        for (var playerId in playerIdToProposal) {
            var proposal = playerIdToProposal[playerId];
            var delta = proposal.data;
            game.proposals[delta.row][delta.col]++;
        }
    }
    game.communityUI = communityUI;
    function isProposal(row, col) {
        return game.proposals && game.proposals[row][col] > 0;
    }
    game.isProposal = isProposal;
    function isProposal1(row, col) {
        return game.proposals && game.proposals[row][col] == 1;
    }
    game.isProposal1 = isProposal1;
    function isProposal2(row, col) {
        return game.proposals && game.proposals[row][col] == 2;
    }
    game.isProposal2 = isProposal2;
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        game.didMakeMove = false; // Only one move per updateUI
        game.currentUpdateUI = params;
        clearAnimationTimeout();
        game.state = params.state;
        if (isFirstMove()) {
            game.state = gameLogic.getInitialState();
        }
        // We calculate the AI move only after the animation finishes,
        // because if we call aiService now
        // then the animation will be paused until the javascript finishes.
        game.animationEndedTimeout = game.$timeout(animationEndedCallback, 500);
    }
    game.updateUI = updateUI;
    function animationEndedCallback() {
        log.info("Animation ended");
        maybeSendComputerMove();
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            game.$timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    function maybeSendComputerMove() {
        if (!isComputerTurn())
            return;
        var currentMove = {
            endMatchScores: game.currentUpdateUI.endMatchScores,
            state: game.currentUpdateUI.state,
            turnIndex: game.currentUpdateUI.turnIndex,
        };
        var move = aiService.findComputerMove(currentMove);
        log.info("Computer move: ", move);
        makeMove(move);
    }
    function makeMove(move) {
        if (game.didMakeMove) {
            return;
        }
        game.didMakeMove = true;
        if (!game.proposals) {
            gameService.makeMove(move);
        }
        else {
            var delta = move.state.delta;
            var myProposal = {
                data: delta,
                chatDescription: '' + (delta.row + 1) + 'x' + (delta.col + 1),
                playerInfo: game.yourPlayerInfo,
            };
            // Decide whether we make a move or not (if we have 2 other proposals supporting the same thing).
            if (game.proposals[delta.row][delta.col] < 2) {
                move = null;
            }
            gameService.communityMove(myProposal, move);
        }
    }
    function isFirstMove() {
        return !game.currentUpdateUI.state;
    }
    function yourPlayerIndex() {
        return game.currentUpdateUI.yourPlayerIndex;
    }
    function isComputer() {
        var playerInfo = game.currentUpdateUI.playersInfo[game.currentUpdateUI.yourPlayerIndex];
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
        return !game.didMakeMove &&
            game.currentUpdateUI.turnIndex >= 0 &&
            game.currentUpdateUI.yourPlayerIndex === game.currentUpdateUI.turnIndex; // it's my turn
    }
    function cellClickedYours(row, col, direction) {
        log.info("Your Board cell:", row, col);
        //log.info("Game got:", row);
        if (!isHumanTurn())
            return;
        var nextMove = null;
        try {
            nextMove = gameLogic.createMove(game.state, row, col, game.currentUpdateUI.turnIndex, 1, direction);
        }
        catch (e) {
            return;
        }
        // Move is legal, make it!
        makeMove(nextMove);
    }
    game.cellClickedYours = cellClickedYours;
    function cellClickedMy(row, col, direction) {
        log.info("My Board cell:", row, col);
        //log.info("Game got:", row);
        if (!isHumanTurn())
            return;
        var nextMove = null;
        try {
            nextMove = gameLogic.createMove(game.state, row, col, game.currentUpdateUI.turnIndex, 0, direction);
        }
        catch (e) {
            log.info(["Cell is already full in position:", row, col]);
            return;
        }
        // Move is legal, make it!
        makeMove(nextMove);
    }
    game.cellClickedMy = cellClickedMy;
    function myHover(row, col, direction) {
        var compensate = 0;
        var length = 5 - game.state.ship;
        var show = true;
        if (direction == true) {
            if (!gameLogic.validSet(game.state.myBoard, row, col, length, direction))
                compensate = row + length - gameLogic.ROWS;
            for (var i = 0; i < length; i++) {
                if (game.state.myBoard[row - compensate + i][col] !== "") {
                    show = false;
                    break;
                }
            }
        }
        else {
            if (!gameLogic.validSet(game.state.myBoard, row, col, length, direction))
                compensate = col + length - gameLogic.COLS;
            for (var i = 0; i < length; i++) {
                if (game.state.myBoard[row][col - compensate + i] !== "") {
                    show = false;
                    break;
                }
            }
        }
        if (show == true) {
            if (direction == true) {
                for (var i = 0; i < length; i++) {
                    document.getElementById('my' + (row - compensate + i) + 'x' + col).classList.add("myhover");
                }
            }
            else {
                for (var i = 0; i < length; i++) {
                    document.getElementById('my' + row + 'x' + (col - compensate + i)).classList.add("myhover");
                }
            }
        }
    }
    game.myHover = myHover;
    function myHoverLeave(row, col, direction) {
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
        if (direction == true) {
            for (var i = 0; i < gameLogic.ROWS; i++) {
                if (document.getElementById('my' + i + 'x' + col).classList.contains("myhover")) {
                    document.getElementById('my' + i + 'x' + col).classList.remove("myhover");
                }
            }
        }
        else {
            for (var i = 0; i < gameLogic.COLS; i++) {
                if (document.getElementById('my' + row + 'x' + i).classList.contains("myhover")) {
                    document.getElementById('my' + row + 'x' + i).classList.remove("myhover");
                }
            }
        }
    }
    game.myHoverLeave = myHoverLeave;
    function yourHover(row, col) {
        return game.state.yourBoard[row][col] === "";
    }
    game.yourHover = yourHover;
    function shouldShowImage(row, col, whichboard) {
        if (whichboard == 0) {
            return game.state.myBoard[row][col] !== "" || isProposal(row, col);
        }
        else {
            return game.state.yourBoard[row][col] !== "" || isProposal(row, col);
        }
    }
    game.shouldShowImage = shouldShowImage;
    function isPiece(row, col, turnIndex, pieceKind, whichboard) {
        if (whichboard == 0) {
            return game.state.myBoard[row][col] === pieceKind || (isProposal(row, col) && game.currentUpdateUI.turnIndex == turnIndex);
        }
        else {
            return game.state.yourBoard[row][col] === pieceKind || (isProposal(row, col) && game.currentUpdateUI.turnIndex == turnIndex);
        }
    }
    function isPieceX(row, col, whichboard) {
        return isPiece(row, col, 0, 'X', whichboard);
    }
    game.isPieceX = isPieceX;
    function isPieceO(row, col, whichboard) {
        return isPiece(row, col, 1, 'O', whichboard);
    }
    game.isPieceO = isPieceO;
    function isPieceM(row, col, whichboard) {
        return isPiece(row, col, 1, 'M', whichboard);
    }
    game.isPieceM = isPieceM;
    function shouldSlowlyAppear(row, col) {
        return game.state.delta &&
            game.state.delta.row === row && game.state.delta.col === col;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
})(game || (game = {}));
angular.module('myApp', ['gameServices'])
    .run(['$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        $rootScope['game'] = game;
        game.init($rootScope, $timeout);
    }]);
//# sourceMappingURL=game.js.map