
//if big blind reaches player, we auto go to the flop
//bug when clicking callDiv as small blind -> currentBet is only 2?

//sometimes even tight players limp in late position


//update checkDiv to be able to check BB on preflop
//things to do - eventually, update Bet function to change by player (some bluff more etc)
//add suspicion level to the state; checkForDeath to see if the player loses
//add a visual indicator for suspicion level

//separate out top pair vs middle pair vs bottom pair for hand ranks
//give each player an individual willDraw level



//DONE
//fixed moving to next hand - changed index on seatPosition
//fix bet/check/raise/fold divs
//dealPublicCards now sets currentPlayer to SB, fixes several bugs
//bug where if betting reaches player and their raise is called, they auto win the pot
//postFLopAction bug where if it checks to the player, it automatically checks through
//check if board pairs - if so, opponents don't bet flop
//bugfixing for hand divs; added state.actionOnPlayer

async function updateState(newStateObj) {
    state = {...newStateObj}
    await renderScreen(state)
    return state
}

async function renderScreen(stateObj) {
    if (stateObj.currentScreen === "chooseVisibleCard") {
        await chooseHoleCardToBeVisiblePokerTable(stateObj)
    } else if (stateObj.currentScreen === "renderTable") {
        createPokerTable()
    }
}

async function startGame() {
    await newHand(state, true)
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
    console.log("dealing")
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

async function dealPublicCards(stateObj, numberCards) {
    console.log("dealing " + numberCards + " cards")
    stateObj = await makeCurrentPlayer(stateObj, "SB")

    stateObj = immer.produce(stateObj, (newState) => {
        newState.currentBet = 0;
        newState.players.forEach(player => {
            player.currentBet = 0
            player.hasChecked = false;
        })
    })
    
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

async function playerFolds(stateObj, playerIndex) {
    stateObj = immer.produce(stateObj, (newState) => {
        newState.players[playerIndex].isStillInHand = false
    })
    await updateState(stateObj)
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

async function makeCurrentPlayer(stateObj, playerIndex) {
    stateObj = immer.produce(stateObj, (newState) => {
        newState.currentPlayer = playerIndex
    })
    stateObj = await updateState(stateObj)
    return stateObj
}

async function putInBlinds(stateObj) {
    const SBIndex = stateObj.players.findIndex(player => player.currentSeat === "SB")
    const BBIndex = stateObj.players.findIndex(player => player.currentSeat === "BB")

    stateObj = await makeCurrentPlayer(stateObj, "SB")
    stateObj = await putInBet(stateObj, SBIndex, 1)
    await pause(500)

    stateObj = await makeCurrentPlayer(stateObj, "BB")
    stateObj = await putInBet(stateObj, BBIndex, 3)
    await pause(500)
    stateObj = await makeCurrentPlayer(stateObj, "UTG")
    return stateObj
}

async function preFlopAction(stateObj) { 
    console.log('starting preflop action')
    if (stateObj.actionOnPlayer === false) {
        for (let i=0; i < stateObj.players.length; i++) {
            //just find the player whose current seat matches state.currentPlayer
            const playerInd = stateObj.players.findIndex(player => player.currentSeat === stateObj.currentPlayer);
            player = stateObj.players[playerInd];
            //if the current players bet has matched the current bet, then it's time for the flop
            if (player.currentBet === stateObj.currentBet) {
                let playersStillInHand = stateObj.players.filter(player => player.isStillInHand);
                //if everyone's folded player has won the pot
                if (playersStillInHand.length === 1) {
                    console.log("currentPlayer wins the pot as everyone folds")
                    stateObj = immer.produce(stateObj, (newState) => {
                        newState.players[playerInd].stackSize += newState.currentPot
                        newState.currentPot = 0
                    })
                    stateObj = await newHand(stateObj)
                    return stateObj
                //otherwise, it's time to see a flop
                } else {
                    if (player.name === "player" && player.currentSeat === "BB"){
                        console.log("as big blind, player has check option")
                        stateObj = await actionOnPlayer(stateObj, true)
                    } else {
                        console.log("preflop action closed - time to see a flop")
                        stateObj = await dealPublicCards(stateObj, 3)
                        stateObj = await postFlopAction(stateObj)
                        return stateObj
                    }  
                }
            } else if (player.isStillInHand === false) {
                //skip the player because they're no longer in the hand
            } else if (player.name === "player") {
                stateObj = await actionOnPlayer(stateObj, true)
                return stateObj
            } else {
                //if no raise yet
                const callThreshold = player.callwithJunkPreFlopPercentage
                const callValue = Math.random()
                //console.log(player.name + " has a call value of " + callValue.toFixed(2) + " and a threshold of " + callThreshold.toFixed(2))
                const willCall = callValue < player.callwithJunkPreFlopPercentage
                let moneyIn = stateObj.currentBet
                if (stateObj.currentBet === 3) {
                    //####FIX - SHOULD INSTEAD CONSTRUCT EACH PLAYER TO HAVE A FOURBET AND RFI RANGE 
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
                            stateObj = await playerFolds(stateObj, playerInd)
                        }
                    }
                } else if (stateObj.currentBet < 25) {
                    if (isHandInRange(player.currentHand, premiumHands)) {
                        console.log(player.name + " raises with a 4bet hand to " + moneyIn*3)
                        stateObj = await putInBet(stateObj, playerInd, moneyIn*3)
                    } else if (isHandInRange(player.currentHand, raiseFirstIn[player.currentSeat])) {
                        stateObj = await putInBet(stateObj, playerInd, moneyIn)
                        console.log(player.name + " calls " + moneyIn + " loosely")
                    } else if ((callValue*2 < callThreshold)) {
                        stateObj = await putInBet(stateObj, playerInd, moneyIn)
                        console.log(player.name + " calls " + moneyIn + " as a bluff")
                    } else {
                        stateObj = await playerFolds(stateObj, playerInd)
                    }
                } else {
                    if (isHandInRange(player.currentHand, premiumHands)) {
                        console.log(player.name + " raises to " + moneyIn*3)
                        stateObj = await putInBet(stateObj, playerInd, moneyIn*3)
                    } else if ((isHandInRange(player.currentHand, raiseFirstIn["Dealer"]))) {
                        stateObj = await putInBet(stateObj, playerInd, moneyIn)
                        console.log(player.name + " calls " + moneyIn + " loosely")
                    } else {
                        stateObj = await playerFolds(stateObj, playerInd)
                    }
                }
            }
            stateObj = await nextPlayer(stateObj)
            await pause(500)
            await updateState(stateObj) 
        }
        stateObj = await updateState(stateObj)
    }
    return stateObj
    
}

async function postFlopAction(stateObj) {
    console.log('starting postflop action')
    if (stateObj.actionOnPlayer === false) {
        //reset bets to 0 for the flop 
        for (let i=0; i < stateObj.players.length; i++) {
            const playerInd = stateObj.players.findIndex(player => player.currentSeat === stateObj.currentPlayer);
            player = stateObj.players[playerInd];
            if ( (player.currentBet === stateObj.currentBet && stateObj.currentBet !== 0) || (player.hasChecked === true && stateObj.currentBet === 0)) {
                let playersStillInHand = stateObj.players.filter(player => player.isStillInHand);
                if (playersStillInHand.length ===1) {
                    stateObj = await determineHandWinner(stateObj)
                    stateObj = await newHand(stateObj)
                }
                if (stateObj.publicCards.length < 5) {
                    stateObj = await dealPublicCards(stateObj, 1)
                    stateObj = await postFlopAction(stateObj)
                } else {
                    stateObj = await determineHandWinner(stateObj)
                    stateObj = await newHand(stateObj)
                }
                return stateObj
            } else if (player.isStillInHand === false) {
                //skip the player because they're no longer in the hand
            } else if (player.name === "player") {
                console.log("you found the player so postflop action stopped")
                // console.log("postflopoption:", JSON.stringify(stateObj));
                return stateObj
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
                            stateObj = await playerChecks(stateObj, playerInd)
                            console.log(player.name + " checks as a trap")
                        }
                    } else {
                        //if player has bad hand, they bluff at pot sometimes
                        if (bluffOrTrap < 0.2) {
                            console.log(player.name + " bluffs out for half pot: " + stateObj.currentPot/2)
                            stateObj = await putInBet(stateObj, playerInd, stateObj.currentPot/2)
                        } else {
                            stateObj = await playerChecks(stateObj, playerInd)
                            console.log(player.name + " checked with a bad hand")
                        }
                    }
                } else if (stateObj.currentBet < 30) {
                    if (playerHandRank >= 3) {
                        //even if player has good hand, they trap sometimes
                        if (bluffOrTrap > 0.2) {
                            console.log(player.name + " raises for " + stateObj.currentBet*2)
                            stateObj = await putInBet(stateObj, playerInd, stateObj.currentBet*2) 
                        } else {
                            stateObj = await putInBet(stateObj, playerInd, stateObj.currentBet)
                            console.log(player.name + " calls for " + stateObj.currentBet)
                        } 
                    } else if (playerHandRank>1) {
                        //even if player has decent hand, they still fold sometimes
                        if (bluffOrTrap > 0.1) {
                            console.log(player.name + " calls for " + stateObj.currentBet)
                            stateObj = await putInBet(stateObj, playerInd, stateObj.currentBet) 
                        } else {
                            console.log(player.name + " folded with a decent hand")
                            stateObj = await playerFolds(stateObj, playerInd)
                        } 
                    } else {
                        //players sometimes call even with terrible hand
                        if (bluffOrTrap < 0.1) {
                            console.log(player.name + " calls as bluff for " + stateObj.currentBet)
                            stateObj = await putInBet(stateObj, playerInd, stateObj.currentBet) 
                        } else {
                            stateObj = await playerFolds(stateObj, playerInd)
                            console.log(player.name + " folded with a bad hand")
                        }
                    }
                //in a big pot, players need a good hand to stick around
                } else {
                    if (playerHandRank >= 4) {
                        //even if player has good hand, they trap sometimes
                        if (bluffOrTrap > 0.1) {
                            console.log(player.name + " raises for " + stateObj.currentBet*2)
                            stateObj = await putInBet(stateObj, playerInd, stateObj.currentBet*2) 
                        } else {
                            stateObj = await putInBet(stateObj, playerInd, stateObj.currentBet)
                            console.log(player.name + " calls as a trap for " + stateObj.currentBet)
                        } 
                    } else if (playerHandRank == 3) {
                        //players trap slightly more often with draws or two pair
                        if (bluffOrTrap > 0.25) {
                            console.log(player.name + " raises for " + stateObj.currentBet*2)
                            stateObj = await putInBet(stateObj, playerInd, stateObj.currentBet*2) 
                        } else {
                            stateObj = await putInBet(stateObj, playerInd, stateObj.currentBet)
                            console.log(player.name + " calls as a trap for " + stateObj.currentBet)
                        } 
                    } else if (playerHandRank > 1) {
                        //even if player has a pair, they still fold sometimes
                        if (bluffOrTrap > 0.4) {
                            console.log(player.name + " calls for " + stateObj.currentBet)
                            stateObj = await putInBet(stateObj, playerInd, stateObj.currentBet) 
                        } else {
                            console.log(player.name + " folded with a decent hand")
                            stateObj = await playerFolds(stateObj, playerInd)
                        } 
                    } else {
                        //players fold with nothing if the pot is big
                        console.log(player.name + " folded with nothing")
                        stateObj = await playerFolds(stateObj, playerInd)
                    }
                }
            }
            stateObj = await nextPlayer(stateObj)
            await pause(500)
            await updateState(stateObj) 
        }
        await updateState(stateObj)
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


