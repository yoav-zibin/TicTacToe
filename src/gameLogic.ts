module gameLogic {
  export const ROWS = 7;
  export const COLS = 7;
  export const NUM_PLAYERS = 4;

  function getInitialBoard(): Board {
    let board: Board = [];

    //TODO: Shuffle & terrains
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

  function getInitialRobber(board: Board): Robber {
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

    return { row: row, col: col};
  }

  export function getInitialState(): IState {
    let board: Board = getInitialBoard();
    let robber: Robber = getInitialRobber(board);

    return {
      board: board,
      dices: [1, 1],
      players: getInitialPlayers(),
      bank: getInitialBank(),
      awards: getInitialAwards(),
      robber: robber,
      diceRolled: false,
      devCardsPlayed: false,
      delta: null,
      moveType: MoveType.INIT,
      eventIdx: -1
    };
  }

  /**
   * Validation logics
   */
  function rollDice(prevState: IState, nextState: IState, idx: number): void {
    if (prevState.diceRolled) {
      throw new Error('Dices already rolled');
    }
  }

  function checkRobberEvent(prevState: IState, nextState: IState, idx: number): void {
    let prevSum: number = 0;
    let nextSum: number = 0;
    for (let i = 0; i < Resource.SIZE; i++) {
      prevSum += prevState.players[idx].resources[i];
      nextSum += nextState.players[idx].resources[i];
    }

    if (prevSum > 7 && nextSum > prevSum / 2) {
      throw new Error('Need to toss half of resource cards');
    }
  }

  function checkRobberMove(prevState: IState, nextState: IState, idx: number): void {
    if (angular.equals(prevState.robber, nextState.robber)) {
      throw new Error('Need to move robber');
    }
  }

  function checkResources(resources: Resources): void {
    for (let i = 0; i < Resource.SIZE; i++) {
      if (resources[i] < 0) {
        throw new Error('Insufficient resources');
      }
    }
  }

  function checkTradeResourceWithBank(prevState: IState, nextState: IState, idx: number): void {
    if (!prevState.diceRolled) {
      throw new Error('Need to roll dices first');
    }
    let selling = {item: Resource.Dust, num: 0};
    let buying = {item: Resource.Dust, num: 0};

    checkResources(nextState.players[idx].resources);

    for (let i = 0; i < Resource.SIZE; i++) {
      if (nextState.players[idx].resources[i] < prevState.players[idx].resources[i]) {
        selling = {
          item: i,
          num: prevState.players[idx].resources[i] - nextState.players[idx].resources[i]
        };
      }
      if (nextState.players[idx].resources[i] > prevState.players[idx].resources[i]) {
        buying = {
          item: i,
          num: nextState.players[idx].resources[i] - prevState.players[idx].resources[i]
        };
      }
    }
    if (selling.item === buying.item) {
      throw new Error('Cannot trade the same resources');
    }
    //TODO: Need to integrate with harbors
    if (buying.num * 4 !== selling.num) {
      throw new Error('Wrong trading ratio');
    }
  }

  /**
  * XXX: Assuming UI will disable this feature when bank has no dev cards
  */
  function checkBuildDevCards(prevState: IState, nextState: IState, idx: number): void {
    if (!prevState.diceRolled) {
      throw new Error('Need to roll dices first');
    }

    checkResources(nextState.players[idx].resources);
  }

  function checkPlayDevCard(prevState: IState, nextState: IState, idx: number): void {
    if (prevState.devCardsPlayed) {
      throw new Error('Already played development cards');
    }
    //TODO: Check when playing year of plenty
  }

  export function checkMoveOk(stateTransition: IStateTransition): void {

  }
}
