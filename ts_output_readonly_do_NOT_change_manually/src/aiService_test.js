describe("aiService", function () {
    it("Black finds an immediate winning move by moving BDog to 0*3", function () {
        var board = [['L', 'L', 'WTrap', 'WDen', 'WTrap', 'L', 'L'],
            ['L', 'L', 'L', 'BDog', 'L', 'L', 'L'],
            ['L', 'L', 'L', 'L', 'WWolf', 'L', 'WElephant'],
            ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
            ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
            ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
            ['L', 'L', 'L', 'L', 'L', 'L', 'L'],
            ['L', 'BCat', 'L', 'BTrap', 'L', '', 'L'],
            ['L', 'L', 'BTrap', 'BDen', 'BTrap', 'L', 'L']];
        var move = aiService.createComputerMove(board, 0, { maxDepth: 1 });
        var expectMove = [{ endMatch: { endMatchScores: [1, 0] } },
            { set: { key: 'board', value: [['L', 'L', 'WTrap', 'BDog', 'WTrap', 'L', 'L'],
                        ['L', 'L', 'L', 'WTrap', 'L', 'L', 'L'],
                        ['L', 'L', 'L', 'L', 'WWolf', 'L', 'WElephant'],
                        ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
                        ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
                        ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
                        ['L', 'L', 'L', 'L', 'L', 'L', 'L'],
                        ['L', 'BCat', 'L', 'BTrap', 'L', '', 'L'],
                        ['L', 'L', 'BTrap', 'BDen', 'BTrap', 'L', 'L']] } },
            { set: { key: 'deltaFrom', value: { row: 1, col: 3 } } },
            { set: { key: 'deltaTo', value: { row: 0, col: 3 } } }];
        expect(angular.equals(move, expectMove)).toBe(true);
    });
    it("White finds an immediate winning move by moving WMouse to 8*3", function () {
        var board = [['L', 'L', 'WTrap', 'WDen', 'WTrap', 'L', 'L'],
            ['L', 'L', 'L', 'WTrap', 'L', 'L', 'L'],
            ['L', 'L', 'L', 'L', 'WWolf', 'L', 'WElephant'],
            ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
            ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
            ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
            ['L', 'L', 'L', 'L', 'L', 'L', 'L'],
            ['L', 'BCat', 'L', 'BTrap', 'L', '', 'L'],
            ['L', 'L', 'WMouse', 'BDen', 'BTrap', 'L', 'L']];
        var move = aiService.createComputerMove(board, 1, { maxDepth: 1 });
        var expectMove = [{ endMatch: { endMatchScores: [0, 1] } },
            { set: { key: 'board', value: [['L', 'L', 'WTrap', 'WDen', 'WTrap', 'L', 'L'],
                        ['L', 'L', 'L', 'WTrap', 'L', 'L', 'L'],
                        ['L', 'L', 'L', 'L', 'WWolf', 'L', 'WElephant'],
                        ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
                        ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
                        ['L', 'R', 'R', 'L', 'R', 'R', 'L'],
                        ['L', 'L', 'L', 'L', 'L', 'L', 'L'],
                        ['L', 'BCat', 'L', 'BTrap', 'L', '', 'L'],
                        ['L', 'L', 'BTrap', 'WMouse', 'BTrap', 'L', 'L']] } },
            { set: { key: 'deltaFrom', value: { row: 8, col: 2 } } },
            { set: { key: 'deltaTo', value: { row: 8, col: 3 } } }];
        expect(angular.equals(move, expectMove)).toBe(true);
    });
});
