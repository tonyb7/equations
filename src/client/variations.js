// Functions to print instructions for variation setting and manage how the
// variation section looks

import { appendInstructions, appendServerMessage } from './message_utils';
import { socket } from './networking';
import { updateTurnText } from './turntext';

// TODO Find everywhere renderVariations is used and see if it can be simplified
export function displayVariations(game, name) {

    // TODO Do not show any chat messages if game has ended -- only change the variations_text_div!
    
    if (!game['game_started']) {
        return;
    }
    if (game['gametype'] == 'os' && game['onsets_cards_dealt'] == 0) {
        return;
    }
    renderVariations(game['variations_state'], game['players'], name);
}

export function renderVariations(variations_state, players, name) {
    let variations_section = document.getElementById("variations");
    variations_section.classList.remove("hidden");

    let variations_text_div = variations_section.querySelector("#called-variations");
    variations_text_div.innerHTML = variations_state['variations'].join(", ");

    if (variations_state['num_players_called'] < players.length) {
        updateTurnText("Calling Variations");

        if (players[variations_state['caller_index']] === name) {
            let variations_input = document.getElementById("variations-input-div");
            variations_input.classList.remove("hidden");
            
            let submit_button = variations_input.getElementsByTagName("button")[0];
            submit_button.onclick = () => {
                let input_box = variations_input.getElementsByTagName("input")[0];
                socket.emit("variation_called", {
                    "player": name,
                    "content": input_box.value,
                });
                input_box.value = "";
                variations_input.classList.add("hidden");
                submit_button.onclick = () => {};
            };

            appendServerMessage("It is your turn to call variations. Please enter the variations you want to call in the " + 
                "text box to the left (in the \"Variations\" section), and hit \"Submit\" when you are done!");
        }
        else {
            appendServerMessage(`It is ${players[variations_state['caller_index']]}'s turn to call variations. Waiting 
                for ${players[variations_state['caller_index']]} to finish calling variations...`);
        }
    }
    else {
        console.log("The variation calling stage has already finished");
    }
    
}

export function handleVariationsFinished(data, name) {
    if (data["is_first_shake"]) {
        appendInstructions();
        if (data['goalsetter'] === name) {
            appendServerMessage("Press \"Goal Set!\" when you're done!");
        }
        else {
            appendServerMessage(`Waiting for ${data['goalsetter']} to finish setting the goal...`);
        }
    }
    updateTurnText(data['goalsetter']);
}

