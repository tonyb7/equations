// Client entrypoint

import React from 'react';
import ReactDOM from 'react-dom';
import {ChatInput} from './components/ChatInput';
import { downloadAssets } from './assets/main';

$(document).ready(() => {
    ReactDOM.render(<ChatInput />, document.getElementById('chat-input'));
});

downloadAssets()
.then(import(/*webpackChunkName: "networking" */ './networking').then((networking) => networking.connect()))
.then(() => console.log("Connected and downloaded assets"))
.catch((error) => console.log(error));
