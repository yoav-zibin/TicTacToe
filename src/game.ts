interface SupportedLanguages {
  en: string, iw: string,
  pt: string, zh: string,
  el: string, fr: string,
  hi: string, es: string,
};

interface Translations {
  [index: string]: SupportedLanguages;
}

module game {
      export let rowsNum = 8;
      export let colsNum = 8;
      let selectedCells:any = [];       // record the clicked cells
      let gameArea:any = document.getElementById("gameArea");
      let draggingStartedRowCol:any = null; // The {row: YY, col: XX} where dragging started.
      let draggingPiece:any = null;
      let draggingPieceAvailableMoves:any = null;
      let nextZIndex = 61;
      let isPromotionModalShowing:any = {};
      let modalName = 'promotionModal';
      let animationEnded = false;
      let isComputerTurn = false;
      let board:any = null;
      let turnIndex = 0;
      let isUnderCheck:any = null;
      let canCastleKing:any = null;
      let canCastleQueen:any = null;
      let enpassantPosition:any = null;
      let deltaFrom:any = null;
      let deltaTo:any = null;
      let promoteTo:any = null;
      let isYourTurn:Boolean = false;
      let rotate:any = null;
      let player:any = null;

  export function init() {
	  registerServiceWorker();
	  //translate.setTranslations(getTranslations());
    //translate.setLanguage('en');
    resizeGameAreaService.setWidthToHeight(1);
    gameService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI,
	    gotMessageFromPlatform: null,
    });
    // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
    document.addEventListener("animationend", animationEndedCallback, false); // standard
    document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
    document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
    dragAndDropService.addDragListener("gameArea", handleDragEvent);
    gameArea = document.getElementById("gameArea");
  }
  
 
  function registerServiceWorker() {
    // I prefer to use appCache over serviceWorker (because iOS doesn't support serviceWorker, so we have to use appCache) I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
    if (!window.applicationCache && 'serviceWorker' in navigator) {
      let n:any = navigator;
      log.log('Calling serviceWorker.register');
      n.serviceWorker.register('service-worker.js').then(function(registration: any) {
        log.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(function(err: any) {
        log.log('ServiceWorker registration failed: ', err);
      });
    }
  }
  
  function getTranslations(): Translations {
    return {}; //XXX to fill in
  }

	function updateUI(params:any) {
    turnIndex = params.turnIndexAfterMove;
	  board = params.stateAfterMove.board;
    if (!board) {
      board = gameLogic.getInitialBoard();
    }
	  deltaFrom = params.stateAfterMove.deltaFrom;
	  deltaTo = params.stateAfterMove.deltaTo;
	  isUnderCheck = params.stateAfterMove.isUnderCheck;
	  canCastleKing = params.stateAfterMove.canCastleKing;
	  canCastleQueen = params.stateAfterMove.canCastleQueen;
	  enpassantPosition = params.stateAfterMove.enpassantPosition
	  promoteTo = params.stateAfterMove.promoteTo;
    isYourTurn = turnIndex === params.yourPlayerIndex && // it's my turn
                 turnIndex >= 0; // game is ongoing
	  // Is it the computer's turn?
	  if (isYourTurn && params.playersInfo[params.yourPlayerIndex].playerId === '') {
		  isYourTurn = false; // to make sure the UI won't send another move.
		  /* Waiting 0.5 seconds to let the move animation finish; if we call aiService
		     then the animation is paused until the javascript finishes. */
		  $timeout(sendComputerMove, 500);
	  }
	  /* If the play mode is not pass and play then "rotate" the board
	     for the player. Therefore the board will always look from the
	     point of view of the player in single player mode... */
	  rotate = false;
    if (params.playMode === "playBlack") {
		  rotate = true;
	  }
	  selectedCells = []; // clear up the selectedCells and waiting for next valid move
	}

	function animationEndedCallback() {
    $rootScope.$apply(function () {
      animationEnded = true;
      if (isComputerTurn) {
		    sendComputerMove();
      }
    });
	}

  function sendComputerMove() {
    //XXX is this necessary ?
    let possibleMoves = gameLogic.getPossibleMoves(board,
                                                   turnIndex,
                                                   isUnderCheck,
                                                   canCastleKing,
                                                   canCastleQueen,
                                                   enpassantPosition);
    if (possibleMoves.length) {
      let index1 = Math.floor(Math.random() * possibleMoves.length);
      let pm = possibleMoves[index1];
      let index2 = Math.floor(Math.random() * pm[1].length);
      deltaFrom = pm[0];
      deltaTo = pm[1][index2];
      gameService.makeMove(gameLogic.createMove(board,
                                                deltaFrom,
                                                deltaTo,
                                                turnIndex,
                                                isUnderCheck,
                                                canCastleKing,
                                                canCastleQueen,
                                                enpassantPosition,
                                                promoteTo));
    } else {
      console.log("There is no possible move");
    }
  }

  //window.e2e_test_stateService = stateService;
  function handleDragEvent(type:string, clientX:number, clientY:number) {
    // Center point in gameArea
    let x:number = clientX - gameArea.offsetLeft;
    let y:number = clientY - gameArea.offsetTop;
    if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
      if (draggingPiece) {
        // Drag the piece where the touch is (without snapping to a square).
        let height = getSquareWidthHeight().height;
        let width = getSquareWidthHeight().width;
        setDraggingPieceTopLeft({top: y - height / 2, left: x - width / 2});
      } else {
        return;
      }
    } else {
      // Inside gameArea. Let's find the containing square's row and col
      let col:number = Math.floor(colsNum * x / gameArea.clientWidth);
      let row:number = Math.floor(rowsNum * y / gameArea.clientHeight);
      let r_row:number = row;
      let r_col:number = col;
      if (rotate) {
        r_row = 7 - r_row;
        r_col = 7 - r_col;
      }
      if (type === "touchstart" && !draggingStartedRowCol) {
        // drag started
        let PieceEmpty = (board[r_row][r_col] === '');
        let PieceTeam = board[r_row][r_col].charAt(0);
        if (!PieceEmpty && PieceTeam === getTurn(turnIndex)) {
          draggingStartedRowCol = {row: row, col: col};
          draggingPiece = document.getElementById(
                            "e2e_test_img_" +
                            getPieceKindInId(row, col) + 
                            '_' +
                            draggingStartedRowCol.row + 
                            "x" + 
                            draggingStartedRowCol.col);
          if (draggingPiece) {
            draggingPiece.style['z-index'] = ++nextZIndex;
            draggingPiece.style['width'] = '60%';
          }

          draggingPieceAvailableMoves = getDraggingPieceAvailableMoves(r_row, r_col);
          for (let i = 0; i < draggingPieceAvailableMoves.length; i++) {
            draggingPieceAvailableMoves[i].style['stroke-width'] = '10';
            draggingPieceAvailableMoves[i].style['stroke'] = 'rgba(255, 128, 0, 1)';
            draggingPieceAvailableMoves[i].setAttribute("rx", "5");
            draggingPieceAvailableMoves[i].setAttribute("ry", "5");
          }
        }
      }
      if (!draggingPiece) {
        return;
      }
      if (type === "touchend") {
        var audio = new Audio('sounds/piece_drop.wav');
        audio.play();
        dragDone(draggingStartedRowCol, {row: row, col: col});
      } else { // Drag continue
        setDraggingPieceTopLeft(getSquareTopLeft(row, col));
      }
    }
    if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
      // drag ended
      // return the piece to it's original style (then angular will take care to hide it).
      //setDraggingPieceTopLeft({getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col)});
      draggingPiece.style['width'] = '40%';
      draggingPiece.style['top'] = '50%';
      draggingPiece.style['left'] = '50%';
      draggingPiece.style['position'] = 'absolute';
      for (let i = 0; i < draggingPieceAvailableMoves.length; i++) {
        draggingPieceAvailableMoves[i].style['stroke-width'] = '';
        draggingPieceAvailableMoves[i].style['stroke'] = '';
        draggingPieceAvailableMoves[i].setAttribute("rx", "");
        draggingPieceAvailableMoves[i].setAttribute("ry", "");
      }
      draggingStartedRowCol = null;
      draggingPiece = null;
      draggingPieceAvailableMoves = null;
    }
  }

  function setDraggingPieceTopLeft(topLeft:any) {
    let originalSize = getSquareTopLeft(draggingStartedRowCol.row, 
                                        draggingStartedRowCol.col);
    draggingPiece.style.left = (topLeft.left - originalSize.left+0) + "px";
    draggingPiece.style.top = (topLeft.top - originalSize.top+0) + "px";
  }

  function getSquareWidthHeight() {
    return {width: gameArea.clientWidth / colsNum,
            height: gameArea.clientHeight / rowsNum};
  }

  function getSquareTopLeft(row:any, col:any) {
    let size = getSquareWidthHeight();
    return {top: row * size.height,
            left: col * size.width};
  }

  function getSquareCenterXY(row:any, col:any) {
    let size = getSquareWidthHeight();
    return {
      x: col * size.width + size.width / 2,
      y: row * size.height + size.height / 2
    };
  }

  function dragDone(from:any, to:any) {
    $rootScope.$apply(function () {
        dragDoneHandler(from, to);
    });
  }

  function dragDoneHandler(from:any, to:any) {
    if (window.location.search === '?throwException') {
      throw new Error("Throwing the error because URL has '?throwException'");
    }
    if (!isYourTurn) {
      return;
    }
    // need to rotate the angle if playblack
    if(rotate) {
      from.row = 7 - from.row;
      from.col = 7 - from.col;
      to.row = 7 - to.row;
      to.col = 7 - to.col;
    }
    deltaFrom = from;
    deltaTo = to;
    let myPawn = 'BP';
    if (turnIndex === 0){
      myPawn = 'WP';
    }
    if(myPawn === board[deltaFrom.row][deltaFrom.col] &&
       (deltaTo.row === 0 || deltaTo.row === 7)){
      player = getTurn(turnIndex);
      isPromotionModalShowing[modalName] = true;
      return;
    }
    actuallyMakeMove();
  }

  function actuallyMakeMove() {
    try {
      let move = gameLogic.createMove(board,
                                      deltaFrom,
                                      deltaTo,
                                      turnIndex,
                                      isUnderCheck,
                                      canCastleKing,
                                      canCastleQueen,
                                      enpassantPosition,
                                      promoteTo);
      isYourTurn = false; // to prevent making another move, acts as a kicj
      gameService.makeMove(move);
    } catch (e) {
      console.log(["Exception thrown when create move in position:", deltaFrom, deltaTo]);
      return;
    }
  }

  function getDraggingPieceAvailableMoves(row:any, col:any) {
    let possibleMoves = gameLogic.getPossibleMoves(board,
                                                   turnIndex,
                                                   isUnderCheck,
                                                   canCastleKing,
                                                   canCastleQueen,
                                                   enpassantPosition);
    let draggingPieceAvailableMoves:any = [];
    let index = cellInPossibleMoves(row, col, possibleMoves);
    if (index) {
      let availableMoves = possibleMoves[index][1];
      for (let i = 0; i < availableMoves.length; i++) {
        let availablePos = availableMoves[i];
        if(rotate) {
          availablePos.row = 7 - availablePos.row;
          availablePos.col = 7 - availablePos.col;
        }
        draggingPieceAvailableMoves.push(document.getElementById(
                                          "MyBackground" +
                                          availablePos.row + 
                                          "x" + 
                                          availablePos.col));
      }
    }
    return draggingPieceAvailableMoves;
  }

  export let isSelected = function(row:any, col:any) {
    if (rotate) {
      row = 7 - row;
      col = 7 - col;
    }
    return draggingStartedRowCol &&
           draggingStartedRowCol.row === row &&
           draggingStartedRowCol.col === col &&
           board[row][col].charAt(0) === getTurn(turnIndex);
  };

  export let shouldShowImage = function(row:number, col:number) {
    if (rotate) {
      row = 7 - row;
      col = 7 - col;
    }
    return board[row][col] !== "";
  };

  export let getImageSrc = function(row:number, col:number) {
    if (rotate) {
      row = 7 - row;
      col = 7 - col;
    }
    return getPieceKind(board[row][col]);
  };

  function getPieceKind(cell:string){
    switch(cell) {
      case 'WK': return 'chess_graphics/chess_pieces/W_King.png';
      case 'WQ': return 'chess_graphics/chess_pieces/W_Queen.png';
      case 'WR': return 'chess_graphics/chess_pieces/W_Rook.png';
      case 'WB': return 'chess_graphics/chess_pieces/W_Bishop.png';
      case 'WN': return 'chess_graphics/chess_pieces/W_Knight.png';
      case 'WP': return 'chess_graphics/chess_pieces/W_Pawn.png';
      case 'BK': return 'chess_graphics/chess_pieces/B_King.png';
      case 'BQ': return 'chess_graphics/chess_pieces/B_Queen.png';
      case 'BR': return 'chess_graphics/chess_pieces/B_Rook.png';
      case 'BB': return 'chess_graphics/chess_pieces/B_Bishop.png';
      case 'BN': return 'chess_graphics/chess_pieces/B_Knight.png';
      case 'BP': return 'chess_graphics/chess_pieces/B_Pawn.png';
      default: return '';
    }
  }

  export let getPieceKindInId = function(row:number, col:number) {
    if (board) {
      if (rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      return board[row][col];
    }
  };

  export let getBackgroundSrc = function(row:number, col:number) {
    if (isLight(row, col)) {
      return 'auto_resize_images/Chess-lightCell.svg';
    }
    return 'auto_resize_images/Chess-darkCell.svg';
  };

  export let getBackgroundFill = function(row:number, col:number) {
    if (isLight(row, col)){
      return 'rgb(133, 87, 35)';
    }
    return 'rgb(185, 156, 107)';
  };

  function isLight(row:number, col:number) {
    let rowIsEven = row % 2 === 0;
    let colIsEven = col % 2 === 0;
    return rowIsEven && colIsEven || !rowIsEven && !colIsEven;
  }

  export let canSelect = function(row:number, col:number) {
    if (!board) {
      return true;
    }
    if (isYourTurn) {
      if (rotate) {
        row = 7 - row;
        col = 7 - col;
      }
      if (board[row][col].charAt(0) === getTurn(turnIndex)) {
        if (!isUnderCheck) { isUnderCheck = [false, false]; }
        if (!canCastleKing) { canCastleKing = [true, true]; }
        if (!canCastleQueen) { canCastleQueen = [true, true]; }
        if (!enpassantPosition) { enpassantPosition = {row: null, col: null}; }
        let possibleMoves = gameLogic.getPossibleMoves(board,
                                                       turnIndex,
                                                       isUnderCheck,
                                                       canCastleKing,
                                                       canCastleQueen,
                                                       enpassantPosition);
        return cellInPossibleMoves(row, col, possibleMoves); //XXX bad design ! ?
      } else {
        return false;
      }
    }
  };

  function getTurn(turnIndex:any) {
    if (turnIndex === 0){
      return 'W';
    }
    return 'B';
  }

  function cellInPossibleMoves(row:any, col:any, possibleMoves:any):any {
    for (let i = 0; i < possibleMoves.length; i++) {
      if (angular.equals({row: row, col: col}, possibleMoves[i][0])) {
        return i;
      }
    }
    return false; //XXX should be an error ?
  }

  export let isBlackPiece = function(row:any, col:any) {
    if (rotate) {
      row = 7 - row;
      col = 7 - col;
    }
    let pieceTeam = board[row][col].charAt(0);
    return pieceTeam === 'B';
  };

  export let isWhitePiece = function(row:any, col:any) {
    if (rotate) {
      row = 7 - row;
      col = 7 - col;
    }
    let pieceTeam = board[row][col].charAt(0);
    return pieceTeam === 'W';
  };

  function shouldPromote(board:any, deltaFrom:any, deltaTo:any, turnIndex:any) {
    let myPawn = 'BP';
    if (turnIndex === 0){
      myPawn = 'WP';
    }
    return myPawn === board[deltaFrom.row][deltaFrom.col] &&
           (deltaTo.row === 0 || deltaTo.row === 7);
  }

  export let isModalShown = function (modalName:any) {
    return isPromotionModalShowing[modalName];
  };

  export let updatePromoteTo = function() {
    let radioPromotions:any = document.getElementsByName('promotions');
    for (let i = 0; i < radioPromotions.length; i++) {
      if (radioPromotions[i].checked) {
        promoteTo = radioPromotions[i].value;
        break;
      }
    }
    delete isPromotionModalShowing[modalName]; //dismissModal
    actuallyMakeMove();
  };
  export let rows:any = [0,1,2,3,4,5,6,7];
  export let cols:any = [0,1,2,3,4,5,6,7];
}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
  $rootScope['game'] = game;
  translate.setLanguage('en', {
      CHESS_GAME: "Chess",
      PROMOTION_MESSAGE: "Congratulations! Which piece would you like to promote to?",
      PROMOTE_QUEEN: "Queen",
      PROMOTE_ROOK: "Rook",
      PROMOTE_BISHOP: "Bishop",
      PROMOTE_KNIGHT: "Knight",
      PROMOTE_ACTION: "Promote",
      RULES_OF_CHESS: "Rules of Chess",
      CLOSE: "Close",
      RULES_SLIDE1: "King moves one piece around it",
      RULES_SLIDE2: "Rook moves horisontaly and verticaly",
      RULES_SLIDE3: "Bishop moves diagnaly and anti-diagnaly",
      RULES_SLIDE4: "Queen is the most powerful piece in Chess, it can move horizontaly, verticaly and diagnaly.",
      RULES_SLIDE5: "Knight can move as 'L' shape and skip other pieces",
      RULES_SLIDE6: "Pawn moves forward one row(or two rows in initial move), capture pieces diagnaly",
      RULES_SLIDE7: "En passant: a special pawn capture",
      RULES_SLIDE8: "Promotion: the pawn reaches last row is qualified to promotion",
      RULES_SLIDE9: "Castling: King and Rook move together(with conditions) as picture shows",
      RULES_SLIDE10: "In check: When a king is under immediate attack by one or two of the opponent's pieces.",
      RULES_SLIDE11: "Endgame - wins by Checkmate",
      RULES_SLIDE11_2: "Make opponent's king has no available legal moves while is under check by you.",
      RULES_SLIDE12: "Endgame - draws by Stalemate",
      RULES_SLIDE12_2: "Make opponent's king has no available legal moves while is NOT under check by you."
  });
  game.init();
});