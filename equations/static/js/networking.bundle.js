(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{59:function(e,t){},62:function(e,t,n){"use strict";n.r(t),n.d(t,"socket",(function(){return Ee})),n.d(t,"connect",(function(){return Le})),n.d(t,"sendChatMessage",(function(){return Ce})),n.d(t,"emitCubeClicked",(function(){return Te})),n.d(t,"bonusButtonCallback",(function(){return Se}));var o=n(33),r=n.n(o);function i(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return a(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return a(e,t)}(e))){var t=0,n=function(){};return{s:n,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,r,i=!0,c=!1;return{s:function(){o=e[Symbol.iterator]()},n:function(){var e=o.next();return i=e.done,e},e:function(e){c=!0,r=e},f:function(){try{i||null==o.return||o.return()}finally{if(c)throw r}}}}function a(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}function c(e){var t=document.createElement("li");t.innerHTML=e,document.getElementById("message-list").appendChild(t);var n=document.getElementById("message-list-div");n.scrollTop=n.scrollHeight}function l(e,t){c("<b>".concat(e,": </b> ").concat(t))}function u(e,t){c("<b>".concat(e,": </b> <b><em>").concat(t,"</em></b>"))}function s(e){l("Server",e)}function d(e){var t,n=i(e);try{for(n.s();!(t=n.n()).done;){t.value.onclick=function(){}}}catch(e){n.e(e)}finally{n.f()}}function f(e){s("Please submit your solution here:");var t=document.createElement("li");t.classList.add("solution_li");var n=document.createElement("input");n.classList.add("solution_box"),n.placeholder="Type your solution here...";var o=document.createElement("button");o.classList.add("solution_submit"),o.innerHTML="Submit Solution",o.onclick=function(){e.emit("solution_submitted",n.value),n.disabled=!0,o.onclick=function(){},o.classList.add("hidden")},t.appendChild(n),t.appendChild(o),document.getElementById("message-list").appendChild(t)}function g(e,t,n,o,r){s(r?o?t+" does not agree that the solution is incorrect. Please re-evaluate whether you accept.":t+" submitted the following solution. Do you accept?":t+" submitted the following solution. Waiting for players to accept/reject.");var i=document.createElement("li");i.classList.add("chat-button");var a=document.createElement("p");if(a.innerHTML=n,i.append(a),r){var c=document.createElement("button");c.innerHTML="Yes",i.appendChild(c);var l=document.createElement("button");l.innerHTML="No",i.appendChild(l),c.onclick=function(){e.emit("decided",{name:t,accepted:!0}),d([c,l]),c.classList.add("button-clicked")},l.onclick=function(){e.emit("decided",{name:t,accepted:!1}),d([c,l]),l.classList.add("button-clicked")}}document.getElementById("message-list").appendChild(i)}function m(e){s("The shake has ended due to a No Goal. Click below to restart the shake.");var t=document.createElement("li");t.classList.add("chat-button");var n=document.createElement("button");n.innerHTML="Restart Shake",n.id="new_shake_button",t.appendChild(n),n.onclick=function(){e.emit("restart_shake")},document.getElementById("message-list").appendChild(t)}var h,v,p,b,y,_,w,k,E=n(1);function I(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return L(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return L(e,t)}(e))){var t=0,n=function(){};return{s:n,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,r,i=!0,a=!1;return{s:function(){o=e[Symbol.iterator]()},n:function(){var e=o.next();return i=e.done,e},e:function(e){a=!0,r=e},f:function(){try{i||null==o.return||o.return()}finally{if(a)throw r}}}}function L(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}var C,T,S,B=!1,x=[];function M(){(h=document.getElementById("goal-sector")).width=.33*window.innerWidth,h.height=.09*window.innerHeight,v=h.getBoundingClientRect(),p=v.left,b=v.top,y=.1*h.width,_=y+3,w=y+2,k=h.height/8}function H(e,t,n){return t>e.cube_pos_x&&t<e.cube_pos_x+_&&n>k&&n<k+w}function j(e){return e=Math.min(e,h.width-_),e=Math.max(e,4)}function q(e){console.log("mouse down"),e.preventDefault(),e.stopPropagation();var t=parseInt(e.clientX-p),n=parseInt(e.clientY-b);B=!1;for(var o=x.length-1;o>=0;o--){var r=x[o];if(H(r,t,n)){B=!0,r.isDragging=!0;break}}C=t}function A(e){console.log("mouse up"),e.preventDefault(),e.stopPropagation(),B=!1;for(var t=0;t<x.length;t++)if(x[t].isDragging)return x[t].isDragging=!1,void Ee.emit("x_pos_update",{order:t,x_pos_per_mille:x[t].cube_pos_x/(h.width/1e3)})}function D(e){if(B){e.preventDefault(),e.stopPropagation();for(var t=parseInt(e.clientX-p),n=t-C,o=0;o<x.length;o++){var r=x[o];if(r.isDragging){r.cube_pos_x=j(r.cube_pos_x+n);break}}O(),C=t}}function N(e){e.preventDefault(),e.stopPropagation();for(var t=parseInt(e.clientX-p),n=parseInt(e.clientY-b),o=x.length-1;o>=0;o--){var r=x[o];if(H(r,t,n)){r.orientation=(r.orientation+90)%360,Ee.emit("orientation_update",{order:o,orientation:r.orientation});break}}return O(),!1}function O(){var e=h.getContext("2d");!function(e){e.clearRect(0,0,h.width,h.height)}(e),e.strokeStyle="#fff",e.lineWidth=2.5;for(var t=0;t<x.length;t++){var n=x[t];console.log("Calling draw rotated on ",n),W(e,n.cube,n.cube_pos_x,k,y,y,n.orientation)}}function W(e,t,n,o,r,i,a){e.save(),e.translate(n+r/2,o+i/2),e.rotate(a*Math.PI/180),console.log("Drawing the image!"),e.drawImage(t,-r/2,-i/2,r,i),function(e,t,n,o,r,i,a,c){if(void 0===c&&(c=!0),void 0===i&&(i=5),"number"==typeof i)i={tl:i,tr:i,br:i,bl:i};else{var l={tl:0,tr:0,br:0,bl:0};for(var u in l)i[u]=i[u]||l[u]}e.beginPath(),e.moveTo(t+i.tl,n),e.lineTo(t+o-i.tr,n),e.quadraticCurveTo(t+o,n,t+o,n+i.tr),e.lineTo(t+o,n+r-i.br),e.quadraticCurveTo(t+o,n+r,t+o-i.br,n+r),e.lineTo(t+i.bl,n+r),e.quadraticCurveTo(t,n+r,t,n+r-i.bl),e.lineTo(t,n+i.tl),e.quadraticCurveTo(t,n,t+i.tl,n),e.closePath(),a&&e.fill(),c&&e.stroke()}(e,-r/2-1,-i/2-1,r+3,i+2,7),e.restore()}function P(e){console.log("resize function called"),e.preventDefault(),e.stopPropagation();var t=h.width;h.width=.33*window.innerWidth,h.height=.09*window.innerHeight,v=h.getBoundingClientRect(),p=v.left,b=v.top,y=.1*h.width,_=y+3,w=y+2,k=h.height/8,function(e){for(var t=0;t<x.length;t++)console.log("OLD: ",x[t].cube_pos_x/(e/1e3)),x[t].cube_pos_x=j(x[t].cube_pos_x*(h.width/e)),Ee.emit("x_pos_update",{order:t,x_pos_per_mille:x[t].cube_pos_x/(h.width/1e3)}),console.log("NEW: ",x[t].cube_pos_x/(h.width/1e3))}(t),O()}var G=!1;function R(e){T=e;var t=setInterval((function(){var e=new Date,n=Math.round(e.getTime()/1e3)-T,o=Math.floor(n/60),r=Math.floor(n%60),i="";o<10&&(i="0");var a="";r<10&&(a="0");var c="".concat(i).concat(o,":").concat(a).concat(r);o>=30&&!G&&(G=!0,Ee.emit("five_minute_warning")),o>=35&&(clearInterval(t),Ee.emit("game_time_up"),c="35:00"),S||(S=document.getElementById("elapsed")),S.innerHTML=c}),1e3)}var F=new Map([["forbidden-sector","f"],["permitted-sector","p"],["required-sector","q"],["goal-sector","g"]]),Y={"forbidden-sector":0,"permitted-sector":0,"required-sector":0,"goal-sector":0};function z(e){console.log("Rolling cubes!");for(var t=document.getElementById("resources-cubes"),n=function(n){if(-1===e[n])return"continue";var o=t.querySelector("#r".concat(n)),r=Object(E.b)(n,e);r.onmouseover=function(){r.classList.add("show-border")},r.onmouseout=function(){r.classList.remove("show-border")},r.onclick=function(){return Te(n)},o.appendChild(r)},o=0;o<e.length;++o)n(o);console.log("Finished rolling cubes")}function U(e,t){e.length>6&&console.log("Something is wrong! Server stored more than 6 cubes in goal!"),Y["goal-sector"]=e.length,function(e,t){window.onresize=P;var n,o=I(e);try{for(o.s();!(n=o.n()).done;){var r=n.value;Object(E.b)(r.idx,t).onload=O,x.push({order:x.length,idx:r.idx,cube:Object(E.b)(r.idx,t),cube_pos_x:j(r.x*h.width/1e3),isDragging:!1,orientation:r.orientation})}}catch(e){o.e(e)}finally{o.f()}}(e,t)}function X(e,t,n){for(var o=0,r=[12,16,20];o<r.length;o++){var i=r[o];e.length>i&&ee(t,i)}Y[t]=e.length,function(e,t,n){for(var o=0;o<e.length;++o){var r=document.getElementById("".concat(F.get(t)).concat(o)),i=e[o];r.appendChild(Object(E.b)(i,n))}}(e,t,n)}function $(){x.length=0,O(),Y["goal-sector"]=0}function J(e){for(var t=document.getElementById(e).querySelector("table"),n=t.rows.length-1;n>=3;--n)t.deleteRow(n);for(var o=0;o<12;++o){t.querySelector("#".concat(F.get(e)).concat(o)).innerHTML=""}Y[e]=0}function K(e){for(var t=document.getElementById("scoreboard"),n=0;n<e.length;++n)t.rows[0].cells.item(n).innerHTML=e[n];for(var o=e.length;o<3;++o)t.rows[0].cells.item(o).innerHTML="--------";return t}function Q(e,t,n,o){2===e.rows.length&&0==e.rows[1].cells[0].innerHTML&&e.deleteRow(1);var r=e.insertRow();r.insertCell().innerHTML=t,r.insertCell().innerHTML=n,r.insertCell().innerHTML=o}function V(e){document.getElementById("actual-turn-text").innerHTML="".concat(e)}function Z(e){var t=e.from,n=Y[e.to],o="".concat(F.get(e.to)).concat(n);12!==n&&16!==n&&20!==n||ee(e.to,n),Y[e.to]++;var r=document.getElementById("resources-cubes").querySelector("#r".concat(t)).querySelector("img");r.onmouseover=function(){},r.onmouseout=function(){},r.onclick=function(){},r.classList.remove("highlight-img"),"goal-sector"===e.to?function(e,t){var n=h.width/100;0!==x.length&&(n+=x.length*(3*n+_));var o=x.length;x.push({order:o,idx:e,cube:t.cloneNode(!0),cube_pos_x:n,isDragging:!1,orientation:0}),t.remove(),Ee.emit("x_pos_update",{order:o,x_pos_per_mille:n/(h.width/1e3)}),O()}(e.from,r):document.getElementById(o).appendChild(r),ne(!1)}function ee(e,t){for(var n=document.getElementById(e).querySelector("table").insertRow(),o=0;o<4;++o){n.insertCell().id="".concat(F.get(e)).concat(t+o)}}var te=function(e){!function(e,t,n,o){if(void 0!==t){t.length===n.length&&n.length==o.length||console.log("Something is messed up with the scores! Not of same length!");for(var r=0;r<t.length;++r)Q(e,t[r],n[r],o[r])}}(K(e.players),e.p1scores,e.p2scores,e.p3scores),e.game_finished?V("Game Ended"):e.game_started?(V(e.players[e.turn]),R(e.starttime)):V("Not Started"),e.game_started&&(document.getElementById("start_game").remove(),M(),e.goalset&&oe(),z(e.resources),U(e.goal,e.cube_index),X(e.forbidden,"forbidden-sector",e.cube_index),X(e.permitted,"permitted-sector",e.cube_index),X(e.required,"required-sector",e.cube_index))};function ne(e){var t=document.getElementById("bonus-button");t.classList.remove("button-clicked"),e?(t.classList.remove("hidden"),t.onclick=Se.bind(t)):(t.classList.add("hidden"),t.onclick=function(){})}function oe(){var e=document.getElementById("no_goal");e.classList.add("hidden"),e.onclick=function(){return console.log("No goal challenge somehow clicked...")};var t=document.getElementById("set-goal-button");t.classList.add("hidden"),t.onclick=function(){return console.log("Set goal button somehow clicked...")},h.onmousedown=function(){},h.onmouseup=function(){},h.onmousemove=function(){},h.oncontextmenu=function(){}}function re(){console.log("Clearing board"),$();for(var e=0,t=["forbidden-sector","permitted-sector","required-sector"];e<t.length;e++){J(t[e])}!function(){for(var e=document.getElementById("resources-cubes"),t=0;t<24;++t){e.querySelector("#r".concat(t)).innerHTML=""}}()}function ie(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return ae(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return ae(e,t)}(e))){var t=0,n=function(){};return{s:n,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,r,i=!0,a=!1;return{s:function(){o=e[Symbol.iterator]()},n:function(){var e=o.next();return i=e.done,e},e:function(e){a=!0,r=e},f:function(){try{i||null==o.return||o.return()}finally{if(a)throw r}}}}function ae(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}var ce=["forbidden-sector","permitted-sector","required-sector","goal-sector"],le=["flip_timer","claim_warning","claim_minus_one","a_flub","p_flub","no_goal"];var ue=function(e,t,n,o){if(M(),window.onresize=P,o&&n===t){var r=document.getElementById("set-goal-button");r.classList.remove("hidden"),r.onclick=function(){e.emit("set_goal")},h.onmousedown=q,h.onmouseup=A,h.onmousemove=D,h.oncontextmenu=N}};function se(e,t){var n,o=ie(ce);try{var r=function(){var t=n.value;document.getElementById(t).onclick=function(){console.log("".concat(t," clicked")),e.emit("sector_clicked",t)}};for(o.s();!(n=o.n()).done;)r()}catch(e){o.e(e)}finally{o.f()}!function(e){var t,n=de(),o=ie(le);try{for(o.s();!(t=o.n()).done;){var r=t.value;fe(e,n.querySelector("#".concat(r)),r)}}catch(e){o.e(e)}finally{o.f()}}(e),ne(t)}function de(){var e=document.getElementById("buttons-div");if(0===e.length)throw Error("Error finding buttons on page!?");return e}function fe(e,t,n){t.onclick=function(){console.log("Button for ".concat(n," clicked!")),e.emit(n)}}function ge(){var e,t,n=ie(ce);try{for(n.s();!(e=n.n()).done;){var o=e.value;document.getElementById(o).onclick=function(){}}}catch(e){n.e(e)}finally{n.f()}!function(){var e,t=de(),n=ie(le);try{for(n.s();!(e=n.n()).done;){var o=e.value;t.querySelector("#".concat(o)).onclick=function(){}}}catch(e){n.e(e)}finally{n.f()}}(),(t=document.getElementById("set-goal-button")).classList.add("hidden"),t.onclick=function(){},ne(!1)}var me=new Map([["a_flub","Challenge Now"],["p_flub","Challenge Never"],["no_goal","No Goal Declared"]]);function he(e,t,n,o){n&&(V(me.get(n.challenge)),"finished"===n.endgame_stage?we(e,t,o):"no_goal_finished"===n.endgame_stage?function(e,t,n){n.includes(t)?(s("Click here to restart the shake: "),m(e)):s("Waiting for players to restart the shake...")}(e,t,o):(function(e){var t=e.challenge;if("force_out"===t)s("The players are currently in a Force Out...");else if("no_goal"===t)s("A No Goal has been declared...");else{var n="".concat(e.challenger," has called "),o="".concat(me.get(t)," on ").concat(e.last_mover,".");s("".concat(n).concat(o))}}(n),"waiting_for_reviewers"===n.endgame_stage?(ye(e,t,{solutions:n.solutions,players:o}),function(e,t,n){for(var o in n.review_status)if(n.review_status.hasOwnProperty(o))for(var r in n.review_status[o]){if(n.review_status[o].hasOwnProperty(r))"ASSENTING"===n.review_status[o][r]&&_e(e,t,{rejecter:o,writer:r})}}(e,t,n)):"no_goal"==n.challenge?ve(e,n.caller,n.writers,n.nonwriters,t):(pe(e,n.sider,t),be(e,n.writers,t))))}function ve(e,t,n,o,r){r===t?s("Waiting for other player to agree or disagree with your No Goal declaration..."):o.includes(r)?s("Waiting for one more player to agree or disagree with the No Goal declaration..."):n.includes(r)?f(e):function(e,t){s(t+" claims no goal can be set which has at least one correct solution. Do you agree? If not, you can challenge the No Goal declaration and you will have two minutes to write a correct Solution & Goal. Disagreeing with the no goal declaration is considered a challenge, so the first player to disagree (if a player disagrees) will be deemed the challenger.");var n=document.createElement("li");n.classList.add("chat-button");var o=document.createElement("button");o.innerHTML="Agree",n.appendChild(o);var r=document.createElement("button");r.innerHTML="Disagree & Write",n.appendChild(r),o.onclick=function(){e.emit("no_goal_sided",!0),d([o,r]),o.classList.add("button-clicked")},r.onclick=function(){e.emit("no_goal_sided",!1),d([o,r]),r.classList.add("button-clicked"),f(e)},document.getElementById("message-list").appendChild(n)}(e,t)}function pe(e,t,n){null!=t&&(t===n?function(e){s("Do you wish to write a solution? You have one minute to decide.");var t=document.createElement("li");t.classList.add("chat-button");var n=document.createElement("button");n.innerHTML="Yes",t.appendChild(n);var o=document.createElement("button");o.innerHTML="No",t.appendChild(o),n.onclick=function(){e.emit("sided",!0),d([n,o]),n.classList.add("button-clicked"),f(e)},o.onclick=function(){e.emit("sided",!1),d([n,o]),o.classList.add("button-clicked")},document.getElementById("message-list").appendChild(t)}(e):s("Waiting for ".concat(t," to side...")))}function be(e,t,n){t.includes(n)?f(e):s("Waiting for solutions to be submitted....")}function ye(e,t,n){s("Time to review solutions!");var o=n.solutions,r=n.players,i=!1;for(var a in o)a!==t&&(i=!0,g(e,a,o[a],!1,r.includes(t)));i||s("Waiting for others to finish reviewing solutions...")}function _e(e,t,n){var o=n.rejecter,r=n.writer;r===t?function(e,t){s(t+" rejected your solution. Do you agree?");var n=document.createElement("li");n.classList.add("chat-button");var o=document.createElement("button");o.innerHTML="Yes",n.appendChild(o);var r=document.createElement("button");r.innerHTML="No",n.appendChild(r),o.onclick=function(){e.emit("assented",{rejecter:t,assented:!0}),d([o,r]),o.classList.add("button-clicked")},r.onclick=function(){e.emit("assented",{rejecter:t,assented:!1}),d([o,r]),r.classList.add("button-clicked")},document.getElementById("message-list").appendChild(n)}(e,o):s("Waiting for ".concat(r," to accept the rejection..."))}function we(e,t,n){n.includes(t)?(s("Click here to start a new shake: "),function(e){var t=document.createElement("li");t.classList.add("chat-button");var n=document.createElement("button");n.innerHTML="Start New Shake",n.id="new_shake_button",t.appendChild(n),n.onclick=function(){e.emit("new_shake")},document.getElementById("message-list").appendChild(t)}(e)):s("Waiting for players to start a new shake...")}var ke=window.location.protocol.includes("https")?"wss":"ws",Ee=r()("".concat(ke,"://").concat(window.location.host),{reconnection:!1}),Ie=new Promise((function(e){Ee.on("connect",(function(){console.log("Connected to server!"),e()}))})),Le=function(){Ie.then((function(){var e=document.getElementById("room-nonce").innerHTML,t=document.getElementById("name").innerHTML,n={room:e,name:t};!function(e){Ee.on("disconnect",(function(){return console.log("disconnected from room")})),Ee.on("message",(function(e){return l(e.name,e.message)})),Ee.on("server_message",(function(e){return s(e)})),Ee.on("render_spectator_state",(function(t){te(t),he(Ee,e,t.endgame,t.players)})),Ee.on("render_player_state",(function(t){var n;(te(t),t.game_finished)||(t.game_started?(se(Ee,function(e,t){if(e.players[e.turn]!=t)return!1;if(e.challenge)return!1;if(n=Object.values(Y).reduce((function(e,t){return e+t})),console.log("cubes not in resources: ",n),24-n<2)return!1;var n;if(e.started_move)return!1;var o=e.players.findIndex((function(e){return e===t}));if(-1===o)return console.log("Error! Player not in game in render_player_state"),!1;for(var r=function(e,t){return e+t},i=e["p".concat(o+1,"scores")].reduce(r),a=e.p1scores.reduce(r),c=e.p2scores.reduce(r),l=e.p3scores.reduce(r),u=0,s=0,d=[a,c,l];s<d.length;s++){i>d[s]&&++u}if(2===u)return!1;return!0}(t,e)),ue(Ee,e,t.players[t.turn],!t.goalset),he(Ee,e,t.endgame,t.players),console.log("challenge recorded: ",t.challenge),"no_goal"===t.challenge&&oe()):(n=Ee,de().querySelector("#start_game").onclick=function(){console.log("Button for start_game clicked!"),n.emit("start_game")},function(e,t,n){if(!t.tournament&&t.players.includes(n)){var o=document.createElement("button");o.innerHTML="Leave Game",o.onclick=function(){e.emit("leave_game")};var r=document.createElement("a");r.id="leave_game_anchor",r.href="/",r.appendChild(o),document.getElementById("buttons-div").appendChild(r)}}(Ee,t,e)))})),Ee.on("new_player",K),Ee.on("player_left",K),Ee.on("begin_game",(function(t){var n=t.cubes;document.getElementById("start_game").remove(),document.getElementById("leave_game_anchor").remove(),s("".concat(t.starter," started the game! The cubes have been rolled!")),s("".concat(t.goalsetter," is chosen to be the goalsetter.")),u("Server","Move cubes by clicking a cube in resources, then clicking the area on the mat you want to move it to."),u("Server","For goalsetting, once cubes are on the goal line, you can rearrange them (by dragging them horizontally) and rotate them (by right clicking on the cube you want to rotate)."),u("Server","If you can bonus on your turn, a bonus button will appear in the upper right corner of resources. To bonus, first click the bonus button, then move the bonused cube to forbidden, and continue with the rest of your turn."),t.starter===e?s('Press "Goal Set!" when you\'re done!'):s("Waiting for ".concat(t.goalsetter," to finish setting the goal...")),R(t.starttime),z(n),Q(K(t.players),0,0,0);var o=t.goalsetter;se(Ee,o===e),V(o),ue(Ee,e,o,!0)})),Ee.on("begin_shake",(function(t){var n=document.getElementById("new_shake_button");n&&n.remove(),s("A new shake has started! ".concat(t.goalsetter," is chosen to be the goalsetter.")),re(),z(t.cubes);var o=t.goalsetter;se(Ee,o===e&&t.show_bonus),V(o),ue(Ee,e,o,!0)})),Ee.on("end_shake_no_goal",(function(){return m(Ee)})),Ee.on("hide_goal_setting_buttons",(function(){return oe()})),Ee.on("update_goalline",(function(e){var t,n,o;t=e.type,n=e.order,o=e.new_val,"x_pos"===t?x[n].cube_pos_x=j(o*(h.width/1e3)):"orientation"===t&&(x[n].orientation=o),O()})),Ee.on("highlight_cube",(function(e){return t=e,void document.getElementById("r".concat(t)).querySelector("img").classList.add("highlight-img");var t})),Ee.on("unhighlight_cube",(function(e){return t=e,void document.getElementById("r".concat(t)).querySelector("img").classList.remove("highlight-img");var t})),Ee.on("move_cube",(function(e){return Z(e)})),Ee.on("next_turn",(function(t){var n=t.player,o=t.show_bonus;V(n),ne(n===e&&o)})),Ee.on("handle_challenge",(function(t){return function(e,t,n){var o=n.challenge,r=n.writers,i=n.nonwriters,a=n.caller,c=n.sider;ge(),V(me.get(o)),"no_goal"!==o?(pe(e,c,t),be(e,r,t)):ve(e,a,r,i,t)}(Ee,e,t)})),Ee.on("force_out",(function(t){return function(e,t,n){V("Force Out"),s("It is now Force Out."),n.includes(t)?(ge(),f(e)):s("Waiting for players to write solutions...")}(Ee,e,t)})),Ee.on("review_solutions",(function(t){return ye(Ee,e,t)})),Ee.on("rejection_assent",(function(t){return _e(Ee,e,t)})),Ee.on("reevaluate_solution",(function(t){return function(e,t,n){var o=n.rejecter,r=n.writer,i=n.solution;if(o===t)g(e,r,i,!0,!0);else{var a="".concat(r," does not agree that his/her solution "),c="is incorrect. Waiting for ".concat(o," to re-evaluate ");s("".concat(a).concat(c).concat("whether the solution is correct..."))}}(Ee,e,t)})),Ee.on("finish_shake",(function(t){return function(e,t,n,o){var r=n.p1score,i=n.p2score,a=n.p3score,c=n.players;s("This shake has finished! The scoreboard has been updated."),Q(document.getElementById("scoreboard"),r,i,a),o?e.emit("game_over"):we(e,t,c)}(Ee,e,t.scores,t.game_finished)})),Ee.on("five_minute_warning_message",(function(){s("".concat("Five minute warning! If the cubes have been rolled, ").concat("continue your game -- you have five minutes left. ").concat("Do not start a new shake."))})),Ee.on("game_over_clientside",(function(){s("The game has finished!"),V("Game Ended"),ge()}))}(t),console.log("Connecting as ".concat(t," in room ").concat(e)),Ee.emit("register_client",n)})).catch((function(e){return console.log("Error: ",e)}))};function Ce(e){var t=document.getElementById("name").innerHTML;Ee.emit("new_message",{name:t,message:e})}var Te=function(e){return Ee.emit("cube_clicked",e)};function Se(){this.classList.toggle("button-clicked"),Ee.emit("bonus_clicked")}}}]);