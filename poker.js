//things to do - eventually, update Bet function to change by player (some bluff more etc)
//fix bet/check/raise/fold divs

//add resetAfterHand function for newHand
//add a fold function using stateObj immer 
//add an indicator for current player's div

async function updateState(newStateObj) {
    state = {...newStateObj}
    renderScreen(state)
    return state
}

async function renderScreen(stateObj) {
    if (stateObj.currentScreen === "chooseVisibleCard") {
        chooseHoleCardToBeVisiblePokerTable()
    } else if (stateObj.currentScreen === "renderTable") {
        createPokerTable()
    }
}

async function startGame() {
    await newHand(state)
}

async function createDeckAndShuffle(stateObj) {
    console.log('shuffling')
    let fullDeck = [];
    let ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    let suits = ['h', 'c', 'd', 's']; // Hearts, Clubs, Diamonds, Spades

    suits.forEach(suit => {
        ranks.forEach(rank => {
            fullDeck.push(rank + suit);
        });
    });

    fullDeck = shuffle(fullDeck)
    stateObj = immer.produce(stateObj, (newState) => {
        state.currentDeck = fullDeck
    })
    await updateState(stateObj)
    return stateObj 
}

async function dealToEachPlayer(stateObj) {
    for (i = 0; i < stateObj.players.length; i++) {
        stateObj = immer.produce(stateObj, (newState) => {
            newState.players[i].currentHand.push(newState.currentDeck[0])
            newState.currentDeck.splice(0, 1)
        })
        await pause(100)
        await updateState(stateObj)
    }
    return stateObj
}

async function dealPublicCards(numberCards) {
    stateObj = {...state}
    for (let i=0; i < numberCards; i++) {
        stateObj = immer.produce(stateObj, (newState) => {
            newState.publicCards.push(newState.currentDeck[0])
            newState.currentDeck.splice(0, 1)
        })
        await pause(100)
        await updateState(stateObj)
    }
    return stateObj
}


async function putInBet(stateObj, playerIndex, betSize) {

    stateObj = immer.produce(stateObj, (newState) => {
        let playerBet = newState.players[playerIndex].currentBet
        let extraMoney = betSize- playerBet
        //is the player putting in all their money?
        extraMoney = (newState.players[playerIndex].stackSize >= (extraMoney)) ? extraMoney : newState.players[playerIndex].stackSize;
        newState.players[playerIndex].stackSize -= extraMoney;
        newState.players[playerIndex].currentBet += extraMoney
        //is the current bet larger
        newState.currentBet = (newState.players[playerIndex].currentBet > newState.currentBet) ? newState.players[playerIndex].currentBet : newState.currentBet
        newState.currentPot += extraMoney;
        console.log(stateObj.players[playerIndex].name + " has put in " + extraMoney)
    })
    
    await updateState(stateObj)
    return stateObj;
}

async function putInBlinds(stateObj) {
    let SBIndex = (state.currentDealer < 5) ? state.currentDealer+1 : 0
    let BBIndex = (state.currentDealer < 4) ? state.currentDealer+2 : (state.currentDealer  - 4)
    let hijackIndex = (state.currentDealer < 3) ? state.currentDealer+3 : (state.currentDealer  - 3)
    let lojackIndex = (state.currentDealer < 2) ? state.currentDealer+4 : (state.currentDealer  - 2)
    let buttonIndex = (state.currentDealer < 1) ? 5 : (state.currentDealer  - 1)

    stateObj = await nextPlayer(stateObj)
    stateObj = await putInBet(stateObj, SBIndex, 1)
    await pause(650)
    stateObj = await nextPlayer(stateObj)
    stateObj = await putInBet(stateObj, BBIndex, 3)
    await pause(650)
    stateObj = immer.produce(stateObj, (newState) => {
        newState.currentPlayer = (BBIndex < 5) ? BBIndex+1 : 0
        newState.players[newState.currentDealer].currentSeat = 0
        newState.players[SBIndex].currentSeat = 1
        newState.players[BBIndex].currentSeat = 2
        newState.players[hijackIndex].currentSeat = 3
        newState.players[lojackIndex].currentSeat = 4
        newState.players[buttonIndex].currentSeat = 5
    })
    await updateState(stateObj)
    return stateObj
}

