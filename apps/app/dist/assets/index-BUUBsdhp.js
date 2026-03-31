(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`lilsnips`,t=3;function n(){return new Promise((n,r)=>{let i=indexedDB.open(e,t);i.onupgradeneeded=e=>{let t=e.target.result;t.objectStoreNames.contains(`folders`)||t.createObjectStore(`folders`,{keyPath:`id`}),t.objectStoreNames.contains(`snips`)||t.createObjectStore(`snips`,{keyPath:`id`}).createIndex(`folderId`,`folderId`,{unique:!1}),t.objectStoreNames.contains(`settings`)||t.createObjectStore(`settings`,{keyPath:`key`}),t.objectStoreNames.contains(`images`)||t.createObjectStore(`images`,{keyPath:`id`}).createIndex(`folderId`,`folderId`,{unique:!1})},i.onsuccess=()=>n(i.result),i.onerror=()=>r(i.error)})}async function r(e,t,r){let i=await n();return new Promise((n,a)=>{let o=r(i.transaction(e,t).objectStore(e));o.onsuccess=()=>n(o.result),o.onerror=()=>a(o.error)})}var i=(e,t)=>r(e,`readonly`,e=>e.get(t)),a=e=>r(e,`readonly`,e=>e.getAll()),o=(e,t)=>r(e,`readwrite`,e=>e.put(t)),s=(e,t)=>r(e,`readwrite`,e=>e.delete(t)),c={theme:`default`,textScale:100,debugMode:!1},l={useLLM:!0,useSerpAPI:!1,wantsR1Response:!0,wantsJournalEntry:!1,checkboxesEnabled:!1,collapsedView:!1};async function u(){let e=await i(`settings`,`appSettings`);return e?{...c,...e.value}:{...c}}async function d(e){await o(`settings`,{key:`appSettings`,value:e})}var f=[{id:`default`,name:`R1 Orange`,bg:`#000`,fg:`#fff`,accent:`#FE5F00`,card:`#1a1a1a`,border:`#333`},{id:`midnight`,name:`Midnight Blue`,bg:`#0a0e1a`,fg:`#e0e6f0`,accent:`#4a90d9`,card:`#131a2e`,border:`#253352`},{id:`cyberpunk`,name:`Cyberpunk`,bg:`#0d0015`,fg:`#e0d0ff`,accent:`#ff00ff`,card:`#1a0030`,border:`#4a0066`},{id:`forest`,name:`Forest`,bg:`#071207`,fg:`#d0f0d0`,accent:`#2ecc71`,card:`#0f1f0f`,border:`#1e3e1e`},{id:`sunset`,name:`Sunset`,bg:`#1a0a05`,fg:`#ffe0c0`,accent:`#ff6b35`,card:`#2a1208`,border:`#4a2010`},{id:`arctic`,name:`Arctic`,bg:`#f0f4f8`,fg:`#1a2a3a`,accent:`#0077b6`,card:`#fff`,border:`#c0d0e0`},{id:`cherry`,name:`Cherry`,bg:`#150008`,fg:`#ffd0dd`,accent:`#e63956`,card:`#250010`,border:`#450020`},{id:`gold`,name:`Gold Rush`,bg:`#0f0d05`,fg:`#f0e8d0`,accent:`#d4a017`,card:`#1a1808`,border:`#3a3210`},{id:`terminal`,name:`Terminal`,bg:`#000`,fg:`#0f0`,accent:`#0f0`,card:`#0a0a0a`,border:`#030`},{id:`lavender`,name:`Lavender`,bg:`#0e0a14`,fg:`#e8ddf0`,accent:`#9b59b6`,card:`#1a1224`,border:`#2e1e40`}];function p(e){let t=f.find(t=>t.id===e)||f[0],n=document.documentElement.style;n.setProperty(`--bg`,t.bg),n.setProperty(`--fg`,t.fg),n.setProperty(`--accent`,t.accent),n.setProperty(`--card`,t.card),n.setProperty(`--card-border`,t.border)}function m(e){document.documentElement.style.setProperty(`--text-scale`,(e/100).toString())}var h={screen:`home`,folders:[],snips:[],images:[],currentFolderId:null,settings:{...c},editTarget:null,isRecording:!1,statusMsg:``,lastAgentResponse:null,selectedSnipIds:[],savedScrollTop:0,debugLogs:[],cameraActive:!1,cameraPreviewData:null,cameraStream:null},g=null;function _(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}function v(e){return document.querySelector(e)}function y(e){let t=document.createElement(`div`);return t.textContent=e||``,t.innerHTML}function b(e,t){return e?e.length>t?e.slice(0,t)+`…`:e:``}function x(e){return e<10?`0`+e:``+e}function S(e){return e&&e.agentSettings?{...l,...e.agentSettings}:{...l}}function C(){return S(h.folders.find(e=>e.id===h.currentFolderId))}var w=null;function T(){if(h.cameraActive=!0,h.cameraPreviewData=null,P(),!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){Q(`Camera not supported`),D();return}navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:`environment`},width:{ideal:640},height:{ideal:480}},audio:!1}).then(e=>{w=e,h.cameraStream=e,Q(`Camera active`),P()}).catch(e=>{console.error(`Camera error:`,e),Q(`Camera denied`),D()})}function E(){if(!h.cameraActive||!w)return;let e=document.querySelector(`#cameraVideo`);if(!e||e.readyState<2){Q(`Not ready`);return}let t=e.videoWidth,n=e.videoHeight;if(!t||!n){Q(`No video frame`);return}let r=document.createElement(`canvas`);r.width=t,r.height=n,r.getContext(`2d`).drawImage(e,0,0,t,n);let i=r.toDataURL(`image/jpeg`,.85);h.cameraActive=!1,w&&=(w.getTracks().forEach(e=>e.stop()),null),h.cameraStream=null,O(i)}function D(){w&&=(w.getTracks().forEach(e=>e.stop()),null),h.cameraStream=null,h.cameraActive=!1,h.cameraPreviewData=null,P()}async function O(e,t){let n={id:_(),name:`Photo `+new Date().toLocaleTimeString(),dataUrl:e,folderId:h.currentFolderId||null,caption:t||``,createdAt:Date.now()};h.images.push(n),await o(`images`,n),Q(`Photo saved`)}var k=0,A=null,j=400;function M(){let e=Date.now(),t=e-k;if(k=e,A&&=(clearTimeout(A),null),t<j){k=0,h.cameraActive?D():T();return}A=setTimeout(()=>{A=null,h.cameraActive?E():N()},j)}function N(){h.screen===`editModal`?U():h.screen===`folderSettings`?(h.screen=`folder`,P()):h.screen===`settings`||h.screen===`themeSelect`?(h.screen=`home`,P()):h.screen===`folder`&&(h.screen=`home`,h.currentFolderId=null,P())}window.addEventListener(`sideClick`,M),document.addEventListener(`keydown`,e=>{e.code===`Space`&&!g&&(e.preventDefault(),M())}),window.addEventListener(`longPressStart`,()=>{h.cameraActive||(h.isRecording=!0,P(),typeof CreationVoiceHandler<`u`&&CreationVoiceHandler.postMessage(`start`))}),window.addEventListener(`longPressEnd`,()=>{h.cameraActive||(h.isRecording=!1,P(),typeof CreationVoiceHandler<`u`&&CreationVoiceHandler.postMessage(`stop`))}),(function(){let e=window.PluginMessageHandler?.postMessage?.bind(window.PluginMessageHandler);e&&(window.PluginMessageHandler.postMessage=function(t){try{let e=typeof t==`string`?JSON.parse(t):t;if(h.settings.debugMode){let t={ts:Date.now(),type:`outgoing`,data:JSON.stringify(e).slice(0,400)};h.debugLogs.push(t),h.debugLogs.length>200&&(h.debugLogs=h.debugLogs.slice(-100))}}catch{}return e.call(this,t)})})(),window.onPluginMessage=async function(e){if(h.settings.debugMode){let t={ts:Date.now(),type:`incoming`,data:JSON.stringify(e).slice(0,400)};h.debugLogs.push(t),h.debugLogs.length>200&&(h.debugLogs=h.debugLogs.slice(-100))}if(e.type===`sttEnded`&&e.transcript){let t=e.transcript.trim();if(!t)return;if(g){let e=g,n=e.selectionStart,r=e.selectionEnd;e.value=e.value.substring(0,n)+t+e.value.substring(r),e.selectionStart=e.selectionEnd=n+t.length,e.focus();return}let n={id:_(),text:t,folderId:h.currentFolderId||null,checked:!1,createdAt:Date.now(),updatedAt:Date.now()};h.snips.push(n),await o(`snips`,n),Q(`Snip created`);return}if(e.type!==`sttStarted`&&(e.data||e.message)){let t=typeof e.data==`string`?e.data:e.message||``;t&&(h.lastAgentResponse=t,Q(`Response received`))}},window.addEventListener(`scrollUp`,()=>{let e=v(`.scroll-area`);e&&(e.scrollTop-=60)}),window.addEventListener(`scrollDown`,()=>{let e=v(`.scroll-area`);e&&(e.scrollTop+=60)});function P(){let e=v(`#app`);if(e){if(h.cameraActive){F(e);return}switch(h.screen){case`home`:I(e);break;case`folder`:L(e);break;case`folderSettings`:R(e);break;case`settings`:z(e);break;case`themeSelect`:B(e);break;case`editModal`:V(e);break;default:I(e)}}}function F(e){h.cameraStream&&setTimeout(()=>{let e=document.querySelector(`#cameraVideo`);e&&!e.srcObject&&(e.srcObject=h.cameraStream,e.play().catch(()=>{}))},10),e.innerHTML=`
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
    </div>`}function I(e){let t=h.snips.filter(e=>!e.folderId);e.innerHTML=`
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
    </div>`,v(`#btnSettings`)?.addEventListener(`click`,()=>{h.screen=`settings`,P()}),v(`#btnAddFolder`)?.addEventListener(`click`,G),v(`#btnAddSnip`)?.addEventListener(`click`,()=>K()),document.querySelectorAll(`.folder-item`).forEach(e=>{e.addEventListener(`click`,()=>q(e.dataset.id)),$(e,()=>Y(`folder`,e.dataset.id))}),document.querySelectorAll(`#homeList .snip-item`).forEach(e=>{e.addEventListener(`click`,()=>X(e.dataset.id)),$(e,()=>Y(`snip`,e.dataset.id))})}function L(e){let t=h.folders.find(e=>e.id===h.currentFolderId);if(!t){h.screen=`home`,P();return}let n=h.snips.filter(e=>e.folderId===t.id),r=h.images.filter(e=>e.folderId===t.id),i=S(t),a=[...n.map(e=>({kind:`snip`,data:e,sortKey:e.createdAt})),...r.map(e=>({kind:`image`,data:e,sortKey:e.createdAt}))].sort((e,t)=>e.sortKey-t.sortKey);e.innerHTML=`
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnBack">◀</button>
        <span class="header-title">${y(b(t.name,14))}</span>
        <button class="icon-btn" id="btnFolderSettings">⚙</button>
      </div>
      ${t.masterPrompt?`<div class="master-prompt" id="mpEl"><span class="mp-label">Prompt:</span><span class="mp-text">`+y(b(t.masterPrompt,40))+`</span></div>`:`<div class="master-prompt add-mp" id="addMP"><span class="mp-label">+ Master Prompt</span></div>`}
      <div class="scroll-area" id="folderList">
        ${a.length===0?`<div class="empty-msg">Hold PTT to add a snip<br>Double-press PTT for photo</div>`:``}
        ${a.map((e,t)=>{let n=x(t+1);if(e.kind===`snip`){let t=e.data;return`<div class="list-item snip-item${i.collapsedView?``:` snip-item--expanded`}${h.selectedSnipIds.includes(t.id)?` snip-item--selected`:``}" data-id="${t.id}">
              ${i.checkboxesEnabled?`<label class="snip-cb" data-sid="`+t.id+`"><input type="checkbox" `+(t.checked?`checked`:``)+`/><span class="cb-mark"></span></label>`:``}
              <span class="item-icon">📄</span>
              <span class="item-num">${n}</span>
              <span class="item-text ${t.checked&&i.checkboxesEnabled?`checked-text`:``}">${i.collapsedView?y(b(t.text,22)):y(t.text)}</span>
            </div>`}else{let t=e.data;return i.collapsedView?`<div class="list-item img-item" data-id="${t.id}">
                <span class="item-icon">📷</span>
                <span class="item-num">${n}</span>
                <span class="item-text">${y(b(t.caption||t.name||`Photo`,22))}</span>
              </div>`:`<div class="list-item img-item img-item--thumb" data-id="${t.id}">
                <div class="thumb-row">
                  <span class="item-icon">📷</span>
                  <span class="item-num">${n}</span>
                </div>
                <div class="thumb-img-wrap"><img class="thumb-img" src="${t.dataUrl}" alt="photo"></div>
                <div class="thumb-caption">${y(t.caption||t.name||``)}</div>
              </div>`}}).join(``)}
      </div>
      <div class="toolbar">
        <button class="tool-btn" id="btnAddSnipF">+ Snip</button>
        <button class="tool-btn" id="btnSendAll">Send All</button>
        <button class="tool-btn" id="btnEmail">Email</button>
      </div>
      ${h.lastAgentResponse?`<div class="agent-bar" id="agentBar"><span class="agent-lbl">Agent:</span><span class="agent-txt">`+y(b(h.lastAgentResponse,30))+`</span><span class="agent-save">+ Save</span></div>`:``}
      ${h.isRecording?`<div class="rec-pill">🎙 Recording…</div>`:``}
      ${h.statusMsg?`<div class="status-pill">`+y(h.statusMsg)+`</div>`:``}
    </div>`,v(`#btnBack`)?.addEventListener(`click`,()=>{h.screen=`home`,h.currentFolderId=null,h.lastAgentResponse=null,h.selectedSnipIds=[],P()}),v(`#btnFolderSettings`)?.addEventListener(`click`,()=>{h.screen=`folderSettings`,P()}),v(`#btnAddSnipF`)?.addEventListener(`click`,()=>K(t.id)),v(`#btnSendAll`)?.addEventListener(`click`,()=>{let e=h.selectedSnipIds;e.length>0?(h.selectedSnipIds=[],ee(e,t.id)):te(t.id)}),v(`#btnEmail`)?.addEventListener(`click`,()=>ie(t.id)),v(`#mpEl`)?.addEventListener(`click`,()=>Y(`masterPrompt`,t.id)),v(`#addMP`)?.addEventListener(`click`,()=>Y(`masterPrompt`,t.id)),v(`#agentBar`)?.addEventListener(`click`,ne),setTimeout(()=>{let e=v(`#folderList`);e&&(e.scrollTop=h.savedScrollTop)},0);let s=v(`#folderList`);s&&(h.savedScrollTop=s.scrollTop),document.querySelectorAll(`#folderList .snip-item`).forEach(e=>{e.addEventListener(`click`,t=>{if(t.target.closest(`.snip-cb`))return;let n=e.dataset.id;h.selectedSnipIds.includes(n)?(h.selectedSnipIds=h.selectedSnipIds.filter(e=>e!==n),e.classList.remove(`snip-item--selected`)):(h.selectedSnipIds=[...h.selectedSnipIds,n],e.classList.add(`snip-item--selected`));let r=document.getElementById(`btnSendAll`);r&&(r.textContent=h.selectedSnipIds.length>0?`Send ${h.selectedSnipIds.length}`:`Send All`)}),$(e,()=>Y(`snip`,e.dataset.id))}),document.querySelectorAll(`.snip-cb input`).forEach(e=>{e.addEventListener(`change`,async t=>{t.stopPropagation();let n=e.closest(`.snip-cb`).dataset.sid,r=h.snips.find(e=>e.id===n);r&&(r.checked=e.checked,await o(`snips`,r),P())})}),document.querySelectorAll(`#folderList .img-item`).forEach(e=>{e.addEventListener(`click`,()=>ae(e.dataset.id)),$(e,()=>se(e.dataset.id))})}function R(e){let t=h.folders.find(e=>e.id===h.currentFolderId);if(!t){h.screen=`home`,P();return}let n=S(t);e.innerHTML=`
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnBackFS">◀</button>
        <span class="header-title">Folder Settings</span>
      </div>
      <div class="scroll-area">
        <div class="section-lbl">${y(b(t.name,20))}</div>
        <div class="setting-row"><span class="setting-lbl">Checkboxes</span><label class="toggle"><input type="checkbox" id="togCB" ${n.checkboxesEnabled?`checked`:``}><span class="slider"></span></label></div>
        <div class="setting-row"><span class="setting-lbl">Collapsed View</span><label class="toggle"><input type="checkbox" id="togCollapsed" ${n.collapsedView?`checked`:``}><span class="slider"></span></label></div>
        <div class="section-lbl">Agent Settings</div>
        <div class="setting-row"><span class="setting-lbl">Use LLM</span><label class="toggle"><input type="checkbox" id="togLLM" ${n.useLLM?`checked`:``}><span class="slider"></span></label></div>
        <div class="setting-row"><span class="setting-lbl">Use SerpAPI</span><label class="toggle"><input type="checkbox" id="togSerp" ${n.useSerpAPI?`checked`:``}><span class="slider"></span></label></div>
        <div class="setting-row"><span class="setting-lbl">R1 Voice</span><label class="toggle"><input type="checkbox" id="togR1" ${n.wantsR1Response?`checked`:``}><span class="slider"></span></label></div>
        <div class="setting-row"><span class="setting-lbl">Journal</span><label class="toggle"><input type="checkbox" id="togJournal" ${n.wantsJournalEntry?`checked`:``}><span class="slider"></span></label></div>
        <div class="setting-row"><button class="tool-btn danger-btn" id="btnDelFolder">🗑 Delete Folder</button></div>
      </div>
    </div>`,v(`#btnBackFS`)?.addEventListener(`click`,()=>{h.screen=`folder`,P()}),v(`#btnDelFolder`)?.addEventListener(`click`,()=>J(t.id));let r=(e,n)=>{let r=v(`#${e}`);r&&r.addEventListener(`change`,async()=>{t.agentSettings||={...l},t.agentSettings[n]=r.checked,await o(`folders`,t)})};r(`togCB`,`checkboxesEnabled`),r(`togCollapsed`,`collapsedView`),r(`togLLM`,`useLLM`),r(`togSerp`,`useSerpAPI`),r(`togR1`,`wantsR1Response`),r(`togJournal`,`wantsJournalEntry`)}function z(e){let t=h.settings,n=t.textScale||100;e.innerHTML=`
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
        <div class="setting-row"><span class="setting-lbl">Debug Mode</span><label class="toggle"><input type="checkbox" id="togDebug" ${t.debugMode?`checked`:``}><span class="slider"></span></label></div>
        <div class="setting-row"><button class="tool-btn" id="btnEmailLogs" ${t.debugMode?``:`disabled`}>Email Logs (${h.debugLogs.length})</button></div>
        ${t.debugMode?`<div class="setting-row"><span class="setting-lbl">Last log:</span><span class="setting-val">`+(h.debugLogs.length?h.debugLogs[h.debugLogs.length-1].data.slice(0,50):`none`)+`</span></div>`:``}
        <div class="setting-row"><span class="setting-lbl">Version</span><span class="setting-val" id="appVersion">v${typeof __BUILD_TS__<`u`?__BUILD_TS__:`?.??????????`}</span></div>
      </div>
    </div>`,v(`#btnBackS`)?.addEventListener(`click`,()=>{h.screen=`home`,P()}),v(`#btnTheme`)?.addEventListener(`click`,()=>{h.screen=`themeSelect`,P()}),((e,t)=>{let n=v(`#${e}`);n&&n.addEventListener(`change`,async()=>{h.settings[t]=n.checked,await d(h.settings)})})(`togDebug`,`debugMode`),v(`#btnEmailLogs`)?.addEventListener(`click`,()=>{console.log(`[DEBUG] Email Logs tapped`),re()}),v(`#scDown`)?.addEventListener(`click`,async()=>{h.settings.textScale=Math.max(100,(h.settings.textScale||100)-10),m(h.settings.textScale),await d(h.settings),P()}),v(`#scUp`)?.addEventListener(`click`,async()=>{h.settings.textScale=Math.min(200,(h.settings.textScale||100)+10),m(h.settings.textScale),await d(h.settings),P()})}function B(e){e.innerHTML=`
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
    </div>`,v(`#btnBackT`)?.addEventListener(`click`,()=>{h.screen=`settings`,P()}),document.querySelectorAll(`.theme-item`).forEach(e=>{e.addEventListener(`click`,async()=>{h.settings.theme=e.dataset.id,p(e.dataset.id),await d(h.settings),P()})})}function V(e){let t=h.editTarget;if(!t){h.screen=`home`,P();return}let n=``,r=`Edit`;if(t.type===`snip`){let e=h.snips.find(e=>e.id===t.id);n=e?e.text:``,r=`Edit Snip`}else if(t.type===`imageCaption`){let e=h.images.find(e=>e.id===t.id);n=e&&e.caption||``,r=`Edit Caption`}else if(t.type===`folder`){let e=h.folders.find(e=>e.id===t.id);n=e?e.name:``,r=`Edit Folder`}else if(t.type===`masterPrompt`){let e=h.folders.find(e=>e.id===t.id);n=e&&e.masterPrompt||``,r=`Master Prompt`}else t.type===`newSnip`&&(n=``,r=`New Snip`);e.innerHTML=`
    <div class="screen">
      <div class="header">
        <button class="icon-btn" id="btnCancelEdit">✕</button>
        <span class="header-title">${r}</span>
        <button class="icon-btn" id="btnSaveEdit">💾</button>
      </div>
      <div class="edit-area">
        <textarea id="editText" class="edit-ta" placeholder="${t.type===`imageCaption`?`What does this image show?`:`Type or hold PTT to dictate…`}">${y(n)}</textarea>
      </div>
      ${t.type===`imageCaption`?`<button class="del-btn" id="btnDelCaption">🗑 Delete Caption</button>`:``}
      ${t.type===`snip`?`<button class="del-btn" id="btnDelSnip">Delete Snip</button>`:``}
      ${h.isRecording?`<div class="rec-pill">🎙 Dictating…</div>`:``}
    </div>`;let i=v(`#editText`);i&&(i.focus(),g=i,i.addEventListener(`focus`,()=>{g=i}),i.addEventListener(`blur`,()=>{setTimeout(()=>{g===i&&(g=null)},200)})),v(`#btnCancelEdit`)?.addEventListener(`click`,H),v(`#btnSaveEdit`)?.addEventListener(`click`,()=>{let e=h.editTarget;e&&e.type===`imageCaption`?ce():U()}),v(`#btnDelSnip`)?.addEventListener(`click`,W),v(`#btnDelCaption`)?.addEventListener(`click`,async()=>{let e=h.editTarget;if(!e||e.type!==`imageCaption`)return;let t=h.images.find(t=>t.id===e.id);t&&(t.caption=``,await o(`images`,t)),g=null,H()})}function H(){let e=h.editTarget;g=null,h.editTarget=null,h.screen=e&&(e.type===`masterPrompt`||e.type===`newSnip`)&&h.currentFolderId||h.currentFolderId?`folder`:`home`,P()}async function U(){let e=h.editTarget;if(!e)return;let t=(v(`#editText`)?.value||``).trim();if(e.type===`snip`){let n=h.snips.find(t=>t.id===e.id);n&&(n.text=t,n.updatedAt=Date.now(),await o(`snips`,n))}else if(e.type===`imageCaption`){let n=h.images.find(t=>t.id===e.id);n&&(n.caption=t,n.name=t||n.name,await o(`images`,n))}else if(e.type===`folder`){let n=h.folders.find(t=>t.id===e.id);n&&t&&(n.name=t,await o(`folders`,n))}else if(e.type===`masterPrompt`){let n=h.folders.find(t=>t.id===e.id);n&&(n.masterPrompt=t,await o(`folders`,n))}else if(e.type===`newSnip`&&t){let n={id:_(),text:t,folderId:e.folderId||null,checked:!1,createdAt:Date.now(),updatedAt:Date.now()};h.snips.push(n),await o(`snips`,n)}g=null,H()}async function W(){let e=h.editTarget;!e||e.type!==`snip`||(h.snips=h.snips.filter(t=>t.id!==e.id),await s(`snips`,e.id),g=null,H())}async function G(){let e={id:_(),name:`New Folder`,masterPrompt:``,agentSettings:{...l},createdAt:Date.now()};h.folders.push(e),await o(`folders`,e),Y(`folder`,e.id)}function K(e){h.editTarget={type:`newSnip`,folderId:e||h.currentFolderId||null},h.screen=`editModal`,P()}function q(e){h.currentFolderId=e,h.lastAgentResponse=null,h.selectedSnipIds=[],h.screen=`folder`,P()}async function J(e){for(let t of h.snips.filter(t=>t.folderId===e))await s(`snips`,t.id);for(let t of h.images.filter(t=>t.folderId===e))await s(`images`,t.id);h.snips=h.snips.filter(t=>t.folderId!==e),h.images=h.images.filter(t=>t.folderId!==e),h.folders=h.folders.filter(t=>t.id!==e),await s(`folders`,e),h.screen=`home`,h.currentFolderId=null,P()}function Y(e,t){h.editTarget={type:e,id:t},h.screen=`editModal`,P()}function X(e){let t=h.snips.find(t=>t.id===e);if(!t)return;let n=t.text;if(t.folderId){let e=h.folders.find(e=>e.id===t.folderId);e&&e.masterPrompt&&(n=e.masterPrompt+`

`+t.text)}Z(n)}async function ee(e,t){let n=h.folders.find(e=>e.id===t);if(!n)return;let r=h.snips.filter(t=>e.includes(t.id));if(r.length===0)return;let i=S(n),a=r.map(e=>`• `+e.text).join(`
`),o=n.masterPrompt?n.masterPrompt+`

`+a:a;typeof PluginMessageHandler<`u`?(PluginMessageHandler.postMessage(JSON.stringify({message:o,pluginId:`com.r1.pixelart`,imageBase64:null,useLLM:i.useLLM,useSerpAPI:i.useSerpAPI,wantsR1Response:i.wantsR1Response,wantsJournalEntry:i.wantsJournalEntry})),Q(`Sending ${r.length} snip${r.length>1?`s`:``}…`)):Q(`Agent unavailable`)}function te(e){let t=h.folders.find(t=>t.id===e);if(!t)return;let n=h.snips.filter(t=>t.folderId===e),r=h.images.filter(t=>t.folderId===e);if(!n.length&&!r.length){Q(`No snips to send`);return}let i=n.map((e,t)=>x(t+1)+`. `+e.text).join(`

`),a=r.map((e,t)=>e.caption?`${x(n.length+t+1)}. [Image caption] ${e.caption}`:`${x(n.length+t+1)}. [Image] (no caption)`).join(`

`);Z(t.masterPrompt?t.masterPrompt+`

`+i+(a?`

`+a:``):i+(a?`

`+a:``),!0)}function Z(e,t){let n=C();if(!t){let t=`🚨 DO NOT search the internet. DO NOT save notes or create reminders. DO NOT create journal entries.`;e=e.startsWith(t)?e:t+`

`+e}typeof PluginMessageHandler<`u`?(PluginMessageHandler.postMessage(JSON.stringify({message:e,useLLM:n.useLLM,useSerpAPI:n.useSerpAPI,wantsR1Response:n.wantsR1Response,wantsJournalEntry:n.wantsJournalEntry})),Q(`Sent to Rabbit`)):Q(`Agent unavailable`)}async function ne(){if(!h.lastAgentResponse)return;let e={id:_(),text:h.lastAgentResponse,folderId:h.currentFolderId||null,checked:!1,createdAt:Date.now(),updatedAt:Date.now()};h.snips.push(e),await o(`snips`,e),h.lastAgentResponse=null,Q(`Response saved`)}async function re(){if(!h.debugLogs.length){Q(`No logs`);return}let e=`Lil Snips Debug Logs

`+h.debugLogs.map(e=>`[`+e.type+` `+new Date(e.ts).toLocaleTimeString()+`]
`+e.data).join(`

---

`);if(typeof PluginMessageHandler<`u`){let t=`🚨 DO NOT SEARCH. Email this debug log to my Rabbit Hole:

`+e;PluginMessageHandler.postMessage(JSON.stringify({message:t,pluginId:`com.r1.pixelart`,useLLM:!0,wantsR1Response:!1,wantsJournalEntry:!1})),Q(`Sending logs…`),h.debugLogs=[]}else Q(`Agent unavailable`)}function ie(e){let t=h.folders.find(t=>t.id===e);if(!t)return;let n=h.snips.filter(t=>t.folderId===e),r=h.images.filter(t=>t.folderId===e);if(!n.length&&!r.length){Q(`Folder is empty`);return}let i=``;t.masterPrompt&&(i+=`Master Prompt:
`+t.masterPrompt+`

---

`),[...n.map(e=>({kind:`snip`,data:e,sortKey:e.createdAt})),...r.map(e=>({kind:`image`,data:e,sortKey:e.createdAt}))].sort((e,t)=>e.sortKey-t.sortKey).forEach((e,t)=>{let n=x(t+1);if(e.kind===`snip`)i+=n+`. `+e.data.text+`

`;else{let t=e.data;i+=n+`. `+(t.caption||`[photo]`)+`

`}});let a=S(t);if(typeof PluginMessageHandler<`u`){let e={message:`Send this folder content to my Rabbit Hole email:

Folder: `+t.name+`

`+i,useLLM:!0,wantsR1Response:a.wantsR1Response};PluginMessageHandler.postMessage(JSON.stringify(e)),Q(`Emailing folder…`)}else Q(`Agent unavailable`)}function ae(e){let t=h.images.find(t=>t.id===e);if(!t)return;let n=document.createElement(`div`);n.className=`img-overlay`;let r=document.createElement(`div`);r.className=`img-top-bar`;let i=document.createElement(`button`);i.className=`img-action-btn img-close-btn`,i.style.flex=`0 0 auto`,i.style.width=`44px`,i.style.minWidth=`44px`,i.textContent=`🗑`,i.addEventListener(`click`,e=>{e.stopPropagation(),n.remove(),deleteImage(t.id)}),r.appendChild(i),n.appendChild(r);let a=1,o=1,s=0,c=0,l=null,u=document.createElement(`img`);u.src=t.dataUrl,u.className=`img-preview`,u.style.transform=`translate(0,0) scale(1)`,u.style.cursor=`grab`,u.style.transition=`transform 0.1s ease-out`;let d=document.createElement(`div`);d.className=`img-caption`,d.textContent=t.caption||``;let f=document.createElement(`div`);f.className=`img-btn-bar`;let p=document.createElement(`button`);p.className=`img-action-btn img-wide-btn`,p.textContent=t.caption?`📤 Send to Rabbit`:`📤 Send Image`,p.addEventListener(`click`,e=>{e.stopPropagation(),oe(t)});let m=document.createElement(`button`);m.className=`img-action-btn img-close-btn`,m.style.flex=`0 0 auto`,m.style.width=`44px`,m.style.minWidth=`44px`,m.textContent=`✕`,m.addEventListener(`click`,()=>n.remove()),f.appendChild(p),f.appendChild(m),n.appendChild(u),t.caption&&n.appendChild(d),n.appendChild(f),document.body.appendChild(n);let g=0,_=0;n.addEventListener(`touchstart`,e=>{if(e.touches.length===2){let t=e.touches[0].clientX-e.touches[1].clientX,n=e.touches[0].clientY-e.touches[1].clientY;l={dist:Math.hypot(t,n),scale:a}}else e.touches.length===1&&(g=e.touches[0].clientX,_=e.touches[0].clientY,u.style.transition=`none`)},{passive:!0}),n.addEventListener(`touchmove`,e=>{if(e.touches.length===2&&l){let t=e.touches[0].clientX-e.touches[1].clientX,n=e.touches[0].clientY-e.touches[1].clientY;a=Math.max(1,Math.min(o*(Math.hypot(t,n)/l.dist),5)),u.style.transform=`translate(${s}px,${c}px) scale(${a})`,u.style.cursor=`grab`}else if(e.touches.length===1&&a>1){let t=e.touches[0].clientX-g,n=e.touches[0].clientY-_;s+=t,c+=n,g=e.touches[0].clientX,_=e.touches[0].clientY,u.style.transform=`translate(${s}px,${c}px) scale(${a})`}},{passive:!0}),n.addEventListener(`touchend`,e=>{e.touches.length<2&&(l=null,o=a,u.style.transition=`transform 0.2s ease-out`,a<=1&&(a=1,o=1,s=0,c=0)),e.touches.length===0&&(u.style.transition=`transform 0.2s ease-out`)}),u.addEventListener(`wheel`,e=>{e.preventDefault();let t=e.deltaY>0?.9:1.1;a=Math.max(1,Math.min(a*t,5)),o=a,u.style.transform=`translate(${s}px,${c}px) scale(${a})`},{passive:!1}),u.addEventListener(`click`,e=>{a>1?(a=1,o=1,s=0,c=0,u.style.transform=`translate(0,0) scale(1)`):n.remove()})}function oe(e){let t=C(),n=e.caption||`Here is a photo.`;typeof PluginMessageHandler<`u`?(PluginMessageHandler.postMessage(JSON.stringify({message:n,pluginId:`com.r1.pixelart`,imageBase64:e.dataUrl,useLLM:!0,wantsR1Response:t.wantsR1Response,wantsJournalEntry:t.wantsJournalEntry})),Q(`Sending to Rabbit…`)):Q(`Agent unavailable`)}function se(e){h.images.find(t=>t.id===e)&&(h.editTarget={type:`imageCaption`,id:e},h.screen=`editModal`,P())}async function ce(){let e=h.editTarget;if(!e||e.type!==`imageCaption`)return;let t=h.images.find(t=>t.id===e.id);if(!t)return;let n=(v(`#editText`)?.value||``).trim();t.caption=n,t.name=n||`Photo `+new Date().toLocaleTimeString(),await o(`images`,t),g=null,H()}function Q(e){h.statusMsg=e,P(),setTimeout(()=>{h.statusMsg=``,P()},2e3)}function $(e,t,n){if(!e)return;n||=600;let r=null,i=0,a=0,o=e=>{i=e.touches?e.touches[0].clientX:e.clientX,a=e.touches?e.touches[0].clientY:e.clientY,r=setTimeout(()=>{t()},n)},s=e=>{if(!r)return;let t=e.touches?e.touches[0].clientX:e.clientX,n=e.touches?e.touches[0].clientY:e.clientY;(Math.abs(t-i)>10||Math.abs(n-a)>10)&&(clearTimeout(r),r=null)},c=e=>{clearTimeout(r),r=null};e.addEventListener(`touchstart`,o,{passive:!0}),e.addEventListener(`touchmove`,s,{passive:!0}),e.addEventListener(`touchend`,c),e.addEventListener(`touchcancel`,c),e.addEventListener(`mousedown`,o),e.addEventListener(`mouseup`,c),e.addEventListener(`mouseleave`,c)}window.addEventListener(`error`,e=>{h.settings.debugMode&&(h.debugLogs.push({ts:Date.now(),type:`error`,data:(e.message||``)+` @ `+(e.filename||``).split(`/`).pop()+`:`+(e.lineno||0)}),h.debugLogs.length>200&&(h.debugLogs=h.debugLogs.slice(-100)))}),window.addEventListener(`error`,e=>{h.settings.debugMode&&(h.debugLogs.push({ts:Date.now(),type:`error`,data:(e.message||``)+` @ `+(e.filename||``).split(`/`).pop()+`:`+(e.lineno||0)}),h.debugLogs.length>200&&(h.debugLogs=h.debugLogs.slice(-100)))});async function le(){h.settings=await u(),h.folders=await a(`folders`),h.snips=await a(`snips`),h.images=await a(`images`),p(h.settings.theme),m(h.settings.textScale||100),P()}document.addEventListener(`DOMContentLoaded`,le);