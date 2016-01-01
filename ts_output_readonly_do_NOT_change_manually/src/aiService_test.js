describe("aiService", function () {
    function createStateFromBoard(board) {
        return { board: board, delta: null };
    }
    function createComputerMove(board, turnIndex, maxDepth) {
        var move = {
            turnIndexAfterMove: turnIndex,
            endMatchScores: null,
            stateAfterMove: createStateFromBoard(board),
        };
        return aiService.createComputerMove(move, { maxDepth: maxDepth });
    }
    it("getPossibleMoves returns exactly one cell", function () {
        var board = [['O', 'O', 'X'],
            ['X', 'X', 'O'],
            ['O', 'X', '']];
        var possibleMoves = aiService.getPossibleMoves(createStateFromBoard(board), 0);
        expect(possibleMoves.length).toBe(1);
        expect(angular.equals(possibleMoves[0].stateAfterMove.delta, { row: 2, col: 2 })).toBe(true);
    });
    it("X finds an immediate winning move", function () {
        var move = createComputerMove([['', '', 'O'],
            ['O', 'X', 'X'],
            ['O', 'X', 'O']], 0, 1);
        expect(angular.equals(move.stateAfterMove.delta, { row: 0, col: 1 })).toBe(true);
    });
    it("X finds an immediate winning move in less than a second", function () {
        var move = aiService.findComputerMove({
            endMatchScores: null,
            turnIndexAfterMove: 0,
            stateAfterMove: {
                board: [['', '', 'O'],
                    ['O', 'X', 'X'],
                    ['O', 'X', 'O']],
                delta: null
            }
        });
        expect(angular.equals(move.stateAfterMove.delta, { row: 0, col: 1 })).toBe(true);
    });
    it("O finds an immediate winning move", function () {
        var move = createComputerMove([['', '', 'O'],
            ['O', 'X', 'X'],
            ['O', 'X', 'O']], 1, 1);
        expect(angular.equals(move.stateAfterMove.delta, { row: 0, col: 0 })).toBe(true);
    });
    it("X prevents an immediate win", function () {
        var move = createComputerMove([['X', '', ''],
            ['O', 'O', ''],
            ['X', '', '']], 0, 2);
        expect(angular.equals(move.stateAfterMove.delta, { row: 1, col: 2 })).toBe(true);
    });
    it("O prevents an immediate win", function () {
        var move = createComputerMove([['X', 'X', ''],
            ['O', '', ''],
            ['', '', '']], 1, 2);
        expect(angular.equals(move.stateAfterMove.delta, { row: 0, col: 2 })).toBe(true);
    });
    it("O prevents another immediate win", function () {
        var move = createComputerMove([['X', 'O', ''],
            ['X', 'O', ''],
            ['', 'X', '']], 1, 2);
        expect(angular.equals(move.stateAfterMove.delta, { row: 2, col: 0 })).toBe(true);
    });
    it("X finds a winning move that will lead to winning in 2 steps", function () {
        var move = createComputerMove([['X', '', ''],
            ['O', 'X', ''],
            ['', '', 'O']], 0, 3);
        expect(angular.equals(move.stateAfterMove.delta, { row: 0, col: 1 })).toBe(true);
    });
    it("O finds a winning move that will lead to winning in 2 steps", function () {
        var move = createComputerMove([['', 'X', ''],
            ['X', 'X', 'O'],
            ['', 'O', '']], 1, 3);
        expect(angular.equals(move.stateAfterMove.delta, { row: 2, col: 2 })).toBe(true);
    });
    it("O finds a cool winning move that will lead to winning in 2 steps", function () {
        var move = createComputerMove([['X', 'O', 'X'],
            ['X', '', ''],
            ['O', '', '']], 1, 3);
        expect(angular.equals(move.stateAfterMove.delta, { row: 2, col: 1 })).toBe(true);
    });
    it("O finds the wrong move due to small depth", function () {
        var move = createComputerMove([['X', '', ''],
            ['', '', ''],
            ['', '', '']], 1, 3);
        expect(angular.equals(move.stateAfterMove.delta, { row: 0, col: 1 })).toBe(true);
    });
    it("O finds the correct move when depth is big enough", function () {
        var move = createComputerMove([['X', '', ''],
            ['', '', ''],
            ['', '', '']], 1, 6);
        expect(angular.equals(move.stateAfterMove.delta, { row: 1, col: 1 })).toBe(true);
    });
    it("X finds a winning move that will lead to winning in 2 steps", function () {
        var move = createComputerMove([['', '', ''],
            ['O', 'X', ''],
            ['', '', '']], 0, 5);
        expect(angular.equals(move.stateAfterMove.delta, { row: 0, col: 0 })).toBe(true);
    });
});
//# sourceMappingURL=aiService_test.js.map