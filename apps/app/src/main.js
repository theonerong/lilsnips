// ============================================================
// Lil Snips — R1 Creation Plugin
// ============================================================

// ---- IndexedDB Storage ----

const DB_NAME = 'lilsnips';
const DB_VERSION = 3;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('folders')) db.createObjectStore('folders', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('snips')) {
        const s = db.createObjectStore('snips', { keyPath: 'id' });
        s.createIndex('folderId', 'folderId', { unique: false });
      }
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
      if (!db.objectStoreNames.contains('images')) {
        const s = db.createObjectStore('images', { keyPath: 'id' });
        s.createIndex('folderId', 'folderId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbOp(store, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const r = fn(tx.objectStore(store));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
const dbGet = (s, k) => dbOp(s, 'readonly', st => st.get(k));
const dbGetAll = (s) => dbOp(s, 'readonly', st => st.getAll());
const dbPut = (s, v) => dbOp(s, 'readwrite', st => st.put(v));
const dbDelete = (s, k) => dbOp(s, 'readwrite', st => st.delete(k));

// ---- Default Settings ----

const DEFAULT_SETTINGS = { theme: 'default', textScale: 100, describePrompt: "describe what you see in this image in as much detail as possible, including any readable text, and do not mention anything that isn't there and do not ask any followup questions, your response will be used as a caption for the image. " };
const DEFAULT_FOLDER_SETTINGS = {
  useLLM: true, useSerpAPI: false, wantsR1Response: true,
  wantsJournalEntry: false, checkboxesEnabled: false, collapsedView: false
};

async function loadSettings() {
  const row = await dbGet('settings', 'appSettings');
  return row ? { ...DEFAULT_SETTINGS, ...row.value } : { ...DEFAULT_SETTINGS };
}
async function saveSettings(s) { await dbPut('settings', { key: 'appSettings', value: s }); }

// ---- Themes ----

const THEMES = [
  { id: 'default',   name: 'R1 Orange',    bg: '#000', fg: '#fff', accent: '#FE5F00', card: '#1a1a1a', border: '#333' },
  { id: 'midnight',  name: 'Midnight Blue', bg: '#0a0e1a', fg: '#e0e6f0', accent: '#4a90d9', card: '#131a2e', border: '#253352' },
  { id: 'cyberpunk', name: 'Cyberpunk',     bg: '#0d0015', fg: '#e0d0ff', accent: '#ff00ff', card: '#1a0030', border: '#4a0066' },
  { id: 'forest',    name: 'Forest',        bg: '#071207', fg: '#d0f0d0', accent: '#2ecc71', card: '#0f1f0f', border: '#1e3e1e' },
  { id: 'sunset',    name: 'Sunset',        bg: '#1a0a05', fg: '#ffe0c0', accent: '#ff6b35', card: '#2a1208', border: '#4a2010' },
  { id: 'arctic',    name: 'Arctic',        bg: '#f0f4f8', fg: '#1a2a3a', accent: '#0077b6', card: '#fff', border: '#c0d0e0' },
  { id: 'cherry',    name: 'Cherry',        bg: '#150008', fg: '#ffd0dd', accent: '#e63956', card: '#250010', border: '#450020' },
  { id: 'gold',      name: 'Gold Rush',     bg: '#0f0d05', fg: '#f0e8d0', accent: '#d4a017', card: '#1a1808', border: '#3a3210' },
  { id: 'terminal',  name: 'Terminal',      bg: '#000', fg: '#0f0', accent: '#0f0', card: '#0a0a0a', border: '#030' },
  { id: 'lavender',  name: 'Lavender',      bg: '#0e0a14', fg: '#e8ddf0', accent: '#9b59b6', card: '#1a1224', border: '#2e1e40' }
];

function applyTheme(id) {
  const t = THEMES.find(x => x.id === id) || THEMES[0];
  const r = document.documentElement.style;
  r.setProperty('--bg', t.bg); r.setProperty('--fg', t.fg);
  r.setProperty('--accent', t.accent); r.setProperty('--card', t.card);
  r.setProperty('--card-border', t.border);
}
function applyTextScale(v) { document.documentElement.style.setProperty('--text-scale', (v / 100).toString()); }

// ---- App State ----

let state = {
  screen: 'home', folders: [], snips: [], images: [],
  currentFolderId: null, settings: { ...DEFAULT_SETTINGS },
  editTarget: null, isRecording: false, statusMsg: '',
  lastAgentResponse: null,
  selectedSnipIds: [],
  pendingDescribeImageId: null,
  cameraActive: false, cameraPreviewData: null, cameraStream: null
};
let activeTextarea = null;

// ---- Helpers ----

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function $(sel) { return document.querySelector(sel); }
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function trunc(s, l) { return !s ? '' : s.length > l ? s.slice(0, l) + '…' : s; }
function pad(n) { return n < 10 ? '0' + n : '' + n; }

function getFolderSettings(f) {
  return f && f.agentSettings ? { ...DEFAULT_FOLDER_SETTINGS, ...f.agentSettings } : { ...DEFAULT_FOLDER_SETTINGS };
}
function getActiveFolderSettings() {
  const f = state.folders.find(x => x.id === state.currentFolderId);
  return getFolderSettings(f);
}

// ============================================================
// Camera — via navigator.mediaDevices.getUserMedia
// ============================================================
// The creations-sdk uses standard mobile web APIs for camera access.
// R1 is an Android device, so the rear camera is available via:
//   navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
//
// Key differences from PluginMessageHandler approach:
//   - getUserMedia is the native browser API — no Flutter bridge message needed
//   - Video preview is an HTML <video> element (not base64 image frames)
//   - Capture is a canvas drawImage from the video frame
//   - PTT is locked locally while camera is active (no server call needed)

let cameraStream = null;   // MediaStream from getUserMedia
let captureCanvas = null;  // OffscreenCanvas for frame capture
let captureCtx = null;

function startCamera() {
  state.cameraActive = true;
  state.cameraPreviewData = null;
  render();

  // Check getUserMedia support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showStatus('Camera not supported');
    stopCamera();
    return;
  }

  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: 'environment' },  // rear camera on mobile
      width: { ideal: 640 },
      height: { ideal: 480 }
    },
    audio: false
  }).then(stream => {
    cameraStream = stream;
    // Store stream on state so renderCamera can attach it to the <video>
    state.cameraStream = stream;
    showStatus('Camera active');
    render();
  }).catch(err => {
    console.error('Camera error:', err);
    showStatus('Camera denied');
    stopCamera();
  });
}

