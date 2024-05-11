state = {
    players: [],
    playerMoney: 1000,
    playerHand: [],
    publicCards: [],
    
    currentBet: 0,
    currentPot: 0,
    currentDealer: 5,
    currentPlayer: "SB",

    currentDeck: [],
    currentScreen: "chooseVisibleCard",

}

const possibleNames = ["Alex", "Casey", "Charlie", "Dakota", "Emerson", "Finn", "Harper", "Jamie", "Jordan", "Kai", "Morgan", "Parker", "Quinn", "Reese", "Riley", "River", "Rowan", "Skyler", "Taylor"];
seatPositions = [
  "SB",
  "BB",
  "UTG",
  "Lojack",
  "CO",
  "Dealer"
]

function Player() {
    this.name = false;
    this.currentHand = [];
    this.leftCardVisible = false;
    this.rightCardVisible = false;
    this.leftCardDealt = false;
    this.rightCardDealt = false;
    this.currentSeat = false;
    this.stackSize = 1000; // Arbitrary starting amount
    this.isStillInHand = true;
    this.currentBet = 0;

    this.callwithJunkPreFlopPercentage = Math.random() * 0.4;
    this.trapPercentage = Math.random() * 0.4
    this.callRaiseWithRFI = Math.random()
  }
  
  // Create 5 AI players
function createPlayers() {
    let players = [];
    for (let i = 0; i < 5; i++) {
      let nameIndex = Math.floor(Math.random() * possibleNames.length)
      let randomName = possibleNames[nameIndex]
      possibleNames.splice(nameIndex, 1)
      let player = new Player();
      player.name = randomName
      player.currentSeat = seatPositions[i]
      players.push(player);
    }
    let playerCharacter = new Player();
    playerCharacter.name = "player"
    playerCharacter.currentSeat = "Dealer"
    playerCharacter.leftCardVisible = true;
    playerCharacter.rightCardVisible = true;
    players.push(playerCharacter);
    return players
  }


  state.players = createPlayers()
  