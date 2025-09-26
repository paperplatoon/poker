function createPlayerDiv(player, positionTop, positionLeft, cardFunctionString) {
    const playerDiv = createDiv('playerDiv')
    playerDiv.style.top = positionTop;
    playerDiv.style.left = positionLeft;

    if (player.name === "player") {
        const suspicionContainer = document.createElement("div");
        suspicionContainer.classList.add("player-suspicion");

        const fillDiv = document.createElement("div");
        fillDiv.classList.add("player-suspicion-fill");
        const percentage = player.maxSuspicion === 0 ? 0 : Math.min(100, Math.round((player.currentSuspicion / player.maxSuspicion) * 100));
        fillDiv.style.width = percentage + "%";

        const labelSpan = document.createElement("span");
        labelSpan.classList.add("player-suspicion-label");
        labelSpan.textContent = `Suspicion ${player.currentSuspicion}/${player.maxSuspicion}`;

        suspicionContainer.append(fillDiv, labelSpan);
        playerDiv.append(suspicionContainer);
    }

    const playerTopRowDiv = createDiv('playerTopRowDiv')
    const playerNameDiv = createDiv('playerNameDiv', player.name)
    const playerSeatDiv = createDiv('playerSeatDiv', player.currentSeat)
    playerTopRowDiv.append(playerNameDiv, playerSeatDiv)

    const playerBottomRowDiv = createDiv('playerTopRowDiv')
    const playerStackDiv = createDiv('playerNameDiv', player.stackSize)
    const playerBetDiv =  player.currentBet
    
    playerBottomRowDiv.append(playerStackDiv, playerBetDiv)

    const playerCardsDiv = createPlayerCardsDiv(player, cardFunctionString)
    if (!player.isStillInHand) {
        playerDiv.classList.add("fold")
    }

    if (state.currentPlayer === player.currentSeat) {
        playerDiv.classList.add("active-player")
    }

    playerDiv.append(playerTopRowDiv, playerCardsDiv, playerBottomRowDiv)
    return playerDiv
}

function createPlayerCardsDiv(player, cardFunctionString) {
    const playerCardsDiv = createDiv('playerCardsDiv');
    //loop through cards
    for (let j = 0; j < 2; j++) {
        const cardDiv = createDiv('cardDiv');
        //if you're in the 'Choose a card to turn visible' state
        if (cardFunctionString=="chooseToTurnVisible") {
            cardDiv.classList.add('card-clickable');
            if (j===0) {
                cardDiv.onclick = async function() {
                    await makeCardVisible(state, player, 0);
                };
            } else {
                cardDiv.onclick = async function() {
                    await makeCardVisible(state, player, 1);
                };
            }
        } else if (cardFunctionString === "chooseToSwap") {
            cardDiv.classList.add('card-clickable');
            if (j===0) {
                cardDiv.onclick = async function() {
                    await swapHandWithDeck(state, player, 0);
                };
            } else {
                cardDiv.onclick = async function() {
                    await swapHandWithDeck(state, player, 1);
                };
            }
        } else if (cardFunctionString === "swapPlayerNPC") {
            cardDiv.classList.add('card-clickable');
            if (j===0) {
                cardDiv.onclick = async function() {
                    await swapWithPlayerLowestCard(state, player, 0);
                };
            } else {
                cardDiv.onclick = async function() {
                    await swapWithPlayerLowestCard(state, player, 1);
                };
            }
        }
        //if cards are visible, show their value; if not, add the invisible class
        if ( (j===0 && player.leftCardVisible) ||  (j===1 && player.rightCardVisible) ) {
            cardDiv.textContent = player.currentHand[j]
        } else {
            cardDiv.classList.add("not-visible") 
        }      
        if (player.currentHand.length > 1) {
            cardDiv.classList.add(player.currentHand[j][1])
        }
        playerCardsDiv.appendChild(cardDiv);
    }
    return playerCardsDiv
}

function createDiv(classListName, textString=false) {
    let tempDiv = document.createElement('div');
    tempDiv.classList.add(classListName);
    if (textString) {
        tempDiv.textContent = textString
    }
    return tempDiv
}