function captureCamera() {
  if (!state.cameraActive || !cameraStream) return;

  // Create a one-off canvas capture from the live video
  const video = document.querySelector('#cameraVideo');
  if (!video || video.readyState < 2) {
    showStatus('Not ready');
    return;
  }

  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) {
    showStatus('No video frame');
    return;
  }

  // Use an offscreen canvas sized to the video frame
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  state.cameraActive = false;

  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  state.cameraStream = null;

  saveImage(dataUrl);
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  state.cameraStream = null;
  state.cameraActive = false;
  state.cameraPreviewData = null;
  render();
}

async function saveImage(dataUrl, caption) {
  const img = {
    id: uid(), name: 'Photo ' + new Date().toLocaleTimeString(),
    dataUrl, folderId: state.currentFolderId || null,
    caption: caption || '', createdAt: Date.now()
  };
  state.images.push(img);
  await dbPut('images', img);
  showStatus('Photo saved');
}

// ---- Double-press PTT detection ----
// Single PTT in normal mode: context action (save edit, go back)
// Double PTT in normal mode: open camera
// Single PTT in camera mode: capture photo
// Double PTT in camera mode: exit camera without capturing

let lastPttTime = 0;
let pttTimer = null;
const DOUBLE_TAP_MS = 400;

function handleSideClick() {
  const now = Date.now();
  const elapsed = now - lastPttTime;
  lastPttTime = now;

  if (pttTimer) { clearTimeout(pttTimer); pttTimer = null; }

  if (elapsed < DOUBLE_TAP_MS) {
    // ---- DOUBLE PRESS ----
    lastPttTime = 0;
    if (state.cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
    return;
  }

  // Wait to see if a second press follows
  pttTimer = setTimeout(() => {
    pttTimer = null;
    // ---- SINGLE PRESS ----
    if (state.cameraActive) {
      captureCamera();
    } else {
      handleSinglePtt();
    }
  }, DOUBLE_TAP_MS);
}

function handleSinglePtt() {
  if (state.screen === 'editModal') {
    saveEdit();
  } else if (state.screen === 'folderSettings') {
    state.screen = 'folder'; render();
  } else if (state.screen === 'settings' || state.screen === 'themeSelect') {
    state.screen = 'home'; render();
  } else if (state.screen === 'folder') {
    state.screen = 'home'; state.currentFolderId = null; render();
  }
}

window.addEventListener('sideClick', handleSideClick);

// Keyboard shortcut: Space simulates sideClick in dev
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !activeTextarea) { e.preventDefault(); handleSideClick(); }
});

// ============================================================
// STT via Long Press
// ============================================================

window.addEventListener('longPressStart', () => {
  if (state.cameraActive) return;
  state.isRecording = true; render();
  if (typeof CreationVoiceHandler !== 'undefined') CreationVoiceHandler.postMessage('start');
});

window.addEventListener('longPressEnd', () => {
  if (state.cameraActive) return;
  state.isRecording = false; render();
  if (typeof CreationVoiceHandler !== 'undefined') CreationVoiceHandler.postMessage('stop');
});

// ============================================================
// Plugin Message Handler — Incoming
// ============================================================

window.onPluginMessage = async function(data) {
  // STT result
  if (data.type === 'sttEnded' && data.transcript) {
    const text = data.transcript.trim();
    if (!text) return;
    if (activeTextarea) {
      const ta = activeTextarea;
      const s = ta.selectionStart, e = ta.selectionEnd;
      ta.value = ta.value.substring(0, s) + text + ta.value.substring(e);
      ta.selectionStart = ta.selectionEnd = s + text.length;
      ta.focus(); return;
    }
    const snip = { id: uid(), text, folderId: state.currentFolderId || null, checked: false, createdAt: Date.now(), updatedAt: Date.now() };
    state.snips.push(snip); await dbPut('snips', snip);
    showStatus('Snip created'); return;
  }

  // Describe image response — save as caption
  if (state.pendingDescribeImageId) {
    const resp = typeof data.data === 'string' ? data.data : (data.message || '');
    console.log('[DEBUG] describe response:', JSON.stringify(data).slice(0, 300), '| resp:', (resp||'').slice(0,100));
    if (resp && resp.trim()) {
      const im = state.images.find(x => x.id === state.pendingDescribeImageId);
      if (im) {
        im.caption = resp.trim();
        im.name = resp.trim();
        dbPut('images', im).then(() => {
          state.pendingDescribeImageId = null;
          // Signal caption saved back to the overlay if still open
          if (window._describeCallback) { window._describeCallback(resp.trim()); window._describeCallback = null; }
          else { showStatus('Caption saved'); render(); }
        });
      } else { state.pendingDescribeImageId = null; }
    } else { state.pendingDescribeImageId = null; }
    return;
  }

  // Agent response
  if (data.data || data.message) {
    const resp = typeof data.data === 'string' ? data.data : (data.message || '');
    if (resp) { state.lastAgentResponse = resp; showStatus('Response received'); }
  }
};

// ============================================================
// Scroll Wheel
// ============================================================

window.addEventListener('scrollUp', () => { const a = $('.scroll-area'); if (a) a.scrollTop -= 60; });
window.addEventListener('scrollDown', () => { const a = $('.scroll-area'); if (a) a.scrollTop += 60; });

