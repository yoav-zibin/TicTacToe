;
var game;
(function (game) {
    // Global variables are cleared when getting updateUI.
    // I export all variables to make it easy to debug in the browser by
    // simply typing in the console, e.g.,
    // game.currentUpdateUI
    game.currentUpdateUI = null;
    game.didMakeMove = false; // You can only make one move per updateUI
    game.animationEndedTimeout = null;
    game.state = null;
    game.isHelpModalShown = false;
    function init() {
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        log.log("Translation of 'TICTACTOE_RULES_TITLE' is " + translate('TICTACTOE_RULES_TITLE'));
        resizeGameAreaService.setWidthToHeight(1);
        moveService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            checkMoveOk: gameLogic.checkMoveOk,
            updateUI: updateUI
        });
        var w = window;
        if (w["HTMLInspector"]) {
            setInterval(function () {
                w["HTMLInspector"].inspect({
                    excludeRules: ["unused-classes", "script-placement"],
                });
            }, 3000);
        }
    }
    game.init = init;
    function getTranslations() {
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
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        game.didMakeMove = false; // Only one move per updateUI
        game.isHelpModalShown = false;
        game.currentUpdateUI = params;
        clearAnimationTimeout();
        game.state = params.move.stateAfterMove;
        if (isFirstMove()) {
            game.state = gameLogic.getInitialState();
            if (isMyTurn())
                makeMove(gameLogic.createInitialMove());
        }
        else {
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            game.animationEndedTimeout = $timeout(animationEndedCallback, 500);
        }
    }
    function animationEndedCallback() {
        log.info("Animation ended");
        maybeSendComputerMove();
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            $timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    function maybeSendComputerMove() {
        if (!isComputerTurn())
            return;
        var move = aiService.findComputerMove(game.currentUpdateUI.move);
        log.info("Computer move: ", move);
        makeMove(move);
    }
    function makeMove(move) {
        if (game.didMakeMove) {
            return;
        }
        game.didMakeMove = true;
        moveService.makeMove(move);
    }
    function isFirstMove() {
        return !game.currentUpdateUI.move.stateAfterMove;
    }
    function yourPlayerIndex() {
        return game.currentUpdateUI.yourPlayerIndex;
    }
    function isComputer() {
        return game.currentUpdateUI.playersInfo[game.currentUpdateUI.yourPlayerIndex].playerId === '';
    }
    function isComputerTurn() {
        return isMyTurn() && isComputer();
    }
    function isHumanTurn() {
        return isMyTurn() && !isComputer();
    }
    function isMyTurn() {
        return !game.didMakeMove &&
            game.currentUpdateUI.move.turnIndexAfterMove >= 0 &&
            game.currentUpdateUI.yourPlayerIndex === game.currentUpdateUI.move.turnIndexAfterMove; // it's my turn
    }
    function cellClicked(row, col) {
        log.info("Clicked on cell:", row, col);
        if (!isHumanTurn())
            return;
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        var nextMove = null;
        try {
            nextMove = gameLogic.createMove(game.state, row, col, game.currentUpdateUI.move.turnIndexAfterMove);
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
        var cell = game.state.board[row][col];
        return cell !== "";
    }
    game.shouldShowImage = shouldShowImage;
    function isPieceX(row, col) {
        return game.state.board[row][col] === 'X';
    }
    game.isPieceX = isPieceX;
    function isPieceO(row, col) {
        return game.state.board[row][col] === 'O';
    }
    game.isPieceO = isPieceO;
    function shouldSlowlyAppear(row, col) {
        return game.state.delta &&
            game.state.delta.row === row && game.state.delta.col === col;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
    function clickedOnModal(evt) {
        if (evt.target === evt.currentTarget) {
            evt.preventDefault();
            evt.stopPropagation();
            game.isHelpModalShown = false;
        }
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