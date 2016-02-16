var Resource;
(function (Resource) {
    Resource[Resource["Brick"] = 0] = "Brick";
    Resource[Resource["Lumber"] = 1] = "Lumber";
    Resource[Resource["Wool"] = 2] = "Wool";
    Resource[Resource["Grain"] = 3] = "Grain";
    Resource[Resource["Ore"] = 4] = "Ore";
    Resource[Resource["Dust"] = 5] = "Dust";
    Resource[Resource["SIZE"] = 6] = "SIZE";
})(Resource || (Resource = {}));
var DevCard;
(function (DevCard) {
    DevCard[DevCard["Knight"] = 0] = "Knight";
    DevCard[DevCard["Monopoly"] = 1] = "Monopoly";
    DevCard[DevCard["RoadBuilding"] = 2] = "RoadBuilding";
    DevCard[DevCard["YearOfPlenty"] = 3] = "YearOfPlenty";
    DevCard[DevCard["VictoryPoint"] = 4] = "VictoryPoint";
    DevCard[DevCard["SIZE"] = 5] = "SIZE";
})(DevCard || (DevCard = {}));
var Construction;
(function (Construction) {
    Construction[Construction["Road"] = 0] = "Road";
    Construction[Construction["Settlement"] = 1] = "Settlement";
    Construction[Construction["City"] = 2] = "City";
    Construction[Construction["DevCard"] = 3] = "DevCard";
    Construction[Construction["SIZE"] = 4] = "SIZE";
})(Construction || (Construction = {}));
var MoveType;
(function (MoveType) {
    MoveType[MoveType["INIT"] = 0] = "INIT";
    MoveType[MoveType["ROLL_DICE"] = 1] = "ROLL_DICE";
    MoveType[MoveType["BUILD_ROAD"] = 2] = "BUILD_ROAD";
    MoveType[MoveType["BUILD_SETTLEMENT"] = 3] = "BUILD_SETTLEMENT";
    MoveType[MoveType["BUILD_CITY"] = 4] = "BUILD_CITY";
    MoveType[MoveType["BUILD_DEVCARD"] = 5] = "BUILD_DEVCARD";
    MoveType[MoveType["KNIGHT"] = 6] = "KNIGHT";
    MoveType[MoveType["PROGRESS"] = 7] = "PROGRESS";
    MoveType[MoveType["TRADE"] = 8] = "TRADE";
    MoveType[MoveType["ROBBER_EVENT"] = 9] = "ROBBER_EVENT";
    MoveType[MoveType["ROBBER_MOVE"] = 10] = "ROBBER_MOVE";
    MoveType[MoveType["ROB_PLAYER"] = 11] = "ROB_PLAYER";
    MoveType[MoveType["TRANSACTION_WITH_BANK"] = 12] = "TRANSACTION_WITH_BANK";
    MoveType[MoveType["WIN"] = 13] = "WIN";
    MoveType[MoveType["SIZE"] = 14] = "SIZE";
})(MoveType || (MoveType = {}));
//# sourceMappingURL=common.js.map