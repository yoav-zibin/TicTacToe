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
 * Note: The number of row and col are both zero based, so the last row for
 * white is 0 and for black is 7.
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
   * Return the winner (either 'W' or 'B') or '' if there is no winner
   *
   */
  function getWinner(board: Board, turnIndexBeforeMove: number): string {

  }


  /**
   * Returns the list of available positions for Elephant to move
   */
  function getElephantPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {

  }

  /**
   * Returns the list of available positions for Lion to move
   */
  function getLionPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {

  }

  /**
   * Returns the list of available positions for Tiger to move
   */
  function getTigerPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {

  }

  /**
   * Returns the list of available positions for Leopard to move
   */
  function getLeopardPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {

  }

  /**
   * Returns the list of available positions for Dog to move
   */
  function getDogPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {

  }

  /**
   * Returns the list of available positions for Wolf to move
   */
  function getWolfPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {

  }

  /**
   * Returns the list of available positions for Cat to move
   */
  function getCatPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {

  }

  /**
   * Returns the list of available positions for Rat to move
   */
  function getRatPossibleMoves(board: Board,
    turnIndexBeforeMove: number, deltaFrom: BoardDelta): IMove[] {

  }

  /**
   * Returns all the possible moves for the given board and turnIndex.
   * Returns an empty array if the game is over.
   */
  export function getPossibleMoves(board: Board, turnIndexBeforeMove: number): IMove[] {

  }


  /**
   * Returns the move that should be performed when player
   * with index turnIndex makes a move in cell row X col.
   */
  export function createMove( board: Board, deltaFrom: BoardDelta, deltaTo: BoardDelta,
    turnIndexBeforeMove: number):IMove {

  }


  /**
   * Check if the move is OK.
   *
   * @returns return true if the move is ok, otherwise false.
   */
  export function isMoveOk(params: IIsMoveOk): boolean {

  }




}
