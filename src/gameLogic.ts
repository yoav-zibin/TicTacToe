type Board = number[][];
interface BoardDelta {
  row: number;
  col: number;
}
type IProposalData = BoardDelta;
interface IState {
  board: Board; // 1 -> SIZE
  shownBoard: Board; // -1 for hidden places; 0 for player 0; 1 for player 1
  delta1: BoardDelta;
  delta2: BoardDelta;
}

import gameService = gamingPlatform.gameService;
import alphaBetaService = gamingPlatform.alphaBetaService;
import translate = gamingPlatform.translate;
import resizeGameAreaService = gamingPlatform.resizeGameAreaService;
import log = gamingPlatform.log;
import dragAndDropService = gamingPlatform.dragAndDropService;

module gameLogic {
  export const ROWS = 4;
  export const COLS = 4;
  export const SIZE = ROWS * COLS / 2;

  /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
  export function getInitialBoards(): [Board, Board] {
    let board: Board = [];
    let shownBoard: Board = [];
    let counts: number[] = [];
    for (let i = 0; i < SIZE; i++) {
        counts[i] = 0;
    }
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      shownBoard[i] = [];
      for (let j = 0; j < COLS; j++) {
        let n = 0;
        while (counts[n] >= 2) {
          n = Math.floor(Math.random() * SIZE);
        }
        counts[n]++;
        board[i][j] = n;
        shownBoard[i][j] = -1;
      }
    }
    return [board, shownBoard];
  }

  export function getInitialState(): IState {
    let initBoards = getInitialBoards();
    return {board: initBoards[0], shownBoard: initBoards[1], delta1: null, delta2: null};
  }

  /**
   * 
   */
  function hasEmptyGrid(board: Board): boolean {
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (board[i][j] === -1) {
          // If there is an empty cell then we do not have a tie.
          return true;
        }
      }
    }
    // No empty cells, so we have a tie!
    return false;
  }

  /**
   * 
   */
  function computeScores(board: Board): [number, number] {
    // scan the board and compute the socre
    let score0 : number = 0;
    let score1 : number = 0;
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            if (board[i][j] == 0) {
                score0++;
            } else if (board[i][j] == 1) {
                score1++;
            }
        }
    }
    return [score0, score1];
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
    let board: Board = stateBeforeMove.shownBoard;
    if (board[row][col] !== -1) {
      throw new Error("One can only make a move in an empty position!");
    }
    if (!hasEmptyGrid(board)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    let boardAfterMove = angular.copy(board);
    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 1 : 0;
    let scores = computeScores(boardAfterMove);
    let endMatchScores: number[];
    let turnIndex: number;
    if (!hasEmptyGrid(boardAfterMove)) {
      // Game over.
      turnIndex = -1;
      if (scores[0] > scores[1]) {
        endMatchScores = [1, 0];
      } else if (scores[0] < scores[1]) {
        endMatchScores = [0, 1];
      } else {
        endMatchScores = [0, 0];
      }
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      turnIndex = 1 - turnIndexBeforeMove;
      endMatchScores = null;
    }
    let delta: BoardDelta = {row: row, col: col};

    let state: IState = {delta1: delta, delta2: null, shownBoard: boardAfterMove, 
      board: stateBeforeMove.board};
    if (stateBeforeMove.delta1 != null && stateBeforeMove.delta2 == null) {
      state = {delta1: stateBeforeMove.delta1, delta2: delta, shownBoard: boardAfterMove, 
        board: stateBeforeMove.board};
    }
    
    log.info("gameLogic.createMove", state);

    return {
      endMatchScores: endMatchScores,
      turnIndex: turnIndex,
      state: state
    };
  }

  export function checkMatch(state: IState) {
    let delta1 = state.delta1;
    let delta2 = state.delta2;
    let board = state.board;
    if(delta1 != null && delta2 != null) {
      if(board[delta1.row][delta1.col] != board[delta2.row][delta2.col]) {
        state.shownBoard[delta1.row][delta1.col] = -1;
        state.shownBoard[delta2.row][delta2.col] = -1;
      }
    }
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
