(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{63:function(e,t){},69:function(e,t,n){var o=n(6),r=n(70);"string"==typeof(r=r.__esModule?r.default:r)&&(r=[[e.i,r,""]]);var i={insert:"head",singleton:!1};o(r,i);e.exports=r.locals||{}},70:function(e,t,n){"use strict";n.r(t);var o=n(4),r=n.n(o)()(!1);r.push([e.i,"\n.ChatMessage-module__boldMessageText--3hn1R-ZG {\n    font-weight: bold;\n    font-style: italics;\n}\n\n\n.ChatMessage-module__messageSender--15TnHX_2 {\n    font-weight: bold;\n}",""]),r.locals={boldMessageText:"ChatMessage-module__boldMessageText--3hn1R-ZG",messageSender:"ChatMessage-module__messageSender--15TnHX_2"},t.default=r},71:function(e,t,n){"use strict";n.r(t),n.d(t,"socket",(function(){return Be})),n.d(t,"connect",(function(){return qe})),n.d(t,"sendChatMessage",(function(){return je})),n.d(t,"emitCubeClicked",(function(){return Ae})),n.d(t,"bonusButtonCallback",(function(){return De}));var o=n(37),r=n.n(o),i=n(0),a=n.n(i),c=n(3),l=n.n(c),s=n(66),u=n.n(s),d=n(69),f=n.n(d);function g(e){var t=e.boldMessage?f.a.boldMessageText:"";return a.a.createElement(a.a.Fragment,null,a.a.createElement("span",{className:f.a.messageSender},e.name,": "),a.a.createElement("span",{className:t},e.message," "))}function m(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return h(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return h(e,t)}(e))){var t=0,n=function(){};return{s:n,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,r,i=!0,a=!1;return{s:function(){o=e[Symbol.iterator]()},n:function(){var e=o.next();return i=e.done,e},e:function(e){a=!0,r=e},f:function(){try{i||null==o.return||o.return()}finally{if(a)throw r}}}}function h(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}function v(e,t){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],o=document.createElement("li"),r=document.getElementById("message-list");r.appendChild(o),l.a.render(a.a.createElement(g,{name:e,message:t,boldMessage:n}),o);var i=document.getElementById("message-list-div");i.scrollTop=i.scrollHeight}function p(e,t){v(e,t,!0)}function b(e){v("Server",e)}function y(e){var t,n=m(e);try{for(n.s();!(t=n.n()).done;){t.value.onclick=function(){}}}catch(e){n.e(e)}finally{n.f()}}function _(e){b("Please submit your solution here:");var t=document.createElement("li");t.classList.add("solution_li");var n=document.createElement("input");n.classList.add("solution_box"),n.placeholder="Type your solution here...";var o=document.createElement("button");o.classList.add("solution_submit"),o.innerHTML="Submit Solution",o.onclick=function(){e.emit("solution_submitted",n.value),n.disabled=!0,o.onclick=function(){},o.classList.add("hidden")},t.appendChild(n),t.appendChild(o),document.getElementById("message-list").appendChild(t)}function w(e,t,n,o,r){b(r?o?t+" does not agree that the solution is incorrect. Please re-evaluate whether you accept.":t+" submitted the following solution. Do you accept?":t+" submitted the following solution. Waiting for players to accept/reject.");var i=document.createElement("li");i.classList.add("chat-button");var a=document.createElement("p");if(a.innerHTML=n,i.append(a),r){var c=document.createElement("button");c.innerHTML="Yes",i.appendChild(c);var l=document.createElement("button");l.innerHTML="No",i.appendChild(l),c.onclick=function(){e.emit("decided",{name:t,accepted:!0}),y([c,l]),c.classList.add("button-clicked")},l.onclick=function(){e.emit("decided",{name:t,accepted:!1}),y([c,l]),l.classList.add("button-clicked")}}document.getElementById("message-list").appendChild(i)}function k(e){b("The shake has ended due to a No Goal. Click below to restart the shake.");var t=document.createElement("li");t.classList.add("chat-button");var n=document.createElement("button");n.innerHTML="Restart Shake",n.id="new_shake_button",t.appendChild(n),n.onclick=function(){e.emit("restart_shake")},document.getElementById("message-list").appendChild(t)}g.propTypes={name:u.a.string.isRequired,message:u.a.string.isRequired,boldMessage:u.a.bool},g.defaultProps={boldMessage:!1};var E,I,L,T,C,S,M,x,B=n(1);function H(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return q(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return q(e,t)}(e))){var t=0,n=function(){};return{s:n,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,r,i=!0,a=!1;return{s:function(){o=e[Symbol.iterator]()},n:function(){var e=o.next();return i=e.done,e},e:function(e){a=!0,r=e},f:function(){try{i||null==o.return||o.return()}finally{if(a)throw r}}}}function q(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}var j,A,D,N=!1,O=[];function W(){(E=document.getElementById("goal-sector")).width=.33*window.innerWidth,E.height=.09*window.innerHeight,I=E.getBoundingClientRect(),L=I.left,T=I.top,C=.1*E.width,S=C+3,M=C+2,x=E.height/8}function P(e,t,n){return t>e.cube_pos_x&&t<e.cube_pos_x+S&&n>x&&n<x+M}function G(e){return e=Math.min(e,E.width-S),e=Math.max(e,4)}function R(e){console.log("mouse down"),e.preventDefault(),e.stopPropagation();var t=parseInt(e.clientX-L),n=parseInt(e.clientY-T);N=!1;for(var o=O.length-1;o>=0;o--){var r=O[o];if(P(r,t,n)){N=!0,r.isDragging=!0;break}}j=t}function F(e){console.log("mouse up"),e.preventDefault(),e.stopPropagation(),N=!1;for(var t=0;t<O.length;t++)if(O[t].isDragging)return O[t].isDragging=!1,void Be.emit("x_pos_update",{order:t,x_pos_per_mille:O[t].cube_pos_x/(E.width/1e3)})}function Y(e){if(N){e.preventDefault(),e.stopPropagation();for(var t=parseInt(e.clientX-L),n=t-j,o=0;o<O.length;o++){var r=O[o];if(r.isDragging){r.cube_pos_x=G(r.cube_pos_x+n);break}}z(),j=t}}function X(e){e.preventDefault(),e.stopPropagation();for(var t=parseInt(e.clientX-L),n=parseInt(e.clientY-T),o=O.length-1;o>=0;o--){var r=O[o];if(P(r,t,n)){r.orientation=(r.orientation+90)%360,Be.emit("orientation_update",{order:o,orientation:r.orientation});break}}return z(),!1}function z(){var e=E.getContext("2d");!function(e){e.clearRect(0,0,E.width,E.height)}(e),e.strokeStyle="#fff",e.lineWidth=2.5;for(var t=0;t<O.length;t++){var n=O[t];console.log("Calling draw rotated on ",n),U(e,n.cube,n.cube_pos_x,x,C,C,n.orientation)}}function U(e,t,n,o,r,i,a){e.save(),e.translate(n+r/2,o+i/2),e.rotate(a*Math.PI/180),console.log("Drawing the image!"),e.drawImage(t,-r/2,-i/2,r,i),function(e,t,n,o,r,i,a,c){if(void 0===c&&(c=!0),void 0===i&&(i=5),"number"==typeof i)i={tl:i,tr:i,br:i,bl:i};else{var l={tl:0,tr:0,br:0,bl:0};for(var s in l)i[s]=i[s]||l[s]}e.beginPath(),e.moveTo(t+i.tl,n),e.lineTo(t+o-i.tr,n),e.quadraticCurveTo(t+o,n,t+o,n+i.tr),e.lineTo(t+o,n+r-i.br),e.quadraticCurveTo(t+o,n+r,t+o-i.br,n+r),e.lineTo(t+i.bl,n+r),e.quadraticCurveTo(t,n+r,t,n+r-i.bl),e.lineTo(t,n+i.tl),e.quadraticCurveTo(t,n,t+i.tl,n),e.closePath(),a&&e.fill(),c&&e.stroke()}(e,-r/2-1,-i/2-1,r+3,i+2,7),e.restore()}function $(e){console.log("resize function called"),e.preventDefault(),e.stopPropagation();var t=E.width;E.width=.33*window.innerWidth,E.height=.09*window.innerHeight,I=E.getBoundingClientRect(),L=I.left,T=I.top,C=.1*E.width,S=C+3,M=C+2,x=E.height/8,function(e){for(var t=0;t<O.length;t++)console.log("OLD: ",O[t].cube_pos_x/(e/1e3)),O[t].cube_pos_x=G(O[t].cube_pos_x*(E.width/e)),Be.emit("x_pos_update",{order:t,x_pos_per_mille:O[t].cube_pos_x/(E.width/1e3)}),console.log("NEW: ",O[t].cube_pos_x/(E.width/1e3))}(t),z()}var J=!1;function Z(e){A=e;var t=setInterval((function(){var e=new Date,n=Math.round(e.getTime()/1e3)-A,o=Math.floor(n/60),r=Math.floor(n%60),i="";o<10&&(i="0");var a="";r<10&&(a="0");var c="".concat(i).concat(o,":").concat(a).concat(r);o>=30&&!J&&(J=!0,Be.emit("five_minute_warning")),o>=35&&(clearInterval(t),Be.emit("game_time_up"),c="35:00"),D||(D=document.getElementById("elapsed")),D.innerHTML=c}),1e3)}var K=new Map([["forbidden-sector","f"],["permitted-sector","p"],["required-sector","q"],["goal-sector","g"]]),Q={"forbidden-sector":0,"permitted-sector":0,"required-sector":0,"goal-sector":0};function V(e){console.log("Rolling cubes!");for(var t=document.getElementById("resources-cubes"),n=function(n){if(-1===e[n])return"continue";var o=t.querySelector("#r".concat(n)),r=Object(B.b)(n,e);r.onmouseover=function(){r.classList.add("show-border")},r.onmouseout=function(){r.classList.remove("show-border")},r.onclick=function(){return Ae(n)},o.appendChild(r)},o=0;o<e.length;++o)n(o);console.log("Finished rolling cubes")}function ee(e,t){e.length>6&&console.log("Something is wrong! Server stored more than 6 cubes in goal!"),Q["goal-sector"]=e.length,function(e,t){window.onresize=$;var n,o=H(e);try{for(o.s();!(n=o.n()).done;){var r=n.value;Object(B.b)(r.idx,t).onload=z,O.push({order:O.length,idx:r.idx,cube:Object(B.b)(r.idx,t),cube_pos_x:G(r.x*E.width/1e3),isDragging:!1,orientation:r.orientation})}}catch(e){o.e(e)}finally{o.f()}}(e,t)}function te(e,t,n){for(var o=0,r=[12,16,20];o<r.length;o++){var i=r[o];e.length>i&&le(t,i)}Q[t]=e.length,function(e,t,n){for(var o=0;o<e.length;++o){var r=document.getElementById("".concat(K.get(t)).concat(o)),i=e[o];r.appendChild(Object(B.b)(i,n))}}(e,t,n)}function ne(){O.length=0,z(),Q["goal-sector"]=0}function oe(e){for(var t=document.getElementById(e).querySelector("table"),n=t.rows.length-1;n>=3;--n)t.deleteRow(n);for(var o=0;o<12;++o){t.querySelector("#".concat(K.get(e)).concat(o)).innerHTML=""}Q[e]=0}function re(e){for(var t=document.getElementById("scoreboard"),n=0;n<e.length;++n)t.rows[0].cells.item(n).innerHTML=e[n];for(var o=e.length;o<3;++o)t.rows[0].cells.item(o).innerHTML="--------";return t}function ie(e,t,n,o){2===e.rows.length&&0==e.rows[1].cells[0].innerHTML&&e.deleteRow(1);var r=e.insertRow();r.insertCell().innerHTML=t,r.insertCell().innerHTML=n,r.insertCell().innerHTML=o}function ae(e){document.getElementById("actual-turn-text").innerHTML="".concat(e)}function ce(e){var t=e.from,n=Q[e.to],o="".concat(K.get(e.to)).concat(n);12!==n&&16!==n&&20!==n||le(e.to,n),Q[e.to]++;var r=document.getElementById("resources-cubes").querySelector("#r".concat(t)).querySelector("img");r.onmouseover=function(){},r.onmouseout=function(){},r.onclick=function(){},r.classList.remove("highlight-img"),"goal-sector"===e.to?function(e,t){var n=E.width/100;0!==O.length&&(n+=O.length*(3*n+S));var o=O.length;O.push({order:o,idx:e,cube:t.cloneNode(!0),cube_pos_x:n,isDragging:!1,orientation:0}),t.remove(),Be.emit("x_pos_update",{order:o,x_pos_per_mille:n/(E.width/1e3)}),z()}(e.from,r):document.getElementById(o).appendChild(r),ue(!1)}function le(e,t){for(var n=document.getElementById(e).querySelector("table").insertRow(),o=0;o<4;++o){n.insertCell().id="".concat(K.get(e)).concat(t+o)}}var se=function(e){!function(e,t,n,o){if(void 0!==t){t.length===n.length&&n.length==o.length||console.log("Something is messed up with the scores! Not of same length!");for(var r=0;r<t.length;++r)ie(e,t[r],n[r],o[r])}}(re(e.players),e.p1scores,e.p2scores,e.p3scores),e.game_finished?ae("Game Ended"):e.game_started?(ae(e.players[e.turn]),Z(e.starttime)):ae("Not Started"),e.game_started&&(document.getElementById("start_game").remove(),W(),e.goalset&&de(),V(e.resources),ee(e.goal,e.cube_index),te(e.forbidden,"forbidden-sector",e.cube_index),te(e.permitted,"permitted-sector",e.cube_index),te(e.required,"required-sector",e.cube_index))};function ue(e){var t=document.getElementById("bonus-button");t.classList.remove("button-clicked"),e?(t.classList.remove("hidden"),t.onclick=De.bind(t)):(t.classList.add("hidden"),t.onclick=function(){})}function de(){var e=document.getElementById("no_goal");e.classList.add("hidden"),e.onclick=function(){return console.log("No goal challenge somehow clicked...")};var t=document.getElementById("set-goal-button");t.classList.add("hidden"),t.onclick=function(){return console.log("Set goal button somehow clicked...")},E.onmousedown=function(){},E.onmouseup=function(){},E.onmousemove=function(){},E.oncontextmenu=function(){}}function fe(){console.log("Clearing board"),ne();for(var e=0,t=["forbidden-sector","permitted-sector","required-sector"];e<t.length;e++){oe(t[e])}!function(){for(var e=document.getElementById("resources-cubes"),t=0;t<24;++t){e.querySelector("#r".concat(t)).innerHTML=""}}()}function ge(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return me(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return me(e,t)}(e))){var t=0,n=function(){};return{s:n,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,r,i=!0,a=!1;return{s:function(){o=e[Symbol.iterator]()},n:function(){var e=o.next();return i=e.done,e},e:function(e){a=!0,r=e},f:function(){try{i||null==o.return||o.return()}finally{if(a)throw r}}}}function me(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}var he=["forbidden-sector","permitted-sector","required-sector","goal-sector"],ve=["flip_timer","claim_warning","claim_minus_one","a_flub","p_flub","no_goal"];var pe=function(e,t,n,o){if(W(),window.onresize=$,o&&n===t){var r=document.getElementById("set-goal-button");r.classList.remove("hidden"),r.onclick=function(){e.emit("set_goal")},E.onmousedown=R,E.onmouseup=F,E.onmousemove=Y,E.oncontextmenu=X}};function be(e,t){var n,o=ge(he);try{var r=function(){var t=n.value;document.getElementById(t).onclick=function(){console.log("".concat(t," clicked")),e.emit("sector_clicked",t)}};for(o.s();!(n=o.n()).done;)r()}catch(e){o.e(e)}finally{o.f()}!function(e){var t,n=ye(),o=ge(ve);try{for(o.s();!(t=o.n()).done;){var r=t.value;_e(e,n.querySelector("#".concat(r)),r)}}catch(e){o.e(e)}finally{o.f()}}(e),ue(t)}function ye(){var e=document.getElementById("buttons-div");if(0===e.length)throw Error("Error finding buttons on page!?");return e}function _e(e,t,n){t.onclick=function(){console.log("Button for ".concat(n," clicked!")),e.emit(n)}}function we(){var e,t,n=ge(he);try{for(n.s();!(e=n.n()).done;){var o=e.value;document.getElementById(o).onclick=function(){}}}catch(e){n.e(e)}finally{n.f()}!function(){var e,t=ye(),n=ge(ve);try{for(n.s();!(e=n.n()).done;){var o=e.value;t.querySelector("#".concat(o)).onclick=function(){}}}catch(e){n.e(e)}finally{n.f()}}(),(t=document.getElementById("set-goal-button")).classList.add("hidden"),t.onclick=function(){},ue(!1)}var ke=new Map([["a_flub","Challenge Now"],["p_flub","Challenge Never"],["no_goal","No Goal Declared"]]);function Ee(e,t,n,o){n&&(ae(ke.get(n.challenge)),"finished"===n.endgame_stage?Me(e,t,o):"no_goal_finished"===n.endgame_stage?function(e,t,n){n.includes(t)?(b("Click here to restart the shake: "),k(e)):b("Waiting for players to restart the shake...")}(e,t,o):(function(e){var t=e.challenge;if("force_out"===t)b("The players are currently in a Force Out...");else if("no_goal"===t)b("A No Goal has been declared...");else{var n="".concat(e.challenger," has called "),o="".concat(ke.get(t)," on ").concat(e.last_mover,".");b("".concat(n).concat(o))}}(n),"waiting_for_reviewers"===n.endgame_stage?(Ce(e,t,{solutions:n.solutions,players:o}),function(e,t,n){for(var o in n.review_status)if(n.review_status.hasOwnProperty(o))for(var r in n.review_status[o]){if(n.review_status[o].hasOwnProperty(r))"ASSENTING"===n.review_status[o][r]&&Se(e,t,{rejecter:o,writer:r})}}(e,t,n)):"no_goal"==n.challenge?Ie(e,n.caller,n.writers,n.nonwriters,t):(Le(e,n.sider,t),Te(e,n.writers,t))))}function Ie(e,t,n,o,r){r===t?b("Waiting for other player to agree or disagree with your No Goal declaration..."):o.includes(r)?b("Waiting for one more player to agree or disagree with the No Goal declaration..."):n.includes(r)?_(e):function(e,t){b(t+" claims no goal can be set which has at least one correct solution. Do you agree? If not, you can challenge the No Goal declaration and you will have two minutes to write a correct Solution & Goal. Disagreeing with the no goal declaration is considered a challenge, so the first player to disagree (if a player disagrees) will be deemed the challenger.");var n=document.createElement("li");n.classList.add("chat-button");var o=document.createElement("button");o.innerHTML="Agree",n.appendChild(o);var r=document.createElement("button");r.innerHTML="Disagree & Write",n.appendChild(r),o.onclick=function(){e.emit("no_goal_sided",!0),y([o,r]),o.classList.add("button-clicked")},r.onclick=function(){e.emit("no_goal_sided",!1),y([o,r]),r.classList.add("button-clicked"),_(e)},document.getElementById("message-list").appendChild(n)}(e,t)}function Le(e,t,n){null!=t&&(t===n?function(e){b("Do you wish to write a solution? You have one minute to decide.");var t=document.createElement("li");t.classList.add("chat-button");var n=document.createElement("button");n.innerHTML="Yes",t.appendChild(n);var o=document.createElement("button");o.innerHTML="No",t.appendChild(o),n.onclick=function(){e.emit("sided",!0),y([n,o]),n.classList.add("button-clicked"),_(e)},o.onclick=function(){e.emit("sided",!1),y([n,o]),o.classList.add("button-clicked")},document.getElementById("message-list").appendChild(t)}(e):b("Waiting for ".concat(t," to side...")))}function Te(e,t,n){t.includes(n)?_(e):b("Waiting for solutions to be submitted....")}function Ce(e,t,n){b("Time to review solutions!");var o=n.solutions,r=n.players,i=!1;for(var a in o)a!==t&&(i=!0,w(e,a,o[a],!1,r.includes(t)));i||b("Waiting for others to finish reviewing solutions...")}function Se(e,t,n){var o=n.rejecter,r=n.writer;r===t?function(e,t){b(t+" rejected your solution. Do you agree?");var n=document.createElement("li");n.classList.add("chat-button");var o=document.createElement("button");o.innerHTML="Yes",n.appendChild(o);var r=document.createElement("button");r.innerHTML="No",n.appendChild(r),o.onclick=function(){e.emit("assented",{rejecter:t,assented:!0}),y([o,r]),o.classList.add("button-clicked")},r.onclick=function(){e.emit("assented",{rejecter:t,assented:!1}),y([o,r]),r.classList.add("button-clicked")},document.getElementById("message-list").appendChild(n)}(e,o):b("Waiting for ".concat(r," to accept the rejection..."))}function Me(e,t,n){n.includes(t)?(b("Click here to start a new shake: "),function(e){var t=document.createElement("li");t.classList.add("chat-button");var n=document.createElement("button");n.innerHTML="Start New Shake",n.id="new_shake_button",t.appendChild(n),n.onclick=function(){e.emit("new_shake")},document.getElementById("message-list").appendChild(t)}(e)):b("Waiting for players to start a new shake...")}var xe=window.location.protocol.includes("https")?"wss":"ws",Be=r()("".concat(xe,"://").concat(window.location.host),{reconnection:!1}),He=new Promise((function(e){Be.on("connect",(function(){console.log("Connected to server!"),e()}))})),qe=function(){He.then((function(){var e=document.getElementById("room-nonce").innerHTML,t=document.getElementById("name").innerHTML,n={room:e,name:t};!function(e){Be.on("disconnect",(function(){return console.log("disconnected from room")})),Be.on("message",(function(e){return v(e.name,e.message)})),Be.on("server_message",(function(e){return b(e)})),Be.on("render_spectator_state",(function(t){se(t),Ee(Be,e,t.endgame,t.players)})),Be.on("render_player_state",(function(t){var n;(se(t),t.game_finished)||(t.game_started?(be(Be,function(e,t){if(e.players[e.turn]!=t)return!1;if(e.challenge)return!1;if(n=Object.values(Q).reduce((function(e,t){return e+t})),console.log("cubes not in resources: ",n),24-n<2)return!1;var n;if(e.started_move)return!1;var o=e.players.findIndex((function(e){return e===t}));if(-1===o)return console.log("Error! Player not in game in render_player_state"),!1;for(var r=function(e,t){return e+t},i=e["p".concat(o+1,"scores")].reduce(r),a=e.p1scores.reduce(r),c=e.p2scores.reduce(r),l=e.p3scores.reduce(r),s=0,u=0,d=[a,c,l];u<d.length;u++){i>d[u]&&++s}if(2===s)return!1;return!0}(t,e)),pe(Be,e,t.players[t.turn],!t.goalset),Ee(Be,e,t.endgame,t.players),console.log("challenge recorded: ",t.challenge),"no_goal"===t.challenge&&de()):(n=Be,ye().querySelector("#start_game").onclick=function(){console.log("Button for start_game clicked!"),n.emit("start_game")},function(e,t,n){if(!t.tournament&&t.players.includes(n)){var o=document.createElement("button");o.innerHTML="Leave Game",o.onclick=function(){e.emit("leave_game")};var r=document.createElement("a");r.id="leave_game_anchor",r.href="/",r.appendChild(o),document.getElementById("buttons-div").appendChild(r)}}(Be,t,e)))})),Be.on("new_player",re),Be.on("player_left",re),Be.on("begin_game",(function(t){var n=t.cubes;document.getElementById("start_game").remove(),document.getElementById("leave_game_anchor").remove(),b("".concat(t.starter," started the game! The cubes have been rolled!")),b("".concat(t.goalsetter," is chosen to be the goalsetter.")),p("Server","Move cubes by clicking a cube in resources, then clicking the area on the mat you want to move it to."),p("Server","For goalsetting, once cubes are on the goal line, you can rearrange them (by dragging them horizontally) and rotate them (by right clicking on the cube you want to rotate)."),p("Server","If you can bonus on your turn, a bonus button will appear in the upper right corner of resources. To bonus, first click the bonus button, then move the bonused cube to forbidden, and continue with the rest of your turn."),t.starter===e?b('Press "Goal Set!" when you\'re done!'):b("Waiting for ".concat(t.goalsetter," to finish setting the goal...")),Z(t.starttime),V(n),ie(re(t.players),0,0,0);var o=t.goalsetter;be(Be,o===e),ae(o),pe(Be,e,o,!0)})),Be.on("begin_shake",(function(t){var n=document.getElementById("new_shake_button");n&&n.remove(),b("A new shake has started! ".concat(t.goalsetter," is chosen to be the goalsetter.")),fe(),V(t.cubes);var o=t.goalsetter;be(Be,o===e&&t.show_bonus),ae(o),pe(Be,e,o,!0)})),Be.on("end_shake_no_goal",(function(){return k(Be)})),Be.on("hide_goal_setting_buttons",(function(){return de()})),Be.on("update_goalline",(function(e){var t,n,o;t=e.type,n=e.order,o=e.new_val,"x_pos"===t?O[n].cube_pos_x=G(o*(E.width/1e3)):"orientation"===t&&(O[n].orientation=o),z()})),Be.on("highlight_cube",(function(e){return t=e,void document.getElementById("r".concat(t)).querySelector("img").classList.add("highlight-img");var t})),Be.on("unhighlight_cube",(function(e){return t=e,void document.getElementById("r".concat(t)).querySelector("img").classList.remove("highlight-img");var t})),Be.on("move_cube",(function(e){return ce(e)})),Be.on("next_turn",(function(t){var n=t.player,o=t.show_bonus;ae(n),ue(n===e&&o)})),Be.on("handle_challenge",(function(t){return function(e,t,n){var o=n.challenge,r=n.writers,i=n.nonwriters,a=n.caller,c=n.sider;we(),ae(ke.get(o)),"no_goal"!==o?(Le(e,c,t),Te(e,r,t)):Ie(e,a,r,i,t)}(Be,e,t)})),Be.on("force_out",(function(t){return function(e,t,n){ae("Force Out"),b("It is now Force Out."),n.includes(t)?(we(),_(e)):b("Waiting for players to write solutions...")}(Be,e,t)})),Be.on("review_solutions",(function(t){return Ce(Be,e,t)})),Be.on("rejection_assent",(function(t){return Se(Be,e,t)})),Be.on("reevaluate_solution",(function(t){return function(e,t,n){var o=n.rejecter,r=n.writer,i=n.solution;if(o===t)w(e,r,i,!0,!0);else{var a="".concat(r," does not agree that his/her solution "),c="is incorrect. Waiting for ".concat(o," to re-evaluate ");b("".concat(a).concat(c).concat("whether the solution is correct..."))}}(Be,e,t)})),Be.on("finish_shake",(function(t){return function(e,t,n,o){var r=n.p1score,i=n.p2score,a=n.p3score,c=n.players;b("This shake has finished! The scoreboard has been updated."),ie(document.getElementById("scoreboard"),r,i,a),o?e.emit("game_over"):Me(e,t,c)}(Be,e,t.scores,t.game_finished)})),Be.on("five_minute_warning_message",(function(){b("".concat("Five minute warning! If the cubes have been rolled, ").concat("continue your game -- you have five minutes left. ").concat("Do not start a new shake."))})),Be.on("game_over_clientside",(function(){b("The game has finished!"),ae("Game Ended"),we()}))}(t),console.log("Connecting as ".concat(t," in room ").concat(e)),Be.emit("register_client",n)})).catch((function(e){return console.log("Error: ",e)}))};function je(e){var t=document.getElementById("name").innerHTML;Be.emit("new_message",{name:t,message:e})}var Ae=function(e){return Be.emit("cube_clicked",e)};function De(){this.classList.toggle("button-clicked"),Be.emit("bonus_clicked")}}}]);