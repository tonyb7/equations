import React from "react";
import PropTypes from 'prop-types';
import styles from './ChatMessage.module.css';

/** Keeping track of the different UI types that can show up in the chat log */
const MESSAGE_TYPES = [
    "player_message",
    "server_message",
    "instruction",
    "new_shake",
];

ChatMessage.propTypes = {
    name: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(MESSAGE_TYPES).isRequired,
}
ChatMessage.defaultProps = {
    type: "player_message"
}

/** React compunent responsible for rendering a single chat message. */
export function ChatMessage (props) {

    let messageStyle = props.type === "instruction" 
        ? styles.boldMessageText
        : "";

    return <>
        <span className={styles.messageSender}>{props.name}: </span>
        <span className={messageStyle}>{props.message} </span>
    </>
}

NewShakeButton.propTypes = {
    buttonText: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
}

/** React component responsibile for rendering a new shake button */
export function NewShakeButton(props) {
    return <button idName="new_shake_button" onClick={props.onClick}>{props.buttonText}</button>
}