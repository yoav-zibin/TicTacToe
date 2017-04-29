function expectEmptyBrowserLogs() {
    browser.manage().logs().get('browser').then(function (browserLog) {
        // See if there are any errors (warnings are ok)
        var hasErrors = false;
        for (var _i = 0, browserLog_1 = browserLog; _i < browserLog_1.length; _i++) {
            var log_1 = browserLog_1[_i];
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
            args[_i] = arguments[_i];
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
    beforeEach(function () {
        console.log('\n\n\nRunning test: ', lastTest.fullName);
        getPage();
        waitForElement(element(by.id('game_iframe_0')));
        browser.driver.switchTo().frame('game_iframe_0');
        // It takes time for the game_iframe to load.
        waitForElement(element(by.id('e2e_test_div_0x0')));
    });
    afterEach(function () {
        expectEmptyBrowserLogs();
    });
    var startedExecutionTime = new Date().getTime();
    function log(msg) {
        var now = new Date().getTime();
        console.log("After " + (now - startedExecutionTime) + " milliseconds: " + msg);
    }
    function error(msg) {
        log(Array.prototype.slice.call(arguments).join(", "));
        browser.pause();
    }
    function safePromise(p) {
        if (!p)
            error("safePromise p = " + p);
        return p.then(function (x) { return x; }, function () { return false; });
    }
    function waitUntil(fn) {
        browser.driver.wait(fn, 10000).thenCatch(error);
    }
    function getElementName(elem) {
        return elem.locator();
    }
    function willDoLog(msg) {
        log("Will do: " + msg);
        browser.call(function () {
            log("Doing: " + msg);
        });
    }
    function waitForElement(elem) {
        willDoLog("waitForElement " + getElementName(elem));
        waitUntil(function () { return safePromise(elem.isPresent()).then(function (isPresent) { return isPresent &&
            safePromise(elem.isDisplayed()).then(function (isDisplayed) {
                return isDisplayed && safePromise(elem.isEnabled());
            }); }); });
        expect(elem.isDisplayed()).toBe(true);
    }
    function waitForElementToDisappear(elem) {
        willDoLog("waitForElementToDisappear " + getElementName(elem));
        waitUntil(function () { return safePromise(elem.isPresent()).then(function (isPresent) { return !isPresent ||
            safePromise(elem.isDisplayed()).then(function (isDisplayed) { return !isDisplayed; }); }); });
        // Element is either not present or not displayed.
    }
    function getPage() {
        browser.get('/dist/index.min.html');
    }
    function expectPieceKindDisplayed(row, col, pieceKind, isDisplayed) {
        var selector = by.id('e2e_test_piece' + pieceKind + '_' + row + 'x' + col);
        // Careful when using animations and asserting isDisplayed:
        // Originally, my animation started from {opacity: 0;}
        // And then the image wasn't displayed.
        // I changed it to start from {opacity: 0.1;}
        if (isDisplayed) {
            waitForElement(element(selector));
        }
        else {
            waitForElementToDisappear(element(selector));
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
    it('should ignore clicking on a non-empty cell', function () {
        clickDivAndExpectPiece(0, 0, "X");
        clickDivAndExpectPiece(0, 0, "X"); // clicking on a non-empty cell doesn't do anything.
        clickDivAndExpectPiece(1, 1, "O");
        expectBoard([['X', '', ''],
            ['', 'O', ''],
            ['', '', '']]);
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
});
//# sourceMappingURL=end_to_end_tests.js.map