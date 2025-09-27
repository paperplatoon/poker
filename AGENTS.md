# Poker Roguelike – Agent Guide

## Mission
- Build a single-player poker roguelike where the human can bend the rules but must juggle suspicion.
- Maintain a persistent `state` object so future save/load features remain straightforward.
- Keep the table feeling alive: NPC behaviour, suspicion feedback, and pacing should sell the fantasy of stealth cheating.

## Quick Start
- The project is pure HTML/CSS/vanilla JS. Open `index.html` in a browser (no bundler).
- Use the devtools console; almost all flow diagnostics log there (`console.log` is the primary tracer).
- Core globals (`state`, helper functions) are on `window`. Refreshing the page resets the run.

## File Map
- `stateStuff.js` – Seeds the global `state`, builds NPCs, and defines seat order. Treat it as the single source of truth for persistent values.
- `main.js` – Orchestrates the game loop: deck creation, dealing, betting streets, cheat abilities, and rendering.
- `calcFunctions.js` – Hand evaluation, seat rotation helpers, suspicion loss, and win resolution live here.
- `createDivFunctions.js` – DOM builders for table, players, pot, and action buttons.
- `pokerHands.js` / `pokerRanges.js` – Enumerated combo/range data used by NPC logic.
- `style.css` – Table layout + spotlight effects (suspicion bars, active player highlight).

## State & Flow Mental Model
1. `state` (from `stateStuff.js`) holds everything: players, deck, street, suspicion, etc. The human always has `name === "player"` and `currentSeat === "Dealer"` at hand start.
2. `updateState(newState)` copies incoming data, calls `checkForDeath` (bust/suspicion game-over), then re-renders via `renderScreen`.
3. A hand starts with `startGame()` → `newHand(state, isFirstHand)`. `resetHand` cleans per-hand data, optionally rotates seats (`moveButton`), `createDeckAndShuffle` loads `state.currentDeck`, and `dealToEachPlayer` runs twice.
4. Betting streets:
   - `putInBlinds` posts blinds and sets `state.currentPlayer` to `"UTG"`.
   - `preFlopAction` loops until action closes or the human needs to decide.
   - `dealPublicCards` advances streets (3/1/1 cards) and partially clears suspicion + bets.
   - `postFlopAction` mirrors preflop logic for later streets.
5. All state transitions should go through `immer.produce` (mutate inside the draft, then `await updateState`). Avoid mutating `state` directly.

## Suspicion & Cheating Systems
- Suspicion now lives solely on the player. Their `currentSuspicion` (max 10 by default) drives the single meter rendered above the dealer seat.
- Cheating abilities (all in `main.js`):
  - `makeCardVisible` reveals an NPC hole card (+3 suspicion).
  - `swapHandWithDeck` trades one of your cards with the deck (+4 suspicion).
  - `selectSwapTarget` lets you pick an NPC card; follow with `swapWithSelectedCard` to trade it with either of your hole cards (+5 suspicion).
- `dealPublicCards` trims the player's suspicion by 3 between streets, and `resetHand` clears it after a showdown or new deal.
- Death checks live in `calcFunctions.js:444-465`: hitting max suspicion or busting chips ends the run (`window.location.reload()`).

## Rendering & Interaction
- Rendering is DOM-driven. `renderPokerTable` wipes `document.body`, rebuilds all player nodes, and wires up action buttons depending on `state.currentScreen` and betting state.
- `createDivFunctions.js` contains reusable div factories; keep additions consistent (class names align with CSS).
- `state.currentScreen` gates the cheat overlays (`"chooseVisibleCard"`, `"chooseToSwap"`, `"swapPlayerNPC"`). Set it with `changeCurrentScreen` before prompting the user.
- When `state.currentScreen === "swapPlayerNPC"`, the UI expects a two-step swap: click an NPC card (stored on `state.selectedSwapTarget`), then click either player hole card via `swapWithSelectedCard`. A cancel button appears whenever a target is selected.

## Turn System – Current Pain Points
- Seat order is stored in `seatPositions` (Dealer → CO) in `calcFunctions.js`. NPC seats rotate through `moveButton`, but the human remains permanently labeled `"Dealer"`.
- `state.currentPlayer` is the seat *label* (string). `preFlopAction` resolves the seat to an index each loop: `players.findIndex(seat === currentPlayer)`.
- Symptoms you may see (console spam, stuck action) stem from:
  1. `nextPlayer` and `makeCurrentPlayer` using `immer.produce` with `async` drafts. They currently work by accident; strip the `async` to avoid silent promise returns.
  2. `nextPlayer` only advances the seat label—it does not skip folded/busted players. When a player folds (`isStillInHand = false`) or leaves (`players.splice` in `checkForDeath`), the loop can get stuck on seats that no longer exist.
  3. In `renderPokerTable` the action buttons decide between “check” and “call” using `stateObj.players[playerIndex] == "BB"`. That should compare `currentSeat`; as written it always falls through, corrupting the decision tree.
  4. `preFlopAction` / `postFlopAction` loop over a fixed `for (let i = 0; i < players.length; i++)` while also mutating `state.currentPlayer`. When `state.currentPlayer` never advances (because of the issues above) the loop never terminates and later calls expect a different seat, triggering the “whose turn?” errors seen in the console.
- When fixing turn order:
  - Keep `state.currentPlayer` aligned with the *next* seat that needs to act.
  - After any fold or bust, advance until you hit an active player, or resolve the hand if only one remains.
  - Ensure `seatPositions` stays in sync with `state.players`. Removing a player from `players` should also remove their seat label from `seatPositions` or reassign everyone.

## Implementation Patterns & Tips
- Always clone `state` (`const snapshot = {...state}`) before handing it to helpers; most functions expect to receive a plain object copy.
- Chain awaits: many helpers call `updateState` internally. If you need the freshest state afterwards, rely on the returned value.
- UI pacing uses `await pause(ms)` (defined in `main.js`). Keep animations readable by awaiting pauses after major visual changes.
- NPC logic depends on range lists from `pokerRanges.js`. Hand combos are arrays of two-card strings (e.g., `"AhKs"`). Use `isHandInRange(hand, rangeArray)` to test membership instead of re-inventing matchers.
- When adding new cheat actions, surface suspicion costs immediately so balancing remains centralized.

## Current Work Queue Ideas
1. Repair turn rotation: sanitize `nextPlayer`, skip folded seats, and keep `seatPositions` <-> `players` aligned.
2. Teach suspicion to drop when the player loses chips (per brief). Tie into `determineHandWinner` and fold flows.
3. Harden `dealToEachPlayer` / deck management (guard against empty deck when multiple cheats fire).
4. Improve UI affordances: highlight the player whose turn it is, disable buttons when `actionOnPlayer` is false, show suspicion change tooltips.
5. Add save/load scaffolding by serializing `state` to `localStorage` between hands.

## Debugging Checklist
- If action order breaks, log `state.currentPlayer`, `players.map(p => p.currentSeat)`, and `state.players.filter(p => p.isStillInHand)` after each `nextPlayer` call.
- Validate deck integrity: `state.currentDeck.length + playersCards + publicCards` should equal 52.
- When suspicion spikes unexpectedly, trace each cheat function and ensure modifiers match the design intent.
- Use `immer.setAutoFreeze(false)` (if needed) when debugging; frozen drafts will throw if you mutate outside producers.

Stay consistent with the existing state-first design and annotate complex logic sparingly—the goal is to keep future agents oriented without drowning them in noise.
