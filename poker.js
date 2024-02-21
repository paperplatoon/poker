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

    return [bestHand, bestHandRank];
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
    } else {

        // If hands have the same rank, compare the highest cards
        let ranks1 = getCardRanks(bestHand1).sort((a, b) => b - a);
        let ranks2 = getCardRanks(bestHand2).sort((a, b) => b - a);

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

// Example usage
// let hand1 = ['6c', 'Qc', 'Kc', '2c', '5c', '9c'];
// let hand2 = ['Ac', 'Qc', '4c', '8c', '3c', '9c'];

// let hand1 = ['6c', '6d', '6h', '6s', '5c', '9c'];
// let hand2 = ['7c', '7d', '7s', 'Kc', 'Kd', '9c'];

// console.log(compareHands(hand1, hand2)); // Should output "It's a tie"

// Example usage
//2H QC 4D 2C 8C 9C TC
// let testCards = ['Ac', 'Qc', '4c', '2c', '8c', '9c', 'Tc'];
// let bestHand = getBestPokerHand(testCards)[0];
// let bestHandRank = getBestPokerHand(testCards)[1]
// console.log('Best hand:', bestHand);
// console.log('Best hand rank:', bestHandRank);

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
    let hand1 = fullDeck.splice(0, 7)
    let hand2 = fullDeck.splice(0, 7)

    return [hand1, hand2]
}

let exampleHandArray = createDeckAndShuffle()
console.log(compareHands(exampleHandArray[0], exampleHandArray[1]))