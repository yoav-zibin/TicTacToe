module aiService {

  /**
   * Returns all the possible moves for the given board and turnIndexBeforeMove.
   * Returns an empty array if the game is over.
  **/
  export function getPossibleMoves(board: Board, turnIndexBeforeMove: number): IMove[] {
    var possibleMoves: IMove[] = [];
    if(!board) {
      return [];
    }
    var turn = gameLogic.getTurn(turnIndexBeforeMove);
    for(var i = 0; i < gameLogic.ROWS; i++){
      for(var j = 0; j < gameLogic.COLS; j++){
        var piece = board[i][j];
        if(piece !== 'L' && piece !== 'R' && piece.charAt(0) === turn) {
          var deltaFrom: BoardDelta = {row: i, col: j};
          var oneCaseMoves: BoardDelta[];
          switch(piece.substring(1)) {
          case 'Elephant':
            oneCaseMoves = gameLogic.getElephantPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
            if(oneCaseMoves.length > 0) {
              for(let deltaTo of oneCaseMoves) {
                possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
              }
            }
            break;
          case 'Lion':
            oneCaseMoves = gameLogic.getLionPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
            if(oneCaseMoves.length > 0) {
              for(let deltaTo of oneCaseMoves) {
                possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
              }
            }
            break;
          case 'Tiger':
            oneCaseMoves = gameLogic.getTigerPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
            if(oneCaseMoves.length > 0) {
              for(let deltaTo of oneCaseMoves) {
                possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
              }
            }
            break;
          case 'Leopard':
            oneCaseMoves = gameLogic.getLeopardPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
            if(oneCaseMoves.length > 0) {
              for(let deltaTo of oneCaseMoves) {
                possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
              }
            }
            break;
          case 'Dog':
            oneCaseMoves = gameLogic.getDogPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
            if(oneCaseMoves.length > 0) {
              for(let deltaTo of oneCaseMoves) {
                possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
              }
            }
            break;
          case 'Wolf':
            oneCaseMoves = gameLogic.getWolfPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
            if(oneCaseMoves.length > 0) {
              for(let deltaTo of oneCaseMoves) {
                possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
              }
            }
            break;
          case 'Cat':
            oneCaseMoves = gameLogic.getCatPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
            if(oneCaseMoves.length > 0) {
              for(let deltaTo of oneCaseMoves) {
                possibleMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
              }
            }
            break;
          case 'Mouse':
            oneCaseMoves = gameLogic.getMousePossibleMoves(board, turnIndexBeforeMove, deltaFrom);
            if(oneCaseMoves.length > 0) {
              for(let deltaTo of oneCaseMoves) {
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


  /**
   * Returns the move that the computer player should do for the given board.
   * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
   * and it has either a millisecondsLimit or maxDepth field:
   * millisecondsLimit is a time limit, and maxDepth is a depth limit.
   */
  export function createComputerMove(
      board: Board, playerIndex: number, alphaBetaLimits: IAlphaBetaLimits): IMove {
    // We use alpha-beta search, where the search states are Jungle-Board-Game moves.
    // Recal that a Jungle-Board-Game move has 3 operations:
    // 0) endMatch or setTurn
    // 1) {set: {key: 'board', value: ...}}
    // 2) {set: {key: 'delta', value: ...}}]
    return alphaBetaService.alphaBetaDecision(
        [null, {set: {key: 'board', value: board}}],
        playerIndex, getNextStates, getStateScoreForIndex0,
        // If you want to see debugging output in the console, then surf to game.html?debug
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
    return getPossibleMoves(move[1].set.value, playerIndex);
  }

  function getDebugStateToString(move: IMove): string {
    return "\n" + move[1].set.value.join("\n") + "\n";
  }
}
