/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('TicTacToe', function() {

  'use strict';

  beforeEach(function() {
    browser.get('http://localhost:9000/game.min.html');
  });

  function getDiv(row, col) {
    return element(by.id('e2e_test_div_' + row + 'x' + col));
  }
  function getImg(row, col) {
    return element(by.id('e2e_test_img_' + row + 'x' + col));
  }
  function expectImgDisplayed(row, col, isDisplayed) {
    expect(getImg(row, col).isDisplayed()).toEqual(isDisplayed);
  }
  function expectImgSrc(row, col, pieceKind) {
    expect(getImg(row, col).getAttribute("src")).toEqual("http://localhost:9000/piece" + pieceKind + ".png");
  }
  function clickDivAndexpectImgSrc(row, col, pieceKind) {
    getDiv(row, col).click();
    expectImgDisplayed(row, col, true);
    expectImgSrc(row, col, pieceKind);
  }

  it('should have a title', function() {
    expect(browser.getTitle()).toEqual('TicTacToe');
  });

  it('should have an empty TicTacToe board', function() {
    for (var row = 0; row < 3; row++) {
      for (var col = 0; col < 3; col++) {
        expectImgDisplayed(row, col, false);
      }
    }
  });

  it('should show X if I click in 0x0', function() {
    expectImgDisplayed(0, 0, false);
    clickDivAndexpectImgSrc(0, 0, "X");
  });

  it('should ignore clicking on a non-empty cell', function() {
    clickDivAndexpectImgSrc(0, 0, "X");
    clickDivAndexpectImgSrc(0, 0, "X"); // clicking on a non-empty cell doesn't do anything.
    clickDivAndexpectImgSrc(1, 1, "O");
  });

  it('should end game if X wins', function() {
    for (var col = 0; col < 3; col++) {
      clickDivAndexpectImgSrc(1, col, "X");
      getDiv(2, col).click();
      if (col === 2) {
        // After the game ends, player "O" click (in cell 2x2) will be ignored.
        expectImgDisplayed(2, 2, false);
      } else {
        expectImgSrc(2, col, "O");
      }
    }
  });

  it('should end the game in tie', function() {
    clickDivAndexpectImgSrc(0, 0, "X");
    clickDivAndexpectImgSrc(1, 0, "O");
    clickDivAndexpectImgSrc(0, 1, "X");
    clickDivAndexpectImgSrc(1, 1, "O");
    clickDivAndexpectImgSrc(1, 2, "X");
    clickDivAndexpectImgSrc(0, 2, "O");
    clickDivAndexpectImgSrc(2, 0, "X");
    clickDivAndexpectImgSrc(2, 1, "O");
    clickDivAndexpectImgSrc(2, 2, "X");
  });

});