async function preFlopAction(stateObj) { 
    const playerIndex = stateObj.players.findIndex(player => player.name === "player");
    let firstIndex = stateObj.currentPlayer
    let lastIndex = (firstIndex < playerIndex) ? (playerIndex-firstIndex) : (5-firstIndex+1+playerIndex)
    lastIndex = (playerIndex === firstIndex) ? playerIndex : lastIndex

    for (let i=0; i < lastIndex; i++) {
        console.log("index is " + i)
        let playerInd = stateObj.currentPlayer
        player = stateObj.players[playerInd];
        if (player.name === "player") {
            return true
        } else if (player.currentBet === stateObj.currentBet) {
            console.log("preflop action closed")
            stateObj = await dealPublicCards(3)
            console.log(stateObj)
            stateObj = await postFlopAction(stateObj)
            return true
        } else if (player.isStillInHand !== false) {
            //if no raise yet
            const callThreshold = player.callwithJunkPreFlopPercentage
            const callValue = Math.random()
            //console.log(player.name + " has a call value of " + callValue.toFixed(2) + " and a threshold of " + callThreshold.toFixed(2))
            const willCall = callValue < player.callwithJunkPreFlopPercentage
            let moneyIn = stateObj.currentBet
            if (stateObj.currentBet === 3) {
                if (isHandInRange(player.currentHand, raiseFirstIn[player.currentSeat])) {
                   stateObj = await putInBet(stateObj, playerInd, moneyIn*4)
                    console.log(player.name + " raises to " + moneyIn*4)
                } else if (isHandInRange(player.currentHand, looseSmallBlindRaiseRange)) {
                    stateObj = await putInBet(stateObj, playerInd, moneyIn)
                    console.log(player.name + " calls " + moneyIn + " loosely")
                } else {
                    if (willCall) {
                        stateObj = await putInBet(stateObj, playerInd, moneyIn)
                        console.log(player.name + " calls " + moneyIn + " as a bluff")
                    } else {
                        //add fold function
                        player.isStillInHand = false
                        console.log(player.name + " folds")
                    }
                }
            } else if (stateObj.currentBet < 25) {
                if (isHandInRange(player.currentHand, fourBetRange)) {
                    console.log(player.name + " raises with a 4bet hand to " + moneyIn*3)
                    stateObj = await putInBet(stateObj, playerInd, moneyIn*3)
                } else if (isHandInRange(player.currentHand, raiseFirstIn[player.currentSeat])) {
                    stateObj = await putInBet(stateObj, playerInd, moneyIn)
                    console.log(player.name + " calls " + moneyIn + " loosely")
                } else if ((callValue*2 < callThreshold)) {
                    stateObj = await putInBet(stateObj, playerInd, moneyIn)
                    console.log(player.name + " calls " + moneyIn + " as a bluff")
                } else {
                    player.isStillInHand = false
                    console.log(player.name + " folds")
                }
            } else {
                if (isHandInRange(player.currentHand, fourBetRange)) {
                    console.log(player.name + " raises to " + moneyIn*3)
                    stateObj = await putInBet(stateObj, playerInd, moneyIn*3)
                } else if ((isHandInRange(player.currentHand, raiseFirstIn[0]))) {
                    stateObj = await putInBet(stateObj, playerInd, moneyIn)
                    console.log(player.name + " calls " + moneyIn + " loosely")
                } else {
                    player.isStillInHand = false
                    console.log(player.name + " folds")
                }
            }
        }
        stateObj = immer.produce(stateObj, (newState) => {
            newState.currentPlayer = (newState.currentPlayer === 5) ? 0 : newState.currentPlayer+1
            console.log("increased current index to " + newState.currentPlayer)
        })
        await pause(1500)
        await updateState(stateObj) 
    }
    return stateObj
}

