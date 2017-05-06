# node-logger [![CircleCI](https://circleci.com/gh/17media/node-logger/tree/master.svg?style=shield)](https://circleci.com/gh/17media/node-logger/tree/master) [![npm (scoped)](https://img.shields.io/npm/v/@17media/node-logger.svg)]()
Centralized logger for 17.Media Node.JS projects

> ... in the fires of Mount Doom, the dark lord Sauron forged, in secret, a **master logger** to control all others.
> **"One logger to log them all!"**
>
> ![](https://i0.wp.com/media2.slashfilm.com/slashfilm/wp/wp-content/images/lordoftherings-ring-map.jpg)

## Usage

Provide configs to initiate the logger:<br>
A log service will be used only when all corresponding configs are provided.
```js
import { LOG_LEVEL, Logger } from '@17media/node-logger';

const loggerConfig = {
  // configs shared by all log services
  base: {
    // minimum level to trigger logger [ERROR|WARN|INFO|DEBUG]
    // levels lower than this will not be logged
    // it can be overridden in each service specific config
    minLogLevel: LOG_LEVEL.INFO,

    // project name, preferably 'name' from package.json
    project: require('~/package.json').name,

    // environment [production|stage|development]
    environment: 'production',
  },

  // configs for slack
  SlackLogger: {
    // override minimum log level (optional)
    minLogLevel: LOG_LEVEL.WARN,

    // slack bot access token
    slackToken: SLACK_BOT_TOKEN,

    // slack channel to log messages to
    slackChannel: SLACK_BOT_ALERT_CHANNEL,
  },

  // configs for log collecting service (fluentD)
  FluentdLogger: {
    // override minimum log level (optional)
    minLogLevel: LOG_LEVEL.INFO,

    // log collector URL
    collectorUrl: LOG_COLLECTOR_URL,
  },

  // configs for logging to console
  ConsoleLogger: {
    // override minimum log level (optional)
    minLogLevel: LOG_LEVEL.ERROR,
  },
};

const logger = new Logger(loggerConfig);
```

Use the logger like:
```js
import { LogMessage } from '@17media/node-logger';

logger.Log(
  LOG_LEVEL.WARN,
  new LogMessage('something happened', { additionalInfo }),
  'some:label:for:the:message'
);
```

In most situations you would want to pre-label all the messages logged in a file.<br>
You can do it by:
```js
const labelledLogger = logger.Label('path:to:this:file');

labelledLogger.Log(
  LOG_LEVEL.WARN,
  new LogMessage('something happened', { additionalInfo })
);
```