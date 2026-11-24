(function () {
  if (window.__hbx) return; window.__hbx = true;
  const KEY = 'hbx_cfg';
  const def = { showFps: true, hudOpacity: 0.8, hudColor: '#00ff88', hudSize: 14,
    hudPos: 'tl', lite: false, avMode: 'off', avList: '🔴,🟠,🟡,🟢,🔵,🟣', avMs: 500 };
  let cfg = Object.assign({}, def);
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} apply(); };

  const RAINBOW = ['🔴','🟠','🟡','🟢','🔵','🟣'];
  const hud = document.createElement('div');
  const gear = document.createElement('div');
  const panel = document.createElement('div');
  const css = 'position:fixed;z-index:2147483647;font-family:monospace;';
  hud.style.cssText = css + 'pointer-events:none;padding:4px 8px;background:rgba(0,0,0,.45);border-radius:6px;';
  gear.textContent = '⚙'; gear.style.cssText = css + 'right:8px;top:8px;font-size:22px;color:#fff;background:rgba(0,0,0,.5);border-radius:50%;width:36px;height:36px;text-align:center;line-height:36px;';
  panel.style.cssText = css + 'right:8px;top:50px;display:none;background:rgba(20,20,20,.95);color:#fff;padding:10px;border-radius:8px;font-size:13px;max-width:260px;max-height:80vh;overflow:auto;';
  document.body.append(hud, gear, panel);
  gear.onclick = () => { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; };

  function row(label, el) { const d = document.createElement('div'); d.style.margin = '6px 0'; d.append(label + ' ', el); panel.append(d); }
  function chk(k) { const e = document.createElement('input'); e.type = 'checkbox'; e.checked = cfg[k]; e.onchange = () => { cfg[k] = e.checked; save(); }; return e; }
  function rng(k, min, max, step) { const e = document.createElement('input'); e.type = 'range'; e.min = min; e.max = max; e.step = step; e.value = cfg[k]; e.oninput = () => { cfg[k] = +e.value; save(); }; return e; }
  function sel(k, opts) { const e = document.createElement('select'); opts.forEach(([v, t]) => { const o = document.createElement('option'); o.value = v; o.textContent = t; e.append(o); }); e.value = cfg[k]; e.onchange = () => { cfg[k] = e.value; save(); }; return e; }
  function txt(k, num) { const e = document.createElement('input'); e.value = cfg[k]; e.style.width = '150px'; e.onchange = () => { cfg[k] = num ? Math.max(100, +e.value || 500) : e.value; save(); }; return e; }
  function col(k) { const e = document.createElement('input'); e.type = 'color'; e.value = cfg[k]; e.oninput = () => { cfg[k] = e.value; save(); }; return e; }

  panel.innerHTML = '<b>HUD</b>';
  row('Mostrar FPS', chk('showFps'));
  row('Opacidade', rng('hudOpacity', 0.2, 1, 0.05));
  row('Tamanho', rng('hudSize', 10, 32, 1));
  row('Cor', col('hudColor'));
  row('Posição', sel('hudPos', [['tl','Topo esq.'],['tr','Topo dir.'],['bl','Baixo esq.'],['br','Baixo dir.']]));
  const h2 = document.createElement('div'); h2.innerHTML = '<br><b>Avatar</b>'; panel.append(h2);
  row('Modo', sel('avMode', [['off','Desligado'],['rainbow','Arco-íris'],['custom','Lista própria']]));
  row('Lista', txt('avList'));
  row('Intervalo (ms)', txt('avMs', true));
  const h3 = document.createElement('div'); h3.innerHTML = '<br><b>Desempenho</b>'; panel.append(h3);
  row('Modo leve', chk('lite'));

  function apply() {
    hud.style.display = cfg.showFps ? 'block' : 'none';
    hud.style.opacity = cfg.hudOpacity; hud.style.color = cfg.hudColor; hud.style.fontSize = cfg.hudSize + 'px';
    hud.style.top = hud.style.bottom = hud.style.left = hud.style.right = 'auto';
    hud.style[cfg.hudPos[0] === 't' ? 'top' : 'bottom'] = '8px';
    hud.style[cfg.hudPos[1] === 'l' ? 'left' : 'right'] = cfg.hudPos[1] === 'r' ? '56px' : '8px';
    let st = document.getElementById('hbx-lite');
    if (cfg.lite) {
      if (!st) { st = document.createElement('style'); st.id = 'hbx-lite';
        st.textContent = '*{animation:none!important;transition:none!important;text-shadow:none!important;box-shadow:none!important}canvas{will-change:transform}'; document.head.append(st); }
    } else if (st) st.remove();
    restartAvatar();
  }

  // FPS
  let frames = 0, last = performance.now();
  (function loop(t) { frames++; if (t - last >= 500) { hud.textContent = Math.round(frames * 1000 / (t - last)) + ' FPS'; frames = 0; last = t; } requestAnimationFrame(loop); })(last);

  // Avatar: usa o comando /avatar do chat do HaxBall
  function gameDoc() { try { const f = document.querySelector('iframe'); return f && f.contentDocument; } catch (e) { return null; } }
  function sendAvatar(emoji) {
    const d = gameDoc(); if (!d) return;
    const inp = d.querySelector('[data-hook="input"]'); if (!inp) return;
    if (d.activeElement === inp && inp.value && !inp.value.startsWith('/avatar')) return; // não atrapalha quem está digitando
    inp.value = '/avatar ' + emoji;
    const w = d.defaultView;
    ['keydown', 'keyup'].forEach(type => inp.dispatchEvent(new w.KeyboardEvent(type, { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true })));
    inp.value = '';
  }
  let timer = null, idx = 0;
  function restartAvatar() {
    clearInterval(timer); timer = null; idx = 0;
    if (cfg.avMode === 'off') return;
    const list = cfg.avMode === 'rainbow' ? RAINBOW : cfg.avList.split(',').map(s => s.trim()).filter(Boolean);
    if (!list.length) return;
    timer = setInterval(() => { sendAvatar(list[idx++ % list.length]); }, Math.max(100, cfg.avMs));
  }
  apply();
})();