async function postFlopAction(stateObj) { 
    //find dealer and small blind index
    const playerIndex = stateObj.players.findIndex(player => player.name === "player");
    let firstIndex = (stateObj.currentDealer < 5) ? stateObj.currentDealer+1 : 0
    //reset bets to 0 for the flop
    stateObj.currentBet = 0;
    stateObj.players.forEach(player => {
        player.currentBet = 0
    })
    await updateState(stateObj)
    let lastIndex = (firstIndex < playerIndex) ? (playerIndex-firstIndex) : (5-firstIndex+1+playerIndex)
    lastIndex = (playerIndex === firstIndex) ? playerIndex : lastIndex

    for (let i=0; i < lastIndex; i++) {
        playerInd = stateObj.currentPlayer
        player = stateObj.players[playerInd];
        if (player.isStillInHand !== false) {
            if (player.name === "player") {
                console.log('betting reached player')
                return true
            } else {
                playerHandRank = getBestPokerHand(player.currentHand.concat(stateObj.publicCards))[1]
                console.log(player.name + " hand rank is " + playerHandRank)
                const bluffOrTrap = Math.random()
                if (stateObj.currentBet === 0) {
                    if (playerHandRank>=2) {
                        //even if player has good hand, they trap sometimes
                        if (bluffOrTrap > 0.2) {
                            console.log(player.name + " bets out for half pot: " + stateObj.currentPot/2)
                           stateObj = await putInBet(stateObj, playerInd, stateObj.currentPot/2)
                        } else {
                            console.log(player.name + " checks as a trap")
                        }
                    } else {
                        //if player has bad hand, they bluff at pot sometimes
                        if (bluffOrTrap < 0.2) {
                            console.log(player.name + " bluffs out for half pot: " + stateObj.currentPot/2)
                           await putInBet(stateObj, playerInd, stateObj.currentPot/2)
                        } else {
                            console.log(player.name + " checked with a bad hand")
                        }
                    }
                } else if (state.currentBet < 30) {
                    if (playerHandRank >= 3) {
                        //even if player has good hand, they trap sometimes
                        if (bluffOrTrap > 0.2) {
                            console.log(player.name + " raises for " + stateObj.currentBet*2)
                           await putInBet(stateObj, playerInd, stateObj.currentBet*2) 
                        } else {
                           await putInBet(stateObj, playerInd, stateObj.currentBet)
                            console.log(player.name + " calls for " + stateObj.currentBet)
                        } 
                    } else if (playerHandRank>1) {
                        //even if player has decent hand, they still fold sometimes
                        if (bluffOrTrap > 0.1) {
                            console.log(player.name + " calls for " + stateObj.currentBet)
                           await putInBet(stateObj, playerInd, stateObj.currentBet) 
                        } else {
                            console.log(player.name + " folded with a decent hand")
                            player.isStillInHand = false
                        } 
                    } else {
                        //players sometimes call even with terrible hand
                        if (bluffOrTrap < 0.1) {
                            console.log(player.name + " calls as bluff for " + stateObj.currentBet)
                           await putInBet(stateObj, playerInd, stateObj.currentBet) 
                        } else {
                            player.isStillInHand = false
                            console.log(player.name + " folded with a bad hand")
                        }
                    }
                //in a big pot, players need a good hand to stick around
                } else {
                    if (playerHandRank >= 4) {
                        //even if player has good hand, they trap sometimes
                        if (bluffOrTrap > 0.1) {
                            console.log(player.name + " raises for " + stateObj.currentBet*2)
                           await putInBet(stateObj, playerInd, stateObj.currentBet*2) 
                        } else {
                           await putInBet(stateObj, playerInd, stateObj.currentBet)
                            console.log(player.name + " calls as a trap for " + stateObj.currentBet)
                        } 
                    } else if (playerHandRank == 3) {
                        //players trap slightly more often with draws or two pair
                        if (bluffOrTrap > 0.25) {
                            console.log(player.name + " raises for " + stateObj.currentBet*2)
                           await putInBet(stateObj, playerInd, stateObj.currentBet*2) 
                        } else {
                           await putInBet(stateObj, playerInd, stateObj.currentBet)
                            console.log(player.name + " calls as a trap for " + stateObj.currentBet)
                        } 
                    } else if (playerHandRank > 1) {
                        //even if player has a pair, they still fold sometimes
                        if (bluffOrTrap > 0.4) {
                            console.log(player.name + " calls for " + stateObj.currentBet)
                           await putInBet(stateObj, playerInd, stateObj.currentBet) 
                        } else {
                            console.log(player.name + " folded with a decent hand")
                            player.isStillInHand = false
                        } 
                    } else {
                        //players fold with nothing if the pot is big
                        console.log(player.name + " folded with nothing")
                        player.isStillInHand = false
                    }
                }
            }
        } else {
            console.log(player.name + " is folded; moving to next")
        }
        stateObj = await nextPlayer(stateObj)
        console.log("increased current index to " + state.currentPlayer)
    }
    return stateObj
}

async function makeCardVisible(stateObj, player, cardNum) {
    console.log("trggering makeCardvisible for player " + player.name)
    const playerIndex = stateObj.players.findIndex(loopPlayer => loopPlayer.name === player.name)
    stateObj = immer.produce(stateObj, (newState) => {
        if (cardNum === 0) {
            newState.players[playerIndex].leftCardVisible = true
        } else {
            newState.players[playerIndex].rightCardVisible = true
        }
    })
    stateObj = await updateState(stateObj)
    return stateObj
}


