var aiService;
(function (aiService) {
    /**
     * Returns all the possible moves for the given board and turnIndexBeforeMove.
     * Returns an empty array if the game is over.
    **/
    function getPossibleMoves(board, turnIndexBeforeMove) {
        var possibleMoves = [];
        if (!board) {
            return [];
        }
        var turn = gameLogic.getTurn(turnIndexBeforeMove);
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                var piece = board[i][j];
                if (piece !== 'L' && piece !== 'R' && piece.charAt(0) === turn) {
                    var deltaFrom = { row: i, col: j };
                    var oneCaseMoves;
                    switch (piece.substring(1)) {
                        case 'Elephant':
                            oneCaseMoves = gameLogic.getElephantPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _i = 0; _i < oneCaseMoves.length; _i++) {
                                    var deltaTo = oneCaseMoves[_i];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Lion':
                            oneCaseMoves = gameLogic.getLionPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _a = 0; _a < oneCaseMoves.length; _a++) {
                                    var deltaTo = oneCaseMoves[_a];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Tiger':
                            oneCaseMoves = gameLogic.getTigerPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _b = 0; _b < oneCaseMoves.length; _b++) {
                                    var deltaTo = oneCaseMoves[_b];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Leopard':
                            oneCaseMoves = gameLogic.getLeopardPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _c = 0; _c < oneCaseMoves.length; _c++) {
                                    var deltaTo = oneCaseMoves[_c];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Dog':
                            oneCaseMoves = gameLogic.getDogPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _d = 0; _d < oneCaseMoves.length; _d++) {
                                    var deltaTo = oneCaseMoves[_d];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Wolf':
                            oneCaseMoves = gameLogic.getWolfPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _e = 0; _e < oneCaseMoves.length; _e++) {
                                    var deltaTo = oneCaseMoves[_e];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Cat':
                            oneCaseMoves = gameLogic.getCatPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _f = 0; _f < oneCaseMoves.length; _f++) {
                                    var deltaTo = oneCaseMoves[_f];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                        case 'Mouse':
                            oneCaseMoves = gameLogic.getMousePossibleMoves(board, turnIndexBeforeMove, deltaFrom);
                            if (oneCaseMoves.length > 0) {
                                for (var _g = 0; _g < oneCaseMoves.length; _g++) {
                                    var deltaTo = oneCaseMoves[_g];
                                    possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                                }
                            }
                            break;
                    }
                }
            }
        }
        return possibleMoves;
    }
    aiService.getPossibleMoves = getPossibleMoves;
    /**
     * Returns the move that the computer player should do for the given board.
     * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
     * and it has either a millisecondsLimit or maxDepth field:
     * millisecondsLimit is a time limit, and maxDepth is a depth limit.
     */
    function createComputerMove(board, playerIndex, alphaBetaLimits) {
        // We use alpha-beta search, where the search states are Jungle-Board-Game moves.
        // Recal that a Jungle-Board-Game move has 3 operations:
        // 0) endMatch or setTurn
        // 1) {set: {key: 'board', value: ...}}
        // 2) {set: {key: 'delta', value: ...}}]
        return alphaBetaService.alphaBetaDecision([null, { set: { key: 'board', value: board } }], playerIndex, getNextStates, getStateScoreForIndex0,
        // If you want to see debugging output in the console, then surf to game.html?debug
        window.location.search === '?debug' ? getDebugStateToString : null, alphaBetaLimits);
    }
    aiService.createComputerMove = createComputerMove;
    function getStateScoreForIndex0(move, playerIndex) {
        if (move[0].endMatch) {
            var endMatchScores = move[0].endMatch.endMatchScores;
            return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
                : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
                    : 0;
        }
        return 0;  
    }
    function getNextStates(move, playerIndex) {
        return getPossibleMoves(move[1].set.value, playerIndex);
    }
    function getDebugStateToString(move) {
        return "\n" + move[1].set.value.join("\n") + "\n";
    }
})(aiService || (aiService = {}));
