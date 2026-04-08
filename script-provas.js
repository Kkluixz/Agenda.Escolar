document.addEventListener('DOMContentLoaded', function() {
  const BASE_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQFotZZrG8z6WYqxjJr7waVl6AgUpPKT0nDYUBk3pjbAciTARKnHgQZEFVdy03Rq_1U1iVTHwx5N2t/pub?output=csv&gid=0';
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
            td.textContent = cell.trim();
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
      .catch(error => console.error('Error fetching table:', error));
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

function calculatePending(table) {
  const rows = table.querySelectorAll('tr');
  if (rows.length < 2) return;

  const headers = rows[0].querySelectorAll('td, th');
  let dateIndex = -1;
  headers.forEach((header, index) => {
    if (header.textContent.trim().toLowerCase() === 'data') {
      dateIndex = index;
    }
  });

  if (dateIndex === -1) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let count = 0;

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td, th');
    if (cells.length > dateIndex) {
      const dateText = cells[dateIndex].textContent.trim();
      const parts = dateText.split('/');
      if (parts.length === 2) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = today.getFullYear();
        const date = new Date(year, month, day);
        if (date >= today) {
          count++;
        }
      }
    }
  }

  document.getElementById('pending-text').textContent = `Provas ainda pendentes: ${count}`;
}
