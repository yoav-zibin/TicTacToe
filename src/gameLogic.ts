/**
 * This is the logic service for chess. The game board is represented as a
 * 2D array (9*7). All elements are listed below:
 *
 * LionW:      White Lion          LionB:      Black Lion
 * TigerW:     White Tiger         TigerB:     Black Tiger
 * DogW:       White Dog           DogB:       Black Dog
 * CatW:       White Cat           CatB:       Black Cat
 * MouseW:     White Mouse         MouseB:     Black Mouse
 * LeopardW:   White Leopard       LeopardB:   Black Leopard
 * WolfW:      White Wolf          WolfB:      Black Wolf
 * ElephantW:  White Elephant      ElephantB:  Black Elephant
 * TrapW:      White Trap          TrapB:      Black Trap
 * DenW:       White Home          DenB:       Black Home
 *
 * L: Land                       R: River
 *
 *
 *
 * Example - The initial state:
 *
 *        0     1     2     3     4     5     6
 * 0:  [['WLion', 'L', 'WTrap', 'WDen', 'WTrap', 'L', 'WTiger'],
 * 1:  ['L', 'WDog', 'L', 'WTrap', 'L', 'WCat', 'L'],
 * 2:  ['WMouse', 'L', 'WLeopard', 'L', 'WWolf', 'L', 'WElephant'],
 * 3:  ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
 * 4:  ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
 * 5:  ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
 * 6:  ['BElephant', 'L', 'BWolf', 'L', 'BLeopard', 'L', 'BMouse'],
 * 7:  ['L', 'BCat', 'L', 'BTrap', 'L', 'BDog', 'L'],
 * 8:  ['BTiger', 'L', 'BTrap', 'BDen', 'BTrap', 'L', 'BLion']]
 *
 * Note: The number of row and col are both zero based
 *
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * The move operation is an array consist of several parts:
 *
 * 0 - setTurn: {setTurn: {turnIndex: 0}}
 * 0 - endMatch: {endMatch: {endMatchScores: [1, 0]}}
 * 1 - setBoard: {set: {key: 'board', value: [[...], ..., [...]]}}
 * 2 - setDeltaFrom: {set: {key: 'deltaFrom', value: {row: row, col: col}}}
 * 3 - setDeltaTo: {set: {key: 'deltaTo', value: {row: row, col: col}}}
 *
 * Notes: move[0] can be either setTurn or endMatch
 *
 */

type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
}
interface IState {
  board?: Board;
  delta?: BoardDelta;
}

module gameLogic {

  export const ROWS = 9;
  export const COLS = 7;
  export const BlackTraps: BoardDelta[] =
    [{row: 8, col:2}, {row: 7, col:3}, {row: 8, col:4}];
  export const WhiteTraps: BoardDelta[] =
    [{row: 0, col:2}, {row: 1, col:3}, {row: 0, col:4}];
  export const RiverPos: BoardDelta[] = [{row: 3, col: 1}, {row: 3, col: 2},
    {row: 3,col: 4}, {row: 3, col: 5}, {row: 4, col: 1}, {row: 4, col: 2},
    {row: 4,col: 4}, {row: 4, col: 5}, {row: 5, col: 1}, {row: 5, col: 2},
    {row: 5,col: 4}, {row: 5, col: 5}];
  export const BlackDen: BoardDelta = {row: 8, col: 3};
  export const WhiteDen: BoardDelta = {row: 0, col: 3};

  /**
   * Returns the initial Jungle board, which is a 9x7 matrix containing ''.
  **/
  export function getInitialBoard(): Board {
    return [['WLion', 'L', 'WTrap', 'WDen', 'WTrap', 'L', 'WTiger'],
			     ['L', 'WDog', 'L', 'WTrap', 'L', 'WCat', 'L'],
           ['WMouse', 'L', 'WLeopard', 'L', 'WWolf', 'L', 'WElephant'],
           ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
           ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
           ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
           ['BElephant', 'L', 'BWolf', 'L', 'BLeopard', 'L', 'BMouse'],
           ['L', 'BCat', 'L', 'BTrap', 'L', 'BDog', 'L'],
           ['BTiger', 'L', 'BTrap', 'BDen', 'BTrap', 'L', 'BLion']];
  }

