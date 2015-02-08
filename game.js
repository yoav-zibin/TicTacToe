'use strict';

angular.module('myApp')
  .controller('Ctrl', function (
      $window, $scope, $log, $timeout,
      gameService, gameLogic, aiService, resizeGameAreaService) {
    resizeGameAreaService.setWidthToHeight(1);

    function sendComputerMove() {
      gameService.makeMove(
          aiService.createComputerMove($scope.board, $scope.turnIndex,
              // 0.3 seconds for the AI to choose a move
              {millisecondsLimit: 300}));
    }

    function updateUI(params) {
      $scope.board = params.stateAfterMove.board;
      $scope.delta = params.stateAfterMove.delta;
      if ($scope.board === undefined) {
        $scope.board = gameLogic.getInitialBoard();
      }
      $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      $scope.turnIndex = params.turnIndexAfterMove;

      // Is it the computer's turn?
      if ($scope.isYourTurn
          && params.playersInfo[params.yourPlayerIndex].playerId === '') {
        $scope.isYourTurn = false; // to make sure the UI won't send another move.
        // Wait 500 milliseconds until animation ends.
        $timeout(sendComputerMove, 500);
      }
    }

    // Before getting any updateUI, we show an empty board to a viewer (so you can't perform moves).
    updateUI({stateAfterMove: {}, turnIndexAfterMove: 0, yourPlayerIndex: -2});

    $scope.cellClicked = function (row, col) {
      $log.info(["Clicked on cell:", row, col]);
      if (!$scope.isYourTurn) {
        return;
      }
      try {
        var move = gameLogic.createMove($scope.board, row, col, $scope.turnIndex);
        $scope.isYourTurn = false; // to prevent making another move
        gameService.makeMove(move);
      } catch (e) {
        $log.info(["Cell is already full in position:", row, col]);
        return;
      }
    };
    $scope.shouldShowImage = function (row, col) {
      var cell = $scope.board[row][col];
      return cell !== "";
    };
    $scope.getImageSrc = function (row, col) {
      var cell = $scope.board[row][col];
      return cell === "X" ? "pieceX.png"
          : cell === "O" ? "pieceO.png" : "";
    };
    $scope.shouldSlowlyAppear = function (row, col) {
      return $scope.delta !== undefined
          && $scope.delta.row === row && $scope.delta.col === col;
    };

    gameService.setGame({
      gameDeveloperEmail: "yoav.zibin@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
  });
