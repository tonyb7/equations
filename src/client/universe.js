import { appendServerMessage, appendUniverseSizePrompt } from "./message_utils";
import { socket } from "./networking";
import { renderVariations } from "./variations";

export function setUniverse(univ_set_info, name) {
    let cardsetter = univ_set_info['cardsetter'];
    let numCards = parseInt(univ_set_info['numCardsStr']);
    let onsets_cards = univ_set_info['onsets_cards'];

    appendServerMessage(`${cardsetter} set ${numCards} cards in the universe!`);
    displayUniverse(numCards, onsets_cards);

    appendServerMessage("It is now time to call variations.");
    renderVariations(socket, univ_set_info['variations_state'], univ_set_info['players'], name);
}

export function universeWrongSize(errorInfo, name) {
    let cardsetter = errorInfo['cardsetter'];
    let numCards = parseInt(errorInfo['numCardsStr']);
 
    if (cardsetter == name) {
        appendServerMessage(`You set a universe with ${numCards} cards, which is invalid.`);
        appendServerMessage(`If you are not in Senior Division, please set a universe between 6 and 12 cards.`);
        appendServerMessage(`If you are in Senior Division, please set a universe between 10 and 14 cards.`);
        appendUniverseSizePrompt(socket);
    }
    else {
        appendServerMessage(`${cardsetter} set ${numCards} cards in the universe, which is invalid.`);
        appendServerMessage(`Waiting for ${cardsetter} to set a universe with valid size...`);
    }
}

export function displayUniverse(numCards, onsets_cards) {

    // TODO ONSETS

}
