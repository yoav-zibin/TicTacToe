module aiService {
  /** Returns the move that the computer player should do for the given state in move. */
  export function findComputerMove(move: IMove): IMove {
    return createComputerMove(move,
      // at most 1 second for the AI to choose a move (but might be much quicker)
      { millisecondsLimit: 1000, maxDepth:500 });
  }

  /**
   * Returns all the possible moves for the given state and turnIndexBeforeMove.
   * Returns an empty array if the game is over.
   */
  export function getPossibleMoves(state: IState, turnIndexBeforeMove: number): IMove[] {
    let possibleMoves: IMove[] = [];
    let MAX_COUNT = 10;
    try {
      let anchors = state.anchorStatus;
      let nextmoves = gameLogic.getNextPossibleMoveList(anchors, state.board, state.shapeStatus, turnIndexBeforeMove);
      if (nextmoves.valid) {
        let moveSteps = gameLogic.sortMoves(nextmoves.moves);
        //let moveSteps = nextmoves.moves;
        let count = 0;
        for (let move of moveSteps) {
          if (count > MAX_COUNT) {
            break;
          }
          possibleMoves.push(gameLogic.createMove(state, move.row, move.col, move.shapeId, turnIndexBeforeMove));
          count++;
        }
        //let newAnchors = angular.copy(anchors);
        //for (let pos of nextmoves.invalidAnchors) {
        //  newAnchors[turnIndexBeforeMove][pos] = false;
        //}
        //state.anchorStatus = newAnchors;
      }
    } catch (e) {

    }
    console.log("------------------------------\n--------------------\n")
    return possibleMoves;
  }

  /**
   * Returns the move that the computer player should do for the given state.
   * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
   * and it has either a millisecondsLimit or maxDepth field:
   * millisecondsLimit is a time limit, and maxDepth is a depth limit.
   */
  export function createComputerMove(
    move: IMove, alphaBetaLimits: IAlphaBetaLimits): IMove {
    // We use alpha-beta search, where the search states are TicTacToe moves.
    return alphaBetaService.alphaBetaDecision(
      move, move.turnIndex, getNextStates, getStateScoreForIndex0, null, alphaBetaLimits);
  }

  function getStateScoreForIndex0(move: IMove, playerIndex: number): number {
    let endMatchScores = move.endMatchScores;
    if (endMatchScores) {
      return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
        : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
          : 0;
    }
    return 0;
  }

  function getNextStates(move: IMove, playerIndex: number): IMove[] {
    return getPossibleMoves(move.state, playerIndex);
  }
}