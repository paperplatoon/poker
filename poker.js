function getBestPokerHand(cards) {
    let bestHand = [];
    let bestHandRank = -1;

    //sort cards from high to low to make sure that best hands start highest
    cards.sort((a, b) => {
        let rankA = getCardRank(a);
        let rankB = getCardRank(b);
        return rankB - rankA;
    });

    // Generate all combinations of 5 cards
    let cardHandLength = cards.length

    for (let i = 0; i < cardHandLength; i++) {
        for (let j = i + 1; j < cardHandLength; j++) {
            for (let k = j + 1; k < cardHandLength; k++) {
                for (let l = k + 1; l < cardHandLength; l++) {
                    for (let m = l + 1; m < cardHandLength; m++) {
                        let currentHand = [cards[i], cards[j], cards[k], cards[l], cards[m]];
                        let currentHandRank = evaluatePokerHand(currentHand);

                        if (currentHandRank > bestHandRank) {
                            bestHand = currentHand;
                            bestHandRank = currentHandRank;
                        }
                    }
                }
            }
        }
    }

    //sort best hand from high to low
    bestHand.sort((a, b) => {
        let rankA = getCardRank(a);
        let rankB = getCardRank(b);
        return rankB - rankA;
    });

    if (bestHandRank === 8 || bestHandRank === 7 || bestHandRank === 4 || bestHandRank === 3 || bestHandRank === 2) { 
        bestHand = putPairedCardsFirst(bestHand)     
    }

    return [bestHand, bestHandRank];
}

function putPairedCardsFirst(cardArray) {
    let pairStrings = [];
    let pairRanks = []
    let nonPairStrings = [];
    let nonPairRanks = [];

    cardArray.forEach(card => {
        let cardRank = getCardRank(card);
        if (pairRanks.includes(cardRank)) {
            pairStrings.push(card)
            pairRanks.push(cardRank)
        } else if (nonPairRanks.includes(cardRank)) {
            let index = nonPairRanks.indexOf(cardRank)
            pairRanks.push(nonPairRanks[index])
            nonPairRanks.splice(index, 1)
            pairRanks.push(cardRank)
            
            pairStrings.push(nonPairStrings[index])
            nonPairStrings.splice(index, 1)
            pairStrings.push(card)
        } else {
            nonPairStrings.push(card);
            nonPairRanks.push(cardRank)
        }
    });

    let duplicates = pairStrings.sort((a, b) => {
        let rankA = getCardRank(a);
        let rankB = getCardRank(b);
        return rankB - rankA;
    });

    let nonDuplicates = nonPairStrings.sort((a, b) => {
        let rankA = getCardRank(a);
        let rankB = getCardRank(b);
        return rankB - rankA;
    });

    return duplicates.concat(nonDuplicates);
}

function evaluatePokerHand(hand) {
    // Sort the hand by rank - works
    hand.sort((a, b) => {
        let rankA = getCardRank(a);
        let rankB = getCardRank(b);
        return rankA - rankB;
    });

    let isFlush = isHandFlush(hand);
    let isStraight = isHandStraight(hand);
    let ranks = getCardRanks(hand);
    let rankCounts = getRankCounts(ranks);
    let isHandDraw = isADraw(hand) 

    if (isFlush && isStraight) {
        if (ranks[0] === 10) {
            return 10; // Royal Flush
        } else {
            return 9; // Straight Flush
        }
    }
    let highestCurrentRank = 1;

    if (hasSameRankCount(rankCounts, 4)) {
        return 8; // Four of a Kind
    }

    if (hasSameRankCount(rankCounts, 3) && hasSameRankCount(rankCounts, 2)) {
        return 7; // Full House
    }

    if (isFlush) {
        return 6; // Flush
    }

    if (isStraight) {
        return 5; // Straight
    }

    if (hasSameRankCount(rankCounts, 3)) {
        return 4; // Three of a Kind
    }

    if (isTwoPair(Object.values(rankCounts))) {
        return 3; // Two Pair
    }

    if(isHandDraw) {
        return 3;
    }

    if (hasSameRankCount(rankCounts, 2)) {
        return 2; // One Pair
    }

    return 1; // High Card
}

function getCardRank(card) {
    return '23456789TJQKA'.indexOf(card[0]) + 2;
    //return 'AKQJT98765432'.indexOf(card[0]) + 2;
}

