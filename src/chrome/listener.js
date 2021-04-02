if ($ == null || $ == undefined) {
  document.addEventListener('pjax:success', () => {
    window.postMessage({ type: 'codecov' }, '*');
  });
} else {
  $(() => {
    $(document).on('pjax:success', () => {
      window.postMessage({ type: 'codecov' }, '*');
    });
  });
}
