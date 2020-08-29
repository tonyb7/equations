// Helper functions for sending messages
import React from 'react';
import ReactDOM from 'react-dom';
import {ChatMessage} from './components/ChatMessage';

export function appendMessage(name, message, boldMessage = false) {
    let new_message = document.createElement('li');
    let messages = document.getElementById('message-list');
    messages.appendChild(new_message);
    ReactDOM.render(<ChatMessage name={name} message={message} boldMessage={boldMessage}/>, new_message);

    let messages_div = document.getElementById('message-list-div');
    messages_div.scrollTop = messages_div.scrollHeight;
}

function appendBoldedMessage(name, message) {
    appendMessage(name, message, true);
}

export function appendServerMessage(message) {
    appendMessage("Server", message);
}

export function appendInstructions() {
    appendBoldedMessage("Server", "Move cubes by clicking a cube in resources, then clicking the " +
                    "area on the mat you want to move it to.");
    appendBoldedMessage("Server", "For goalsetting, once cubes are on the goal line, you can " +
                    "rearrange them (by dragging them horizontally) and rotate them (by right clicking on the cube you want to rotate).");
    appendBoldedMessage("Server", "If you can bonus on your turn, a bonus button will appear in the " + 
                    "upper right corner of resources. To bonus, first click the bonus button, then move the " + 
                    "bonused cube to forbidden, and continue with the rest of your turn.");
}

export function appendSidingOptions(socket) {
    // <li><b>Server: </b>Do you wish to write a solution?</li>
    // <li class="chat-button"><button>Yes</button><button>No</button></li>

    appendServerMessage("Do you wish to write a solution? You have one minute to decide.");

    let options = document.createElement('li');
    options.classList.add("chat-button");

    let yes_button = document.createElement("button");
    yes_button.innerHTML = "Yes";
    options.appendChild(yes_button);

    let no_button = document.createElement("button");
    no_button.innerHTML = "No";
    options.appendChild(no_button);

    yes_button.onclick = () => {
        socket.emit("sided", true);
        deregisterChatButtons([yes_button, no_button]);
        yes_button.classList.add("button-clicked");
        appendSolutionPrompt(socket);
    };

    no_button.onclick = () => {
        socket.emit("sided", false);
        deregisterChatButtons([yes_button, no_button]);
        no_button.classList.add("button-clicked");
    };

    let messages = document.getElementById('message-list');
    messages.appendChild(options);
}

function deregisterChatButtons(buttons) {
    for (let button of buttons) {
        button.onclick = () => {};
    }
}

export function appendSolutionPrompt(socket) {
    // <li><b>Server: </b>Please submit your solution here:</li>
    // <li class="solution_li">
    //     <input class="solution_box" placeholder="Type your solution here...">
    //     <button class="solution_submit">Submit Solution</button>
    // </li>
    appendServerMessage("Please submit your solution here:");
    let solution_area = document.createElement('li');
    solution_area.classList.add("solution_li");

    let input_area = document.createElement('input');
    input_area.classList.add("solution_box");
    input_area.placeholder = "Type your solution here...";

    let submit_button = document.createElement('button');
    submit_button.classList.add("solution_submit");
    submit_button.innerHTML = "Submit Solution";

    submit_button.onclick = () => {
        socket.emit("solution_submitted", input_area.value);
        input_area.disabled = true;
        submit_button.onclick = () => {};
        submit_button.classList.add("hidden");
    };

    solution_area.appendChild(input_area);
    solution_area.appendChild(submit_button);

    let messages = document.getElementById('message-list');
    messages.appendChild(solution_area);
}

export function appendAcceptPrompt(socket, name, solution, reevaluate, for_game_player) {
    // <li><b>Server: </b>Tony submitted the following solution. Do you accept?</li>
    // <li class="chat-button">
    //     <p>4+5=9</p>
    //     <button>Yes</button><button>No</button>
    // </li>
    if (!for_game_player) {
        appendServerMessage(name + " submitted the following solution. Waiting for players to accept/reject.");
    }
    else if (reevaluate) {
        appendServerMessage(name + " does not agree that the solution is incorrect. Please re-evaluate whether you accept.")
    }
    else {
        appendServerMessage(name + " submitted the following solution. Do you accept?");
    }
    
    let options = document.createElement('li');
    options.classList.add("chat-button");

    let solution_p = document.createElement('p');
    solution_p.innerHTML = solution;
    options.append(solution_p);

    if (for_game_player) {
        let yes_button = document.createElement("button");
        yes_button.innerHTML = "Yes";
        options.appendChild(yes_button);

        let no_button = document.createElement("button");
        no_button.innerHTML = "No";
        options.appendChild(no_button);

        yes_button.onclick = () => {
            socket.emit("decided", {"name": name, "accepted": true});
            deregisterChatButtons([yes_button, no_button]);
            yes_button.classList.add("button-clicked");
        };

        no_button.onclick = () => {
            socket.emit("decided", {"name": name, "accepted": false});
            deregisterChatButtons([yes_button, no_button]);
            no_button.classList.add("button-clicked");
        };
    }
    

    let messages = document.getElementById('message-list');
    messages.appendChild(options);
}

