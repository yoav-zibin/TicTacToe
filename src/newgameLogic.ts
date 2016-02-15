module PiogameLogic {
  export const ROWS = 7;
  export const COLS = 7;
  export const NUM_PLAYERS = 4;

  function getInitialBoard(): PioBoard {
    let board: PioBoard = [];

    //TODO: Shuffle terrains
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        let edges: Edges = [-1, -1, -1, -1, -1, -1];
        let vertices: Vertices = [-1, -1, -1, -1, -1, -1];
        let hex: Hex = {
          label: Resource.Dust,
          edges: edges,
          vertices: vertices,
          rollNum: -1,
          tradingRatio: 4,
          hasRobber: false
        };
        board[i][j] = hex;
      }
    }

    return board;
  }

  function getInitialArray(size: number): number[] {
    let ret: number[] = [];
    for (let i = 0; i < size; i++) {
      ret[i] = 0;
    }

    return ret;
  }

  function getInitialPlayers(): Players {
    let players: Players = [];

    for (let i = 0; i < NUM_PLAYERS; i++) {
      players[i] = {
        id: i,
        points: 0,
        resources: getInitialArray(Resource.SIZE),
        devCards: getInitialArray(DevCard.SIZE),
        knightsPlayed: 0,
        longestRoad: 0,
        constructions: getInitialArray(Construction.SIZE)
      };
    }

    return players;
  }

  function getInitialBank(): Bank {
    let bank: Bank = {
      resources: getInitialArray(Resource.SIZE),
      devCards: getInitialArray(DevCard.SIZE)
    };

    //Assign total size of resources/devCards in bank according to rules
    for (let i = 0; i < Resource.SIZE; i++) {
      bank.resources[i] = 19;
    }
    for (let i = 0; i < DevCard.SIZE; i++) {
      switch (i) {
        case DevCard.Knight:
          bank.devCards[i] = 14;
        case DevCard.Monopoly:
          bank.devCards[i] = 2;
        case DevCard.RoadBuilding:
          bank.devCards[i] = 2;
        case DevCard.YearOfPlenty:
          bank.devCards[i] = 2;
        case DevCard.VictoryPoint:
          bank.devCards[i] = 5;
        default:
          break;
      }
    }

    return bank;
  }

  function getInitialAwards(): Awards {
    return {
      longestRoad: {
        player: -1,
        length: 4
      },
      largestArmy: {
        player: -1,
        num: 2
      }
    };
  }

  function getInitialRobber(board: PioBoard): Robber {
    let row: number = -1;
    let col: number = -1;

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (board[i][j].hasRobber) {
          row = i;
          col = j;
          break;
        }
      }
    }

    return {
      row: row,
      col: col
    };
  }

  export function getInitialState(): PioIState {
    let board: PioBoard = getInitialBoard();
    let robber: Robber = getInitialRobber(board);

    return {
      board: board,
      players: getInitialPlayers(),
      bank: getInitialBank(),
      awards: getInitialAwards(),
      robber: robber,
      diceRolled: false,
      devCardsPlayed: false,
      delta: null
    };
  }

  /**
   * Validation logics
   */
  export function PiocheckMoveOk(stateTransition: IStateTransition): void {

  }
}