function createPokerTableDiv(stateObj) {
    // Create table div
    const tableDiv = document.createElement('div');
    tableDiv.id = 'tableDiv';
    document.body.appendChild(tableDiv);

    // Create player divs and card divs
    const positions = [
        { top: '10%', left: '50%' },
        { top: '30%', left: '10%' },
        { top: '70%', left: '10%' },
        { top: '90%', left: '50%' },
        { top: '70%', left: '90%' },
        { top: '30%', left: '90%' }
    ];

    for (let i = 0; i < 6; i++) {
        let player = state.players[i]

        const playerDiv = document.createElement('div');
        playerDiv.classList.add('playerDiv');
        playerDiv.style.top = positions[i].top;
        playerDiv.style.left = positions[i].left;

        const playerTopRowDiv = createDiv('playerTopRowDiv')
        const playerNameDiv = createDiv('playerNameDiv', player.name)
        const playerSeatDiv = createDiv('playerSeatDiv', player.currentSeat)
        playerTopRowDiv.append(playerNameDiv, playerSeatDiv)

        const playerBottomRowDiv = createDiv('playerTopRowDiv');

        tableDiv.appendChild(playerDiv);

        const playerCardsDiv = document.createElement('div');
        playerCardsDiv.classList.add('playerCardsDiv');

        for (let j = 0; j < 2; j++) {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('cardDiv');
            if ( (j===0 && player.leftCardVisible) ||  (j===1 && player.rightCardVisible) ) {
                cardDiv.textContent = player.currentHand[j]    
            } else {
                cardDiv.textContent = ""
                cardDiv.classList.add("not-visible") 
            }
            playerCardsDiv.appendChild(cardDiv);
        }
        playerDiv.append(playerTopRowDiv, playerCardsDiv)
    }
}

function createPotDiv(stateObj) {
    const potDiv = document.createElement('div');
    potDiv.classList.add('playerNameDiv');
    potDiv.classList.add('pot-div');
    potDiv.textContent = "Pot: " + stateObj.currentPot;
    return potDiv
}
function createPublicCardsDiv(stateObj) {
    const publicCardsDiv = document.createElement('div');
    publicCardsDiv.classList.add('public-cards-div');
    for (let i=-0; i < stateObj.publicCards.length; i++) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('cardDiv');
        cardDiv.classList.add(stateObj.publicCards[i][1])
        cardDiv.textContent = stateObj.publicCards[i]
        publicCardsDiv.append(cardDiv)
    }
    return publicCardsDiv
}

function createBettingDiv(buttonString) {
    const bettingDiv = document.createElement('div');
    bettingDiv.classList.add('action-div', 'centered')
    bettingDiv.textContent = buttonString
    return bettingDiv
}

function createRaiseDiv(stateObj) {
    let RaiseDiv = document.createElement('div');
    RaiseDiv.classList.add('action-div', 'centered')
    RaiseDiv.textContent = "Raise"
    RaiseDiv.onclick = async function() {
        stateObj = {...state}
        const playerIndex = stateObj.players.findIndex(player => player.name === "player");
        const currentBet = stateObj.currentBet;
        const targetBet = currentBet === 0 ? 3 : Math.max(currentBet * 3, currentBet + 3);
        const roundedTarget = Math.ceil(targetBet);
        stateObj = await putInBet(stateObj, playerIndex, roundedTarget)
        console.log('player raised to ' + roundedTarget)
        stateObj = await nextPlayer(stateObj)
        stateObj = await actionOnPlayer(stateObj, false)
        if (stateObj.publicCards.length === 0) {
            await preFlopAction(stateObj)
        } else {
            await postFlopAction(stateObj)
        }
    }
    return RaiseDiv
}

function createFoldDiv(stateObj) {
    let foldDiv = document.createElement('div');
    foldDiv.classList.add('action-div', 'centered')
    foldDiv.textContent = "Fold"
    foldDiv.onclick = async function() {
        stateObj = await actionOnPlayer(stateObj, false)
        const playerIndex = stateObj.players.findIndex(player => player.name === "player");
        stateObj = await playerFolds(stateObj, playerIndex)
        await newHand(stateObj)
    }
    return foldDiv
}

