// Handle timer stuff

import { socket } from './networking';

let starting_time;
let elapsed_div;
let five_min_warning_called = false;

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
        
        if (seconds >= 30 && !five_min_warning_called) {
            five_min_warning_called = true;
            socket.emit("five_minute_warning");
        }
        if (seconds >= 35) {
            clearInterval(timer);
            socket.emit("game_time_up");
            time_str = "35:00";
        }
        
        if (!elapsed_div) {
            elapsed_div = document.getElementById('elapsed');
        }
        elapsed_div.innerHTML = time_str;
    }, 1000);
}
