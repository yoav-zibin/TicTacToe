
angular.module('myApp')
  .controller('Ctrl',
      ['$rootScope', '$scope', '$log', '$timeout',
       'gameService', 'stateService', 'gameLogic', 'aiService',
       'resizeGameAreaService', '$translate',
      function ($rootScope, $scope, $log, $timeout,
        gameService, stateService, gameLogic, aiService,
        resizeGameAreaService, $translate) {
    'use strict';

    $translate('TICTACTOE_GAME').then(function (translation) {
      console.log("Translation of 'TICTACTOE_GAME' is " + translation);
    });

    resizeGameAreaService.setWidthToHeight(1);

    var animationEnded = false;
    var canMakeMove = false;
    var isComputerTurn = false;
    var state = null;
    var turnIndex = null;

    function animationEndedCallback() {
      $rootScope.$apply(function () {
        $log.info("Animation ended");
        animationEnded = true;
        if (isComputerTurn) {
          sendComputerMove();
        }
      });
    }
    // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
    document.addEventListener("animationend", animationEndedCallback, false); // standard
    document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
    document.addEventListener("oanimationend", animationEndedCallback, false); // Opera


    function sendComputerMove() {
      gameService.makeMove(
          aiService.createComputerMove(state.board, turnIndex,
            // at most 1 second for the AI to choose a move (but might be much quicker)
            {millisecondsLimit: 1000}));
    }

    function updateUI(params) {
      animationEnded = false;
      state = params.stateAfterMove;
      if (state.board === undefined) {
        state.board = gameLogic.getInitialBoard();
      }
      canMakeMove = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      turnIndex = params.turnIndexAfterMove;

      // Is it the computer's turn?
      isComputerTurn = canMakeMove &&
          params.playersInfo[params.yourPlayerIndex].playerId === '';
      if (isComputerTurn) {
        // To make sure the player won't click something and send a move instead of the computer sending a move.
        canMakeMove = false;
        // We calculate the AI move only after the animation finishes,
        // because if we call aiService now
        // then the animation will be paused until the javascript finishes.
      }
    }
    window.e2e_test_stateService = stateService; // to allow us to load any state in our e2e tests.

    $scope.cellClicked = function (row, col) {
      $log.info(["Clicked on cell:", row, col]);
      if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
        throw new Error("Throwing the error because URL has '?throwException'");
      }
      if (!canMakeMove) {
        return;
      }
      try {
        var move = gameLogic.createMove(state.board, row, col, turnIndex);
        canMakeMove = false; // to prevent making another move
        gameService.makeMove(move);
      } catch (e) {
        $log.info(["Cell is already full in position:", row, col]);
        return;
      }
    };
    $scope.shouldShowImage = function (row, col) {
      var cell = state.board[row][col];
      return cell !== "";
    };
    $scope.isPieceX = function (row, col) {
      return state.board[row][col] === 'X';
    };
    $scope.isPieceO = function (row, col) {
      return state.board[row][col] === 'O';
    };
    $scope.shouldSlowlyAppear = function (row, col) {
      return !animationEnded &&
          state.delta !== undefined &&
          state.delta.row === row && state.delta.col === col;
    };

    gameService.setGame({
      gameDeveloperEmail: "yoav.zibin@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
  }])
  .config(['$translateProvider', function($translateProvider) {
    'use strict';

    if (!window.angularTranslations) {
      throw new Error("We forgot to include languages/en.js in our HTML");
    }
    $translateProvider.translations('en', window.angularTranslations);
    $translateProvider.useStaticFilesLoader({
        prefix: 'languages/',
        suffix: '.js'
      })
      .registerAvailableLanguageKeys(['en', 'de'])
      .fallbackLanguage(['en'])
      .determinePreferredLanguage();
  }]);
