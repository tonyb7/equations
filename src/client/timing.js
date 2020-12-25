// Handle timer stuff

import { appendServerMessage } from './message_utils';
import { socket } from './networking';

let starting_time;
let elapsed_div;
let timer_div;
let five_min_warning_called = false;

let turnTimer;

export function displayTimers(game) {
    if (game['game_finished']) {
        setElapsedTimer("35:00");
        setGameTimer("0:00");
    }
    else if (!game['game_started']) {
        setElapsedTimer("00:00");
        setGameTimer("0:00");
    }
    else {
        initializeElapsedTimer(game['starttime']);
        updateGameTimer(game["last_timer_flip"]);
    }
}

function setElapsedTimer(time_str) {
    if (!elapsed_div) {
        elapsed_div = document.getElementById('elapsed');
    }
    elapsed_div.innerHTML = time_str;
}

function setGameTimer(time_str) {
    if (!timer_div) {
        timer_div = document.getElementsByClassName("display-time-div")[0];
    }
    timer_div.innerHTML = `<p>${time_str}</p>`;
}

export function initializeElapsedTimer(starttime) {
    starting_time = starttime;
    let timer = setInterval(() => {
        let current_time = new Date();
        let seconds_since_epoch = Math.round(current_time.getTime()/1000);

        let seconds_passed = seconds_since_epoch - starting_time;
        let minutes = Math.floor(seconds_passed/60);
        let seconds = Math.floor(seconds_passed % 60);

        let minutes_leading_zero_str = "";
        if (minutes < 10) {
            minutes_leading_zero_str = "0";
        }

        let seconds_leading_zero_str = "";
        if (seconds < 10) {
            seconds_leading_zero_str = "0";
        }

        let time_str = `${minutes_leading_zero_str}${minutes}:${seconds_leading_zero_str}${seconds}`;
        
        if (minutes >= 30 && !five_min_warning_called) {
            five_min_warning_called = true;
            socket.emit("five_minute_warning");
        }
        if (minutes >= 35) {
            clearInterval(timer);
            socket.emit("game_time_up");
            time_str = "35:00";
        }
        
        setElapsedTimer(time_str);
    }, 1000);
}

export function updateGameTimer(time) {
    // Timer should display 60 - (currentTime - time) seconds left

    if (!time) {
        return;
    }

    clearInterval(turnTimer);
    turnTimer = setInterval(() => {
        let current_time = new Date();

        let seconds_passed = Math.floor((current_time.getTime()/1000) - time);
        let display_time = 60 - seconds_passed;

        let seconds_leading_zero_str = "";
        if (display_time < 10) {
            seconds_leading_zero_str = "0";
        }

        let time_str = `0:${seconds_leading_zero_str}${display_time}`;
        
        if (display_time <= 0) {
            clearInterval(turnTimer);
            time_str = "0:00";
        }
        
        setGameTimer(time_str);
    }, 1000);

}

export function updateTimerOnFlip(info) {
    appendServerMessage(`${info['flipper']} flipped the timer.`);
    updateGameTimer(info["last_timer_flip"]);
}
