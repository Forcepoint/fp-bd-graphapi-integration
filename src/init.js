"use strict";

// Initialize config
const configs = require('./config').getConfigs();

// Initialize logging
require('./logging').init(configs.log);

// define entrypoint
const entrypoint = require('./main').run;

// request access token and kick off the entrypoint
require('./graph-auth').init(configs.services.graph, entrypoint);