  /**
   * Returns true if the game ended in a tie because there are no available moves for any pieces
   * Even it is almost impossible to happen in this game, I also write this function
  **/
  function isTie(board: Board, turnIndexBeforeMove: number): boolean {
    var turn = getTurn(turnIndexBeforeMove);
    for(var i = 0; i < ROWS; i++) {
      for(var j = 0; j < COLS; j++) {
        var curPiece = board[i][j];
        var curPosition: BoardDelta = {row: i, col: j};
        if(curPiece[0] !== turn) {
          continue;
        }
        switch (curPiece.substring(1)) {
          case "Mouse":
            if(canMouseMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
              return false;
            }
            break;
          case "Cat":
            if(canCatMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
              return false;
            }
            break;
          case "Wolf":
            if(canWolfMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
              return false;
            }
            break;
          case "Dog":
            if(canDogMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
              return false;
            }
            break;
          case "Leopard":
            if(canLeopardMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
              return false;
            }
            break;
          case "Tiger":
            if(canTigerMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
              return false;
            }
            break;
          case "Lion":
            if(canLionMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
              return false;
            }
            break;
          case "Elephant":
            if(canElephantMoveAnywhere(board, turnIndexBeforeMove, curPosition)) {
              return false;
            }
            break;
          default: break;
        }
      }
    }
    return true;
  }

  /**
   * Returns turnIndex initial
   * 0: Black;    1: White
  **/
  function getTurn(turnIndex: number):string {
    return (turnIndex === 0 ? 'B' : 'W');
  }

  /**
   * Returns Opponent's turnIndex
   * 0: Black;    1: White
  **/
  // function getOpponentTurn(turnIndex: number):string {
  //   return (turnIndex === 0 ? 'W' : 'B');
  // }

  /**
   * Returns id (int) for specific animal (string)
   * 0: Mouse;    1: Cat;    2: Wolf;    3: Dog;    4: Leopard;
   * 5: Tiger;  6: Lion;   7: Elephant
  **/
  function getIdFromAnimal(animal: string): number {
    switch (animal) {
      case 'Mouse': return 0;
      case 'Cat': return 1;
      case 'Wolf': return 2;
      case 'Dog': return 3;
      case 'Leopard': return 4;
      case 'Tiger': return 5;
      case 'Lion': return 6;
      case 'Elephant': return 7;
      // default:
      //   try {
      //     throw new Error("Cannot transfor from this animal to int ID");
      //   }
      //   catch(err) {
      //     console.log(err);
      //   }
    }
  }

  /**
   * Return true if the position out of board
  **/
  function isOutBoard(deltaFrom: BoardDelta):boolean {
    if(deltaFrom.row < 0 || deltaFrom.row >= ROWS
      || deltaFrom.col < 0 || deltaFrom.col >= COLS) {
      return true;
    }
    return false;
  }

  /**
   * Return true if the position is player's own trap
  **/
  function isOwnTrap(turnIndexBeforeMove: number, deltaFrom: BoardDelta):boolean {
    if(turnIndexBeforeMove === 0) {
      for(let trap of BlackTraps) {
        if(angular.equals(trap, deltaFrom)) {
          return true;
        }
      }
      return false;
    }else if(turnIndexBeforeMove === 1) {
      for(let trap of WhiteTraps) {
        if(angular.equals(trap, deltaFrom)) {
          return true;
        }
      }
      return false;
    }else {
      // try {
      //   throw new Error("turnIndexBeforeMove is wrong");
      // }
      // catch(err) {
      //   console.log(err);
      // }
    }
  }