async function chooseHoleCardToBeVisiblePokerTable(stateObj) {
    document.body.innerHTML = ''
    // Create table div
    const tableDiv = document.createElement('div');
    tableDiv.id = 'tableDiv';
    document.body.appendChild(tableDiv);

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
    let foldDiv = createFoldDiv(stateObj)
    const callDiv = createCallDiv(stateObj)
    const betDiv = createBetDiv(stateObj)
    let RaiseDiv = createRaiseDiv(stateObj)
    const checkDiv = createCheckDiv(stateObj)
    
    const playerIndex = stateObj.players.findIndex(player => player.name === "player") 
    if (stateObj.currentBet === 0) {
        document.body.append(checkDiv, betDiv)
    } else if (stateObj.players[playerIndex] == "BB" && stateObj.currentBet === 3) {
        document.body.append(checkDiv, RaiseDiv)
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
            newState.players[winnerindex].stackSize += newState.currentPot
            console.log (newState.currentPot + " pot given to " + newState.players[winnerindex].name)
        })
    }
    stateObj = immer.produce(stateObj, (newState) => {
        newState.players.forEach(player => {
            player.currentBet = 0
            player.isStillInHand = true
            player.currentHand = []
            player.hasChecked = false;
            if (player.name !== "player") {
                player.leftCardVisible = false;
                player.rightCardVisible = false
            }
            
        })
        
        //
        newState.currentPot = 0
        newState.currentBet = 0
        newState.publicCards = []
        newState.actionOnPlayer = false;
    })
    return stateObj
}


async function newHand(stateObj, firstHand=false) {

    stateObj = await resetHand(stateObj)
    if (!firstHand) {
        stateObj = await moveButton(stateObj)
    }
    stateObj = await updateState(stateObj)
    
    stateObj = await createDeckAndShuffle(stateObj)
    stateObj = await dealToEachPlayer(stateObj)
    stateObj = await dealToEachPlayer(stateObj)
    stateObj = await putInBlinds(stateObj)
    stateObj = await preFlopAction(stateObj)
    await renderScreen(stateObj)
}


startGame()

