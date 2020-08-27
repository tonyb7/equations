import React, {useState} from "react";

/** React compunent responsible for composing and sending a chat message. */
export function ChatInput () {

    const [text, setText] = useState("");

    function onKeyPress(e) {
        if (e.key === 'Enter' && text.length > 0) {
            import(/*webpackChunkName: "networking" */ "../networking").then(
                (networking) => {
                    networking.sendChatMessage(text)
                    setText("");
                }
            ).catch((err) => console.log(err))
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