function getCardSuit(card) {
    return card[1];
}

function isHandFlush(hand) {
    let suit = getCardSuit(hand[0]);
    let isFlush = hand.every(card => getCardSuit(card) === suit);
    return isFlush;
}

function isHandStraight(hand) {
    let ranks = getCardRanks(hand);
    let minRank = Math.min(...ranks);
    let maxRank = Math.max(...ranks);
    return maxRank - minRank === 4 && new Set(ranks).size === 5;
}

function isADraw(hand) {
    // Check for 4 to a straight
    let hasStraight = false;
    for (let i = 0; i <= 1; i++) {
        if (hand[i + 1] - hand[i] === 1 && hand[i + 2] - hand[i + 1] === 1 && hand[i + 3] - hand[i + 2] === 1) {
            hasStraight = true;
            console.log("hand is a straight draw")
            break;
        }
    }

    // Check for 4 to a flush
    let suits = hand.map(card => card[1]);
    let suitCounts = {};
    suits.forEach(suit => {
        suitCounts[suit] = suitCounts[suit] ? suitCounts[suit] + 1 : 1;
    });
    let hasFlush = Object.values(suitCounts).some(count => count >= 4);
    if (hasFlush) { console.log("hand is a flush draw")}

    return hasStraight || hasFlush;
}

function getCardRanks(hand) {
    return hand.map(card => getCardRank(card));
}

function getRankCounts(ranks) {
    let counts = {};
    ranks.forEach(rank => {
        counts[rank] = counts[rank] ? counts[rank] + 1 : 1;
    });
    return counts;
}

function hasSameRankCount(rankCounts, count, excluding = 0) {
    return Object.values(rankCounts).filter(c => c !== excluding).includes(count);
}


function isTwoPair(array) {
    let count = 0;
    for (let i = 0; i < array.length; i++) {
        if (array[i] === 2) {
            count++;
        }
    }
    return count === 2;
}

function compareHands(hand1, hand2) {
    let resultsHand1 = getBestPokerHand(hand1)
    let rankHand1 = resultsHand1[1]
    let bestHand1 = resultsHand1[0]

    let resultsHand2 = getBestPokerHand(hand2)
    let rankHand2 = resultsHand2[1]
    let bestHand2 = resultsHand2[0]

    if (rankHand1 > rankHand2) {
        return "Hand 1 wins with rank " + rankHand1;
    } else if (rankHand2 > rankHand1) {
        return "Hand 2 wins with rank " + rankHand2;

    ///NEED SPECIAL LOGIC BECAUSE JUDGING PAIR AND TWO PAIR HANDS AGAINST EACH OTHER ISN'T RIGHT LOL, PROB NOT FULL HOUSE OR THREE/FOUR OF A KIND EITHER
    } else {

        // If hands have the same rank, compare the highest cards
        let ranks1 = getCardRanks(bestHand1);
        let ranks2 = getCardRanks(bestHand2);

        for (let i = 0; i < ranks1.length; i++) {
            if (ranks1[i] > ranks2[i]) {
                return "Hand 1 wins with rank " + rankHand1;
            } else if (ranks2[i] > ranks1[i]) {
                return "Hand 2 wins with rank " + rankHand2;
            }
        }

        return "It's a tie";
    }
}


function shuffle(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards
}

function createDeckAndShuffle() {
    let fullDeck = [];
    let ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    let suits = ['h', 'c', 'd', 's']; // Hearts, Clubs, Diamonds, Spades

    suits.forEach(suit => {
        ranks.forEach(rank => {
            fullDeck.push(rank + suit);
        });
    });

    fullDeck = shuffle(fullDeck)
    state.currentDeck = fullDeck
    return fullDeck 
}

function testFunction() {
    let fullDeck = createDeckAndShuffle();
    let hand1 = fullDeck.splice(0, 7)
    let hand2 = fullDeck.splice(0, 7)

    return [hand1, hand2]
}

function dealToEachPlayer() {
    state.players.forEach(player => {
        player.currentHand.push(state.currentDeck[0])
        state.currentDeck.splice(0, 1)
    })
}

