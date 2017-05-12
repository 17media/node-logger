# node-logger [![CircleCI](https://circleci.com/gh/17media/node-logger/tree/master.svg?style=shield)](https://circleci.com/gh/17media/node-logger/tree/master) [![npm (scoped)](https://img.shields.io/npm/v/@17media/node-logger.svg)]() [![Coverage Status](https://coveralls.io/repos/github/17media/node-logger/badge.svg?branch=master)](https://coveralls.io/github/17media/node-logger?branch=master)
Centralized logger for 17.Media Node.JS projects

> ... in the fires of Mount Doom, the dark lord Sauron forged, in secret, a **master logger** to control all others.<br>
> **"One logger to log them all!"**
>
> ![](https://i0.wp.com/media2.slashfilm.com/slashfilm/wp/wp-content/images/lordoftherings-ring-map.jpg)

## Usage

First of all you have to set up your configs:
```js
import { Level } from '@17media/node-logger';

const loggerConfig = {
  // configs shared by all log services
  base: {
    // minimum level to trigger logger [ERROR|WARN|INFO|DEBUG]
    // levels lower than this will not be logged
    // it can be overridden in each service specific config
    logLevel: Level.INFO,

    // project name, preferably 'name' from package.json
    project: require('~/package.json').name,

    // environment [production|stage|development]
    environment: 'production',
  },

  // configs for slack
  Slack: {
    // override minimum log level (optional)
    logLevel: Level.WARN,

    // slack bot access token
    slackToken: SLACK_BOT_TOKEN,

    // slack channel to log messages to
    slackChannel: SLACK_BOT_ALERT_CHANNEL,
  },

  // configs for log collecting service (fluentD)
  Fluentd: {
    // override minimum log level (optional)
    logLevel: Level.INFO,

    // log collector URL
    collectorUrl: LOG_COLLECTOR_URL,
  },

  // configs for logging to console
  Console: {
    // override minimum log level (optional)
    logLevel: Level.ERROR,
  },
};
```

Then, there are two ways to continue, **the easy way** and **the complete way**:

### Easy Way

This is the simple way and should cover ~90% of the use cases.
```js
const logger = require('@17media/node-logger').createLogger(loggerConfig)('some:label');

logger.debug('track the variable value during development', { info });
logger.info('somehing worth logging for future reference', { additionalInfo });
logger.warn('somehing worth notice', { additionalInfo });
logger.error('somehing terrible happened', new Error());
logger.fatal('somehing disastrous happened', new Error(), { additionalInfo });
```

### Complete Way

Provide configs to initiate the logger:<br>
A log service will be used only when all corresponding configs are provided.
```js
const { Logger } = require('@17media/node-logger');
const logger = new Logger(loggerConfig);
```

Use the logger like:
```js
const { LogMessage } = require('@17media/node-logger');

logger.Log(
  Level.WARN,
  new LogMessage('something happened', { additionalInfo }),
  'some:label:for:the:message'
);
```

In most situations you would want to pre-label all the messages logged in a file.<br>
You can do it by:
```js
const labelledLogger = logger.Label('path:to:this:file');

labelledLogger.Log(
  Level.WARN,
  new LogMessage('something happened', { additionalInfo })
);
```

You can extend `LogMessage` and `ErrorMessage` to create customized formatting for your context.
