type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
}
interface IState {
  board: Board;
  delta: BoardDelta;
}

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
   * Returns all the possible moves for the given board and turnIndexBeforeMove.
   * Returns an empty array if the game is over.
   */
  export function getPossibleMoves(board: Board, turnIndexBeforeMove: number): IMove[] {
    let possibleMoves: IMove[] = [];
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        try {
          possibleMoves.push(createMove(board, i, j, turnIndexBeforeMove));
        } catch (e) {
          // The cell in that position was full.
        }
      }
    }
    return possibleMoves;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(
      board: Board, row: number, col: number, turnIndexBeforeMove: number): IMove {
    if (!board) {
      // Initially (at the beginning of the match), the board in state is undefined.
      board = getInitialBoard();
    }
    if (board[row][col] !== '') {
      throw new Error("One can only make a move in an empty position!");
    }
    if (getWinner(board) !== '' || isTie(board)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    let boardAfterMove = angular.copy(board);
    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
    let winner = getWinner(boardAfterMove);
    let firstOperation: IOperation;
    if (winner !== '' || isTie(boardAfterMove)) {
      // Game over.
      firstOperation = {endMatch: {endMatchScores:
        winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0]}};
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
    }
    let delta: BoardDelta = {row: row, col: col};
    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: delta}}];
  }

  export function isMoveOk(params: IIsMoveOk): boolean {
    let move = params.move;
    let turnIndexBeforeMove = params.turnIndexBeforeMove;
    let stateBeforeMove: IState = params.stateBeforeMove;
    // The state and turn after move are not needed in TicTacToe (or in any game where all state is public).
    //let turnIndexAfterMove = params.turnIndexAfterMove;
    //let stateAfterMove = params.stateAfterMove;

    // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
    // to verify that move is legal.
    try {
      // Example move:
      // [{setTurn: {turnIndex : 1},
      //  {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
      //  {set: {key: 'delta', value: {row: 0, col: 0}}}]
      let deltaValue: BoardDelta = move[2].set.value;
      let row = deltaValue.row;
      let col = deltaValue.col;
      let board = stateBeforeMove.board;
      let expectedMove = createMove(board, row, col, turnIndexBeforeMove);
      if (!angular.equals(move, expectedMove)) {
        return false;
      }
    } catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return true;
  }
}
