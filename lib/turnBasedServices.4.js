"use strict"; var emulatorServicesCompilationDate = "Mon Jan 9 10:24:23 EST 2017";

;
var gamingPlatform;
(function (gamingPlatform) {
    var log;
    (function (log_1) {
        var ILogLevel = (function () {
            function ILogLevel() {
            }
            ILogLevel.ALWAYS = 'ALWAYS';
            ILogLevel.LOG = 'LOG';
            ILogLevel.INFO = 'INFO';
            ILogLevel.DEBUG = 'DEBUG';
            ILogLevel.WARN = 'WARN';
            ILogLevel.ERROR = 'ERROR';
            return ILogLevel;
        })();
        var alwaysLogs = [];
        var lastLogs = [];
        var startTime = getCurrentTime();
        function getCurrentTime() {
            return new Date().getTime();
        }
        log_1.getCurrentTime = getCurrentTime;
        function getLogEntry(args, logLevel, consoleFunc) {
            var millisecondsFromStart = getCurrentTime() - startTime;
            // Note that if the first argument to console.log is a string,
            // then it's supposed to be a format string, see:
            // https://developer.mozilla.org/en-US/docs/Web/API/Console/log
            // However, the output looks better on chrome if I pass a string as the first argument,
            // and I hope then it doesn't break anything anywhere else...
            var secondsFromStart = millisecondsFromStart / 1000;
            var consoleArgs = ['', secondsFromStart, ' seconds:'].concat(args);
            consoleFunc.apply(console, consoleArgs);
            return { millisecondsFromStart: millisecondsFromStart, args: args, logLevel: logLevel };
        }
        function storeLog(args, logLevel, consoleFunc) {
            if (lastLogs.length > 100) {
                lastLogs.shift();
            }
            lastLogs.push(getLogEntry(args, logLevel, consoleFunc));
        }
        function getLogs() {
            return lastLogs.concat(alwaysLogs);
        }
        log_1.getLogs = getLogs;
        function alwaysLog() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            alwaysLogs.push(getLogEntry(args, ILogLevel.ALWAYS, console.log));
        }
        log_1.alwaysLog = alwaysLog;
        function info() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            storeLog(args, ILogLevel.INFO, console.log); // Not console.info on purpose: info is considered a warning in protractor.
        }
        log_1.info = info;
        function debug() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            storeLog(args, ILogLevel.DEBUG, console.debug);
        }
        log_1.debug = debug;
        function warn() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            storeLog(args, ILogLevel.WARN, console.warn);
        }
        log_1.warn = warn;
        function error() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            storeLog(args, ILogLevel.ERROR, console.error);
        }
        log_1.error = error;
        function log() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            storeLog(args, ILogLevel.LOG, console.log);
        }
        log_1.log = log;
        window.addEventListener("error", function (e) {
            error("Had an error! Message=", e.error ? e.error.message : '', " stacktrace=", e.error ? e.error.stack : '');
        });
    })(log = gamingPlatform.log || (gamingPlatform.log = {}));
})(gamingPlatform || (gamingPlatform = {}));
//# sourceMappingURL=log.js.map
;
var gamingPlatform;
(function (gamingPlatform) {
    var messageService;
    (function (messageService) {
        var gameUrl = location.toString();
        function sendMessage(message) {
            gamingPlatform.log.info("Game sent message", message);
            message.gameUrl = gameUrl;
            window.parent.postMessage(message, "*");
        }
        messageService.sendMessage = sendMessage;
        ;
        function addMessageListener(listener) {
            window.addEventListener("message", function (event) {
                var source = event.source;
                if (source !== window.parent) {
                    return;
                }
                var message = event.data;
                gamingPlatform.log.info("Game got message", message);
                gamingPlatform.$rootScope.$apply(function () {
                    listener(message);
                });
            }, false);
        }
        messageService.addMessageListener = addMessageListener;
        ;
    })(messageService = gamingPlatform.messageService || (gamingPlatform.messageService = {}));
})(gamingPlatform || (gamingPlatform = {}));
//# sourceMappingURL=messageService.js.map
;
var gamingPlatform;
(function (gamingPlatform) {
    var gameService;
    (function (gameService) {
        var isLocalTesting = window.parent === window;
        // UI for local testing
        var playersInCommunity = 5;
        gameService.playModes = ["passAndPlay", "playAgainstTheComputer", "onlyAIs", "multiplayer", "community"];
        gameService.playMode = "passAndPlay";
        gameService.supportedLanguages = [{ name: "English", code: "en" },
            { name: "עברית", code: "iw" },
            { name: "português", code: "pt" },
            { name: "中文", code: "zh" },
            { name: "ελληνικά", code: "el" },
            { name: "French", code: "fr" },
            { name: "हिन्दी", code: "hi" },
            { name: "español", code: "es" },
        ];
        gameService.currentLanguage = gameService.supportedLanguages[0];
        gameService.languageCode = "en";
        gameService.ogImageMaker = "https://dotted-guru-139914.appspot.com/";
        gameService.numberOfPlayers = 2;
        gameService.iframeRows = 1;
        gameService.iframeCols = 1;
        gameService.locationTrustedStr = null;
        var game;
        var playersInfo;
        gameService.history = [];
        gameService.historyIndex = 0;
        var playerIdToProposal = null;
        gameService.savedStates = [];
        gameService.selectedSavedStateToLoad = null;
        // test ogImage, getLogs, etc
        var testingHtml = "\n    <div style=\"position:absolute; width:100%; height:10%; overflow: scroll;\">\n      <select\n        ng-options=\"playMode for playMode in gameService.playModes track by playMode\"\n        ng-model=\"gameService.playMode\"\n        ng-change=\"gameService.reloadIframes()\"></select>\n      <button ng-click=\"gameService.startNewMatch()\">Start new match</button>\n      <select ng-change=\"gameService.historyIndexChanged()\" ng-model=\"gameService.historyIndex\" ng-options=\"index for index in gameService.getIntegersTill(gameService.history.length)\">\n        <option value=\"\">-- current move --</option>\n      </select>\n      <select ng-change=\"gameService.currentLanguageChanged()\" ng-model=\"gameService.currentLanguage\" ng-options=\"language.name for language in gameService.supportedLanguages\">\n        <option value=\"\">-- current game language --</option>\n      </select>\n      <button ng-click=\"gameService.saveState()\">Save match</button>\n      <select ng-change=\"gameService.loadMatch()\" ng-model=\"gameService.selectedSavedStateToLoad\" ng-options=\"savedState.name for savedState in gameService.savedStates\">\n        <option value=\"\">-- load match --</option>\n      </select>\n      <input ng-model=\"gameService.ogImageMaker\">\n      <button ng-click=\"gameService.getOgImageState()\">Open AppEngine image</button>\n    </div>\n    <div style=\"position:absolute; width:100%; height:90%; top: 10%;\">\n      <div ng-repeat=\"row in gameService.getIntegersTill(gameService.iframeRows)\"\n          style=\"position:absolute; top:{{row * 100 / gameService.iframeRows}}%; left:0; width:100%; height:{{100 / gameService.iframeRows}}%;\">\n        <div ng-repeat=\"col in gameService.getIntegersTill(gameService.iframeCols)\"\n            style=\"position:absolute; top:0; left:{{col * 100 / gameService.iframeCols}}%; width:{{100 / gameService.iframeCols}}%; height:100%;\">\n          <iframe id=\"game_iframe_{{col + row*gameService.iframeCols}}\"\n            ng-src=\"{{gameService.locationTrustedStr}}\"\n            seamless=\"seamless\" style=\"position:absolute; width:100%; height:100%;\">\n          </iframe>\n        </div>\n      </div>\n    </div>\n  ";
        var cacheIntegersTill = [];
        function getIntegersTill(number) {
            if (cacheIntegersTill[number])
                return cacheIntegersTill[number];
            var res = [];
            for (var i = 0; i < number; i++) {
                res.push(i);
            }
            cacheIntegersTill[number] = res;
            return res;
        }
        gameService.getIntegersTill = getIntegersTill;
        function clearState() {
            var state = {
                turnIndex: 0,
                endMatchScores: null,
                state: null,
            };
            gameService.history = [state];
            gameService.historyIndex = 0;
            playerIdToProposal = {};
        }
        gameService.clearState = clearState;
        function historyIndexChanged() {
            // angular makes historyIndex a string!
            gameService.historyIndex = Number(gameService.historyIndex);
            playerIdToProposal = {};
            reloadIframes();
        }
        gameService.historyIndexChanged = historyIndexChanged;
        function startNewMatch() {
            clearState();
            reloadIframes();
        }
        gameService.startNewMatch = startNewMatch;
        function sendSetLanguage(id) {
            passMessage({ setLanguage: { language: gameService.currentLanguage.code } }, id);
        }
        function currentLanguageChanged() {
            for (var r = 0; r < gameService.iframeRows; r++) {
                for (var c = 0; c < gameService.iframeCols; c++) {
                    var id = c + r * gameService.iframeCols;
                    sendSetLanguage(id);
                }
            }
        }
        gameService.currentLanguageChanged = currentLanguageChanged;
        function saveState() {
            var defaultStateName = "Saved state " + gameService.savedStates.length;
            var stateName = prompt("Please enter the state name", defaultStateName);
            if (!stateName)
                stateName = defaultStateName;
            gameService.savedStates.push({ name: stateName, playerIdToProposal: playerIdToProposal, history: gameService.history });
            localStorage.setItem("savedStates", angular.toJson(gameService.savedStates, true));
        }
        gameService.saveState = saveState;
        function loadMatch() {
            if (!gameService.selectedSavedStateToLoad)
                return;
            gameService.history = angular.copy(gameService.selectedSavedStateToLoad.history);
            gameService.historyIndex = gameService.history.length - 1;
            playerIdToProposal = angular.copy(gameService.selectedSavedStateToLoad.playerIdToProposal);
            gameService.selectedSavedStateToLoad = null;
            reloadIframes();
        }
        gameService.loadMatch = loadMatch;
        function loadSavedStates() {
            var savedStatesJson = localStorage.getItem("savedStates");
            if (savedStatesJson)
                gameService.savedStates = angular.fromJson(savedStatesJson);
        }
        function getOgImageState() {
            passMessage({ getStateForOgImage: true }, 0);
        }
        gameService.getOgImageState = getOgImageState;
        function reloadIframes() {
            gamingPlatform.log.log("reloadIframes: playMode=", gameService.playMode);
            setPlayersInfo();
            // Setting to 0 to force the game to send gameReady and then it will get the correct changeUI.
            gameService.iframeRows = 0;
            gameService.iframeCols = 0;
            gamingPlatform.$timeout(function () {
                if (gameService.playMode == "community") {
                    gameService.iframeRows = gameService.numberOfPlayers;
                    gameService.iframeCols = playersInCommunity;
                }
                else if (gameService.playMode == "multiplayer") {
                    gameService.iframeRows = 1;
                    gameService.iframeCols = gameService.numberOfPlayers + 1;
                }
                else {
                    gameService.iframeRows = 1;
                    gameService.iframeCols = 1;
                }
            });
        }
        gameService.reloadIframes = reloadIframes;
        function checkMove(move) {
            if (!move) {
                throw new Error("Game called makeMove with a null move=" + move);
            }
            // Do some checks: turnIndexAfterMove is -1 iff endMatchScores is not null.
            var noTurnIndexAfterMove = move.turnIndex === -1;
            var hasEndMatchScores = !!move.endMatchScores;
            if (noTurnIndexAfterMove && !hasEndMatchScores) {
                throw new Error("Illegal move: turnIndexAfterMove was -1 but you forgot to set endMatchScores. Move=" +
                    angular.toJson(move, true));
            }
            if (hasEndMatchScores && !noTurnIndexAfterMove) {
                throw new Error("Illegal move: you set endMatchScores but you didn't set turnIndexAfterMove to -1. Move=" +
                    angular.toJson(move, true));
            }
        }
        gameService.checkMove = checkMove;
        function checkMakeMove(lastUpdateUI, move) {
            if (!lastUpdateUI) {
                throw new Error("Game called makeMove before getting updateUI or it called makeMove more than once for a single updateUI.");
            }
            var wasYourTurn = lastUpdateUI.turnIndex >= 0 &&
                lastUpdateUI.yourPlayerIndex === lastUpdateUI.turnIndex; // it's my turn
            if (!wasYourTurn) {
                throw new Error("Game called makeMove when it wasn't your turn: yourPlayerIndex=" + lastUpdateUI.yourPlayerIndex + " turnIndexAfterMove=" + lastUpdateUI.turnIndex);
            }
            checkMove(move);
        }
        function checkCommunityMove(lastCommunityUI, proposal, move) {
            if (!lastCommunityUI) {
                throw new Error("Don't call communityMove before getting communityUI.");
            }
            if (move) {
                checkMove(move);
            }
            var wasYourTurn = lastCommunityUI.turnIndex >= 0 &&
                lastCommunityUI.yourPlayerIndex === lastCommunityUI.turnIndex; // it's my turn
            if (!wasYourTurn) {
                throw new Error("Called communityMove when it wasn't your turn: yourPlayerIndex=" + lastCommunityUI.yourPlayerIndex + " turnIndexAfterMove=" + lastCommunityUI.turnIndex);
            }
            var oldProposal = lastCommunityUI.playerIdToProposal[lastCommunityUI.yourPlayerInfo.playerId];
            if (oldProposal) {
                throw new Error("Called communityMove when yourPlayerId already made a proposal, see: " + angular.toJson(oldProposal, true));
            }
        }
        function sendMessage(msg) {
            gamingPlatform.messageService.sendMessage(msg);
        }
        function setPlayersInfo() {
            playersInfo = [];
            for (var i = 0; i < gameService.numberOfPlayers; i++) {
                var playerId = gameService.playMode === "onlyAIs" ||
                    i !== 0 && gameService.playMode === "playAgainstTheComputer" ?
                    "" :
                    "" + (i + 42);
                playersInfo.push({ playerId: playerId, avatarImageUrl: null, displayName: null });
            }
        }
        function passMessage(msg, toIndex) {
            var iframe = window.document.getElementById("game_iframe_" + toIndex);
            iframe.contentWindow.postMessage(msg, "*");
        }
        function getIndexOfSource(src) {
            var i = 0;
            while (true) {
                var iframe = window.document.getElementById("game_iframe_" + i);
                if (!iframe) {
                    console.error("Can't find src=", src);
                    return -1;
                }
                if (iframe.contentWindow === src)
                    return i;
                i++;
            }
        }
        function overrideInnerHtml() {
            gamingPlatform.log.info("Overriding body's html");
            gameService.locationTrustedStr = gamingPlatform.$sce.trustAsResourceUrl(location.toString());
            var el = angular.element(testingHtml);
            window.document.body.innerHTML = '';
            angular.element(window.document.body).append(gamingPlatform.$compile(el)(gamingPlatform.$rootScope));
            window.addEventListener("message", function (event) {
                gamingPlatform.$rootScope.$apply(function () { return gotMessageFromGame(event); });
            });
        }
        function getState() {
            return gameService.history[gameService.historyIndex];
        }
        function getPlayerIndex(id) {
            if (gameService.playMode == "community") {
                // id = col + row*gameService.iframeCols;
                // iframeCols = playersInCommunity
                return Math.floor(id / gameService.iframeCols);
            }
            if (gameService.playMode == "multiplayer") {
                return id == gameService.numberOfPlayers ? -2 : id; // -2 is viewer
            }
            return getState().turnIndex;
        }
        function getChangeUI(id) {
            var index = getPlayerIndex(id);
            var state = getState();
            if (gameService.playMode == "community") {
                var communityUI = {
                    yourPlayerIndex: index,
                    yourPlayerInfo: {
                        avatarImageUrl: "",
                        displayName: "",
                        playerId: "playerId" + id,
                    },
                    playerIdToProposal: playerIdToProposal,
                    numberOfPlayers: gameService.numberOfPlayers,
                    state: state.state,
                    turnIndex: state.turnIndex,
                    endMatchScores: state.endMatchScores,
                };
                return { communityUI: communityUI };
            }
            var updateUI = {
                yourPlayerIndex: index,
                playersInfo: playersInfo,
                numberOfPlayers: gameService.numberOfPlayers,
                state: state.state,
                turnIndex: state.turnIndex,
                endMatchScores: state.endMatchScores,
                playMode: gameService.playMode == "multiplayer" ? index : gameService.playMode,
            };
            return { updateUI: updateUI };
        }
        function sendChangeUI(id) {
            passMessage(getChangeUI(id), id);
        }
        function getQueryString(params) {
            var res = [];
            for (var key in params) {
                var value = params[key];
                res.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
            }
            return res.join("&");
        }
        function getImageMakerUrl(stateStr) {
            var params = {};
            params["fbId0"] = "10153589934097337";
            params["fbId1"] = "10153693068502449";
            var state = getState();
            if (state.endMatchScores) {
                params["winner"] = state.endMatchScores[0] > state.endMatchScores[1] ? '0' : '1';
                ;
            }
            params["myIndex"] = '0';
            params["state"] = stateStr;
            return gameService.ogImageMaker + "?" + getQueryString(params);
        }
        function gotMessageFromGame(event) {
            var source = event.source;
            var id = getIndexOfSource(source);
            if (id == -1)
                return;
            var index = getPlayerIndex(id);
            var message = event.data;
            gamingPlatform.log.info("Platform got message", message);
            if (message.gameReady) {
                sendSetLanguage(id);
                sendChangeUI(id);
            }
            else if (message.sendStateForOgImage) {
                var imageMakerUrl = getImageMakerUrl(message.sendStateForOgImage);
                gamingPlatform.log.info(imageMakerUrl);
                window.open(imageMakerUrl, "_blank");
            }
            else {
                // Check last message
                var lastMessage = message.lastMessage;
                if (!angular.equals(lastMessage, getChangeUI(id))) {
                    console.warn("Ignoring message because message.lastMessage is wrong! This can happen if you play and immediately changed something like playMode. lastMessage=", lastMessage, " expected lastMessage=", getChangeUI(id));
                    return;
                }
                // Check move&prposal
                var move = message.move;
                var proposal = message.proposal;
                if (lastMessage.communityUI) {
                    checkCommunityMove(lastMessage.communityUI, proposal, move);
                }
                else {
                    checkMakeMove(lastMessage.updateUI, move);
                }
                if (index !== getState().turnIndex) {
                    throw new Error("Not your turn! yourPlayerIndex=" + index + " and the turn is of playerIndex=" + getState().turnIndex);
                }
                // Update state&proposals
                if (gameService.historyIndex != gameService.history.length - 1) {
                    // cut the future
                    gameService.history.splice(gameService.historyIndex + 1);
                    playerIdToProposal = {};
                }
                if (gameService.historyIndex != gameService.history.length - 1)
                    throw new Error("Internal err! historyIndex=" + gameService.historyIndex + " history.length=" + gameService.history.length);
                if (move) {
                    gameService.history.push(move);
                    gameService.historyIndex++;
                    playerIdToProposal = {};
                }
                else {
                    playerIdToProposal['playerId' + id] = proposal;
                }
                setTimeout(function () {
                    for (var r = 0; r < gameService.iframeRows; r++) {
                        for (var c = 0; c < gameService.iframeCols; c++) {
                            var id_1 = c + r * gameService.iframeCols;
                            sendChangeUI(id_1);
                        }
                    }
                }, 100);
            }
        }
        var lastChangeUiMessage = null;
        function communityMove(proposal, move) {
            checkCommunityMove(lastChangeUiMessage.communityUI, proposal, move);
            // I'm sending the move even in local testing to make sure it's simple json (or postMessage will fail).
            sendMessage({ proposal: proposal, move: move, lastMessage: lastChangeUiMessage });
            lastChangeUiMessage = null;
        }
        gameService.communityMove = communityMove;
        function makeMove(move) {
            checkMakeMove(lastChangeUiMessage.updateUI, move);
            // I'm sending the move even in local testing to make sure it's simple json (or postMessage will fail).
            sendMessage({ move: move, lastMessage: lastChangeUiMessage });
            lastChangeUiMessage = null; // to make sure you don't call makeMove until you get the next updateUI.
        }
        gameService.makeMove = makeMove;
        function callUpdateUI(updateUI) {
            lastChangeUiMessage = angular.copy({ updateUI: updateUI });
            game.updateUI(updateUI);
        }
        gameService.callUpdateUI = callUpdateUI;
        function callCommunityUI(communityUI) {
            lastChangeUiMessage = angular.copy({ communityUI: communityUI });
            game.communityUI(communityUI);
        }
        gameService.callCommunityUI = callCommunityUI;
        function gotMessageFromPlatform(message) {
            if (message.communityUI) {
                callCommunityUI(message.communityUI);
            }
            else if (message.updateUI) {
                callUpdateUI(message.updateUI);
            }
            else if (message.setLanguage) {
                gamingPlatform.translate.setLanguage(message.setLanguage.language);
            }
            else if (message.getGameLogs) {
                // To make sure students don't get:
                // Error: Uncaught DataCloneError: Failed to execute 'postMessage' on 'Window': An object could not be cloned.
                // I serialize to string and back.
                var plainPojoLogs = angular.fromJson(angular.toJson(gamingPlatform.log.getLogs()));
                setTimeout(function () {
                    sendMessage({ getGameLogsResult: plainPojoLogs });
                });
            }
            else if (message.getStateForOgImage) {
                sendMessage({ sendStateForOgImage: game.getStateForOgImage() });
            }
        }
        var didCallSetGame = false;
        function setGame(_game) {
            game = _game;
            setPlayersInfo();
            loadSavedStates();
            clearState();
            if (didCallSetGame) {
                throw new Error("You can call setGame exactly once!");
            }
            didCallSetGame = true;
            gamingPlatform.log.info("Called setGame");
            if (isLocalTesting) {
                gamingPlatform.$rootScope['gameService'] = gameService;
                gamingPlatform.$timeout(overrideInnerHtml, 50); // waiting a bit because the game might access the html (like boardArea) to listen to TouchEvents
            }
            else {
                gamingPlatform.messageService.addMessageListener(gotMessageFromPlatform);
            }
            // I wanted to delay sending gameReady until window.innerWidth and height are not 0,
            // but they will stay 0 (on ios) until we send gameReady (because platform will hide the iframe)
            sendMessage({ gameReady: "v4" });
            gamingPlatform.log.info("Calling 'fake' updateUI with yourPlayerIndex=-2 , meaning you're a viewer so you can't make a move");
            callUpdateUI({
                yourPlayerIndex: -2,
                playersInfo: playersInfo,
                numberOfPlayers: gameService.numberOfPlayers,
                state: null,
                turnIndex: 0,
                endMatchScores: null,
                playMode: "passAndPlay",
            });
        }
        gameService.setGame = setGame;
    })(gameService = gamingPlatform.gameService || (gamingPlatform.gameService = {}));
    var typeCheck_gameService = gameService;
})(gamingPlatform || (gamingPlatform = {}));
//# sourceMappingURL=gameService.js.map
;
var gamingPlatform;
(function (gamingPlatform) {
    var alphaBetaService;
    (function (alphaBetaService) {
        /**
         * Does alpha-beta search, starting from startingState,
         * where the first move is done by playerIndex (playerIndex is either 0 or 1),
         * then the next move is done by 1-playerIndex, etc.
         *
         * getNextStates(state, playerIndex) should return an array of the following states
         * and if state is a terminal state it should return an empty array.
         *
         * getStateScoreForIndex0(state, playerIndex) should return a score for
         * the state as viewed by player index 0, i.e.,
         * if player index 0 is probably winning then the score should be high.
         * Return Number.POSITIVE_INFINITY is player index 0 is definitely winning,
         * and Number.NEGATIVE_INFINITY if player index 0 is definitely losing.
         *
         * getDebugStateToString can either be null (and then there is no output to console)
         * or it can be a function, where getDebugStateToString(state) should return
         * a string representation of the state (which is used in calls to console.log).
         *
         * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
         * and it has either a millisecondsLimit or maxDepth field:
         * millisecondsLimit is a time limit, and maxDepth is a depth limit.
         */
        function alphaBetaDecision(startingState, playerIndex, getNextStates, getStateScoreForIndex0, 
            // If you want to see debugging output in the console, then surf to game.html?debug
            getDebugStateToString, alphaBetaLimits) {
            var move = alphaBetaDecisionMayReturnNull(startingState, playerIndex, getNextStates, getStateScoreForIndex0, getDebugStateToString, alphaBetaLimits);
            if (move) {
                return move;
            }
            // We run out of time, but we have to return a non-null move (no matter what).
            return getNextStates(startingState, playerIndex)[0];
        }
        alphaBetaService.alphaBetaDecision = alphaBetaDecision;
        function alphaBetaDecisionMayReturnNull(startingState, playerIndex, getNextStates, getStateScoreForIndex0, 
            // If you want to see debugging output in the console, then surf to game.html?debug
            getDebugStateToString, alphaBetaLimits) {
            // Checking input
            if (!startingState || !getNextStates || !getStateScoreForIndex0) {
                throw new Error("startingState or getNextStates or getStateScoreForIndex0 is null/undefined");
            }
            if (playerIndex !== 0 && playerIndex !== 1) {
                throw new Error("playerIndex must be either 0 or 1");
            }
            if (!alphaBetaLimits.millisecondsLimit && !alphaBetaLimits.maxDepth) {
                throw new Error("alphaBetaLimits must have either millisecondsLimit or maxDepth");
            }
            if (alphaBetaLimits.millisecondsLimit) {
                // 400 milliseconds is the max time (otherwise the app feels unresponsive).
                alphaBetaLimits.millisecondsLimit = Math.min(400, alphaBetaLimits.millisecondsLimit);
            }
            var startTime = new Date().getTime(); // used for the time limit
            if (alphaBetaLimits.maxDepth) {
                return getScoreForIndex0(startingState, playerIndex, getNextStates, getStateScoreForIndex0, getDebugStateToString, alphaBetaLimits, startTime, 0, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY).bestState;
            }
            // For time limits (without maxDepth), we do iterative deepening (A* search).
            if (getDebugStateToString != null) {
                console.log("Doing iterative-deepeninh (A*) until we run out of time or find a certain win/lose move.");
            }
            var maxDepth = 1;
            var bestState;
            while (true) {
                if (getDebugStateToString != null) {
                    console.log("Alpha-beta search until maxDepth=" + maxDepth);
                }
                var nextBestStateAndScore = getScoreForIndex0(startingState, playerIndex, getNextStates, getStateScoreForIndex0, getDebugStateToString, { maxDepth: maxDepth, millisecondsLimit: alphaBetaLimits.millisecondsLimit }, startTime, 0, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
                var nextBestScore = nextBestStateAndScore.bestScore;
                var nextBestState = nextBestStateAndScore.bestState;
                if (nextBestScore === Number.POSITIVE_INFINITY ||
                    nextBestScore === Number.NEGATIVE_INFINITY) {
                    var isWin = nextBestScore ===
                        (playerIndex === 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY);
                    console.log("Discovered that AI is going to " +
                        (isWin ? "win" : "lose") + " with maxDepth=" + maxDepth);
                    if (getDebugStateToString != null) {
                        console.log("Best state is " + getDebugStateToString(nextBestState));
                    }
                    return nextBestState;
                }
                var isHalfTimePassed = isTimeout({ millisecondsLimit: alphaBetaLimits.millisecondsLimit / 2 }, startTime);
                var isAllTimePassed = isTimeout(alphaBetaLimits, startTime);
                if (isHalfTimePassed || isAllTimePassed) {
                    // If we run out of half the time, then no point of starting a new search that
                    // will most likely take more time than all previous searches.
                    // It's more accurate to return the best state for the previous alpha-beta search
                    // if we run out of time, because we finished traversing all
                    // immediate children of the starting state.
                    var result = !isAllTimePassed || maxDepth === 1 ? nextBestState : bestState;
                    if (isAllTimePassed) {
                        console.log("Run out of time when maxDepth=" + maxDepth +
                            ", so returning the best state for maxDepth=" +
                            (maxDepth === 1 ? 1 : maxDepth - 1));
                    }
                    else {
                        console.log("Run out of half the time when maxDepth=" + maxDepth +
                            ", so no point of exploring the next depth.");
                    }
                    if (getDebugStateToString != null) {
                        console.log("Best state is " + getDebugStateToString(result));
                    }
                    return result;
                }
                bestState = nextBestState;
                maxDepth++;
            }
        }
        function isTimeout(alphaBetaLimits, startTime) {
            return alphaBetaLimits.millisecondsLimit &&
                new Date().getTime() - startTime > alphaBetaLimits.millisecondsLimit;
        }
        function getScoreForIndex0(startingState, playerIndex, getNextStates, getStateScoreForIndex0, 
            // If you want to see debugging output in the console, then surf to game.html?debug
            getDebugStateToString, alphaBetaLimits, startTime, depth, alpha, beta) {
            var bestScore = null;
            var bestState = null;
            if (isTimeout(alphaBetaLimits, startTime)) {
                if (getDebugStateToString != null) {
                    console.log("Run out of time, just quitting from this traversal.");
                }
                return { bestScore: 0, bestState: null }; // This traversal is "ruined" anyway because we ran out of time.
            }
            if (depth === alphaBetaLimits.maxDepth) {
                bestScore = getStateScoreForIndex0(startingState, playerIndex);
                if (getDebugStateToString != null) {
                    console.log("Max depth reached, score is " + bestScore);
                }
                return { bestScore: bestScore, bestState: null };
            }
            var states = getNextStates(startingState, playerIndex);
            if (getDebugStateToString != null) {
                console.log(getDebugStateToString(startingState) + " has " + states.length + " next states");
            }
            if (states.length === 0) {
                bestScore = getStateScoreForIndex0(startingState, playerIndex);
                if (getDebugStateToString != null) {
                    console.log("Terminal state, score is " + bestScore);
                }
                return { bestScore: bestScore, bestState: null };
            }
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                var scoreForIndex0 = getScoreForIndex0(state, 1 - playerIndex, getNextStates, getStateScoreForIndex0, getDebugStateToString, alphaBetaLimits, startTime, depth + 1, alpha, beta).bestScore;
                if (getDebugStateToString != null) {
                    console.log("Score of " + getDebugStateToString(state) + " is " + scoreForIndex0);
                }
                if (bestScore === null ||
                    playerIndex === 0 && scoreForIndex0 > bestScore ||
                    playerIndex === 1 && scoreForIndex0 < bestScore) {
                    bestScore = scoreForIndex0;
                    bestState = state;
                }
                if (playerIndex === 0) {
                    if (bestScore >= beta) {
                        return { bestScore: bestScore, bestState: bestState };
                    }
                    alpha = Math.max(alpha, bestScore);
                }
                else {
                    if (bestScore <= alpha) {
                        return { bestScore: bestScore, bestState: bestState };
                    }
                    beta = Math.min(beta, bestScore);
                }
            }
            if (getDebugStateToString != null) {
                console.log("Best next state for playerIndex " + playerIndex + " is " + getDebugStateToString(bestState) + " with score of " + bestScore);
            }
            return { bestScore: bestScore, bestState: bestState };
        }
    })(alphaBetaService = gamingPlatform.alphaBetaService || (gamingPlatform.alphaBetaService = {}));
    var typeCheck_alphaBetaService = alphaBetaService;
})(gamingPlatform || (gamingPlatform = {}));
//# sourceMappingURL=alphaBetaService.js.map
;
var gamingPlatform;
(function (gamingPlatform) {
    var resizeGameAreaService;
    (function (resizeGameAreaService) {
        var widthToHeight = null;
        var dimensionsChanged = null;
        var oldSizes = null;
        var doc = window.document;
        var gameArea;
        function setWidthToHeight(_widthToHeight, _dimensionsChanged) {
            gamingPlatform.log.info("setWidthToHeight to ", _widthToHeight);
            widthToHeight = _widthToHeight;
            dimensionsChanged = _dimensionsChanged;
            gameArea = doc.getElementById('gameArea');
            if (!gameArea) {
                throw new Error("You forgot to add to your <body> this div: <div id='gameArea'>...</div>");
            }
            oldSizes = null;
            rescale();
            // on iOS there was a bug, if you clicked on a ycheckers notification (when app was killed)
            // then you would miss the animation (because width&height are initially 0, so it took a second to be shown).
            // So I added these timeouts.
            // we usually call setWidthToHeight and gameService.setGame (which sends gameReady) together,
            // so the iframe will be visilble very soon...
            setTimeout(rescale, 10);
            setTimeout(rescale, 100);
        }
        resizeGameAreaService.setWidthToHeight = setWidthToHeight;
        function round2(num) {
            return Math.round(num * 100) / 100;
        }
        function rescale() {
            if (widthToHeight === null) {
                return;
            }
            var originalWindowWidth = window.innerWidth; // doc.body.clientWidth
            var originalWindowHeight = window.innerHeight; // I saw cases where doc.body.clientHeight was 0.
            var windowWidth = originalWindowWidth;
            var windowHeight = originalWindowHeight;
            if (oldSizes !== null) {
                if (oldSizes.windowWidth === windowWidth &&
                    oldSizes.windowHeight === windowHeight) {
                    return; // nothing changed, so no need to change the transformations.
                }
            }
            oldSizes = {
                windowWidth: windowWidth,
                windowHeight: windowHeight
            };
            if (windowWidth === 0 || windowHeight === 0) {
                gamingPlatform.log.info("Window width/height is 0 so hiding gameArea div.");
                gameArea.style.display = "none";
                return;
            }
            gameArea.style.display = "block";
            gamingPlatform.$rootScope.$apply(function () {
                var newWidthToHeight = windowWidth / windowHeight;
                if (newWidthToHeight > widthToHeight) {
                    windowWidth = round2(windowHeight * widthToHeight);
                }
                else {
                    windowHeight = round2(windowWidth / widthToHeight);
                }
                gamingPlatform.log.info("Window size is " + oldSizes.windowWidth + "x" + oldSizes.windowHeight +
                    " so setting gameArea size to " + windowWidth + "x" + windowHeight +
                    " because widthToHeight=" + widthToHeight);
                // Take 5% margin (so the game won't touch the end of the screen)
                var keepMargin = 0.95;
                windowWidth *= keepMargin;
                windowHeight *= keepMargin;
                gameArea.style.width = windowWidth + 'px';
                gameArea.style.height = windowHeight + 'px';
                gameArea.style.position = "absolute";
                gameArea.style.left = ((originalWindowWidth - windowWidth) / 2) + 'px';
                gameArea.style.top = ((originalWindowHeight - windowHeight) / 2) + 'px';
                if (dimensionsChanged)
                    dimensionsChanged(windowWidth, windowHeight);
                setTimeout(rescale, 10); // sometimes it takes a tiny bit for innerWidth&height to update.
            });
        }
        doc.addEventListener("onresize", rescale);
        doc.addEventListener("orientationchange", rescale);
        if (window.matchMedia)
            window.matchMedia('(orientation: portrait)').addListener(rescale);
        setInterval(rescale, 300);
    })(resizeGameAreaService = gamingPlatform.resizeGameAreaService || (gamingPlatform.resizeGameAreaService = {}));
    var typeCheck_resizeGameAreaService = resizeGameAreaService;
})(gamingPlatform || (gamingPlatform = {}));
//# sourceMappingURL=resizeGameAreaService.js.map
;
var gamingPlatform;
(function (gamingPlatform) {
    // This can't be a module, because we use it like:  translate(...) and not like translate.foobar(...)
    function createTranslateService() {
        var language;
        var idToLanguageToL10n = null;
        function translate(translationId, interpolateParams, languageCode) {
            if (!languageCode)
                languageCode = language;
            var translation = null;
            if (idToLanguageToL10n && idToLanguageToL10n[translationId]) {
                var languageToL10n = idToLanguageToL10n[translationId];
                translation = languageToL10n[languageCode];
                if (!translation)
                    translation = languageToL10n['en'];
            }
            if (!translation) {
                translation = "[" + translationId + "]";
                gamingPlatform.log.error("Couldn't find translationId=" + translationId + " in language=" + languageCode);
            }
            var result = gamingPlatform.$interpolate(translation)(interpolateParams || {});
            if (result.indexOf('{{') !== -1) {
                gamingPlatform.log.error("You forgot to pass a translation parameter (interpolateParams) for translationId=" + translationId + " in language=" + languageCode + " which resulted in '" + result + "' (note that you forgot to pass some {{XXX}})");
            }
            return result;
        }
        var translateService;
        translateService = translate;
        translateService.getLanguage = function () { return language; };
        translateService.setTranslations = function (_idToLanguageToL10n) {
            idToLanguageToL10n = _idToLanguageToL10n;
        };
        translateService.setLanguage = function (_language) {
            language = _language;
        };
        return translateService;
    }
    gamingPlatform.translate = createTranslateService();
    gamingPlatform.defaultTranslateInterpolateParams = {};
    angular.module('translate', [])
        .filter('translate', ['$parse', function ($parse) {
            var translateFilter = function (translationId, interpolateParams) {
                if (!angular.isObject(interpolateParams)) {
                    interpolateParams = $parse(interpolateParams)(this);
                }
                if (!interpolateParams)
                    interpolateParams = gamingPlatform.defaultTranslateInterpolateParams;
                return gamingPlatform.translate(translationId, interpolateParams);
            };
            translateFilter.$stateful = true;
            return translateFilter;
        }]);
})(gamingPlatform || (gamingPlatform = {}));
//# sourceMappingURL=angular-translate.js.map
;
var gamingPlatform;
(function (gamingPlatform) {
    // You use dragAndDropService like this:
    // dragAndDropService.addDragListener(touchElementId, function handleDragEvent(type, clientX, clientY, event) {...});
    // touchElementId can be "gameArea" (or any other element id).
    // type is either: "touchstart", "touchmove", "touchend", "touchcancel", "touchleave"
    var dragAndDropService;
    (function (dragAndDropService) {
        function addDragListener(touchElementId, handleDragEvent) {
            if (!touchElementId || !handleDragEvent) {
                throw new Error("When calling addDragListener(touchElementId, handleDragEvent), you must pass two parameters");
            }
            var isMouseDown = false;
            function touchHandler(event) {
                var touch = event.changedTouches[0];
                handleEvent(event, event.type, touch.clientX, touch.clientY);
            }
            function mouseDownHandler(event) {
                isMouseDown = true;
                handleEvent(event, "touchstart", event.clientX, event.clientY);
            }
            function mouseMoveHandler(event) {
                if (isMouseDown) {
                    handleEvent(event, "touchmove", event.clientX, event.clientY);
                }
            }
            function mouseUpHandler(event) {
                isMouseDown = false;
                handleEvent(event, "touchend", event.clientX, event.clientY);
            }
            function handleEvent(event, type, clientX, clientY) {
                // http://stackoverflow.com/questions/3413683/disabling-the-context-menu-on-long-taps-on-android
                // I also have:  touch-callout:none and user-select:none in main.css
                if (event.preventDefault) {
                    event.preventDefault(); // Also prevents generating mouse events for touch.
                }
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                event.cancelBubble = true;
                event.returnValue = false;
                console.log("handleDragEvent:", type, clientX, clientY);
                handleDragEvent(type, clientX, clientY, event);
            }
            var gameArea = document.getElementById(touchElementId);
            if (!gameArea) {
                throw new Error("You must have <div id='" + touchElementId + "'>...</div>");
            }
            gameArea.addEventListener("touchstart", touchHandler, true);
            gameArea.addEventListener("touchmove", touchHandler, true);
            gameArea.addEventListener("touchend", touchHandler, true);
            gameArea.addEventListener("touchcancel", touchHandler, true);
            gameArea.addEventListener("touchleave", touchHandler, true);
            gameArea.addEventListener("mousedown", mouseDownHandler, true);
            gameArea.addEventListener("mousemove", mouseMoveHandler, true);
            gameArea.addEventListener("mouseup", mouseUpHandler, true);
        }
        dragAndDropService.addDragListener = addDragListener;
    })(dragAndDropService = gamingPlatform.dragAndDropService || (gamingPlatform.dragAndDropService = {}));
    var typeCheck_dragAndDropService = dragAndDropService;
})(gamingPlatform || (gamingPlatform = {}));
//# sourceMappingURL=dragAndDropService.js.map
;
var gamingPlatform;
(function (gamingPlatform) {
    // Preventing context menu on long taps: http://stackoverflow.com/questions/3413683/disabling-the-context-menu-on-long-taps-on-android
    window.oncontextmenu = function (event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };
    angular.module('gameServices', ['translate'])
        .config(['$provide', function ($provide) {
            // angular-material has a ton of
            // Error: [$rootScope:inprog] http://errors.angularjs.org/1.5.5/$rootScope/inprog?p0=%24digest
            // see: https://github.com/angular/material/issues/8245
            // And I even got it once in yCheckers:
            // Error: [$rootScope:inprog] $digest already in progress http://errors.angularjs.org/1.5.5/$rootScope/inprog?p0=%24digest
            $provide.decorator('$rootScope', [
                '$delegate', function ($delegate) {
                    $delegate.unsafeOldApply = $delegate.$apply;
                    $delegate.$apply = function (fn) {
                        var phase = $delegate.$$phase;
                        if (phase === "$apply" || phase === "$digest") {
                            if (fn && typeof fn === 'function') {
                                fn();
                            }
                        }
                        else {
                            $delegate.unsafeOldApply(fn);
                        }
                    };
                    return $delegate;
                }
            ]);
        }])
        .run(['$location', '$rootScope', '$timeout', '$interval', '$interpolate', '$compile', '$sce',
        function (_location, _rootScope, _timeout, _interval, _interpolate, _compile, _sce) {
            gamingPlatform.$location = _location;
            gamingPlatform.$rootScope = _rootScope;
            gamingPlatform.$timeout = _timeout;
            gamingPlatform.$interval = _interval;
            gamingPlatform.$interpolate = _interpolate;
            gamingPlatform.$compile = _compile;
            gamingPlatform.$sce = _sce;
            gamingPlatform.log.alwaysLog("Finished init of gameServices module; emulatorServicesCompilationDate=", emulatorServicesCompilationDate);
        }])
        .factory('$exceptionHandler', function () {
        var didSendBugReport = false;
        function isLocalHost() {
            return location.hostname === "localhost" || location.protocol === "file:";
        }
        function angularErrorHandler(exception, cause) {
            var errMsg = {
                gameUrl: '' + window.location,
                exception: "" + exception,
                stack: "" + (exception ? exception.stack : "no stack"),
                cause: cause,
                gameLogs: gamingPlatform.log.getLogs()
            };
            console.error("Game had an exception:\n", exception, " Full error message with logs: ", errMsg);
            if (didSendBugReport)
                return;
            didSendBugReport = true;
            if (isLocalHost())
                window.alert("Game had an unexpected error. If you know JavaScript, you can look at the console and try to debug it :)");
            // To make sure students don't get:
            // Error: Uncaught DataCloneError: Failed to execute 'postMessage' on 'Window': An object could not be cloned.
            // I serialize to string and back.
            var plainPojoErr = angular.fromJson(angular.toJson(errMsg));
            window.parent.postMessage({ emailJavaScriptError: plainPojoErr }, "*");
        }
        window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
            angularErrorHandler(errorObj, 'Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber +
                ' Column: ' + column);
        };
        return angularErrorHandler;
    });
})(gamingPlatform || (gamingPlatform = {}));
//# sourceMappingURL=angularExceptionHandler.js.map