// Client entrypoint

import { connect, handleChatEnter } from './networking';
import { downloadAssets } from './assets';

$(document).ready(handleChatEnter);

Promise.all([
    connect(),
    downloadAssets(),
]).then(() => {
    console.log("Connected and downloaded assets");
}).catch((error) => console.log(error));