function dealPublicCards(numberCards) {
    for (let i=0; i < numberCards; i++) {
        state.publicCards.push(state.currentDeck[0])
        state.currentDeck.splice(0, 1)
    }
}

function isHandInRange(playerCards, playerRange) {
    const sortedPlayerCards = playerCards.sort();

    for (let hand of playerRange) {
        // Sort the hand for comparison
        let sortedHand = hand.sort();
        if (arraysAreEqual(sortedPlayerCards, sortedHand)) {
            return true;
        }
    }
    return false;
}

// Helper function to check if two arrays are equal
function arraysAreEqual(arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}

function putInBet(playerIndex, betSize) {
    let playerBet = state.players[playerIndex].currentBet
    let extraMoney = betSize- playerBet
    //is the player putting in all their money?
    extraMoney = (state.players[playerIndex].stackSize >= (extraMoney)) ? extraMoney : state.players[playerIndex].stackSize;
    state.players[playerIndex].stackSize -= extraMoney;
    state.players[playerIndex].currentBet += extraMoney
    //is the current bet larger
    state.currentBet = (state.players[playerIndex].currentBet > state.currentBet) ? state.players[playerIndex].currentBet : state.currentBet
    state.currentPot += extraMoney;
    return extraMoney;
}

function putOutBlinds(state) {
    let SBIndex = (state.currentDealer < 5) ? state.currentDealer+1 : 0
    let BBIndex = (state.currentDealer < 4) ? state.currentDealer+2 : (state.currentDealer  - 4)
    let hijackIndex = (state.currentDealer < 3) ? state.currentDealer+3 : (state.currentDealer  - 3)
    let lojackIndex = (state.currentDealer < 2) ? state.currentDealer+4 : (state.currentDealer  - 2)
    let buttonIndex = (state.currentDealer < 1) ? 5 : (state.currentDealer  - 1)

    smallBlind = putInBet(SBIndex, 1)
    bigBlind = putInBet(BBIndex, 3)
    state.currentPlayer = (BBIndex < 5) ? BBIndex+1 : 0
    state.players[state.currentDealer].currentSeat = 0
    state.players[SBIndex].currentSeat = 1
    state.players[BBIndex].currentSeat = 2
    state.players[hijackIndex].currentSeat = 3
    state.players[lojackIndex].currentSeat = 4
    state.players[buttonIndex].currentSeat = 5

}

function preFlopAction() { 
    const playerIndex = state.players.findIndex(player => player.name === "player");
    let firstIndex = state.currentPlayer
    let lastIndex = (firstIndex < playerIndex) ? (playerIndex-firstIndex) : (5-firstIndex+1+playerIndex)
    lastIndex = (playerIndex === firstIndex) ? playerIndex : lastIndex

    for (let i=0; i < lastIndex; i++) {
        playerInd = state.currentPlayer
        player = state.players[playerInd];
        if (player.name === "player") {
            return true
        } else if (player.currentBet === state.currentBet) {
            console.log("preflop action closed")
            dealPublicCards(3)
            renderScreen(state)
            postFlopAction()
            return true
        } else if (player.isStillInHand !== false) {
            //if no raise yet
            const callThreshold = player.callwithJunkPreFlopPercentage
            const callValue = Math.random()
            //console.log(player.name + " has a call value of " + callValue.toFixed(2) + " and a threshold of " + callThreshold.toFixed(2))
            const willCall = callValue < player.callwithJunkPreFlopPercentage
            let moneyIn = state.currentBet
            if (state.currentBet === 3) {
                if (isHandInRange(player.currentHand, raiseFirstIn[player.currentSeat])) {
                    putInBet(playerInd, moneyIn*4)
                    console.log(player.name + " raises to " + moneyIn*4)
                } else if (isHandInRange(player.currentHand, looseSmallBlindRaiseRange)) {
                    putInBet(playerInd, moneyIn)
                    console.log(player.name + " calls " + moneyIn + " loosely")
                } else {
                    if (willCall) {
                        putInBet(playerInd, moneyIn)
                        console.log(player.name + " calls " + moneyIn + " as a bluff")
                    } else {
                        player.isStillInHand = false
                        console.log(player.name + " folds")
                    }
                }
            } else if (state.currentBet < 25) {
                if (isHandInRange(player.currentHand, fourBetRange)) {
                    console.log(player.name + " raises to " + moneyIn*3)
                    putInBet(playerInd, moneyIn*3)
                } else if (isHandInRange(player.currentHand, raiseFirstIn[player.currentSeat])) {
                    putInBet(playerInd, moneyIn)
                    console.log(player.name + " calls " + moneyIn + " loosely")
                } else if ((callValue*2 < callThreshold)) {
                    putInBet(playerInd, moneyIn)
                    console.log(player.name + " calls " + moneyIn + " as a bluff")
                } else {
                    player.isStillInHand = false
                    console.log(player.name + " folds")
                }
            } else {
                if (isHandInRange(player.currentHand, fourBetRange)) {
                    console.log(player.name + " raises to " + moneyIn*3)
                    putInBet(playerInd, state.moneyIn*3)
                } else if ((isHandInRange(player.currentHand, raiseFirstIn[0]))) {
                    putInBet(playerInd, moneyIn)
                    console.log(player.name + " calls " + moneyIn + " loosely")
                } else {
                    player.isStillInHand = false
                    console.log(player.name + " folds")
                }
            }
        }
        state.currentPlayer = (state.currentPlayer === 5) ? 0 : state.currentPlayer+1
        console.log("increased current index to " + state.currentPlayer)
    }
}