async function chooseHoleCardToBeVisiblePokerTable() {
    document.body.innerHTML = ''
    // Create table div
    const tableDiv = document.createElement('div');
    tableDiv.id = 'tableDiv';
    document.body.appendChild(tableDiv);
    stateObj = {...state}

    // Create player divs and card divs
    const positions = [
        { top: '100%', left: '40%' },
        { top: '75%', left: '0%' },
        { top: '30%', left: '-20%' },
        { top: '-20%', left: '10%' },
        { top: '-20%', left: '70%' },
        { top: '70%', left: '90%' }
    ];

    for (let i = 0; i < 6; i++) {
        let playerDiv = createPlayerDiv(state.players[i], positions[i].top, positions[i].left, "chooseToTurnVisible")
        tableDiv.appendChild(playerDiv);
    }

    const potDiv = createPotDiv(stateObj)
    const publicCardsDiv = createPublicCardsDiv(stateObj)
    

    const foldDiv = document.createElement('div');
    foldDiv.classList.add('action-div');
    foldDiv.textContent = "Fold"
    foldDiv.style.top = '10%';
    foldDiv.style.left = '70%';
    foldDiv.onclick = function() {
        console.log('clicked fold div')
        const playerIndex = state.players.findIndex(player => player.name === "player");
        state.players[playerIndex].isStillInHand = false;
        newHand()
    }

    const callDiv = document.createElement('div');
    callDiv.classList.add('action-div');
    callDiv.textContent = "Call"
    callDiv.style.top = '10%';
    callDiv.style.left = '70%';
    callDiv.onclick = async function() {
        console.log('clicked call div')
        stateObj = {...state}

        const playerIndex = state.players.findIndex(player => player.name === "player");
        console.log("player index for caldvi is " + playerIndex)
        const moneyIn = stateObj.currentBet - stateObj.players[playerIndex].currentBet
        stateObj = await putInBet(stateObj, playerIndex, moneyIn)
        stateObj = immer.produce(stateObj, (newState) => {
            newState.currentPlayer  = (newState.currentPlayer < 5) ? newState.currentPlayer + 1 : 0
        })
        
        if (stateObj.publicCards.length === 0) {
            stateObj = await preFlopAction(stateObj)
        } else {
            stateObj = await postFlopAction(stateObj)
        }
        await renderScreen(stateObj)
        return stateObj
    }

    const betDiv = document.createElement('div');
    betDiv.classList.add('action-div');
    betDiv.textContent = "Bet"
    betDiv.style.top = '10%';
    betDiv.style.left = '70%';
    betDiv.onclick = function() {
        console.log('clicked bet div')
        const playerIndex = state.players.findIndex(player => player.name === "player");
        const moneyIn = (state.currentPot/2)
        state.players[playerIndex].currentBet += moneyIn
        state.currentPot += moneyIn
        state.players[playerIndex].stackSize -= moneyIn 
        state.currentPlayer  = (state.currentPlayer < 5) ? state.currentPlayer + 1 : 0
        postFlopAction()
        renderScreen(state)
    }

    const checkDiv = document.createElement('div');
    checkDiv.classList.add('action-div');
    checkDiv.textContent = "Check"
    checkDiv.style.top = '10%';
    checkDiv.style.left = '70%';
    checkDiv.onclick = function() {
        console.log('clicked check div')
        state.currentPlayer  = (state.currentPlayer < 5) ? state.currentPlayer + 1 : 0
        postFlopAction()
        renderScreen(state)
    }

    let RaiseDiv = createRaiseDiv(stateObj)

    if (state.currentBet === 0) {
        document.body.append(checkDiv, betDiv)
    } else {
        document.body.append(foldDiv, callDiv, RaiseDiv)
    }
    tableDiv.append(publicCardsDiv, potDiv)
}

async function resetHand(stateObj) {
    if (stateObj.currentPot > 0) {
        stateObj = immer.produce(stateObj, (newState) => {
            const indices = stateObj.players.map((obj, index) => obj.isStillInHand ? index : null).filter(index => index !== null);
            winnerindex = indices[Math.floor(Math.random() * indices.length)]
            newState.players[winnerindex] += newState.currentPot
        })
    }
    stateObj = immer.produce(stateObj, (newState) => {
        newState.currentDealer = (newState.currentDealer === 5) ? 0 : newState.currentDealer+1
        newState.players.forEach(player => {
            player.currentSeat = (player.currentSeat === 0) ? 5 : player.currentSeat-1
            player.currentBet = 0
            player.isStillInHand = true
        })
        
        //
        newState.currentPot = 0
        newState.currentBet = 0
        newState.publicCards = []
    })
    return stateObj
}


async function newHand() {
    stateObj = {...state}
    //give pot to random player

    stateObj = await resetHand(stateObj)
    stateObj = await updateState(stateObj)
    
    stateObj = await createDeckAndShuffle(stateObj)
    stateObj = await dealToEachPlayer(stateObj)
    stateObj = await dealToEachPlayer(stateObj)
    stateObj = await putInBlinds(stateObj)
    stateObj = await preFlopAction(stateObj)
    await renderScreen(stateObj)
}


startGame()

