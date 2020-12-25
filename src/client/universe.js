/* Functions related to the ON-SETS universe */

import { getOnsetsCardAssetClone } from "./assets/onsets";
import { appendServerMessage, appendUniverseSizePrompt } from "./message_utils";
import { socket } from "./networking";
import { renderVariations } from "./variations";

export function displayUniverse(game, name) {
    console.assert(game['gametype'] == 'os');
    if (!game['game_started']) {
        return;
    }

    if (game['onsets_cards_dealt'] > 0) {
        renderCards(game['onsets_cards_dealt'], game['onsets_cards']);
    }
    else {
        let cidx = (game['turn'] - 1) % game['players'].length;
        let cardsetter = game['players'][cidx];

        renderUniversePrompt(name, cardsetter);
    }
}

export function renderUniversePrompt(name, cardsetter) {
    if (name != cardsetter) {
        appendServerMessage(`Waiting for ${cardsetter} to set the universe...`);
    }
    else {
        appendUniverseSizePrompt(socket);
    }
}

export function setUniverse(univ_set_info, name) {
    let cardsetter = univ_set_info['cardsetter'];
    let numCards = univ_set_info['numCards'];
    let onsets_cards = univ_set_info['onsets_cards'];

    appendServerMessage(`${cardsetter} set ${numCards} cards in the universe!`);
    renderCards(numCards, onsets_cards);

    appendServerMessage("It is now time to call variations.");
    renderVariations(univ_set_info['variations_state'], univ_set_info['players'], name);
}

export function universeError(errorInfo, name) {
    let cardsetter = errorInfo['cardsetter'];
    let numCardsStr = errorInfo['numCardsStr'];
 
    if (cardsetter == name) {
        appendServerMessage(`You tried to set a universe with ${numCardsStr} cards, which is invalid.`);
        appendServerMessage(`If you are not in Senior Division, please set a universe between 6 and 12 cards.`);
        appendServerMessage(`If you are in Senior Division, please set a universe between 10 and 14 cards.`);
        appendUniverseSizePrompt(socket);
    }
    else {
        appendServerMessage(`${cardsetter} tried to set ${numCardsStr} cards in the universe, which is invalid.`);
        appendServerMessage(`Waiting for ${cardsetter} to set a universe with valid size...`);
    }
}

// This function should render the first numCards elements of the onsets_cards
// array in the appropriate section of the game page.
// numCards: integer 
// onsets_cards: array of the card filenames
function renderCards(numCards, onsets_cards) {

    // TODO ONSETS: Allow player to rearrange cards? Or calculate
    // shape of cards that is most easy to the eye? (Rather than just a
    // straight layout)
    console.log("Displaying On-Sets Universe");
    let cards_div = document.getElementById("resources-cards");

    for (let i = 0; i < numCards; ++i) {
        let relevant_th = cards_div.querySelector(`#c${i}`);
        let card_clone = getOnsetsCardAssetClone(onsets_cards[i]);

        relevant_th.appendChild(card_clone);
    }

    console.log("Finished displaying On-Sets universe");

}

