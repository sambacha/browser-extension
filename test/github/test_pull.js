$(() => {
  // need to fake the sha, not sure why
  $('body')
    .append(
      '<input name="comparison_end_oid" value="1d30954874ebec7111ba0266d79586ecccf278dc">',
    )
    .append(
      '<input name="comparison_start_oid" value="16d10b964db04920cda005b4555166fe4f7b4f95">',
    );
  window.cc = new Github({
    debug: true,
    callback: mocha.run,
    overlay: true,
    enterprise: '',
    debug_url: 'https://github.com/codecov/codecov-python/pull/16/files',
  });
});

describe('github pull', () => {
  after(() => {
    save_coverage('gh-pull');
  });
  it('should start with no errors', () => {
    expect(window.cc.page).to.equal('pull');
    expect(window.cc.slug).to.equal('codecov/codecov-python');
    expect(window.cc.file).to.equal(null);
    expect(window.cc.ref).to.equal('1d30954874ebec7111ba0266d79586ecccf278dc');
    expect(window.cc.base).to.equal(
      '?base=16d10b964db04920cda005b4555166fe4f7b4f95',
    );
  });
  it('should add coverage button', () => {
    const button = $('.file-actions .btn-group a.btn.codecov');

    expect(button.length).to.equal(5);
    expect($(button).eq(1).text()).to.equal('Coverage 84.92% (Diff 100%)');
  });
  it('should show diff in toc', () => {
    expect(
      $(
        'a[href="#diff-ed4cb86e1f4a5c5feeecc37b90ec6a23"] .diffstat .codecov',
      ).text(),
    ).to.equal('84.92% (100%)');
  });
  it('should still have all lines', () => {
    expect($('.file tr').length).to.equal(69);
  });
  it('should not be shown', () => {
    expect($('.codecov-on').length).to.equal(0);
    expect($('.codecov.btn.selected').length).to.equal(0);
    expect($('.blob-num-deletion:visible').length).to.not.equal(0);
  });
  it('click will toggle coverage', () => {
    const file = $('.file-header[data-path="codecov/__init__.py"]');

    expect($('.codecov.btn', file).hasClass('selected')).to.equal(false);
    click($('.codecov.btn', file)[0]);
    expect($('.codecov.btn', file).hasClass('selected')).to.equal(true);
    expect(file.next().find('.blob-num-deletion:visible').length).to.equal(0);
    expect(file.next().find('.codecov:not(.codecov-on)').length).to.equal(0);
  });
});
