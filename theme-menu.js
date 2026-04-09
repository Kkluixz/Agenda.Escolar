(function () {
  var STORAGE_KEY = 'site-theme';
  var THEMES = [
    { id: 'amarelo', label: 'Amarelo' },
    { id: 'rosa', label: 'Rosa' },
    { id: 'azul', label: 'Azul' },
    { id: 'verde', label: 'Verde' },
    { id: 'lilas', label: 'Lilás' },
    { id: 'vermelho', label: 'Vermelho' },
    { id: 'branco', label: 'Branco' },
    { id: 'preto', label: 'Preto' }
  ];

  function applyTheme(id) {
    var html = document.documentElement;
    if (id === 'amarelo') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', id);
    }
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (e) {}
    updateActiveButtons(id);
  }

  function getCurrentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    return t || 'amarelo';
  }

  function updateActiveButtons(activeId) {
    var buttons = document.querySelectorAll('.theme-picker__btn');
    buttons.forEach(function (btn) {
      var isOn = btn.getAttribute('data-theme-id') === activeId;
      btn.classList.toggle('is-active', isOn);
      btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
    });
  }

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'theme-picker';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Tema de cores do site');

    var title = document.createElement('span');
    title.className = 'theme-picker__title';
    title.textContent = 'Tema';
    wrap.appendChild(title);

    var grid = document.createElement('div');
    grid.className = 'theme-picker__grid';

    THEMES.forEach(function (t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-picker__btn theme-picker__btn--' + t.id;
      btn.setAttribute('data-theme-id', t.id);
      btn.setAttribute('title', t.label);
      btn.setAttribute('aria-label', 'Tema ' + t.label);
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        applyTheme(t.id);
      });
      grid.appendChild(btn);
    });

    wrap.appendChild(grid);
    document.body.appendChild(wrap);
    updateActiveButtons(getCurrentTheme());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
