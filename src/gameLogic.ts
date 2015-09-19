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

module gameConstVals {
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
}

module gameLogic {
  /** Returns the initial Jungle board, which is a 9x7 matrix containing ''. */
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

  // /**
  //  * Returns true if the game ended in a tie because there are
  //  * no available moves for any pieces
  //  *
  //  * @board: the board representation
  //  * @turnIndex: current player (0: Black, 1: White)
  //  *
  //  * return true if the game ended in a tie because
  //  * there are no available moves for any pieces
  //  */
  // function isTie(board: Board, turnIndex: number): boolean {
  //
  // }


  /**
  * Returns turnIndex initial
  * 0: Black;    1: White
  */
  function getTurn(turnIndex) {
    return (turnIndex === 0 ? 'B' : 'W');
  }

  /**
  * Returns id (int) for specific animal (string)
  * 0: Mouse;    1: Cat;    2: Wolf;    3: Dog;    4: Leopard;
  * 5: Tiger;  6: Lion;   7: Elephant
  */
  function getIdFromAnimal(animal: string): number {
    switch (name) {
      case "Mouse": return 0;
      case "Cat": return 1;
      case "Wolf": return 2;
      case "Dog": return 3;
      case "Leopard": return 4;
      case "Tiger": return 5;
      case "Lion": return 6;
      case "Elephant": return 7;
      default:
        try {
          throw new Error("Cannot transfor from this animal to int ID");
        }
        catch(err) {
          console.log(err);
        }
    }
  }

  /**
   * Return true if the position out of board
   */
  function isOutBoard(deltaFrom: BoardDelta):boolean {
    if(deltaFrom.row < 0 || deltaFrom.row >= gameConstVals.ROWS
      || deltaFrom.col < 0 || deltaFrom.col >= gameConstVals.COLS) {
      return true;
    }
    return false;
  }

