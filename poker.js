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
    console.log('best hand 1 is ' + bestHand1)

    let resultsHand2 = getBestPokerHand(hand2)
    let rankHand2 = resultsHand2[1]
    let bestHand2 = resultsHand2[0]
    console.log('best hand 2 is ' + bestHand2)

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

function preFlopAction() {
    let currentBet = 10 
    state.players.forEach(async player => {
        if (player.name !== "player") {
            
            let willBluff = (Math.random() < player.callwithJunkPreFlopPercentage) ? true : false

            if (currentBet === 10) {
                if (isHandInRange(player.currentHand, raiseFirstIn[player.currentSeat])) {
                    player.currentMove = "Raise"
                    currentBet *= 3;
                    console.log(player.name + " raises to " + currentBet)
                } else if (willBluff) {
                    console.log(player.name + " calls  " + currentBet + " as a bluff")
                    player.currentMove = "Call"
                } else {
                    console.log(player.name + " folds to a bet of   " + currentBet)
                    player.currentMove = "Fold"
                }
            } else if (currentBet < 40) {
                if (isHandInRange(player.currentHand, raiseFirstIn[player.currentSeat])) {
                    player.currentMove = "Call"
                    console.log(player.name + " calls the raise and puts in " + currentBet)
                } else if (willBluff) {
                    console.log(player.name + " calls  " + currentBet + " as a bluff")
                    player.currentMove = "Call"
                } else {
                    console.log(player.name + " folds to a bet of " + currentBet)
                    player.currentMove = "Fold"
                }
            }
            
        }   
    })
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
            if (player.currentMove === "Raise") {
                cardDiv.classList.add("raise")
            } else if (player.currentMove === "Fold") {
                cardDiv.classList.add("fold")
            } else if (player.currentMove === "Call") {
                cardDiv.classList.add("call")
            }
            playerCardsDiv.appendChild(cardDiv);
        }
        playerDiv.append(playerTopRowDiv, playerCardsDiv)
    }
}

function chooseHoleCardToBeVisiblePokerTable() {
    // Create table div
    const tableDiv = document.createElement('div');
    tableDiv.id = 'tableDiv';
    document.body.appendChild(tableDiv);

    // Create player divs and card divs
    const positions = [
        { top: '90%', left: '50%' },
        { top: '70%', left: '10%' },
        { top: '30%', left: '10%' },
        { top: '10%', left: '50%' },
        { top: '30%', left: '90%' },
        { top: '70%', left: '90%' }
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
        playerMoneyDiv.textContent = player.currentMoney;

        const playerActionDiv = document.createElement('div');
        playerActionDiv.classList.add('playerActionDiv');

        const playerActionTextDiv = document.createElement('div');
        playerActionTextDiv.classList.add('playerActionTextDiv');
        playerActionTextDiv.textContent = player.currentMove

        playerActionDiv.append(playerActionTextDiv)

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
            if (state.players[i].currentMove === "Raise") {
                cardDiv.classList.add("raise")
            } else if (state.players[i].currentMove === "Fold") {
                cardDiv.classList.add("fold")
            } else if (state.players[i].currentMove === "Call") {
                cardDiv.classList.add("call")
            }
            playerCardsDiv.appendChild(cardDiv);
        }
        playerDiv.append(playerTopRowDiv, playerCardsDiv)
        if (player.name !== "player") {
            playerDiv.append(playerActionDiv)
        }
    }
}

createPlayers()
createDeckAndShuffle()
dealToEachPlayer()
dealToEachPlayer()
preFlopAction()


function renderScreen(stateObj) {
    if (stateObj.currentScreen === "chooseVisibleCard") {
        chooseHoleCardToBeVisiblePokerTable()
    } else if (stateObj.currentScreen === "renderTable") {
        createPokerTable()
    }
}

renderScreen(state)



let exampleHandArray = testFunction()
console.log(compareHands(exampleHandArray[0], exampleHandArray[1]))

let hand1 = ['Ah', '2h', '2c', 'Kd', '9d', '5s', '3s'];
let hand2 = ['Kc', 'Qc', '4c', '4s', '3d', '9h', 'Js'];
let hand3 = ['Jc', 'Jh', '7d', '6s', 'Qc', 'Ks', '2d'];
let hand4 = ['Qc', 'Qh', '8d', 'Qs', '3c', 'Js', '7d'];










































let samplePlayer = {

    callChanceWithJunk: 0.25,
    raiseChanceWithCallRange: 0.1,

    callChanceWithRaiseRange: 0.3,
    foldChanceToRaiseRange: 0,

    callRaiseChanceWithThreeBetRange: 0.6,

    foldChanceWithThreeBetRangeToFourBet: 0.1,
    
    callFlopMinRank: 2,
    callFlopChanceIfUnder: 0.8,


    betFlopMinRank: 1,
    betFlopIfUnderChance: 0.6,

    raiseFlopMinRank: 2,
    raiseFlopChanceIfOver: 0.6,

    callTurnMinRank: 0

}