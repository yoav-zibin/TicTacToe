var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 10;
    gameLogic.COLS = 10;
    /*
      function setShipRow(board: Board, state: IState, row: number, col: number, direction: boolean): IState {
        let shipNum = state.ship;
        let originBoard = board;
        if(shipNum < 5) {
          if(state.start==0) {
            if(board[row][col] === 'O') {
              throw new Error("already set!");
            }
            else {
              let length=5-shipNum;
              let compensate=0;
              
             // give compensate to out of boundary
              if(!validSet(board, row, col, length, direction)) {
                compensate = row+length-ROWS;
              }
    
              //check if already set
              for(let i=0; i<length; i++) {
                //check if already set
                if(board[row-compensate+i][col]==='O') {
                  window.alert("Already set ship here");
                  return {myBoard: originBoard ,yourBoard: state.yourBoard, delta:null, ship: shipNum, start: state.start};
                }
              }
    
              for(let i=0; i<length; i++) {
                board[row-compensate+i][col]='O';
              }
              
              shipNum++;
              console.log("shipNum:", shipNum);
            }
          }
        }
        else {
          return {myBoard: board,yourBoard: state.yourBoard, delta:{row,col}, ship: shipNum, start: 1};
        }
        if(shipNum==5) {
          state.start=1;
        }
    
        return {myBoard: board,yourBoard: state.yourBoard, delta:{row,col}, ship: shipNum, start: state.start};
      }
    */
    /*
      function setShipCol(board: Board, state: IState, row: number, col: number, direction: boolean): IState {
        let shipNum = state.ship;
        let originBoard = board;
        if(shipNum < 5) {
          if(state.start==0) {
            if(board[row][col] === 'O') {
              throw new Error("already set!");
            }
            else {
              let length=5-shipNum;
              let compensate=0;
              
              //give compensate to out of boundary
              if(!validSet(board, row, col, length,direction)) {
                compensate = col+length-COLS;
              }
    
              //check if already set
              for(let i=0; i<length; i++) {
                //check if already set
                if(board[row][col-compensate+i]==='O') {
                  window.alert("Already set ship here");
                  return {myBoard: originBoard ,yourBoard: state.yourBoard, delta:null, ship: shipNum, start: state.start};
                }
              }
    
              for(let i=0; i<length; i++) {
                board[row][col-compensate+i]='O';
              }
              
              shipNum++;
              console.log("shipNum:", shipNum);
            }
          }
        }
        else {
          return {myBoard: board,yourBoard: state.yourBoard, delta:{row,col}, ship: shipNum, start: 1};
        }
        if(shipNum==5) {
          state.start=1;
        }
    
        return {myBoard: board,yourBoard: state.yourBoard, delta:{row,col}, ship: shipNum, start: state.start};
      }
    */
    function getInitialState() {
        var board = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i][j] = '';
            }
        }
        // random starting point
        var mine = Math.floor((Math.random() * 10));
        var your = Math.floor((Math.random() * 10));
        board[0][mine] = 'O';
        board[9][your] = 'O';
        return { myBoard: board, delta: null, start: 0, myShip: { row: 0, col: mine }, yourShip: { row: 9, col: your } };
    }
    gameLogic.getInitialState = getInitialState;
    /*
      export function validSet(board: Board, row: number, col: number, leng: number, direction: boolean): boolean {
        if(direction == true) {
          if((row + leng) > 10 || row < 0 || col < 0) {
            return false;
          }
        }
        else {
          if((col + leng) > 10 || row < 0 || col < 0) {
            return false;
          }
        }
    
        return true;
      }
    */
    function getWinner(board) {
        for (var i = 0; i < gameLogic.ROWS; i++)
            for (var j = 0; j < gameLogic.COLS; j++)
                if (board[i][j] == 'X') {
                    console.log("Game Ends ");
                    return "I lose!";
                }
        return '';
    }
    function createMove(stateBeforeMove, row, col, turnIndexBeforeMove) {
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        var myBoard = stateBeforeMove.myBoard;
        if (myBoard[row][col] === 'X' || myBoard[row][col] === 'M') {
            console.log("already full!");
            throw new Error("already full!");
        }
        if (getWinner(myBoard) !== '') {
            throw new Error("Can only make a move if the game is not over!");
        }
        var myBoardAfterMove = angular.copy(myBoard);
        var myP;
        var yourP;
        var originRow;
        var originCol;
        if (turnIndexBeforeMove == 0) {
            originRow = stateBeforeMove.myShip.row;
            originCol = stateBeforeMove.myShip.col;
            myBoardAfterMove[originRow][originCol] = '';
            myBoardAfterMove[row][col] = 'O';
            myP = { row: row, col: col };
            yourP = { row: stateBeforeMove.yourShip.row, col: stateBeforeMove.yourShip.col };
        }
        else {
            originRow = stateBeforeMove.yourShip.row;
            originCol = stateBeforeMove.yourShip.col;
            myBoardAfterMove[originRow][originCol] = '';
            myBoardAfterMove[row][col] = 'O';
            myP = { row: stateBeforeMove.myShip.row, col: stateBeforeMove.myShip.col };
            yourP = { row: row, col: col };
        }
        var winner = getWinner(myBoardAfterMove);
        var endMatchScores;
        var turnIndex;
        if (winner !== '') {
            // Game over.
            turnIndex = -1;
            endMatchScores = winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0];
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            turnIndex = 1 - turnIndexBeforeMove;
            endMatchScores = null;
        }
        var delta = { row: row, col: col };
        var state = { delta: delta, myBoard: myBoardAfterMove, myShip: myP, yourShip: yourP, start: 1 };
        return { endMatchScores: endMatchScores, turnIndex: turnIndex, state: state };
    }
    gameLogic.createMove = createMove;
    function createInitialMove() {
        return { endMatchScores: null, turnIndex: 0,
            state: getInitialState() };
    }
    gameLogic.createInitialMove = createInitialMove;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map