  /**
   * Return true if the position is player's own trap
   */
  function isOwnTrap(turnIndexBeforeMove: number, deltaFrom: BoardDelta):boolean {
    if(turnIndexBeforeMove === 0) {
      for(var trap in gameConstVals.BlackTraps) {
        if(trap.col === deltaFrom.col && trap.row === deltaFrom.row) {
          return true;
        }
      }
      return false;
    }else if(turnIndexBeforeMove === 1) {
      for(var trap in gameConstVals.WhiteTraps) {
        if(trap.col === deltaFrom.col && trap.row === deltaFrom.row) {
          return true;
        }
      }
      return false;
    }else {
      try {
        throw new Error("turnIndexBeforeMove is wrong");
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  /**
   * Return true if the position is opponent's own trap
   */
  function isOpponentTrap(turnIndexBeforeMove: number, deltaFrom: BoardDelta):boolean {
    if(turnIndexBeforeMove === 0) {
      for(var trap in gameConstVals.WhiteTraps) {
        if(trap.col === deltaFrom.col && trap.row === deltaFrom.row) {
          return true;
        }
      }
      return false;
    }else if(turnIndexBeforeMove === 1) {
      for(var trap in gameConstVals.BlackTraps) {
        if(trap.col === deltaFrom.col && trap.row === deltaFrom.row) {
          return true;
        }
      }
      return false;
    }else {
      try {
        throw new Error("turnIndexBeforeMove is wrong");
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  /**
   * Return true if the position is a trap
   */
  function isTrap(turnIndexBeforeMove: number, deltaFrom: BoardDelta):boolean {
    if(isOwnTrap(turnIndexBeforeMove, deltaFrom)
      || isOpponentTrap(turnIndexBeforeMove, deltaFrom)) {
      return true;
    }
    return false;
  }

  /**
   * Return true if the position is in river
   */
  function isInRiver(deltaFrom: BoardDelta):boolean {
    for(var pos in gameConstVals.RiverPos) {
      if(pos.col === deltaFrom.col && pos.row === deltaFrom.row) {
        return true;
      }
    }
    return false;
  }

  /**
   * Return true if the position is player's own den
   */
  function isOwnDen(turnIndexBeforeMove: number, deltaFrom: BoardDelta):boolean {
    if(turnIndexBeforeMove === 0) {
      if(deltaFrom.col === gameConstVals.BlackDen.col
        && deltaFrom.row === gameConstVals.BlackDen.row) {
        return true;
      }
      return false;
    }else if(turnIndexBeforeMove === 1) {
      if(deltaFrom.col === gameConstVals.WhiteDen.col
        && deltaFrom.row === gameConstVals.WhiteDen.row) {
        return true;
      }
      return false;
    }else {
      try {
        throw new Error("turnIndexBeforeMove is wrong");
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  /**
   * Return true if the position is opponent's own den
   */
  function isOpponentDen(turnIndexBeforeMove: number, deltaFrom: BoardDelta):boolean {
    if(turnIndexBeforeMove === 0) {
      if(deltaFrom.col === gameConstVals.WhiteDen.col
        && deltaFrom.row === gameConstVals.WhiteDen.row) {
        return true;
      }
      return false;
    }else if(turnIndexBeforeMove === 1) {
      if(deltaFrom.col === gameConstVals.BlackDen.col
        && deltaFrom.row === gameConstVals.BlackDen.row) {
        return true;
      }
      return false;
    }else {
      try {
        throw new Error("turnIndexBeforeMove is wrong");
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  /**
   * Return true if the position a den
   */
  function isDen(turnIndexBeforeMove: number, deltaFrom: BoardDelta):boolean {
    if(isOwnDen(turnIndexBeforeMove, deltaFrom)
      || isOpponentDen(turnIndexBeforeMove, deltaFrom)) {
      return true;
    }
    return false;
  }


  /**
   * Return true if the position has no chess piece
   */
  function noChessPiece(board: Board, deltaFrom: BoardDelta) {
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
   */
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
   */
  function getWinner(board: Board, turnIndexBeforeMove: number): string {

  }


  /**
   * Returns the list of available positions for animal
   * that who can only move on land but not jump through river
   * include: Cat, Wolf, Dog, Leopard, Elephant
   */
  function getAnimalLandPossibleMoves(board: Board, turnIndexBeforeMove: number,
    deltaFrom: BoardDelta): IMove[] {
      var possibleMoves: IMove[] = [];

      // for any animal there are at most four possible moves
      // up， down, left, right
      var upMove: BoardDelta = {row: deltaFrom.row - 1, col: deltaFrom.col};
      var downMove: BoardDelta = {row: deltaFrom.row + 1, col: deltaFrom.col};
      var leftMove: BoardDelta = {row: deltaFrom.row, col: deltaFrom.col - 1};
      var rightMove: BoardDelta = {row: deltaFrom.row, col: deltaFrom.col + 1};

      getAnimalLandPossibleMovesHelper(board, turnIndexBeforeMove, deltaFrom, upMove, possibleMoves);
      getAnimalLandPossibleMovesHelper(board, turnIndexBeforeMove, deltaFrom, downMove, possibleMoves);
      getAnimalLandPossibleMovesHelper(board, turnIndexBeforeMove, deltaFrom, leftMove, possibleMoves);
      getAnimalLandPossibleMovesHelper(board, turnIndexBeforeMove, deltaFrom, rightMove, possibleMoves);
      return possibleMoves;
  }

  function getAnimalLandPossibleMovesHelper(board: Board, turnIndexBeforeMove: number,
    deltaFrom: BoardDelta, deltaTo: BoardDelta, possibleMoves: IMove[]) {
      // not out board, not river, not own den
      if(!isOutBoard(deltaTo) && !isInRiver(deltaTo) && !isOwnDen(turnIndexBeforeMove, deltaTo)) {
        // no chess piece there
        if(noChessPiece(board, deltaTo)) {
          possibleMoves.push(createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
        }else {
          // the chess there is opponent's
          if(!isOwnChessPiece(board, turnIndexBeforeMove, deltaTo)) {
            // player's animal is equal or bigger then opponent
            var playerAnimal = board[deltaFrom.row][deltaFrom.col];
            var opponentAnimal = board[deltaTo.row][deltaTo.col];
            var playerAnimalID = getIdFromAnimal(playerAnimal.substring(1));
            var opponentAnimalID = getIdFromAnimal(opponentAnimal.substring(1));

            // opponent's animal is in player's trap
            if(isOwnTrap(turnIndexBeforeMove, deltaTo)) {
              possibleMoves.push(createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
            }else {
              if(playerAnimalID >= opponentAnimalID) {
                // Elephant cannot eat Mouse
                if(playerAnimalID === 7 && opponentAnimalID === 0) {
                  // do nothing
                }else {
                  possibleMoves.push(createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                }
              }
            }
          }
        }
      }
  }

  /**
   * Return true if Mouse is in the water when Lion/Tiger want to fly through river
   */
  function isMouseOnWay(board: Board, deltaFrom: BoardDelta, deltaTo: BoardDelta): boolean {
    // move through parallel direction
    if(deltaFrom.row === deltaTo.row) {
      var temp1: string;
      var temp2: string;
      if(deltaFrom.col < deltaTo.col) {
        temp1 = board[deltaFrom.row][deltaFrom+1];
        temp2 = board[deltaFrom.row][deltaFrom+2];
      }else {
        temp1 = board[deltaFrom.row][deltaFrom-1];
        temp2 = board[deltaFrom.row][deltaFrom-2];
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
   */
  function getAnimalFlyRiverPossibleMoves(board: Board, turnIndexBeforeMove: number,
    deltaFrom: BoardDelta): IMove[] {
      var possibleMoves: IMove[] = [];

      // for any animal there are at most four possible moves
      // up， down, left, right
      var upMove: BoardDelta = {row: deltaFrom.row - 1, col: deltaFrom.col};
      if(isInRiver(upMove)) {
        // rat is not on the way, can fly throguh river
        if(!isMouseOnWay(board, deltaFrom, upMove)) {
          upMove.row = upMove.row - 3;
          getAnimalFlyRiverPossibleMovesHelper(board, turnIndexBeforeMove, deltaFrom, upMove, possibleMoves);
        }
      }else {
        getAnimalFlyRiverPossibleMovesHelper(board, turnIndexBeforeMove, deltaFrom, upMove, possibleMoves);
      }

      var downMove: BoardDelta = {row: deltaFrom.row + 1, col: deltaFrom.col};
      if(isInRiver(downMove)) {
        if(!isMouseOnWay(board, deltaFrom, downMove)) {
          downMove.row = downMove.row + 3;
          getAnimalFlyRiverPossibleMovesHelper(board, turnIndexBeforeMove, deltaFrom, downMove, possibleMoves);
        }
      }else {
        getAnimalFlyRiverPossibleMovesHelper(board, turnIndexBeforeMove, deltaFrom, downMove, possibleMoves);
      }

      var leftMove: BoardDelta = {row: deltaFrom.row, col: deltaFrom.col - 1};
      if(isInRiver(leftMove)) {
        if(!isMouseOnWay(board, deltaFrom, leftMove)) {
          leftMove.col = leftMove.col - 2;
          getAnimalFlyRiverPossibleMovesHelper(board, turnIndexBeforeMove, deltaFrom, leftMove, possibleMoves);
        }
      }else {
        getAnimalFlyRiverPossibleMovesHelper(board, turnIndexBeforeMove, deltaFrom, leftMove, possibleMoves);
      }

      var rightMove: BoardDelta = {row: deltaFrom.row, col: deltaFrom.col + 1};
      if(isInRiver(rightMove)) {
        if(!isMouseOnWay(board, deltaFrom, rightMove)) {
          rightMove.col = rightMove.col + 2;
          getAnimalFlyRiverPossibleMovesHelper(board, turnIndexBeforeMove, deltaFrom, rightMove, possibleMoves);
        }
      }else {
        getAnimalFlyRiverPossibleMovesHelper(board, turnIndexBeforeMove, deltaFrom, rightMove, possibleMoves);
      }

      return possibleMoves;
  }

  function getAnimalFlyRiverPossibleMovesHelper(board: Board, turnIndexBeforeMove: number,
    deltaFrom: BoardDelta, deltaTo: BoardDelta, possibleMoves: IMove[]) {
      // not out board, not own den
      if(!isOutBoard(deltaTo) && !isOwnDen(turnIndexBeforeMove, deltaTo)) {
        // no chess piece there
        if(noChessPiece(board, deltaTo)) {
          possibleMoves.push(createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
        }else {
          // the chess there is opponent's
          if(!isOwnChessPiece(board, turnIndexBeforeMove, deltaTo)) {
            // player's animal is equal or bigger then opponent
            var playerAnimal = board[deltaFrom.row][deltaFrom.col];
            var opponentAnimal = board[deltaTo.row][deltaTo.col];
            var playerAnimalID = getIdFromAnimal(playerAnimal.substring(1));
            var opponentAnimalID = getIdFromAnimal(opponentAnimal.substring(1));

            // opponent's animal is in player's trap
            if(isOwnTrap(turnIndexBeforeMove, deltaTo)) {
              possibleMoves.push(createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
            }else {
              if(playerAnimalID >= opponentAnimalID) {
                // player animal can only be Tiger or Lion
                possibleMoves.push(createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
              }
            }
          }
        }
      }
  }

  /**
   * Returns the list of available positions for animal
   * that who can move on land and also swim in river
   * include: Mouse
   */
  function getAnimalSwimRiverPossibleMoves(board: Board, turnIndexBeforeMove: number,
    deltaFrom: BoardDelta): IMove[] {
      var possibleMoves: IMove[] = [];

      // for any animal there are at most four possible moves
      // up， down, left, right
      var upMove: BoardDelta = {row: deltaFrom.row - 1, col: deltaFrom.col};
      var downMove: BoardDelta = {row: deltaFrom.row + 1, col: deltaFrom.col};
      var leftMove: BoardDelta = {row: deltaFrom.row, col: deltaFrom.col - 1};
      var rightMove: BoardDelta = {row: deltaFrom.row, col: deltaFrom.col + 1};

      getAnimalSwimRiverPossibleMoves(board, turnIndexBeforeMove, deltaFrom, upMove, possibleMoves);
      getAnimalSwimRiverPossibleMoves(board, turnIndexBeforeMove, deltaFrom, downMove, possibleMoves);
      getAnimalSwimRiverPossibleMoves(board, turnIndexBeforeMove, deltaFrom, leftMove, possibleMoves);
      getAnimalSwimRiverPossibleMoves(board, turnIndexBeforeMove, deltaFrom, rightMove, possibleMoves);
      return possibleMoves;
  }

  function getAnimalSwimRiverPossibleMovesHelper(board: Board, turnIndexBeforeMove: number,
    deltaFrom: BoardDelta, deltaTo: BoardDelta, possibleMoves: IMove[]) {
      // not out board, not own den
      if(!isOutBoard(deltaTo) && !isOwnDen(turnIndexBeforeMove, deltaTo)) {
        // no chess piece there
        if(noChessPiece(board, deltaTo)) {
          possibleMoves.push(createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
        }else {
          // the chess there is opponent's
          if(!isOwnChessPiece(board, turnIndexBeforeMove, deltaTo)) {
            // player's animal can only be Mouse
            var opponentAnimal = board[deltaTo.row][deltaTo.col];
            var playerAnimalID = 0;
            var opponentAnimalID = getIdFromAnimal(opponentAnimal.substring(1));

            // opponent's animal is in player's trap
            if(isOwnTrap(turnIndexBeforeMove, deltaTo)) {
              possibleMoves.push(createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
            }else {
              // in this case, opponent's animal can only be Mouse
              if(playerAnimalID >= opponentAnimalID) {
                possibleMoves.push(createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
              }else if(opponentAnimalID === 7){
                // the Mouse in river cannot eat Elephant on the land
                // only Mouse on the land can eat Elephant
                if(!isInRiver(deltaFrom)) {
                  possibleMoves.push(createMove(board, turnIndexBeforeMove, deltaFrom, deltaTo));
                }
              }
            }
          }
        }
      }
  }


  /**
   * Returns the list of available positions for Elephant to move
   */
  export function getElephantPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {
    var possibleMoves: IMove[] = getAnimalLandPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if the Elephant has any place to move
   */
  function canElephantMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
      return getElephantPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Lion to move
   */
  export function getLionPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {
    var possibleMoves: IMove[] = getAnimalFlyRiverPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if the Lion has any place to move
   */
  function canLionMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
      return getLionPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Tiger to move
   */
  export function getTigerPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {
    var possibleMoves: IMove[] = getAnimalFlyRiverPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if the Tiger has any place to move
   */
  function canTigerMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
      return getTigerPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Leopard to move
   */
  export function getLeopardPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {
    var possibleMoves: IMove[] = getAnimalLandPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if the Leopard has any place to move
   */
  function canLeopardMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
      return getLeopardPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Dog to move
   */
  export function getDogPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {
    var possibleMoves: IMove[] = getAnimalLandPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if the Dog has any place to move
   */
  function canDogMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
      return getDogPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Wolf to move
   */
  export function getWolfPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {
    var possibleMoves: IMove[] = getAnimalLandPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if the Wolf has any place to move
   */
  function canWolfMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
      return getWolfPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Cat to move
   */
  export function getCatPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {
    var possibleMoves: IMove[] = getAnimalLandPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if the Cat has any place to move
   */
  function canCatMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
      return getCatPossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }

  /**
   * Returns the list of available positions for Mouse to move
   */
  export function getMousePossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {
    var possibleMoves: IMove[] = getAnimalSwimRiverPossibleMoves(board, turnIndexBeforeMove, deltaFrom);
    return possibleMoves;
  }

  /**
   * Returns true if the Mouse has any place to move
   */
  function canMouseMoveAnywhere(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): boolean {
      return getMousePossibleMoves(board, turnIndexBeforeMove, deltaFrom).length !== 0;
  }



  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   * @deltaFrom: start position of the piece
   * @deltaTo: destination position of the piece
   */
   export function createMove(board: Board, turnIndexBeforeMove: number,
     deltaFrom: BoardDelta, deltaTo: BoardDelta):IMove {

   }

  /**
   * Returns all the possible moves for the given board and turnIndexBeforeMove.
   * Returns an empty array if the game is over.
   */
  export function getPossibleMoves(board: Board, turnIndexBeforeMove: number): IMove[] {

  }


  /**
   * Check if the move is OK.
   *
   * @returns return true if the move is ok, otherwise false.
   */
  export function isMoveOk(params: IIsMoveOk): boolean {

  }




}
