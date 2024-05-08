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

raiseFirstIn= [
    buttonRange,
    smallBlindRaiseRange,
    buttonRange,
    lojackRange,
    hijackRange,
    cutoffRange,
    
    
]

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

fourBetRange = AA.concat(KK, QQ, JJ, AKs)