function postFlopAction() { 
    //find dealer and small blind index
    const playerIndex = state.players.findIndex(player => player.name === "player");
    let firstIndex = (state.currentDealer < 5) ? state.currentDealer+1 : 0
    state.currentPlayer = firstIndex;
    //reset bets to 0 for the flop
    state.currentBet = 0;
    state.players.forEach(player => {
        player.currentBet = 0
    })
    let lastIndex = (firstIndex < playerIndex) ? (playerIndex-firstIndex) : (5-firstIndex+1+playerIndex)
    lastIndex = (playerIndex === firstIndex) ? playerIndex : lastIndex

    for (let i=0; i < lastIndex; i++) {
        playerInd = state.currentPlayer
        player = state.players[playerInd];
        if (player.isStillInHand !== false) {
            if (player.name === "player") {
                console.log('betting reached player')
                return true
            } else {
                playerHandRank = getBestPokerHand(player.currentHand.concat(state.publicCards))[1]
                console.log(player.name + " hand rank is " + playerHandRank)
                const bluffOrTrap = Math.random()
                if (state.currentBet === 0) {
                    if (playerHandRank>=2) {
                        //even if player has good hand, they trap sometimes
                        if (bluffOrTrap > 0.2) {
                            console.log(player.name + " bets out for half pot: " + state.currentPot/2)
                            putInBet(playerInd, state.currentPot/2)
                        } else {
                            console.log(player.name + " checks as a trap")
                        }
                    } else {
                        //if player has bad hand, they bluff at pot sometimes
                        if (bluffOrTrap < 0.2) {
                            console.log(player.name + " bluffs out for half pot: " + state.currentPot/2)
                            putInBet(playerInd, state.currentPot/2)
                        } else {
                            console.log(player.name + " checked with a bad hand")
                        }
                    }
                } else if (state.currentBet < 30) {
                    if (playerHandRank >= 3) {
                        //even if player has good hand, they trap sometimes
                        if (bluffOrTrap > 0.2) {
                            console.log(player.name + " raises for " + state.currentBet*2)
                            putInBet(playerInd, state.currentBet*2) 
                        } else {
                            putInBet(playerInd, state.currentBet)
                            console.log(player.name + " calls for " + state.currentBet)
                        } 
                    } else if (playerHandRank>1) {
                        //even if player has decent hand, they still fold sometimes
                        if (bluffOrTrap > 0.1) {
                            console.log(player.name + " calls for " + state.currentBet)
                            putInBet(playerInd, state.currentBet) 
                        } else {
                            console.log(player.name + " folded with a decent hand")
                            player.isStillInHand = false
                        } 
                    } else {
                        //players sometimes call even with terrible hand
                        if (bluffOrTrap < 0.1) {
                            console.log(player.name + " calls as bluff for " + state.currentBet)
                            putInBet(playerInd, state.currentBet) 
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
                            console.log(player.name + " raises for " + state.currentBet*2)
                            putInBet(playerInd, state.currentBet*2) 
                        } else {
                            putInBet(playerInd, state.currentBet)
                            console.log(player.name + " calls as a trap for " + state.currentBet)
                        } 
                    } else if (playerHandRank == 3) {
                        //players trap slightly more often with draws or two pair
                        if (bluffOrTrap > 0.25) {
                            console.log(player.name + " raises for " + state.currentBet*2)
                            putInBet(playerInd, state.currentBet*2) 
                        } else {
                            putInBet(playerInd, state.currentBet)
                            console.log(player.name + " calls as a trap for " + state.currentBet)
                        } 
                    } else if (playerHandRank > 1) {
                        //even if player has a pair, they still fold sometimes
                        if (bluffOrTrap > 0.4) {
                            console.log(player.name + " calls for " + state.currentBet)
                            putInBet(playerInd, state.currentBet) 
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
        }
        state.currentPlayer = (state.currentPlayer === 5) ? 0 : state.currentPlayer+1
        console.log("increased current index to " + state.currentPlayer)
    }
}


function createPokerTable() {
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

        const playerTopRowDiv = document.createElement('div');
        playerTopRowDiv.classList.add('playerTopRowDiv');
        
        const playerNameDiv = document.createElement('div');
        playerNameDiv.classList.add('playerNameDiv');
        playerNameDiv.textContent = player.name
        const playerSeatDiv = document.createElement('div');
        playerSeatDiv.classList.add('playerSeatDiv');
        playerSeatDiv.textContent = player.currentSeat
        const playerMoneyDiv = document.createElement('div');
        playerMoneyDiv.classList.add('playerSeatDiv');
        playerMoneyDiv.textContent = player.currentMoney

        playerTopRowDiv.append(playerNameDiv, playerSeatDiv, playerMoneyDiv)

        const playerBottomRowDiv = document.createElement('div');
        playerBottomRowDiv.classList.add('playerTopRowDiv');
        
        const playerStackDiv = document.createElement('div');
        playerStackDiv.classList.add('playerNameDiv');
        playerStackDiv.textContent = player.stackSize
        const playerMoveDiv = document.createElement('div');
        playerMoveDiv.classList.add('playerNameDiv');
        playerStackDiv.textContent = player.stackSize

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

function chooseHoleCardToBeVisiblePokerTable() {
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

    const publicCardsDiv = document.createElement('div');
    publicCardsDiv.classList.add('public-cards-div');
    publicCardsDiv.style.top = "50%"
    publicCardsDiv.style.left = "50%"
    for (let i=-0; i < state.publicCards.length; i++) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('cardDiv');
        cardDiv.textContent = state.publicCards[i]
        publicCardsDiv.append(cardDiv)
    }

    for (let i = 0; i < 6; i++) {
        let player = state.players[i]

        const playerDiv = document.createElement('div');
        playerDiv.classList.add('playerDiv');
        playerDiv.style.top = positions[i].top;
        playerDiv.style.left = positions[i].left;

        const playerTopRowDiv = document.createElement('div');
        playerTopRowDiv.classList.add('playerTopRowDiv');
        
        const playerNameDiv = document.createElement('div');
        playerNameDiv.classList.add('playerNameDiv');
        playerNameDiv.textContent = player.name
        const playerSeatDiv = document.createElement('div');
        playerSeatDiv.classList.add('playerSeatDiv');
        playerSeatDiv.textContent = player.currentSeat
        const playerMoneyDiv = document.createElement('div');
        playerMoneyDiv.classList.add('playerSeatDiv');
        playerMoneyDiv.textContent = player.currentMoney;


        playerTopRowDiv.append(playerSeatDiv, playerNameDiv, playerMoneyDiv)

        tableDiv.appendChild(playerDiv);

        const playerCardsDiv = document.createElement('div');
        playerCardsDiv.classList.add('playerCardsDiv');

        for (let j = 0; j < 2; j++) {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('cardDiv');
            if (j===0) {
                cardDiv.onclick = function(){
                    state.players[i].leftCardVisible = true
                    renderScreen(state)
                }    
            } else {
                cardDiv.onclick = function(){
                    state.players[i].rightCardVisible = true
                    renderScreen(state)
                }  
            }
            if ( (j===0 && state.players[i].leftCardVisible) ||  (j===1 && state.players[i].rightCardVisible) ) {
                cardDiv.textContent = state.players[i].currentHand[j]
            } else {
                cardDiv.classList.add("not-visible") 
            }
            if (!state.players[i].isStillInHand) {
                playerDiv.classList.add("fold")
            }
            playerCardsDiv.appendChild(cardDiv);
        }

        const playerBottomRowDiv = document.createElement('div');
        playerBottomRowDiv.classList.add('playerTopRowDiv');
        
        const playerStackDiv = document.createElement('div');
        playerStackDiv.classList.add('playerNameDiv');
        playerStackDiv.textContent = player.stackSize
        const playerBetDiv = document.createElement('div');
        playerBetDiv.classList.add('playerNameDiv');
        playerBetDiv.textContent = player.currentBet

        playerBottomRowDiv.append(playerStackDiv, playerBetDiv)

        playerDiv.append(playerTopRowDiv, playerCardsDiv, playerBottomRowDiv)

    }

    const potDiv = document.createElement('div');
    potDiv.classList.add('playerNameDiv');
    potDiv.textContent = "Pot: " + state.currentPot;
    potDiv.style.top = "70%";
    potDiv.style.left = "70%";
    

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
    callDiv.onclick = function() {
        console.log('clicked call div')
        const playerIndex = state.players.findIndex(player => player.name === "player");
        const moneyIn = (state.currentBet - state.players[playerIndex].currentBet)
        state.players[playerIndex].currentBet += moneyIn
        state.currentPot += moneyIn
        state.players[playerIndex].stackSize -= moneyIn 
        state.currentPlayer  = (state.currentPlayer < 5) ? state.currentPlayer + 1 : 0
        if (state.publicCards.length === 0) {
            preFlopAction()
        } else {
            postFlopAction()
        }
        renderScreen()
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
        renderScreen()
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
        renderScreen()
    }

    const RaiseDiv = document.createElement('div');
    RaiseDiv.classList.add('action-div');
    RaiseDiv.textContent = "Raise"
    RaiseDiv.style.top = '10%';
    RaiseDiv.style.left = '70%';
    RaiseDiv.onclick = function() {
        
        const playerIndex = state.players.findIndex(player => player.name === "player");
        const moneyIn = (state.currentBet - state.players[playerIndex].currentBet) * 3
        state.currentBet += moneyIn-state.currentBet
        console.log('player raised to ' + state.currentBet)
        state.players[playerIndex].currentBet += moneyIn
        state.currentPot += moneyIn
        state.players[playerIndex].stackSize -= moneyIn 
        state.currentPlayer  = (state.currentPlayer < 5) ? state.currentPlayer + 1 : 0
        if (state.publicCards.length === 0) {
            preFlopAction()
        } else {
            postFlopAction()
        }
        renderScreen()
    }
    if (state.currentBet === 0) {
        document.body.append(checkDiv, betDiv)
    } else {
        document.body.append(foldDiv, callDiv, RaiseDiv)
    }
    tableDiv.append(publicCardsDiv, potDiv)

}

function renderCardVisible(state) {

} 

createPlayers()

function newHand() {
    //give pot to random player
    if (state.currentPot > 0) {
        const indices = state.players.map((obj, index) => obj.isStillInHand ? index : null).filter(index => index !== null);
        winnerindex = indices[Math.floor(Math.random() * indices.length)]
        let winningPlayer = state.players[winnerindex]
        
        console.log(" Of ",  indices + "players left, " + winnerindex + " wins the pot of " + state.currentPot)
        winningPlayer.stackSize += state.currentPot
    }

    state.currentDealer = (state.currentDealer === 5) ? 0 : state.currentDealer+1
    state.players.forEach(player => {
        player.currentSeat = (player.currentSeat === 0) ? 5 : player.currentSeat-1
        player.currentBet = 0
        player.isStillInHand = true
    })
    
    //
    state.currentPot = 0
    state.publicCards = []
    createDeckAndShuffle()
    dealToEachPlayer()
    dealToEachPlayer()
    putOutBlinds(state)
    preFlopAction()
    renderScreen()
}




function renderScreen() {
    if (state.currentScreen === "chooseVisibleCard") {
        chooseHoleCardToBeVisiblePokerTable()
    } else if (state.currentScreen === "renderTable") {
        createPokerTable()
    }
}

newHand(state)


