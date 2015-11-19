/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('TicTacToe', function() {
  function getPage(page: string) {
    browser.get('http://localhost:9000/dist/' + page);
    browser.sleep(200); // Wait for the first updateUI to arrive.
  }

  beforeEach(function() {
    getPage('index.min.html');
  });

  function getDiv(row: number, col: number) {
    return element(by.id('e2e_test_div_' + row + 'x' + col));
  }

  function expectPieceKindDisplayed(row: number, col: number, pieceKind: string, isDisplayed: boolean) {
    let selector = by.id('e2e_test_piece' + pieceKind + '_' + row + 'x' + col);
    // Careful when using animations and asserting isDisplayed:
    // Originally, my animation started from {opacity: 0;}
    // And then the image wasn't displayed.
    // I changed it to start from {opacity: 0.1;}
    if (isDisplayed) {
      expect(element(selector).isDisplayed()).toEqual(true);
    } else {
      element.all(selector).then(function(items) {
        expect(items.length).toBe(0);
      });
    }
  }

  function expectPiece(row: number, col: number, pieceKind: string) {
    expectPieceKindDisplayed(row, col, 'X', pieceKind === "X");
    expectPieceKindDisplayed(row, col, 'O', pieceKind === "O");
  }

  function expectBoard(board: Board) {
    // I can't use gameLogic.ROWS/COLS (instead of 3) because gameLogic is not defined
    // in end-to-end tests.
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        expectPiece(row, col, board[row][col]);
      }
    }
  }

  function clickDivAndExpectPiece(row: number, col: number, pieceKind: string): void {
    getDiv(row, col).click();
    expectPiece(row, col, pieceKind);
  }

  it('should have a title', function () {
    expect(browser.getTitle()).toEqual('TicTacToe');
  });

  it('should have an empty TicTacToe board', function () {
    expectBoard(
        [['', '', ''],
         ['', '', ''],
         ['', '', '']]);
  });

  it('should show X if I click in 0x0', function () {
    clickDivAndExpectPiece(0, 0, "X");
    expectBoard(
        [['X', '', ''],
         ['', '', ''],
         ['', '', '']]);
  });

  it('should ignore clicking on a non-empty cell', function () {
    clickDivAndExpectPiece(0, 0, "X");
    clickDivAndExpectPiece(0, 0, "X"); // clicking on a non-empty cell doesn't do anything.
    clickDivAndExpectPiece(1, 1, "O");
    expectBoard(
        [['X', '', ''],
         ['', 'O', ''],
         ['', '', '']]);
  });

  it('should end game if X wins', function () {
    for (let col = 0; col < 3; col++) {
      clickDivAndExpectPiece(1, col, "X");
      // After the game ends, player "O" click (in cell 2x2) will be ignored.
      clickDivAndExpectPiece(2, col, col === 2 ? "" : "O");
    }
    expectBoard(
        [['', '', ''],
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
    expectBoard(
        [['X', 'X', 'O'],
         ['O', 'O', 'X'],
         ['X', 'O', 'X']]);
  });

  it('with playAgainstTheComputer should work', function () {
    getPage('index.min.html?playAgainstTheComputer');
    clickDivAndExpectPiece(1, 0, "X");
    browser.sleep(2000); // wait for AI to make at least one move
    expectPiece(0, 0, 'O');
  });

  it('with onlyAIs should work', function () {
    browser.get('index.min.html?onlyAIs');
    browser.sleep(2000); // wait for AI to make at least one move
    expectPiece(0, 0, 'X');
  });
});
