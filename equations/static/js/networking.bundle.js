(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{64:function(e,t){},70:function(e,t,n){var o=n(7),r=n(71);"string"==typeof(r=r.__esModule?r.default:r)&&(r=[[e.i,r,""]]);var i={insert:"head",singleton:!1};o(r,i);e.exports=r.locals||{}},71:function(e,t,n){"use strict";n.r(t);var o=n(5),r=n.n(o)()(!1);r.push([e.i,"\n.ChatMessages-module__boldMessageText--1gmuyULK {\n    font-weight: bold;\n    font-style: italics;\n}\n\n.ChatMessages-module__messageSender--pQZAFmiz {\n    font-weight: bold;\n}",""]),r.locals={boldMessageText:"ChatMessages-module__boldMessageText--1gmuyULK",messageSender:"ChatMessages-module__messageSender--pQZAFmiz"},t.default=r},72:function(e,t,n){"use strict";n.r(t),n.d(t,"socket",(function(){return rt})),n.d(t,"connect",(function(){return at})),n.d(t,"sendChatMessage",(function(){return ct})),n.d(t,"emitCubeClicked",(function(){return st})),n.d(t,"bonusButtonCallback",(function(){return lt}));var o=n(38),r=n.n(o),i=n(0),a=n.n(i),c=n(4),s=n.n(c),l=n(67),u=n.n(l),d=n(70),f=n.n(d);function m(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],o=!0,r=!1,i=void 0;try{for(var a,c=e[Symbol.iterator]();!(o=(a=c.next()).done)&&(n.push(a.value),!t||n.length!==t);o=!0);}catch(e){r=!0,i=e}finally{try{o||null==c.return||c.return()}finally{if(r)throw i}}return n}(e,t)||function(e,t){if(!e)return;if("string"==typeof e)return g(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return g(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function g(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}function h(e){var t="instruction"===e.type?f.a.boldMessageText:"";return a.a.createElement(a.a.Fragment,null,a.a.createElement("span",{className:f.a.messageSender},e.name,": "),a.a.createElement("span",{className:t},e.message," "))}function v(e){return a.a.createElement("button",{idName:"new_shake_button",onClick:e.onClick},e.buttonText)}function p(){return a.a.createElement(h,{name:"Server",message:"".concat("Five minute warning! If the cubes have been rolled, ").concat("continue your game -- you have five minutes left. ").concat("Do not start a new shake."),type:"five_min_warning"})}function y(e){var t=m(Object(i.useState)("unselected"),2),n=t[0],o=t[1],r="yes"===n||"no"===n,c={className:"yes"===n?"button-clicked":"",onClick:r?null:function(){o("yes"),e.onYesClick()}},s={className:"no"===n?"button-clicked":"",onClick:r?null:function(){o("no"),e.onNoClick()}};return a.a.createElement(a.a.Fragment,null,a.a.createElement("button",c,"Yes"),a.a.createElement("button",s,"No"))}function b(e){return e.isGamePlayer?a.a.createElement(a.a.Fragment,null,a.a.createElement("p",null,e.solution),a.a.createElement(y,{onYesClick:e.onYesClick,onNoClick:e.onNoClick})):a.a.createElement("p",null,e.solution)}function _(e){var t=m(Object(i.useState)(""),2),n=t[0],o=t[1],r=m(Object(i.useState)(!1),2),c=r[0],s=r[1],l=["solution_submit"];return c&&l.push("hidden"),a.a.createElement(a.a.Fragment,null,a.a.createElement("input",{className:"solution_box",placeholder:"Type your solution here...",onChange:function(e){return o(e.target.value)},disabled:c}),a.a.createElement("button",{className:l.join(" "),onClick:function(){c||(s(!0),e.onSubmit(n))}},"Submit Solution"))}function w(e,t){document.getElementById("message-list").appendChild(e),s.a.render(t,e);var n=document.getElementById("message-list-div");n.scrollTop=n.scrollHeight}function k(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"player_message",o=document.createElement("li");w(o,a.a.createElement(h,{name:e,message:t,type:n}))}function E(e,t){k(e,t,"instruction")}function S(e){k("Server",e,"server_message")}function C(e){S("Please submit your solution here:");var t=document.createElement("li");t.classList.add("solution_li"),w(t,a.a.createElement(_,{onSubmit:function(t){return e.emit("solution_submitted",t)}}))}function I(e,t,n,o,r){S(r?o?t+" does not agree that the solution is incorrect. Please re-evaluate whether you accept.":t+" submitted the following solution. Do you accept?":t+" submitted the following solution. Waiting for players to accept/reject.");var i=document.createElement("li");i.classList.add("chat-button"),w(i,a.a.createElement(b,{solution:n,isGamePlayer:r,onYesClick:function(){return e.emit("decided",{name:t,accepted:!0})},onNoClick:function(){return e.emit("decided",{name:t,accepted:!1})}}))}function T(e){S("The shake has ended due to a No Goal. Click below to restart the shake.");var t=document.createElement("li");t.classList.add("chat-button"),w(t,a.a.createElement(v,{buttonText:"Restart Shake",onClick:function(){return e.emit("restart_shake")}}))}function x(e){S("Please indicate how many cards you would like to set in the universe:");var t=document.createElement("li");t.classList.add("universe_li"),w(t,a.a.createElement(UniversePrompt,{onSubmit:function(t){return e.emit("universe_set",t)}}))}h.propTypes={name:u.a.string.isRequired,message:u.a.string.isRequired,type:u.a.oneOf(["player_message","server_message","instruction","new_shake","five_min_warning","solution_check","solution_prompt"]).isRequired},h.defaultProps={type:"player_message"},v.propTypes={buttonText:u.a.string.isRequired,onClick:u.a.func.isRequired},y.propTypes={onYesClick:u.a.func.isRequired,onNoClick:u.a.func.isRequired},b.propTypes={solution:u.a.string.isRequired,isGamePlayer:u.a.bool.isRequired,onYesClick:u.a.func,onNoClick:u.a.func},_.propTypes={onSubmit:u.a.func.isRequired},u.a.func.isRequired;var L,B,q,M,N,j,A,O,D=n(2);function P(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return R(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return R(e,t)}(e))){var t=0,n=function(){};return{s:n,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,r,i=!0,a=!1;return{s:function(){o=e[Symbol.iterator]()},n:function(){var e=o.next();return i=e.done,e},e:function(e){a=!0,r=e},f:function(){try{i||null==o.return||o.return()}finally{if(a)throw r}}}}function R(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}var W,H=!1,G=[];function Y(){(L=document.getElementById("goal-sector")).width=.33*window.innerWidth,L.height=.09*window.innerHeight,B=L.getBoundingClientRect(),q=B.left,M=B.top,N=.1*L.width,j=N+3,A=N+2,O=L.height/8}function F(e,t,n){return t>e.cube_pos_x&&t<e.cube_pos_x+j&&n>O&&n<O+A}function z(e){return e=Math.min(e,L.width-j),e=Math.max(e,4)}function U(e){console.log("mouse down"),e.preventDefault(),e.stopPropagation();var t=parseInt(e.clientX-q),n=parseInt(e.clientY-M);H=!1;for(var o=G.length-1;o>=0;o--){var r=G[o];if(F(r,t,n)){H=!0,r.isDragging=!0;break}}W=t}function $(e){console.log("mouse up"),e.preventDefault(),e.stopPropagation(),H=!1;for(var t=0;t<G.length;t++)if(G[t].isDragging)return G[t].isDragging=!1,void rt.emit("x_pos_update",{order:t,x_pos_per_mille:G[t].cube_pos_x/(L.width/1e3)})}function X(e){if(H){e.preventDefault(),e.stopPropagation();for(var t=parseInt(e.clientX-q),n=t-W,o=0;o<G.length;o++){var r=G[o];if(r.isDragging){r.cube_pos_x=z(r.cube_pos_x+n);break}}K(),W=t}}function J(e){e.preventDefault(),e.stopPropagation();for(var t=parseInt(e.clientX-q),n=parseInt(e.clientY-M),o=G.length-1;o>=0;o--){var r=G[o];if(F(r,t,n)){r.orientation=(r.orientation+90)%360,rt.emit("orientation_update",{order:o,orientation:r.orientation});break}}return K(),!1}function K(){var e=L.getContext("2d");!function(e){e.clearRect(0,0,L.width,L.height)}(e),e.strokeStyle="#fff",e.lineWidth=2.5;for(var t=0;t<G.length;t++){var n=G[t];console.log("Calling draw rotated on ",n),Q(e,n.cube,n.cube_pos_x,O,N,N,n.orientation)}}function Q(e,t,n,o,r,i,a){e.save(),e.translate(n+r/2,o+i/2),e.rotate(a*Math.PI/180),console.log("Drawing the image!"),e.drawImage(t,-r/2,-i/2,r,i),function(e,t,n,o,r,i,a,c){if(void 0===c&&(c=!0),void 0===i&&(i=5),"number"==typeof i)i={tl:i,tr:i,br:i,bl:i};else{var s={tl:0,tr:0,br:0,bl:0};for(var l in s)i[l]=i[l]||s[l]}e.beginPath(),e.moveTo(t+i.tl,n),e.lineTo(t+o-i.tr,n),e.quadraticCurveTo(t+o,n,t+o,n+i.tr),e.lineTo(t+o,n+r-i.br),e.quadraticCurveTo(t+o,n+r,t+o-i.br,n+r),e.lineTo(t+i.bl,n+r),e.quadraticCurveTo(t,n+r,t,n+r-i.bl),e.lineTo(t,n+i.tl),e.quadraticCurveTo(t,n,t+i.tl,n),e.closePath(),a&&e.fill(),c&&e.stroke()}(e,-r/2-1,-i/2-1,r+3,i+2,7),e.restore()}function V(e){console.log("resize function called"),e.preventDefault(),e.stopPropagation();var t=L.width;L.width=.33*window.innerWidth,L.height=.09*window.innerHeight,B=L.getBoundingClientRect(),q=B.left,M=B.top,N=.1*L.width,j=N+3,A=N+2,O=L.height/8,function(e){for(var t=0;t<G.length;t++)console.log("OLD: ",G[t].cube_pos_x/(e/1e3)),G[t].cube_pos_x=z(G[t].cube_pos_x*(L.width/e)),rt.emit("x_pos_update",{order:t,x_pos_per_mille:G[t].cube_pos_x/(L.width/1e3)}),console.log("NEW: ",G[t].cube_pos_x/(L.width/1e3))}(t),K()}var Z=new Map([["forbidden-sector","f"],["permitted-sector","p"],["required-sector","q"],["goal-sector","g"]]),ee={"forbidden-sector":0,"permitted-sector":0,"required-sector":0,"goal-sector":0};function te(e){!function(e){e.game_started&&("eq"==e.gametype?(Y(),e.goalset&&le()):e.gametype)}(e),function(e,t){e.length>6&&console.log("Something is wrong! Server stored more than 6 cubes in goal!");ee["goal-sector"]=e.length,function(e,t){window.onresize=V;var n,o=P(e);try{for(o.s();!(n=o.n()).done;){var r=n.value;Object(D.b)(r.idx,t).onload=K,G.push({order:G.length,idx:r.idx,cube:Object(D.b)(r.idx,t),cube_pos_x:z(r.x*L.width/1e3),isDragging:!1,orientation:r.orientation})}}catch(e){o.e(e)}finally{o.f()}}(e,t)}(e.goal,e.cube_index),ne(e.resources),oe(e.forbidden,"forbidden-sector",e.cube_index),oe(e.permitted,"permitted-sector",e.cube_index),oe(e.required,"required-sector",e.cube_index)}function ne(e){console.log("Rolling cubes!");for(var t=document.getElementById("resources-cubes"),n=function(n){if(-1===e[n])return"continue";var o=t.querySelector("#r".concat(n)),r=Object(D.b)(n,e);r.onmouseover=function(){r.classList.add("show-border")},r.onmouseout=function(){r.classList.remove("show-border")},r.onclick=function(){return st(n)},o.appendChild(r)},o=0;o<e.length;++o)n(o);console.log("Finished rolling cubes")}function oe(e,t,n){for(var o=0,r=[12,16,20];o<r.length;o++){var i=r[o];e.length>i&&ce(t,i)}ee[t]=e.length,function(e,t,n){for(var o=0;o<e.length;++o){var r=document.getElementById("".concat(Z.get(t)).concat(o)),i=e[o];r.appendChild(Object(D.b)(i,n))}}(e,t,n)}function re(){G.length=0,K(),ee["goal-sector"]=0}function ie(e){for(var t=document.getElementById(e).querySelector("table"),n=t.rows.length-1;n>=3;--n)t.deleteRow(n);for(var o=0;o<12;++o){t.querySelector("#".concat(Z.get(e)).concat(o)).innerHTML=""}ee[e]=0}function ae(e){var t=e.from,n=ee[e.to],o="".concat(Z.get(e.to)).concat(n);12!==n&&16!==n&&20!==n||ce(e.to,n),ee[e.to]++;var r=document.getElementById("resources-cubes").querySelector("#r".concat(t)).querySelector("img");r.onmouseover=function(){},r.onmouseout=function(){},r.onclick=function(){},r.classList.remove("highlight-img"),"goal-sector"===e.to?function(e,t){var n=L.width/100;0!==G.length&&(n+=G.length*(3*n+j));var o=G.length;G.push({order:o,idx:e,cube:t.cloneNode(!0),cube_pos_x:n,isDragging:!1,orientation:0}),t.remove(),rt.emit("x_pos_update",{order:o,x_pos_per_mille:n/(L.width/1e3)}),K()}(e.from,r):document.getElementById(o).appendChild(r),se(!1)}function ce(e,t){for(var n=document.getElementById(e).querySelector("table").insertRow(),o=0;o<4;++o){n.insertCell().id="".concat(Z.get(e)).concat(t+o)}}function se(e){var t=document.getElementById("bonus-button");t.classList.remove("button-clicked"),e?(t.classList.remove("hidden"),t.onclick=lt.bind(t)):(t.classList.add("hidden"),t.onclick=function(){})}function le(){var e=document.getElementById("no_goal");e.classList.add("hidden"),e.onclick=function(){return console.log("No goal challenge somehow clicked...")};var t=document.getElementById("set-goal-button");t.classList.add("hidden"),t.onclick=function(){return console.log("Set goal button somehow clicked...")},L.onmousedown=function(){},L.onmouseup=function(){},L.onmousemove=function(){},L.oncontextmenu=function(){}}function ue(){console.log("Clearing board"),re();for(var e=0,t=["forbidden-sector","permitted-sector","required-sector"];e<t.length;e++){ie(t[e])}!function(){for(var e=document.getElementById("resources-cubes"),t=0;t<24;++t){e.querySelector("#r".concat(t)).innerHTML=""}}()}function de(e){for(var t=document.getElementById("scoreboard"),n=0;n<e.length;++n)t.rows[0].cells.item(n).innerHTML=e[n];for(var o=e.length;o<3;++o)t.rows[0].cells.item(o).innerHTML="--------";return t}function fe(e,t,n,o){2===e.rows.length&&0==e.rows[1].cells[0].innerHTML&&e.deleteRow(1);var r=e.insertRow();r.insertCell().innerHTML=t,r.insertCell().innerHTML=n,r.insertCell().innerHTML=o}function me(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return ge(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return ge(e,t)}(e))){var t=0,n=function(){};return{s:n,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,r,i=!0,a=!1;return{s:function(){o=e[Symbol.iterator]()},n:function(){var e=o.next();return i=e.done,e},e:function(e){a=!0,r=e},f:function(){try{i||null==o.return||o.return()}finally{if(a)throw r}}}}function ge(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}function he(e,t){e.game_started||(function(e){ve().querySelector("#start_game").onclick=function(){console.log("Button for start_game clicked!"),e.emit("start_game")}}(rt),function(e,t,n){if(!t.tournament&&t.players.includes(n)){var o=document.createElement("button");o.innerHTML="Leave Game",o.onclick=function(){e.emit("leave_game")};var r=document.createElement("a");r.id="leave_game_anchor",r.href="/",r.appendChild(o),document.getElementById("buttons-div").appendChild(r)}}(rt,e,t))}function ve(){var e=document.getElementById("buttons-div");if(0===e.length)throw Error("Error finding buttons on page!?");return e}var pe=["flip_timer","claim_warning","claim_minus_one","a_flub","p_flub","no_goal"];function ye(e,t,n){t.onclick=function(){console.log("Button for ".concat(n," clicked!")),e.emit(n)}}var be=function(e,t,n){if(Y(),window.onresize=resizeGoalsettingCanvas,n&&t===e){var o=document.getElementById("set-goal-button");o.classList.remove("hidden"),o.onclick=function(){rt.emit("set_goal")},L.onmousedown=U,L.onmouseup=$,L.onmousemove=X,L.oncontextmenu=J}};function _e(e){if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(e=function(e,t){if(!e)return;if("string"==typeof e)return we(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return we(e,t)}(e))){var t=0,n=function(){};return{s:n,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,r,i=!0,a=!1;return{s:function(){o=e[Symbol.iterator]()},n:function(){var e=o.next();return i=e.done,e},e:function(e){a=!0,r=e},f:function(){try{i||null==o.return||o.return()}finally{if(a)throw r}}}}function we(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,o=new Array(t);n<t;n++)o[n]=e[n];return o}var ke=["forbidden-sector","permitted-sector","required-sector","goal-sector"];function Ee(e,t){e.game_started&&Se(function(e,t){if(e.players[e.turn]!=t)return!1;if(e.challenge)return!1;if(n=Object.values(ee).reduce((function(e,t){return e+t})),console.log("cubes not in resources: ",n),24-n<2)return!1;var n;if(e.started_move)return!1;var o=e.players.findIndex((function(e){return e===t}));if(-1===o)return console.log("Error! Player not in game in render_player_state"),!1;for(var r=function(e,t){return e+t},i=e["p".concat(o+1,"scores")].reduce(r),a=e.p1scores.reduce(r),c=e.p2scores.reduce(r),s=e.p3scores.reduce(r),l=0,u=0,d=[a,c,s];u<d.length;u++){i>d[u]&&++l}if(2===l)return!1;return!0}(e,t))}function Se(e){var t,n=_e(ke);try{var o=function(){var e=t.value;document.getElementById(e).onclick=function(){console.log("".concat(e," clicked")),rt.emit("sector_clicked",e)}};for(n.s();!(t=n.n()).done;)o()}catch(e){n.e(e)}finally{n.f()}!function(e){var t,n=ve(),o=me(pe);try{for(o.s();!(t=o.n()).done;){var r=t.value;ye(e,n.querySelector("#".concat(r)),r)}}catch(e){o.e(e)}finally{o.f()}}(rt),se(e)}function Ce(){var e,t,n=_e(ke);try{for(n.s();!(e=n.n()).done;){var o=e.value;document.getElementById(o).onclick=function(){}}}catch(e){n.e(e)}finally{n.f()}!function(){var e,t=ve(),n=me(pe);try{for(n.s();!(e=n.n()).done;){var o=e.value;t.querySelector("#".concat(o)).onclick=function(){}}}catch(e){n.e(e)}finally{n.f()}}(),(t=document.getElementById("set-goal-button")).classList.add("hidden"),t.onclick=function(){},se(!1)}function Ie(e){document.getElementById("actual-turn-text").innerHTML="".concat(e)}var Te,xe,Le,Be=new Map([["a_flub","Challenge Now"],["p_flub","Challenge Impossible"],["no_goal","No Goal Declared"],["force_out","Last Cube Procedure"]]);function qe(e,t){!function(e,t,n,o){if(!n)return;Ie(Be.get(n.challenge)),"finished"===n.endgame_stage?De(e,t,o):"no_goal_finished"===n.endgame_stage?function(e,t,n){n.includes(t)?(S("Click here to restart the shake: "),T(e)):S("Waiting for players to restart the shake...")}(e,t,o):(function(e){var t=e.challenge;if("force_out"===t)S("The players are currently in a Force Out...");else if("no_goal"===t)S("A No Goal has been declared...");else{var n="".concat(e.challenger," has called "),o="".concat(Be.get(t)," on ").concat(e.last_mover,".");S("".concat(n).concat(o))}}(n),"waiting_for_reviewers"===n.endgame_stage?(Ae(e,t,{solutions:n.solutions,players:o}),function(e,t,n){for(var o in n.review_status)if(n.review_status.hasOwnProperty(o))for(var r in n.review_status[o]){if(n.review_status[o].hasOwnProperty(r))"ASSENTING"===n.review_status[o][r]&&Oe(e,t,{rejecter:o,writer:r})}}(e,t,n)):"no_goal"==n.challenge?Me(e,n.caller,n.writers,n.nonwriters,t):(Ne(e,n.sider,t),je(e,n.writers,t)))}(rt,t,e.endgame,e.players),e.game_started&&"no_goal"===e.challenge&&le()}function Me(e,t,n,o,r){r===t?S("Waiting for other player to agree or disagree with your No Goal declaration..."):o.includes(r)?S("Waiting for one more player to agree or disagree with the No Goal declaration..."):n.includes(r)?C(e):function(e,t){S(t+" claims no goal can be set which has at least one correct solution. Do you agree? If not, you can challenge the No Goal declaration and you will have two minutes to write a correct Solution & Goal. Disagreeing with the no goal declaration is considered a challenge, so the first player to disagree (if a player disagrees) will be deemed the challenger.");var n=document.createElement("li");n.classList.add("chat-button"),w(n,a.a.createElement(y,{onYesClick:function(){return e.emit("no_goal_sided",!0)},onNoClick:function(){e.emit("no_goal_sided",!1),C(e)}}))}(e,t)}function Ne(e,t,n){null!=t&&(t===n?function(e){S("Do you wish to write a solution? You have one minute to decide.");var t=document.createElement("li");t.classList.add("chat-button"),w(t,a.a.createElement(y,{onYesClick:function(){e.emit("sided",!0),C(e)},onNoClick:function(){return e.emit("sided",!1)}}))}(e):S("Waiting for ".concat(t," to side...")))}function je(e,t,n){t.includes(n)?C(e):S("Waiting for solutions to be submitted....")}function Ae(e,t,n){S("Time to review solutions!");var o=n.solutions,r=n.players,i=!1;for(var a in o)a!==t&&(i=!0,I(e,a,o[a],!1,r.includes(t)));i||S("Waiting for others to finish reviewing solutions...")}function Oe(e,t,n){var o=n.rejecter,r=n.writer;r===t?function(e,t){S(t+" rejected your solution. Do you agree?");var n=document.createElement("li");n.classList.add("chat-button"),w(n,a.a.createElement(y,{onYesClick:function(){return e.emit("assented",{rejecter:t,assented:!0})},onNoClick:function(){return e.emit("assented",{rejecter:t,assented:!1})}}))}(e,o):S("Waiting for ".concat(r," to accept the rejection..."))}function De(e,t,n){n.includes(t)?(S("Click here to start a new shake: "),function(e){var t=document.createElement("li");t.classList.add("chat-button"),w(t,a.a.createElement(v,{buttonText:"Start New Shake",onClick:function(){return e.emit("new_shake")}}))}(e)):S("Waiting for players to start a new shake...")}var Pe,Re=!1;function We(e){xe||(xe=document.getElementById("elapsed")),xe.innerHTML=e}function He(e){Le||(Le=document.getElementsByClassName("display-time-div")[0]),Le.innerHTML="<p>".concat(e,"</p>")}function Ge(e){Te=e;var t=setInterval((function(){var e=new Date,n=Math.round(e.getTime()/1e3)-Te,o=Math.floor(n/60),r=Math.floor(n%60),i="";o<10&&(i="0");var a="";r<10&&(a="0");var c="".concat(i).concat(o,":").concat(a).concat(r);o>=30&&!Re&&(Re=!0,rt.emit("five_minute_warning")),o>=35&&(clearInterval(t),rt.emit("game_time_up"),c="35:00"),We(c)}),1e3)}function Ye(e){e&&(clearInterval(Pe),Pe=setInterval((function(){var t=new Date,n=60-Math.floor(t.getTime()/1e3-e),o="";n<10&&(o="0");var r="0:".concat(o).concat(n);n<=0&&(clearInterval(Pe),r="0:00"),He(r)}),1e3))}function Fe(e,t){e.game_started&&("os"==e.gametype&&0==e.onsets_cards_dealt||ze(e.variations_state,e.players,t))}function ze(e,t,n){var o=document.getElementById("variations");if(o.classList.remove("hidden"),o.querySelector("#called-variations").innerHTML=e.variations.join(", "),e.num_players_called<t.length)if(Ie("Calling Variations"),t[e.caller_index]===n){var r=document.getElementById("variations-input-div");r.classList.remove("hidden");var i=r.getElementsByTagName("button")[0];i.onclick=function(){var e=r.getElementsByTagName("input")[0];rt.emit("variation_called",{player:n,content:e.value}),e.value="",r.classList.add("hidden"),i.onclick=function(){}},S('It is your turn to call variations. Please enter the variations you want to call in the text box to the left (in the "Variations" section), and hit "Submit" when you are done!')}else S("It is ".concat(t[e.caller_index],"'s turn to call variations. Waiting \n                for ").concat(t[e.caller_index]," to finish calling variations..."));else console.log("The variation calling stage has already finished")}function Ue(e,t){e.is_first_shake&&(E("Server","All the players have called variations. Now it is time to set the goal. Before you start, here are some basic instructions."),E("Server","Move cubes by clicking a cube in resources, then clicking the area on the mat you want to move it to."),E("Server","For goalsetting, once cubes are on the goal line, you can rearrange them (by dragging them horizontally) and rotate them (by right clicking on the cube you want to rotate)."),E("Server","If you can bonus on your turn, a bonus button will appear in the upper right corner of resources. To bonus, first click the bonus button, then move the bonused cube to forbidden, and continue with the rest of your turn."),e.goalsetter===t?S('Press "Goal Set!" when you\'re done!'):S("Waiting for ".concat(e.goalsetter," to finish setting the goal..."))),Ie(e.goalsetter)}var $e=n(1);function Xe(e,t){console.log("Displaying On-Sets Universe");for(var n=document.getElementById("resources-cards"),o=0;o<e;++o){var r=n.querySelector("#c".concat(o)),i=Object($e.c)(t[o]);r.appendChild(i)}console.log("Finished displaying On-Sets universe")}function Je(){document.getElementById("start_game").remove();var e=document.getElementById("leave_game_anchor");e&&e.remove()}function Ke(e,t){ue(),ne(e.cubes),ze(e.variations_state,e.players,t),Se(e.goalsetter===t&&e.show_bonus),be(t,e.goalsetter,!0)}function Qe(e,t){t!=cardsetter?S("Waiting for ".concat(cardsetter," to set the universe...")):x(socket)}function Ve(e,t){Je(),"eq"==e.gametype?function(e,t){S("".concat(e.starter," started the game! The cubes have been rolled!")),S("".concat(e.goalsetter," is chosen to be the goal-setter.")),fe(de(e.players),0,0,0),Ge(e.starttime),Ke(e,t)}(e,t):"os"==e.gametype?function(e,t){var n=e.cardsetter;S("".concat(e.starter," started the game! The cubes have been rolled!")),S("".concat(e.goalsetter," is chosen to be the goal-setter.")),S("".concat(n," must choose how many cards to deal in the universe.")),fe(de(e.players),0,0,0),Ge(e.starttime),Qe(e,t)}(e,t):console.log("Error: Can't begin game, unrecognized game type ".concat(e.gametype))}function Ze(e,t){var n;(n=document.getElementById("new_shake_button"))&&n.remove(),"eq"==e.gametype?function(e,t){S("A new shake has started! ".concat(e.goalsetter," is chosen to be the goalsetter.")),Ke(e,t)}(e,t):"os"==e.gametype?function(e,t){S("A new shake has started! ".concat(e.goalsetter," is chosen to be the goalsetter.")),Qe(e,t)}(e,t):console.log("Error: Can't begin shake, unrecognized game type ".concat(e.gametype))}function et(e,t){"eq"==e.gametype?Fe(e,t):"os"==e.gametype&&(!function(e,t){if(console.assert("os"==e.gametype),e.game_started)if(e.onsets_cards_dealt>0)Xe(e.onsets_cards_dealt,e.onsets_cards);else{var n=(e.turn-1)%e.players.length,o=e.players[n];t!=o?S("Waiting for ".concat(o," to set the universe...")):x(rt)}}(e,t),Fe(e,t))}function tt(e,t){!function(e){var t=de(e.players),n=e.p1scores,o=e.p2scores,r=e.p3scores;if(void 0!==n){n.length===o.length&&o.length==r.length||console.log("Something is messed up with the scores! Player scores are not of same length!");for(var i=0;i<n.length;++i)fe(t,n[i],o[i],r[i])}}(e),function(e){e.game_finished?Ie("Game Ended"):e.game_started?Ie(e.players[e.turn]):Ie("Not Started")}(e),function(e){e.game_finished?(We("35:00"),He("0:00")):e.game_started?(Ge(e.starttime),Ye(e.last_timer_flip)):(We("00:00"),He("0:00"))}(e),function(e){e.game_started&&Je()}(e),te(e),et(e,t),qe(e,t)}function nt(e,t){tt(e,t),he(e,t),function(e,t){e.game_started&&be(t,e.players[e.turn],!e.goalset)}(e,t),Ee(e,t)}var ot=window.location.protocol.includes("https")?"wss":"ws",rt=r()("".concat(ot,"://").concat(window.location.host),{reconnection:!1}),it=new Promise((function(e){rt.on("connect",(function(){console.log("Connected to server!"),e()}))})),at=function(){it.then((function(){var e=document.getElementById("room-nonce").innerHTML,t=document.getElementById("name").innerHTML,n={room:e,name:t};!function(e){rt.on("disconnect",(function(){return console.log("disconnected from room")})),rt.on("message",(function(e){return k(e.name,e.message)})),rt.on("server_message",(function(e){return S(e)})),rt.on("render_spectator_state",(function(t){return tt(t,e)})),rt.on("render_player_state",(function(t){return nt(t,e)})),rt.on("new_player",de),rt.on("player_left",de),rt.on("begin_game",(function(t){return Ve(t,e)})),rt.on("begin_shake",(function(t){return Ze(t,e)})),rt.on("next_turn",(function(t){return function(e,t){var n=e.player,o=e.show_bonus;Ie(n),se(n===t&&o)}(t,e)})),rt.on("game_over_clientside",(function(){return S("The game has finished!"),Ie("Game Ended"),void Ce()})),rt.on("end_shake_no_goal",(function(){return T(rt)})),rt.on("hide_goal_setting_buttons",(function(){return le()})),rt.on("update_goalline",(function(e){return t=e.type,n=e.order,o=e.new_val,"x_pos"===t?G[n].cube_pos_x=z(o*(L.width/1e3)):"orientation"===t&&(G[n].orientation=o),void K();var t,n,o})),rt.on("highlight_cube",(function(e){return t=e,void document.getElementById("r".concat(t)).querySelector("img").classList.add("highlight-img");var t})),rt.on("unhighlight_cube",(function(e){return t=e,void document.getElementById("r".concat(t)).querySelector("img").classList.remove("highlight-img");var t})),rt.on("move_cube",(function(e){return ae(e)})),rt.on("handle_challenge",(function(t){return function(e,t,n){var o=n.challenge,r=n.writers,i=n.nonwriters,a=n.caller,c=n.sider;Ce(),Ie(Be.get(o)),"no_goal"!==o?(Ne(e,c,t),je(e,r,t)):Me(e,a,r,i,t)}(rt,e,t)})),rt.on("force_out",(function(t){return function(e,t,n){Ie("Force Out"),S("It is now Force Out."),n.includes(t)?(Ce(),C(e)):S("Waiting for players to write solutions...")}(rt,e,t)})),rt.on("review_solutions",(function(t){return Ae(rt,e,t)})),rt.on("rejection_assent",(function(t){return Oe(rt,e,t)})),rt.on("reevaluate_solution",(function(t){return function(e,t,n){var o=n.rejecter,r=n.writer,i=n.solution;if(o===t)I(e,r,i,!0,!0);else{var a="".concat(r," does not agree that his/her solution "),c="is incorrect. Waiting for ".concat(o," to re-evaluate ");S("".concat(a).concat(c).concat("whether the solution is correct..."))}}(rt,e,t)})),rt.on("finish_shake",(function(t){return function(e,t,n,o){var r=n.p1score,i=n.p2score,a=n.p3score,c=n.players;S("This shake has finished! The scoreboard has been updated."),fe(document.getElementById("scoreboard"),r,i,a),o?e.emit("game_over"):De(e,t,c)}(rt,e,t.scores,t.game_finished)})),rt.on("five_minute_warning_message",(function(){w(document.createElement("li"),a.a.createElement(p,null))})),rt.on("update_variations",(function(t){return ze(t.variations_state,t.players,e)})),rt.on("variations_finished",(function(t){return Ue(t,e)})),rt.on("timer_flip",(function(e){return function(e){S("".concat(e.flipper," flipped the timer.")),Ye(e.last_timer_flip)}(e)})),rt.on("universe_set",(function(t){return function(e,t){var n=e.cardsetter,o=e.numCards,r=e.onsets_cards;S("".concat(n," set ").concat(o," cards in the universe!")),Xe(o,r),S("It is now time to call variations."),ze(e.variations_state,e.players,t)}(t,e)})),rt.on("universe_error",(function(t){return function(e,t){var n=e.cardsetter,o=e.numCardsStr;n==t?(S("You tried to set a universe with ".concat(o," cards, which is invalid.")),S("If you are not in Senior Division, please set a universe between 6 and 12 cards."),S("If you are in Senior Division, please set a universe between 10 and 14 cards."),x(rt)):(S("".concat(n," tried to set ").concat(o," cards in the universe, which is invalid.")),S("Waiting for ".concat(n," to set a universe with valid size...")))}(t,e)}))}(t),console.log("Connecting as ".concat(t," in room ").concat(e)),rt.emit("register_client",n)})).catch((function(e){return console.log("Error: ",e)}))};function ct(e){var t=document.getElementById("name").innerHTML;rt.emit("new_message",{name:t,message:e})}var st=function(e){return rt.emit("cube_clicked",e)};function lt(){this.classList.toggle("button-clicked"),rt.emit("bonus_clicked")}}}]);