state = {
    players: [],
    playerMoney: 1000,
    playerHand: [],
    publicCards: [],
    
    currentBet: 0,
    currentPot: 0,
    currentDealer: 5,
    currentPlayer: 0,

    currentDeck: [],
    currentScreen: "chooseVisibleCard",

}

const possibleNames = ["Alex", "Casey", "Charlie", "Dakota", "Emerson", "Finn", "Harper", "Jamie", "Jordan", "Kai", "Morgan", "Parker", "Quinn", "Reese", "Riley", "River", "Rowan", "Skyler", "Taylor"];

function Player(nameString, seatNumber) {
    this.name = nameString;
    this.currentHand = [];
    this.leftCardVisible = false;
    this.rightCardVisible = false;
    this.leftCardDealt = false;
    this.rightCardDealt = false;
    this.currentSeat = seatNumber;
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
      players.push(new Player(randomName, i));
    }
    players.push(new Player("player", 5));
    players[5].leftCardVisible = true;
    players[5].rightCardVisible = true;
    return players
  }

  state.players = createPlayers()
  