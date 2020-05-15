// Helper functions for sending messages

export const cleanInput = (input) => {
    return $('<div/>').text(input).html();
}

export function appendMessage(name, message) {
    let message_html = `<b>${name}: </b> ${message}`;
    let new_message = document.createElement('li');
    new_message.innerHTML = message_html;

    let messages = document.getElementById('message-list');
    messages.appendChild(new_message);
    
    let messages_div = document.getElementById('message-list-div');
    messages_div.scrollTop = messages_div.scrollHeight;
}

export function appendSidingOptions(socket) {
    // <li><b>Server: </b>Do you wish to write a solution?</li>
    // <li class="chat-button"><button>Yes</button><button>No</button></li>

    appendMessage("Server", "Do you wish to write a solution? You have one minute to decide.");

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
        no_button.classList.add("hidden");
        appendSolutionPrompt(socket);
    };

    no_button.onclick = () => {
        socket.emit("sided", false);
        deregisterChatButtons([yes_button, no_button]);
        yes_button.classList.add("hidden");
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
    appendMessage("Server", "Please submit your solution here:");
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

export function appendAcceptPrompt(socket, name, solution, reevaluate) {
    // <li><b>Server: </b>Tony submitted the following solution. Do you accept?</li>
    // <li class="chat-button">
    //     <p>4+5=9</p>
    //     <button>Yes</button><button>No</button>
    // </li>

    if (reevaluate) {
        appendMessage("Server", name + " does not agree that the solution is incorrect. Please re-evaluate whether you accept.")
    }
    else {
        appendMessage("Server", name + " submitted the following solution. Do you accept?");
    }
    
    let options = document.createElement('li');
    options.classList.add("chat-button");

    let solution_p = document.createElement('p');
    solution_p.innerHTML = solution;
    options.append(solution_p);

    let yes_button = document.createElement("button");
    yes_button.innerHTML = "Yes";
    options.appendChild(yes_button);

    let no_button = document.createElement("button");
    no_button.innerHTML = "No";
    options.appendChild(no_button);

    yes_button.onclick = () => {
        socket.emit("decided", {"name": name, "accepted": true});
        deregisterChatButtons([yes_button, no_button]);
        no_button.classList.add("hidden");
    };

    no_button.onclick = () => {
        socket.emit("decided", {"name": name, "accepted": false});
        deregisterChatButtons([yes_button, no_button]);
        yes_button.classList.add("hidden");
    };

    let messages = document.getElementById('message-list');
    messages.appendChild(options);
}

export function appendAssentToRejectPrompt(socket, name) {
    // <li><b>Server: </b>Tony rejected your solution. Do you agree?</li>
    // <li class="chat-button">
    //     <button>Yes</button><button>No</button>
    // </li>
    appendMessage("Server", name + " rejected your solution. Do you agree?");

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
        no_button.classList.add("hidden");
    };

    no_button.onclick = () => {
        socket.emit("assented", {"rejecter": name, "assented": false});
        deregisterChatButtons([yes_button, no_button]);
        yes_button.classList.add("hidden");
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

    li.appendChild(start_button);

    start_button.onclick = () => {
        socket.emit("new_shake");
    };

    document.getElementById('message-list').appendChild(li);
}
