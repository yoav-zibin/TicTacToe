type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
  shapeId: number;
}
type IProposalData = BoardDelta;
interface IState {
  board: Board;
  delta: BoardDelta;
  shapeStatus: boolean[][];
  playerStatus: boolean[];
}

interface Shape {
  id: number;
  // row and column of shape's center point on board
  row: number;
  column: number;
  // the centroid of frame is 2,2. The height and width of frame is 5.
  frame: string[][];
}

// TODO add array to store all the Shape
type AllShape = Shape[];

import gameService = gamingPlatform.gameService;
import alphaBetaService = gamingPlatform.alphaBetaService;
import translate = gamingPlatform.translate;
import resizeGameAreaService = gamingPlatform.resizeGameAreaService;
import log = gamingPlatform.log;
import dragAndDropService = gamingPlatform.dragAndDropService;

module gameLogic {
  export const ROWS = 20; //14
  export const COLS = 20; //14
  export const OPERATIONS = 8;
  export const SHAPEHEIGHT = 5;
  export const SHAPEWIDTH = 5;
  export const SHAPENUMBER = 21;
  export const GROUPNUMBER = 4; /// 2
  // TODO change this
  export const STARTANCHOR: number[] = [0, ROWS*COLS]; // [0, 14 * 14];

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

  export function getInitShapeStatus(): boolean[][] {
    let status: boolean[][] = [];
    for (let j = 0; j < GROUPNUMBER; j++) {
      status[j] = [];
      for (let i = 0; i < SHAPENUMBER; i++) {
        status[j][i] = true;
      }
    }
    return status;
  }

  export function getInitPlayerStatus(): boolean[] {
    return [true, true, true, true];
  }