// ============================================================
// Render
// ============================================================

function render() {
  const app = $('#app');
  if (!app) return;
  if (state.cameraActive) { renderCamera(app); return; }
  switch (state.screen) {
    case 'home':           renderHome(app); break;
    case 'folder':         renderFolder(app); break;
    case 'folderSettings': renderFolderSettings(app); break;
    case 'settings':       renderAppSettings(app); break;
    case 'themeSelect':    renderThemeSelect(app); break;
    case 'editModal':      renderEditModal(app); break;
    default: renderHome(app);
  }
}

// ---- Camera Screen ----

function renderCamera(app) {
  // Attach the live MediaStream to the <video> element once it's in the DOM
  if (state.cameraStream) {
    // Small delay to ensure the video element exists before setting srcObject
    setTimeout(() => {
      const vid = document.querySelector('#cameraVideo');
      if (vid && !vid.srcObject) {
        vid.srcObject = state.cameraStream;
        vid.play().catch(() => {});
      }
    }, 10);
  }

  app.innerHTML = `
    <div class="camera-screen">
      <video id="cameraVideo"
        autoplay
        playsinline
        muted
        style="width:100%;height:100%;object-fit:cover;background:#000">
      </video>
      <div class="camera-hud">
        <div class="camera-hint">PTT: Capture &nbsp;|&nbsp; 2×PTT: Exit</div>
      </div>
    </div>`;
}

// ---- Home ----

function renderHome(app) {
  const unfiled = state.snips.filter(n => !n.folderId);
  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <span class="header-title">✂️ Lil Snips</span>
        <button class="icon-btn" id="btnSettings">⚙</button>
      </div>
      <div class="scroll-area" id="homeList">
        ${state.folders.length === 0 && unfiled.length === 0
          ? '<div class="empty-msg">Hold PTT to dictate a snip<br>Double-press PTT for camera<br>or tap + to add a folder</div>' : ''}
        ${state.folders.map(f => `
          <div class="list-item folder-item" data-id="${f.id}">
            <span class="item-icon">📁</span>
            <span class="item-text">${esc(trunc(f.name, 22))}</span>
            <span class="item-count">${state.snips.filter(n => n.folderId === f.id).length + state.images.filter(im => im.folderId === f.id).length}</span>
          </div>`).join('')}
        ${unfiled.map(n => `
          <div class="list-item snip-item" data-id="${n.id}">
            <span class="item-icon">📄</span>
            <span class="item-text">${esc(trunc(n.text, 25))}</span>
          </div>`).join('')}
      </div>
      <div class="toolbar">
        <button class="tool-btn" id="btnAddFolder">+ Folder</button>
        <button class="tool-btn" id="btnAddSnip">+ Snip</button>
      </div>
      ${state.isRecording ? '<div class="rec-pill">🎙 Recording…</div>' : ''}
      ${state.statusMsg ? '<div class="status-pill">' + esc(state.statusMsg) + '</div>' : ''}
    </div>`;
  $('#btnSettings')?.addEventListener('click', () => { state.screen = 'settings'; render(); });
  $('#btnAddFolder')?.addEventListener('click', addFolder);
  $('#btnAddSnip')?.addEventListener('click', () => addSnipManual());
  document.querySelectorAll('.folder-item').forEach(el => {
    el.addEventListener('click', () => openFolder(el.dataset.id));
    bindLongPress(el, () => startEdit('folder', el.dataset.id));
  });
  document.querySelectorAll('#homeList .snip-item').forEach(el => {
    el.addEventListener('click', () => sendSnip(el.dataset.id));
    bindLongPress(el, () => startEdit('snip', el.dataset.id));
  });
}

// ---- Folder ----

function renderFolder(app) {
  const folder = state.folders.find(f => f.id === state.currentFolderId);
  if (!folder) { state.screen = 'home'; render(); return; }
  const snips = state.snips.filter(n => n.folderId === folder.id);
  const imgs = state.images.filter(im => im.folderId === folder.id);
  const fs = getFolderSettings(folder);

  // Interleave snips and images by createdAt, assign sequential numbers
  const items = [...snips.map(n => ({ kind: 'snip', data: n, sortKey: n.createdAt })),
                 ...imgs.map(im => ({ kind: 'image', data: im, sortKey: im.createdAt }))]
    .sort((a, b) => a.sortKey - b.sortKey);

  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnBack">◀</button>
        <span class="header-title">${esc(trunc(folder.name, 14))}</span>
        <button class="icon-btn" id="btnFolderSettings">⚙</button>
      </div>
      ${folder.masterPrompt
        ? '<div class="master-prompt" id="mpEl"><span class="mp-label">Prompt:</span><span class="mp-text">' + esc(trunc(folder.masterPrompt, 40)) + '</span></div>'
        : '<div class="master-prompt add-mp" id="addMP"><span class="mp-label">+ Master Prompt</span></div>'}
      <div class="scroll-area" id="folderList">
        ${items.length === 0
          ? '<div class="empty-msg">Hold PTT to add a snip<br>Double-press PTT for photo</div>' : ''}
        ${items.map((item, idx) => {
          const num = pad(idx + 1);
          if (item.kind === 'snip') {
            const n = item.data;
            return `<div class="list-item snip-item${fs.collapsedView ? '' : ' snip-item--expanded'}${state.selectedSnipIds.includes(n.id) ? ' snip-item--selected' : ''}" data-id="${n.id}">
              ${fs.checkboxesEnabled ? '<label class="snip-cb" data-sid="' + n.id + '"><input type="checkbox" ' + (n.checked ? 'checked' : '') + '/><span class="cb-mark"></span></label>' : ''}
              <span class="item-icon">📄</span>
              <span class="item-num">${num}</span>
              <span class="item-text ${n.checked && fs.checkboxesEnabled ? 'checked-text' : ''}">${fs.collapsedView ? esc(trunc(n.text, 22)) : esc(n.text)}</span>
            </div>`;
          } else {
            const im = item.data;
            if (fs.collapsedView) {
              return `<div class="list-item img-item" data-id="${im.id}">
                <span class="item-icon">📷</span>
                <span class="item-num">${num}</span>
                <span class="item-text">${esc(trunc(im.caption || im.name || 'Photo', 22))}</span>
              </div>`;
            } else {
              return `<div class="list-item img-item img-item--thumb" data-id="${im.id}">
                <div class="thumb-row">
                  <span class="item-icon">📷</span>
                  <span class="item-num">${num}</span>
                </div>
                <div class="thumb-img-wrap"><img class="thumb-img" src="${im.dataUrl}" alt="photo"></div>
                <div class="thumb-caption">${esc(im.caption || im.name || '')}</div>
              </div>`;
            }
          }
        }).join('')}
      </div>
      <div class="toolbar">
        <button class="tool-btn" id="btnAddSnipF">+ Snip</button>
        <button class="tool-btn" id="btnSendAll">Send All</button>
        <button class="tool-btn" id="btnEmail">Email</button>
      </div>
      ${state.lastAgentResponse ? '<div class="agent-bar" id="agentBar"><span class="agent-lbl">Agent:</span><span class="agent-txt">' + esc(trunc(state.lastAgentResponse, 30)) + '</span><span class="agent-save">+ Save</span></div>' : ''}
      ${state.isRecording ? '<div class="rec-pill">🎙 Recording…</div>' : ''}
      ${state.statusMsg ? '<div class="status-pill">' + esc(state.statusMsg) + '</div>' : ''}
    </div>`;

  $('#btnBack')?.addEventListener('click', () => { state.screen = 'home'; state.currentFolderId = null; state.lastAgentResponse = null; state.selectedSnipIds = []; render(); });
  $('#btnFolderSettings')?.addEventListener('click', () => { state.screen = 'folderSettings'; render(); });
  $('#btnAddSnipF')?.addEventListener('click', () => addSnipManual(folder.id));
  $('#btnSendAll')?.addEventListener('click', () => {
    const sel = state.selectedSnipIds;
    if (sel.length > 0) {
      state.selectedSnipIds = [];
      sendSelectedSnips(sel, folder.id);
    } else {
      sendAllInFolder(folder.id);
    }
  });
  $('#btnEmail')?.addEventListener('click', () => emailFolder(folder.id));
  $('#mpEl')?.addEventListener('click', () => startEdit('masterPrompt', folder.id));
  $('#addMP')?.addEventListener('click', () => startEdit('masterPrompt', folder.id));
  $('#agentBar')?.addEventListener('click', captureAgentResponse);

  // Restore scroll position
  const restored = () => {
    const sa = $('#folderList');
    if (sa) sa.scrollTop = savedScrollTop;
  };
  setTimeout(restored, 0);

  document.querySelectorAll('#folderList .snip-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.snip-cb')) return;
      const sid = el.dataset.id;
      if (state.selectedSnipIds.includes(sid)) {
        state.selectedSnipIds = state.selectedSnipIds.filter(id => id !== sid);
      } else {
        state.selectedSnipIds = [...state.selectedSnipIds, sid];
      }
      render();
    });
    bindLongPress(el, () => startEdit('snip', el.dataset.id));
  });
  document.querySelectorAll('.snip-cb input').forEach(cb => {
    cb.addEventListener('change', async (e) => {
      e.stopPropagation();
      const sid = cb.closest('.snip-cb').dataset.sid;
      const snip = state.snips.find(n => n.id === sid);
      if (snip) { snip.checked = cb.checked; await dbPut('snips', snip); render(); }
    });
  });
  document.querySelectorAll('#folderList .img-item').forEach(el => {
    el.addEventListener('click', () => viewImage(el.dataset.id));
    bindLongPress(el, () => editImageCaption(el.dataset.id));
  });
}

