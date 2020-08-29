import React, {useState} from "react";
import PropTypes from 'prop-types';
import styles from './ChatMessage.module.css';

ChatMessage.propTypes = {
    name: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    boldMessage: PropTypes.bool,
}
ChatMessage.defaultProps = {
    boldMessage: false
}

/** React compunent responsible for rendering a single chat message. */
export function ChatMessage (props) {

    let messageStyle = props.boldMessage 
        ? styles.boldMessageText
        : "";

    return <>
        <span className={styles.messageSender}>{props.name}: </span>
        <span className={messageStyle}>{props.message} </span>
    </>
}