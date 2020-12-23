import React, {useState} from "react";
import PropTypes from 'prop-types';
import styles from './ChatMessages.module.css';
import { appendUniverseSizePrompt } from "../message_utils";

/** Keeping track of the different UI types that can show up in the chat log */
const MESSAGE_TYPES = [
    "player_message",
    "server_message",
    "instruction",
    "new_shake",
    "five_min_warning",
    "solution_check",
    "solution_prompt",
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

/** React component responsible for rendering the five minute warning message */
export function FiveMinWarning() {

    let msgpt1 = "Five minute warning! If the cubes have been rolled, ";
    let msgpt2 = "continue your game -- you have five minutes left. ";
    let msgpt3 = "Do not start a new shake.";
    return <ChatMessage
        name = "Server"
        message = {`${msgpt1}${msgpt2}${msgpt3}`}
        type = "five_min_warning"/>
}

ConfirmationButtons.propTypes = {
    onYesClick: PropTypes.func.isRequired,
    onNoClick: PropTypes.func.isRequired,
}

export function ConfirmationButtons(props) {

    // Either 'yes' or 'no
    const [choice, setChoice] = useState('unselected');

    let onYesClick = () => {
        setChoice('yes');
        props.onYesClick();
    }

    let onNoClick = () => {
        setChoice('no');
        props.onNoClick();
    }
    let shouldDisableButtons = choice === 'yes' || choice === 'no';

    let yesButtonAttributes = {
        className: choice === 'yes' ? 'button-clicked' : '',
        onClick: shouldDisableButtons ? null : onYesClick,
    }

    let noButtonAttributes = {
        className : choice === 'no' ? 'button-clicked' : '',
        onClick: shouldDisableButtons ? null : onNoClick,
    }

    return <>
    <button {...yesButtonAttributes}>Yes</button>
    <button {...noButtonAttributes}>No</button>
    </>
}

SolutionCheck.propTypes = {
    solution: PropTypes.string.isRequired,
    isGamePlayer: PropTypes.bool.isRequired,
    onYesClick: PropTypes.func,
    onNoClick: PropTypes.func,
}
export function SolutionCheck(props) {
    if (!props.isGamePlayer) {
        return <p>{props.solution}</p>
    }

    return <>
        <p>{props.solution}</p>
        <ConfirmationButtons
            onYesClick = {props.onYesClick}
            onNoClick = {props.onNoClick}
        />
    </>
}

SolutionPrompt.propTypes = {
    onSubmit: PropTypes.func.isRequired,
}
export function SolutionPrompt(props) {

    const [value, setValue] = useState('');
    const [submitted, setSubmitted] = useState(false);

    let buttonClassNames = ['solution_submit'];
    if (submitted) {
        buttonClassNames.push('hidden');
    }

    function submitButtonClick() {
        if (submitted) {
            return;
        }
        setSubmitted(true);
        props.onSubmit(value);
    }

    return <>
        <input 
            className='solution_box'
            placeholder='Type your solution here...'
            onChange={(e) => setValue(e.target.value)}
            disabled={submitted} 
            />
        <button
            className={buttonClassNames.join(' ')}
            onClick={submitButtonClick}
            >Submit Solution</button>
    </>

}

UniversePrompt.propTypes = {
    onSubmit: PropTypes.func.isRequired,
}
export function UniversePrompt(props) {

    const [value, setValue] = useState('');
    const [submitted, setSubmitted] = useState(false);

    let buttonClassNames = ['solution_submit'];
    if (submitted) {
        buttonClassNames.push('hidden');
    }

    function submitButtonClick() {
        if (submitted) {
            return;
        }
        setSubmitted(true);
        props.onSubmit(value);
    }

    return <>
        <input 
        className='solution_box'
        placeholder=''
        onChange={(e) => setValue(e.target.value)}
        maxLength='2'
        disabled={submitted}
        />
        <button
            className={buttonClassNames.join(' ')}
            onClick={submitButtonClick}
            >Set Universe</button>
    </>
}
