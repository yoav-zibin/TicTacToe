var aiService;
(function (aiService) {
    /**
     * Returns the move that the computer player should do for the given board.
     * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
     * and it has either a millisecondsLimit or maxDepth field:
     * millisecondsLimit is a time limit, and maxDepth is a depth limit.
     */
    function createComputerMove(startingState, playerIndex, alphaBetaLimits) {
        // We use alpha-beta search, where the search states are TicTacToe moves.
        // Recal that a TicTacToe move has 3 operations:
        // 0) endMatch or setTurn
        // 1) {set: {key: 'board', value: ...}}
        // 2) {set: {key: 'delta', value: ...}}]
        return alphaBetaService.alphaBetaDecision([null, { set: { key: 'board', value: startingState.board } },
            { set: { key: 'isUnderCheck', value: startingState.isUnderCheck } },
            { set: { key: 'canCastleKing', value: startingState.canCastleKing } },
            { set: { key: 'canCastleQueen', value: startingState.canCastleQueen } },
            { set: { key: 'enpassantPosition', value: startingState.enpassantPosition } }], // startingState
        playerIndex, getNextStates, getStateScoreForIndex0, 
        // If you want to see debugging output in the console, then surf to game.html?debug
        window.location.search === '?debug' ? getDebugStateToString : null, alphaBetaLimits);
    }
    aiService.createComputerMove = createComputerMove;
    function getStateScoreForIndex0(move) {
        if (move[0].endMatch) {
            var endMatchScores = move[0].endMatch.endMatchScores;
            return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
                : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
                    : 0;
        }
        return 0;
    }
    function getNextStates(move, playerIndex) {
        var board = move[1].set.value, isUnderCheck = move[2].set.value, canCastleKing = move[3].set.value, canCastleQueen = move[4].set.value, enpassantPosition = move[5].set.value;
        var possibleDeltas = gameLogic.getPossibleMoves(board, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition);
        var possibleMoves = [];
        for (var i = 0; i < possibleDeltas.length; i++) {
            var deltaFromAndTos = possibleDeltas[i];
            var deltaFrom = deltaFromAndTos[0], deltaTos = deltaFromAndTos[1];
            for (var j = 0; j < deltaTos.length; j++) {
                var deltaTo = deltaTos[j];
                try {
                    console.log("going to create move: " + JSON.stringify(deltaFrom) + " --> " +
                        JSON.stringify(deltaTo));
                    possibleMoves.push(gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex, isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, null));
                }
                catch (e) {
                }
            }
        }
        return possibleMoves;
    }
    function getDebugStateToString(move) {
        return "\n" + move[1].set.value.join("\n") + "\n";
    }
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map