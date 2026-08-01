function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const modes = ['light', 'dark', 'system'];
  const labels = { light: '☀️ Light', dark: '🌙 Dark', system: '🖥️ System' };

  function currentPreference() {
    return localStorage.getItem('theme-preference') || 'system';
  }

  function resolve(preference) {
    if (preference === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return preference;
  }

  function apply(preference) {
    document.documentElement.dataset.theme = resolve(preference);
    btn.textContent = labels[preference];
    // Redraw the graph if it's currently visible, so its canvas colors update too.
    if (window.__plotGraphOnShow) {
      const graphView = document.getElementById('calc-graph-view');
      if (graphView && graphView.style.display !== 'none') {
        window.__plotGraphOnShow();
      }
    }
  }

  btn.addEventListener('click', () => {
    const current = currentPreference();
    const next = modes[(modes.indexOf(current) + 1) % modes.length];
    localStorage.setItem('theme-preference', next);
    apply(next);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentPreference() === 'system') apply('system');
  });

  apply(currentPreference());
}
