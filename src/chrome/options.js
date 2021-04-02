// Saves options to chrome.storage.sync.
function save_options() {
  chrome.storage.sync.set(
    {
      overlay: document.getElementById('overlay').checked,
      enterprise: document.getElementById('enterprise').value,
      hosts: document.getElementById('hosts').value,
      debug: document.getElementById('debug').checked,
    },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');

      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    },
  );
}

function clear_cache() {
  chrome.storage.local.clear();
  const status = document.getElementById('cache_status');

  status.textContent = 'Cache emptied.';
  setTimeout(() => {
    status.textContent = '';
  }, 750);
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get(
    {
      overlay: true,
      enterprise: '',
      hosts: '',
      debug: false,
    },
    (items) => {
      if (items.overlay === undefined) {
        items.overlay = true;
      }
      document.getElementById('overlay').checked = items.overlay;
      document.getElementById('enterprise').value = items.enterprise;
      document.getElementById('hosts').value = items.hosts;
      document.getElementById('debug').checked = items.debug;
    },
  );
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('clear_cache').addEventListener('click', clear_cache);
