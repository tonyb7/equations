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
    appendMessage("Server", "Who do you side with?");

    let options = document.createElement('li');
    options.classList.add("chat-button");

    let challenger_button = document.createElement("button");
    challenger_button.innerHTML = "Challenger";
    options.appendChild(challenger_button);

    let defender_button = document.createElement("button");
    defender_button.innerHTML = "Defender";
    options.appendChild(defender_button);

    challenger_button.onclick = () => {
        socket.emit("sided", "challenger");
        deregisterChatButtons([challenger_button, defender_button]);
    };

    defender_button.onclick = () => {
        socket.emit("sided", "defender");
        deregisterChatButtons([challenger_button, defender_button]);
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