// ---- Folder Settings ----

function renderFolderSettings(app) {
  const folder = state.folders.find(f => f.id === state.currentFolderId);
  if (!folder) { state.screen = 'home'; render(); return; }
  const fs = getFolderSettings(folder);

  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnBackFS">◀</button>
        <span class="header-title">Folder Settings</span>
      </div>
      <div class="scroll-area">
        <div class="section-lbl">${esc(trunc(folder.name, 20))}</div>
        <div class="setting-row"><span class="setting-lbl">Checkboxes</span><label class="toggle"><input type="checkbox" id="togCB" ${fs.checkboxesEnabled ? 'checked' : ''}><span class="slider"></span></label></div>
        <div class="setting-row"><span class="setting-lbl">Collapsed View</span><label class="toggle"><input type="checkbox" id="togCollapsed" ${fs.collapsedView ? 'checked' : ''}><span class="slider"></span></label></div>
        <div class="section-lbl">Agent Settings</div>
        <div class="setting-row"><span class="setting-lbl">Use LLM</span><label class="toggle"><input type="checkbox" id="togLLM" ${fs.useLLM ? 'checked' : ''}><span class="slider"></span></label></div>
        <div class="setting-row"><span class="setting-lbl">Use SerpAPI</span><label class="toggle"><input type="checkbox" id="togSerp" ${fs.useSerpAPI ? 'checked' : ''}><span class="slider"></span></label></div>
        <div class="setting-row"><span class="setting-lbl">R1 Voice</span><label class="toggle"><input type="checkbox" id="togR1" ${fs.wantsR1Response ? 'checked' : ''}><span class="slider"></span></label></div>
        <div class="setting-row"><span class="setting-lbl">Journal</span><label class="toggle"><input type="checkbox" id="togJournal" ${fs.wantsJournalEntry ? 'checked' : ''}><span class="slider"></span></label></div>
        <div class="setting-row"><button class="tool-btn danger-btn" id="btnDelFolder">🗑 Delete Folder</button></div>
      </div>
    </div>`;

  $('#btnBackFS')?.addEventListener('click', () => { state.screen = 'folder'; render(); });
  $('#btnDelFolder')?.addEventListener('click', () => deleteFolder(folder.id));
  const bind = (id, key) => {
    const el = $(`#${id}`);
    if (el) el.addEventListener('change', async () => {
      if (!folder.agentSettings) folder.agentSettings = { ...DEFAULT_FOLDER_SETTINGS };
      folder.agentSettings[key] = el.checked;
      await dbPut('folders', folder);
    });
  };
  bind('togCB', 'checkboxesEnabled');
  bind('togCollapsed', 'collapsedView');
  bind('togLLM', 'useLLM');
  bind('togSerp', 'useSerpAPI');
  bind('togR1', 'wantsR1Response');
  bind('togJournal', 'wantsJournalEntry');
}

