// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
window.Bitbucket = class Bitbucket extends Codecov {
  get_ref(href) {
    this.log('::get_ref');
    this.service = (window.location.hostname === 'bitbucket.org') || (this.settings.debug_url != null) ? 'bb' : 'bbs';

    if (this.page === 'src') {
      return href[6].split('?')[0];
    } if (this.page === 'commits') {
      return href[6].split('?')[0];
    } if (this.page === 'pull-requests') {
      return __guard__($('.view-file:first').attr('href'), (x) => x.split('/')[4]);
    }

    return false; // overlay available
  }

  prepare() {
    this.log('::prepare');
    // add Coverage Toggle
    $('#editor-container, section.bb-udiff').each(function () {
      if ($('.aui-button.codecov', this).length === 0) {
        return $('.secondary>.aui-buttons:first', this)
          .prepend(`<a href="#" class="aui-button aui-button-light codecov"
title="Requesting coverage from Codecov.io">Coverage loading...</a>`);
      }
    });

    return true; // get the coverage
  }

  overlay(res) {
    this.log('::overlay');
    const self = this;

    $('.codecov.codecov-removable').remove();

    const report = __guard__(res != null ? res.commit : undefined, (x) => x.report) || __guard__(res != null ? res.head : undefined, (x1) => x1.report);

    // tree view
    $('#source-list tr td.dirname').attr('colspan', 5);
    $('#source-list tr').each(function () {
      const fp = __guard__($('a', this).attr('href'), (x2) => x2.split('?')[0].split('/').slice(5).join('/'));
      const cov = __guard__(__guard__(report != null ? report.files : undefined, (x4) => x4[fp]), (x3) => x3.t.c);

      if (cov != null) {
        return $('td.size', this)
          .after(`\
<td title="Coverage"
    style="background:linear-gradient(90deg, ${self.bg(cov)} ${cov}%, white ${cov}%);text-align:right;"
    class="codecov codecov-removable">
  ${self.format(cov)}%
</td>`);
      }
      // add empty cell
      return $('td.size', this).after('<td style="color:#e7e7e7">n/a</td>');
    });

    // diff file
    $('section.bb-udiff').each(function () {
      const $file = $(this);
      const fp = $file.attr('data-path');
      const data = __guard__(report != null ? report.files : undefined, (x2) => x2[fp]);

      if (data != null) {
        const button = $('.aui-button.codecov', this)
          .attr('title', 'Toggle Codecov')
          .text(`Coverage ${self.format(data.t.c)}%`)
          .attr('data-codecov-url', `${self.settings.urls[self.urlid]}/${self.service}/${self.slug}/src/${self.ref}/${fp}`)
          .unbind()
          .click(self.toggle_diff);

        return $('.udiff-line.common, .udiff-line.addition', this)
          .find('a.line-numbers').each(function () {
            const a = $(this);
            let ln = a.attr('data-tnum');

            ln = __guard__(data != null ? data.l : undefined, (x3) => x3[ln]);
            if (ln != null) {
              return a.addClass(`codecov codecov-${self.color(ln)}`);
            }
          });
      }
      return $file.find('.aui-button.codecov').attr('title', 'File coverage not found').text('Not covered');
    });

    // single file
    return $('#editor-container').each(function () {
      const $file = $(this);
      const fp = $file.attr('data-path');
      // find covered file
      const file = __guard__(report != null ? report.files : undefined, (x2) => x2[fp]);
      const filename = fp.split('/').pop();

      if (file != null) {
        // ... show diff not full file coverage for compare view
        const button = $file.find('.aui-button.codecov')
          .attr('title', 'Toggle Codecov')
          .text(`Coverage ${self.format(file.t.c)}%`)
          .attr('data-codecov-url', '[TODO]')
          .unbind()
          .click(self.toggle_coverage);

        // overlay coverage
        for (const ln in file.l) {
          const cov = file.l[ln];

          $(`a[name='${filename}-${ln}']`, $file).addClass(`codecov codecov-${self.color(cov)}`);
        }

        // toggle blob/blame
        if (self.settings.overlay && ['src', ''].includes(self.page)) {
          return button.trigger('click');
        }
      } else {
        return $file.find('.aui-button.codecov')
          .attr('title', 'File coverage not found')
          .attr('data-codecov-url', '[TODO]')
          .text('Not covered');
      }
    });
  }

  toggle_coverage(e) {
    e.preventDefault();
    if (e.altKey || e.shiftKey) {
      return window.location = $(this).attr('data-codecov-url');
    } if ($('.codecov.codecov-on:first').length === 0) {
      $('.codecov').addClass('codecov-on');
      return $(this).addClass('aui-button-light');
    }
    $('.codecov').removeClass('codecov-on');
    return $(this).removeClass('aui-button-light');
  }

  error(status, reason) {
    if (status === 401) {
      return $('.aui-button.codecov').text('Please login at Codecov')
        .addClass('aui-button-primary')
        .attr('title', 'Login to view coverage by Codecov')
        .click(() => window.location = `https://codecov.io/login/github?redirect=${escape(window.location.href)}`);
    } if (status === 404) {
      return $('.aui-button.codecov').text('No coverage')
        .attr('title', 'Coverage not found');
      // $('.commit.codecov .sha-block').addClass('tooltipped tooltipped-n').text('No coverage').attr('title', 'Coverage not found')
    }
    return $('.aui-button.codecov').text('Coverage error')
      .attr('title', 'There was an error loading coverage. Sorry');
  }
};
// $('.commit.codecov .sha-block').addClass('tooltipped tooltipped-n').text('Coverage Error').attr('title', 'There was an error loading coverage. Sorry')

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
