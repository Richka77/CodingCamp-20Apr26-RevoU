/* =============================================
   LIFE DASHBOARD — app.js
   Features: Clock, Custom Name, Focus Timer,
   To-Do List, Calendar + Deadlines, Quick Links,
   Light/Dark mode
============================================= */

// ─── THEME ───────────────────────────────────
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const toggleIcon  = themeToggle.querySelector('.toggle-icon');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  toggleIcon.textContent = theme === 'dark' ? '☀' : '☾';
  localStorage.setItem('theme', theme);
}
themeToggle.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});
applyTheme(localStorage.getItem('theme') || 'dark');


// ─── CLOCK & GREETING ────────────────────────
const timeDisplay   = document.getElementById('timeDisplay');
const dateDisplay   = document.getElementById('dateDisplay');
const greetingText  = document.getElementById('greetingText');
const userNameDisplay = document.getElementById('userNameDisplay');

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function pad(n) { return String(n).padStart(2, '0'); }

function getGreeting(h) {
  if (h >= 5  && h < 12) return 'Good Morning';
  if (h >= 12 && h < 17) return 'Good Afternoon';
  if (h >= 17 && h < 21) return 'Good Evening';
  return 'Good Night';
}

function updateClock() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
  timeDisplay.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  dateDisplay.textContent = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  greetingText.textContent = getGreeting(h);
}
setInterval(updateClock, 1000);
updateClock();


// ─── CUSTOM NAME ─────────────────────────────
const nameInput    = document.getElementById('nameInput');
const saveNameBtn  = document.getElementById('saveNameBtn');
const editNameBtn  = document.getElementById('editNameBtn');
const nameEditArea = document.getElementById('nameEditArea');

function loadName() {
  const name = localStorage.getItem('userName');
  userNameDisplay.textContent = name ? name : '';
  editNameBtn.textContent = name ? '✎ edit name' : '✎ set name';
}
editNameBtn.addEventListener('click', () => {
  nameEditArea.classList.toggle('visible');
  if (nameEditArea.classList.contains('visible')) {
    nameInput.value = localStorage.getItem('userName') || '';
    nameInput.focus();
  }
});
saveNameBtn.addEventListener('click', saveName);
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); });
function saveName() {
  const val = nameInput.value.trim();
  val ? localStorage.setItem('userName', val) : localStorage.removeItem('userName');
  nameEditArea.classList.remove('visible');
  loadName();
}
loadName();


// ─── FOCUS TIMER ─────────────────────────────
const timerDisplay     = document.getElementById('timerDisplay');
const timerModeLabel   = document.getElementById('timerModeLabel');
const startBtn         = document.getElementById('startBtn');
const stopBtn          = document.getElementById('stopBtn');
const resetBtn         = document.getElementById('resetBtn');
const customMinutesInput = document.getElementById('customMinutes');
const applyDurationBtn = document.getElementById('applyDurationBtn');

let timerDuration = parseInt(localStorage.getItem('pomodoroDuration') || '25', 10);
let timerSeconds  = timerDuration * 60;
let timerInterval = null;
let timerRunning  = false;

customMinutesInput.value = timerDuration;

function updateTimerDisplay() {
  timerDisplay.textContent = `${pad(Math.floor(timerSeconds / 60))}:${pad(timerSeconds % 60)}`;
}
function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    if (timerSeconds <= 0) {
      clearInterval(timerInterval); timerRunning = false;
      timerDisplay.textContent = '00:00';
      timerModeLabel.textContent = '✓ Done!';
      if ('Notification' in window && Notification.permission === 'granted')
        new Notification('Focus session complete! 🎉');
      return;
    }
    timerSeconds--;
    updateTimerDisplay();
  }, 1000);
}
function stopTimer()  { clearInterval(timerInterval); timerRunning = false; }
function resetTimer() {
  stopTimer();
  timerSeconds = timerDuration * 60;
  timerModeLabel.textContent = 'Pomodoro';
  updateTimerDisplay();
}
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);
applyDurationBtn.addEventListener('click', () => {
  const val = parseInt(customMinutesInput.value, 10);
  if (isNaN(val) || val < 1 || val > 120) { alert('Enter a value between 1–120 min.'); return; }
  timerDuration = val;
  localStorage.setItem('pomodoroDuration', val);
  timerModeLabel.textContent = `Custom (${val} min)`;
  resetTimer();
});
updateTimerDisplay();
if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();


// ─── TO-DO LIST ───────────────────────────────
const taskInput  = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList   = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const sortSelect = document.getElementById('sortSelect');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
function saveTasks() { localStorage.setItem('tasks', JSON.stringify(tasks)); }

function getSorted() {
  const m = sortSelect.value, c = [...tasks];
  if (m === 'az') return c.sort((a,b) => a.text.localeCompare(b.text));
  if (m === 'za') return c.sort((a,b) => b.text.localeCompare(a.text));
  if (m === 'done-last')  return c.sort((a,b) => Number(a.done) - Number(b.done));
  if (m === 'done-first') return c.sort((a,b) => Number(b.done) - Number(a.done));
  return c;
}

