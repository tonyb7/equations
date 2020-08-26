import React, {useState} from "react";
import { sendChatMessage } from "../networking";

/** React compunent responsible for composing and sending a chat message. */
export function ChatInput () {

    const [text, setText] = useState("");

    function onKeyPress(e) {
        if (e.key === 'Enter' && text.length > 0) {
            sendChatMessage(text);
            setText("");
        }
    }

    function onChange(e) {
        setText(e.target.value);
    }

    return <input 
        class="inputMessage" 
        onKeyPress={onKeyPress} 
        onChange={onChange}
        placeholder="Type here..." 
        maxlength="200" 
        value={text}/>
}