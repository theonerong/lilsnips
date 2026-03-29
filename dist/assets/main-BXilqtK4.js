(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`lilsnips`,t=3;function n(){return new Promise((n,r)=>{let i=indexedDB.open(e,t);i.onupgradeneeded=e=>{let t=e.target.result;t.objectStoreNames.contains(`folders`)||t.createObjectStore(`folders`,{keyPath:`id`}),t.objectStoreNames.contains(`snips`)||t.createObjectStore(`snips`,{keyPath:`id`}).createIndex(`folderId`,`folderId`,{unique:!1}),t.objectStoreNames.contains(`settings`)||t.createObjectStore(`settings`,{keyPath:`key`}),t.objectStoreNames.contains(`images`)||t.createObjectStore(`images`,{keyPath:`id`}).createIndex(`folderId`,`folderId`,{unique:!1})},i.onsuccess=()=>n(i.result),i.onerror=()=>r(i.error)})}async function r(e,t,r){let i=await n();return new Promise((n,a)=>{let o=r(i.transaction(e,t).objectStore(e));o.onsuccess=()=>n(o.result),o.onerror=()=>a(o.error)})}var i=(e,t)=>r(e,`readonly`,e=>e.get(t)),a=e=>r(e,`readonly`,e=>e.getAll()),o=(e,t)=>r(e,`readwrite`,e=>e.put(t)),s=(e,t)=>r(e,`readwrite`,e=>e.delete(t)),c={theme:`default`,textScale:100},l={useLLM:!0,useSerpAPI:!1,wantsR1Response:!0,wantsJournalEntry:!1,checkboxesEnabled:!1};async function u(){let e=await i(`settings`,`appSettings`);return e?{...c,...e.value}:{...c}}async function d(e){await o(`settings`,{key:`appSettings`,value:e})}var f=[{id:`default`,name:`R1 Orange`,bg:`#000`,fg:`#fff`,accent:`#FE5F00`,card:`#1a1a1a`,border:`#333`},{id:`midnight`,name:`Midnight Blue`,bg:`#0a0e1a`,fg:`#e0e6f0`,accent:`#4a90d9`,card:`#131a2e`,border:`#253352`},{id:`cyberpunk`,name:`Cyberpunk`,bg:`#0d0015`,fg:`#e0d0ff`,accent:`#ff00ff`,card:`#1a0030`,border:`#4a0066`},{id:`forest`,name:`Forest`,bg:`#071207`,fg:`#d0f0d0`,accent:`#2ecc71`,card:`#0f1f0f`,border:`#1e3e1e`},{id:`sunset`,name:`Sunset`,bg:`#1a0a05`,fg:`#ffe0c0`,accent:`#ff6b35`,card:`#2a1208`,border:`#4a2010`},{id:`arctic`,name:`Arctic`,bg:`#f0f4f8`,fg:`#1a2a3a`,accent:`#0077b6`,card:`#fff`,border:`#c0d0e0`},{id:`cherry`,name:`Cherry`,bg:`#150008`,fg:`#ffd0dd`,accent:`#e63956`,card:`#250010`,border:`#450020`},{id:`gold`,name:`Gold Rush`,bg:`#0f0d05`,fg:`#f0e8d0`,accent:`#d4a017`,card:`#1a1808`,border:`#3a3210`},{id:`terminal`,name:`Terminal`,bg:`#000`,fg:`#0f0`,accent:`#0f0`,card:`#0a0a0a`,border:`#030`},{id:`lavender`,name:`Lavender`,bg:`#0e0a14`,fg:`#e8ddf0`,accent:`#9b59b6`,card:`#1a1224`,border:`#2e1e40`}];function p(e){let t=f.find(t=>t.id===e)||f[0],n=document.documentElement.style;n.setProperty(`--bg`,t.bg),n.setProperty(`--fg`,t.fg),n.setProperty(`--accent`,t.accent),n.setProperty(`--card`,t.card),n.setProperty(`--card-border`,t.border)}function m(e){document.documentElement.style.setProperty(`--text-scale`,(e/100).toString())}var h={screen:`home`,folders:[],snips:[],images:[],currentFolderId:null,settings:{...c},editTarget:null,isRecording:!1,statusMsg:``,lastAgentResponse:null,cameraActive:!1,cameraPreviewData:null,cameraFacing:`back`},g=null;function _(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function v(e){return document.querySelector(e)}function y(e){let t=document.createElement(`div`);return t.textContent=e||``,t.innerHTML}function b(e,t){return e?e.length>t?e.slice(0,t)+`…`:e:``}function x(e){return e<10?`0`+e:``+e}function S(e){return e&&e.agentSettings?{...l,...e.agentSettings}:{...l}}function ee(){return S(h.folders.find(e=>e.id===h.currentFolderId))}var C=!1,w=!1,T=2e3;function E(e){C=e,typeof PluginMessageHandler<`u`&&PluginMessageHandler.postMessage(JSON.stringify({type:`lockPtt`,locked:e}))}function D(e=`back`){h.cameraActive=!0,h.cameraPreviewData=null,h.cameraFacing=e,E(!0),P(),typeof PluginMessageHandler<`u`?(PluginMessageHandler.postMessage(JSON.stringify({type:`camera`,action:`start`,facing:e})),Z(`Starting camera…`)):(h.cameraPreviewData=`data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22240%22%20height%3D%22240%22%20viewBox%3D%220%200%20240%20240%22%3E%3Crect%20fill%3D%22%2523111%22%20width%3D%22240%22%20height%3D%22240%22%2F%3E%3Ctext%20x%3D%22120%22%20y%3D%22120%22%20text-anchor%3D%22middle%22%20fill%3D%22%2523666%22%20font-size%3D%2212%22%3ECamera%3A%20browser%20mode%3C%2Ftext%3E%3C%2Fsvg%3E`,P(),Z(`Camera: browser dev mode`))}function te(){h.cameraActive&&(typeof PluginMessageHandler<`u`?(PluginMessageHandler.postMessage(JSON.stringify({type:`camera`,action:`capture`})),Z(`Capturing…`)):Z(`Capture: not available in browser`))}function ne(){typeof PluginMessageHandler<`u`&&PluginMessageHandler.postMessage(JSON.stringify({type:`camera`,action:`stop`})),h.cameraActive=!1,h.cameraPreviewData=null,h.cameraFacing=`back`,E(!1),P()}function O(){if(!h.cameraActive||w)return;w=!0,setTimeout(()=>{w=!1},T);let e=h.cameraFacing===`back`?`front`:`back`;h.cameraFacing=e,typeof PluginMessageHandler<`u`?(PluginMessageHandler.postMessage(JSON.stringify({type:`camera`,action:`start`,facing:e})),Z(e===`back`?`Switching to back…`:`Switching to front…`)):(P(),Z(`Camera: switched to `+e+` (dev mode)`))}async function k(e){let t={id:_(),name:`Photo `+new Date().toLocaleTimeString(),dataUrl:e,folderId:h.currentFolderId||null,createdAt:Date.now()};h.images.push(t),await o(`images`,t),Z(`Photo saved`)}var A=0,j=null,M=400;function N(){let e=Date.now(),t=e-A;if(A=e,j&&=(clearTimeout(j),null),t<M){A=0,h.cameraActive?(ne(),closeWebView.postMessage(``)):D(`back`);return}j=setTimeout(()=>{j=null,h.cameraActive?te():re()},M)}function re(){h.screen===`editModal`?H():h.screen===`folderSettings`?(h.screen=`folder`,P()):h.screen===`settings`||h.screen===`themeSelect`?(h.screen=`home`,P()):h.screen===`folder`&&(h.screen=`home`,h.currentFolderId=null,P())}window.addEventListener(`sideClick`,N),document.addEventListener(`keydown`,e=>{e.code===`Space`&&!g&&(e.preventDefault(),N())}),window.addEventListener(`longPressStart`,()=>{h.cameraActive||C||(h.isRecording=!0,P(),typeof CreationVoiceHandler<`u`&&CreationVoiceHandler.postMessage(`start`))}),window.addEventListener(`longPressEnd`,()=>{h.cameraActive||C||(h.isRecording=!1,P(),typeof CreationVoiceHandler<`u`&&CreationVoiceHandler.postMessage(`stop`))}),window.addEventListener(`scrollUp`,()=>{if(h.cameraActive)O();else{let e=v(`.scroll-area`);e&&(e.scrollTop-=60)}}),window.addEventListener(`scrollDown`,()=>{if(h.cameraActive)O();else{let e=v(`.scroll-area`);e&&(e.scrollTop+=60)}}),window.onPluginMessage=async function(e){if(e.type===`cameraPreview`&&e.imageBase64){if(h.cameraActive){h.cameraPreviewData=`data:image/jpeg;base64,`+e.imageBase64;let t=v(`#cameraFeed`);t&&(t.style.backgroundImage=`url(`+h.cameraPreviewData+`)`)}return}if(e.type===`cameraCaptured`&&e.imageBase64){await k(`data:image/jpeg;base64,`+e.imageBase64),h.cameraActive=!1,h.cameraPreviewData=null,h.cameraFacing=`back`,E(!1),P();return}if(e.type===`cameraError`){h.cameraActive=!1,h.cameraPreviewData=null,E(!1),Z(`Camera error: `+(e.message||`unknown`)),P();return}if(e.type===`cameraStopped`){h.cameraActive=!1,h.cameraPreviewData=null,h.cameraFacing=`back`,E(!1),P();return}if(e.type===`sttEnded`&&e.transcript){let t=e.transcript.trim();if(!t)return;if(g){let e=g,n=e.selectionStart,r=e.selectionEnd;e.value=e.value.substring(0,n)+t+e.value.substring(r),e.selectionStart=e.selectionEnd=n+t.length,e.focus();return}let n={id:_(),text:t,folderId:h.currentFolderId||null,checked:!1,createdAt:Date.now(),updatedAt:Date.now()};h.snips.push(n),await o(`snips`,n),Z(`Snip created`);return}if(e.data||e.message){let t=typeof e.data==`string`?e.data:e.message||``;t&&(h.lastAgentResponse=t,Z(`Response received`))}};function P(){let e=v(`#app`);if(e){if(h.cameraActive){ie(e);return}switch(h.screen){case`home`:F(e);break;case`folder`:I(e);break;case`folderSettings`:L(e);break;case`settings`:R(e);break;case`themeSelect`:z(e);break;case`editModal`:B(e);break;default:F(e)}}}function ie(e){let t=h.cameraFacing===`back`?`Back`:`Front`;e.innerHTML=`
    <div class="camera-screen">
      <div class="camera-feed" id="cameraFeed"
        ${h.cameraPreviewData?`style="background-image:url(`+h.cameraPreviewData+`)"`:``}>
        ${h.cameraPreviewData?``:`<div class="camera-waiting">📷 Starting camera…</div>`}
      </div>
      <div class="camera-hud">
        <div class="camera-hint">${t} • Scroll to flip • PTT: Capture • 2×PTT: Exit</div>
      </div>
    </div>`}function F(e){let t=h.snips.filter(e=>!e.folderId);e.innerHTML=`
    <div class="screen">
      <div class="header">
        <span class="header-title">✂️ Lil Snips</span>
        <button class="icon-btn" id="btnSettings">⚙</button>
      </div>
      <div class="scroll-area" id="homeList">
        ${h.folders.length===0&&t.length===0?`<div class="empty-msg">Hold PTT to dictate a snip<br>Double-press PTT for camera<br>or tap + to add a folder</div>`:``}
        ${h.folders.map(e=>`
          <div class="list-item folder-item" data-id="${e.id}">
            <span class="item-icon">📁</span>
            <span class="item-text">${y(b(e.name,22))}</span>
            <span class="item-count">${h.snips.filter(t=>t.folderId===e.id).length+h.images.filter(t=>t.folderId===e.id).length}</span>
          </div>`).join(``)}
        ${t.map(e=>`
          <div class="list-item snip-item" data-id="${e.id}">
            <span class="item-icon">📄</span>
            <span class="item-text">${y(b(e.text,25))}</span>
          </div>`).join(``)}
      </div>
      <div class="toolbar">
        <button class="tool-btn" id="btnAddFolder">+ Folder</button>
        <button class="tool-btn" id="btnAddSnip">+ Snip</button>
      </div>
      ${h.isRecording?`<div class="rec-pill">🎙 Recording…</div>`:``}
      ${h.statusMsg?`<div class="status-pill">`+y(h.statusMsg)+`</div>`:``}
    </div>`,v(`#btnSettings`)?.addEventListener(`click`,()=>{h.screen=`settings`,P()}),v(`#btnAddFolder`)?.addEventListener(`click`,W),v(`#btnAddSnip`)?.addEventListener(`click`,()=>G()),document.querySelectorAll(`.folder-item`).forEach(e=>{e.addEventListener(`click`,()=>K(e.dataset.id)),Q(e,()=>J(`folder`,e.dataset.id))}),document.querySelectorAll(`#homeList .snip-item`).forEach(e=>{e.addEventListener(`click`,()=>Y(e.dataset.id)),Q(e,()=>J(`snip`,e.dataset.id))})}function I(e){let t=h.folders.find(e=>e.id===h.currentFolderId);if(!t){h.screen=`home`,P();return}let n=h.snips.filter(e=>e.folderId===t.id),r=h.images.filter(e=>e.folderId===t.id),i=S(t);e.innerHTML=`
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnBack">◀</button>
        <span class="header-title">${y(b(t.name,14))}</span>
        <button class="icon-btn" id="btnFolderSettings">⚙</button>
      </div>
      ${t.masterPrompt?`<div class="master-prompt" id="mpEl"><span class="mp-label">Prompt:</span><span class="mp-text">`+y(b(t.masterPrompt,40))+`</span></div>`:`<div class="master-prompt add-mp" id="addMP"><span class="mp-label">+ Master Prompt</span></div>`}
      <div class="scroll-area" id="folderList">
        ${n.length===0&&r.length===0?`<div class="empty-msg">Hold PTT to add a snip<br>Double-press PTT for photo</div>`:``}
        ${n.map((e,t)=>`
          <div class="list-item snip-item" data-id="${e.id}">
            ${i.checkboxesEnabled?`<label class="snip-cb" data-sid="`+e.id+`"><input type="checkbox" `+(e.checked?`checked`:``)+`/><span class="cb-mark"></span></label>`:``}
            <span class="item-icon">📄</span>
            <span class="item-num">${x(t+1)}</span>
            <span class="item-text ${e.checked&&i.checkboxesEnabled?`checked-text`:``}">${y(b(e.text,22))}</span>
          </div>`).join(``)}
        ${r.map(e=>`
          <div class="list-item img-item" data-id="${e.id}">
            <span class="item-icon">📷</span>
            <span class="item-text">${y(b(e.name||`Photo`,25))}</span>
          </div>`).join(``)}
      </div>
      <div class="toolbar">
        <button class="tool-btn" id="btnAddSnipF">+ Snip</button>
        <button class="tool-btn" id="btnSendAll">Send All</button>
        <button class="tool-btn" id="btnEmail">✉</button>
      </div>
      ${h.lastAgentResponse?`<div class="agent-bar" id="agentBar"><span class="agent-lbl">Agent:</span><span class="agent-txt">`+y(b(h.lastAgentResponse,30))+`</span><span class="agent-save">+ Save</span></div>`:``}
      ${h.isRecording?`<div class="rec-pill">🎙 Recording…</div>`:``}
      ${h.statusMsg?`<div class="status-pill">`+y(h.statusMsg)+`</div>`:``}
    </div>`,v(`#btnBack`)?.addEventListener(`click`,()=>{h.screen=`home`,h.currentFolderId=null,h.lastAgentResponse=null,P()}),v(`#btnFolderSettings`)?.addEventListener(`click`,()=>{h.screen=`folderSettings`,P()}),v(`#btnAddSnipF`)?.addEventListener(`click`,()=>G(t.id)),v(`#btnSendAll`)?.addEventListener(`click`,()=>ae(t.id)),v(`#btnEmail`)?.addEventListener(`click`,()=>se(t.id)),v(`#mpEl`)?.addEventListener(`click`,()=>J(`masterPrompt`,t.id)),v(`#addMP`)?.addEventListener(`click`,()=>J(`masterPrompt`,t.id)),v(`#agentBar`)?.addEventListener(`click`,oe),document.querySelectorAll(`#folderList .snip-item`).forEach(e=>{e.addEventListener(`click`,t=>{t.target.closest(`.snip-cb`)||Y(e.dataset.id)}),Q(e,()=>J(`snip`,e.dataset.id))}),document.querySelectorAll(`.snip-cb input`).forEach(e=>{e.addEventListener(`change`,async t=>{t.stopPropagation();let n=e.closest(`.snip-cb`).dataset.sid,r=h.snips.find(e=>e.id===n);r&&(r.checked=e.checked,await o(`snips`,r),P())})}),document.querySelectorAll(`#folderList .img-item`).forEach(e=>{e.addEventListener(`click`,()=>ce(e.dataset.id)),Q(e,()=>le(e.dataset.id))})}function L(e){let t=h.folders.find(e=>e.id===h.currentFolderId);if(!t){h.screen=`home`,P();return}let n=S(t);e.innerHTML=`
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnBackFS">◀</button>
        <span class="header-title">Folder Settings</span>
      </div>
      <div class="scroll-area">
        <div class="section-lbl">${y(b(t.name,20))}</div>
        <div class="setting-row"><span class="setting-lbl">Checkboxes</span><label class="toggle"><input type="checkbox" id="togCB" ${n.checkboxesEnabled?`checked`:``}><span class="slider"></span></label></div>
        <div class="section-lbl">Agent Settings</div>
        <div class="setting-row"><span class="setting-lbl">Use LLM</span><label class="toggle"><input type="checkbox" id="togLLM" ${n.useLLM?`checked`:``}><span class="slider"></span></label></div>
        <div class="setting-row"><span class="setting-lbl">Use SerpAPI</span><label class="toggle"><input type="checkbox" id="togSerp" ${n.useSerpAPI?`checked`:``}><span class="slider"></span></label></div>
        <div class="setting-row"><span class="setting-lbl">R1 Voice</span><label class="toggle"><input type="checkbox" id="togR1" ${n.wantsR1Response?`checked`:``}><span class="slider"></span></label></div>
        <div class="setting-row"><span class="setting-lbl">Journal</span><label class="toggle"><input type="checkbox" id="togJournal" ${n.wantsJournalEntry?`checked`:``}><span class="slider"></span></label></div>
        <div class="setting-row"><button class="tool-btn danger-btn" id="btnDelFolder">🗑 Delete Folder</button></div>
      </div>
    </div>`,v(`#btnBackFS`)?.addEventListener(`click`,()=>{h.screen=`folder`,P()}),v(`#btnDelFolder`)?.addEventListener(`click`,()=>q(t.id));let r=(e,n)=>{let r=v(`#${e}`);r&&r.addEventListener(`change`,async()=>{t.agentSettings||={...l},t.agentSettings[n]=r.checked,await o(`folders`,t)})};r(`togCB`,`checkboxesEnabled`),r(`togLLM`,`useLLM`),r(`togSerp`,`useSerpAPI`),r(`togR1`,`wantsR1Response`),r(`togJournal`,`wantsJournalEntry`)}function R(e){let t=h.settings,n=t.textScale||100;e.innerHTML=`
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnBackS">◀</button>
        <span class="header-title">Settings</span>
      </div>
      <div class="scroll-area">
        <div class="setting-row"><span class="setting-lbl">Theme</span><button class="setting-btn" id="btnTheme">${(f.find(e=>e.id===t.theme)||f[0]).name} ▶</button></div>
        <div class="setting-row"><span class="setting-lbl">Text Scale: ${n}%</span>
          <div class="scale-ctrl"><button class="scale-btn" id="scDown">−</button><span class="scale-val">${n}%</span><button class="scale-btn" id="scUp">+</button></div>
        </div>
      </div>
    </div>`,v(`#btnBackS`)?.addEventListener(`click`,()=>{h.screen=`home`,P()}),v(`#btnTheme`)?.addEventListener(`click`,()=>{h.screen=`themeSelect`,P()}),v(`#scDown`)?.addEventListener(`click`,async()=>{h.settings.textScale=Math.max(100,(h.settings.textScale||100)-10),m(h.settings.textScale),await d(h.settings),P()}),v(`#scUp`)?.addEventListener(`click`,async()=>{h.settings.textScale=Math.min(200,(h.settings.textScale||100)+10),m(h.settings.textScale),await d(h.settings),P()})}function z(e){e.innerHTML=`
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnBackT">◀</button>
        <span class="header-title">Themes</span>
      </div>
      <div class="scroll-area">
        ${f.map(e=>`
          <div class="list-item theme-item ${h.settings.theme===e.id?`selected`:``}" data-id="${e.id}">
            <span class="theme-sw" style="background:${e.accent}"></span>
            <span class="item-text">${y(e.name)}</span>
            ${h.settings.theme===e.id?`<span class="check">✓</span>`:``}
          </div>`).join(``)}
      </div>
    </div>`,v(`#btnBackT`)?.addEventListener(`click`,()=>{h.screen=`settings`,P()}),document.querySelectorAll(`.theme-item`).forEach(e=>{e.addEventListener(`click`,async()=>{h.settings.theme=e.dataset.id,p(e.dataset.id),await d(h.settings),P()})})}function B(e){let t=h.editTarget;if(!t){h.screen=`home`,P();return}let n=``,r=`Edit`;if(t.type===`snip`){let e=h.snips.find(e=>e.id===t.id);n=e?e.text:``,r=`Edit Snip`}else if(t.type===`folder`){let e=h.folders.find(e=>e.id===t.id);n=e?e.name:``,r=`Edit Folder`}else if(t.type===`masterPrompt`){let e=h.folders.find(e=>e.id===t.id);n=e&&e.masterPrompt||``,r=`Master Prompt`}else t.type===`newSnip`&&(n=``,r=`New Snip`);e.innerHTML=`
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnCancelEdit">✕</button>
        <span class="header-title">${r}</span>
        <button class="icon-btn" id="btnSaveEdit">💾</button>
      </div>
      <div class="edit-area">
        <textarea id="editText" class="edit-ta" placeholder="Type or hold PTT to dictate…">${y(n)}</textarea>
      </div>
      ${t.type===`snip`?`<button class="del-btn" id="btnDelSnip">Delete Snip</button>`:``}
      ${h.isRecording?`<div class="rec-pill">🎙 Dictating…</div>`:``}
    </div>`;let i=v(`#editText`);i&&(i.focus(),g=i,i.addEventListener(`focus`,()=>{g=i}),i.addEventListener(`blur`,()=>{setTimeout(()=>{g===i&&(g=null)},200)})),v(`#btnCancelEdit`)?.addEventListener(`click`,V),v(`#btnSaveEdit`)?.addEventListener(`click`,H),v(`#btnDelSnip`)?.addEventListener(`click`,U)}function V(){let e=h.editTarget;g=null,h.editTarget=null,h.screen=e&&(e.type===`masterPrompt`||e.type===`newSnip`)&&h.currentFolderId||h.currentFolderId?`folder`:`home`,P()}async function H(){let e=h.editTarget;if(!e)return;let t=(v(`#editText`)?.value||``).trim();if(e.type===`snip`){let n=h.snips.find(t=>t.id===e.id);n&&(n.text=t,n.updatedAt=Date.now(),await o(`snips`,n))}else if(e.type===`folder`){let n=h.folders.find(t=>t.id===e.id);n&&t&&(n.name=t,await o(`folders`,n))}else if(e.type===`masterPrompt`){let n=h.folders.find(t=>t.id===e.id);n&&(n.masterPrompt=t,await o(`folders`,n))}else if(e.type===`newSnip`&&t){let n={id:_(),text:t,folderId:e.folderId||null,checked:!1,createdAt:Date.now(),updatedAt:Date.now()};h.snips.push(n),await o(`snips`,n)}g=null,V()}async function U(){let e=h.editTarget;!e||e.type!==`snip`||(h.snips=h.snips.filter(t=>t.id!==e.id),await s(`snips`,e.id),g=null,V())}async function W(){let e={id:_(),name:`New Folder`,masterPrompt:``,agentSettings:{...l},createdAt:Date.now()};h.folders.push(e),await o(`folders`,e),J(`folder`,e.id)}function G(e){h.editTarget={type:`newSnip`,folderId:e||h.currentFolderId||null},h.screen=`editModal`,P()}function K(e){h.currentFolderId=e,h.lastAgentResponse=null,h.screen=`folder`,P()}async function q(e){for(let t of h.snips.filter(t=>t.folderId===e))await s(`snips`,t.id);for(let t of h.images.filter(t=>t.folderId===e))await s(`images`,t.id);h.snips=h.snips.filter(t=>t.folderId!==e),h.images=h.images.filter(t=>t.folderId!==e),h.folders=h.folders.filter(t=>t.id!==e),await s(`folders`,e),h.screen=`home`,h.currentFolderId=null,P()}function J(e,t){h.editTarget={type:e,id:t},h.screen=`editModal`,P()}function Y(e){let t=h.snips.find(t=>t.id===e);if(!t)return;let n=t.text;if(t.folderId){let e=h.folders.find(e=>e.id===t.folderId);e&&e.masterPrompt&&(n=e.masterPrompt+`

`+t.text)}X(n)}function ae(e){let t=h.folders.find(t=>t.id===e);if(!t)return;let n=h.snips.filter(t=>t.folderId===e);if(!n.length){Z(`No snips to send`);return}let r=n.map((e,t)=>x(t+1)+`. `+e.text).join(`

`);X(t.masterPrompt?t.masterPrompt+`

`+r:r)}function X(e){let t=ee();typeof PluginMessageHandler<`u`?(PluginMessageHandler.postMessage(JSON.stringify({message:e,useLLM:t.useLLM,useSerpAPI:t.useSerpAPI,wantsR1Response:t.wantsR1Response,wantsJournalEntry:t.wantsJournalEntry})),Z(`Sent to Rabbit`)):Z(`Agent unavailable`)}async function oe(){if(!h.lastAgentResponse)return;let e={id:_(),text:h.lastAgentResponse,folderId:h.currentFolderId||null,checked:!1,createdAt:Date.now(),updatedAt:Date.now()};h.snips.push(e),await o(`snips`,e),h.lastAgentResponse=null,Z(`Response saved`)}function se(e){let t=h.folders.find(t=>t.id===e);if(!t)return;let n=h.snips.filter(t=>t.folderId===e),r=h.images.filter(t=>t.folderId===e);if(!n.length&&!r.length){Z(`Folder is empty`);return}let i=``;t.masterPrompt&&(i+=`Master Prompt:
`+t.masterPrompt+`

---

`),n.forEach((e,t)=>{i+=`Snip `+x(t+1)+`:
`+e.text+`

`});let a=S(t);if(typeof PluginMessageHandler<`u`){let e={message:`Send this folder content to my Rabbit Hole email:

Folder: `+t.name+`

`+i,useLLM:!0,wantsR1Response:a.wantsR1Response};PluginMessageHandler.postMessage(JSON.stringify(e)),Z(`Emailing folder…`)}else Z(`Agent unavailable`)}function ce(e){let t=h.images.find(t=>t.id===e);if(!t)return;let n=document.createElement(`div`);n.className=`img-overlay`,n.innerHTML=`<img src="`+t.dataUrl+`" class="img-preview"><div class="img-close">✕ Close</div>`,n.addEventListener(`click`,()=>n.remove()),document.body.appendChild(n)}async function le(e){h.images=h.images.filter(t=>t.id!==e),await s(`images`,e),Z(`Image deleted`),P()}function Z(e){h.statusMsg=e,P(),setTimeout(()=>{h.statusMsg=``,P()},2e3)}function Q(e,t,n){if(!e)return;n||=600;let r=null,i=!1,a=()=>{i=!1,r=setTimeout(()=>{i=!0,t()},n)},o=e=>{clearTimeout(r),i&&(e.preventDefault(),e.stopPropagation())};e.addEventListener(`touchstart`,a,{passive:!0}),e.addEventListener(`touchend`,o),e.addEventListener(`touchcancel`,o),e.addEventListener(`mousedown`,a),e.addEventListener(`mouseup`,o),e.addEventListener(`mouseleave`,o)}async function $(){h.settings=await u(),h.folders=await a(`folders`),h.snips=await a(`snips`),h.images=await a(`images`),p(h.settings.theme),m(h.settings.textScale||100),P()}document.addEventListener(`DOMContentLoaded`,$);