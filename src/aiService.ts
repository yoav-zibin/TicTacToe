module aiService {
  /**
   * Returns the move that the computer player should do for the given board.
   * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
   * and it has either a millisecondsLimit or maxDepth field:
   * millisecondsLimit is a time limit, and maxDepth is a depth limit.
   */
  export function createComputerMove(
      board: Board, playerIndex: number, alphaBetaLimits: IAlphaBetaLimits): IMove {
    // We use alpha-beta search, where the search states are TicTacToe moves.
    // Recal that a TicTacToe move has 3 operations:
    // 0) endMatch or setTurn
    // 1) {set: {key: 'board', value: ...}}
    // 2) {set: {key: 'delta', value: ...}}]
    return alphaBetaService.alphaBetaDecision(
        [null, {set: {key: 'board', value: board}}],
        playerIndex, getNextStates, getStateScoreForIndex0,
        // If you want to see debugging output in the console, then surf to index.html?debug
        window.location.search === '?debug' ? getDebugStateToString : null,
        alphaBetaLimits);
  }

  function getStateScoreForIndex0(move: IMove, playerIndex: number): number {
    if (move[0].endMatch) {
      var endMatchScores = move[0].endMatch.endMatchScores;
      return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
          : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
          : 0;
    }
    return 0;
  }

  function getNextStates(move: IMove, playerIndex: number): IMove[] {
    return gameLogic.getPossibleMoves(move[1].set.value, playerIndex);
  }

  function getDebugStateToString(move: IMove): string {
    return "\n" + move[1].set.value.join("\n") + "\n";
  }
}
