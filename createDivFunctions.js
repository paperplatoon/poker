function createPlayerDiv(player, positionTop, positionLeft, cardFunctionString) {
    const playerDiv = createDiv('playerDiv')
    playerDiv.style.top = positionTop;
    playerDiv.style.left = positionLeft;

    const playerTopRowDiv = createDiv('playerTopRowDiv')
    const playerNameDiv = createDiv('playerNameDiv', player.name)
    const playerSeatDiv = createDiv('playerSeatDiv', player.currentSeat)
    playerTopRowDiv.append(playerNameDiv, playerSeatDiv)

    const playerBottomRowDiv = createDiv('playerTopRowDiv')
    const playerStackDiv = createDiv('playerNameDiv', player.stackSize)
    const playerBetDiv = createDiv('playerNameDiv', player.orderNumber)
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
            if (j===0) {
                cardDiv.onclick = async function() {
                    await makeCardVisible(state, player, 0);
                };
            } else {
                cardDiv.onclick = async function() {
                    await makeCardVisible(state, player, 1);
                };
            }
        }
        //if cards are visible, show their value; if not, add the invisible class
        if ( (j===0 && player.leftCardVisible) ||  (j===1 && player.rightCardVisible) ) {
            cardDiv.textContent = player.currentHand[j]
        } else {
            cardDiv.classList.add("not-visible") 
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

function createPokerTableDiv() {
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
    potDiv.textContent = "Pot: " + stateObj.currentPot;
    potDiv.style.top = "70%";
    potDiv.style.left = "70%";

    return potDiv
}
function createPublicCardsDiv(stateObj) {
    const publicCardsDiv = document.createElement('div');
    publicCardsDiv.classList.add('public-cards-div');
    publicCardsDiv.style.top = "50%"
    publicCardsDiv.style.left = "50%"
    for (let i=-0; i < stateObj.publicCards.length; i++) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('cardDiv');
        cardDiv.textContent = stateObj.publicCards[i]
        publicCardsDiv.append(cardDiv)
    }
    return publicCardsDiv
}

function createBettingDiv(buttonString) {
    const bettingDiv = document.createElement('div');
    bettingDiv.classList.add('action-div');
    bettingDiv.textContent = buttonString
    bettingDiv.style.top = '10%';
    bettingDiv.style.left = '70%';
    return bettingDiv
}

function createRaiseDiv(stateObj) {
    let RaiseDiv = document.createElement('div');
    RaiseDiv.classList.add('action-div');
    RaiseDiv.textContent = "Raise"
    RaiseDiv.style.top = '10%';
    RaiseDiv.style.left = '70%';
    RaiseDiv.onclick = async function() {
        const playerIndex = stateObj.players.findIndex(player => player.name === "player");
        const moneyIn = (stateObj.currentBet - stateObj.players[playerIndex].currentBet) * 3
        stateObj = await putInBet(stateObj, playerIndex, moneyIn)
        console.log('player raised to ' + state.currentBet)
        stateObj = await nextPlayer(stateObj)
        if (stateObj.publicCards.length === 0) {
            stateObj = await preFlopAction(stateObj)
        } else {
            stateObj = await postFlopAction(stateObj)
        }
    }
    return RaiseDiv
}

function createFoldDiv(stateObj) {
    let foldDiv = document.createElement('div');
    foldDiv.classList.add('action-div');
    foldDiv.textContent = "Fold"
    foldDiv.style.top = '10%';
    foldDiv.style.left = '70%';
    foldDiv.onclick = async function() {
        console.log('clicked fold div')
        const playerIndex = stateObj.players.findIndex(player => player.name === "player");
        stateObj = await playerFolds(stateObj, playerIndex)
        newHand(stateObj)
    }

    return foldDiv
}
    

