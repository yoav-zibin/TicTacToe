enum Resource {
  Brick,
  Lumber,
  Wool,
  Grain,
  Ore,
  Dust,

  SIZE
}

enum DevCard {
  Knight,
  Monopoly,
  RoadBuilding,
  YearOfPlenty,
  VictoryPoint,

  SIZE
}

enum Construction {
  Road,
  Settlement,
  City,
  DevCard,

  SIZE
}

enum MoveType {
  INIT,
  ROLL_DICE,
  BUILD,
  KNIGHT,
  PROGRESS,
  TRADE,
  ROBBER_EVENT,
  ROBBER_MOVE,
  ROB_PLAYER,
  TRANSACTION_WITH_BANK,
  WIN,

  SIZE
}

type Board = Hex[][];
type Players = Player[];
type Resources = number[];
type DevCards = number[];
type Dices = number[];
type Constructions = number[];
type Edges = number[];
type Vertices = number[];

interface Hex {
  label: Resource;
  edges: Edges;
  vertices: Vertices;
  rollNum: number;
  tradingRatio: number;
  hasRobber: boolean;
}

interface Player {
  id: number;
  points: number;
  resources: Resources;
  devCards: DevCards;
  knightsPlayed: number;
  longestRoad: number;
  constructions: Constructions;
}

interface Bank {
  resources: Resources;
  devCards: DevCards;
}

interface Robber {
  row: number;
  col: number;
}

interface Awards {
  longestRoad: {
    player: number,
    length: number
  },
  largestArmy: {
    player: number,
    num: number
  }
}

interface StateDelta {
  board: Board;
  dices: Dices;
  players: Players;
  bank: Bank;
  robber: Robber;
  awards: Awards;
  diceRolled: boolean;
  devCardsPlayed: boolean;
  moveType: MoveType;
  eventIdx: number;
}

interface IState extends StateDelta {
  delta: StateDelta;
}
