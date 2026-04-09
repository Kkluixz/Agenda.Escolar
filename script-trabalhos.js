document.addEventListener('DOMContentLoaded', function() {
  const BASE_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwSwM184YoSOYWPyfVY-9Y7cHK1IE6-eH6-LEK-IAO8FtI3qf3dBxYtVAtY_EYd-TfU7LPg0ybqzvD/pub?output=csv&gid=220168663';
  const POLL_MS = 30_000;
  let fetchId = 0;

  function loadSheet() {
    const id = ++fetchId;
    const url = BASE_URL + '&_=' + Date.now();
    fetch(url, { cache: 'no-store' })
      .then(response => response.text())
      .then(csv => {
        if (id !== fetchId) return;
        const rows = csv.trim().split('\n').map(line =>
          line.split(',').map(cell => {
            cell = cell.trim();
            if (cell.startsWith('"') && cell.endsWith('"')) {
              cell = cell.slice(1, -1);
            }
            return cell;
          })
        );
        const table = document.createElement('table');
        rows.forEach((row, i) => {
          const tr = document.createElement('tr');
          row.forEach(cell => {
            const td = document.createElement(i === 0 ? 'th' : 'td');
            td.textContent = cell;
            tr.appendChild(td);
          });
          table.appendChild(tr);
        });
        const container = document.getElementById('table-container');
        container.innerHTML = '';
        container.appendChild(table);
        calculatePending(table);
        touchUpdated();
      })
      .catch(error => console.error('Error fetching trabalhos table:', error));
  }

  function touchUpdated() {
    const el = document.getElementById('sheet-updated');
    if (!el) return;
    const t = new Date();
    el.textContent =
      'Atualizado às ' +
      t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      ' · próxima verificação em ~' +
      Math.round(POLL_MS / 1000) +
      ' s';
  }

  loadSheet();
  setInterval(loadSheet, POLL_MS);
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) loadSheet();
  });
});

function normalizeCellText(s) {
  return s
    .trim()
    .toLowerCase()
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function findStatusColumnIndex(headerCells) {
  const names = ['status', 'situacao', 'estado'];
  let idx = -1;
  headerCells.forEach((header, index) => {
    const h = normalizeCellText(header.textContent);
    if (names.includes(h)) idx = index;
  });
  return idx;
}

function calculatePending(table) {
  const rows = table.querySelectorAll('tr');
  const pendingEl = document.getElementById('pending-text');
  if (rows.length < 2 || !pendingEl) return;

  const headers = rows[0].querySelectorAll('td, th');
  let statusIndex = findStatusColumnIndex(headers);

  function rowCells(i) {
    return rows[i].querySelectorAll('td, th');
  }

  function isExpirado(text) {
    const v = normalizeCellText(text);
    return v.includes('expirado');
  }

  function isPendente(text) {
    return normalizeCellText(text) === 'pendente';
  }

  if (statusIndex === -1) {
    for (let j = 0; j < headers.length; j++) {
      let hits = 0;
      for (let i = 1; i < rows.length; i++) {
        const cells = rowCells(i);
        if (cells.length > j && isPendente(cells[j].textContent)) hits++;
      }
      if (hits > 0) {
        statusIndex = j;
        break;
      }
    }
  }

  if (statusIndex === -1) {
    pendingEl.textContent = 'Trabalhos ainda pendentes: — (coluna Status não encontrada)';
    return;
  }

  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const cells = rowCells(i);
    if (cells.length <= statusIndex) continue;
    const statusText = cells[statusIndex].textContent;
    if (isExpirado(statusText)) continue;
    if (isPendente(statusText)) count++;
  }

  pendingEl.innerHTML =
    'Trabalhos ainda pendentes: <span class="pending-banner__count">' + count + '</span>';
}
