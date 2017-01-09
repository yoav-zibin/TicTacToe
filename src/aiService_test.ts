describe("aiService", function() {
  function createStateFromBoard(board: Board): IState {
    return {board: board, delta: null};
  }

  function createComputerMove(board: Board, turnIndex: number, maxDepth: number): IMove {
    let move: IMove = {
      turnIndex: turnIndex,
      endMatchScores: null,
      state: createStateFromBoard(board),
    };
    return aiService.createComputerMove(move, {maxDepth: maxDepth});
  }

  it("getPossibleMoves returns exactly one cell", function() {
    let board =
        [['O', 'O', 'X'],
         ['X', 'X', 'O'],
         ['O', 'X', '']];
    let possibleMoves = aiService.getPossibleMoves(createStateFromBoard(board), 0);
    expect(possibleMoves.length).toBe(1);
    expect(angular.equals(possibleMoves[0].state.delta, {row: 2, col: 2})).toBe(true);
  });

  it("X finds an immediate winning move", function() {
    let move = createComputerMove(
        [['', '', 'O'],
         ['O', 'X', 'X'],
         ['O', 'X', 'O']], 0, 1);
    expect(angular.equals(move.state.delta, {row: 0, col: 1})).toBe(true);
  });

  it("X finds an immediate winning move in less than a second", function() {
    let move = aiService.findComputerMove({
      endMatchScores: null,
      turnIndex: 0,
      state: {
        board: [['', '', 'O'],
                ['O', 'X', 'X'],
                ['O', 'X', 'O']],
        delta: null
      }
    });
    expect(angular.equals(move.state.delta, {row: 0, col: 1})).toBe(true);
  });

  it("O finds an immediate winning move", function() {
    let move = createComputerMove(
        [['', '', 'O'],
         ['O', 'X', 'X'],
         ['O', 'X', 'O']], 1, 1);
    expect(angular.equals(move.state.delta, {row: 0, col: 0})).toBe(true);
  });

  it("X prevents an immediate win", function() {
    let move = createComputerMove(
        [['X', '', ''],
         ['O', 'O', ''],
         ['X', '', '']], 0, 2);
    expect(angular.equals(move.state.delta, {row: 1, col: 2})).toBe(true);
  });

  it("O prevents an immediate win", function() {
    let move = createComputerMove(
        [['X', 'X', ''],
         ['O', '', ''],
         ['', '', '']], 1, 2);
    expect(angular.equals(move.state.delta, {row: 0, col: 2})).toBe(true);
  });

  it("O prevents another immediate win", function() {
    let move = createComputerMove(
        [['X', 'O', ''],
         ['X', 'O', ''],
         ['', 'X', '']], 1, 2);
    expect(angular.equals(move.state.delta, {row: 2, col: 0})).toBe(true);
  });

  it("X finds a winning move that will lead to winning in 2 steps", function() {
    let move = createComputerMove(
        [['X', '', ''],
         ['O', 'X', ''],
         ['', '', 'O']], 0, 3);
    expect(angular.equals(move.state.delta, {row: 0, col: 1})).toBe(true);
  });

  it("O finds a winning move that will lead to winning in 2 steps", function() {
    let move = createComputerMove(
        [['', 'X', ''],
         ['X', 'X', 'O'],
         ['', 'O', '']], 1, 3);
    expect(angular.equals(move.state.delta, {row: 2, col: 2})).toBe(true);
  });

  it("O finds a cool winning move that will lead to winning in 2 steps", function() {
    let move = createComputerMove(
        [['X', 'O', 'X'],
         ['X', '', ''],
         ['O', '', '']], 1, 3);
    expect(angular.equals(move.state.delta, {row: 2, col: 1})).toBe(true);
  });

  it("O finds the wrong move due to small depth", function() {
    let move = createComputerMove(
        [['X', '', ''],
         ['', '', ''],
         ['', '', '']], 1, 3);
    expect(angular.equals(move.state.delta, {row: 0, col: 1})).toBe(true);
  });

  it("O finds the correct move when depth is big enough", function() {
    let move = createComputerMove(
        [['X', '', ''],
         ['', '', ''],
         ['', '', '']], 1, 6);
    expect(angular.equals(move.state.delta, {row: 1, col: 1})).toBe(true);
  });

  it("X finds a winning move that will lead to winning in 2 steps", function() {
    let move = createComputerMove(
        [['', '', ''],
         ['O', 'X', ''],
         ['', '', '']], 0, 5);
    expect(angular.equals(move.state.delta, {row: 0, col: 0})).toBe(true);
  });

});
