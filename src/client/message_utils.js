// Helper functions for sending messages
import React from 'react';
import ReactDOM from 'react-dom';
import {ChatMessage, NewShakeButton, FiveMinWarning, ConfirmationButtons, SolutionCheck, SolutionPrompt} from './components/ChatMessages';

/** render message component and keep chat-list scrolled to the bottom */
function renderAndScroll(new_message_li, component) {
    let messages = document.getElementById('message-list');
    messages.appendChild(new_message_li);
    ReactDOM.render(component, new_message_li);

    let messages_div = document.getElementById('message-list-div');
    messages_div.scrollTop = messages_div.scrollHeight;
}

export function appendMessage(name, message, type = "player_message") {
    let new_message = document.createElement('li');
    renderAndScroll(new_message, 
        <ChatMessage 
            name={name} 
            message={message} 
            type={type}/>);
}

function appendInstruction(name, message) {
    appendMessage(name, message, "instruction");
}

export function appendServerMessage(message) {
    appendMessage("Server", message, "server_message");
}

export function appendInstructions() {
    appendInstruction("Server", "All the players have called variations. Now it is time to set the goal. " +
                    "Before you start, here are some basic instructions.");
    appendInstruction("Server", "Move cubes by clicking a cube in resources, " +
                    "then clicking the area on the mat you want to move it to.");
    appendInstruction("Server", "For goalsetting, once cubes are on the goal line, you can " +
                    "rearrange them (by dragging them horizontally) and rotate them (by right clicking on the cube you want to rotate).");
    appendInstruction("Server", "If you can bonus on your turn, a bonus button will appear in the " + 
                    "upper right corner of resources. To bonus, first click the bonus button, then move the " + 
                    "bonused cube to forbidden, and continue with the rest of your turn.");
}

export function appendSidingOptions(socket) {
    // <li><b>Server: </b>Do you wish to write a solution?</li>
    // <li class="chat-button"><button>Yes</button><button>No</button></li>

    appendServerMessage("Do you wish to write a solution? You have one minute to decide.");

    let options = document.createElement('li');
    options.classList.add("chat-button");

    renderAndScroll(options,
        <ConfirmationButtons
            onYesClick={() => {
                socket.emit("sided", true);
                appendSolutionPrompt(socket);
            }}
            onNoClick={() => socket.emit("sided", false)}
        />);
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

    renderAndScroll(
        solution_area,
        <SolutionPrompt
            onSubmit={(solution) => socket.emit("solution_submitted", solution)}
        />
    )
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

    renderAndScroll(
        options,
        <SolutionCheck
            solution={solution}
            isGamePlayer={for_game_player}
            onYesClick={() => socket.emit("decided", {"name": name, "accepted": true})}
            onNoClick={() => socket.emit("decided", {"name": name, "accepted": false})}
        />);
}

export function appendAssentToRejectPrompt(socket, name) {
    // <li><b>Server: </b>Tony rejected your solution. Do you agree?</li>
    // <li class="chat-button">
    //     <button>Yes</button><button>No</button>
    // </li>
    appendServerMessage(name + " rejected your solution. Do you agree?");

    let options = document.createElement('li');
    options.classList.add("chat-button");

    renderAndScroll(
        options,
        <ConfirmationButtons
            onYesClick={ () => socket.emit("assented", {"rejecter": name, "assented": true})}
            onNoClick={ () => socket.emit("assented", {"rejecter": name, "assented": false})}
            /> );
}

export function appendStartNewShakeButton(socket) {
    // <li class="chat-button">
    //     <button>Start New Shake</button>
    // </li>

    let li = document.createElement('li');
    li.classList.add("chat-button");
    renderAndScroll(
        li,
        <NewShakeButton
            buttonText = "Start New Shake"
            onClick = {() => socket.emit("new_shake")}
            />
    );
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

    renderAndScroll(
        options,
        <ConfirmationButtons
            onYesClick = {() => socket.emit("no_goal_sided", true)}
            onNoClick = {() => {
                socket.emit("no_goal_sided", false);
                appendSolutionPrompt(socket);
            }} 
        />
    );
}

export function appendEndShakeNoGoal(socket) {
    appendServerMessage("The shake has ended due to a No Goal. Click below to restart the shake.");

    // <li class="chat-button">
    //     <button>Restart Shake</button>
    // </li>

    let li = document.createElement('li');
    li.classList.add("chat-button");

    renderAndScroll(
        li,
        <NewShakeButton
            buttonText = "Restart Shake"
            onClick = {() => socket.emit("restart_shake")}
            />);
}

export function printFiveMinWarningMsg() {
    let li = document.createElement('li');

    renderAndScroll(
        li,
        <FiveMinWarning/>);
}
