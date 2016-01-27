function expectEmptyBrowserLogs() {
    browser.manage().logs().get('browser').then(function (browserLog) {
        // See if there are any errors (warnings are ok)
        var hasErrors = false;
        for (var _i = 0; _i < browserLog.length; _i++) {
            var log_1 = browserLog[_i];
            var level = log_1.level.name;
            if (level === 'INFO' || level === 'WARNING')
                continue; // (warnings are ok)
            hasErrors = true;
        }
        if (hasErrors) {
            // It's better to pause, and look and console, then showing this which creates a lot of clutter:
            console.error("Browser has a warning/error in the logs. Opens the developer console and look at the logs.");
            //console.log('\n\n\nlog: ' + require('util').inspect(browserLog) + "\n\n\n");
            browser.pause();
        }
    });
}
var lastTest;
var JasmineOverrides;
(function (JasmineOverrides) {
    var jasmineAny = jasmine;
    var executeMock = jasmineAny.Spec.prototype.execute;
    var jasmineSpec = jasmineAny.Spec;
    jasmineSpec.prototype.execute = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        lastTest = this.result;
        executeMock.apply(this, args);
    };
    // Pause for expect failures
    var originalAddExpectationResult = jasmineSpec.prototype.addExpectationResult;
    jasmineSpec.prototype.addExpectationResult = function () {
        if (!arguments[0]) {
            console.error("\n\nFailure in test:\n" +
                arguments[1].message + "\n" +
                (arguments[1].error ? " stacktrace=\n\n" + arguments[1].error.stack : '') +
                "\n\n\n" +
                " Failure arguments=" + JSON.stringify(arguments));
            browser.pause();
        }
        return originalAddExpectationResult.apply(this, arguments);
    };
    // Pause on exception
    protractor.promise.controlFlow().on('uncaughtException', function (e) {
        console.error('Unhandled error: ' + e);
        browser.pause();
    });
})(JasmineOverrides || (JasmineOverrides = {}));
describe('TicTacToe', function () {
    browser.driver.manage().window().setSize(400, 600);
    browser.driver.manage().window().setPosition(10, 10);
    var checkNoErrorInLogsIntervalId = null;
    beforeEach(function () {
        console.log('\n\n\nRunning test: ', lastTest.fullName);
        checkNoErrorInLogsIntervalId = setInterval(expectEmptyBrowserLogs, 100);
        getPage('');
    });
    afterEach(function () {
        expectEmptyBrowserLogs();
        clearInterval(checkNoErrorInLogsIntervalId);
    });
    function getPage(page) {
        browser.get('/dist/index.min.html?' + page);
    }
    function expectPieceKindDisplayed(row, col, pieceKind, isDisplayed) {
        var selector = by.id('e2e_test_piece' + pieceKind + '_' + row + 'x' + col);
        // Careful when using animations and asserting isDisplayed:
        // Originally, my animation started from {opacity: 0;}
        // And then the image wasn't displayed.
        // I changed it to start from {opacity: 0.1;}
        if (isDisplayed) {
            expect(element(selector).isDisplayed()).toEqual(true);
        }
        else {
            expect(element(selector).isPresent()).toEqual(false);
        }
    }
    function expectPiece(row, col, expectedPieceKind) {
        expectPieceKindDisplayed(row, col, 'X', expectedPieceKind === "X");
        expectPieceKindDisplayed(row, col, 'O', expectedPieceKind === "O");
    }
    function expectBoard(board) {
        // Careful: one can't use gameLogic.ROWS/COLS (instead of 3) because gameLogic is not defined
        // in end-to-end tests.
        for (var row = 0; row < 3; row++) {
            for (var col = 0; col < 3; col++) {
                expectPiece(row, col, board[row][col]);
            }
        }
    }
    function clickDivAndExpectPiece(row, col, expectedPieceKind) {
        element(by.id('e2e_test_div_' + row + 'x' + col)).click();
        expectPiece(row, col, expectedPieceKind);
    }
    it('should have a title', function () {
        expect(browser.getTitle()).toEqual('TicTacToe');
    });
    it('should have an empty TicTacToe board', function () {
        expectBoard([['', '', ''],
            ['', '', ''],
            ['', '', '']]);
    });
    it('should show X if I click in 0x0', function () {
        clickDivAndExpectPiece(0, 0, "X");
        expectBoard([['X', '', ''],
            ['', '', ''],
            ['', '', '']]);
    });
    it('should ignore clicking on a non-empty cell', function () {
        clickDivAndExpectPiece(0, 0, "X");
        clickDivAndExpectPiece(0, 0, "X"); // clicking on a non-empty cell doesn't do anything.
        clickDivAndExpectPiece(1, 1, "O");
        expectBoard([['X', '', ''],
            ['', 'O', ''],
            ['', '', '']]);
    });
    it('should end game if X wins', function () {
        for (var col = 0; col < 3; col++) {
            clickDivAndExpectPiece(1, col, "X");
            // After the game ends, player "O" click (in cell 2x2) will be ignored.
            clickDivAndExpectPiece(2, col, col === 2 ? "" : "O");
        }
        expectBoard([['', '', ''],
            ['X', 'X', 'X'],
            ['O', 'O', '']]);
    });
    it('should end the game in tie', function () {
        clickDivAndExpectPiece(0, 0, "X");
        clickDivAndExpectPiece(1, 0, "O");
        clickDivAndExpectPiece(0, 1, "X");
        clickDivAndExpectPiece(1, 1, "O");
        clickDivAndExpectPiece(1, 2, "X");
        clickDivAndExpectPiece(0, 2, "O");
        clickDivAndExpectPiece(2, 0, "X");
        clickDivAndExpectPiece(2, 1, "O");
        clickDivAndExpectPiece(2, 2, "X");
        expectBoard([['X', 'X', 'O'],
            ['O', 'O', 'X'],
            ['X', 'O', 'X']]);
    });
    it('with playAgainstTheComputer should work', function () {
        getPage('playAgainstTheComputer');
        clickDivAndExpectPiece(1, 0, "X");
        browser.sleep(2000); // wait for AI to make at least one move
        expectPiece(0, 0, 'O');
    });
    it('with onlyAIs should work', function () {
        getPage('onlyAIs');
        browser.sleep(2000); // wait for AI to make at least one move
        expectPiece(0, 0, 'X');
    });
});
//# sourceMappingURL=end_to_end_tests.js.map