/*
 * Is injected into the spec runner file

 * Copyright (c) 2012 Kelly Miyashiro
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

/* global mocha:true, alert:true, window:true */

(function () {
  // Send messages to the parent phantom.js process via alert! Good times!!
  const sendMessage = function sendMessage() {
    const args = [].slice.call(arguments);

    alert(JSON.stringify(args));
  };

  // Create a listener who'll bubble events from Phantomjs to Grunt
  const createGruntListener = function createGruntListener(ev, runner) {
    runner.on(ev, (test, err) => {
      const data = {
        err,
      };

      if (test) {
        data.title = test.title;
        data.fullTitle = test.fullTitle();
      }

      if (ev === 'end' && window._$jscoverage) {
        const cov = {};

        for (const prop in window._$jscoverage) {
          const file = window._$jscoverage[prop];

          file[0] = file.source;
          cov[prop] = file;
        }
        data.cov = cov;
      }

      sendMessage(`mocha.${ev}`, data);
    });
  };

  const GruntReporter = function (runner) {
    // 1.4.2 moved reporters to Mocha instead of mocha
    const mochaInstance = window.Mocha || window.mocha;

    if (!mochaInstance) {
      throw new Error(
        'Mocha was not found, make sure you include Mocha in your HTML ' +
          'spec file.',
      );
    }

    // Setup HTML reporter to output data on the screen
    mochaInstance.reporters.HTML.call(this, runner);

    // Create a Grunt listener for each Mocha events
    const events = [
      'start',
      'test',
      'test end',
      'suite',
      'suite end',
      'fail',
      'pass',
      'pending',
      'end',
    ];

    for (let i = 0; i < events.length; i++) {
      createGruntListener(events[i], runner);
    }
  };

  const options = window.PHANTOMJS;

  if (options) {
    // Default mocha options
    const config = {
      ui: 'bdd',
      ignoreLeaks: true,
      reporter: GruntReporter,
    };
    const { run } = options;
    let key;

    if (options) {
      // If options is a string, assume it is to set the UI (bdd/tdd etc)
      if (typeof options === 'string') {
        config.ui = options;
      } else {
        // Extend defaults with passed options
        for (key in options.mocha) {
          config[key] = options.mocha[key];
        }
      }
    }

    config.reporter = GruntReporter;

    mocha.setup(config);

    // task option `run`, automatically runs mocha for grunt only
    if (run) {
      mocha.run();
    }
  } else {
    mocha.ui('bdd');
    mocha.reporter('html');
  }
})();
