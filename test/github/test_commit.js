$(() => {
  window.cc = new Github({
    debug: true,
    callback: mocha.run,
    overlay: true,
    enterprise: '',
    debug_url: 'https://github.com/codecov/codecov-python/commit/91acfd99a5103ab16ff183a117a76c0d492c68a7',
  });
});

describe('github compare', () => {
  after(() => {
    save_coverage('gh-compare');
  });
  it('should have accurate properties', () => {
    expect(window.cc.slug).to.equal('codecov/codecov-python');
    expect(window.cc.file).to.equal(null);
    expect(window.cc.ref).to.equal('91acfd99a5103ab16ff183a117a76c0d492c68a7');
  });
  it('should add coverage button', () => {
    const buttons = $('.file-actions .btn-group a.btn.codecov');

    expect(buttons.length).to.equal(3);
    expect($(buttons).eq(0).text()).to.equal('Not covered');
    expect($(buttons).eq(1).text()).to.equal('Coverage 90.80% (Diff 50.00%)');
    expect($(buttons).eq(2).text()).to.equal('Not covered');
  });
  it('should show diff in toc', () => {
    expect($('a[href="#diff-ed4cb86e1f4a5c5feeecc37b90ec6a23"]').parent().find('.diffstat .codecov').text()).to.equal('90.80% (50.00%)');
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
