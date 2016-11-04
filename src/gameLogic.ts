module gameLogic {
  export function getInitialBoard() {
    return [
      ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
      ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
      ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR']
      ];
  }

  // Returns true if the game ended in a tie because there are no available moves for any pieces
  function isTie(board:any, turnIndex:any, isUnderCheck:any, canCastleKing:any, canCastleQueen:any, enpassantPosition:any) {
    if (!isUnderCheck[turnIndex]) {
      var curPlayer = getTurn(turnIndex);
      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
          if (board[i][j] !== '' && board[i][j].charAt(0) === curPlayer) {
            var curPiece = board[i][j];
            var curPos = {row: i, col: j};
            switch (curPiece.charAt(1)) {
              case 'K':
                if (canKingMoveAnywhere(board, turnIndex, curPos,
                    isUnderCheck, canCastleKing, canCastleQueen)) {
                  return false;
                }
                break;
              case 'Q':
                if (canQueenMoveAnywhere(board, turnIndex, curPos)) {
                  return false;
                }
                break;
              case 'R':
                if (canRookMoveAnywhere(board, turnIndex, curPos)) {
                  return false;
                }
                break;
              case 'B':
                if (canBishopMoveAnywhere(board, turnIndex, curPos)) {
                  return false;
                }
                break;
              case 'N':
                if (canKnightMoveAnywhere(board, turnIndex, curPos)) {
                  return false;
                }
                break;
              case 'P':
                if (canPawnMoveAnywhere(board, turnIndex, curPos, enpassantPosition)) {
                  return false;
                }
                break;
            }
          }
        }
      }
      return true;
    } else {
      return false;
    }
  }

 // Return the winner (either 'W' or 'B') or '' if there is no winner
 function getWinner(board:any, turnIndex:any, isUnderCheck:any, canCastleKing:any, canCastleQueen:any, enpassantPosition:any) {
    if (isUnderCheck[turnIndex]) {
      var curPlayer = getTurn(turnIndex);
      var kingsPosition = findKingsPosition(board, turnIndex);

      // if there is no available moves for king
      if (!canKingMoveAnywhere(board, turnIndex, kingsPosition,
          isUnderCheck, canCastleKing, canCastleQueen)) {
        for (var i = 0; i < 8; i++) {
          for (var j = 0; j < 8; j++) {
            if (board[i][j] !== '' && board[i][j].charAt(0) === curPlayer) {
              var curPiece = board[i][j];
              var curPos = {row: i, col: j};
              switch (curPiece.charAt(1)) {
                case 'Q':
//                  if (canQueenMoveAnywhere(board, turnIndex, curPos, canCastleKing, canCastleQueen)) {
                  if (canQueenMoveAnywhere(board, turnIndex, curPos)) {
                    return '';
                  }
                  break;
                case 'R':
                  if (canRookMoveAnywhere(board, turnIndex, curPos)) {
                    return '';
                  }
                  break;
                case 'B':
                  if (canBishopMoveAnywhere(board, turnIndex, curPos)) {
                    return '';
                  }
                  break;
                case 'N':
                  if (canKnightMoveAnywhere(board, turnIndex, curPos)) {
                    return '';
                  }
                  break;
                case 'P':
                  if (canPawnMoveAnywhere(board, turnIndex, curPos, enpassantPosition)) {
                    return '';
                  }
                  break;
              }
            }
          }
        }
        // if we reached here then there is no piece to save the king
        return getOpponent(turnIndex);
      }
    }
    return '';
 }

 // Returns the move that should be performed when player givin a state
