// Game Logic for Pool Game

interface Point2D {
  X : number;
  Y : number;
}

enum AssignedBallType{
    Any,
    Stripes,
    Solids,
    Eight,
}

enum BallType {
  Cue,
  Stripes,
  Solids,
  Eight,
}

interface Pocket{
   readonly Position: Point2D;
   readonly Radius: number;
}

interface Board {
    readonly Height : number;
    readonly Width : number;
    readonly StartLine : number;
    readonly Pockets : Pocket[];

}

interface Ball {
  Position : Point2D;
  Pocketed : boolean;
  readonly Radius : number;
  readonly BallType : BallType;
  readonly Number : number;
}

interface ReturnState{
    PocketedBalls : Ball[];
    TouchedBall : Ball;
}

/**
 * To contain all information about the player
 */
interface Player {
  Assigned: AssignedBallType;       // which color is he assigned               
}

interface IState {
    SolidBalls: Ball[];
    StripedBalls: Ball[];
    EightBall: Ball;
    CueBall: Ball;
    CanMoveCueBall: boolean;
    PoolBoard: Board;
    
    FirstMove: boolean;

    Player1Color: AssignedBallType;
    Player2Color: AssignedBallType;

    DeltaBalls: ReturnState;
}

interface IMove {
  endMatchScores: number[];
  turnIndexAfterMove: number;
  stateAfterMove: IState;
}

module GameLogic{
    
