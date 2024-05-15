premiumHands = AA.concat(KK, QQ, AKs)

let goodPocketPairs = JJ.concat(TT, _99)
let lowMediumPocketPairs = _77.concat(_88, _66, _55, _44, _33, _22)
let suitedBroadway = AQs.concat(AJs, ATs, KQs, KJs, KTs, QJs, QTs, JTs)
let offsuitBroadway = AKo.concat(AQo, AJo, ATo, KQo, KJo, KTo, QJo, QTo, JTo)
let mediumSuitedConnectors = T9s.concat(_98s, _87s, _76s, _65s)
let lowSuitedConnectors = _54s.concat(_43s, _32s)
let mediumOffsuitConnectors = T9o.concat(_98o, _87o, _76o, _65o)
let lowOffsuitConnectors = _54o.concat(_43o, _32o)
let highSingleGapSuited = J9s.concat(T8s, J8s, _97s, T7s)
let mediumSingleGapSuited = _86s.concat(_75s, _64s, _53s, _42s)

let suitedAces = A9s.concat(A8s, A7s, A6s, A5s, A4s, A3s, A2s)
let suitedKings = K9s.concat(K8s, K7s, K6s, K5s, K4s, K3s, K2s)
let suitedQueens = Q9s.concat(Q8s, Q7s, Q6s,  Q5s, Q4s, Q3s, Q2s)
let suitedJacks = J8s.concat(J7s, J6s, J5s, J4s, J3s, J2s)
let suitedTens = T6s.concat(T5s, T4s, T3s, T2s)

let highOffsuitAces = A9o.concat(A8o, A7o)
let lowOffsuitAces = A6o.concat(A5o, A4o, A3o, A2o)
let highKings = K9o.concat(K8o, K7o, Q9o)


//createPlayer to actually roll the random numbers
//plays tightly, traps rarely, bluffs occasionally
let tightAggressivePlayer = {
    
    //limp
    "limpArray": [lowSuitedConnectors.concat(suitedKings, suitedQueens, highOffsuitAces, highKings, lowSuitedConnectors, highSingleGapSuited, mediumSingleGapSuited)],
    "callwithJunkPreFlopPercentage":  Math.random() * 0.1,
    "trapPreflopPercentage": Math.random() * 0.2,
    //raising
    "raiseFirstInArray": [premiumHands.concat(goodPocketPairs, suitedBroadway, suitedAces, offsuitBroadway, mediumSuitedConnectors, lowMediumPocketPairs) ],
    "reRaisePreflopArray": [goodPocketPairs.concat(suitedBroadway, suitedAces)],
    "fourBetPreflopArray": [premiumHands],
    "callRaiseWithRFI": Math.random(),
    //flop
    "continueOnFlopWithArray": [],
    "chanceOfRaisingWithDraw": [],
    "chaneofCallingWithDraw": [], 


}


lojackRange = AA.concat(KK, QQ, JJ, TT, _99, _88, _77, _66, _55, 
    AKs, AQs, AJs, ATs, A9s, A8s, A7s, A6s, A5s, A4s, A3s, 
    AKo, AQo, AJo, ATo, KQo, KJo, QJo, 
    KQs, KJs, KTs, K9s, K8s, QJs, QTs, Q9s, JTs, J9s, T9s)

hijackRange = lojackRange.concat(A2s, KTo, QTo, Q8s, K7s, K6s, _98s, _87s, _76s, _55)

cutoffRange = hijackRange.concat(K5s, K4s, K3s, Q7s, Q6s, J8s, T8s, T7s, _97s, _44, _33, A9o, A8o, JTo)

buttonRange = cutoffRange.concat(K2s, Q5s, Q4s, Q3s, J7s, J6s, J5s, J4s, T6s, _86s, _75s, _65s, _64s, _54s, _53s,
    K9o, K8o, Q9o, T9o, _98o, _22, A7o, A6o, A5o, A4o)

smallBlindRaiseRange = AKs.concat(ATs, A9s, A8s, A7s, A5s, KK, KJs, KTs, K8s, K5s, K3s, K2s, AQo, QQ, QJs, QTs, Q5s, Q4s, Q3s, Q2s,
    AJo, KJo, JJ, JTs, T9s, K9o, Q9o, J9s, _98o, A7o, K7o, A6o, _65s, _64s, _54s, _53s, A4o, _33, _22)



raiseFirstIn= {
    "Dealer": buttonRange,
    "SB": smallBlindRaiseRange,
    "BB": buttonRange,
    "UTG": lojackRange,
    "Lojack": hijackRange,
    "CO": cutoffRange,
}

looseLojackRange = AA.concat(KK, QQ, JJ, TT, _99, _88, _77, _66, _55, _44, _33,
    AKs, AQs, AJs, ATs, A9s, A8s, A7s, A6s, A5s, A4s, A3s, A2s,
    AKo, AQo, AJo, ATo, KQo, KJo, QJo, JTo,
    KQs, KJs, KTs, K9s, K8s, K7s, K6s, K5s, K4s, K3s, K2s,
    QJs, QTs, Q9s, JTs, J9s, T9s, _98s, _87s, _65s, _54s,)

looseHijackRange = lojackRange.concat(A2s, KTo, QTo, Q8s, K7s, K6s, _98s, _87s, _76s, _55, T9o, _98o, _87o, _43s, _32s, T8s, _97s, A9o, A8o,
    Q7s, Q6s, Q5s, Q4s, Q3s, Q2s,
    J8s, J7s, )

looseCutoffRange = hijackRange.concat(K5s, K4s, K3s, Q7s, Q6s, T8s, T7s, _86s)

looseButtonRange = cutoffRange.concat(K2s, Q5s, Q4s, Q3s, J6s, J5s, J4s, T6s, _86s, _75s, _65s, _64s, _54s, _53s,
    K9o, K8o, Q9o, T9o, _98o, _22, A7o, A6o, A5o, A4o)

looseSmallBlindRaiseRange = AKs.concat(ATs, A9s, A8s, A7s, A5s, KK, KJs, KTs, K8s, K5s, K3s, K2s, AQo, QQ, QJs, QTs, Q5s, Q4s, Q3s, Q2s,
    AJo, KJo, JJ, JTs, T9s, K9o, Q9o, J9s, _98o, A7o, K7o, A6o, _65s, _64s, _54s, _53s, A4o, _33, _22)


