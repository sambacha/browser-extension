// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Cls = (window.Codecov = class Codecov {
  static initClass() {
    this.prototype.slug = null; // :owner/:repo
    this.prototype.ref = null; // sha of head
    this.prototype.base = ''; // sha of base (compare|pull only)
    this.prototype.file = ''; // specific file name viewing (blob only)
    this.prototype.page = null; // type of github page: blob|compare|pull
    this.prototype.found = false; // was coverage found
    this.prototype.urlid = 0; // which url to use when searching reports
    this.prototype.cache = [null, null];
    this.prototype.colors = [
      '#f8d9d3',
      '#f8d9d3',
      '#f8d9d3',
      '#f9dad2',
      '#f9dad2',
      '#fadad1',
      '#fadad1',
      '#fadad1',
      '#fbdbd0',
      '#fbdbd0',
      '#fbdbd0',
      '#fcdbcf',
      '#fcdccf',
      '#fddcce',
      '#fddcce',
      '#fdddce',
      '#feddcd',
      '#feddcd',
      '#fedecd',
      '#ffdecc',
      '#ffdecc',
      '#ffdfcc',
      '#fee0cd',
      '#fee2cd',
      '#fee3cd',
      '#fee4cd',
      '#fde5ce',
      '#fde6ce',
      '#fde7ce',
      '#fde8ce',
      '#fce9cf',
      '#fceacf',
      '#fcebcf',
      '#fceccf',
      '#fbedd0',
      '#fbeed0',
      '#fbefd0',
      '#fbefd0',
      '#faf0d1',
      '#faf1d1',
      '#faf1d1',
      '#faf2d1',
      '#faf2d1',
      '#faf2d1',
      '#faf3d1',
      '#f9f3d2',
      '#f9f4d2',
      '#f9f4d2',
      '#f9f4d2',
      '#f9f5d2',
      '#f9f5d2',
      '#f9f5d2',
      '#f8f6d3',
      '#f8f6d3',
      '#f8f6d3',
      '#f8f7d3',
      '#f8f7d3',
      '#f8f7d3',
      '#f7f8d3',
      '#f7f7d4',
      '#f7f7d4',
      '#f7f8d3',
      '#f7f8d3',
      '#f7f9d2',
      '#f6f9d2',
      '#f6f9d2',
      '#f6fad1',
      '#f6fad1',
      '#f6fbd0',
      '#f6fbd0',
      '#f5fbd0',
      '#f5fccf',
      '#f5fccf',
      '#f4fdce',
      '#f4fdce',
      '#f4fdce',
      '#f3fecd',
      '#f3fecd',
      '#f3ffcc',
      '#f2ffcc',
      '#f2ffcc',
      '#f1ffcc',
      '#f0ffcc',
      '#eefecd',
      '#edfecd',
      '#ecfecd',
      '#ebfecd',
      '#e9fecd',
      '#e8fdce',
      '#e7fdce',
      '#e6fdce',
      '#e5fdce',
      '#e4fdce',
      '#e3fccf',
      '#e2fccf',
      '#e1fccf',
      '#e0fccf',
      '#dffccf',
      '#defbd0',
      '#ddfbd0',
      '#dcfbd0',
    ];
    this.prototype.settings = {
      urls: [],
      overlay: true,
      debug: false,
      callback: null,
      debug_url: null,
    };
  }

  log(title, data) {
    if (this.settings.debug) {
      return console.log(this, title, data);
    }
  }

  constructor(prefs, cb) {
    /*
    Called once at start of extension
    */
    // establish settings
    this.settings = $.extend(this.settings, prefs);
    let urls = [];
    // add enterprise urls

    if (prefs.enterprise) {
      urls = prefs.enterprise.split('\n').filter(Boolean);
    }

    const href = (this.settings.debug_url || document.URL).split('/');
    // only add codecov.io when on production site

    if (['github.com', 'bitbucket.org'].includes(href[2])) {
      urls.unshift('https://codecov.io');
    }

    this.settings.urls = urls;
    // callback to allow custom events for each browser
    if (typeof cb === 'function') {
      cb(this);
    }

    // Go
    this._start();
  }

  get_ref() {} // find and return the page ref

  prepare() {} // first prepare the page for coverage overlay

  overlay() {} // method to overlay coverage results

  get_codecov_yml() {} // return yaml source code if viewing it in GH

  _start() {
    /*
    CALLED: when dom changes and page first loads
    GOAL: is to collect page variables, insert dom elements, bind callbacks
    */
    this.log('::start');
    const href = (this.settings.debug_url || document.URL).split('/');

    this.slug = `${href[3]}/${href[4]}`;
    this.page = href[5];
    this.ref = this.get_ref(href);
    this.log('::ref', this.ref);
    if (this.ref) {
      this.prepare();
      return this._run();
    }
  }

  _run() {
    /*
    CALLED: when coverage should be retrieved.
    GOAL: get coverage from cache -> storage -> URL
    */
    if (this._processing) {
      return;
    }
    this.log('::run');
    const self = this;

    this.cachekey = `${this.slug}/${this.ref}${
      this.base ? `/${this.base}` : ''
    }`;

    // get fron storage
    // ----------------
    this._processing = true;
    this.storage_get = storage_get;
    if (this.cache[0] === this.cachekey) {
      self.log('::in-memory');
      return this._process(this.cache[1]);
    }
    return storage_get(this.cachekey, (result) => {
      if (result != null) {
        self.log('::in-cached');
        return self._process(result);
      }
      // run first url
      return self._get(self.settings.urls[self.urlid]);
    });
  }

  _get(endpoint) {
    /*
    CALLED: to get the coverage report from Codecov (or Enterprise urls)
    GOAL: http fetch coverage
    */
    let url;

    this.log('::get', endpoint);
    const self = this;

    if (Array.from(this.ref).includes('/')) {
      url = `${endpoint}/api/${this.service}/${this.slug}/${this.ref}&src=extension`;
    } else {
      const e = this.base
        ? `compare/${this.base}...${this.ref}`
        : `commits/${this.ref}`;

      url = `${endpoint}/api/${this.service}/${this.slug}/${e}?src=extension`;
    }

    // get coverage
    // ============
    return $.ajax({
      url,
      type: 'get',
      dataType: 'json',
      success(res) {
        self.url = endpoint; // keep the url that worked
        self.found = true;
        return self._process(res, true);
      },

      // for testing purposes
      complete() {
        self.log('::ajax.complete', arguments);
        __guardMethod__(self.settings, 'callback', (o) => o.callback());
        return self._validate_codecov_yml();
      },

      // try to get coverage data from enterprise urls if any
      error(xhr, type, reason) {
        self._processing = false;
        self.log(arguments);
        self.error(xhr.status, reason);
        if (self.settings.urls.length > self.urlid + 1) {
          return self._get(self.settings.urls[(self.urlid += 1)]);
        }
      },
    });
  }

  _process(res, store) {
    if (store == null) {
      store = false;
    }
    /*
    CALLED: to process report data
    GOAL: to update the dom with coverage
    */
    this._processing = false;
    this.log('::process', res);
    // cache in extension
    this.cache = [this.cachekey, res];
    // cache in storage
    if (store && this.cacheable) {
      storage_set({ [this.cachekey]: res }, () => null);
    }

    this.yaml = {
      round:
        __guard__(
          __guard__(
            res.repo != null ? res.repo.yaml : undefined,
            (x1) => x1.coverage,
          ),
          (x) => x.round,
        ) != null || 'down',
      precision:
        __guard__(
          __guard__(
            res.repo != null ? res.repo.yaml : undefined,
            (x3) => x3.coverage,
          ),
          (x2) => x2.precision,
        ) != null
          ? res.repo.yaml.coverage.precision
          : 2,
      range: [
        parseFloat(
          __guard__(
            __guard__(
              res.repo != null ? res.repo.yaml : undefined,
              (x5) => x5.coverage,
            ),
            (x4) => x4.range,
          ) != null
            ? res.repo.yaml.coverage.range[0]
            : 70,
        ),
        parseFloat(
          __guard__(
            __guard__(
              res.repo != null ? res.repo.yaml : undefined,
              (x7) => x7.coverage,
            ),
            (x6) => x6.range,
          ) != null
            ? res.repo.yaml.coverage.range[1]
            : 100,
        ),
      ],
    };

    try {
      return this.overlay(res);
    } catch (error) {
      console.debug(error);
      this.log(error);
      return this.error(500, error);
    }
  }

  color(ln) {
    if (ln == null) {
      return;
    } // undefined or null
    const c = ln.c == null ? ln : ln.c;

    if (c === 0) {
      return 'missed';
    }
    if (c === true) {
      return 'partial';
    }
    if (Array.from(c).includes('/')) {
      const v = c.split('/');

      if (v[0] === '0') {
        return 'missed';
      }
      if (v[0] === v[1]) {
        return 'hit';
      }
      return 'partial';
    }
    return 'hit';
  }

  bg(coverage) {
    coverage = parseFloat(coverage);
    if (coverage <= this.yaml.range[0]) {
      return this.colors[0];
    }
    if (coverage >= this.yaml.range[1]) {
      return this.colors[100];
    }
    return this.colors[
      parseInt(
        ((coverage - this.yaml.range[0]) /
          (this.yaml.range[1] - this.yaml.range[0])) *
          100,
      )
    ];
  }

  ratio(x, y) {
    if (x >= y) {
      return '100';
    }
    if (y > x && x > 0) {
      return this.format(Math.round((x / y) * 10000) / 100);
    }
    return '0';
  }

  format(cov) {
    let _;
    let c;

    cov = parseFloat(cov);
    if (this.yaml.round === 'up') {
      _ = parseFloat(Math.pow(10, this.yaml.precision));
      c = Math.ceil(cov * _) / _;
    } else if (this.yaml.round === 'down') {
      _ = parseFloat(Math.pow(10, this.yaml.precision));
      c = Math.floor(cov * _) / _;
    } else {
      c = Math.round(cov, this.yaml.precision);
    }

    return cov.toFixed(this.yaml.precision);
  }

  _validate_codecov_yml() {
    const self = this;
    const yml = self.get_codecov_yml();

    if (yml) {
      return $.ajax({
        url: `${self.settings.urls[self.urlid]}/validate`,
        type: 'post',
        data: yml,
        success: self.yaml_ok,
        error(xhr, type, reason) {
          return self.yml_error(reason);
        },
      });
    }
  }
});

Cls.initClass();

window.create_codecov_instance = function (prefs, cb) {
  // hide codecov plugin
  let needle;
  let needle1;

  __guard__(
    document.getElementById('chrome-install-plugin'),
    (x) => (x.style.display = 'none'),
  );
  __guard__(
    document.getElementById('opera-install-plugin'),
    (x1) => (x1.style.display = 'none'),
  );

  // detect git service
  if ($('meta[name="hostname"]').length > 0) {
    return new Github(prefs, cb);
  }
  if (
    ((needle = $('meta[name="application-name"]').attr('content')),
    ['Bitbucket', 'Stash'].includes(needle))
  ) {
    return new Bitbucket(prefs, cb);
  }
  if (
    ((needle1 = 'GitLab'),
    Array.from($('meta[name="description"]').attr('content')).includes(needle1))
  ) {
    return new Gitlab(prefs, cb);
  }
};

function __guardMethod__(obj, methodName, transform) {
  if (
    typeof obj !== 'undefined' &&
    obj !== null &&
    typeof obj[methodName] === 'function'
  ) {
    return transform(obj, methodName);
  }
  return undefined;
}
function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null
    ? transform(value)
    : undefined;
}
