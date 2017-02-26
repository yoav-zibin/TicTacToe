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
  export const ROWS = 20;
  export const COLS = 20;
  export const OPERATIONS = 8;
  export const SHAPECOUNT = 20;
  export const SHAPEHEIGHT = 5;
  export const SHAPEWIDTH = 5;

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

  export function getInitShapes(): AllShape {
    let shapes: AllShape = [];
    // init all shapes 
    shapes = [{
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '1', '1', '1', '1'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '1', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '1', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '1', '1', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '1', '0', '0', '0'],
      ['0', '1', '1', '1', '1'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '1', '1'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '1'],
      ['0', '1', '1', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '0', '1', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '1', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '1', '1', '0', '0'],
      ['0', '1', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '1', '0'],
      ['0', '1', '1', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '1', '1', '1', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '0', '0', '0', '0']]
    },
    {
      id: -1, row: -1, column: -1,
      frame: [['0', '0', '0', '0', '0'],
      ['0', '0', '1', '0', '0'],
      ['0', '1', '1', '1', '1'],
      ['0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0']]
    }
    ];

    return shapes;
  }

  export function tmp_printFrame(frame: string[][]): string {
    let ret: string = "";
    for (let i = 0; i < SHAPEHEIGHT; i++) {
      ret += frame[i].toString() + "\n\r";
    }
    return ret;
  }

  export function getShapeByTypeAndOperation(shapeType: number, operationType: number): Shape {
    let allShapes: AllShape = getInitShapes();
    log.log("shapeType:", shapeType);
    let shape: Shape = allShapes[shapeType];
    let rotation: number = operationType % 4;
    // only vertical flip. Horizontal flip <=> vertical flip + 180 rotation.
    let flip: number = Math.floor(operationType / 4);

    let retShape: Shape = angular.copy(shape);

    log.log("shapeId=", shapeType);
    log.log("rotation=", rotation);
    log.log("flip=", flip);

    log.log("origin shape")
    console.log(tmp_printFrame(shape.frame));

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

    log.log("After flipping Allshape:")
    console.log(tmp_printFrame(retShape.frame));

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
      console.log("Before rotation:");
      console.log(tmp_printFrame(ret));
      for (let i = 0; i < rotation; i++) {
        console.log("Roate=",i);
        ret = rotate90(ret);
        console.log("After rotation:");
        console.log(tmp_printFrame(ret));
      }
      return ret;
    }

    retShape.frame = rotateAny(retShape, rotation);

    log.log("After rotation Allshape:")
    console.log(tmp_printFrame(retShape.frame));

    return retShape;
  }

  export function getShapeFromShapeID(shapeId: number): Shape {
    let operationType = shapeId % OPERATIONS;
    let shapeType = Math.floor(shapeId / OPERATIONS);

    return getShapeByTypeAndOperation(shapeType, operationType);
  }

  export function getInitialState(): IState {
    return { board: getInitialBoard(), delta: null };
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

    console.log("colSum=", colSum.toString());
    console.log("rowSum=", rowSum.toString());

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
    return ret;
  }

  export function getBoardAction(row: number, col: number, shape: Shape): Board {
    let board: Board = [];
    // TODO fill the shape matrix into the board;

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

  export function checkLegalMove(board: Board, row: number, col: number,
    boardAction: Board, turnIndexBeforeMove: number): boolean {

    let ret: boolean = false;

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

    let shape: Shape = getShapeFromShapeID(shapeId);

    // if the shape placement is not on the board
    if (!checkValidShapePlacement(row, col, shape)) {

    }

    let boardAction: Board = getBoardAction(row, col, shape);
    let board: Board = stateBeforeMove.board;

    // TODO change to checkLegalMove function checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)
    if (!checkLegalMove(board, row, col, boardAction, turnIndexBeforeMove)) {
      throw new Error("One can only make a move in an empty position!");
    }
    //~

    // TODO change to IsGameOver function IsGameOver(board, boardAction, turnIndexBeforeMove)
    if (getWinner(board) !== '' || isTie(board)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    //~


    let boardAfterMove = angular.copy(board);

    // TODO change to shapePlacement function, shapePlacement(boardAfterMove, row, col, shapeID, turnIndexBeforeMove)
    // TODO draw the actionBoard + turnIndexBeforeMove on the board;  
    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
    //~

    let winner = getWinner(boardAfterMove);
    let endMatchScores: number[];
    let turnIndex: number;
    if (winner !== '' || isTie(boardAfterMove)) {
      // Game over.
      turnIndex = -1;

      // TODO add endScore Function, the score is measured by the blocks unused.
      endMatchScores = winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0];
      //~

    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      turnIndex = 1 - turnIndexBeforeMove;
      endMatchScores = null;
    }
    // Here delta should be all the blocks covered by the new move
    let delta: BoardDelta = { row: row, col: col, shapeId: shapeId };
    //~
    let state: IState = { delta: delta, board: boardAfterMove };
    return { endMatchScores: endMatchScores, turnIndex: turnIndex, state: state };
  }

  export function createInitialMove(): IMove {
    return {
      endMatchScores: null, turnIndex: 0,
      state: getInitialState()
    };
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
    console.log(tmp_printFrame(shape.frame));

    let margins: number[] = getAllMargin(shape);
    log.log("margin=", margins)
  }
}