// ---- App Settings ----

function renderAppSettings(app) {
  const s = state.settings;
  const sv = s.textScale || 100;
  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnBackS">◀</button>
        <span class="header-title">Settings</span>
      </div>
      <div class="scroll-area">
        <div class="setting-row"><span class="setting-lbl">Theme</span><button class="setting-btn" id="btnTheme">${(THEMES.find(t => t.id === s.theme) || THEMES[0]).name} ▶</button></div>
        <div class="setting-row"><span class="setting-lbl">Text Scale: ${sv}%</span>
          <div class="scale-ctrl"><button class="scale-btn" id="scDown">−</button><span class="scale-val">${sv}%</span><button class="scale-btn" id="scUp">+</button></div>
        </div>
        <div class="setting-row">
          <span class="setting-lbl">Describe Prompt</span>
          <button class="setting-btn" id="btnDescPrompt">Edit ▶</button>
        </div>
      </div>
    </div>`;
  $('#btnBackS')?.addEventListener('click', () => { state.screen = 'home'; render(); });
  $('#btnDescPrompt')?.addEventListener('click', () => {
    state.editTarget = { type: 'describePrompt' };
    state.screen = 'editModal'; render();
  });
  $('#btnTheme')?.addEventListener('click', () => { state.screen = 'themeSelect'; render(); });
  $('#scDown')?.addEventListener('click', async () => {
    state.settings.textScale = Math.max(100, (state.settings.textScale || 100) - 10);
    applyTextScale(state.settings.textScale); await saveSettings(state.settings); render();
  });
  $('#scUp')?.addEventListener('click', async () => {
    state.settings.textScale = Math.min(200, (state.settings.textScale || 100) + 10);
    applyTextScale(state.settings.textScale); await saveSettings(state.settings); render();
  });
}

// ---- Theme Select ----

function renderThemeSelect(app) {
  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnBackT">◀</button>
        <span class="header-title">Themes</span>
      </div>
      <div class="scroll-area">
        ${THEMES.map(t => `
          <div class="list-item theme-item ${state.settings.theme === t.id ? 'selected' : ''}" data-id="${t.id}">
            <span class="theme-sw" style="background:${t.accent}"></span>
            <span class="item-text">${esc(t.name)}</span>
            ${state.settings.theme === t.id ? '<span class="check">✓</span>' : ''}
          </div>`).join('')}
      </div>
    </div>`;
  $('#btnBackT')?.addEventListener('click', () => { state.screen = 'settings'; render(); });
  document.querySelectorAll('.theme-item').forEach(el => {
    el.addEventListener('click', async () => {
      state.settings.theme = el.dataset.id;
      applyTheme(el.dataset.id); await saveSettings(state.settings); render();
    });
  });
}

// ---- Edit Modal ----

function renderEditModal(app) {
  const et = state.editTarget;
  if (!et) { state.screen = 'home'; render(); return; }
  let txt = '', title = 'Edit';
  if (et.type === 'snip') { const n = state.snips.find(x => x.id === et.id); txt = n ? n.text : ''; title = 'Edit Snip'; }
  else if (et.type === 'imageCaption') { const im = state.images.find(x => x.id === et.id); txt = im ? (im.caption || '') : ''; title = 'Edit Caption'; }
  else if (et.type === 'folder') { const f = state.folders.find(x => x.id === et.id); txt = f ? f.name : ''; title = 'Edit Folder'; }
  else if (et.type === 'masterPrompt') { const f = state.folders.find(x => x.id === et.id); txt = f ? (f.masterPrompt || '') : ''; title = 'Master Prompt'; }
  else if (et.type === 'newSnip') { txt = ''; title = 'New Snip'; }
  else if (et.type === 'describePrompt') { txt = state.settings.describePrompt || DEFAULT_SETTINGS.describePrompt; title = 'Describe Prompt'; }

  app.innerHTML = `
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnCancelEdit">✕</button>
        <span class="header-title">${title}</span>
        <button class="icon-btn" id="btnSaveEdit">💾</button>
      </div>
      <div class="edit-area">
        ${et.type === 'imageCaption' ? '<div class="caption-hint">Describe this image…</div>' : ''}
        ${et.type === 'describePrompt' ? '<div class="caption-hint">Prompt sent to Rabbit when Describe is pressed</div>' : ''}
        <textarea id="editText" class="edit-ta" placeholder="${et.type === 'imageCaption' ? 'What does this image show?' : 'Type or hold PTT to dictate…'}">${esc(txt)}</textarea>
      </div>
      ${et.type === 'imageCaption' ? '<button class="del-btn" id="btnDelCaption">🗑 Delete Caption</button>' : ''}
      ${et.type === 'snip' ? '<button class="del-btn" id="btnDelSnip">Delete Snip</button>' : ''}
      ${state.isRecording ? '<div class="rec-pill">🎙 Dictating…</div>' : ''}
    </div>`;

  const ta = $('#editText');
  if (ta) {
    ta.focus(); activeTextarea = ta;
    ta.addEventListener('focus', () => { activeTextarea = ta; });
    ta.addEventListener('blur', () => { setTimeout(() => { if (activeTextarea === ta) activeTextarea = null; }, 200); });
  }
  $('#btnCancelEdit')?.addEventListener('click', goBackFromEdit);
  $('#btnSaveEdit')?.addEventListener('click', () => {
    const et = state.editTarget;
    if (et && et.type === 'imageCaption') saveImageCaption();
    else if (et && et.type === 'describePrompt') saveDescribePrompt();
    else saveEdit();
  });
  $('#btnDelSnip')?.addEventListener('click', deleteSnipFromEdit);
  $('#btnDelCaption')?.addEventListener('click', async () => {
    const et = state.editTarget;
    if (!et || et.type !== 'imageCaption') return;
    const im = state.images.find(x => x.id === et.id);
    if (im) { im.caption = ''; await dbPut('images', im); }
    activeTextarea = null; goBackFromEdit();
  });
}

