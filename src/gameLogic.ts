type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
}
type IProposalData = BoardDelta;
interface IState {
  myBoard: Board;
  delta: BoardDelta;
  start: number;
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

  /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
  export function getInitialBoard(): Board {
    let board: Board = [];
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = '';
      }
    }
    
    board[0][Math.floor(Math.random() * ROWS) + 1] = 'O';
    board[ROWS][Math.floor(Math.random() * ROWS) + 1] = 'O';

    return board;
  }


  export function getInitialState(): IState {
    return {myBoard: getInitialBoard(), delta: null, start:0};
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

  function getWinner(board: Board): string {
    for (let i = 0; i < ROWS; i++) 
      for (let j = 0; j < COLS; j++) 
        if(board[i][j]=='X') {
          console.log("Game Ends ");
          return "I lose!";
        }
  }


  export function createMove(
      stateBeforeMove: IState, row: number, col: number, turnIndexBeforeMove: number, whichBoard: number, direction: boolean): IMove {

    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }

    let myBoard: Board = stateBeforeMove.myBoard;

    //set ship 
    /*
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
    */

    //else if (whichBoard==1) { 
      /*
      if(stateBeforeMove.start!=1) {
        console.log("Not Started");
        throw new Error("Not Started");
      }
      */

      if(myBoard[row][col] === 'X' || myBoard[row][col] === 'M') {
        console.log("already full!");
        throw new Error("already full!");
      }

      if (getWinner(myBoard) !== '') {
        throw new Error("Can only make a move if the game is not over!");
      }

      let myBoardAfterMove = angular.copy(myBoard);

      //boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
      if(myBoard[row][col]==='')
          myBoardAfterMove[row][col] = 'M';
      else
          myBoardAfterMove[row][col] = 'X';

      let winner = getWinner(myBoardAfterMove);
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
      let state: IState = {delta: delta, myBoard: myBoardAfterMove, start: 1};

      return {endMatchScores: endMatchScores, turnIndex: turnIndex, state: state};
    }

  export function createInitialMove(): IMove {
    return {endMatchScores: null, turnIndex: 0,
        state: getInitialState()};
  }

}


