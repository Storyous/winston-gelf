# Winston GELF Transport

A GELF transport for Winston

## Installation

``` sh
  $ npm install winston
  $ npm install @storyous/winston-gelf
```

## Usage
```javascript
  const winston = require('winston');
  const { GELFTransport, ConsoleReporter } = require('winston-gelf');
  const options = {
    reporters: [new ConsoleReporter()],
  };

  const logger = new(winston.Logger)({
      transports: [new GELFTransport(options)]
  });

```

## Options

* __reporters__: List of reporters
* __version__: Current application version
* __hostname__: Hostname of application (default: os.hostname())
* __environment__: Environment (default: process.env.NODE_ENV)
* __service__: Service name (default: nodejs)
* __silent__: Should silence reporters (default: false)
* __level__: Level to report (default: info)
