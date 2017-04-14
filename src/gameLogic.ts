type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
}
type IProposalData = BoardDelta;
interface IState {
  board: Board;
  delta: BoardDelta;
}

// Red turn index = 0, Blue turn index = 1

import gameService = gamingPlatform.gameService;
import alphaBetaService = gamingPlatform.alphaBetaService;
import translate = gamingPlatform.translate;
import resizeGameAreaService = gamingPlatform.resizeGameAreaService;
import log = gamingPlatform.log;
import dragAndDropService = gamingPlatform.dragAndDropService;

module gameLogic {
  export const ROWS = 8;
  export const COLS = 8;

  /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
  export function getInitialBoard(): Board {
    let board: Board = [];
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = '';
      }
    }
 
    board[4][4] = 'R';
    board[4][5] = 'B';
    board[5][4] = 'B';
    board[5][5] = 'R';
    
    return board;
  }

  export function getInitialState(): IState {
    return {board: getInitialBoard(), delta: null};
  }


  /**
   * calculates the number of red and blue pieces on the board  
   * returns the scores as an array
   */  
  function getScores(board: Board): number[] {
    let red: number = 0;
    let blue: number = 0;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
         if(board[i][j] === 'R') {
             red = red + 1;
         }
         else if(board[i][j] === 'B') {
             blue = blue + 1;
         }
      }
    }
    return [red, blue];
  }

  /**
   * Returns the winner of the game 
   * R = Red, B = Blue, T = Tie 
   */
  function getWinner(scores : number[]) : string {
    let blue: number = scores.pop();
    let red: number = scores.pop();
    
    if(red < blue) {
       return 'B';
    } 
    else if (blue < red) {
       return 'R';
    }
    else {
       return 'T';
    }
  } 

  //type PossibleMoves = BoardDelta[];

  /**
   * Returns a possible move from a particular i, j 
   * in a particular direction specified by inci, incj
   */
  export function getPossibleMove(board: Board, i: number, j: number, inci: number, incj: number, turn: number): BoardDelta {
       let other: string;
       let curr: string;

       if(turn == 0) {
          curr = 'R';
          other = 'B';
       }
       else {
          curr = 'B';
          other = 'R';
       } 

       if(i >= 0 && i < ROWS && j >= 0 && j < COLS && board[i][j] === other){
            i = i + inci;
            j = j + incj;

            while(i >= 0 && i < ROWS && j >= 0 && j < COLS) {
                if(board[i][j] === other) {
                    i = i + inci;
                    j = j + incj;
                }
                else if (board[i][j] === curr) {
                    break;
                }
                else { // (board[i][j] === '')
                    return {row: i, col: j};
                }
            }
       } 

       return {row: -1, col: -1};
  }

  /**
   * Returns the set of all possible moves that can be performed by a player in the current move
   */
  export function getAllPossibleMoves(board: Board, turn: number) : BoardDelta[] {
       let possibleMoves : BoardDelta[] = [];
       let temp : BoardDelta;
       let curr: string;

       if(turn == 0) {
          curr = 'R';
       }
       else {
          curr = 'B';
       } 

       for (let i = 0; i < ROWS; i++) {
         for (let j = 0; j < COLS; j++) {
             if(board[i][j] == curr) {
                 temp = getPossibleMove(board, i-1, j, -1, 0, turn);
                 if(temp.row !== -1) {
                     possibleMoves.push(temp);
                 }

                 temp = getPossibleMove(board, i+1, j, +1, 0, turn); 
                 if(temp.row !== -1) {
                     possibleMoves.push(temp);
                 }

                 temp = getPossibleMove(board, i-1, j-1, -1, -1, turn);
                 if(temp.row !== -1) {
                     possibleMoves.push(temp);
                 }

                 temp = getPossibleMove(board, i+1, j+1, +1, +1, turn); 
                 if(temp.row !== -1) {
                     possibleMoves.push(temp);
                 }

                 temp = getPossibleMove(board, i-1, j+1, -1, +1, turn);
                 if(temp.row !== -1) {
                     possibleMoves.push(temp);
                 }

                 temp = getPossibleMove(board, i+1, j-1, +1, -1, turn); 
                 if(temp.row !== -1) {
                     possibleMoves.push(temp);
                 } 

                 temp = getPossibleMove(board, i, j-1, 0, -1, turn);
                 if(temp.row !== -1) {
                     possibleMoves.push(temp);
                 }

                 temp = getPossibleMove(board, i, j+1, 0, +1, turn);
                 if(temp.row !== -1) {
                     possibleMoves.push(temp);
                 } 
             }
         }
       }    

       return possibleMoves;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(
      stateBeforeMove: IState, row: number, col: number, turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }

    let board: Board = stateBeforeMove.board;

    if (board[row][col] !== '') {
      throw new Error("One can only make a move in an empty position!");
    }

    let allMovesRed : BoardDelta[] = getAllPossibleMoves(board, 0);
    let allMovesBlue : BoardDelta[] = getAllPossibleMoves(board, 0);

    if (allMovesRed.length <= 0 && allMovesBlue.length <= 0) {
      throw new Error("Can only make a move if the game is not over!");
    }

    let found: boolean = false;
    let len : number;
    if(turnIndexBeforeMove === 0) {
       len = allMovesRed.length;
    }
    else {
      len = allMovesBlue.length;
    }   

    for(var i = 0; i < len; i++) {
      if(turnIndexBeforeMove === 0) {
         if (allMovesRed[i].row === row && allMovesRed[i].col === col) {
           found = true;
           break;
        }  
      }
      else {
        if (allMovesBlue[i].row === row && allMovesBlue[i].col === col) {
           found = true;
           break;
        }   
      }    
    }
    
    if(found === false) {
       throw new Error("Invalid Move!"); 
    }

    let boardAfterMove = angular.copy(board);

    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'R' : 'B';
    let endMatchScores: number[];
    let winner : string = '';
    let turnIndex: number;

    if (getAllPossibleMoves(boardAfterMove, 0).length <= 0 && getAllPossibleMoves(boardAfterMove, 1).length <= 0)  {
      // Game over. No more moves possible
      turnIndex = -1;
      endMatchScores = getScores(boardAfterMove);
      winner = getWinner(endMatchScores);
    }
    else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      turnIndex = 1 - turnIndexBeforeMove;
      endMatchScores = null;
    }

    let delta: BoardDelta = {row: row, col: col};
    let state: IState = {delta: delta, board: boardAfterMove};
    return {endMatchScores: endMatchScores, turnIndex: turnIndex, state: state};
  }

  /**
   * Returns the first move
   */
  export function createInitialMove(): IMove {
    return {endMatchScores: null, turnIndex: 0, 
        state: getInitialState()};  
  }

  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null, 0, 0, 0);
    log.log("move=", move);
  }
}