function createSeeCardDiv(stateObj) {
    let seeCardDiv = document.createElement('div');
    seeCardDiv.classList.add('spell-div', 'centered');
    seeCardDiv.textContent = "See Hole Card [+3]"
    if (stateObj.currentScreen === "chooseVisibleCard") {
        seeCardDiv.classList.add('spell-selected');
    }
    seeCardDiv.onclick = async function() {
        await changeCurrentScreen(stateObj, "chooseVisibleCard")
    }
    return seeCardDiv
}

function createSwapCardDiv(stateObj) {
    let seeCardDiv = document.createElement('div');
    seeCardDiv.classList.add('spell-div', 'centered');
    seeCardDiv.textContent = "Swap Hole Card [+4]"
    if (stateObj.currentScreen === "chooseToSwap") {
        seeCardDiv.classList.add('spell-selected');
    }
    seeCardDiv.onclick = async function() {
        await changeCurrentScreen(stateObj, "chooseToSwap")
    }
    return seeCardDiv
}

function createSwapPlayerCardDiv(stateObj) {
    let seeCardDiv = document.createElement('div');
    seeCardDiv.classList.add('spell-div', 'centered');
    seeCardDiv.textContent = "Swap With Your Lowest Card [+5]"
    if (stateObj.currentScreen === "swapPlayerNPC") {
        seeCardDiv.classList.add('spell-selected');
    }
    seeCardDiv.onclick = async function() {
        await changeCurrentScreen(stateObj, "swapPlayerNPC")
    }
    return seeCardDiv
}

function createCallDiv(stateObj) {
    const callDiv = document.createElement('div');
    callDiv.classList.add('action-div', 'centered');
    callDiv.textContent = "Call"
    callDiv.onclick = async function() {
        stateObj = {...state}
        console.log('clicked call div')
        console.log("StateObj at onclick", stateObj);
        const playerIndex = stateObj.players.findIndex(player => player.name === "player");
        const moneyIn = stateObj.currentBet - stateObj.players[playerIndex].currentBet
        stateObj = await putInBet(stateObj, playerIndex, moneyIn)
        stateObj = await nextPlayer(stateObj)
        stateObj = await actionOnPlayer(stateObj, false)
        
        if (stateObj.publicCards.length === 0) {
            console.log("about to trigger preflopaction for call div")
            await preFlopAction(stateObj)
        } else {
            await postFlopAction(stateObj)
        }
    }
    return callDiv
}

function createBetDiv(stateObj) {
    const betDiv = document.createElement('div');
        betDiv.classList.add('action-div', 'centered')
        betDiv.textContent = "Bet"
        betDiv.onclick = async function() {
            stateObj = {...state}
            console.log('clicked bet div')
            const playerIndex = stateObj.players.findIndex(player => player.name === "player");
            const moneyIn = (stateObj.currentPot/2)
            stateObj = await putInBet(stateObj, playerIndex, moneyIn)
            stateObj = await nextPlayer(stateObj)
            stateObj = await actionOnPlayer(stateObj, false)
            await postFlopAction(stateObj)
        }
    return betDiv
}

function createCheckDiv(stateObj) {
    const checkDiv = document.createElement('div');
    checkDiv.classList.add('action-div', 'centered')
    checkDiv.textContent = "Check"
    checkDiv.onclick = async function() {
        stateObj = {...state}
        console.log('clicked check div')
        stateObj = await actionOnPlayer(stateObj, false)
        const playerIndex = stateObj.players.findIndex(player => player.name === "player");
        stateObj = await playerChecks(stateObj, playerIndex)
        if (stateObj.publicCards.length === 0) {
            console.log("preflop action closed")
            stateObj = await dealPublicCards(stateObj, 3)
        } else {
            stateObj = await nextPlayer(stateObj)
        }
        await postFlopAction(stateObj)
    }
    return checkDiv
}
