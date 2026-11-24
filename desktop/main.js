const { app, BrowserWindow, shell } = require('electron');
const fs = require('fs');
const path = require('path');

// Desempenho: GPU e FPS
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('disable-gpu-vsync');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    title: 'HaxBall Boost',
    webPreferences: { contextIsolation: true, nodeIntegration: false, backgroundThrottling: false }
  });
  win.setMenu(null);

  // Parece um Chrome normal para o site
  win.webContents.setUserAgent(win.webContents.getUserAgent().replace(/Electron\/\S+ /, ''));

  const js = fs.readFileSync(path.join(__dirname, 'inject.js'), 'utf8');
  win.webContents.on('did-finish-load', () => { win.webContents.executeJavaScript(js).catch(() => {}); });

  // Links externos abrem no navegador
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!/^https:\/\/([a-z0-9-]+\.)?haxball\.com\//i.test(url)) { shell.openExternal(url); return { action: 'deny' }; }
    return { action: 'allow' };
  });

  // F11 = tela cheia, F5 = recarregar, Ctrl+Shift+I = ferramentas
  win.webContents.on('before-input-event', (e, i) => {
    if (i.type !== 'keyDown') return;
    if (i.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (i.key === 'F5') { win.webContents.reload(); e.preventDefault(); }
    if (i.control && i.shift && i.key.toLowerCase() === 'i') { win.webContents.toggleDevTools(); e.preventDefault(); }
  });

  win.loadURL('https://www.haxball.com/play');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
