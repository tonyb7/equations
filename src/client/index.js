// Client entrypoint

import React from 'react';
import ReactDOM from 'react-dom';
import {ChatInput} from './components/ChatInput';
import { connect } from './networking';
import { downloadAssets } from './assets';

$(document).ready(() => {
    ReactDOM.render(<ChatInput />, document.getElementById('chat-input'));
});

downloadAssets()
.then(connect)
.then(() => console.log("Connected and downloaded assets"))
.catch((error) => console.log(error));
