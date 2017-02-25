type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
  shapeId: number;
}
type IProposalData = BoardDelta;
interface IState {
  board: Board;
  delta: BoardDelta;
}

import gameService = gamingPlatform.gameService;
import alphaBetaService = gamingPlatform.alphaBetaService;
import translate = gamingPlatform.translate;
import resizeGameAreaService = gamingPlatform.resizeGameAreaService;
import log = gamingPlatform.log;
import dragAndDropService = gamingPlatform.dragAndDropService;

module gameLogic {
  export const ROWS = 20;
  export const COLS = 20;

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
    return {board: getInitialBoard(), delta: null};
  }

  /**
   * Returns true if the game ended in a tie because there are no empty cells.
   * E.g., isTie returns true for the following board:
   *     [['X', 'O', 'X'],
   *      ['X', 'O', 'O'],
   *      ['O', 'X', 'X']]
   */
  function isTie(board: Board): boolean {
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (board[i][j] === '') {
          // If there is an empty cell then we do not have a tie.
          return false;
        }
      }
    }
    // No empty cells, so we have a tie!
    return true;
  }

  /**
   * Return the winner (either 'X' or 'O') or '' if there is no winner.
   * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
   * E.g., getWinner returns 'X' for the following board:
   *     [['X', 'O', ''],
   *      ['X', 'O', ''],
   *      ['X', '', '']]
   */
  function getWinner(board: Board): string {
    let boardString = '';
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        let cell = board[i][j];
        boardString += cell === '' ? ' ' : cell;
      }
    }
    let win_patterns = [
      'XXX......',
      '...XXX...',
      '......XXX',
      'X..X..X..',
      '.X..X..X.',
      '..X..X..X',
      'X...X...X',
      '..X.X.X..'
    ];
    for (let win_pattern of win_patterns) {
      let x_regexp = new RegExp(win_pattern);
      let o_regexp = new RegExp(win_pattern.replace(/X/g, 'O'));
      if (x_regexp.test(boardString)) {
        return 'X';
      }
      if (o_regexp.test(boardString)) {
        return 'O';
      }
    }
    return '';
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col with shapeId.
   * row and col is the bottom-left corner of the shape.
   * shapdId is a mix of different shape and the rotation of the shape, starts from 1, 0 is a initial
   */
  export function createMove(
      stateBeforeMove: IState, row: number, col: number, shapeId: number, turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }
    let board: Board = stateBeforeMove.board;
    
    // TODO change to checkLegalMove function checkLegalMove(board, row, col, shapeId, turnIndexBeforeMove)
    if (board[row][col] !== '') { 
      throw new Error("One can only make a move in an empty position!");
    }
    //~

    // TODO change to IsGameOver function IsGameOver(board)
    if (getWinner(board) !== '' || isTie(board)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    //~

    let boardAfterMove = angular.copy(board);
    // TODO change to shapePlacement function, shapePlacement(boardAfterMove, row, col, shapeID, turnIndexBeforeMove)
    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
    //~
    let winner = getWinner(boardAfterMove);
    let endMatchScores: number[];
    let turnIndex: number;
    if (winner !== '' || isTie(boardAfterMove)) {
      // Game over.
      turnIndex = -1;
      
      // TODO add endScore Function, the score is measured by the blocks unused.
      endMatchScores = winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0];
      //~

    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      turnIndex = 1 - turnIndexBeforeMove;
      endMatchScores = null;
    }
    // Here delta should be all the blocks covered by the new move
    let delta: BoardDelta = {row: row, col: col, shapeId: shapeId};
    //~
    let state: IState = {delta: delta, board: boardAfterMove};
    return {
      endMatchScores: endMatchScores,
      turnIndex: turnIndex,
      state: state
    };
  }
  
  export function createInitialMove(): IMove {
    return {endMatchScores: null, turnIndex: 0, 
        state: getInitialState()};  
  }

  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null, 0, 0, 0, 0);
    log.log("move=", move);
  }
}