export function appendAssentToRejectPrompt(socket, name) {
    // <li><b>Server: </b>Tony rejected your solution. Do you agree?</li>
    // <li class="chat-button">
    //     <button>Yes</button><button>No</button>
    // </li>
    appendServerMessage(name + " rejected your solution. Do you agree?");

    let options = document.createElement('li');
    options.classList.add("chat-button");

    let yes_button = document.createElement("button");
    yes_button.innerHTML = "Yes";
    options.appendChild(yes_button);

    let no_button = document.createElement("button");
    no_button.innerHTML = "No";
    options.appendChild(no_button);

    yes_button.onclick = () => {
        socket.emit("assented", {"rejecter": name, "assented": true});
        deregisterChatButtons([yes_button, no_button]);
        yes_button.classList.add("button-clicked");
    };

    no_button.onclick = () => {
        socket.emit("assented", {"rejecter": name, "assented": false});
        deregisterChatButtons([yes_button, no_button]);
        no_button.classList.add("button-clicked");
    };

    let messages = document.getElementById('message-list');
    messages.appendChild(options);
}

export function appendStartNewShakeButton(socket) {
    // <li class="chat-button">
    //     <button>Start New Shake</button>
    // </li>

    let li = document.createElement('li');
    li.classList.add("chat-button");

    let start_button = document.createElement("button");
    start_button.innerHTML = "Start New Shake";
    start_button.id = "new_shake_button";

    li.appendChild(start_button);

    start_button.onclick = () => {
        socket.emit("new_shake");
    };

    document.getElementById('message-list').appendChild(li);
}

export function appendNoGoalButtons(socket, caller) {
    // <li><b>Server: </b>Tony claims no goal can be set which has at least one correct solution. 
    // Do you agree? If not, you can challenge the No Goal declaration and you will have two minutes to 
    // write a correct Solution & Goal.</li>
    // <li class="chat-button">
    //     <button>Agree</button><button>Disagree & Write</button>
    // </li>
    appendServerMessage(caller + " claims no goal can be set which has at least one correct solution. " +
        "Do you agree? If not, you can challenge the No Goal declaration and you will have two minutes to " +
        "write a correct Solution & Goal. Disagreeing with the no goal declaration is considered a challenge, " +
        "so the first player to disagree (if a player disagrees) will be deemed the challenger.");

    let options = document.createElement('li');
    options.classList.add("chat-button");

    let yes_button = document.createElement("button");
    yes_button.innerHTML = "Agree";
    options.appendChild(yes_button);

    let no_button = document.createElement("button");
    no_button.innerHTML = "Disagree & Write";
    options.appendChild(no_button);

    yes_button.onclick = () => {
        socket.emit("no_goal_sided", true);
        deregisterChatButtons([yes_button, no_button]);
        yes_button.classList.add("button-clicked");
    };

    no_button.onclick = () => {
        socket.emit("no_goal_sided", false);
        deregisterChatButtons([yes_button, no_button]);
        no_button.classList.add("button-clicked");
        appendSolutionPrompt(socket);
    };

    let messages = document.getElementById('message-list');
    messages.appendChild(options);
}

export function appendEndShakeNoGoal(socket) {
    appendServerMessage("The shake has ended due to a No Goal. Click below to restart the shake.");

    // <li class="chat-button">
    //     <button>Restart Shake</button>
    // </li>

    let li = document.createElement('li');
    li.classList.add("chat-button");

    let start_button = document.createElement("button");
    start_button.innerHTML = "Restart Shake";
    start_button.id = "new_shake_button";

    li.appendChild(start_button);

    start_button.onclick = () => {
        socket.emit("restart_shake");
    };

    document.getElementById('message-list').appendChild(li);
}

export function printFiveMinWarningMsg() {
    let msgpt1 = "Five minute warning! If the cubes have been rolled, ";
    let msgpt2 = "continue your game -- you have five minutes left. ";
    let msgpt3 = "Do not start a new shake.";
    appendServerMessage(`${msgpt1}${msgpt2}${msgpt3}`);
}
