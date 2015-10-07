describe("aiService", function() {

  it("Black finds an immediate winning move by moving BDog to 0*3", function() {
    let board: Board = [['L', 'L', 'WTrap', 'WDen', 'WTrap', 'L', 'L'],
                        ['L', 'L', 'L', 'BDog', 'L', 'L', 'L'],
                        ['L', 'L', 'L', 'L', 'WWolf', 'L', 'WElephant'],
                        ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
                        ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
                        ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
                        ['L', 'L', 'L', 'L', 'L', 'L', 'L'],
                        ['L', 'BCat', 'L', 'BTrap', 'L', '', 'L'],
                        ['L', 'L', 'BTrap', 'BDen', 'BTrap', 'L', 'L']];

    let move: IMove = aiService.createComputerMove(board, 0, {maxDepth: 1});

    let expectMove: IMove =
        [{endMatch: {endMatchScores: [1, 0]}},
          {set: {key: 'board', value:
            [['L', 'L', 'WTrap', 'BDog', 'WTrap', 'L', 'L'],
            ['L', 'L', 'L', 'WTrap', 'L', 'L', 'L'],
            ['L', 'L', 'L', 'L', 'WWolf', 'L', 'WElephant'],
            ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
            ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
            ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
            ['L', 'L', 'L', 'L', 'L', 'L', 'L'],
            ['L', 'BCat', 'L', 'BTrap', 'L', '', 'L'],
            ['L', 'L', 'BTrap', 'BDen', 'BTrap', 'L', 'L']]}},
        {set: {key: 'deltaFrom', value: {row: 1, col: 3}}},
        {set: {key: 'deltaTo', value: {row: 0, col: 3}}}];

    expect(angular.equals(move, expectMove)).toBe(true);
  });

});
