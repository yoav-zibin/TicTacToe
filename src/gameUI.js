// create board
var b = jsboard.board({attach:"game", size:"20x20"});
b.cell("each").style({width:"17px", height:"17px"});

var piece_red = jsboard.piece({backgroundColor: "#ccffcc", text:" ", fontSize:"80%", textAlign:"center"});
var piece_blue = jsboard.piece({text:"O", fontSize:"80%", textAlign:"center"});

var turn = true;
b.cell("each").on("click", function() {
    if (b.cell(this).get()==null) {
        if (turn)   b.cell(this).place(piece_red.clone());
        else        b.cell(this).place(piece_blue.clone()); 
        turn = !turn;
    }
});

// var gameAreaDiv = document.createElement('div');
// gameAreaDiv.id = "gameArea";
// for (var i = 0; i < 20; i++) {
//     var rowDiv = document.createElement('div');
//     gameAreaDiv.appendChild(rowDiv);
//     for (var j = 0; j < 20; j++) {
//         var cell = document.createElement('div');
//         rowDiv.appendChild(cell);
//     }
// }
