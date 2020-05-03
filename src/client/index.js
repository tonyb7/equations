// Client entrypoint

import { connect, handleChatEnter } from './networking';

$(document).ready(handleChatEnter);
connect();
