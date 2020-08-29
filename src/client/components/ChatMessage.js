import React, {useState} from "react";
import PropTypes from 'prop-types';

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

    let messageElement = props.boldMessage 
        ? <b><em>props.message</em></b>
        : props.message;

    return <>
        <b>{props.name}</b>: {messageElement} 
    </>
}