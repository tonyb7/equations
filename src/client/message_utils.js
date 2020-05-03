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
