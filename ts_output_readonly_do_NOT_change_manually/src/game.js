;
var game;
(function (game) {
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
    game.colors = [];
    function init($rootScope_, $timeout_) {
        game.$rootScope = $rootScope_;
        game.$timeout = $timeout_;
        registerServiceWorker();
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        resizeGameAreaService.setWidthToHeight(1);
        gameService.setGame({
            updateUI: updateUI,
            getStateForOgImage: null,
        });
        game.colors[0] = "red";
        game.colors[1] = "yellow";
        game.colors[2] = "lime";
        game.colors[3] = "aqua";
        game.colors[4] = "blue";
        game.colors[5] = "purple";
        game.colors[6] = "gray";
        game.colors[7] = "orange";
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
    function isProposal(row, col) {
        return game.proposals && game.proposals[row][col] > 0;
    }
    game.isProposal = isProposal;
    function getCellStyle(row, col) {
        if (!isProposal(row, col))
            return {};
        // proposals[row][col] is > 0
        var countZeroBased = game.proposals[row][col] - 1;
        var maxCount = game.currentUpdateUI.numberOfPlayersRequiredToMove - 2;
        var ratio = maxCount == 0 ? 1 : countZeroBased / maxCount; // a number between 0 and 1 (inclusive).
        // scale will be between 0.6 and 0.8.
        var scale = 0.6 + 0.2 * ratio;
        // opacity between 0.5 and 0.7
        var opacity = 0.5 + 0.2 * ratio;
        return {
            transform: "scale(" + scale + ", " + scale + ")",
            opacity: "" + opacity,
        };
    }
    game.getCellStyle = getCellStyle;
    function getProposalsBoard(playerIdToProposal) {
        var proposals = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            proposals[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                proposals[i][j] = 0;
            }
        }
        for (var playerId in playerIdToProposal) {
            var proposal = playerIdToProposal[playerId];
            var delta = proposal.data;
            proposals[delta.row][delta.col]++;
        }
        return proposals;
    }
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        var playerIdToProposal = params.playerIdToProposal;
        // Only one move/proposal per updateUI
        game.didMakeMove = playerIdToProposal && playerIdToProposal[game.yourPlayerInfo.playerId] != undefined;
        game.yourPlayerInfo = params.yourPlayerInfo;
        game.proposals = playerIdToProposal ? getProposalsBoard(playerIdToProposal) : null;
        if (playerIdToProposal) {
            // If only proposals changed, then return.
            // I don't want to disrupt the player if he's in the middle of a move.
            // I delete playerIdToProposal field from params (and so it's also not in currentUpdateUI),
            // and compare whether the objects are now deep-equal.
            params.playerIdToProposal = null;
            if (game.currentUpdateUI && angular.equals(game.currentUpdateUI, params))
                return;
        }
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
            gameService.makeMove(move, null);
        }
        else {
            // TODO implement community game later.
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
    function cellClicked(row, col) {
        log.info("Clicked on cell:", row, col);
        if (!isHumanTurn())
            return;
        var nextMove = null;
        try {
            nextMove = gameLogic.createMove(game.state, row, col, game.currentUpdateUI.turnIndex);
        }
        catch (e) {
            log.info(["Cell is already full in position:", row, col]);
            return;
        }
        // Move is legal, make it!
        makeMove(nextMove);
    }
    game.cellClicked = cellClicked;
    function shouldShowImage(row, col) {
        return game.state.shownBoard[row][col] !== -1 || isProposal(row, col);
    }
    game.shouldShowImage = shouldShowImage;
    function shouldSlowlyAppear(row, col) {
        return (game.state.delta1 && game.state.delta1.row === row && game.state.delta1.col === col) ||
            (game.state.delta2 && game.state.delta2.row === row && game.state.delta2.col === col);
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
    function getColor(row, col) {
        var idx = game.state.board[row][col];
        return game.colors[idx];
    }
    game.getColor = getColor;
})(game || (game = {}));
angular.module('myApp', ['gameServices'])
    .run(['$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        $rootScope['game'] = game;
        game.init($rootScope, $timeout);
    }]);
//# sourceMappingURL=game.js.map