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
        socket.emit("sided", "write");
        deregisterChatButtons([yes_button, no_button]);
    };

    no_button.onclick = () => {
        socket.emit("sided", "no_write");
        deregisterChatButtons([yes_button, no_button]);
    };

    let messages = document.getElementById('message-list');
    messages.appendChild(options);
}

function deregisterChatButtons(buttons) {
    for (let button of buttons) {
        button.classList.add("hidden");
        button.onclick = () => {};
    }
}