function goBackFromEdit() {
  const et = state.editTarget;
  activeTextarea = null; state.editTarget = null;
  if (et && et.type === 'describePrompt') { state.screen = 'settings'; render(); return; }
  state.screen = (et && (et.type === 'masterPrompt' || et.type === 'newSnip') && state.currentFolderId) ? 'folder'
    : state.currentFolderId ? 'folder' : 'home';
  render();
}

async function saveDescribePrompt() {
  const text = ($('#editText')?.value || '').trim();
  state.settings.describePrompt = text || DEFAULT_SETTINGS.describePrompt;
  await saveSettings(state.settings);
  activeTextarea = null; goBackFromEdit();
}

async function saveEdit() {
  const et = state.editTarget;
  if (!et) return;
  const text = ($('#editText')?.value || '').trim();
  if (et.type === 'snip') { const n = state.snips.find(x => x.id === et.id); if (n) { n.text = text; n.updatedAt = Date.now(); await dbPut('snips', n); } }
  else if (et.type === 'imageCaption') {
    const im = state.images.find(x => x.id === et.id);
    if (im) { im.caption = text; im.name = text || im.name; await dbPut('images', im); }
  }
  else if (et.type === 'folder') { const f = state.folders.find(x => x.id === et.id); if (f && text) { f.name = text; await dbPut('folders', f); } }
  else if (et.type === 'masterPrompt') { const f = state.folders.find(x => x.id === et.id); if (f) { f.masterPrompt = text; await dbPut('folders', f); } }
  else if (et.type === 'newSnip' && text) {
    const n = { id: uid(), text, folderId: et.folderId || null, checked: false, createdAt: Date.now(), updatedAt: Date.now() };
    state.snips.push(n); await dbPut('snips', n);
  }
  activeTextarea = null; goBackFromEdit();
}

async function deleteSnipFromEdit() {
  const et = state.editTarget;
  if (!et || et.type !== 'snip') return;
  state.snips = state.snips.filter(n => n.id !== et.id);
  await dbDelete('snips', et.id);
  activeTextarea = null; goBackFromEdit();
}

// ============================================================
// Actions
// ============================================================

async function addFolder() {
  const f = { id: uid(), name: 'New Folder', masterPrompt: '', agentSettings: { ...DEFAULT_FOLDER_SETTINGS }, createdAt: Date.now() };
  state.folders.push(f); await dbPut('folders', f);
  startEdit('folder', f.id);
}

function addSnipManual(folderId) {
  state.editTarget = { type: 'newSnip', folderId: folderId || state.currentFolderId || null };
  state.screen = 'editModal'; render();
}

function openFolder(id) {
  state.currentFolderId = id; state.lastAgentResponse = null; state.selectedSnipIds = [];
  state.screen = 'folder'; render();
}

async function deleteFolder(id) {
  for (const n of state.snips.filter(x => x.folderId === id)) await dbDelete('snips', n.id);
  for (const im of state.images.filter(x => x.folderId === id)) await dbDelete('images', im.id);
  state.snips = state.snips.filter(n => n.folderId !== id);
  state.images = state.images.filter(im => im.folderId !== id);
  state.folders = state.folders.filter(f => f.id !== id);
  await dbDelete('folders', id);
  state.screen = 'home'; state.currentFolderId = null; render();
}

function startEdit(type, id) {
  state.editTarget = { type, id }; state.screen = 'editModal'; render();
}

function sendSnip(snipId) {
  const n = state.snips.find(x => x.id === snipId);
  if (!n) return;
  let msg = n.text;
  if (n.folderId) {
    const f = state.folders.find(x => x.id === n.folderId);
    if (f && f.masterPrompt) msg = f.masterPrompt + '\n\n' + n.text;
  }
  sendToRabbit(msg);
}

async function sendSelectedSnips(snipIds, folderId) {
  const folder = state.folders.find(f => f.id === folderId);
  if (!folder) return;
  const selSnips = state.snips.filter(n => snipIds.includes(n.id));
  if (selSnips.length === 0) return;
  const fs = getFolderSettings(folder);
  const body = selSnips.map(n => '• ' + n.text).join('\n');
  const msg = folder.masterPrompt ? folder.masterPrompt + '\n\n' + body : body;
  if (typeof PluginMessageHandler !== 'undefined') {
    PluginMessageHandler.postMessage(JSON.stringify({
      message: msg,
      pluginId: 'com.r1.pixelart',
      imageBase64: null,
      useLLM: fs.useLLM, useSerpAPI: fs.useSerpAPI,
      wantsR1Response: fs.wantsR1Response, wantsJournalEntry: fs.wantsJournalEntry
    }));
    showStatus(`Sending ${selSnips.length} snip${selSnips.length > 1 ? 's' : ''}…`);
  } else { showStatus('Agent unavailable'); }
}

