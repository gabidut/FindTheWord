console.log('ACT-0001 : game.js');

socket.on("gameAction", function(nb, arg0) { 
    console.log("GameAction recieved. Message : " + nb)
    switch (nb) {
        case "0001":
          console.log("Lancement du jeu.");
          console.image("../logo100.png");
          // document.getElementById('chatMSG').remove();
          // document.getElementById('sbm').remove();
          document.getElementById('divChat').remove();
          document.getElementById('joined').remove();
          document.getElementById('additive').remove();
          document.getElementById('party').remove();
          document.getElementById('game').remove();
          document.getElementById('launch').remove();
          console.log("Jeu lancé.");
          break;
          case "0002":
            console.log("Emission d'un élément : " + arg0);
            if(arg0 == null) {
              console.log("ACT-0002")
            } else {
              if(String(arg0).startsWith("a")) {
                console.log("Son audio");
                if(arg0 == "a/startBip") {
                  console.log("Son BIP");
                  
                  const sound = new Audio("../bip.mp3");
                  sound.play();
                }
              }
            }
            break;
        default:
          console.log(`It's bad :(`);
      }
      
});