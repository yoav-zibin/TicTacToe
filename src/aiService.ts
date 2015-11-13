module aiService {

  /**
   * Returns all the possible moves for the given board and turnIndexBeforeMove.
   * Returns an empty array if the game is over.
  **/
  interface threeTypeMoves {
    lowLevelMoves: IMove[];
    midLevelMoves: IMove[];
    highLevelMoves: IMove[];
  }

  export function getPossibleMoves(board: Board, turnIndexBeforeMove: number): threeTypeMoves {
    var lowLevelMoves: IMove[] = [];
    var midLevelMoves: IMove[] = [];
    var highLevelMoves: IMove[] = [];
    var resMoves: threeTypeMoves = {
      lowLevelMoves: lowLevelMoves,
      midLevelMoves: midLevelMoves,
      highLevelMoves: highLevelMoves
    };
    if (!board) {
      return resMoves;
    }
    var turn = gameLogic.getTurn(turnIndexBeforeMove);
    var opponentTurn = gameLogic.getOpponentTurn(turnIndexBeforeMove);
    for (var i = 0; i < gameLogic.ROWS; i++) {
      for (var j = 0; j < gameLogic.COLS; j++) {
        var piece = board[i][j];
        if (piece !== 'L' && piece !== 'R' && piece.charAt(0) === turn) {
          var deltaFrom: BoardDelta = { row: i, col: j };
          var oneCaseMoves: BoardDelta[];
          switch (piece.substring(1)) {
            case 'Elephant':
              oneCaseMoves = gameLogic.getElephantPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
              if (oneCaseMoves.length > 0) {
                for (let deltaTo of oneCaseMoves) {
                  var temp1 = turn + 'Den';
                  var temp2 = opponentTurn + 'Trap';

                  if (board[deltaTo.row][deltaTo.col] === 'R' || board[deltaTo.row][deltaTo.col] === 'L') {
                    lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                  }else {
                    if (board[deltaTo.row][deltaTo.col] === temp2) {
                      highLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else if (board[deltaTo.row][deltaTo.col] === temp1){
                      lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else {
                      midLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }
                  }
                }
              }
              break;
            case 'Lion':
              oneCaseMoves = gameLogic.getLionPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
              if (oneCaseMoves.length > 0) {
                for (let deltaTo of oneCaseMoves) {
                  var temp1 = turn + 'Den';
                  var temp2 = opponentTurn + 'Trap';

                  if (board[deltaTo.row][deltaTo.col] === 'R' || board[deltaTo.row][deltaTo.col] === 'L') {
                    lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                  }else {
                    if (board[deltaTo.row][deltaTo.col] === temp2) {
                      highLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else if (board[deltaTo.row][deltaTo.col] === temp1){
                      lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else {
                      midLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }
                  }
                }
              }
              break;
            case 'Tiger':
              oneCaseMoves = gameLogic.getTigerPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
              if (oneCaseMoves.length > 0) {
                for (let deltaTo of oneCaseMoves) {
                  var temp1 = turn + 'Den';
                  var temp2 = opponentTurn + 'Trap';

                  if (board[deltaTo.row][deltaTo.col] === 'R' || board[deltaTo.row][deltaTo.col] === 'L') {
                    lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                  }else {
                    if (board[deltaTo.row][deltaTo.col] === temp2) {
                      highLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else if (board[deltaTo.row][deltaTo.col] === temp1){
                      lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else {
                      midLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }
                  }
                }
              }
              break;
            case 'Leopard':
              oneCaseMoves = gameLogic.getLeopardPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
              if (oneCaseMoves.length > 0) {
                for (let deltaTo of oneCaseMoves) {
                  var temp1 = turn + 'Den';
                  var temp2 = opponentTurn + 'Trap';

                  if (board[deltaTo.row][deltaTo.col] === 'R' || board[deltaTo.row][deltaTo.col] === 'L') {
                    lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                  }else {
                    if (board[deltaTo.row][deltaTo.col] === temp2) {
                      highLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else if (board[deltaTo.row][deltaTo.col] === temp1){
                      lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else {
                      midLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }
                  }
                }
              }
              break;
            case 'Dog':
              oneCaseMoves = gameLogic.getDogPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
              if (oneCaseMoves.length > 0) {
                for (let deltaTo of oneCaseMoves) {
                  var temp1 = turn + 'Den';
                  var temp2 = opponentTurn + 'Trap';

                  if (board[deltaTo.row][deltaTo.col] === 'R' || board[deltaTo.row][deltaTo.col] === 'L') {
                    lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                  }else {
                    if (board[deltaTo.row][deltaTo.col] === temp2) {
                      highLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else if (board[deltaTo.row][deltaTo.col] === temp1){
                      lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else {
                      midLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }
                  }
                }
              }
              break;
            case 'Wolf':
              oneCaseMoves = gameLogic.getWolfPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
              if (oneCaseMoves.length > 0) {
                for (let deltaTo of oneCaseMoves) {
                  var temp1 = turn + 'Den';
                  var temp2 = opponentTurn + 'Trap';

                  if (board[deltaTo.row][deltaTo.col] === 'R' || board[deltaTo.row][deltaTo.col] === 'L') {
                    lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                  }else {
                    if (board[deltaTo.row][deltaTo.col] === temp2) {
                      highLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else if (board[deltaTo.row][deltaTo.col] === temp1){
                      lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else {
                      midLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }
                  }
                }
              }
              break;
            case 'Cat':
              oneCaseMoves = gameLogic.getCatPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
              if (oneCaseMoves.length > 0) {
                for (let deltaTo of oneCaseMoves) {
                  var temp1 = turn + 'Den';
                  var temp2 = opponentTurn + 'Trap';

                  if (board[deltaTo.row][deltaTo.col] === 'R' || board[deltaTo.row][deltaTo.col] === 'L') {
                    lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                  }else {
                    if (board[deltaTo.row][deltaTo.col] === temp2) {
                      highLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else if (board[deltaTo.row][deltaTo.col] === temp1){
                      lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else {
                      midLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }
                  }
                }
              }
              break;
            case 'Mouse':
              oneCaseMoves = gameLogic.getMousePossibleMoves(board, turnIndexBeforeMove, deltaFrom);
              if (oneCaseMoves.length > 0) {
                for (let deltaTo of oneCaseMoves) {
                  var temp1 = turn + 'Den';
                  var temp2 = opponentTurn + 'Trap';

                  if (board[deltaTo.row][deltaTo.col] === 'R' || board[deltaTo.row][deltaTo.col] === 'L') {
                    lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                  }else {
                    if (board[deltaTo.row][deltaTo.col] === temp2) {
                      highLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else if (board[deltaTo.row][deltaTo.col] === temp1){
                      lowLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }else {
                      midLevelMoves.push(gameLogic.createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                    }
                  }
                }
              }
              break;
          }
        }
      }
    }
    resMoves = {lowLevelMoves: lowLevelMoves, midLevelMoves: midLevelMoves, highLevelMoves: highLevelMoves};
    return resMoves;
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

    // modify the ai part
    // if the play's pieces is more than 4 then, do randomSeed
    // otherwise, use alphaBeta algorithm
    var turn = gameLogic.getTurn(playerIndex);
    var opponentTurn = gameLogic.getOpponentTurn(playerIndex);
    var pieceCount: number = 0;
    for (var i = 0; i < gameLogic.ROWS; i++) {
      for (var j = 0; j < gameLogic.COLS; j++) {
        var curPiece = board[i][j];
        if (curPiece[0] === turn && curPiece.substring(1) !== "Den" && curPiece.substring(1) !== "Trap") {
          pieceCount++;
        }
      }
    }
    var threeTypeMoves = getPossibleMoves(board, playerIndex);
    var lowLevelMoves: IMove[] = threeTypeMoves.lowLevelMoves;
    var midLevelMoves: IMove[] = threeTypeMoves.midLevelMoves;
    var highLevelMoves: IMove[] = threeTypeMoves.highLevelMoves;

    var index = 0;
    var resMove: IMove;
    if (highLevelMoves.length !== 0) {
      return highLevelMoves[0];
    }else if (midLevelMoves.length === 1) {
      return midLevelMoves[0];
    }else if (midLevelMoves.length > 1){
      index = Math.floor(Math.random() * midLevelMoves.length);
      return midLevelMoves[index];
    }else {
      index = Math.floor(Math.random() * lowLevelMoves.length);
      return lowLevelMoves[index];
    }
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
    var threeTypeMoves = getPossibleMoves(move[1].set.value, playerIndex);
    var possibleMoves: IMove[] = [];
    for(var i = 0; i < threeTypeMoves.highLevelMoves.length; i++) {
      possibleMoves.push(threeTypeMoves.highLevelMoves[i]);
    }
    for(var i = 0; i < threeTypeMoves.midLevelMoves.length; i++) {
      possibleMoves.push(threeTypeMoves.midLevelMoves[i]);
    }
    for(var i = 0; i < threeTypeMoves.lowLevelMoves.length; i++) {
      possibleMoves.push(threeTypeMoves.lowLevelMoves[i]);
    }
    return possibleMoves;
  }

  function getDebugStateToString(move: IMove): string {
    return "\n" + move[1].set.value.join("\n") + "\n";
  }
}