function sendAllInFolder(folderId) {
  const f = state.folders.find(x => x.id === folderId);
  if (!f) return;
  const snips = state.snips.filter(n => n.folderId === folderId);
  const imgs = state.images.filter(im => im.folderId === folderId);
  if (!snips.length && !imgs.length) { showStatus('No snips to send'); return; }
  const body = snips.map((n, i) => pad(i + 1) + '. ' + n.text).join('\n\n');
  const imgMsgs = imgs.map((im, i) => {
    const cap = im.caption ? ` [Caption: ${im.caption}]` : '';
    return `[Image ${pad(snips.length + i + 1)}: ${im.dataUrl}]${cap}`;
  }).join('\n\n');
  sendToRabbit(f.masterPrompt ? f.masterPrompt + '\n\n' + body + (imgMsgs ? '\n\n' + imgMsgs : '') : body + (imgMsgs ? '\n\n' + imgMsgs : ''));
}

function sendToRabbit(message) {
  const fs = getActiveFolderSettings();
  if (typeof PluginMessageHandler !== 'undefined') {
    PluginMessageHandler.postMessage(JSON.stringify({
      message, useLLM: fs.useLLM, useSerpAPI: fs.useSerpAPI,
      wantsR1Response: fs.wantsR1Response, wantsJournalEntry: fs.wantsJournalEntry
    }));
    showStatus('Sent to Rabbit');
  } else { showStatus('Agent unavailable'); }
}

async function captureAgentResponse() {
  if (!state.lastAgentResponse) return;
  const n = { id: uid(), text: state.lastAgentResponse, folderId: state.currentFolderId || null, checked: false, createdAt: Date.now(), updatedAt: Date.now() };
  state.snips.push(n); await dbPut('snips', n);
  state.lastAgentResponse = null; showStatus('Response saved');
}

function emailFolder(folderId) {
  const f = state.folders.find(x => x.id === folderId);
  if (!f) return;
  const snips = state.snips.filter(n => n.folderId === folderId);
  const imgs = state.images.filter(im => im.folderId === folderId);
  if (!snips.length && !imgs.length) { showStatus('Folder is empty'); return; }
  let body = '';
  if (f.masterPrompt) body += 'Master Prompt:\n' + f.masterPrompt + '\n\n---\n\n';

  // Interleave snips and images by createdAt, assign sequential numbers
  const items = [...snips.map(n => ({ kind: 'snip', data: n, sortKey: n.createdAt })),
                 ...imgs.map(im => ({ kind: 'image', data: im, sortKey: im.createdAt }))]
    .sort((a, b) => a.sortKey - b.sortKey);

  items.forEach((item, idx) => {
    const num = pad(idx + 1);
    if (item.kind === 'snip') {
      body += num + '. ' + item.data.text + '\n\n';
    } else {
      const im = item.data;
      // Email can't include image data URLs, so use caption text instead
      body += num + '. ' + (im.caption || '[photo]') + '\n\n';
    }
  });

  const fs = getFolderSettings(f);
  if (typeof PluginMessageHandler !== 'undefined') {
    const payload = { message: 'Send this folder content to my Rabbit Hole email:\n\nFolder: ' + f.name + '\n\n' + body, useLLM: true, wantsR1Response: fs.wantsR1Response };
    PluginMessageHandler.postMessage(JSON.stringify(payload));
    showStatus('Emailing folder…');
  } else { showStatus('Agent unavailable'); }
}

function viewImage(imgId) {
  const im = state.images.find(x => x.id === imgId);
  if (!im) return;
  const ov = document.createElement('div');
  ov.className = 'img-overlay';

  // Top bar with delete button
  const topBar = document.createElement('div');
  topBar.className = 'img-top-bar';
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'img-action-btn img-close-btn';
  deleteBtn.style.flex = '0 0 auto';
  deleteBtn.style.width = '44px';
  deleteBtn.style.minWidth = '44px';
  deleteBtn.textContent = '🗑';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ov.remove();
    deleteImage(im.id);
  });
  topBar.appendChild(deleteBtn);
  ov.appendChild(topBar);

  let scale = 1, lastScale = 1, translateX = 0, translateY = 0, pivots = null;

  const img = document.createElement('img');
  img.src = im.dataUrl;
  img.className = 'img-preview';
  img.style.transform = 'translate(0,0) scale(1)';
  img.style.cursor = 'grab';
  img.style.transition = 'transform 0.1s ease-out';

  const captionEl = document.createElement('div');
  captionEl.className = 'img-caption';
  captionEl.textContent = im.caption || '';

  const btnBar = document.createElement('div');
  btnBar.className = 'img-btn-bar';

  const descBtn = document.createElement('button');
  descBtn.className = 'img-action-btn img-wide-btn';
  descBtn.textContent = 'Describe';
  descBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    describeImageToCaption(im, captionEl, descBtn);
  });

  const sendBtn = document.createElement('button');
  sendBtn.className = 'img-action-btn img-wide-btn';
  sendBtn.textContent = im.caption ? '📤 Send to Rabbit' : '📤 Send Image';
  sendBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sendImageToRabbit(im);
  });

  const closeBtn = document.createElement('button');
  closeBtn.className = 'img-action-btn img-close-btn';
  closeBtn.style.flex = '0 0 auto';
  closeBtn.style.width = '44px';
  closeBtn.style.minWidth = '44px';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => ov.remove());

  btnBar.appendChild(descBtn);
  btnBar.appendChild(sendBtn);
  btnBar.appendChild(closeBtn);

  ov.appendChild(img);
  if (im.caption) ov.appendChild(captionEl);
  ov.appendChild(btnBar);
  document.body.appendChild(ov);

  let lastTouchX = 0, lastTouchY = 0;

  ov.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pivots = { dist: Math.hypot(dx, dy), scale };
    } else if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      img.style.transition = 'none';
    }
  }, { passive: true });

  ov.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && pivots) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      scale = Math.max(1, Math.min(lastScale * (dist / pivots.dist), 5));
      img.style.transform = `translate(${translateX}px,${translateY}px) scale(${scale})`;
      img.style.cursor = 'grab';
    } else if (e.touches.length === 1 && scale > 1) {
      const dx = e.touches[0].clientX - lastTouchX;
      const dy = e.touches[0].clientY - lastTouchY;
      translateX += dx;
      translateY += dy;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      img.style.transform = `translate(${translateX}px,${translateY}px) scale(${scale})`;
    }
  }, { passive: true });

  ov.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      pivots = null;
      lastScale = scale;
      img.style.transition = 'transform 0.2s ease-out';
      if (scale <= 1) { scale = 1; lastScale = 1; translateX = 0; translateY = 0; }
    }
    if (e.touches.length === 0) {
      img.style.transition = 'transform 0.2s ease-out';
    }
  });

  // Mouse wheel zoom for browser testing
  img.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    scale = Math.max(1, Math.min(scale * factor, 5));
    lastScale = scale;
    img.style.transform = `translate(${translateX}px,${translateY}px) scale(${scale})`;
  }, { passive: false });

  img.addEventListener('click', (e) => {
    if (scale > 1) { scale = 1; lastScale = 1; translateX = 0; translateY = 0; img.style.transform = 'translate(0,0) scale(1)'; }
    else ov.remove();
  });
}

