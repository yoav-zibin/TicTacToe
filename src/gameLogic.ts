type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
}
type IProposalData = BoardDelta;
interface IState {
  myBoard: Board;
  yourBoard: Board;
  delta: BoardDelta;
  start: number;
  ship: number;
}

import gameService = gamingPlatform.gameService;
import alphaBetaService = gamingPlatform.alphaBetaService;
import translate = gamingPlatform.translate;
import resizeGameAreaService = gamingPlatform.resizeGameAreaService;
import log = gamingPlatform.log;
import dragAndDropService = gamingPlatform.dragAndDropService;

module gameLogic {
  export const ROWS = 10;
  export const COLS = 10;

  /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
  export function getInitialBoard(): Board {
    let board: Board = [];
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = '';
      }
    }
    return board;
  }


  export function getInitialState(): IState {
    return {myBoard: getInitialBoard(), yourBoard: getInitialBoard(), delta: null, ship: 0, start:0};
  }

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
          
          /**give compensate to out of boundary */
          if(!validSet(board, row, col, length, direction)) {
            compensate = row+length-ROWS;
          }

          /**check if already set */
          for(let i=0; i<length; i++) {
            /**check if already set */
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
          
          /**give compensate to out of boundary */
          if(!validSet(board, row, col, length,direction)) {
            compensate = col+length-COLS;
          }

          /**check if already set */
          for(let i=0; i<length; i++) {
            /**check if already set */
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

  function getWinner(board: Board): string {
    let sinkBoat = 0;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if(board[i][j]=='O') {
            console.log("sinkBoat: " + sinkBoat);
            return '';
        }
      }
    }
    console.log("Game Ends ");
    return "I lose!";
  }

  export function createMove(
      stateBeforeMove: IState, row: number, col: number, turnIndexBeforeMove: number, whichBoard: number, direction: boolean): IMove {

    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }

    let myBoard: Board = stateBeforeMove.myBoard;
    let yourBoard: Board = stateBeforeMove.yourBoard;

    /**set ship */
    if(whichBoard == 0) {
      if(stateBeforeMove.start!=1) {
        console.log("setting ship");
        let shipState;
        if(direction == true) {
          shipState = setShipRow(myBoard, stateBeforeMove, row, col, direction);
        }
        else 
          shipState = setShipCol(myBoard, stateBeforeMove, row, col, direction);

        return {endMatchScores: null, turnIndex: 0, state: shipState};
      }
      else {
        console.log("Game has started!");
        return {endMatchScores: null, turnIndex: 1, state: stateBeforeMove};
      }
    }

    else if (whichBoard==1) { 
      if(stateBeforeMove.start!=1) {
        console.log("Not Started");
        throw new Error("Not Started");
      }

      if(yourBoard[row][col] === 'X' || yourBoard[row][col] === 'M') {
        console.log("already full!");
        throw new Error("already full!");
      }

      if (getWinner(myBoard) !== '') {
        throw new Error("Can only make a move if the game is not over!");
      }

      let myBoardAfterMove = angular.copy(myBoard);
      let yourBoardAfterMove = angular.copy(yourBoard);

      //boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
      if(yourBoard[row][col]==='')
          yourBoardAfterMove[row][col] = 'M';
      else
          yourBoardAfterMove[row][col] = 'X';

      let winner = getWinner(myBoardAfterMove);
      let shipNum = stateBeforeMove.ship;
      let endMatchScores: number[];
      let turnIndex: number;
      if (winner !== '') {
        // Game over.
        turnIndex = -1;
        endMatchScores = winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0];
      } else {
        // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
        turnIndex = 1 - turnIndexBeforeMove;
        endMatchScores = null;
      }
      let delta: BoardDelta = {row: row, col: col};
      let state: IState = {delta: delta, myBoard: myBoardAfterMove, yourBoard: yourBoardAfterMove, ship:shipNum, start: 1};

      if(shipNum==0) {
        window.alert("Game Ended!");
      }

      return {endMatchScores: endMatchScores, turnIndex: turnIndex, state: state};
      }
    }

  export function createInitialMove(): IMove {
    return {endMatchScores: null, turnIndex: 0,
        state: getInitialState()};
  }

/*
  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null,null, 0, 0, 0);
    log.log("move=", move);
  }
*/

}


