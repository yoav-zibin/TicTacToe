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
  anchorStatus: boolean[][];
}

interface Shape {
  id: number;
  // row and column of shape's center point on board
  row: number;
  column: number;
  // the centroid of frame is 2,2. The height and width of frame is 5.
  frame: string[][];
  // how many identipodem operations
  ops: number[];
  pt: number;
}

class Point {
  x: number;
  y: number;

  public toString = (): string => {
    return '(x: ${this.x}, y:${this.y})';
  }
}

interface ShapeBoard {
  board: string[][];
  shapeToCell: Point[][];
  cellToShape: number[][];
}

type AllShape = Shape[];

import gameService = gamingPlatform.gameService;
import alphaBetaService = gamingPlatform.alphaBetaService;
import translate = gamingPlatform.translate;
import resizeGameAreaService = gamingPlatform.resizeGameAreaService;
import log = gamingPlatform.log;
import dragAndDropService = gamingPlatform.dragAndDropService;

module gameLogic {
  export const ROWS = 14; //14
  export const COLS = 14; //14
  export const OPERATIONS = 8;
  export const SHAPEHEIGHT = 5;
  export const SHAPEWIDTH = 5;
  export const SHAPENUMBER = 21;
  export const GROUPNUMBER = 2; /// 4
  // TODO change this
  export const STARTANCHOR4: number[] = [0, COLS - 1, ROWS * (COLS - 1), ROWS * COLS - 1];
  export const STARTANCHOR: number[] = [0, ROWS * COLS - 1]; // [0, 14 * 14];
  export const SHAPEMAX = 168;

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

