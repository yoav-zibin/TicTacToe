type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
}
type IProposalData = BoardDelta;
interface IState {
  board: Board;
  delta: BoardDelta;
  start: number;
  ship: number;
}

import gameService = gamingPlatform.gameService;
import alphaBetaService = gamingPlatform.alphaBetaService;
import translate = gamingPlatform.translate;
import resizeGameAreaService = gamingPlatform.resizeGameAreaService;
import log = gamingPlatform.log;
import dragAndDropService = gamingPlatform.dragAndDropService;

module gameLogic {
  export const ROWS = 3;
  export const COLS = 3;

  /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
  export function getInitialBoard(): Board {
    let board: Board = [];
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = '';
      }
    }
    return board;
  }


  export function getInitialState(): IState {
    return {board: getInitialBoard(), delta: null, ship: 0, start:0};
  }

  /**
   * Return the winner (either 'X' or 'O') or '' if there is no winner.
   * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
   * E.g., getWinner returns 'X' for the following board:
   *     [['X', 'O', ''],
   *      ['X', 'O', ''],
   *      ['X', '', '']]
   */
    function setShip(board: Board, state: IState, row: number, col: number): IState {
      let shipNum = state.ship;
      let isStart = 0;
      if(shipNum!=5) {
        if(board[row][col] === 'O') {
          throw new Error("already set!");
        }
        else 
          board[row][col] = 'O';
      }
      else {
        isStart = 1;
      }
      return {board, delta:{row,col}, ship: shipNum+1, start: isStart};

  }

  function getWinner(board: Board): string {
    let sinkBoat = 0;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if(board[i][j]=='O') {
            console.log("sinkBoat: " + sinkBoat);
            return '';
        }
      }
    }
    console.log("Game Ends ");
    return "I lose!";
  }

  function getShip(board: Board): number {
    let shipNum = 0;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if(board[i][j]=='O') {
            shipNum++;
        }
      }
    }

    return shipNum;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(
      stateBeforeMove: IState, row: number, col: number, turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }

    let board: Board = stateBeforeMove.board;
    /**set ship */
    if(stateBeforeMove.ship!=5 && stateBeforeMove.start!=1) {
      console.log("setting ship");
      let shipState = setShip(board, stateBeforeMove, row, col);
      return {endMatchScores: null, turnIndex: 1-turnIndexBeforeMove, state: shipState};
    }

    if (board[row][col] === 'X' || board[row][col] === 'M') {
      console.log("already shoot!");
      throw new Error("already shoot!");
    }
    if (getWinner(board) !== '') {
      throw new Error("Can only make a move if the game is not over!");
    }
    let boardAfterMove = angular.copy(board);
    //boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
    if(board[row][col]==='')
        boardAfterMove[row][col] = 'M';
    else
        boardAfterMove[row][col] = 'X';

    let winner = getWinner(boardAfterMove);
    let shipNum = getShip(boardAfterMove);
    let endMatchScores: number[];
    let turnIndex: number;
    if (winner !== '') {
      // Game over.
      turnIndex = -1;
      endMatchScores = winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0];
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      turnIndex = 1 - turnIndexBeforeMove;
      endMatchScores = null;
    }
    let delta: BoardDelta = {row: row, col: col};
    let state: IState = {delta: delta, board: boardAfterMove, ship:shipNum, start: 1};
    return {endMatchScores: endMatchScores, turnIndex: turnIndex, state: state};
  }

  export function createInitialMove(): IMove {
    return {endMatchScores: null, turnIndex: 0,
        state: getInitialState()};
  }

  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null, 0, 0, 0);
    log.log("move=", move);
  }
}
