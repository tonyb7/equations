
export function initializeScoreboard(players) {
    let scoreboard = document.getElementById("scoreboard");
    for (let i = 0; i < players.length; ++i) {
        scoreboard.rows[0].cells.item(i).innerHTML = players[i];
    }
    for (let i = players.length; i < 3; ++i) {
        scoreboard.rows[0].cells.item(i).innerHTML = "--------";
    }
    return scoreboard;
}

export function displayScoreboard(game) {
    let scoreboard = initializeScoreboard(game['players']);
    
    let p1scores = game['p1scores'];
    let p2scores = game['p2scores'];
    let p3scores = game['p3scores'];

    if (typeof p1scores === "undefined") {
        return;
    }

    if (p1scores.length !== p2scores.length || p2scores.length != p3scores.length) {
        console.log("Something is messed up with the scores! Player scores are not of same length!");
    }

    for (let i = 0; i < p1scores.length; ++i) {
        addScoreboardScore(scoreboard, p1scores[i], p2scores[i], p3scores[i]);
    }
}

export function addScoreboardScore(scoreboard, p1score, p2score, p3score) {
    if (scoreboard.rows.length === 2 && scoreboard.rows[1].cells[0].innerHTML == 0) { // hacky
        scoreboard.deleteRow(1);
    }

    let new_row = scoreboard.insertRow();
    new_row.insertCell().innerHTML = p1score;
    new_row.insertCell().innerHTML = p2score;
    new_row.insertCell().innerHTML = p3score;
}