export function createMove(board:any, deltaFrom:any, deltaTo:any, turnIndexBeforeMove:any,
                      isUnderCheck:any, canCastleKing:any, canCastleQueen:any, enpassantPosition:any, promoteTo:any) {
    console.log("CreateMove arguments: " + angular.toJson([
board, deltaFrom, deltaTo, turnIndexBeforeMove,isUnderCheck, canCastleKing, canCastleQueen,
enpassantPosition, promoteTo
]));

    if (!board) {
      // Initially (at the beginning of the match), the board in state is undefined.
      board = getInitialBoard();
    }
    // initialize all variables
    if (!isUnderCheck) { isUnderCheck = [false, false]; }
    if (!canCastleKing) { canCastleKing = [true, true]; }
    if (!canCastleQueen) { canCastleQueen = [true, true]; }
    if (!enpassantPosition) { enpassantPosition = {row: null, col: null}; }
    if (!promoteTo) { promoteTo = ''; }

    var destination = board[deltaTo.row][deltaTo.col];

    if (destination !== '' && destination.charAt(0) === (turnIndexBeforeMove === 0 ? 'W' : 'B')) {
      throw new Error("One can only make a move in an empty position or capture opponent's piece!");
    }

    if (deltaFrom.row === deltaTo.row && deltaFrom.col === deltaTo.col) {
      throw new Error ("Cannot move to same position.");
    }

    if (getWinner(board, turnIndexBeforeMove, isUnderCheck,
          canCastleKing, canCastleQueen, enpassantPosition) !== '' ||
        isTie(board, turnIndexBeforeMove, isUnderCheck,
          canCastleKing, canCastleQueen, enpassantPosition)) {
      throw new Error("Can only make a move if the game is not over!");
    }

    var boardAfterMove = angular.copy(board),
        isUnderCheckAfterMove = angular.copy(isUnderCheck),
        canCastleKingAfterMove = angular.copy(canCastleKing),
        canCastleQueenAfterMove = angular.copy(canCastleQueen),
        enpassantPositionAfterMove = angular.copy(enpassantPosition),
        promoteToAfterMove = angular.copy(promoteTo);

    var piece = board[deltaFrom.row][deltaFrom.col];
    var turn = getTurn(turnIndexBeforeMove);

    if (turn !== piece.charAt(0)) {
      throw new Error("Illegal to move this piece!");
    }

    // update the board according to the moving piece
    switch(piece.charAt(1)) {
      case 'K':
        if (isCastlingKing(board, deltaFrom, deltaTo, turnIndexBeforeMove, canCastleKing)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
          boardAfterMove[deltaTo.row][deltaTo.col - 1] = turn + 'R';
          boardAfterMove[deltaTo.row][7] = '';
          canCastleKingAfterMove[turnIndexBeforeMove] = false;
          canCastleQueenAfterMove[turnIndexBeforeMove] = false;
        }
        else if (isCastlingQueen(board, deltaFrom, deltaTo, turnIndexBeforeMove, canCastleQueen)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
          boardAfterMove[deltaTo.row][deltaTo.col + 1] = turn + 'R';
          boardAfterMove[deltaTo.row][0] = '';
          canCastleKingAfterMove[turnIndexBeforeMove] = false;
          canCastleQueenAfterMove[turnIndexBeforeMove] = false;
        }
        else if(canKingMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for king.");
        }
        break;
      case 'Q':
        if(canQueenMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
            boardAfterMove[deltaTo.row][deltaTo.col] = piece;
            boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for Queen");
        }
        break;
      case 'R':
        if(canRookMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
            boardAfterMove[deltaTo.row][deltaTo.col] = piece;
            boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for Rook");
        }
        break;
      case 'B':
        if(canBishopMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for Bishop");
        }
        break;
      case 'N':
        if(canKnightMove(board, deltaFrom, deltaTo, turnIndexBeforeMove)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
        } else {
          throw new Error("Illegal move for Knight");
        }
        break;
      case 'P':
        if(canPawnMove(board, deltaFrom, deltaTo, turnIndexBeforeMove, enpassantPosition)) {
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
          // capture the opponent pawn with enpassant
          if (enpassantPosition.row && deltaFrom.row === enpassantPosition.row &&
            deltaFrom.col !== deltaTo.col &&
            (Math.abs(deltaFrom.col - enpassantPosition.col) === 1)) {
            boardAfterMove[enpassantPosition.row][enpassantPosition.col] = '';
          }
          boardAfterMove[deltaFrom.row][deltaFrom.col] = '';
          enpassantPositionAfterMove.row = null;
          enpassantPositionAfterMove.col = null;

          // check for enpassant
          if (turn === "W" && deltaTo.row === 4) {
            if (boardAfterMove[deltaTo.row][deltaTo.col - 1] === "BP" ||
              boardAfterMove[deltaTo.row][deltaTo.col + 1] === "BP") {
              enpassantPositionAfterMove.row = deltaTo.row;
              enpassantPositionAfterMove.col = deltaTo.col;
            }
          }
          if (turn === "B" && deltaTo.row === 3) {
            if (boardAfterMove[deltaTo.row][deltaTo.col - 1] === "WP" ||
              boardAfterMove[deltaTo.row][deltaTo.col + 1] === "WP") {
              enpassantPositionAfterMove.row = deltaTo.row;
              enpassantPositionAfterMove.col = deltaTo.col;
            }
          }

          // check for promotion
          if (deltaTo.row === 0 || deltaTo.row === 7) {
            boardAfterMove[deltaTo.row][deltaTo.col] = (promoteToAfterMove ? promoteToAfterMove : turn + "Q");
            // promoteToAfterMove = '';
          }
        } else {
          throw new Error("Illegal move for Pawn");
        }
        break;
      default:
        throw new Error("Unknown piece type!");
    }
    var turnIndexAfterMove = 1 - turnIndexBeforeMove;
    if (isUnderCheckByPositions(boardAfterMove, turnIndexAfterMove)) {
      isUnderCheckAfterMove[turnIndexAfterMove] = true;
    }
    var winner = getWinner(boardAfterMove, turnIndexAfterMove, isUnderCheckAfterMove,
                  canCastleKingAfterMove, canCastleQueenAfterMove, enpassantPositionAfterMove);
    // console.log("winner: " + winner);
    var firstOperation:any;
    if (winner !== '' || isTie(boardAfterMove, turnIndexAfterMove, isUnderCheckAfterMove,
        canCastleKingAfterMove, canCastleQueenAfterMove, enpassantPositionAfterMove)) {
      // Game over.
      firstOperation = {endMatch: {endMatchScores:
        (winner === 'W' ? [1, 0] : (winner === 'B' ? [0, 1] : [0, 0]))}};
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      firstOperation = {setTurn: {turnIndex: turnIndexAfterMove}};
    }

    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'deltaFrom', value: {row: deltaFrom.row, col: deltaFrom.col}}},
            {set: {key: 'deltaTo', value: {row: deltaTo.row, col: deltaTo.col}}},
            {set: {key: 'isUnderCheck', value: isUnderCheckAfterMove}},
            {set: {key: 'canCastleKing', value: canCastleKingAfterMove}},
            {set: {key: 'canCastleQueen', value: canCastleQueenAfterMove}},
            {set: {key: 'enpassantPosition', value: enpassantPositionAfterMove}},
            {set: {key: 'promoteTo', value: promoteToAfterMove}},
            ];
  }

  /**
  * Returns true if the conditions of castle to king side satisfied
  */
  function isCastlingKing(board:any, deltaFrom:any, deltaTo:any, turnIndex:any, canCastleKing:any) {
    var fromRow = deltaFrom.row,
        fromCol = deltaFrom.col,
        toCol = deltaTo.col,
        caslingRow = (turnIndex === 0 ? 7 : 0),
        turn = getTurn(turnIndex);
    if (isPositionUnderAttack(board, turnIndex, deltaFrom)) { return false; }
    if (canCastleKing[turnIndex] && fromRow === caslingRow &&
      fromCol === 4 && toCol - fromCol === 2) {
      for (var j = 5; j <= 6; j++) {
        if (board[fromRow][j] !== '') { return false; }
        if (isPositionUnderAttack(board, turnIndex, {row: fromRow, col: j})) { return false; }
      }
      return board[caslingRow][7] === turn + 'R';
    }
    return false;
  }

  /**
  * Returns true if the conditions of castle to queen side satisfied
  */
  function isCastlingQueen(board:any, deltaFrom:any, deltaTo:any, turnIndex:any, canCastleQueen:any) {
    var fromRow = deltaFrom.row,
        fromCol = deltaFrom.col,
        toCol = deltaTo.col,
        caslingRow = (turnIndex === 0 ? 7 : 0),
        turn = getTurn(turnIndex);
    if (isPositionUnderAttack(board, turnIndex, deltaFrom)) { return false; }
    if (canCastleQueen[turnIndex] && fromRow === caslingRow &&
      fromCol === 4 && fromCol - toCol === 2) {
      for (var j = 1; j <= 3; j++) {
        if (board[fromRow][j] !== '') { return false; }
        if (isPositionUnderAttack(board, turnIndex, {row: fromRow, col: j})) { return false; }
      }
      return board[caslingRow][0] === turn + 'R';
    }
    return false;
  }

  /**
  * Returns true if the deltaTo is available for king to move
  */
  function canKingMove(board:any, deltaFrom:any, deltaTo:any, turnIndex:any) {
    var fromRow = deltaFrom.row,
        fromCol = deltaFrom.col,
        toRow = deltaTo.row,
        toCol = deltaTo.col;
    if (toRow < 0 || toCol < 0 || toRow > 7 || toCol > 7) { return false; }
    var endPiece = board[toRow][toCol];
    var opponent = getOpponent(turnIndex);
    if (endPiece !== '' && endPiece.charAt(0) !== opponent) { return false; }

    for (var i = fromRow - 1; i <= fromRow + 1; i++) {
      for (var j = fromCol - 1; j <= fromCol + 1; j++) {
        if (i >= 0 && i <= 7 && j >= 0 && j <= 7) {
          if (i === toRow && j === toCol) {
            return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
          }
        }
      }
    }
    return false;
  }

  /**
  * Returns true if the king has any place to move
  * @startPos is the king's current position
  */
  function canKingMoveAnywhere(board:any, turnIndex:any, startPos:any, isUnderCheck:any, canCastleKing:any, canCastleQueen:any) {
    return getKingPossibleMoves(board, turnIndex, startPos, isUnderCheck,
            canCastleKing, canCastleQueen).length !== 0;
  }

  /**
  * Returns a list of positions available for king to move
  */
  export function getKingPossibleMoves(board:any, turnIndex:any, startPos:any, isUnderCheck:any, canCastleKing:any, canCastleQueen:any) {
    var fromRow = startPos.row,
        fromCol = startPos.col,
        destinations:any = [],
        opponent = getOpponent(turnIndex);
    // standard moves
    for (var i = fromRow - 1; i <= fromRow + 1; i++) {
      for (var j = fromCol - 1; j <= fromCol + 1; j++) {
        if (i >= 0 && i <= 7 && j >= 0 && j <= 7) {
          if (board[i][j] === '' || board[i][j].charAt(0) === opponent) {
            var curPos = {row: i, col: j};
            if (moveAndCheck(board, turnIndex, startPos, curPos)) {
              destinations.push(curPos);
            }
          }
        }
      }
    }
    // casling moves
    if (!isUnderCheck[turnIndex] &&
      isCastlingKing(board, startPos, {row: fromRow, col: fromCol + 2}, turnIndex, canCastleKing)) {
      destinations.push({row: fromRow, col: fromCol + 2});
    }
    if (!isUnderCheck[turnIndex] &&
      isCastlingQueen(board, startPos, {row: fromRow, col: fromCol - 2}, turnIndex, canCastleQueen)) {
      destinations.push({row: fromRow, col: fromCol - 2});
    }
    return destinations;
  }

  /**
  * Returns true the current player's king is under check for given board
  */
  function isUnderCheckByPositions(board:any, turnIndex:any) {
    var kingsPosition = findKingsPosition(board, turnIndex);

    if (kingsPosition) {
      return isPositionUnderAttack(board, turnIndex, kingsPosition);
    } else {
      throw new Error("Your king is missing and the game should end!");
    }
  }

  /**
  * Returns true if the position is under attack by any opponent pieces
  * @position is the coordinate of the position
  */
  function isPositionUnderAttack(board:any, turnIndex:any, position:any) {
    var opponent = getOpponent(turnIndex);
    var attPositions:any = [];

    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        if (board[i][j] !== '' && board[i][j].charAt(0) === opponent) {
          var opponentPiece = board[i][j];
          var curPos = {row: i, col: j};
          switch (opponentPiece.charAt(1)) {
            case 'K':
              if (canKingMove(board, curPos, position, 1 - turnIndex)) {
                attPositions.push(curPos);
              }
              break;
            case 'Q':
              if (canQueenMove(board, curPos, position, 1 - turnIndex)) {
                attPositions.push(curPos);
              }
              break;
            case 'R':
              if (canRookMove(board, curPos, position, 1 - turnIndex)) {
                attPositions.push(curPos);
              }
              break;
            case 'B':
              if (canBishopMove(board, curPos, position, 1 - turnIndex)) {
                attPositions.push(curPos);
              }
              break;
            case 'N':
              if (canKnightMove(board, curPos, position, 1 - turnIndex)) {
                attPositions.push(curPos);
              }
              break;
            case 'P':
              if (canPawnMove(board, curPos, position, 1 - turnIndex, null)) {
                attPositions.push(curPos);
              }
              break;
          }
        }
      }
    }
    return attPositions.length !== 0;
  }
  /**
  * Returns the position of the current player's king
  */
  function findKingsPosition(board:any, turnIndex:any) {
    var kingPiece = (turnIndex === 0 ? "WK" : "BK");

    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        if (board[i][j] === kingPiece) { return {row: i, col: j}; }
      }
    }
    return;
  }

  /**
  * Returns true if queen can move from deltaFrom to deltaTo
  */
  function canQueenMove(board:any, deltaFrom:any, deltaTo:any, turnIndex:any) {
    return canRookMove(board, deltaFrom, deltaTo, turnIndex) ||
    canBishopMove(board, deltaFrom, deltaTo, turnIndex);
  }

  /**
  * Returns true if the queen has any place to move
  */
  function canQueenMoveAnywhere(board:any, turnIndex:any, startPos:any) {
    return canRookMoveAnywhere(board, turnIndex, startPos) ||
    canBishopMoveAnywhere(board, turnIndex, startPos);
  }

  /**
  * Returns all available positions for queen to move
  */
  export function getQueenPossibleMoves(board:any, turnIndex:any, startPos:any) {
    return getRookPossibleMoves(board, turnIndex, startPos).concat(
            getBishopPossibleMoves(board, turnIndex, startPos));
  }

  /**
  * Returns true if the rook can move from deltaFrom to deltaTo
  */
  function canRookMove(board:any, deltaFrom:any, deltaTo:any, turnIndex:any) {
    if (isOutOfBound(deltaTo)) {
      return false;
    }
    let endPieceEmpty = (board[deltaTo.row][deltaTo.col] === '');
    let endPieceTeam = board[deltaTo.row][deltaTo.col].charAt(0);
    if (!endPieceEmpty && endPieceTeam === getTurn(turnIndex)) {
      return false;
    }
    if (deltaFrom.row === deltaTo.row) {
      if (deltaFrom.col === deltaTo.col) { 
        return false; 
      }
      let col1 = deltaTo.col + 1;
      let col2 = deltaFrom.col;
      if (deltaFrom.col < deltaTo.col){
        col1 = deltaFrom.col + 1;
        col2 = deltaTo.col;
      }
      for (let i = col1; i < col2; i++) {
        if (board[deltaFrom.row][i] !== '') {
          return false;
        }
      }
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    }
    else if (deltaFrom.col === deltaTo.col) {
      if (deltaFrom.row === deltaTo.row) {
        return false;
      }
      let row1 = deltaTo.row + 1;
      let row2 = deltaFrom.row;
      if (deltaFrom.row < deltaTo.row){
        row1 = deltaFrom.row + 1;
        row2 = deltaTo.row;
      }
      for (let i = row1; i < row2; i++) {
        if (board[i][deltaFrom.col] !== '') {
          return false;
        }
      }
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    } else {
      return false;
    }
  }

  /**
  * Returns true if the rook has any place to move
  */
  function canRookMoveAnywhere(board:any, turnIndex:any, startPos:any) {
    for (let i = 1; i < 8; i++) {
      let endPos1 = {row: startPos.row + i, col: startPos.col},
          endPos2 = {row: startPos.row - i, col: startPos.col},
          endPos3 = {row: startPos.row, col: startPos.col + i},
          endPos4 = {row: startPos.row, col: startPos.col - i};
      if (canRookMove(board, startPos, endPos1, turnIndex)) { return true; }
      if (canRookMove(board, startPos, endPos2, turnIndex)) { return true; }
      if (canRookMove(board, startPos, endPos3, turnIndex)) { return true; }
      if (canRookMove(board, startPos, endPos4, turnIndex)) { return true; }
    }
    return false;
  }

  /**
  * Returns all available positions for rook to move
  */
  export function getRookPossibleMoves(board:any, turnIndex:any, startPos:any) {
    let toPos:any = [];
    for (let i = 1; i < 8; i++) {
      let endPos1 = {row: startPos.row + i, col: startPos.col},
          endPos2 = {row: startPos.row - i, col: startPos.col},
          endPos3 = {row: startPos.row, col: startPos.col + i},
          endPos4 = {row: startPos.row, col: startPos.col - i};
      if (canRookMove(board, startPos, endPos1, turnIndex)) { toPos.push(endPos1); }
      if (canRookMove(board, startPos, endPos2, turnIndex)) { toPos.push(endPos2); }
      if (canRookMove(board, startPos, endPos3, turnIndex)) { toPos.push(endPos3); }
      if (canRookMove(board, startPos, endPos4, turnIndex)) { toPos.push(endPos4); }
    }
    return toPos;
  }

  /**
  * Returns true if the bishop can move from deltaFrom to deltaTo
  */
  function canBishopMove(board:any, deltaFrom:any, deltaTo:any, turnIndex:any):Boolean {
    if (isOutOfBound(deltaTo)) {
      return false;
    }
    let endPieceEmpty = (board[deltaTo.row][deltaTo.col] === '');
    let endPieceTeam = board[deltaTo.row][deltaTo.col].charAt(0);
    if (!endPieceEmpty && endPieceTeam === getTurn(turnIndex)) {
      return false;
    }
    let diffRow = Math.abs(deltaFrom.row - deltaTo.row)
    let diffCol = Math.abs(deltaFrom.col - deltaTo.col)
    if ((!diffRow && !diffCol) || (diffRow !== diffCol)) {
      return false;
    }
    else {
      for (let i = 1; i < diffRow; i++) {
        let cell = '';
        let col = deltaFrom.col - i;
        if (deltaFrom.col < deltaTo.col){
          col = deltaFrom.col + i;
        }
        if (deltaFrom.row < deltaTo.row) {
          cell = board[deltaFrom.row + i][col];
        } else {
          cell = board[deltaFrom.row - i][col];
        }
        if (cell !== '') {
          return false;
        }
      }
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    }
  }

  /**
  * Returns true if the rook has any place to move
  */
  function canBishopMoveAnywhere(board:any, turnIndex:any, startPos:any):Boolean {
    for (let i = 1; i < 8; i++) {
      let endPos1 = {row: startPos.row - i, col: startPos.col - i},
          endPos2 = {row: startPos.row - i, col: startPos.col + i},
          endPos3 = {row: startPos.row + i, col: startPos.col - i},
          endPos4 = {row: startPos.row + i, col: startPos.col + i};
      if (canBishopMove(board, startPos, endPos1, turnIndex)) { return true; }
      if (canBishopMove(board, startPos, endPos2, turnIndex)) { return true; }
      if (canBishopMove(board, startPos, endPos3, turnIndex)) { return true; }
      if (canBishopMove(board, startPos, endPos4, turnIndex)) { return true; }
    }
    return false;
  }

  /**
  * Returns the list of available positions for bishop to move
  */
  export function getBishopPossibleMoves(board:any, turnIndex:any, startPos:any) {
    let toPos:any = [];
    for (let i = 1; i < 8; i++) {
      let endPos1 = {row: startPos.row - i, col: startPos.col - i},
          endPos2 = {row: startPos.row - i, col: startPos.col + i},
          endPos3 = {row: startPos.row + i, col: startPos.col - i},
          endPos4 = {row: startPos.row + i, col: startPos.col + i};
      if (canBishopMove(board, startPos, endPos1, turnIndex)) { toPos.push(endPos1); }
      if (canBishopMove(board, startPos, endPos2, turnIndex)) { toPos.push(endPos2); }
      if (canBishopMove(board, startPos, endPos3, turnIndex)) { toPos.push(endPos3); }
      if (canBishopMove(board, startPos, endPos4, turnIndex)) { toPos.push(endPos4); }
    }
    return toPos;
  }

  /**
  * Returns true if the knight can move from deltaFrom to deltaTo
  */
  function canKnightMove(board:any, deltaFrom:any, deltaTo:any, turnIndex:any):Boolean {
    if (isOutOfBound(deltaTo)) {
      return false;
    }
    let endPieceEmpty = (board[deltaTo.row][deltaTo.col] === '');
    let endPieceTeam = board[deltaTo.row][deltaTo.col].charAt(0);
    if (!endPieceEmpty && endPieceTeam === getTurn(turnIndex)) {
      return false;
    }

    if (Math.abs(deltaFrom.row - deltaTo.row) === 2 && 
        Math.abs(deltaFrom.col - deltaTo.col) === 1) {
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    } else if (Math.abs(deltaFrom.row - deltaTo.row) === 1 && //XXX
               Math.abs(deltaFrom.col - deltaTo.col) === 2) {
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    }
    return false;
  }

  /**
  * Returns true if the knight has any place available to move
  */
  function canKnightMoveAnywhere(board:any, turnIndex:any, startPos:any):Boolean {
    for (let i = startPos.row - 2; i < startPos.row + 3; i++) {
      if (i === startPos.row) {
        continue;
      }
      for (let j = startPos.col - 2; j < startPos.col + 3; j++) {
        if (j === startPos.col) {
          continue;
        }
        let endPos = {row: i, col: j};
        if (canKnightMove(board, startPos, endPos, turnIndex)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
  * Returns the list of available positions for knight to move
  */
  export function getKnightPossibleMoves(board:any, turnIndex:any, startPos:any) {
    let toPos:any = [];
    for (let i = startPos.row - 2; i < startPos.row + 3; i++) {
      if (i === startPos.row) {
        continue;
      }
      for (let j = startPos.col - 2; j < startPos.col + 3; j++) {
        if (j === startPos.col) {
          continue;
        }
        let endPos = {row: i, col: j};
        if (canKnightMove(board, startPos, endPos, turnIndex)) {
          toPos.push(endPos);
        }
      }
    }
    return toPos;
  }

  /**
  * Returns true if the pawn can move from deltaFrom to deltaTo
  */
  function canPawnMove(board:any, deltaFrom:any, deltaTo:any, turnIndex:any, enpassantPosition:any) {
    if (isOutOfBound(deltaTo)) {
      return false;
    }
    let endPieceEmpty = (board[deltaTo.row][deltaTo.col] === '');
    let endPieceTeam = board[deltaTo.row][deltaTo.col].charAt(0);
    if (!endPieceEmpty && endPieceTeam === getTurn(turnIndex)) {
      return false;
    }
    // check if is first move with two squares
    let diffRow = Math.abs(deltaFrom.row - deltaTo.row);
    let diffCol = Math.abs(deltaFrom.col - deltaTo.col)
    if (
        (diffRow === 2 &&
         endPieceEmpty &&
         deltaFrom.col === deltaTo.col &&
         deltaFrom.row === (getTurn(turnIndex) === "W" ? 6 : 1) &&
         board[(deltaFrom.row > deltaTo.row ? deltaFrom.row : deltaTo.row) - 1][deltaTo.col] === ''
        ) || (
         diffRow === 1 &&
         endPieceEmpty &&
         deltaFrom.col === deltaTo.col
        ) || (
         diffRow === 1 &&
         diffCol === 1 &&
         (endPieceTeam !== getTurn(turnIndex) || 
          endPieceEmpty &&
          enpassantPosition &&
          enpassantPosition.row &&
          enpassantPosition.col &&
          deltaFrom.row === enpassantPosition.row &&
          Math.abs(deltaFrom.col - enpassantPosition.col) === 1
         )
        )
       ){
      return moveAndCheck(board, turnIndex, deltaFrom, deltaTo);
    }
    return false;
  }

  /**
  * Returns true if the pawn has any place available to move
  */
  function canPawnMoveAnywhere(board:any, turnIndex:any, startPos:any, enpassantPosition:any) {
    let endPos = {row: startPos.row, col: -1};
    if (getTurn(turnIndex) === 'B'){
      endPos.row++;
    } else {
      endPos.row--;
    }
    for (let j = startPos.col - 1; j <= startPos.col + 1; j++) {
      endPos.col = j;
      if (canPawnMove(board, startPos, endPos, turnIndex, enpassantPosition)) {
        return true;
      }
    }
    endPos.col = startPos.col;
    if (getTurn(turnIndex) === 'B'){
      endPos.row++;
    } else {
      endPos.row--;
    }
    if (canPawnMove(board, startPos, endPos, turnIndex, enpassantPosition)) {
      return true;
    }
    return false;
  }

  /**
  * Returns the list of available positions for pawn to move
  */
  function getPawnPossibleMoves(board:any, turnIndex:any, startPos:any, enpassantPosition:any) {
    let toPos:any = [];
    let endPos = {row: startPos.row, col: -1};
    if (getTurn(turnIndex) === 'B'){
      endPos.row++;
    } else {
      endPos.row--;
    }
    for (let j = startPos.col - 1; j <= startPos.col + 1; j++) {
      endPos.col = j;
      if (canPawnMove(board, startPos, endPos, turnIndex, enpassantPosition)) {
        toPos.push(endPos);
      }
    }
    endPos.col = startPos.col;
    if (getTurn(turnIndex) === 'B'){
      endPos.row++;
    } else {
      endPos.row--;
    }
    if (canPawnMove(board, startPos, endPos, turnIndex, enpassantPosition)) {
      toPos.push(endPos);
    }
    return toPos;
  }

  /**
  * Take the move from startPos to endPos and update the board acocrdingly,
  * see if the current player's king is under check.
  * Returns true if the move does not lead king to check
  * @startPos the start position of moving
  * @endPos the end position of moving
  */
  function moveAndCheck(board:any, turnIndex:any, startPos:any, endPos:any) {
    if (board[endPos.row][endPos.col] === getOpponent(turnIndex) + 'K') { return true; }
    var boardAfterMove = angular.copy(board);
    boardAfterMove[endPos.row][endPos.col] = boardAfterMove[startPos.row][startPos.col];
    boardAfterMove[startPos.row][startPos.col] = '';
    if (isUnderCheckByPositions(boardAfterMove, turnIndex)) { return false; }
    return true;
  }

  /**
  * Returns opponent initial
  */
  function getOpponent(turnIndex:any) {
    if (turnIndex === 0){
      return 'B';
    }
    return 'W';
  }

  /**
  * Returns turnIndex initial
  */
  function getTurn(turnIndex:any) {
    if (turnIndex === 0){
      return 'W';
    }
    return 'B';
  }

  function isOutOfBound(pos:any):Boolean{
    if (pos.row < 0 || pos.col < 0 || pos.row > 7 || pos.col > 7) {
      return true;
    }
    return false;
  }


 /**
  * Check if the move is OK.
  *
  * @param params the match info which contains stateBeforeMove, turnIndexBeforeMove and move.
  * @returns return true if the move is ok, otherwise false.
  */
  export function isMoveOk(params:any) {
    var move = params.move;
    var turnIndexBeforeMove = params.turnIndexBeforeMove;
    var stateBeforeMove = params.stateBeforeMove;

    /* We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
     * to verify that move is legal. */
    try {
      var deltaFrom = move[2].set.value;
      var deltaTo = move[3].set.value;
      var isUnderCheck = stateBeforeMove.isUnderCheck;
      var canCastleKing = stateBeforeMove.canCastleKing;
      var canCastleQueen = stateBeforeMove.canCastleQueen;
      var enpassantPosition = stateBeforeMove.enpassantPosition;
      var board = stateBeforeMove.board;
      var promoteTo = move[8].set.value;

console.log("isMoveOk arguments: " + angular.toJson([board, deltaFrom, deltaTo, turnIndexBeforeMove,
                          isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition, promoteTo]));
      var expectedMove = createMove(board, deltaFrom, deltaTo, turnIndexBeforeMove,
                          isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition,
                          promoteTo);
// console.log("jane!!!!");
// console.log("move:    " + JSON.stringify(move));
// console.log("expmove: " + JSON.stringify(expectedMove));
      if (!angular.equals(move, expectedMove)) {
        return false;
      }
    } catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return true;
  }

  /**
   * Returns all the possible moves for the given state and turnIndex.
   * Returns an empty array if the game is over.
   * @params is the state
   */
  export function getPossibleMoves(board:any, turnIndex:any, isUnderCheck:any, canCastleKing:any, canCastleQueen:any, enpassantPosition:any) {
    // the list of possible moves of deltaFrom and deltaTo
    if (!board) { return []; }
    let possibleMoves:any = [];
    let turn = getTurn(turnIndex);
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let piece = board[i][j];
        if (piece !== '' && piece.charAt(0) === turn) {
          let startPos = {row: i, col: j};
          switch(piece.charAt(1)) {
            case 'K':
              possibleMoves.push([startPos,
                                  getKingPossibleMoves(board,
                                                       turnIndex,
                                                       startPos,
                                                       isUnderCheck,
                                                       canCastleKing,
                                                       canCastleQueen)
                                  ]);
              break;
            case 'Q':
              possibleMoves.push([startPos,
                                  getQueenPossibleMoves(board,
                                                        turnIndex,
                                                        startPos)
                                  ]);
              break;
            case 'R':
              possibleMoves.push([startPos,
                                  getRookPossibleMoves(board,
                                                       turnIndex,
                                                       startPos)
                                  ]);
              break;
            case 'B':
              possibleMoves.push([startPos,
                                  getBishopPossibleMoves(board,
                                                         turnIndex,
                                                         startPos)
                                  ]);
              break;
            case 'N':
              possibleMoves.push([startPos,
                                  getKnightPossibleMoves(board,
                                                         turnIndex,
                                                         startPos)
                                  ]);
              break;
            case 'P':
              possibleMoves.push([startPos,
                                  getPawnPossibleMoves(board,
                                                       turnIndex,
                                                       startPos,
                                                       enpassantPosition)
                                  ]);
              break;
          }
        }
      }
    }

    let realPossibleMoves:any = [];
    for (let i = 0; i < possibleMoves.length; i++) {
      if (possibleMoves[i] && possibleMoves[i][1].length) {
        realPossibleMoves.push(possibleMoves[i]);
      }
    }
    return realPossibleMoves;
  }
}