  export function getInitialState(): IState {
        let blackX = 264;
        let blackY = 264;
        const BallRadius = 12;
        
        let CueBall:Ball={
            Position : {X:blackX,Y:blackY+400},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Cue,
                Number : 0
        }
//Create solid balls
        let solidBalls: Ball[]=[];
        let Ball1:Ball={
            Position : {X:blackX-2*BallRadius,Y:blackY-2*BallRadius*Math.sqrt(3)},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Solids,
                Number : 1
        }
        solidBalls.push(Ball1);

        let Ball2:Ball={
            Position : {X:blackX+4*BallRadius,Y:blackY-2*BallRadius*Math.sqrt(3)},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Solids,
                Number : 2
        }
        solidBalls.push(Ball2);

        let Ball3:Ball={
            Position : {X:blackX-3*BallRadius,Y:blackY-BallRadius*Math.sqrt(3)},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Solids,
                Number : 3
        }
        solidBalls.push(Ball3);

        let Ball4:Ball={
            Position : {X:blackX+BallRadius,Y:blackY-BallRadius*Math.sqrt(3)},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Solids,
                Number : 4
        }
        solidBalls.push(Ball4);

        let Ball5:Ball={
            Position : {X:blackX+2*BallRadius,Y:blackY},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Solids,
                Number : 5
        }
        solidBalls.push(Ball5);

        let Ball6:Ball={
            Position : {X:blackX-BallRadius,Y:blackY+BallRadius*Math.sqrt(3)},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Solids,
                Number : 6
        }
        solidBalls.push(Ball6);

        let Ball7:Ball={
            Position : {X:blackX,Y:blackY+2*BallRadius*Math.sqrt(3)},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Solids,
                Number : 7
        }
        solidBalls.push(Ball7);

        let EightBall:Ball={
            Position : {X:blackX,Y:blackY},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Eight,
                Number : 8
        }

        let StripeBalls: Ball[]=[];
        
        let Ball9:Ball={
            Position : {X:blackX-4*BallRadius,Y:blackY-2*BallRadius*Math.sqrt(3)},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Stripes,
                Number : 9
        }
        StripeBalls.push(Ball9);

        let Ball10:Ball={
            Position : {X:blackX,Y:blackY-2*BallRadius*Math.sqrt(3)},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Stripes,
                Number : 10
        }
        StripeBalls.push(Ball10);

        let Ball11:Ball={
            Position : {X:blackX+2*BallRadius,Y:blackY-2*BallRadius*Math.sqrt(3)},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Stripes,
                Number : 11
        }
        StripeBalls.push(Ball11);

        let Ball12:Ball={
            Position : {X:blackX-BallRadius,Y:blackY-BallRadius*Math.sqrt(3)},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Stripes,
                Number : 12
        }
        StripeBalls.push(Ball12);

        let Ball13:Ball={
            Position : {X:blackX+3*BallRadius,Y:blackY-BallRadius*Math.sqrt(3)},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Stripes,
                Number : 13
        }
        StripeBalls.push(Ball13);

        let Ball14:Ball={
            Position : {X:blackX-2*BallRadius,Y:blackY},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Stripes,
                Number : 14
        }
        StripeBalls.push(Ball14);

        let Ball15:Ball={
            Position : {X:blackX+BallRadius,Y:blackY+BallRadius*Math.sqrt(3)},
            Pocketed : false,
                Radius : BallRadius,
                BallType : BallType.Stripes,
                Number : 15
        }
        StripeBalls.push(Ball15);
        
        let PocketRadius = 1.5*BallRadius;

        let Pockets:Pocket[] = [];

        let Pocket1: Pocket = {
            Position: {X:48,Y:50},
            Radius: PocketRadius
        }
        Pockets.push(Pocket1);

        let Pocket2: Pocket = {
            Position: {X:40,Y:481},
            //Position: {X:48,Y:481},
            Radius: PocketRadius
        }
        Pockets.push(Pocket2);
    
        let Pocket3: Pocket = {
            Position: {X:48,Y:912},
            Radius: PocketRadius
        }
        Pockets.push(Pocket3);
    
        let Pocket4: Pocket = {
            Position: {X:482,Y:50},
            Radius: PocketRadius
        }
        Pockets.push(Pocket4);

        let Pocket5: Pocket = {
            Position: {X:490,Y:481},
            //Position: {X:482,Y:481},
            Radius: PocketRadius
        }
        Pockets.push(Pocket5);

        let Pocket6: Pocket = {
            Position: {X:482,Y:912},
            Radius: PocketRadius
        }
        Pockets.push(Pocket6);

        let PoolBoard: Board = {
            Height : 960,
            Width : 531,
            StartLine : CueBall.Position.Y,
            Pockets : Pockets,
        }

        let CanMoveCueBall = true;
        let FirstMove = true;
        let Player1Color = AssignedBallType.Any;
        let Player2Color = AssignedBallType.Any;
        let DeltaBalls = null;

        return { SolidBalls: solidBalls,
            StripedBalls: StripeBalls,
            EightBall: EightBall,
            CueBall: CueBall,
            CanMoveCueBall: CanMoveCueBall,
            PoolBoard: PoolBoard,
            FirstMove: FirstMove,
            Player1Color: Player1Color,
            Player2Color: Player2Color,
            DeltaBalls: null
        }
    }

/**
 * This function takes the "stateAfterMove" and uses it to create a new State that is passed back to 
 * the physics engine as an "IMove" object
 */

function isBallContained(ballNum:number, balls:Ball[]):number{
    let i=0;
    for(let ball of balls){
        if(ball.Number==ballNum){
            return i;
        }
        i++;    
    }
    return -1;
}

export function createMove(stateBeforeMove: IState, 
    stateAfterMove: IState, turnIndexBeforeMove: number, gameSettings: any): IMove {
    
    let nextMove: IMove;    // this will be returned as the next move
    stateAfterMove.CanMoveCueBall=false;    // discontinuing the use of CanMoveCueBall property if it was in use
/** FIRST SHOT AFTER MOVE
 * The following logic is ONLY for the move right after the "break" move
 * 0) Check if the BLACK ball is potted => call the state from getInitialState and keep the turn and return 
 *      ELSE
 *          nextMove.state will copy ALL contents from the stateAfterMove
 *          FirstMove=false AND:
 * 1) Check if the cue ball is potted => return "CanMoveCueBall" and change the turn
 * 2) Check if no balls are touched => return "CanMoveCueBall" and change the turn
 * 3) Check if no balls are potted => change the turn
 * 4) Check if balls are potted => keep the turn
 */
    let pocketedBalls = stateAfterMove.DeltaBalls.PocketedBalls;
    let touchedFirst = stateAfterMove.DeltaBalls.TouchedBall;
    if(stateAfterMove.FirstMove){
        // 0)
        if(isBallContained(8,pocketedBalls)){
            nextMove.stateAfterMove = getInitialState();
            nextMove.turnIndexAfterMove = turnIndexBeforeMove;
            return nextMove;
        }   
        stateAfterMove.FirstMove=false;
        nextMove.stateAfterMove = stateAfterMove;   // copying the state into the returned IMove
        // 1) && 2)
        if((isBallContained(0,pocketedBalls)!=-1) || (touchedFirst==null)){
            nextMove.stateAfterMove.CanMoveCueBall=true;
            nextMove.turnIndexAfterMove = turnIndexBeforeMove+1%2;            
            return nextMove;
        }
        // 3)
        else if(pocketedBalls.length==0){
            nextMove.turnIndexAfterMove = turnIndexBeforeMove+1%2;            
            return nextMove;
        }
        // 4)
        else if(pocketedBalls.length>0){
            nextMove.turnIndexAfterMove = turnIndexBeforeMove;
            return nextMove;
        }
        // Unexpected condition
        else{
            throw new TypeError("Unexpected condition during Break Shot");
        }        
    }

/** REGULAR SHOT
 * The following logic is ONLY for the move after the "break" move
 * 1) If BLACK ball is potted:       // WIN or LOSS situation
 *      a) if cue ball is also pocketed => this player loses
 *      b) if player has other assigned balls left or is not assigned ANY color => this player loses
 *      c) if there are any 'assigned color' balls pocketed after the BLACK in the pocketed queue => this player loses
 *      d) if touchedFirst != assignedcolor OR !=BLACK => this player loses
 *      e) if there are any balls potted after the BLACK => this player loses
 *      f) this player Wins
 * 
 * 2) If no ball touched => return "CanMoveCueBall" and change the turn
 * 3) If illegal ball touched (take care of ANY) => return "CanMoveCueBall" and change the turn
 * 4) If no ball potted => change the turn
 * 5) If Balls are potted:
 *      a) if cue ball potted => return "CanMoveCueBall" and change the turn
 *      b) if 'color not assigned' => assign the first ball potted, player keeps the turn
 *      c) if ONLY illegal balls potted => ONLY change the turn ELSE keep the turn *     
 * 6) If the player has pottedd all the his assigned balls, assign him the BallType 8 ; don't "RETURN"" though
 */
    else{
        //~~ storing the player's color and his assigned balls
        function getMyUsableColor(color:AssignedBallType):BallType{
            if(color==AssignedBallType.Any)
                return null;
            else if(color==AssignedBallType.Solids)
                return BallType.Solids;
            else if(color==AssignedBallType.Stripes)
                return BallType.Stripes;
            else if(color==AssignedBallType.Eight)
                return BallType.Eight;
            return null;
        }
        //~~ Reverse of the above function
        function getMyAssignableColor(col:BallType):AssignedBallType{
            if(col==BallType.Solids)
                return AssignedBallType.Solids;
            else if(col==BallType.Stripes)
                return AssignedBallType.Stripes;
            else if(col==BallType.Eight)
                return AssignedBallType.Eight;
            return null;
        }
        //~~ checking if a particular colored ball is pocketed
        function isColorBallPocketed(usableColor:BallType, balls:Ball[]):boolean{
            for(let ball of balls){
                if(ball.BallType==myUsableColor)
                    return true;
            }
            return false;
        }
        var myColor:AssignedBallType;   // the player's color of type AssignedBallType
        var cueBallPotted:boolean=false;    // whether or not the cueBall was potted in this turn
        if(isBallContained(0,pocketedBalls)!=-1)    // Storing whether the cue ball is potted or not in a boolean variable/flag
            cueBallPotted = true;
        if(turnIndexBeforeMove==0){
            myColor = stateAfterMove.Player1Color;
        }else{
            myColor = stateAfterMove.Player2Color;
        }
        var myUsableColor = getMyUsableColor(myColor);// the player's color of type BallType
        var myBalls:Ball[], yourBalls:Ball[], myRemainingBalls:Ball[];
        if(myColor!=AssignedBallType.Any){
            if(myColor==AssignedBallType.Solids){
                myBalls = stateAfterMove.SolidBalls;
                yourBalls = stateAfterMove.StripedBalls;
            }
            else{
                myBalls = stateAfterMove.StripedBalls;
                yourBalls = stateAfterMove.SolidBalls;
            }
            for(let ball of myBalls){
                if(!ball.Pocketed)
                    myRemainingBalls.push(ball);
            }
        }
        //  6)
        if(myRemainingBalls.length==0){
            if(turnIndexBeforeMove==0)
                nextMove.stateAfterMove.Player1Color=AssignedBallType.Eight;
            else
                nextMove.stateAfterMove.Player2Color=AssignedBallType.Eight;
        }
        //  1)
        var blackIndex = isBallContained(8,pocketedBalls);
        if(blackIndex != -1){
            // a)
            if(isBallContained(0,pocketedBalls)!=-1){
                if(turnIndexBeforeMove==0)
                    nextMove.endMatchScores=[0,1];
                else
                    nextMove.endMatchScores=[1,0];
                return nextMove;
            }
            // b)
            else if(myColor == AssignedBallType.Any || myRemainingBalls.length!=0){
                if(turnIndexBeforeMove==0)
                    nextMove.endMatchScores=[0,1];
                else
                    nextMove.endMatchScores=[1,0];
                return nextMove;
            }
            // c), e)
            else if(blackIndex != pocketedBalls.length-1){
                if(turnIndexBeforeMove==0)
                    nextMove.endMatchScores=[0,1];
                else
                    nextMove.endMatchScores=[1,0];
                return nextMove;
            }
            // d)
            else if(!(touchedFirst.BallType==myUsableColor || touchedFirst.BallType==BallType.Eight)){
                if(turnIndexBeforeMove==0)
                    nextMove.endMatchScores=[0,1];
                else
                    nextMove.endMatchScores=[1,0];
                return nextMove;
            }
            // f)
            else if(pocketedBalls.length==1){
                if(turnIndexBeforeMove==0)
                    nextMove.endMatchScores=[1,0];
                else
                    nextMove.endMatchScores=[0,1];
                return nextMove;
            }
            // default unhandled condition wherer the current player loses
            else{
                throw new TypeError("Unexpected condition during Winner determination");
            }
        }
        else{       // BLACK BALL not pocketed yet
            //  2), 3)
            if(touchedFirst==null || (myColor!=AssignedBallType.Any && touchedFirst.BallType != myUsableColor)){
                nextMove.stateAfterMove.CanMoveCueBall=true;
                nextMove.turnIndexAfterMove = turnIndexBeforeMove+1%2;            
                return nextMove;
            }
            // 4)
            else if(pocketedBalls.length==0){
                nextMove.turnIndexAfterMove = turnIndexBeforeMove+1%2;            
                return nextMove;
            }
            // 5)
            else if(pocketedBalls.length>0){
                // a)
                if(cueBallPotted){
                    nextMove.stateAfterMove.CanMoveCueBall=true;
                    nextMove.turnIndexAfterMove = turnIndexBeforeMove+1%2;            
                    return nextMove;
                }
                // b)
                else if(myColor==AssignedBallType.Any){
                    nextMove.turnIndexAfterMove = turnIndexBeforeMove;
                    //~~ Assigning the player his color
                    if(turnIndexBeforeMove==0)
                        nextMove.stateAfterMove.Player1Color = getMyAssignableColor(pocketedBalls[0].BallType);
                    else
                        nextMove.stateAfterMove.Player1Color = getMyAssignableColor(pocketedBalls[0].BallType);
                    return nextMove;
                }
                // c)
                else if(isColorBallPocketed(myUsableColor,pocketedBalls)){
                    nextMove.turnIndexAfterMove = turnIndexBeforeMove;             // keep the turn
                    return nextMove;
                }
                else if(!isColorBallPocketed(myUsableColor,pocketedBalls)){
                    nextMove.stateAfterMove.CanMoveCueBall=true;
                    nextMove.turnIndexAfterMove = turnIndexBeforeMove+1%2;            
                    return nextMove;
                }
                // default unhandled condition
                else{
                    throw new TypeError("Unexpected condition during next turn assignment");
                }
            }
        }
    }
    return nextMove;
}
}