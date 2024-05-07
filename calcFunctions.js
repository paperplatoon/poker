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

async function pause(timeValue) {
    return new Promise(res => setTimeout(res, timeValue))
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