  /**
   * Return true if the position is in river
  **/
  function isInRiver(deltaFrom: BoardDelta):boolean {
    for(let pos of RiverPos) {
      if(angular.equals(pos, deltaFrom)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Return true if the position is player's own den
  **/
  function isOwnDen(turnIndexBeforeMove: number, deltaFrom: BoardDelta):boolean {
    if(turnIndexBeforeMove === 0) {
      if(angular.equals(deltaFrom, BlackDen)) {
        return true;
      }
      return false;
    }else if(turnIndexBeforeMove === 1) {
      if(angular.equals(deltaFrom, WhiteDen)) {
        return true;
      }
      return false;
    }else {
      // try {
      //   throw new Error("turnIndexBeforeMove is wrong");
      // }
      // catch(err) {
      //   console.log(err);
      // }
    }
  }

  /**
   * Return true if the position has no chess piece
  **/
  function noChessPiece(board: Board, deltaFrom: BoardDelta): boolean {
    var row = deltaFrom.row;
    var col = deltaFrom.col;
    if(board[row][col] === 'L' || board[row][col] === 'R'
      || board[row][col] === 'WTrap' || board[row][col] === 'WDen'
      || board[row][col] === 'BTrap' || board[row][col] === 'BDen') {
      return true;
    }
    return false;
  }

  /**
   * Return true if the position has player's own chess piece
  **/
  function isOwnChessPiece(board: Board, turnIndexBeforeMove: number,
    deltaFrom: BoardDelta):boolean {
    var row = deltaFrom.row;
    var col = deltaFrom.col;
    if(noChessPiece(board, deltaFrom)) {
      return false;
    }else {
      if(board[row][col].charAt(0) === 'B' && turnIndexBeforeMove === 0) {
        return true;
      }
      if(board[row][col].charAt(0) === 'W' && turnIndexBeforeMove === 1) {
        return true;
      }
      return false;
    }
  }

  /**
   * Return the winner (either 'W' or 'B') or '' if there is no winner
  **/
  function getWinner(board: Board): string {
    if(board[BlackDen.row][BlackDen.col] !== 'BDen') {
      return 'W';
    }else if(board[WhiteDen.row][WhiteDen.col] !== 'WDen') {
      return 'B';
    }else {
      return '';
    }
  }

  /**
   * Returns the list of available positions for animal
   * that who can only move on land but not jump through river
   * include: Cat, Wolf, Dog, Leopard, Elephant
  **/
  function getLandAnimalPossibleMoves(board: Board, turnIndexBeforeMove: number,
    deltaFrom: BoardDelta): BoardDelta[] {
      var possibleMoves: BoardDelta[] = [];

      // for any animal there are at most four possible moves
      // up， down, left, right
      var upMove: BoardDelta = {row: deltaFrom.row - 1, col: deltaFrom.col};
      var downMove: BoardDelta = {row: deltaFrom.row + 1, col: deltaFrom.col};
      var leftMove: BoardDelta = {row: deltaFrom.row, col: deltaFrom.col - 1};
      var rightMove: BoardDelta = {row: deltaFrom.row, col: deltaFrom.col + 1};

      if(canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, upMove)) {
        possibleMoves.push(upMove);
      }
      if(canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, downMove)) {
        possibleMoves.push(downMove);
      }
      if(canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, leftMove)) {
        possibleMoves.push(leftMove);
      }
      if(canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, rightMove)) {
        possibleMoves.push(rightMove);
      }
      return possibleMoves;
  }

  /**
   * Returns true if the land animal can move to destination
   * include: Cat, Wolf, Dog, Leopard, Elephant
  **/
  function canLandAnimalMove(board: Board, turnIndexBeforeMove: number, deltaFrom: BoardDelta, deltaTo: BoardDelta): boolean {
    // cannot out board, in river or own den
    if(isOutBoard(deltaTo) || isInRiver(deltaTo) || isOwnDen(turnIndexBeforeMove, deltaTo)) {
      return false;
    }

    // can only move one cell throw up, down, left or right direction
    if(deltaFrom.row !== deltaTo.row && deltaFrom.col !== deltaTo.col) {
      return false;
    }else if(deltaFrom.row === deltaTo.row) {
      if(Math.abs(deltaFrom.col - deltaTo.col) !== 1) {
        return false;
      }
    }else if(deltaFrom.col === deltaTo.col) {
      if(Math.abs(deltaFrom.row - deltaTo.row) !== 1) {
        return false;
      }
    }else if(angular.equals(deltaFrom, deltaTo)) {
      return false;
    }else {};

    return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
  }

  /**
   * Return true if Mouse is in the water when Lion/Tiger want to fly through river
  **/
  function isMouseOnWay(board: Board, deltaFrom: BoardDelta, deltaTo: BoardDelta): boolean {
    // move through parallel direction
    if(deltaFrom.row === deltaTo.row) {
      var temp1: string;
      var temp2: string;
      if(deltaFrom.col < deltaTo.col) {
        temp1 = board[deltaFrom.row][deltaFrom.col+1];
        temp2 = board[deltaFrom.row][deltaFrom.col+2];
      }else {
        temp1 = board[deltaFrom.row][deltaFrom.col-1];
        temp2 = board[deltaFrom.row][deltaFrom.col-2];
      }
      if( temp1.substring(1) === "Mouse" || temp2.substring(1) === "Mouse") {
        return true;
      }
      return false;
    }
    // move through vertical direction
    else {
      var temp1: string;
      var temp2: string;
      var temp3: string;
      if(deltaFrom.row < deltaTo.row) {
        temp1 = board[deltaFrom.row+1][deltaFrom.col];
        temp2 = board[deltaFrom.row+2][deltaFrom.col];
        temp3 = board[deltaFrom.row+3][deltaFrom.col];
      }else {
        temp1 = board[deltaFrom.row-1][deltaFrom.col];
        temp2 = board[deltaFrom.row-2][deltaFrom.col];
        temp3 = board[deltaFrom.row-3][deltaFrom.col];
      }
      if( temp1.substring(1) === "Mouse" || temp2.substring(1) === "Mouse"
        || temp3.substring(1) === "Mouse") {
        return true;
      }
      return false;
    }
  }

  /**
   * Returns the list of available positions for animal
   * that who can move on land and also jump through river
   * include: Tiger, Lion
  **/
  function getFlyAnimalPossibleMoves(board: Board, turnIndexBeforeMove: number,
    deltaFrom: BoardDelta): BoardDelta[] {
      var possibleMoves: BoardDelta[] = [];

      // for any animal there are at most four possible moves
      // up， down, left, right
      var upMove: BoardDelta = {row: deltaFrom.row - 1, col: deltaFrom.col};
      if(isInRiver(upMove)) {
        // rat is not on the way, can fly throguh river
        if(!isMouseOnWay(board, deltaFrom, upMove)) {
          upMove.row = upMove.row - 3;
          if(canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, upMove)) {
            possibleMoves.push(upMove);
          }
        }
      }else {
        if(canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, upMove)) {
          possibleMoves.push(upMove);
        }
      }

      var downMove: BoardDelta = {row: deltaFrom.row + 1, col: deltaFrom.col};
      if(isInRiver(downMove)) {
        if(!isMouseOnWay(board, deltaFrom, downMove)) {
          downMove.row = downMove.row + 3;
          if(canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, downMove)) {
            possibleMoves.push(downMove);
          }
        }
      }else {
        if(canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, downMove)) {
          possibleMoves.push(downMove);
        }
      }

      var leftMove: BoardDelta = {row: deltaFrom.row, col: deltaFrom.col - 1};
      if(isInRiver(leftMove)) {
        if(!isMouseOnWay(board, deltaFrom, leftMove)) {
          leftMove.col = leftMove.col - 2;
          if(canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, leftMove)) {
            possibleMoves.push(leftMove);
          }
        }
      }else {
        if(canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, leftMove)) {
          possibleMoves.push(leftMove);
        }
      }

      var rightMove: BoardDelta = {row: deltaFrom.row, col: deltaFrom.col + 1};
      if(isInRiver(rightMove)) {
        if(!isMouseOnWay(board, deltaFrom, rightMove)) {
          rightMove.col = rightMove.col + 2;
          if(canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, rightMove)) {
            possibleMoves.push(rightMove);
          }
        }
      }else {
        if(canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, rightMove)) {
          possibleMoves.push(rightMove);
        }
      }

      return possibleMoves;
  }

  /**
   * Returns true if the fly animal can move to destination
   * include: Tiger, Lion
  **/
  function canFlyAnimalMove(board: Board, turnIndexBeforeMove: number, deltaFrom: BoardDelta, deltaTo: BoardDelta): boolean {
    // cannot out board, in river or own den
    if(isOutBoard(deltaTo) || isInRiver(deltaTo) || isOwnDen(turnIndexBeforeMove, deltaTo)) {
      return false;
    }

    // can only move one cell throw up, down, left or right direction
    if(deltaFrom.row !== deltaTo.row && deltaFrom.col !== deltaTo.col) {
      return false;
    }else if(deltaFrom.row === deltaTo.row) {
      // no fly: diff 1     fly: diff 3
      if(Math.abs(deltaFrom.col - deltaTo.col) !== 1 && Math.abs(deltaFrom.col - deltaTo.col) !== 3) {
        return false;
      }
    }else if(deltaFrom.col === deltaTo.col) {
      // no fly: diff 1     fly: diff 4
      if(Math.abs(deltaFrom.row - deltaTo.row) !== 1 && Math.abs(deltaFrom.row - deltaTo.row) !== 4) {
        return false;
      }
    }else if(angular.equals(deltaFrom, deltaTo)) {
      return false;
    }else {};

    // move throw parallel direction
    if(deltaFrom.row === deltaTo.row) {
      var deltaNext: BoardDelta;
      // move throw right direction
      if(deltaFrom.col < deltaTo.col) {
         deltaNext = {row: deltaFrom.row, col: deltaFrom.col+1};
         if(isInRiver(deltaNext)) {
           if(deltaTo.col - deltaFrom.col === 1) {
             return false;
           }else {
             if(isMouseOnWay(board, deltaFrom, deltaTo)) {
               return false;
             }else {
               return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
             }
           }
         }else {
           // fly on land is illegal
           if(deltaTo.col - deltaFrom.col === 3) {
             return false;
           }else {
             return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
           }
         }
      }
      // move throw left direction
      else {
        deltaNext = {row: deltaFrom.row, col: deltaFrom.col-1};
        if(isInRiver(deltaNext)) {
          if(deltaFrom.col - deltaTo.col === 1) {
            return false;
          }else {
            if(isMouseOnWay(board, deltaFrom, deltaTo)) {
              return false;
            }else {
              return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
            }
          }
        }else {
          // fly on land is illegal
          if(deltaFrom.col - deltaTo.col === 3) {
            return false;
          }else {
            return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
          }
        }
      }
    }
    // move throw vertical direction
    else {
      var deltaNext: BoardDelta;
      // move throw down direction
      if(deltaFrom.row < deltaTo.row) {
        deltaNext = {row: deltaFrom.row+1, col: deltaFrom.col};
        if(isInRiver(deltaNext)) {
          if(deltaTo.col - deltaFrom.col === 1) {
            return false;
          }else {
            if(isMouseOnWay(board, deltaFrom, deltaTo)) {
              return false;
            }else {
              return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
            }
          }
        }else {
          // fly on land is illegal
          if(deltaTo.col - deltaFrom.col === 4) {
            return false;
          }else {
            return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
          }
        }
      }
      // move throw up direction
      else {
        deltaNext = {row: deltaFrom.row-1, col: deltaFrom.col};
        if(isInRiver(deltaNext)) {
          if(deltaFrom.col - deltaTo.col === 1) {
            return false;
          }else {
            if(isMouseOnWay(board, deltaFrom, deltaTo)) {
              return false;
            }else {
              return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
            }
          }
        }else {
          // fly on land is illegal
          if(deltaFrom.col - deltaTo.col === 4) {
            return false;
          }else {
            return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
          }
        }
      }
    }

  }

  /**
   * Returns the list of available positions for animal
   * that who can move on land and also swim in river
   * include: Mouse
  **/
  function getSwimAnimalPossibleMoves(board: Board, turnIndexBeforeMove: number,
    deltaFrom: BoardDelta): BoardDelta[] {
      var possibleMoves: BoardDelta[] = [];

      // for any animal there are at most four possible moves
      // up， down, left, right
      var upMove: BoardDelta = {row: deltaFrom.row - 1, col: deltaFrom.col};
      var downMove: BoardDelta = {row: deltaFrom.row + 1, col: deltaFrom.col};
      var leftMove: BoardDelta = {row: deltaFrom.row, col: deltaFrom.col - 1};
      var rightMove: BoardDelta = {row: deltaFrom.row, col: deltaFrom.col + 1};

      if(canSwimAnimalMove(board, turnIndexBeforeMove, deltaFrom, upMove)) {
        possibleMoves.push(upMove);
      }
      if(canSwimAnimalMove(board, turnIndexBeforeMove, deltaFrom, downMove)) {
        possibleMoves.push(downMove);
      }
      if(canSwimAnimalMove(board, turnIndexBeforeMove, deltaFrom, leftMove)) {
        possibleMoves.push(leftMove);
      }
      if(canSwimAnimalMove(board, turnIndexBeforeMove, deltaFrom, rightMove)) {
        possibleMoves.push(rightMove);
      }
      return possibleMoves;
  }

  /**
   * Returns true if the fly animal can move to destination
   * include: Tiger, Lion
  **/
  function canSwimAnimalMove(board: Board, turnIndexBeforeMove: number, deltaFrom: BoardDelta, deltaTo: BoardDelta): boolean {
    // cannot out board, in river or own den
    if(isOutBoard(deltaTo) || isOwnDen(turnIndexBeforeMove, deltaTo)) {
      return false;
    }

    // can only move one cell throw up, down, left or right direction
    if(deltaFrom.row !== deltaTo.row && deltaFrom.col !== deltaTo.col) {
      return false;
    }else if(deltaFrom.row === deltaTo.row) {
      if(Math.abs(deltaFrom.col - deltaTo.col) !== 1) {
        return false;
      }
    }else if(deltaFrom.col === deltaTo.col) {
      if(Math.abs(deltaFrom.row - deltaTo.row) !== 1) {
        return false;
      }
    }else if(angular.equals(deltaFrom, deltaTo)) {
      return false;
    }else {};

    return canMoveHelper(board, turnIndexBeforeMove, deltaFrom, deltaTo);
  }

  /**
   * Returns true if can move
   * for final compare: no chess piece there or has chess piece there
  **/
  function canMoveHelper(board: Board, turnIndexBeforeMove: number, deltaFrom: BoardDelta, deltaTo: BoardDelta): boolean {
    // no chess piece there
    if(noChessPiece(board, deltaTo)) {
      return true;
    }else {
      // the chess there is opponent's
      if(!isOwnChessPiece(board, turnIndexBeforeMove, deltaTo)) {
        // player's animal can only be Mouse
        var playerAnimal = board[deltaFrom.row][deltaFrom.col];
        var opponentAnimal = board[deltaTo.row][deltaTo.col];
        var playerAnimalID = getIdFromAnimal(playerAnimal.substring(1));
        var opponentAnimalID = getIdFromAnimal(opponentAnimal.substring(1));

        // opponent's animal is in player's trap
        if(isOwnTrap(turnIndexBeforeMove, deltaTo)) {
          return true;
        }else {
          // Elephant and Mouse is special
          if(playerAnimalID >= opponentAnimalID) {
            if(playerAnimalID === 7 && opponentAnimalID === 0) {
              return false;
            }else {
              return true;
            }
          }else {
            if(playerAnimalID === 0 && opponentAnimalID === 7) {
              // the Mouse in river cannot eat Elephant on the land
              // only Mouse on the land can eat Elephant
              if(isInRiver(deltaFrom)) {
                return false;
              }else {
                return true;
              }
            }else {
              return false;
            }
          }
        }
      }else {
        return false;
      }
    }
  }

  /**
   * Returns the list of available positions for Elephant to move
  **/
  export function getElephantPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): BoardDelta[] {
    var possibleMoves: BoardDelta[] = getLandAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if Elephant can move
  **/
  export function canElephantMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
    return getElephantPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Lion to move
  **/
  export function getLionPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): BoardDelta[] {
    var possibleMoves: BoardDelta[] = getFlyAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if Lion can move
  **/
  export function canLionMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
    return getLionPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Tiger to move
  **/
  export function getTigerPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): BoardDelta[] {
    var possibleMoves: BoardDelta[] = getFlyAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if Tiger can move
  **/
  export function canTigerMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
    return getTigerPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Leopard to move
  **/
  export function getLeopardPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): BoardDelta[] {
    var possibleMoves: BoardDelta[] = getLandAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if Leopard can move
  **/
  export function canLeopardMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
    return getLeopardPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Dog to move
  **/
  export function getDogPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): BoardDelta[] {
    var possibleMoves: BoardDelta[] = getLandAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if Dog can move
  **/
  export function canDogMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
    return getDogPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Wolf to move
  **/
  export function getWolfPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): BoardDelta[] {
    var possibleMoves: BoardDelta[] = getLandAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if Wolf can move
  **/
  export function canWolfMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
    return getWolfPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Cat to move
  **/
  export function getCatPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): BoardDelta[] {
    var possibleMoves: BoardDelta[] = getLandAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if Cat can move
  **/
  export function canCatMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
    return getCatPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Mouse to move
  **/
  export function getMousePossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): BoardDelta[] {
    var possibleMoves: BoardDelta[] = getSwimAnimalPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if Mouse can move
  **/
  export function canMouseMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
    return getMousePossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns all the possible moves for the given board and turnIndexBeforeMove.
   * Returns an empty array if the game is over.
  **/
  // export function getPossibleMoves(board: Board, turnIndexBeforeMove: number): BoardDelta[] {
  //   var possibleMoves: BoardDelta[] = [];
  //   if(!board) {
  //     return [];
  //   }
  //   var turn = getTurn(turnIndexBeforeMove);
  //   for(var i = 0; i < ROWS; i++){
  //     for(var j = 0; j < COLS; j++){
  //       var piece = board[i][j];
  //       if(piece !== 'L' && piece !== 'R' && piece.charAt(0) === turn) {
  //         var deltaFrom: BoardDelta = {row: i, col: j};
  //         var oneCaseMoves: BoardDelta[];
  //         switch(piece.substring(1)) {
  //         case 'Elephant':
  //           oneCaseMoves = getElephantPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
  //           if(oneCaseMoves.length > 0) {
  //             for(let move of oneCaseMoves) {
  //               possibleMoves.push(move);
  //             }
  //           }
  //           break;
  //         case 'Lion':
  //           oneCaseMoves = getLionPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
  //           if(oneCaseMoves.length > 0) {
  //             for(let move of oneCaseMoves) {
  //               possibleMoves.push(move);
  //             }
  //           }
  //           break;
  //         case 'Tiger':
  //           oneCaseMoves = getTigerPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
  //           if(oneCaseMoves.length > 0) {
  //             for(let move of oneCaseMoves) {
  //               possibleMoves.push(move);
  //             }
  //           }
  //           break;
  //         case 'Leopard':
  //           oneCaseMoves = getLeopardPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
  //           if(oneCaseMoves.length > 0) {
  //             for(let move of oneCaseMoves) {
  //               possibleMoves.push(move);
  //             }
  //           }
  //           break;
  //         case 'Dog':
  //           oneCaseMoves = getDogPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
  //           if(oneCaseMoves.length > 0) {
  //             for(let move of oneCaseMoves) {
  //               possibleMoves.push(move);
  //             }
  //           }
  //           break;
  //         case 'Wolf':
  //           oneCaseMoves = getWolfPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
  //           if(oneCaseMoves.length > 0) {
  //             for(let move of oneCaseMoves) {
  //               possibleMoves.push(move);
  //             }
  //           }
  //           break;
  //         case 'Cat':
  //           oneCaseMoves = getCatPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
  //           if(oneCaseMoves.length > 0) {
  //             for(let move of oneCaseMoves) {
  //               possibleMoves.push(move);
  //             }
  //           }
  //           break;
  //         case 'Mouse':
  //           oneCaseMoves = getMousePossibleMoves(board, turnIndexBeforeMove, deltaFrom);
  //           if(oneCaseMoves.length > 0) {
  //             for(let move of oneCaseMoves) {
  //               possibleMoves.push(move);
  //             }
  //           }
  //           break;
  //         }
  //       }
  //     }
  //   }
  //   return possibleMoves;
  // }


  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   * @deltaFrom: start position of the piece
   * @deltaTo: destination position of the piece
   * @return if the move is legal, create it; otherwise throw error
  **/
  export function createMove(board: Board, turnIndexBeforeMove: number,
    deltaFrom: BoardDelta, deltaTo: BoardDelta):IMove {
    if(!board) {
      board = getInitialBoard();
    }
    var piece: string = board[deltaFrom.row][deltaFrom.col];
    var destination: string = board[deltaTo.row][deltaTo.col];
    var turn: string = getTurn(turnIndexBeforeMove);

    if(deltaFrom.row === deltaTo.row && deltaFrom.col === deltaTo.col) {
      throw new Error ("Cannot move to same position.");
    }

    if(destination.substring(1) === 'Den' && destination[0] === turn) {
      throw new Error("Cannot move into you own Den");
    }

    if(piece.charAt(0) !== turn) {
      // include: 'R', 'L', opponent's pieces
      if(piece === 'R' || piece === 'L') {
        throw new Error("There is no piece to move");
      }else {
        throw new Error("Cannot move opponent's piece");
      }
    }else {
      if(piece.substring(1) === 'Den' || piece.substring(1) === 'Trap') {
        throw new Error("There is no piece to move");
      }
    }

    if(getWinner(board) !== '' || isTie(board, turnIndexBeforeMove)) {
      throw new Error("Cannot make a move if the game is over!");
    }

    if(destination !== 'L' && destination !== 'R'
      && destination.substring(1) !== 'Trap' && destination.substring(1) !== 'Den') {
      if(turn === destination.charAt(0)) {
        throw new Error("One can only make a move in an empty position or capture opponent's piece!");
      }
    }

    var boardAfterMove = angular.copy(board);
    // update the board according to the moving piece
    var animal = piece.substring(1);
    switch(animal) {
      case 'Elephant':
        if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
          boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
        }else {
          throw new Error("Illegal move for Elephant.");
        }
        break;
      case 'Lion':
        if (canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
          boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
        }else {
          throw new Error("Illegal move for Lion.");
        }
        break;
      case 'Tiger':
        if (canFlyAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
          boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
        }else {
          throw new Error("Illegal move for Lion.");
        }
        break;
      case 'Leopard':
        if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
         boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
         boardAfterMove[deltaTo.row][deltaTo.col] = piece;
       }else {
         throw new Error("Illegal move for Lion.");
       }
       break;
      case 'Dog':
        if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
          boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
        }else {
          throw new Error("Illegal move for Lion.");
        }
        break;
      case 'Wolf':
        if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
          boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
        }else {
          throw new Error("Illegal move for Lion.");
        }
        break;
      case 'Cat':
        if (canLandAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
          boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
        }else {
          throw new Error("Illegal move for Lion.");
        }
        break;
      case 'Mouse':
        if (canSwimAnimalMove(board, turnIndexBeforeMove, deltaFrom, deltaTo)) {
          if(isInRiver(deltaFrom)) {
            boardAfterMove[deltaFrom.row][deltaFrom.col] = 'R';
          }else {
            boardAfterMove[deltaFrom.row][deltaFrom.col] = 'L';
          }
          boardAfterMove[deltaTo.row][deltaTo.col] = piece;
        }else {
          throw new Error("Illegal move for Lion.");
        }
        break;
      default:
        throw new Error("Unknown piece type!");
    }
    var winner = getWinner(boardAfterMove);
    var firstOperation: IOperation;
    if(winner !== '' || isTie(boardAfterMove, 1-turnIndexBeforeMove)) {
      // game is over
      firstOperation = {endMatch: {endMatchScores:
      winner === 'B' ? [1, 0] : winner === 'W' ? [0, 1] : [0, 0]}};
    }else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
    }

    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'deltaFrom', value: {row: deltaFrom.row, col: deltaFrom.col}}},
            {set: {key: 'deltaTo', value: {row: deltaTo.row, col: deltaTo.col}}}];
  }

  /**
   * Check if the move is OK.
   *
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *
   * The move operation is an array consist of several parts:
   *
   * 0 - setTurn: {setTurn: {turnIndex: 0}}
   * 0 - endMatch: {endMatch: {endMatchScores: [1, 0]}}
   * 1 - setBoard: {set: {key: 'board', value: [[...], ..., [...]]}}
   * 2 - setDeltaFrom: {set: {key: 'deltaFrom', value: {row: row, col: col}}}
   * 3 - setDeltaTo: {set: {key: 'deltaTo', value: {row: row, col: col}}}
   *
   * Notes: move[0] can be either setTurn or endMatch
   *
   * @returns return true if the move is ok, otherwise false.
  **/
  export function isMoveOk(params: IIsMoveOk): boolean {
    var move = params.move;
    var turnIndexBeforeMove = params.turnIndexBeforeMove;
    var stateBeforeMove: IState = params.stateBeforeMove;

    /* We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
     * to verify that move is legal. */
    try {
      var deltaFrom: BoardDelta = move[2].set.value;
      var deltaTo: BoardDelta = move[3].set.value;
      var board = stateBeforeMove.board;
      var expectedMove = createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo);

      if(!angular.equals(move, expectedMove)) {
        return false;
      }
    }catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return true;
  }
}
