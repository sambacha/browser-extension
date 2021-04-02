// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
window.Github = class Github extends Codecov {
  get_ref(href) {
    let from, split, to;
    this.service = (window.location.hostname === 'github.com') || (this.settings.debug_url != null) ? 'gh' : 'ghe';
    this.file = null;
    if (['releases', 'tags'].includes(this.page)) {
      // planned
      return false;

    } else if (this.page === 'commit') {
      // https://github.com/codecov/codecov-python/commit/b0a3eef1c9c456e1794c503aacaff660a1a197aa
      return href[6];

    } else if (this.page === 'commits') {
      // https://github.com/codecov/codecov-python/commits
      // https://github.com/codecov/codecov-python/commits/master
      to = $('li.commit:first a:last').attr('href').split('/')[4];
      from = $('li.commit:last a:last').attr('href').split('/')[4];
      return `branch/${href[6] || $('.branch-select-menu .js-select-button').text()}/commits?start=${from}&stop=${to}`;

    } else if (href[7] === 'commits') {
      // https://github.com/codecov/codecov.io/pull/213/commits
      this.page = 'commits';
      to = $('li.commit:first a:last').attr('href').split('/')[4];
      from = $('li.commit:last a:last').attr('href').split('/')[4];
      return `pull/${href[6]}/commits?start=${from}&stop=${to}`;

    } else if (['blob', 'blame'].includes(this.page)) {
      // https://github.com/codecov/codecov-python/blob/master/codecov/clover.py
      // https://github.com/codecov/codecov-python/blob/4c95614d2aa78a74171f81fc4bf2c16a6d8b1cb5/codecov/clover.py
      split = $('a[data-hotkey=y]').attr('href').split('/');
      this.file = `${split.slice(5).join('/')}`;
      return split[4];

    } else if (this.page === 'compare') {
      // https://github.com/codecov/codecov-python/compare/v1.1.5...v1.1.6
      this.base = `${$('.commit-id:first').text() || $('input[name=comparison_start_oid]').val()}`;
      return $('.commit-id:last').text() || $('input[name=comparison_end_oid]').val();

    } else if (this.page === 'pull') {
      // https://github.com/codecov/codecov-python/pull/16/files
      this.base = `${$('.commit-id:first').text() || $('input[name=comparison_start_oid]').val()}`;
      return $('.commit-id:last').text() || $('input[name=comparison_end_oid]').val();

    } else if (this.page === 'tree') {
      return $('.js-permalink-shortcut').attr('href').split('/')[4];

    } else {
      // no coverage overlay
      return false;
    }
  }

  prepare() {
    this.log('::prepare');
    // add Coverage Toggle
    $('.repository-content .file').each(function() {
      const file = $(this);
      if (file.find('.btn.codecov').length === 0) {
        if (file.find('.file-actions > .BtnGroup').length === 0) {
          file
            .find('.file-actions a:first')
            .wrap('<div class="BtnGroup"></div>');
        }
        return file
          .find('.file-actions > .BtnGroup')
          .prepend(`<a class="btn BtnGroup-item btn-sm codecov disabled tooltipped tooltipped-n"
aria-label="Requesting coverage from Codecov.io"
data-hotkey="c">Coverage loading...</a>`)
          .find('.btn').addClass('BtnGroup-item');
      }
    });

    return true;  // get content to overlay
  }

  overlay(res) {
    let c;
    this.log('::overlay');
    let self = this;
    $('.codecov-removable').remove();

    if (this.page === 'commits') {

      const commits = {};
      for (c of Array.from(res.commits)) {
        commits[c.commitid] = c;
      }

      const base_url = `${self.settings.urls[self.urlid]}/${self.service}/${self.slug}/commit`;
      return $('li.commit').each(function() {
        const $commit = $(this);
        const commit = commits[$commit.find('a:last').attr('href').split('/')[4]];
        console.log($commit.find('a:last').attr('href').split('/')[4], commit);
        if (__guard__(commit != null ? commit.totals : undefined, x => x.c) != null) {
          return $commit
            .find('.commit-meta.commit-author-section')
            .append(`<a title="Codecov Coverage" href="${base_url}/${commit.commitid}">${self.format(commit.totals.c)}%</a>`);
        }
      });

    } else {
      // v4/commits or v4/compare or v3/commit&compare
      let total;
      const report = (res.commit != null ? res.commit.report : undefined) || (res.head != null ? res.head.report : undefined) || res.report;

      if (this.page === 'tree') {
        total = ((report.totals != null ? report.totals.c : undefined) != null) ? report.totals.c : report.coverage;  // v4 || v3
        $('.commit-tease span.right').append(`\
<a href="${this.settings.urls[this.urlid]}/github/${this.slug}?ref=${this.ref}"
   class="sha-block codecov codecov-removable tooltipped tooltipped-n"
   aria-label="Codecov Coverage">
  ${self.format(total)}%
</a>`);
        return $('.file-wrap tr:not(.warning):not(.up-tree)').each(function() {
          const filepath = __guard__($('td.content a', this).attr('href'), x => x.split('/')).slice(5).join('/');
          if (filepath) {
            const file = report.files != null ? report.files[filepath] : undefined;
            if (file != null) {
              if (file != null ? file.ignored : undefined) { return; }  // v4 or (v3)
              const cov = ((file.t != null ? file.t.c : undefined) != null) ? file.t.c : file.coverage;  // v4 || v3
              if (cov != null) {
                const path = ((file.t != null ? file.t.c : undefined) != null) ? `src/${self.ref}/${filepath}` : `${filepath}?ref=${self.ref}`;  // v4 || v3
                return $('td:last', this).after(`\
<td style="background:linear-gradient(90deg, ${self.bg(cov)} ${cov}%, white ${cov}%);text-align:right;"
    class="sha codecov codecov-removable tooltipped tooltipped-n"
    aria-label="Codecov Coverage">
  <a href="${self.settings.urls[self.urlid]}/${self.service}/${self.slug}/${path}">
    ${self.format(cov)}%
  </a>
</td>`);
              } else {
                return $('td:last', this).after("<td></td>");
              }
            } else {
              return $('td:last', this).after("<td></td>");
            }
          } else {
            return $('td:last', this).after("<td></td>");
          }
        });

      } else {
        let _td;
        if (['commit', 'compare', 'pull'].includes(this.page)) {
          $('.toc-diff-stats, .diffbar-item.diffstat, #diffstat')
            .append(`<span class="codecov codecov-removable"> <strong>${self.format(report.totals.c)}%</strong></span>`);
        }

        self = this;
        let total_hits = 0;
        let total_lines = 0;

        // which <td> is the source code
        const split_view = $('.diff-table.file-diff-split').length > 0;
        if (self.page === 'blob') {
          _td = "td:eq(0)";
        } else if (split_view) {
          _td = "td:eq(2)";
        } else {
          _td = "td:eq(1)";
        }

        $('.repository-content .file').each(function() {
          const file = $(this);

          // find covered file
          let fp = self.file || file.find('.file-info>a[title]').attr('title');
          if (fp) {
            if (Array.from(fp).includes('→')) { fp = fp.split('→')[1].trim(); }
            const file_data = report.files[fp];

            // assure button group
            if (file.find('.file-actions > .BtnGroup').length === 0) {
              file
                .find('.file-actions a:first')
                .wrap('<div class="BtnGroup"></div>');
            }

            // report coverage
            // ===============
            if ((file_data != null) && ((file_data != null ? file_data.ignored : undefined) !== true)) {
              total = self.format(((file_data.t != null ? file_data.t.c : undefined) != null) ? file_data.t.c : file_data.coverage);
              const button = file.find('.btn.codecov')
                           .attr('aria-label', 'Toggle Codecov (c), alt+click to open in Codecov')
                           .attr('data-codecov-url',
                               `${self.settings.urls[self.urlid]}/${self.service}/${self.slug}/` + (
                                 ((file_data.t != null ? file_data.t.c : undefined) != null) ?  // v4
                                   `src/${self.ref}/${fp}`
                                 :  // v3
                                   `${fp}?ref=${self.ref}`
                               )
                            )
                           .text(`${total}%`)
                           .removeClass('disabled')
                           .unbind()
                           .click(['blob', 'blame'].includes(self.page) ? self.toggle_coverage : self.toggle_diff);

              // overlay coverage
              let hits = 0;
              let lines = 0;
              const file_lines = (file_data.l != null) ? file_data.l : file_data.lines;
              file.find('tr').each(function() {
                const td = $(_td, this);
                const cov = self.color(file_lines[td.attr('data-line-number') || (__guard__(td.attr('id'), x => x.slice(1)))]);
                if (cov) {
                  if (split_view) {
                    // only add codecov classes on last two columns
                    $('td:eq(2), td:eq(3)', this)
                      .removeClass('codecov-hit codecov-missed codecov-partial')
                      .addClass(`codecov codecov-${cov}`);
                  } else {
                    $('td', this)
                      .removeClass('codecov-hit codecov-missed codecov-partial')
                      .addClass(`codecov codecov-${cov}`);
                  }

                  if ($('.blob-num-addition', this).length > 0) {
                    lines += 1;
                    if (cov === 'hit') { return hits += 1; }
                  }
                }
              });

              total_hits += hits;
              total_lines += lines;

              if (['commit', 'pull'].includes(self.page)) {
                const diff = self.format(self.ratio(hits, lines));
                button.text(`Coverage ${total}% (Diff ${diff}%)`);
                // pull view
                if (self.page === 'pull') {
                  $('a[href="#'+file.prev().attr('name')+'"] .diffstat')
                    .prepend(`<span class="codecov codecov-removable">${total}% <strong>(${diff}%)</strong></span>`);
                } else {
                  // compare view
                  $('a[href="#'+file.prev().attr('name')+'"]')
                    .parent()
                    .find('.diffstat')
                    .prepend(`<span class="codecov codecov-removable">${total}% <strong>(${diff}%)</strong></span>`);
                }
              }

              // toggle blob/blame
              if (self.settings.overlay && ['blob', 'blame'].includes(self.page)) {
                return button.trigger('click');
              }
            } else if ((file_data != null ? file_data.ignored : undefined) === true) {  // v3
              return file
                .find('.btn.codecov')
                .attr('aria-label', 'File ignored')
                .text('Not covered');
            } else {
              return file
                .find('.btn.codecov')
                .attr('aria-label', 'File not reported to Codecov')
                .text('Not covered');
            }
          }
        });

        if (['commit', 'compare', 'pull'].includes(self.page)) {
          // upate toc-diff-stats
          return $('.toc-diff-stats, .diffbar-item.diffstat, #diffstat')
            .find('.codecov')
            .append(` (Diff <strong>${self.ratio(total_hits, total_lines)}%</strong>)</span>`);
        }
      }
    }
  }

  toggle_coverage(e) {
    if (e.shiftKey) {
      return window.location = $(this).attr('data-codecov-url');
    } else if ($('.codecov.codecov-on:first').length === 0) {
      $('.codecov').addClass('codecov-on');
      return $(this).addClass('selected');
    } else {
      $('.codecov').removeClass('codecov-on');
      return $(this).removeClass('selected');
    }
  }

  toggle_diff(e) {
    /*
    CALLED: by user interaction
    GOAL: toggle coverage overlay on diff/compare
    */
    if (e.altKey) {
      window.location = $(this).attr('data-codecov-url');
      return;
    }

    const file = $(this).parents('.file');
    if ($(this).hasClass('selected')) {
      // disable Codecov
      file.removeClass('codecov-enabled');
      // toggle off
      $(this).removeClass('selected');
      // show deleted lines
      if (!($('.diff-table.file-diff-split').length > 0)) {
        file.find('.blob-num-deletion').parent().show();
      }
      // remove covered lines
      return file.find('.codecov').removeClass('codecov-on');
    } else {
      // enable Codecov
      file.addClass('codecov-enabled');
      // toggle on
      $(this).addClass('selected');
      // hide deleted lines
      if (!($('.diff-table.file-diff-split').length > 0)) {
        file.find('.blob-num-deletion').parent().hide();
      }
      // fill w/ coverage
      return file.find('.codecov').addClass('codecov-on');
    }
  }

  error(status, reason) {
    if (status === 401) {
      $('.btn.codecov')
        .text("Please login at Codecov")
        .addClass('danger')
        .attr('aria-label', 'Login to view coverage by Codecov')
        .click(() => window.location = `${self.settings.urls[self.urlid]}/login/github?redirect=${escape(window.location.href)}`);
      return $('.commit.codecov .sha-block')
        .addClass('tooltipped tooltipped-n')
        .text('Please login into Codecov')
        .attr('aria-label', 'Login to view coverage by Codecov')
        .click(() => window.location = `${self.settings.urls[self.urlid]}/login/github?redirect=${escape(window.location.href)}`);

    } else if (status === 404) {
      $('.btn.codecov')
        .text("No coverage")
        .attr('aria-label', 'Coverage not found');
      return $('.commit.codecov .sha-block')
        .addClass('tooltipped tooltipped-n')
        .text('No coverage')
        .attr('aria-label', 'Coverage not found');

    } else {
      $('.btn.codecov')
        .text("Coverage error")
        .attr('aria-label', 'There was an error loading coverage. Sorry');
      return $('.commit.codecov .sha-block')
        .addClass('tooltipped tooltipped-n')
        .text('Coverage Error')
        .attr('aria-label', 'There was an error loading coverage. Sorry');
    }
  }
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}