// Client entrypoint

import { connect, handleChatEnter } from './networking';
import { downloadAssets } from './assets';

$(document).ready(handleChatEnter);

downloadAssets()
.then(connect)
.then(() => console.log("Connected and downloaded assets"))
.catch((error) => console.log(error));
