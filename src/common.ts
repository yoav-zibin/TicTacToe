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
  ROLL_DICE,
  BUILD,
  DEVCARD,
  TRADE,
  ROBBER_EVENT,
  ROB_PLAYER,
  TRANSACTION_WITH_BANK,
  WIN,

  SIZE
}

type PioBoard = Hex[][];
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

interface PioBoardDelta {
  board: PioBoard;
  players: Players;
  bank: Bank;
  awards: Awards;
  diceRolled: boolean;
  devCardsPlayed: boolean;
}

interface PioIState {
  board: PioBoard;
  players: Players;
  bank: Bank;
  awards: Awards;
  diceRolled: boolean;
  devCardsPlayed: boolean;
  delta: PioBoardDelta;
}