function renderTasks() {
  taskList.innerHTML = '';
  const sorted = getSorted();
  emptyState.style.display = sorted.length === 0 ? 'block' : 'none';
  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = task.done;
    cb.addEventListener('change', () => {
      tasks = tasks.map(t => t.id === task.id ? {...t, done: !t.done} : t);
      saveTasks(); renderTasks();
    });

    const span = document.createElement('span');
    span.className = 'task-text'; span.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit'; editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editTask(task.id, span));

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger'; delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => { tasks = tasks.filter(t => t.id !== task.id); saveTasks(); renderTasks(); });

    actions.append(editBtn, delBtn);
    li.append(cb, span, actions);
    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim(); if (!text) return;
  if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) {
    taskInput.style.borderColor = 'var(--accent2)';
    taskInput.placeholder = 'Already exists!';
    setTimeout(() => { taskInput.style.borderColor = ''; taskInput.placeholder = 'Add a new task…'; }, 1500);
    return;
  }
  tasks.push({ id: Date.now(), text, done: false });
  saveTasks(); renderTasks(); taskInput.value = ''; taskInput.focus();
}

function editTask(id, spanEl) {
  const task = tasks.find(t => t.id === id); if (!task) return;
  const input = document.createElement('input');
  input.type = 'text'; input.className = 'task-text editing'; input.value = task.text;
  spanEl.replaceWith(input); input.focus();
  function commit() {
    const val = input.value.trim();
    if (val) { tasks = tasks.map(t => t.id === id ? {...t, text: val} : t); saveTasks(); }
    renderTasks();
  }
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); if (e.key === 'Escape') renderTasks(); });
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
sortSelect.addEventListener('change', renderTasks);
renderTasks();


// ─── CALENDAR & DEADLINES ────────────────────
const calGrid         = document.getElementById('calGrid');
const calMonthLabel   = document.getElementById('calMonthLabel');
const prevMonthBtn    = document.getElementById('prevMonth');
const nextMonthBtn    = document.getElementById('nextMonth');
const deadlineTitleIn = document.getElementById('deadlineTitle');
const deadlineDateIn  = document.getElementById('deadlineDate');
const addDeadlineBtn  = document.getElementById('addDeadlineBtn');
const deadlineList    = document.getElementById('deadlineList');
const emptyDeadlines  = document.getElementById('emptyDeadlines');
const dayPopupOverlay = document.getElementById('dayPopupOverlay');
const dayPopupTitle   = document.getElementById('dayPopupTitle');
const dayPopupList    = document.getElementById('dayPopupList');
const dayPopupEmpty   = document.getElementById('dayPopupEmpty');
const dayPopupClose   = document.getElementById('dayPopupClose');

let deadlines = JSON.parse(localStorage.getItem('deadlines') || '[]');
let calYear, calMonth;

function saveDeadlines() { localStorage.setItem('deadlines', JSON.stringify(deadlines)); }

// Format: YYYY-MM-DD
function toDateStr(date) {
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}
function todayStr() { return toDateStr(new Date()); }

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / (1000*60*60*24));
}

function getBadge(diff) {
  if (diff < 0)  return { label: 'Overdue',  cls: 'badge-overdue' };
  if (diff === 0) return { label: 'Today!',   cls: 'badge-today' };
  if (diff <= 3) return { label: `${diff}d`,  cls: 'badge-soon' };
  return              { label: `${diff}d`,  cls: 'badge-ok' };
}

function buildDeadlineItem(dl, forPopup = false) {
  const diff = daysUntil(dl.date);
  const badge = getBadge(diff);
  const li = document.createElement('li');
  li.className = 'deadline-item' + (diff < 0 ? ' overdue' : diff === 0 ? ' today-deadline' : '');

  const badgeEl = document.createElement('span');
  badgeEl.className = `deadline-badge ${badge.cls}`;
  badgeEl.textContent = badge.label;

  const info = document.createElement('div');
  info.className = 'deadline-info';

  const name = document.createElement('div');
  name.className = 'deadline-name'; name.textContent = dl.title;

  const dateEl = document.createElement('div');
  dateEl.className = 'deadline-date-text';
  const d = new Date(dl.date + 'T00:00:00');
  dateEl.textContent = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;

  info.append(name, dateEl);
  li.append(badgeEl, info);

  if (!forPopup) {
    const del = document.createElement('button');
    del.className = 'deadline-del'; del.textContent = '✕'; del.title = 'Remove';
    del.addEventListener('click', () => {
      deadlines = deadlines.filter(x => x.id !== dl.id);
      saveDeadlines(); renderDeadlineList(); renderCalendar();
    });
    li.appendChild(del);
  }
  return li;
}