  export function getInitPrevAnchor(): boolean[][] {
    let ret: boolean[][] = [];
    for (let p = 0; p < GROUPNUMBER; p++) {
      ret[p] = [];
      for (let i = 0; i < ROWS * COLS; i++) {
        ret[p][i] = true;
      }
    }
    return ret;
  }
  /*
  export function getTurnIdx() {
    return ....
  }
  */

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
      ['0', '0', '0', '0', '0']],
      ops: [0],
      pt: 4,
    },
    {
      id: 1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0],
      pt: 1,
    },
    {
      id: 2, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3, 4, 5, 6, 7],
      pt: 4,
    },
    {
      id: 3, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3],
      pt: 2,
    },
    {
      id: 4, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '1', '1', '1', '1'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3],
      pt: 3,
    },
    {
      id: 5, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '1', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3],
      pt: 3,
    },
    {
      id: 6, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '1', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3, 4, 5, 6, 7],
      pt: 4,
    },
    {
      id: 7, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3],
      pt: 3,
    },
    {
      id: 8, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '1', '1', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3, 4, 5, 6, 7],
      pt: 4,
    },
    {
      id: 9, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '1', '0', '0', '0'],
      ['0', '1', '1', '1', '1'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3, 4, 5, 6, 7],
      pt: 5,
    },
    {
      id: 10, row: -1, column: -1,
      frame: [['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3],
      pt: 5,
    },
    {
      id: 11, row: -1, column: -1,
      frame: [['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '1', '1'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3],
      pt: 5,
    },
    {
      id: 12, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '1'],
      ['0', '1', '1', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3, 4, 5, 6, 7],
      pt: 5,
    },
    {
      id: 13, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '1', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '1', '0', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3, 4, 5, 6, 7],
      pt: 5,
    },
    {
      id: 14, row: -1, column: -1,
      frame: [['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0']],
      ops: [0, 1, 2, 3],
      pt: 5,
    },
    {
      id: 15, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3, 4, 5, 6, 7],
      pt: 5,
    },
    {
      id: 16, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '1', '1', '0', '0'],
      ['0', '1', '0', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3, 4, 5, 6, 7],
      pt: 5,
    },
    {
      id: 17, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3, 4, 5, 6, 7],
      pt: 5,
    },
    {
      id: 18, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '1', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3, 4, 5, 6, 7],
      pt: 5,
    },
    {
      id: 19, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0],
      pt: 5,
    },
    {
      id: 20, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '1', '1', '1', '1'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']],
      ops: [0, 1, 2, 3, 4, 5, 6, 7],
      pt: 5,
    }
    ];

    return shapes;
  }

  export function aux_printArray(frame: any[][]): string {
    let ret: string = "";
    for (let i = 0; i < frame.length; i++) {
      ret += frame[i].toString() + "\n\r";
    }
    return ret;
  }

  export function aux_printFrame(frame: string[][], height: number): string {
    let ret: string = "   0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9\n\r  ----------------------------------------\n\r";
    for (let i = 0; i < height; i++) {
      let tmp: string[] = angular.copy(frame[i]);
      if (tmp === null || tmp === undefined) {
        continue;
      }
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

    // TODO check this
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

  export function getShapeId(originShapeId: number, rotation: number, flip: boolean): number {
    return originShapeId * OPERATIONS + rotation + (flip ? 4 : 0);
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
      anchorStatus: getInitPrevAnchor(),
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

  export function adjustPositionByShapeId(row: number, col: number, shapeId: number): number[] {
    if (shapeId === undefined || shapeId === -1) {
      return [row, col];
    }
    let shape: Shape = getShapeFromShapeID(shapeId);
    return adjustPosition(row, col, shape);
  }

  function adjustPosition(row: number, col: number, shape: Shape): number[] {
    let ret: number[] = [row, col];
    let margins: number[] = getAllMargin(shape);

    // TODO check valid with board, center and margin
    let up: number = row;
    let left: number = col;
    let bottom: number = ROWS - 1 - row;
    let right: number = COLS - 1 - col;

    if (up < margins[0]) {
      ret[0] += (margins[0] - up);
    }
    if (left < margins[1]) {
      ret[1] += (margins[1] - left);
    }
    if (bottom < margins[2]) {
      ret[0] -= (margins[2] - bottom);
    }
    if (right < margins[3]) {
      ret[1] -= (margins[3] - right);
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

  export function getBoardActionFromShapeID(row: number, col: number, shapeId: number): Board {
    let shape: Shape = getShapeFromShapeID(shapeId);
    return getBoardAction(row, col, shape, ROWS, COLS);
  }

  export function getShapeActionFromShapeID(row: number, col: number, shapeId: number, SHAPEROW: number, SHAPECOL: number): Board {
    let shape: Shape = getShapeFromShapeID(shapeId);
    return getBoardAction(row, col, shape, SHAPEROW, SHAPECOL);
  }

  export function getBoardAction(row: number, col: number, shape: Shape, BOARDROWS: number, BOARDCOLS: number): Board {
    let board: Board = [];
    // fill the shape matrix into the board;
    for (let i = 0; i < BOARDROWS; i++) {
      board[i] = [];
      for (let j = 0; j < BOARDCOLS; j++) {
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
  function isTie(board: Board, playerStatus: boolean[]): boolean {
    let over = true;
    let winner: string = '';

    for (let i = 0; i < GROUPNUMBER; i++) {
      if (playerStatus[i] === true) {
        over = false;
        continue;
      }
    }
    if (over) {
      return true;
    } else {
      return false;
    }
  }

  export function getScore(board: Board): number[] {
    let score: number[] = [];
    for (let i = 0; i < GROUPNUMBER; i++) {
      score[i] = 0;
    }

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (board[i][j] !== '') {
          let idx: number = +board[i][j];
          score[idx]++;
        }
      }
    }
    return score;
  }
  /**
   * Return the winner (either 'X' or 'O') or '' if there is no winner.
   * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
   * E.g., getWinner returns 'X' for the following board:
   *     [['X', 'O', ''],
   *      ['X', 'O', ''],
   *      ['X', '', '']]
   */
  function getWinner(board: Board, playerStatus: boolean[]): string {
    let over = true;
    let winner: string = '';

    for (let i = 0; i < GROUPNUMBER; i++) {
      if (playerStatus[i] === true) {
        over = false;
        continue;
      }
    }
    if (over) {
      let scores: number[] = getScore(board);
      let maxval: number = 0;
      let maxIdx: number = -1;
      for (let i = 0; i < GROUPNUMBER; i++) {
        if (maxval < scores[i]) {
          maxval = scores[i];
          maxIdx = -1;
        }
      }
      if (maxIdx >= 0) {
        winner = maxIdx + '';
      }
    }
    return winner;
  }

  export function getRecomandAnchor(board: Board, turnIndexBeforeMove: number): number[] {
    if (noPreviousMove(board, turnIndexBeforeMove)) {
      return [STARTANCHOR[turnIndexBeforeMove]];
    }

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

    //console.log("boundary for ", turnIndexBeforeMove, ":");
    //console.log(aux_printCoordinator(boundary));

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

  export function checkSquareOverlap(board: Board, boardAction: Board): boolean {
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (boardAction[i][j] == '') {
          continue;
        }
        // conflict
        if (boardAction[i][j] == '1' && board[i][j] != '') {
          return false;
        }
      }
    }
    return true;
  }

  export function checkSquareAdj(board: Board, boardAction: Board, turnIndexBeforeMove: number) {
    let diri: number[] = [0, -1, 0, 1];
    let dirj: number[] = [-1, 0, 1, 0];

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (boardAction[i][j] == '') {
          continue;
        }
        // adjecent
        for (let k = 0; k < dirj.length; k++) {
          let ni = i + diri[k];
          let nj = j + dirj[k];
          if (nj >= 0 && nj < COLS && ni >= 0 && ni < ROWS
            && boardAction[ni][nj] != '1'
            && board[ni][nj] == ('' + turnIndexBeforeMove)) {
            //console.log("points at (", i, ",", j, ") adjacent with:(", ni, ",", nj, ")");
            return false;
          }
        }
      }
    }
    return true;
  }

  export function getBoardAnchor(board: Board, anchorStatus: boolean[][], turnIndexBeforeMove: number): Board {
    let boardAnchor: Board = [];
    // fill the shape matrix into the board;
    for (let i = 0; i < ROWS; i++) {
      boardAnchor[i] = [];
      for (let j = 0; j < COLS; j++) {
        boardAnchor[i][j] = '';
      }
    }

    let possibleAnchors: number[] = gameLogic.getPossibleAnchor(board, turnIndexBeforeMove);
    //console.log("[getBoardAnchor]", possibleAnchors);

    //aux_printCoordinator(possibleAnchors);
    for (let i = 0; i < possibleAnchors.length; i++) {
      if (anchorStatus[turnIndexBeforeMove][possibleAnchors[i]]) {
        let coord: number[] = gameLogic.parseIJ(possibleAnchors[i])
        //console.log(coord);
        boardAnchor[coord[0]][coord[1]] = '1';
      }
    }
    //console.log(aux_printFrame(boardAnchor, COLS));

    return boardAnchor;
  }

  export function getPossibleAnchor(board: Board, turnIndexBeforeMove: number): number[] {
    let possibleAnchor: number[] = [];

    // 0. if not territory, anchor is init state
    if (noPreviousMove(board, turnIndexBeforeMove)) {
      //console.log("no previous move");
      possibleAnchor.push(STARTANCHOR[turnIndexBeforeMove]);
    } else {
      possibleAnchor = getRecomandAnchor(board, turnIndexBeforeMove);
    }
    //console.log(turnIndexBeforeMove);
    //console.log(possibleAnchor);
    return possibleAnchor;
  }

  export function checkLegalMove(board: Board, row: number, col: number,
    boardAction: Board, turnIndexBeforeMove: number): boolean {

    // 0. if not territory, anchor is init state
    let possibleAnchor: number[] = getPossibleAnchor(board, turnIndexBeforeMove);

    //console.log("possible Anchors for ", turnIndexBeforeMove, " :");
    //console.log(aux_printCoordinator(possibleAnchor));

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

    //console.log("Found anchor");
    // not conflict with existing teritory and not adjacent to teritory
    if (!checkSquareOverlap(board, boardAction) ||
      !checkSquareAdj(board, boardAction, turnIndexBeforeMove)) {
      return false;
    }

    return true;
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

  export function updateShapeStatus(shapeStatus: boolean[][], shapeId: number, turnIndexBeforeMove: number): boolean[][] {
    let ret = angular.copy(shapeStatus);
    ret[turnIndexBeforeMove][getShapeType(shapeId)] = false;
    return ret;
  }

  export function updatePlayerStatus(playerStatus: boolean[], turnIndexBeforeMove: number, nextstep: { invalidAnchors: number[], board: Board, valid: boolean }): boolean[] {
    let ret = angular.copy(playerStatus);

    if (nextstep.valid === false) {
      ret[turnIndexBeforeMove] = false;
    }

    return ret;
  }

  export function getErrorMsg(error: number): string {
    let errMsg: string = "";
    let errMsgs: string[] = ["Invalid Shapes. ", "Piece out of board. ", "Place piece to touch your corner and never touch your side. ", "Pieces overlap. "];
    for (let i = 0; i < 4; i++) {
      let e = error >> i;
      if ((e & 0x1) == 1) {
        errMsg += errMsgs[i];
      }
    }
    return errMsg;
  }
  export function checkLegalMoveForGame(board: Board, row: number, col: number, turnIndexBeforeMove: number, shapeId: number, checkStrong: boolean): boolean {
    //console.log("[checkLegalMoveForGame]col:", col, " row", row, " SI:", shapeId);
    if (shapeId === undefined || shapeId < 0 || shapeId >= SHAPEMAX) {
      return false;
    }

    let shape: Shape = getShapeFromShapeID(shapeId);

    if (!checkValidShapePlacement(row, col, shape)) {
      return false;
    }

    let boardAction: Board = getBoardAction(row, col, shape, ROWS, COLS);
    if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
      if (checkStrong) {
        return false;
      }
    }

    // add checkStrong here to make overlap possible, add check in the confirm phase
    if (!checkSquareOverlap(board, boardAction)) {
      if (checkStrong) {
        return false;
      }
    }

    return true;
  }

  /**
   * 
   * @param board 
   * @param row 
   * @param col 
   * @param turnIndexBeforeMove 
   * @param shapeId 
   * @param checkStrong 
   * 
   * @return error: 8 (overlap) 4 (illegal) 2 (out of board) 1 (invalid shape)
   */
  export function checkLegalMoveForGameWitError(board: Board, row: number, col: number, turnIndexBeforeMove: number, shapeId: number, checkStrong: boolean): { valid: boolean, error: number } {
    //console.log("[checkLegalMoveForGame]col:", col, " row", row, " SI:", shapeId);
    let error: number = 0;
    if (shapeId === undefined || shapeId < 0 || shapeId >= SHAPEMAX) {
      error += 1;
      return { valid: false, error: error };
    }

    let shape: Shape = getShapeFromShapeID(shapeId);

    if (!checkValidShapePlacement(row, col, shape)) {
      error += 2;
      return { valid: false, error: error };
    }

    let boardAction: Board = getBoardAction(row, col, shape, ROWS, COLS);
    if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
      error += 4;
      if (checkStrong) {
        return { valid: false, error: error };
      }
    }

    // add checkStrong here to make overlap possible, add check in the confirm phase
    if (!checkSquareOverlap(board, boardAction)) {
      error += 8;
      if (checkStrong) {
        return { valid: false, error: error };
      }
    }

    return { valid: true, error: error };
  }

  /** return true if all the players die */
  export function endOfMatch(playerStatus: boolean[]) {
    for (let i = 0; i < playerStatus.length; i++) {
      if (playerStatus[i]) {
        return false;
      }
    }
    return true;
  }

  function mapShapeToPos(frow: number, fcol: number, board: Board,
    shape: Shape, frameX: number, frameY: number, turnIndexBeforeMove: number): { board: Board, valid: boolean, row: number, col: number } {

    let CTR = Math.floor(SHAPEWIDTH / 2);
    let row: number = frow - frameX + CTR;
    let col: number = fcol - frameY + CTR;

    if (!checkValidShapePlacement(row, col, shape)) {
      return { board: [], valid: false, row: -1, col: -1 };
    }

    let boardAction: Board = getBoardAction(row, col, shape, ROWS, COLS);

    //TODO export a function checkLealMove(board, row, col, turnIndexBeforeMove) // add boardAction
    if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
      return { board: [], valid: false, row: -1, col: -1 };
    }

    return { board: boardAction, valid: true, row: row, col: col };
  }

  function getAllCorners(shape: Shape): number[][] {
    let corners: number[][] = [];

    let dirx: number[] = [-1, 0, 1, 0];
    let diry: number[] = [0, -1, 0, 1];
    for (let i = 0; i < SHAPEWIDTH; i++) {
      for (let j = 0; j < SHAPEHEIGHT; j++) {
        let empty: number[] = [0, 0, 0, 0]
        if (shape.frame[i][j] === '1') {
          for (let t = 0; t < 4; t++) {
            let nx: number = dirx[t] + i;
            let ny: number = diry[t] + j;
            if (nx < 0 || nx > SHAPEWIDTH - 1 || ny < 0 || ny > SHAPEHEIGHT - 1 || shape.frame[nx][ny] === '0') {
              empty[t] = 1;
            }
          }
        }
        for (let t = 0; t < 4; t++) {
          if (empty[t] === 1 && empty[(t + 1) % 4] === 1) {
            corners.push([i, j]);
          }
        }
      }
    }

    return corners;
  }

  export function getNextPossibleMoveList(prevAnchor: boolean[][], board: Board, shapeStatus: boolean[][], turnIndexBeforeMove: number):
    { invalidAnchors: number[], valid: boolean, moves: { row: number, col: number, shapeId: number }[] } {

    let retList: { row: number, col: number, shapeId: number }[] = [];
    let anchors: number[] = getRecomandAnchor(board, turnIndexBeforeMove);
    let freeShapeIds: number[] = [];
    let allshape: AllShape = getInitShapes();
    let invalidAnchors: number[] = [];

    for (let i = 0; i < SHAPENUMBER; i++) {
      if (shapeStatus[turnIndexBeforeMove][i] === true) {
        freeShapeIds.push(i);
      }
    }

    let hasMove = false;
    for (let t = 0; t < anchors.length; t++) {
      let anchor = anchors[t];
      if (prevAnchor[turnIndexBeforeMove][anchor] === false) {
        continue;
      }

      let row: number = parseIJ(anchor)[0];
      let col: number = parseIJ(anchor)[1];

      for (let id = 0; id < freeShapeIds.length; id++) {
        let shapeId: number = freeShapeIds[id];
        let stdShape: Shape = allshape[shapeId];

        for (let op of stdShape.ops) {
          let shape: Shape = getShapeByTypeAndOperation(freeShapeIds[id], op);
          let realShapeId: number = shapeId * OPERATIONS + op;
          let corners: number[][] = getAllCorners(shape);
          for (let c = 0; c < corners.length; c++) {
            let frameX: number = corners[c][0];
            let frameY: number = corners[c][1];
            let action = mapShapeToPos(row, col, board, shape, frameX, frameY, turnIndexBeforeMove);
            if (action.valid) {
              hasMove = true;
              console.log()
              retList.push({ row: action.row, col: action.col, shapeId: realShapeId });
            }
          }
        }
      }
      // add it to invalid anchor, and purning these anchors for latter search
      prevAnchor[turnIndexBeforeMove][row * COLS + col] = false;
      invalidAnchors.push(row * COLS + col);
    }

    let unique:{[id:number]:number;} = {};
    let distinct = [];
    for (let move of retList) {
      let moveId:number = move.shapeId * ROWS * COLS + move.row * ROWS + move.col;
      if (unique[moveId] === undefined || unique[moveId] === 0) {
        distinct.push(move);
      }
      unique[moveId] = 1;
    }

    return { invalidAnchors: invalidAnchors, valid: hasMove, moves: distinct };
  }

  /**
   * find a possible next move for this turn user
   * @param board 
   * @param shapeStatus 
   * @param turnIndexBeforeMove 
   * @return board:Board,valid:boolean, the board in return is an boardAction only contains the shape
   */
  export function getNextPossibleShape(prevAnchor: boolean[][], board: Board, shapeStatus: boolean[][], turnIndexBeforeMove: number):
    { invalidAnchors: number[], board: Board, valid: boolean, shapeId: number, row: number, col: number } {

    let retBoard: Board = [];
    let anchors: number[] = getRecomandAnchor(board, turnIndexBeforeMove);
    let freeShapeIds: number[] = [];
    let allshape: AllShape = getInitShapes();
    let invalidAnchors: number[] = [];

    for (let i = 0; i < SHAPENUMBER; i++) {
      if (shapeStatus[turnIndexBeforeMove][i] === true) {
        freeShapeIds.push(i);
      }
    }

    let hasMove = false;
    for (let t = 0; t < anchors.length; t++) {
      let anchor = anchors[t];
      if (prevAnchor[turnIndexBeforeMove][anchor] === false) {
        continue;
      }

      let row: number = parseIJ(anchor)[0];
      let col: number = parseIJ(anchor)[1];

      // TODO shuffle and make random
      for (let id = 0; id < freeShapeIds.length; id++) {
        let shapeId: number = freeShapeIds[id];
        let stdShape: Shape = allshape[shapeId];

        for (let op of stdShape.ops) {
          //for (let op = 0; op < OPERATIONS; op++) {
          //et shapeId: number = freeShapeIds[id];
          let shape: Shape = getShapeByTypeAndOperation(freeShapeIds[id], op);
          let realShapeId: number = shapeId * OPERATIONS + op;
          let corners: number[][] = getAllCorners(shape);
          for (let c = 0; c < corners.length; c++) {
            let frameX: number = corners[c][0];
            let frameY: number = corners[c][1];
            let action = mapShapeToPos(row, col, board, shape, frameX, frameY, turnIndexBeforeMove);
            if (action.valid) {
              //console.log("action");//~
              //console.log(action);//~
              return { invalidAnchors: invalidAnchors, board: angular.copy(action.board), valid: action.valid, shapeId: realShapeId, row: action.row, col: action.col };
            }
          }
        }
      }
      // add it to invalid anchor, and purning these anchors for latter search
      prevAnchor[turnIndexBeforeMove][row * COLS + col] = false;
      invalidAnchors.push(row * COLS + col);
    }

    return { invalidAnchors: invalidAnchors, board: retBoard, valid: false, shapeId: -1, row: -1, col: -1 };
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col with shapeId.
   * row and col is the center point of the shape.
   * shapdId is a mix of different shape and the rotation of the shape, starts from 1, 0 is a initial
   */
  export function createMove(
    stateBeforeMove: IState, row: number, col: number, shapeId: number, turnIndexBeforeMove: number): IMove {

    console.log("player ", turnIndexBeforeMove, "'s turn");

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
    // use in game.ts
    if (!checkValidShapePlacement(row, col, shape)) {
      throw new Error("Shape not on the board");
    }

    let boardAction: Board = getBoardAction(row, col, shape, ROWS, COLS);

    //console.log("boardAction:")
    //console.log(aux_printFrame(boardAction, COLS))

    let board: Board = stateBeforeMove.board;

    let playerStatus: boolean[] = stateBeforeMove.playerStatus;

    //TODO export a function checkLealMove(board, row, col, turnIndexBeforeMove) // add boardAction
    if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
      throw new Error("One can only make a move in an empty position!");
    }

    // TODO change to IsGameOver function IsGameOver(board, boardAction, turnIndexBeforeMove)
    if (getWinner(board, playerStatus) !== '' || isTie(board, playerStatus)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    //~

    let boardAfterMove = angular.copy(board);
    shapePlacement(boardAfterMove, boardAction, turnIndexBeforeMove);
    let shapeStatusAfterMove = updateShapeStatus(shapeStatus, shapeId, turnIndexBeforeMove);
    console.log("boardAfterMove:")
    console.log(aux_printFrame(boardAfterMove, COLS))
    console.log(aux_printArray(shapeStatusAfterMove));

    let anchorStatus: boolean[][] = stateBeforeMove.anchorStatus;
    //TODO implement the last check
    let nextstep = getNextPossibleShape(anchorStatus, boardAfterMove, shapeStatusAfterMove, turnIndexBeforeMove);
    let anchorStatusAfterMove = angular.copy(anchorStatus);
    for (let anchorPos of nextstep.invalidAnchors) {
      anchorStatus[turnIndexBeforeMove][anchorPos] = false;
    }

    console.log(boardAfterMove);
    console.log("possibleMove");
    console.log(nextstep.valid);
    console.log("board")
    console.log(nextstep.board);
    console.log("anchor status");
    console.log(anchorStatusAfterMove);
    console.log(aux_printFrame(nextstep.board, ROWS));
    console.log("anchor status");
    console.log(anchorStatus);

    let playerStatusAfterMove = updatePlayerStatus(playerStatus, turnIndexBeforeMove, nextstep);

    let winner = getWinner(boardAfterMove, playerStatusAfterMove);
    let endMatchScores: number[];
    let turnIndex: number;

    // CHANGE here
    if (winner !== '' || isTie(boardAfterMove, playerStatusAfterMove)) {
      // Game over.
      turnIndex = -1;

      // TODO add endScore Function, the score is measured by the blocks unused.
      endMatchScores = getScore(boardAfterMove);
      //~
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      // TODO change to four player
      turnIndex = getNextTurn(turnIndexBeforeMove, playerStatus);
      //turnIndex = (turnIndexBeforeMove + 1) % GROUPNUMBER;
      if (turnIndex == -1) {
        endMatchScores = getScore(boardAfterMove);
      } else {
        endMatchScores = null;
      }
    }
    //~

    // Here delta should be all the blocks covered by the new move
    let delta: BoardDelta = { row: row, col: col, shapeId: shapeId };
    //~
    let state: IState = {
      delta: delta,
      board: boardAfterMove,
      shapeStatus: shapeStatusAfterMove,
      playerStatus: playerStatusAfterMove,
      anchorStatus: anchorStatusAfterMove,
    };
    return { endMatchScores: endMatchScores, turnIndex: turnIndex, state: state };
  }

  export function createInitialMove(): IMove {
    return {
      endMatchScores: null, turnIndex: 0,
      state: getInitialState()
    };
  }

  function getNextTurn(turnIndexBeforeMove: number, playerStatus: boolean[]): number {
    let turnIdx = -1;
    for (let i = 0; i < GROUPNUMBER; i++) {
      let t = (turnIndexBeforeMove + i + 1) % GROUPNUMBER;
      if (playerStatus[t] == true) {
        return t;
      }
    }
    return turnIdx;
  }

  function transformMarginsToAbosolute(margins: number[]) {
    let ret: number[] = [];
    let CTR = Math.floor(SHAPEWIDTH / 2);
    ret[0] = CTR - margins[0];
    ret[1] = CTR - margins[1];
    ret[2] = CTR + margins[2];
    ret[3] = CTR + margins[3];

    return ret;
  }

  export function getNextShapeFrom(shapeBoard: ShapeBoard, ColIdx: number) {
    let oH: number = shapeBoard.board.length;
    let oW: number = oH > 0 ? shapeBoard.board[0].length : 0;

    let start: number = -1;
    let i = ColIdx;
    for (; i < oW; i++) {
      let isBlank = true;
      for (let j = 0; j < oH; j++) {
        if (shapeBoard.board[j][i] === "1") {
          isBlank = false;
          break;
        }
      }
      if (!isBlank && start === -1) {
        start = i;
        continue;
      }
      if (isBlank && start > 0 && (i - 1 > start)) {
        return { start: start, end: i - 1 };
      }
    }
    return { start: start, end: i };
  }

  // get ShapeBoard information
  export function getAllShapeMatrix_hardcode(): ShapeBoard {
    let shapeBoard: ShapeBoard = { board: [], cellToShape: [], shapeToCell: [] };
    shapeBoard = {
      board: [
        ['0', '0', '0', '1', '0', '0', '0', '1', '1', '0', '0', '0', '1', '1', '0', '0', '0', '1', '1', '1', '0', '0', '0'],
        ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
        ['1', '1', '0', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0', '0', '1', '1'],
        ['1', '1', '0', '0', '1', '1', '1', '0', '0', '1', '1', '1', '1', '0', '0', '1', '1', '1', '0', '0', '1', '1', '0'],
        ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
        ['0', '0', '0', '0', '0', '0', '1', '0', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '1'],
        ['1', '0', '0', '0', '0', '0', '1', '0', '0', '1', '0', '0', '0', '0', '1', '1', '1', '0', '1', '1', '1', '0', '1'],
        ['1', '1', '1', '1', '0', '1', '1', '1', '0', '1', '1', '1', '0', '1', '1', '0', '0', '0', '1', '0', '0', '0', '1'],
        ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1'],
        ['1', '0', '0', '0', '1', '1', '0', '1', '1', '0', '0', '0', '1', '1', '0', '0', '1', '0', '0', '0', '0', '0', '1'],
        ['1', '1', '0', '1', '1', '0', '0', '1', '0', '0', '0', '1', '1', '0', '0', '1', '1', '1', '0', '0', '1', '0', '0'],
        ['1', '1', '0', '1', '0', '0', '0', '1', '1', '0', '0', '0', '1', '0', '0', '0', '1', '0', '0', '1', '1', '1', '1']
      ],
      shapeToCell: [
        [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 0 }, { x: 3, y: 1 }], // 0
        [{ x: 0, y: 3 }], // 1
        [{ x: 2, y: 5 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }], // 2
        [{ x: 0, y: 7 }, { x: 0, y: 8 }],  // 3
        [{ x: 3, y: 9 }, { x: 3, y: 10 }, { x: 3, y: 11 }, { x: 3, y: 12 }], // 4
        [{ x: 0, y: 12 }, { x: 0, y: 13 }, { x: 1, y: 13 }], // 5
        [{ x: 2, y: 17 }, { x: 3, y: 15 }, { x: 3, y: 16 }, { x: 3, y: 17 }], // 6
        [{ x: 0, y: 17 }, { x: 0, y: 18 }, { x: 0, y: 19 }], // 7
        [{ x: 2, y: 21 }, { x: 2, y: 22 }, { x: 3, y: 20 }, { x: 3, y: 21 }], // 8
        [{ x: 6, y: 0 }, { x: 7, y: 0 }, { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }], // 9
        [{ x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 }], // 10
        [{ x: 5, y: 9 }, { x: 6, y: 9 }, { x: 7, y: 9 }, { x: 7, y: 10 }, { x: 7, y: 11 }], // 11
        [{ x: 6, y: 14 }, { x: 6, y: 15 }, { x: 6, y: 16 }, { x: 7, y: 13 }, { x: 7, y: 14 }], // 12
        [{ x: 5, y: 20 }, { x: 6, y: 18 }, { x: 6, y: 19 }, { x: 6, y: 20 }, { x: 7, y: 18 }], // 13
        [{ x: 5, y: 22 }, { x: 6, y: 22 }, { x: 7, y: 22 }, { x: 8, y: 22 }, { x: 9, y: 22 }], // 14
        [{ x: 9, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 1 }, { x: 11, y: 0 }, { x: 11, y: 1 }], // 15
        [{ x: 9, y: 4 }, { x: 9, y: 5 }, { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 11, y: 3 }], // 16
        [{ x: 9, y: 7 }, { x: 9, y: 8 }, { x: 10, y: 7 }, { x: 11, y: 7 }, { x: 11, y: 8 }], // 17
        [{ x: 9, y: 12 }, { x: 9, y: 13 }, { x: 10, y: 11 }, { x: 10, y: 12 }, { x: 11, y: 12 }], // 18
        [{ x: 9, y: 16 }, { x: 10, y: 15 }, { x: 10, y: 16 }, { x: 10, y: 17 }, { x: 11, y: 16 }], // 19
        [{ x: 10, y: 20 }, { x: 11, y: 19 }, { x: 11, y: 20 }, { x: 11, y: 21 }, { x: 11, y: 22 }] // 20
      ],
      cellToShape: [
        [-1, -1, -1, 1, -1, -1, -1, 3, 3, -1, -1, -1, 5, 5, -1, -1, -1, 7, 7, 7, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 0, -1, -1, -1, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6, -1, -1, -1, 8, 8],
        [0, 0, -1, -1, 2, 2, 2, -1, -1, 4, 4, 4, 4, -1, -1, 6, 6, 6, -1, -1, 8, 8, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, 10, -1, -1, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 13, -1, 14],
        [9, -1, -1, -1, -1, -1, 10, -1, -1, 11, -1, -1, -1, -1, 12, 12, 12, -1, 13, 13, 13, -1, 14],
        [9, 9, 9, 9, -1, 10, 10, 10, -1, 11, 11, 11, -1, 12, 12, -1, -1, -1, 13, -1, -1, -1, 14],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 14],
        [15, -1, -1, -1, 16, 16, -1, 17, 17, -1, -1, -1, 18, 18, -1, -1, 19, -1, -1, -1, -1, -1, 14],
        [15, 15, -1, 16, 16, -1, -1, 17, -1, -1, -1, 18, 18, -1, -1, 19, 19, 19, -1, -1, 20, -1, -1],
        [15, 15, -1, 16, -1, -1, -1, 17, 17, -1, -1, -1, 18, -1, -1, -1, 19, -1, -1, 20, 20, 20, 20]
      ]
    };
    return shapeBoard;
  }

  //TODO
  export function getAllShapeMatrix_withWidth(width: number): ShapeBoard {
    let shapeBoard: ShapeBoard = { board: [], cellToShape: [], shapeToCell: [] };
    shapeBoard.board = [];

    for (let i = 0; i < SHAPEHEIGHT; i++) {
      shapeBoard.board[i] = [];
      shapeBoard.cellToShape[i] = [];
    }

    let originSB = getAllShapeMatrix();

    let oH: number = originSB.board.length;
    let oW: number = oH > 0 ? originSB.board[0].length : 0;

    let idx: number = 0;
    let shapeId: number = 0;
    let row = 0;
    let col = 0;

    while (idx < oW) {
      let shapeIdx = getNextShapeFrom(originSB, 0);
      ////console.log("get ", shapeIdx.start, "-", shapeIdx.end);
      let len = shapeIdx.end - shapeIdx.start + 1;
      if (col + len >= width) {
        col = 0;
        row += SHAPEHEIGHT;
        for (let i = 0; i < SHAPEHEIGHT; i++) {
          shapeBoard.board[row + i] = [];
          shapeBoard.cellToShape[row + i] = [];
        }
      }
      for (let j = shapeIdx.start; j <= shapeIdx.end; j++) {
        for (let i = 0; i < SHAPEHEIGHT; i++) {
          shapeBoard.board[row + i][col] = originSB.board[i][j];
          shapeBoard.cellToShape[row + i][col] = originSB.cellToShape[i][j];
        }
        col++;
      }
      if (col < width) {
        for (let i = 0; i < SHAPEHEIGHT; i++) {
          shapeBoard.board[row + i][col] = '';
          shapeBoard.cellToShape[row + i][col] = -1;
        }
        col++;
      }
      idx = shapeIdx.end + 1;
    }

    return shapeBoard;
  }

  export function getAllShapeMatrix(): ShapeBoard {
    let shapeBoard: ShapeBoard = { board: [], cellToShape: [], shapeToCell: [] };
    shapeBoard.board = [];
    let allshape: AllShape = getInitShapes();
    let height = SHAPEHEIGHT;
    for (let i = 0; i < height; i++) {
      shapeBoard.board[i] = [];
      shapeBoard.cellToShape[i] = [];
    }

    let begin: number = 0;
    for (let k = 0; k < SHAPEHEIGHT; k++) {
      shapeBoard.board[k][begin] = '0';
      shapeBoard.cellToShape[k][begin] = -1;
    }
    begin++;

    for (let i = 0; i < allshape.length; i++) {
      let shape: Shape = allshape[i];
      let margins: number[] = getAllMargin(shape);
      let index: number[] = transformMarginsToAbosolute(margins)

      //console.log(aux_printArray(shape.frame))
      //console.log(index)

      shapeBoard.shapeToCell[i] = [];

      for (let j = index[1]; j <= index[3]; j++) {
        for (let k = 0; k < SHAPEHEIGHT; k++) {
          shapeBoard.board[k][begin] = shape.frame[k][j];
          if (shape.frame[k][j] === '1') {
            let pos: Point = { x: k, y: begin };
            shapeBoard.shapeToCell[i].push(pos);
            shapeBoard.cellToShape[k][begin] = shape.id;
          } else {
            shapeBoard.cellToShape[k][begin] = -1;
          }
        }
        begin++;
      }
      for (let k = 0; k < SHAPEHEIGHT; k++) {
        shapeBoard.board[k][begin] = '0';
        shapeBoard.cellToShape[k][begin] = -1;
      }
      begin++;
    }

    return shapeBoard;
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

    let boardAction: Board = getBoardAction(2, 2, shape, ROWS, COLS);
    console.log(aux_printFrame(boardAction, COLS))
  }

  export function forSimplePlayTestHtml() {
    let board: Board = getInitialBoard();
    let turnIndexBeforeMove: number = 0;

    shapePlacement(board, getBoardAction(2, 1, getShapeFromShapeID(40), ROWS, COLS), 1);

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

      let boardAction: Board = getBoardAction(row, col, shape, ROWS, COLS);
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

    let shapeBoard: ShapeBoard = getAllShapeMatrix_hardcode();
    console.log(aux_printArray(shapeBoard.board));
    console.log(shapeBoard.board.length, ",", shapeBoard.board[0].length);

    //let shapeBoardWWidth = getAllShapeMatrix_withWidth(20);
    //console.log(aux_printArray(shapeBoardWWidth.board));
    //console.log(shapeBoardWWidth.board.length, ",", shapeBoardWWidth.board[0].length);

    let aux_printcell = function (frame: any[][]): string {
      let ret: string = "";
      for (let i = 0; i < frame.length; i++) {
        for (let j = 0; j < frame[i].length; j++) {
          if (frame[i][j] == undefined) {
            frame[i][j] = " ";
          }
        }
      }
      for (let i = 0; i < frame.length; i++) {
        ret += frame[i].toString() + "\n\r";
      }
      return ret;
    }
    console.log(aux_printcell(shapeBoard.cellToShape));

    let aux_printshape = function (frame: Point[][]): string {
      let ret: string = "";
      for (let i = 0; i < frame.length; i++) {
        ret += i.toString() + ": ";
        for (let j = 0; j < frame[i].length; j++) {
          ret += "(" + frame[i][j].x + "," + frame[i][j].y + ") ";
        }
        ret += "\n\r";
      }
      return ret;
    }
    console.log(aux_printshape(shapeBoard.shapeToCell));
  }
}