  export function getInitShapes(): AllShape {
    let shapes: AllShape = [];
    // init all shapes 
    shapes = [{
      id: 0, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 2, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 3, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 4, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '1', '1', '1', '1'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 5, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '1', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 6, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '1', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 7, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 8, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '1', '1', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 9, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '1', '0', '0', '0'],
      ['0', '1', '1', '1', '1'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 10, row: -1, column: -1,
      frame: [['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 11, row: -1, column: -1,
      frame: [['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '1', '1'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 12, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '1'],
      ['0', '1', '1', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 13, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '1', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '1', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 14, row: -1, column: -1,
      frame: [['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0']]
    },
    {
      id: 15, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 16, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '1', '1', '0', '0'],
      ['0', '1', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 17, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 18, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '1', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 19, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: 20, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '1', '1', '1', '1'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    }
    ];

    return shapes;
  }

  export function aux_printFrame(frame: string[][], height: number): string {
    let ret: string = "   0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9\n\r  ----------------------------------------\n\r";
    for (let i = 0; i < height; i++) {
      let tmp: string[] = angular.copy(frame[i]);
      for (let j = 0; j < tmp.length; j++) {
        if (tmp[j] == '') {
          tmp[j] = ' ';
        }
      }
      if (i >= 10) {
        ret += "" + i + "|" + tmp.toString() + "|\n\r";
      } else {
        ret += " " + i + "|" + tmp.toString() + "|\n\r";
      }
    }
    ret += "  ----------------------------------------\n\r";
    return ret;
  }

  export function aux_printCoordinator(numbers: number[]): string {
    let ret: string = "";

    for (let i = 0; i < numbers.length; i++) {
      ret += "(" + parseIJ(numbers[i]).toString() + ")";
      ret += ", ";
    }
    return ret;
  }

  export function getShapeByTypeAndOperation(shapeType: number, operationType: number): Shape {
    let allShapes: AllShape = getInitShapes();
    //log.log("shapeType:", shapeType);
    let shape: Shape = allShapes[shapeType];
    let rotation: number = operationType % 4;
    // only vertical flip. Horizontal flip <=> vertical flip + 180 rotation.
    let flip: number = Math.floor(operationType / 4);

    let retShape: Shape = angular.copy(shape);

    //log.log("shapeId=", shapeType);
    //log.log("rotation=", rotation);
    //log.log("flip=", flip);

    //log.log("origin shape")
    //console.log(aux_printFrame(shape.frame, SHAPEHEIGHT));

    // vertical flip
    if (flip == 1) {
      for (let i = 0; i < SHAPEHEIGHT; i++) {
        for (let j = 0; j < SHAPEWIDTH / 2; j++) {
          let tmp: string = retShape.frame[i][j];
          retShape.frame[i][j] = retShape.frame[i][SHAPEWIDTH - j - 1];
          retShape.frame[i][SHAPEWIDTH - j - 1] = tmp;
        }
      }
    }

    //log.log("After flipping Allshape:")
    //console.log(aux_printFrame(retShape.frame, SHAPEHEIGHT));

    // rotation
    let rotateAny = function (retShape: Shape, rotation: number): string[][] {
      let rotate90 = function (input: string[][]): string[][] {
        let tmpFrame: string[][] = angular.copy(input);
        for (let i = 0; i < SHAPEHEIGHT; i++) {
          for (let j = 0; j < SHAPEWIDTH; j++) {
            tmpFrame[i][j] = input[SHAPEHEIGHT - j - 1][i];
          }
        }
        return tmpFrame;
      }

      let ret: string[][] = angular.copy(retShape.frame)
      //console.log("Before rotation:");
      //console.log(aux_printFrame(ret, SHAPEHEIGHT));
      for (let i = 0; i < rotation; i++) {
        //console.log("Roate=", i);
        ret = rotate90(ret);
        //console.log("After rotation:");
        //console.log(aux_printFrame(ret, SHAPEHEIGHT));
      }
      return ret;
    }

    retShape.frame = rotateAny(retShape, rotation);

    //log.log("After rotation Allshape:")
    //console.log(aux_printFrame(retShape.frame, SHAPEHEIGHT));

    return retShape;
  }

  export function getShapeType(shapeId: number): number {
    return Math.floor(shapeId / OPERATIONS);
  }

  export function getShapeOpType(shapeId: number): number {
    return shapeId % OPERATIONS;
  }

  export function getShapeFromShapeID(shapeId: number): Shape {
    let operationType = getShapeOpType(shapeId);
    let shapeType = getShapeType(shapeId);

    return getShapeByTypeAndOperation(shapeType, operationType);
  }

  export function getInitialState(): IState {
    return {
      board: getInitialBoard(),
      delta: null,
      shapeStatus: getInitShapeStatus(),
      playerStatus: getInitPlayerStatus(),
    };
  }

  export function getAllMargin(shape: Shape): number[] {
    // top, left, bottom, right
    let ret: number[] = [0, 0, 0, 0];

    // sum of all the columns
    let colSum: number[] = [0, 0, 0, 0, 0];

    // sum of all the rows
    let rowSum: number[] = [0, 0, 0, 0, 0];

    for (let i = 0; i < SHAPEWIDTH; i++) {
      for (let j = 0; j < SHAPEHEIGHT; j++) {
        if (shape.frame[i][j] == '1') {
          rowSum[i] += 1;
          colSum[j] += 1;
        }
      }
    }

    //console.log("colSum=", colSum.toString());
    //console.log("rowSum=", rowSum.toString());

    let marginVal = 1;
    // top, left margin
    for (let i = 1; i >= 0; i--) {
      if (colSum[i] > 0) {
        ret[1] = marginVal;
      }
      if (rowSum[i] > 0) {
        ret[0] = marginVal;
      }
      marginVal++;
    }

    // right, bottom margin
    marginVal = 1;
    for (let i = 3; i < SHAPEWIDTH; i++) {
      if (colSum[i] > 0) {
        ret[3] = marginVal;
      }
      if (rowSum[i] > 0) {
        ret[2] = marginVal;
      }
      marginVal++;
    }

    return ret;
  }
  export function checkValidShapePlacement(row: number, col: number, shape: Shape): boolean {
    let ret: boolean = true;
    let margins: number[] = getAllMargin(shape);

    // TODO check valid with board, center and margin
    let up: number = row;
    let left: number = col;
    let bottom: number = ROWS - 1 - row;
    let right: number = COLS - 1 - col;

    return up >= margins[0] && left >= margins[1] && bottom >= margins[2] && right >= margins[3];
  }

  export function getBoardAction(row: number, col: number, shape: Shape): Board {
    let board: Board = [];
    // fill the shape matrix into the board;
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = '';
      }
    }

    let margins: number[] = getAllMargin(shape);
    for (let i = -margins[0]; i <= margins[2]; i++) {
      for (let j = -margins[1]; j <= margins[3]; j++) {
        let val: string = shape.frame[Math.floor(SHAPEHEIGHT / 2) + i][Math.floor(SHAPEWIDTH / 2) + j];
        if (val == '1') {
          board[row + i][col + j] = val;
        }
      }
    }

    return board;
  }

  /**
   * Returns true if the game ended in a tie because there are no empty cells.
   * E.g., isTie returns true for the following board:
   *     [['X', 'O', 'X'],
   *      ['X', 'O', 'O'],
   *      ['O', 'X', 'X']]
   */
  function isTie(board: Board): boolean {
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (board[i][j] === '') {
          // If there is an empty cell then we do not have a tie.
          return false;
        }
      }
    }
    // No empty cells, so we have a tie!
    return true;
  }

  /**
   * Return the winner (either 'X' or 'O') or '' if there is no winner.
   * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
   * E.g., getWinner returns 'X' for the following board:
   *     [['X', 'O', ''],
   *      ['X', 'O', ''],
   *      ['X', '', '']]
   */
  function getWinner(board: Board): string {
    let boardString = '';
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        let cell = board[i][j];
        boardString += cell === '' ? ' ' : cell;
      }
    }
    let win_patterns = [
      'XXX......',
      '...XXX...',
      '......XXX',
      'X..X..X..',
      '.X..X..X.',
      '..X..X..X',
      'X...X...X',
      '..X.X.X..'
    ];
    for (let win_pattern of win_patterns) {
      let x_regexp = new RegExp(win_pattern);
      let o_regexp = new RegExp(win_pattern.replace(/X/g, 'O'));
      if (x_regexp.test(boardString)) {
        return 'X';
      }
      if (o_regexp.test(boardString)) {
        return 'O';
      }
    }
    return '';
  }

  export function getRecomandAnchor(board: Board, turnIndexBeforeMove: number): number[] {
    let boundary: number[] = [];
    let diri: number[] = [-1, 0, 1, 0];
    let dirj: number[] = [0, 1, 0, -1];
    let dirj8: number[] = [-1, 0, 1, 0, -1, -1, 1, 1];
    let diri8: number[] = [0, 1, 0, -1, 1, -1, -1, 1];

    // get all boundary around turnIndexBeforeMove's teritory
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (("" + turnIndexBeforeMove) !== board[i][j]) {
          continue;
        }

        for (let k = 0; k < dirj8.length; k++) {
          let ni: number = i + diri8[k];
          let nj: number = j + dirj8[k];
          if (nj >= 0 && nj < COLS && ni >= 0 && ni < ROWS && board[ni][nj] == '') {
            let hashcode: number = ni * COLS + nj;
            if (boundary.indexOf(hashcode) == -1) {
              boundary.push(hashcode);
            }
          }
        }
      }
    }

    console.log("boundary for ", turnIndexBeforeMove, ":");
    console.log(aux_printCoordinator(boundary));

    let ret: number[] = [];
    for (let k = 0; k < boundary.length; k++) {
      let j: number = boundary[k] % COLS;
      let i: number = Math.floor(boundary[k] / COLS);

      // check adjecent, if adjecent to any blocks, then unavailble
      let skip: boolean = false;
      for (let t = 0; t < diri.length; t++) {
        let nj: number = j + diri[t];
        let ni: number = i + dirj[t];
        if (nj >= 0 && nj < COLS && ni >= 0 && ni < ROWS && board[ni][nj] == ('' + turnIndexBeforeMove)) {
          skip = true;
          break;
        }
      }
      if (skip) {
        continue;
      }
      ret.push(i * COLS + j);
    }

    return ret;
  }

  export function noPreviousMove(board: Board, turnIndexBeforeMove: number): boolean {
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (board[i][j] == '' + turnIndexBeforeMove) {
          return false;
        }
      }
    }
    return true;
  }

  export function parseIJ(hashcode: number): number[] {
    let j: number = hashcode % COLS;
    let i: number = Math.floor(hashcode / COLS);

    return [i, j];
  }

  export function checkLegalMove(board: Board, row: number, col: number,
    boardAction: Board, turnIndexBeforeMove: number): boolean {

    let ret: boolean = true;
    let possibleAnchor: number[] = [];
    let diri: number[] = [0, -1, 0, 1];
    let dirj: number[] = [-1, 0, 1, 0];

    // 0. if not territory, anchor is init state
    if (noPreviousMove(board, turnIndexBeforeMove)) {
      possibleAnchor.push(STARTANCHOR[turnIndexBeforeMove]);
    } else {
      possibleAnchor = getRecomandAnchor(board, turnIndexBeforeMove);
    }

    console.log("possible Anchors for ", turnIndexBeforeMove, " :");
    console.log(aux_printCoordinator(possibleAnchor));

    // 1.has at least one anchor
    let foundAnchor: boolean = false;
    for (let k = 0; k < possibleAnchor.length; k++) {
      let i: number = Math.floor(possibleAnchor[k] / COLS);
      let j: number = possibleAnchor[k] % COLS;
      if (boardAction[i][j] == '1') {
        foundAnchor = true;
        break;
      }
    }

    if (!foundAnchor) {
      return false;
    }

    console.log("Found anchor");
    // 2.not conflict with existing teritory and not adjacent to teritory
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (boardAction[i][j] == '') {
          continue;
        }
        // conflict
        if (boardAction[i][j] == '1' && board[i][j] != '') {
          ret = false;
          break;
        }
        // adjecent
        for (let k = 0; k < dirj.length; k++) {
          let ni = i + diri[k];
          let nj = j + dirj[k];
          if (nj >= 0 && nj < COLS && ni >= 0 && ni < ROWS && boardAction[ni][nj] != '1'
            && board[ni][nj] == ('' + turnIndexBeforeMove)) {
            ret = false;
            console.log("points at (", i, ",", j, ") adjacent with:(", ni, ",", nj, ")");
            return ret;
          }
        }
      }
    }

    return ret;
  }

  export function shapePlacement(boardAfterMove: Board, boardAction: Board, turnIndexBeforeMove: number) {
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (boardAction[i][j] == '1') {
          boardAfterMove[i][j] = '' + turnIndexBeforeMove;
        }
      }
    }
  }

  export function updateShapeStatus(shapeStatus:boolean[][], shapeId: number, turnIndexBeforeMove: number):boolean[][] {
    let ret = angular.copy(shapeStatus);
    ret[turnIndexBeforeMove][getShapeType(shapeId)] = false;
    return ret;
  }

  export function updatePlayerStatus(playerStatus: boolean[], turnIndexBeforeMove:number, shapeStatus:boolean[][], board:Board):boolean[] {
    let ret = angular.copy(playerStatus);

    // TODO check the remianing move

    return ret;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col with shapeId.
   * row and col is the center point of the shape.
   * shapdId is a mix of different shape and the rotation of the shape, starts from 1, 0 is a initial
   */
  export function createMove(
    stateBeforeMove: IState, row: number, col: number, shapeId: number, turnIndexBeforeMove: number): IMove {

    if (shapeId < 0) {
      throw new Error("Wrong shapeid");
    }
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }

    let shapeStatus: boolean[][] = stateBeforeMove.shapeStatus;

    if (!shapeStatus[turnIndexBeforeMove][getShapeType(shapeId)]) {
      throw new Error("Shape already been used");
    }

    let shape: Shape = getShapeFromShapeID(shapeId);

    // if the shape placement is not on the board
    if (!checkValidShapePlacement(row, col, shape)) {
      throw new Error("Shape not on the board");
    }

    let boardAction: Board = getBoardAction(row, col, shape);

    console.log("boardAction:")
    console.log(aux_printFrame(boardAction, COLS))

    let board: Board = stateBeforeMove.board;

    let playerStatus: boolean[] = stateBeforeMove.playerStatus;

    if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
      throw new Error("One can only make a move in an empty position!");
    }

    // TODO change to IsGameOver function IsGameOver(board, boardAction, turnIndexBeforeMove)
    if (getWinner(board) !== '' || isTie(board)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    //~

    let boardAfterMove = angular.copy(board);
    console.log("boardAfterMove:")
    console.log(aux_printFrame(boardAfterMove, COLS))

    shapePlacement(boardAfterMove, boardAction, turnIndexBeforeMove);
    let shapeStatusAfterMove = updateShapeStatus(shapeStatus, shapeId, turnIndexBeforeMove);

    //TODO implement the last check
    let playerStatusAferMove = updatePlayerStatus(playerStatus, turnIndexBeforeMove, shapeStatusAfterMove, boardAfterMove);
    
    let winner = getWinner(boardAfterMove);
    let endMatchScores: number[];
    let turnIndex: number;

    // CHANGE here
    if (winner !== '' || isTie(boardAfterMove)) {
      // Game over.
      turnIndex = -1;

      // TODO add endScore Function, the score is measured by the blocks unused.
      endMatchScores = winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0];
      //~
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      // TODO change to four player
      turnIndex = 1 - turnIndexBeforeMove;
      endMatchScores = null;
    }
    //~

    // Here delta should be all the blocks covered by the new move
    let delta: BoardDelta = { row: row, col: col, shapeId: shapeId };
    //~
    let state: IState = {
      delta: delta,
      board: boardAfterMove,
      shapeStatus: shapeStatusAfterMove,
      playerStatus: playerStatusAferMove,
    };
    return { endMatchScores: endMatchScores, turnIndex: turnIndex, state: state };
  }

  export function createInitialMove(): IMove {
    return {
      endMatchScores: null, turnIndex: 0,
      state: getInitialState()
    };
  }

  export function forSimplePlayTestHtml() {
    let board: Board = getInitialBoard();
    let turnIndexBeforeMove: number = 0;

    shapePlacement(board, getBoardAction(2, 1, getShapeFromShapeID(40)), 1);

    let actionRow: number[] = [0, 4, 2, 1, 4];
    let actionCol: number[] = [1, 3, 3, 2, 5];
    let actionShapeId: number[] = [40, 40, 40, 0, 40];

    for (let i = 0; i < actionShapeId.length; i++) {
      let row = actionRow[i];
      let col = actionCol[i];
      let shapeId = actionShapeId[i];

      let shape: Shape = getShapeFromShapeID(shapeId);
      if (!checkValidShapePlacement(row, col, shape)) {
        console.log("Shape not on the board");
      }

      let boardAction: Board = getBoardAction(row, col, shape);
      console.log("turnindex:", turnIndexBeforeMove);
      console.log("boardAction turn:", turnIndexBeforeMove, "row:", row, ", col:", col, "shape:", shapeId);
      console.log(aux_printFrame(boardAction, COLS));

      if (checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
        shapePlacement(board, boardAction, turnIndexBeforeMove);
        turnIndexBeforeMove = 1 - turnIndexBeforeMove;
        console.log("Board:")
        console.log(aux_printFrame(board, COLS));
      } else {
        console.log("Fail to add shape on the board. Board:")
        console.log(aux_printFrame(board, COLS));
      }
    }
  }

  export function forSimpleTestHtml() {
    /*
    var move = gameLogic.createMove(null, 0, 0, 0, 0);
    log.log("move=", move);
    */
    let shapeId: number = 40;
    log.log("Test input=", shapeId);
    log.log("Expeced Type=", 0);
    log.log("Expeced rotate=", 1);
    log.log("Expeced flip=", 1);
    let shape: Shape = getShapeFromShapeID(shapeId);

    log.log("frame:", shape);
    log.log("final shape:");
    console.log(aux_printFrame(shape.frame, SHAPEHEIGHT));

    let margins: number[] = getAllMargin(shape);
    log.log("margin=", margins)

    log.log(checkValidShapePlacement(0, 0, shape));
    log.log(checkValidShapePlacement(0, 1, shape));
    log.log(checkValidShapePlacement(1, 0, shape));
    log.log(checkValidShapePlacement(0, 1, shape));

    let boardAction: Board = getBoardAction(2, 2, shape);
    console.log(aux_printFrame(boardAction, COLS))
  }
}