function renderDeadlineList() {
  deadlineList.innerHTML = '';
  // Sort by date ascending
  const sorted = [...deadlines].sort((a,b) => a.date.localeCompare(b.date));
  emptyDeadlines.style.display = sorted.length === 0 ? 'block' : 'none';
  sorted.forEach(dl => deadlineList.appendChild(buildDeadlineItem(dl)));
}

function renderCalendar() {
  const now = new Date();
  if (calYear === undefined) { calYear = now.getFullYear(); calMonth = now.getMonth(); }

  calMonthLabel.textContent = `${MONTHS[calMonth]} ${calYear}`;
  calGrid.innerHTML = '';

  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = todayStr();

  // Build a map: date -> deadlines[]
  const dlMap = {};
  deadlines.forEach(dl => {
    if (!dlMap[dl.date]) dlMap[dl.date] = [];
    dlMap[dl.date].push(dl);
  });

  // Empty cells before 1st
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-cell empty';
    calGrid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${pad(calMonth+1)}-${pad(d)}`;
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    if (dateStr === today) cell.classList.add('today');
    if (dlMap[dateStr]) cell.classList.add('has-deadline');

    const numSpan = document.createElement('span');
    numSpan.textContent = d;
    cell.appendChild(numSpan);

    // Dots for deadlines
    if (dlMap[dateStr]) {
      const dots = document.createElement('div');
      dots.className = 'cal-dots';
      const count = Math.min(dlMap[dateStr].length, 4);
      for (let k = 0; k < count; k++) {
        const dot = document.createElement('span');
        dot.className = 'cal-dot';
        dots.appendChild(dot);
      }
      cell.appendChild(dots);

      cell.addEventListener('click', () => openDayPopup(dateStr, dlMap[dateStr]));
    }

    calGrid.appendChild(cell);
  }
}

function openDayPopup(dateStr, dls) {
  const d = new Date(dateStr + 'T00:00:00');
  dayPopupTitle.textContent = `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  dayPopupList.innerHTML = '';
  dayPopupEmpty.style.display = dls.length === 0 ? 'block' : 'none';
  dls.forEach(dl => dayPopupList.appendChild(buildDeadlineItem(dl, true)));
  dayPopupOverlay.classList.remove('hidden');
}

dayPopupClose.addEventListener('click', () => dayPopupOverlay.classList.add('hidden'));
dayPopupOverlay.addEventListener('click', e => { if (e.target === dayPopupOverlay) dayPopupOverlay.classList.add('hidden'); });

prevMonthBtn.addEventListener('click', () => {
  calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});
nextMonthBtn.addEventListener('click', () => {
  calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

// Set today's date as default for date input
deadlineDateIn.value = todayStr();
// Set min date to today
deadlineDateIn.min = todayStr();

function addDeadline() {
  const title = deadlineTitleIn.value.trim();
  const date  = deadlineDateIn.value;
  if (!title) { deadlineTitleIn.focus(); return; }
  if (!date)  { deadlineDateIn.focus(); return; }

  deadlines.push({ id: Date.now(), title, date });
  saveDeadlines();
  renderDeadlineList();
  renderCalendar();
  deadlineTitleIn.value = '';
  deadlineDateIn.value = todayStr();
  deadlineTitleIn.focus();
}

addDeadlineBtn.addEventListener('click', addDeadline);
deadlineTitleIn.addEventListener('keydown', e => { if (e.key === 'Enter') addDeadline(); });
deadlineDateIn.addEventListener('keydown', e => { if (e.key === 'Enter') addDeadline(); });

renderDeadlineList();
renderCalendar();


// ─── QUICK LINKS ─────────────────────────────
const linkNameInput = document.getElementById('linkNameInput');
const linkUrlInput  = document.getElementById('linkUrlInput');
const addLinkBtn    = document.getElementById('addLinkBtn');
const linksGrid     = document.getElementById('linksGrid');
const emptyLinks    = document.getElementById('emptyLinks');

let links = JSON.parse(localStorage.getItem('quickLinks') || '[]');
function saveLinks() { localStorage.setItem('quickLinks', JSON.stringify(links)); }

function renderLinks() {
  linksGrid.innerHTML = '';
  emptyLinks.style.display = links.length === 0 ? 'block' : 'none';
  links.forEach(link => {
    const wrap = document.createElement('div'); wrap.className = 'link-btn-wrap';
    const a = document.createElement('a');
    a.className = 'link-btn'; a.textContent = link.name;
    a.href = link.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    const rem = document.createElement('button'); rem.className = 'link-remove'; rem.textContent = '✕';
    rem.addEventListener('click', () => { links = links.filter(l => l.id !== link.id); saveLinks(); renderLinks(); });
    wrap.append(a, rem); linksGrid.appendChild(wrap);
  });
}

function addLink() {
  const name = linkNameInput.value.trim(); let url = linkUrlInput.value.trim();
  if (!name || !url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  links.push({ id: Date.now(), name, url }); saveLinks(); renderLinks();
  linkNameInput.value = ''; linkUrlInput.value = ''; linkNameInput.focus();
}
addLinkBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });
renderLinks();
