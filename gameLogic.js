'use strict';

angular.module('myApp').service('gameLogic', function() {

  function isEqual(object1, object2) {
    return angular.equals(object1, object2);
  }

  function copyObject(object) {
    return angular.copy(object);
  }

  /** Return the winner (either 'X' or 'O') or '' if there is no winner. */
  function getWinner(board) {
    var boardString = '';
    var i, j;
    for (i = 0; i < 3; i++) {
      for (j = 0; j < 3; j++) {
        var cell = board[i][j];
        boardString += (cell === '' ? ' ' : cell);
      }
    }
    var win_patterns = [
      'XXX......',
      '...XXX...',
      '......XXX',
      'X..X..X..',
      '.X..X..X.',
      '..X..X..X',
      'X...X...X',
      '..X.X.X..'
    ];
    for (i = 0; i < win_patterns.length; i++) {
      var win_pattern = win_patterns[i];
      var x_regexp = new RegExp(win_pattern);
      var o_regexp = new RegExp(win_pattern.replace(/X/g, 'O'));
      if (x_regexp.test(boardString)) {
        return 'X';
      }
      if (o_regexp.test(boardString)) {
        return 'O';
      }
    }
    return '';
  }

  /** Returns true if the game ended in a tie because there are no empty cells. */
  function isTie(board) {
    var i, j;
    for (i = 0; i < 3; i++) {
      for (j = 0; j < 3; j++) {
        if (board[i][j] === '') {
          // If there is an empty cell then we do not have a tie.
          return false;
        }
      }
    }
    // No empty cells --> tie!
    return true;
  }

  function getInitialBoard() {
    return [['', '', ''], ['', '', ''], ['', '', '']];
  }

  /**
   * Returns the move that the computer player should do for the given board.
   * The computer will play in a random empty cell in the board.
   */
  function createComputerMove(board, turnIndexBeforeMove) {
      var possibleMoves = [];
      var i, j;
      for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
          try {
            possibleMoves.push(createMove(board, i, j, turnIndexBeforeMove));
          } catch (e) {
            // The cell in that position was full.
          }
        }
      }
      var randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      return randomMove;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  function createMove(board, row, col, turnIndexBeforeMove) {
    if (board === undefined) {
      // Initially (at the beginning of the match), the board in state is undefined.
      board = getInitialBoard();
    }
    if (board[row][col] !== '') {
      throw new Error("One can only make a move in an empty position!");
    }
    var boardAfterMove = copyObject(board);
    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
    var winner = getWinner(boardAfterMove);
    var firstOperation;
    if (winner !== '' || isTie(boardAfterMove)) {
      // Game over.
      firstOperation = {endMatch: {endMatchScores:
        (winner === 'X' ? [1, 0] : (winner === 'O' ? [0, 1] : [0, 0]))}};
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
    }
    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: {row: row, col: col}}}];
  }

  /** Returns an array of {stateBeforeMove, move, comment}. */
  function getExampleMoves(initialTurnIndex, initialState, arrayOfRowColComment) {
    var exampleMoves = [];
    var state = initialState;
    var turnIndex = initialTurnIndex;
    for (var i = 0; i < arrayOfRowColComment.length; i++) {
      var rowColComment = arrayOfRowColComment[i];
      var move = createMove(state.board, rowColComment.row, rowColComment.col, turnIndex);
      var stateAfterMove = {board : move[1].set.value, delta: move[2].set.value};
      exampleMoves.push({
        stateBeforeMove: state,
        stateAfterMove: stateAfterMove,
        turnIndexBeforeMove: turnIndex,
        turnIndexAfterMove: 1 - turnIndex,
        move: move,
        comment: {en: rowColComment.comment}});

      state = stateAfterMove;
      turnIndex = 1 - turnIndex;
    }
    return exampleMoves;
  }

  function getRiddles() {
    return [
      getExampleMoves(0,
        {
          board:
            [['O', 'O', ''],
             ['', 'X', ''],
             ['', '', 'X']],
          delta: {row: 0, col: 1}
        },
        [
        {row: 0, col: 2, comment: "Find the position for X where he could win in his next turn either by having a diagonal or a column"},
        {row: 2, col: 0, comment: "O played in bottom-left"},
        {row: 1, col: 2, comment: "X wins in the middle-right by having three X in the right column."}
      ]),
      getExampleMoves(1,
        {
          board:
            [['O', '', ''],
             ['X', 'O', 'X'],
             ['', '', 'X']],
          delta: {row: 0, col: 1}
        },
        [
        {row: 0, col: 2, comment: "O must play there to prevent X from winning"},
        {row: 2, col: 0, comment: "X played in bottom-left"},
        {row: 0, col: 1, comment: "O wins by having 3 in a row!"}
      ])
    ];
  }

  function getExampleGame() {
    return getExampleMoves(0, {}, [
      {row: 1, col: 1, comment: "The classic opening is to put X in the middle"},
      {row: 0, col: 0, comment: "O in the top-left"},
      {row: 2, col: 2, comment: "X in the bottom-right"},
      {row: 0, col: 1, comment: "O in the top-middle (this is a mistake! X will win in 2 moves!)"},
      {row: 0, col: 2, comment: "X in the top-right (X can win next turn either in middle-right or bottom-left. No way O can prevent it.)"},
      {row: 2, col: 0, comment: "O in the bottom-left (X will now win...)"},
      {row: 1, col: 2, comment: "X wins in the middle-right by having three X in the right column."}
    ]);
  }

  function isMoveOk(params) {
    var move = params.move;
    var turnIndexBeforeMove = params.turnIndexBeforeMove;
    var stateBeforeMove = params.stateBeforeMove;
    // The state and turn after move are not needed in TicTacToe (or in any game where all state is public).
    //var turnIndexAfterMove = params.turnIndexAfterMove;
    //var stateAfterMove = params.stateAfterMove;

    // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
    // to verify that move is legal.
    try {
      // Example move:
      // [{setTurn: {turnIndex : 1},
      //  {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
      //  {set: {key: 'delta', value: {row: 0, col: 0}}}]
      var deltaValue = move[2].set.value;
      var row = deltaValue.row;
      var col = deltaValue.col;
      var board = stateBeforeMove.board;
      var expectedMove = createMove(board, row, col, turnIndexBeforeMove);
      if (!isEqual(move, expectedMove)) {
        return false;
      }
    } catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return true;
  }

  this.getInitialBoard = getInitialBoard;
  this.createComputerMove = createComputerMove;
  this.createMove = createMove;
  this.isMoveOk = isMoveOk;
  this.getExampleGame = getExampleGame;
  this.getRiddles = getRiddles;
});