function sendImageToRabbit(im) {
  const fs = getActiveFolderSettings();
  const caption = im.caption || '';
  // imageBase64 as separate top-level field — Rabbit's handler processes the
  // image attachment before reading the message field (matching r1magickam pattern)
  if (typeof PluginMessageHandler !== 'undefined') {
    PluginMessageHandler.postMessage(JSON.stringify({
      message: caption || 'Here is a photo.',
      pluginId: 'com.r1.pixelart',
      imageBase64: im.dataUrl,
      useLLM: true,
      wantsR1Response: fs.wantsR1Response, wantsJournalEntry: fs.wantsJournalEntry
    }));
    showStatus('Sending to Rabbit…');
  } else { showStatus('Agent unavailable'); }
}

async function describeImageToCaption(im, captionEl, descBtn) {
  descBtn.textContent = '…';
  descBtn.disabled = true;

  const prompt = state.settings.describePrompt || DEFAULT_SETTINGS.describePrompt;
  const fs = getActiveFolderSettings();

  if (typeof PluginMessageHandler !== 'undefined') {
    state.pendingDescribeImageId = im.id;
    console.log('[DEBUG] describeImageToCaption, pendingDescribeImageId set to:', im.id);

    // Wire up one-shot callback for caption update in the overlay
    window._describeCallback = (captionText) => {
      console.log('[DEBUG] _describeCallback called with:', captionText);
      im.caption = captionText;
      im.name = captionText;
      captionEl.textContent = captionText;
      captionEl.style.color = 'var(--accent)';
      setTimeout(() => { captionEl.style.color = ''; }, 2000);
      showStatus('Caption saved');
      descBtn.textContent = 'Describe';
      descBtn.disabled = false;
      render(); // refresh folder view with new caption
    };

    PluginMessageHandler.postMessage(JSON.stringify({
      message: prompt,
      pluginId: 'com.r1.pixelart',
      imageBase64: im.dataUrl,
      useLLM: true,
      wantsR1Response: fs.wantsR1Response, wantsJournalEntry: fs.wantsJournalEntry
    }));
  } else {
    descBtn.textContent = 'Describe';
    descBtn.disabled = false;
    showStatus('Agent unavailable');
  }
}

async function deleteImage(imgId) {
  state.images = state.images.filter(im => im.id !== imgId);
  await dbDelete('images', imgId); showStatus('Image deleted'); render();
}

function editImageCaption(imgId) {
  const im = state.images.find(x => x.id === imgId);
  if (!im) return;
  state.editTarget = { type: 'imageCaption', id: imgId };
  state.screen = 'editModal'; render();
}

async function saveImageCaption() {
  const et = state.editTarget;
  if (!et || et.type !== 'imageCaption') return;
  const im = state.images.find(x => x.id === et.id);
  if (!im) return;
  const caption = ($('#editText')?.value || '').trim();
  im.caption = caption;
  im.name = caption || ('Photo ' + new Date().toLocaleTimeString());
  await dbPut('images', im);
  activeTextarea = null; goBackFromEdit();
}

// ---- Status ----

function showStatus(msg) {
  state.statusMsg = msg; render();
  setTimeout(() => { state.statusMsg = ''; render(); }, 2000);
}

// ---- Long Press Helper ----

function bindLongPress(el, cb, dur) {
  if (!el) return;
  dur = dur || 600;
  let t = null, fired = false, startX = 0, startY = 0;

  const start = (e) => {
    fired = false;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    t = setTimeout(() => {
      // Only fire if finger hasn't moved more than 10px from start
      fired = true;
      cb();
    }, dur);
  };
  const move = (e) => {
    if (!t) return;
    const curX = e.touches ? e.touches[0].clientX : e.clientX;
    const curY = e.touches ? e.touches[0].clientY : e.clientY;
    if (Math.abs(curX - startX) > 10 || Math.abs(curY - startY) > 10) {
      clearTimeout(t); t = null; fired = false;
    }
  };
  const end = (e) => { clearTimeout(t); t = null; };
  el.addEventListener('touchstart', start, { passive: true });
  el.addEventListener('touchmove', move, { passive: true });
  el.addEventListener('touchend', end); el.addEventListener('touchcancel', end);
  el.addEventListener('mousedown', start);
  el.addEventListener('mouseup', end); el.addEventListener('mouseleave', end);
}

// ============================================================
// Init
// ============================================================

async function init() {
  state.settings = await loadSettings();
  state.folders = await dbGetAll('folders');
  state.snips = await dbGetAll('snips');
  state.images = await dbGetAll('images');
  applyTheme(state.settings.theme);
  applyTextScale(state.settings.textScale || 100);
  render();
}

document.addEventListener('DOMContentLoaded', init);
