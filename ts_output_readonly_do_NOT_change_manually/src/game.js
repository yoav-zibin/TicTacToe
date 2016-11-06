;
var game;
(function (game) {
    game.rowsNum = 8;
    game.colsNum = 8;
    var selectedCells = []; // record the clicked cells
    var gameArea = document.getElementById("gameArea");
    var draggingStartedRowCol = null; // The {row: YY, col: XX} where dragging started.
    var draggingPiece = null;
    var draggingPieceAvailableMoves = null;
    var nextZIndex = 61;
    var isPromotionModalShowing = {};
    var modalName = 'promotionModal';
    var animationEnded = false;
    var isComputerTurn = false;
    var board = null;
    var turnIndex = 0;
    var isUnderCheck = null;
    var canCastleKing = null;
    var canCastleQueen = null;
    var enpassantPosition = null;
    var deltaFrom = null;
    var deltaTo = null;
    var promoteTo = null;
    var isYourTurn = false;
    var rotate = null;
    var player = null;
    function init() {
        registerServiceWorker();
        //translate.setTranslations(getTranslations());
        //translate.setLanguage('en');
        resizeGameAreaService.setWidthToHeight(1);
        gameService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI,
            gotMessageFromPlatform: null,
        });
        // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
        document.addEventListener("animationend", animationEndedCallback, false); // standard
        document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
        document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
        dragAndDropService.addDragListener("gameArea", handleDragEvent);
        gameArea = document.getElementById("gameArea");
    }
    game.init = init;
    function registerServiceWorker() {
        // I prefer to use appCache over serviceWorker (because iOS doesn't support serviceWorker, so we have to use appCache) I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
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
        return {}; //XXX to fill in
    }
    function updateUI(params) {
        board = params.stateAfterMove.board;
        deltaFrom = params.stateAfterMove.deltaFrom;
        deltaTo = params.stateAfterMove.deltaTo;
        isUnderCheck = params.stateAfterMove.isUnderCheck;
        canCastleKing = params.stateAfterMove.canCastleKing;
        canCastleQueen = params.stateAfterMove.canCastleQueen;
        enpassantPosition = params.stateAfterMove.enpassantPosition;
        promoteTo = params.stateAfterMove.promoteTo;
        if (!board) {
            board = gameLogic.getInitialBoard();
        }
        turnIndex = params.turnIndexAfterMove;
        isYourTurn = turnIndex === params.yourPlayerIndex &&
            turnIndex >= 0; // game is ongoing
        // Is it the computer's turn?
        if (isYourTurn && params.playersInfo[params.yourPlayerIndex].playerId === '') {
            isYourTurn = false; // to make sure the UI won't send another move.
            /* Waiting 0.5 seconds to let the move animation finish; if we call aiService
               then the animation is paused until the javascript finishes. */
            $timeout(sendComputerMove, 500);
        }
        /* If the play mode is not pass and play then "rotate" the board
           for the player. Therefore the board will always look from the
           point of view of the player in single player mode... */
        if (params.playMode === "playBlack") {
            rotate = true;
        }
        else {
            rotate = false;
        }
        selectedCells = []; // clear up the selectedCells and waiting for next valid move
    }
    function animationEndedCallback() {
        $rootScope.$apply(function () {
            animationEnded = true;
            if (isComputerTurn) {
                sendComputerMove();
            }
        });
    }
    function sendComputerMove() {
        //XXX is this necessary ?
        var possibleMoves = gameLogic.getPossibleMoves(board, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition);
        if (possibleMoves.length) {
            var index1 = Math.floor(Math.random() * possibleMoves.length);
            var pm = possibleMoves[index1];
            var index2 = Math.floor(Math.random() * pm[1].length);
            deltaFrom = pm[0];
            deltaTo = pm[1][index2];
            gameService.makeMove(gameLogic.createMove(board, deltaFrom, deltaTo, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, promoteTo));
        }
        else {
            console.log("There is no possible move");
        }
    }
    //window.e2e_test_stateService = stateService;
    function handleDragEvent(type, clientX, clientY) {
        // Center point in gameArea
        var x = clientX - gameArea.offsetLeft;
        var y = clientY - gameArea.offsetTop;
        if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
            if (draggingPiece) {
                // Drag the piece where the touch is (without snapping to a square).
                var height = getSquareWidthHeight().height;
                var width = getSquareWidthHeight().width;
                setDraggingPieceTopLeft({ top: y - height / 2, left: x - width / 2 });
            }
            else {
                return;
            }
        }
        else {
            // Inside gameArea. Let's find the containing square's row and col
            var col = Math.floor(game.colsNum * x / gameArea.clientWidth);
            var row = Math.floor(game.rowsNum * y / gameArea.clientHeight);
            var r_row = row;
            var r_col = col;
            if (rotate) {
                r_row = 7 - r_row;
                r_col = 7 - r_col;
            }
            if (type === "touchstart" && !draggingStartedRowCol) {
                // drag started
                var PieceEmpty = (board[r_row][r_col] === '');
                var PieceTeam = board[r_row][r_col].charAt(0);
                if (!PieceEmpty && PieceTeam === getTurn(turnIndex)) {
                    draggingStartedRowCol = { row: row, col: col };
                    draggingPiece = document.getElementById("e2e_test_img_" +
                        game.getPieceKindInId(row, col) +
                        '_' +
                        draggingStartedRowCol.row +
                        "x" +
                        draggingStartedRowCol.col);
                    if (draggingPiece) {
                        draggingPiece.style['z-index'] = ++nextZIndex;
                        draggingPiece.style['width'] = '80%';
                        draggingPiece.style['height'] = '80%';
                        draggingPiece.style['top'] = '10%'; //XXX UI stuff
                        draggingPiece.style['left'] = '10%';
                        draggingPiece.style['position'] = 'absolute';
                    }
                    draggingPieceAvailableMoves = getDraggingPieceAvailableMoves(r_row, r_col);
                    for (var i = 0; i < draggingPieceAvailableMoves.length; i++) {
                        draggingPieceAvailableMoves[i].style['stroke-width'] = '1';
                        draggingPieceAvailableMoves[i].style['stroke'] = 'purple';
                        draggingPieceAvailableMoves[i].setAttribute("rx", "10");
                        draggingPieceAvailableMoves[i].setAttribute("ry", "10");
                    }
                }
            }
            if (!draggingPiece) {
                return;
            }
            if (type === "touchend") {
                dragDone(draggingStartedRowCol, { row: row, col: col });
            }
            else {
                setDraggingPieceTopLeft(getSquareTopLeft(row, col));
            }
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
            // drag ended
            // return the piece to it's original style (then angular will take care to hide it).
            setDraggingPieceTopLeft(getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col));
            draggingPiece.style['width'] = '60%';
            draggingPiece.style['height'] = '60%';
            draggingPiece.style['top'] = '20%';
            draggingPiece.style['left'] = '20%';
            draggingPiece.style['position'] = 'absolute';
            for (var i = 0; i < draggingPieceAvailableMoves.length; i++) {
                draggingPieceAvailableMoves[i].style['stroke-width'] = '';
                draggingPieceAvailableMoves[i].style['stroke'] = '';
                draggingPieceAvailableMoves[i].setAttribute("rx", "");
                draggingPieceAvailableMoves[i].setAttribute("ry", "");
            }
            draggingStartedRowCol = null;
            draggingPiece = null;
            draggingPieceAvailableMoves = null;
        }
    }
    function setDraggingPieceTopLeft(topLeft) {
        var originalSize = getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col);
        draggingPiece.style.left = (topLeft.left - originalSize.left) + "px";
        draggingPiece.style.top = (topLeft.top - originalSize.top) + "px";
    }
    function getSquareWidthHeight() {
        return {
            width: gameArea.clientWidth / game.colsNum,
            height: gameArea.clientHeight / game.rowsNum
        };
    }
    function getSquareTopLeft(row, col) {
        var size = getSquareWidthHeight();
        return {
            top: row * size.height,
            left: col * size.width
        };
    }
    function getSquareCenterXY(row, col) {
        var size = getSquareWidthHeight();
        return {
            x: col * size.width + size.width / 2,
            y: row * size.height + size.height / 2
        };
    }
    function dragDone(from, to) {
        $rootScope.$apply(function () {
            dragDoneHandler(from, to);
        });
    }
    function dragDoneHandler(from, to) {
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!isYourTurn) {
            return;
        }
        // need to rotate the angle if playblack
        if (rotate) {
            from.row = 7 - from.row;
            from.col = 7 - from.col;
            to.row = 7 - to.row;
            to.col = 7 - to.col;
        }
        deltaFrom = from;
        deltaTo = to;
        var myPawn = 'BP';
        if (turnIndex === 0) {
            myPawn = 'WP';
        }
        if (myPawn === board[deltaFrom.row][deltaFrom.col] &&
            (deltaTo.row === 0 || deltaTo.row === 7)) {
            player = getTurn(turnIndex);
            isPromotionModalShowing[modalName] = true;
            return;
        }
        actuallyMakeMove();
    }
    function actuallyMakeMove() {
        try {
            var move = gameLogic.createMove(board, deltaFrom, deltaTo, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, promoteTo);
            isYourTurn = false; // to prevent making another move, acts as a kicj
            gameService.makeMove(move);
        }
        catch (e) {
            console.log(["Exception thrown when create move in position:", deltaFrom, deltaTo]);
            return;
        }
    }
    function getDraggingPieceAvailableMoves(row, col) {
        var possibleMoves = gameLogic.getPossibleMoves(board, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition);
        var draggingPieceAvailableMoves = [];
        var index = cellInPossibleMoves(row, col, possibleMoves);
        if (index !== false) {
            var availableMoves = possibleMoves[index][1];
            for (var i = 0; i < availableMoves.length; i++) {
                var availablePos = availableMoves[i];
                if (rotate) {
                    availablePos.row = 7 - availablePos.row;
                    availablePos.col = 7 - availablePos.col;
                }
                draggingPieceAvailableMoves.push(document.getElementById("MyBackground" +
                    availablePos.row + "x" + availablePos.col));
            }
        }
        return draggingPieceAvailableMoves;
    }
    function isValidToCell(turnIndex, row, col) {
        var opponent = getOpponent(turnIndex);
        return board[row][col] === '' ||
            board[row][col].charAt(0) === opponent;
    }
    game.isSelected = function (row, col) {
        if (rotate) {
            row = 7 - row;
            col = 7 - col;
        }
        var turn = getTurn(turnIndex);
        return draggingStartedRowCol && draggingStartedRowCol.row === row &&
            draggingStartedRowCol.col === col && board[row][col].charAt(0) === turn;
    };
    game.shouldShowImage = function (row, col) {
        if (rotate) {
            row = 7 - row;
            col = 7 - col;
        }
        var cell = board[row][col];
        return cell !== "";
    };
    game.getImageSrc = function (row, col) {
        if (rotate) {
            row = 7 - row;
            col = 7 - col;
        }
        var cell = board[row][col];
        return getPieceKind(cell);
    };
    function getPieceKind(cell) {
        switch (cell) {
            case 'WK': return 'chess_graphics/chess_pieces/W_King.png';
            case 'WQ': return 'chess_graphics/chess_pieces/W_Queen.png';
            case 'WR': return 'chess_graphics/chess_pieces/W_Rook.png';
            case 'WB': return 'chess_graphics/chess_pieces/W_Bishop.png';
            case 'WN': return 'chess_graphics/chess_pieces/W_Knight.png';
            case 'WP': return 'chess_graphics/chess_pieces/W_Pawn.png';
            case 'BK': return 'chess_graphics/chess_pieces/B_King.png';
            case 'BQ': return 'chess_graphics/chess_pieces/B_Queen.png';
            case 'BR': return 'chess_graphics/chess_pieces/B_Rook.png';
            case 'BB': return 'chess_graphics/chess_pieces/B_Bishop.png';
            case 'BN': return 'chess_graphics/chess_pieces/B_Knight.png';
            case 'BP': return 'chess_graphics/chess_pieces/B_Pawn.png';
            default: return '';
        }
    }
    game.getPieceKindInId = function (row, col) {
        if (board) {
            if (rotate) {
                row = 7 - row;
                col = 7 - col;
            }
            return board[row][col];
        }
    };
    game.getBackgroundSrc = function (row, col) {
        if (isLight(row, col)) {
            return 'auto_resize_images/Chess-lightCell.svg';
        }
        else {
            return 'auto_resize_images/Chess-darkCell.svg';
        }
    };
    game.getBackgroundFill = function (row, col) {
        var isLightSquare = isLight(row, col);
        return isLightSquare ? 'rgb(133, 87, 35)' : 'rgb(185, 156, 107)';
    };
    function isLight(row, col) {
        var isEvenRow = false, isEvenCol = false;
        isEvenRow = row % 2 === 0;
        isEvenCol = col % 2 === 0;
        return isEvenRow && isEvenCol || !isEvenRow && !isEvenCol;
    }
    game.canSelect = function (row, col) {
        if (!board) {
            return true;
        }
        if (isYourTurn) {
            if (rotate) {
                row = 7 - row;
                col = 7 - col;
            }
            var turn = getTurn(turnIndex);
            if (board[row][col].charAt(0) === turn) {
                if (!isUnderCheck) {
                    isUnderCheck = [false, false];
                }
                if (!canCastleKing) {
                    canCastleKing = [true, true];
                }
                if (!canCastleQueen) {
                    canCastleQueen = [true, true];
                }
                if (!enpassantPosition) {
                    enpassantPosition = { row: null, col: null };
                }
                var possibleMoves = gameLogic.getPossibleMoves(board, turnIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition);
                return cellInPossibleMoves(row, col, possibleMoves) !== false;
            }
            else {
                return false;
            }
        }
    };
    function getTurn(turnIndex) {
        return turnIndex === 0 ? 'W' : 'B';
    }
    function getOpponent(turnIndex) {
        return turnIndex === 0 ? 'B' : 'W';
    }
    function cellInPossibleMoves(row, col, possibleMoves) {
        var cell = { row: row, col: col };
        for (var i = 0; i < possibleMoves.length; i++) {
            if (angular.equals(cell, possibleMoves[i][0])) {
                return i;
            }
        }
        return false;
    }
    game.isBlackPiece = function (row, col) {
        if (rotate) {
            row = 7 - row;
            col = 7 - col;
        }
        return board[row][col].charAt(0) === 'B';
    };
    game.isWhitePiece = function (row, col) {
        if (rotate) {
            row = 7 - row;
            col = 7 - col;
        }
        return board[row][col].charAt(0) === 'W';
    };
    function shouldPromote(board, deltaFrom, deltaTo, turnIndex) {
        var myPawn = (turnIndex === 0 ? 'WP' : 'BP');
        return myPawn === board[deltaFrom.row][deltaFrom.col] &&
            (deltaTo.row === 0 || deltaTo.row === 7);
    }
    game.isModalShown = function (modalName) {
        return isPromotionModalShowing[modalName];
    };
    game.updatePromoteTo = function () {
        var radioPromotions = document.getElementsByName('promotions');
        for (var i = 0; i < radioPromotions.length; i++) {
            if (radioPromotions[i].checked) {
                promoteTo = radioPromotions[i].value;
                break;
            }
        }
        delete isPromotionModalShowing[modalName]; //dismissModal
        actuallyMakeMove();
    };
    game.rows = [0, 1, 2, 3, 4, 5, 6, 7];
    game.cols = [0, 1, 2, 3, 4, 5, 6, 7];
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        CHESS_GAME: "Chess",
        PROMOTION_MESSAGE: "Congratulations! Which piece would you like to promote to?",
        PROMOTE_QUEEN: "Queen",
        PROMOTE_ROOK: "Rook",
        PROMOTE_BISHOP: "Bishop",
        PROMOTE_KNIGHT: "Knight",
        PROMOTE_ACTION: "Promote",
        RULES_OF_CHESS: "Rules of Chess",
        CLOSE: "Close",
        RULES_SLIDE1: "King moves one piece around it",
        RULES_SLIDE2: "Rook moves horisontaly and verticaly",
        RULES_SLIDE3: "Bishop moves diagnaly and anti-diagnaly",
        RULES_SLIDE4: "Queen is the most powerful piece in Chess, it can move horizontaly, verticaly and diagnaly.",
        RULES_SLIDE5: "Knight can move as 'L' shape and skip other pieces",
        RULES_SLIDE6: "Pawn moves forward one row(or two rows in initial move), capture pieces diagnaly",
        RULES_SLIDE7: "En passant: a special pawn capture",
        RULES_SLIDE8: "Promotion: the pawn reaches last row is qualified to promotion",
        RULES_SLIDE9: "Castling: King and Rook move together(with conditions) as picture shows",
        RULES_SLIDE10: "In check: When a king is under immediate attack by one or two of the opponent's pieces.",
        RULES_SLIDE11: "Endgame - wins by Checkmate",
        RULES_SLIDE11_2: "Make opponent's king has no available legal moves while is under check by you.",
        RULES_SLIDE12: "Endgame - draws by Stalemate",
        RULES_SLIDE12_2: "Make opponent's king has no available legal moves while is NOT under check by you."
    });
    game.init();
});
//# sourceMappingURL=game.js.map