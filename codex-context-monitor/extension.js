const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CMD_START = "codexContextMonitor.start";
const CMD_STOP = "codexContextMonitor.stop";
const CMD_DETAILS = "codexContextMonitor.showDetails";
const CMD_PIN = "codexContextMonitor.pinSession";
const CMD_UNPIN = "codexContextMonitor.unpinSession";
const CMD_FOCUS_OVERLAY = "codexContextMonitor.focusOverlay";
const SECTION = "codexContextMonitor";
const MAX_TAIL_BYTES = 256 * 1024;
const SESSION_SCAN_LIMIT = 20;
const PINNED_STATE_KEY = "pinnedSessionIds";
const OVERLAY_VIEW_ID = "codexContextMonitor.overlayView";

class Monitor {
  constructor(context) {
    this.context = context;
    this.timer = null;
    this.status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
    this.status.command = CMD_DETAILS;
    this.status.text = "$(pulse) Codex ctx: --";
    this.status.tooltip = "Codex context monitor";
    this.status.show();

    this.last = [];
    this.sessionPathCache = new Map();
    this.running = false;
    this.pinnedSessionIds = this.readPinnedIds();
    this.listeners = new Set();
  }

  get cfg() {
    return vscode.workspace.getConfiguration(SECTION);
  }

  get codexHome() {
    const override = String(this.cfg.get("codexHome", "") || "").trim();
    if (override) return override;
    return path.join(os.homedir(), ".codex");
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.tick().catch(() => {});
    const interval = Number(this.cfg.get("refreshIntervalMs", 1500));
    this.timer = setInterval(() => {
      this.tick().catch(() => {});
    }, Math.max(500, interval));
    this.setInfo("starting...");
    this.emitUpdate();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.running = false;
    this.status.backgroundColor = undefined;
    this.status.text = "$(debug-pause) Codex ctx: stopped";
    this.status.tooltip = "Codex context monitor stopped";
    this.emitUpdate();
  }

  dispose() {
    this.stop();
    this.status.dispose();
  }

  async tick() {
    const recentSessionIds = await this.resolveSessionIds();
    const sessionIds = this.unique([...this.pinnedSessionIds, ...recentSessionIds]);
    if (sessionIds.length === 0) {
      this.setInfo("no session");
      return;
    }

    const rows = [];
    for (const sessionId of sessionIds) {
      const sessionPath = await this.resolveSessionPath(sessionId);
      if (!sessionPath) continue;

      const tokenInfo = await this.readLatestTokenCount(sessionPath);
      if (!tokenInfo) continue;

      rows.push({
        ...tokenInfo,
        sessionId,
        sessionPath,
        seenAt: new Date()
      });
    }

    if (rows.length === 0) {
      this.setInfo("waiting tokens");
      return;
    }

    const activeWithinSec = Math.max(10, Number(this.cfg.get("activeWithinSec", 120)));
    const activeCutoff = Date.now() - activeWithinSec * 1000;
    const pinnedSet = new Set(this.pinnedSessionIds);
    for (const row of rows) {
      row.isPinned = pinnedSet.has(row.sessionId);
      row.isActive = row.tokenTimestampMs >= activeCutoff;
    }

    const maxSessions = Math.min(3, Math.max(1, Number(this.cfg.get("maxSessions", 3))));
    const pinnedOrder = new Map(this.pinnedSessionIds.map((id, idx) => [id, idx]));
    const pinnedRows = rows
      .filter((row) => row.isPinned)
      .sort((a, b) => (pinnedOrder.get(a.sessionId) || 0) - (pinnedOrder.get(b.sessionId) || 0));
    const activeRows = rows
      .filter((row) => row.isActive && !row.isPinned)
      .sort((a, b) => b.tokenTimestampMs - a.tokenTimestampMs);

    this.last = [...pinnedRows, ...activeRows].slice(0, maxSessions);
    if (this.last.length === 0) {
      this.setInfo("no active");
      return;
    }
    this.render();
  }

  setInfo(msg) {
    this.status.backgroundColor = undefined;
    this.status.text = `$(pulse) Codex ctx: ${msg}`;
    this.status.tooltip = "Codex context monitor";
    this.emitUpdate();
  }

  render() {
    if (!this.last || this.last.length === 0) {
      this.setInfo("--");
      return;
    }

    const pieces = this.last.map((row, index) => {
      const ratio = row.modelContextWindow > 0 ? row.turnInputTokens / row.modelContextWindow : 0;
      const pct = (ratio * 100).toFixed(1);
      const kind = row.isPinned ? (row.isActive ? "P" : "P~") : "A";
      return `${kind}${index + 1}:${this.gauge(ratio, 20)}${pct}%`;
    });
    this.status.text = `$(pulse) Codex ${pieces.join(" ")}`;

    const warn = Number(this.cfg.get("warningThreshold", 0.8));
    const critical = Number(this.cfg.get("criticalThreshold", 0.92));
    const maxRatio = Math.max(...this.last.map((row) => (
      row.modelContextWindow > 0 ? row.turnInputTokens / row.modelContextWindow : 0
    )));
    if (maxRatio >= critical) {
      this.status.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground");
    } else if (maxRatio >= warn) {
      this.status.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
    } else {
      this.status.backgroundColor = undefined;
    }

    const details = [];
    this.last.forEach((row, index) => {
      const ratio = row.modelContextWindow > 0 ? (row.turnInputTokens / row.modelContextWindow) * 100 : 0;
      const kind = row.isPinned ? (row.isActive ? "pinned+active" : "pinned") : "active";
      details.push(`#${index + 1} ${row.sessionId} (${kind})`);
      details.push(`usage: ${ratio.toFixed(2)}% ${this.gauge(ratio, 20)} (${row.turnInputTokens}/${row.modelContextWindow})`);
      details.push(`last_total: ${row.turnTotalTokens}, last_output: ${row.turnOutputTokens}, last_reasoning: ${row.turnReasoningOutputTokens}`);
      details.push(`session_cumulative_total: ${row.cumulativeTotalTokens}`);
      details.push(`token_timestamp: ${new Date(row.tokenTimestampMs).toLocaleString()}`);
      details.push(`updated: ${row.seenAt.toLocaleTimeString()}`);
      details.push("");
    });
    this.status.tooltip = details.join("\n").trim();
    this.emitUpdate();
  }

  async showDetails() {
    if (!this.last || this.last.length === 0) {
      vscode.window.showInformationMessage("Codex Context Monitor: no token data yet.");
      return;
    }
    const blocks = this.last.map((row, index) => {
      const ratio = row.modelContextWindow > 0
        ? (row.turnInputTokens / row.modelContextWindow) * 100
        : 0;
      return [
        `#${index + 1}`,
        `Session ID: ${row.sessionId}`,
        `Kind: ${row.isPinned ? (row.isActive ? "Pinned + Active" : "Pinned") : "Active"}`,
        `Usage (Turn Input / Window): ${ratio.toFixed(2)}%`,
        `Turn Input Tokens: ${row.turnInputTokens}`,
        `Context Window: ${row.modelContextWindow}`,
        `Last Turn Total Tokens: ${row.turnTotalTokens}`,
        `Last Turn Output Tokens: ${row.turnOutputTokens}`,
        `Last Turn Reasoning Output Tokens: ${row.turnReasoningOutputTokens}`,
        `Session Cumulative Total Tokens: ${row.cumulativeTotalTokens}`,
        `Session Log: ${row.sessionPath}`,
        `Updated At: ${row.seenAt.toLocaleString()}`
      ].join("\n");
    });
    const text = blocks.join("\n\n");
    await vscode.window.showInformationMessage(text, { modal: true });
  }

  readPinnedIds() {
    const raw = this.context.globalState.get(PINNED_STATE_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw
      .map((v) => String(v || "").trim())
      .filter(Boolean)
      .slice(0, 3);
  }

  async savePinnedIds() {
    this.pinnedSessionIds = this.unique(this.pinnedSessionIds).slice(0, 3);
    await this.context.globalState.update(PINNED_STATE_KEY, this.pinnedSessionIds);
  }

  async pinSession() {
    const input = await vscode.window.showInputBox({
      prompt: "Pin session ID (UUID) for persistent gauge display",
      placeHolder: "019c....",
      ignoreFocusOut: true
    });
    const sessionId = String(input || "").trim();
    if (!sessionId) return;

    const sessionPath = await this.resolveSessionPath(sessionId);
    if (!sessionPath) {
      vscode.window.showErrorMessage(`Codex Context Monitor: session not found: ${sessionId}`);
      return;
    }

    if (!this.pinnedSessionIds.includes(sessionId)) {
      this.pinnedSessionIds.push(sessionId);
      await this.savePinnedIds();
    }
    await this.tick();
    vscode.window.showInformationMessage(`Codex Context Monitor: pinned ${sessionId}`);
  }

  async unpinSession() {
    if (this.pinnedSessionIds.length === 0) {
      vscode.window.showInformationMessage("Codex Context Monitor: no pinned sessions.");
      return;
    }

    const selected = await vscode.window.showQuickPick(
      this.pinnedSessionIds.map((id) => ({ label: id })),
      { title: "Unpin session", canPickMany: false }
    );
    if (!selected) return;

    this.pinnedSessionIds = this.pinnedSessionIds.filter((id) => id !== selected.label);
    await this.savePinnedIds();
    await this.tick();
    vscode.window.showInformationMessage(`Codex Context Monitor: unpinned ${selected.label}`);
  }

  onDidUpdate(listener) {
    this.listeners.add(listener);
    return new vscode.Disposable(() => {
      this.listeners.delete(listener);
    });
  }

  emitUpdate() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {}
    }
  }

  formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(Number(value || 0));
  }

  gauge(ratio, width) {
    const r = Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : 0;
    const filled = Math.round(r * width);
    return `[${"#".repeat(filled)}${"-".repeat(width - filled)}]`;
  }

  unique(values) {
    const out = [];
    const seen = new Set();
    for (const value of values) {
      const v = String(value || "");
      if (!v || seen.has(v)) continue;
      seen.add(v);
      out.push(v);
    }
    return out;
  }

  async resolveSessionIds() {
    const historyPath = path.join(this.codexHome, "history.jsonl");
    const tail = await this.readTail(historyPath, 128 * 1024);
    if (!tail) return [];

    const maxSessions = Math.min(3, Math.max(1, Number(this.cfg.get("maxSessions", 3))));
    const ids = [];
    const seen = new Set();
    const lines = tail.split(/\r?\n/).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      const obj = this.tryParseJson(lines[i]);
      if (!obj) continue;
      if (!obj.session_id) continue;
      const id = String(obj.session_id);
      if (seen.has(id)) continue;
      seen.add(id);
      ids.push(id);
      if (ids.length >= SESSION_SCAN_LIMIT) break;
    }
    return ids;
  }

  async resolveSessionPath(sessionId) {
    const cached = this.sessionPathCache.get(sessionId);
    if (cached && fs.existsSync(cached)) {
      return cached;
    }

    const sessionsRoot = path.join(this.codexHome, "sessions");
    const target = `${sessionId}.jsonl`;
    const found = this.findFileBySuffix(sessionsRoot, target);
    if (found) {
      this.sessionPathCache.set(sessionId, found);
      return found;
    }
    return null;
  }

  findFileBySuffix(root, suffix) {
    if (!fs.existsSync(root)) return null;
    const stack = [root];
    while (stack.length > 0) {
      const dir = stack.pop();
      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          stack.push(full);
          continue;
        }
        if (entry.isFile() && entry.name.endsWith(suffix)) return full;
      }
    }
    return null;
  }

  async readLatestTokenCount(sessionPath) {
    const tail = await this.readTail(sessionPath, MAX_TAIL_BYTES);
    if (!tail) return null;

    const lines = tail.split(/\r?\n/).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      const obj = this.tryParseJson(lines[i]);
      if (!obj || obj.type !== "event_msg") continue;
      const payload = obj.payload;
      if (!payload || payload.type !== "token_count") continue;
      const info = payload.info || {};
      const total = info.total_token_usage || {};
      const last = info.last_token_usage || {};

      return {
        turnInputTokens: Number(last.input_tokens || 0),
        turnTotalTokens: Number(last.total_tokens || 0),
        turnOutputTokens: Number(last.output_tokens || 0),
        turnReasoningOutputTokens: Number(last.reasoning_output_tokens || 0),
        cumulativeTotalTokens: Number(total.total_tokens || 0),
        modelContextWindow: Number(info.model_context_window || 0),
        tokenTimestampMs: Date.parse(String(obj.timestamp || "")) || 0
      };
    }
    return null;
  }

  async readTail(filePath, maxBytes) {
    let fd;
    try {
      const st = await fs.promises.stat(filePath);
      if (!st.isFile()) return null;
      fd = await fs.promises.open(filePath, "r");
      const size = st.size;
      const length = Math.min(size, maxBytes);
      const start = Math.max(0, size - length);
      const buf = Buffer.alloc(length);
      await fd.read(buf, 0, length, start);
      return buf.toString("utf8");
    } catch {
      return null;
    } finally {
      if (fd) await fd.close().catch(() => {});
    }
  }

  tryParseJson(line) {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }
}

class OverlayViewProvider {
  constructor(monitor) {
    this.monitor = monitor;
    this.view = null;
    this.sub = null;
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;
    this.view.webview.options = { enableScripts: false };
    this.render();
    this.sub = this.monitor.onDidUpdate(() => this.render());
  }

  dispose() {
    if (this.sub) this.sub.dispose();
    this.sub = null;
  }

  render() {
    if (!this.view) return;
    const rows = this.monitor.last || [];
    const status = this.monitor.running ? "running" : "stopped";
    const pinned = this.monitor.pinnedSessionIds || [];
    this.view.webview.html = this.getHtml(rows, status, pinned);
  }

  getHtml(rows, status, pinned) {
    const cards = rows.length === 0
      ? `<div class="empty">No active sessions</div>`
      : rows.map((row, idx) => this.renderRow(row, idx + 1)).join("");

    const pinnedText = pinned.length > 0 ? pinned.join(", ") : "(none)";
    return `<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: var(--vscode-editor-font-family); color: var(--vscode-foreground); padding: 8px; }
    .head { margin-bottom: 8px; }
    .card { border: 1px solid var(--vscode-editorWidget-border); border-radius: 8px; padding: 8px; margin-bottom: 8px; background: var(--vscode-editorWidget-background); }
    .title { font-weight: 700; margin-bottom: 4px; font-size: 12px; }
    .mono { font-family: var(--vscode-editor-font-family); white-space: pre; font-size: 12px; }
    .sub { opacity: 0.9; font-size: 12px; margin-top: 3px; }
    .meta { opacity: 0.75; font-size: 11px; margin-top: 5px; word-break: break-all; }
    .empty { opacity: 0.8; font-size: 12px; padding: 8px; border: 1px dashed var(--vscode-editorWidget-border); border-radius: 8px; }
  </style>
</head>
<body>
  <div class="head">
    <div><strong>Codex Context Overlay</strong></div>
    <div class="sub">Status: ${this.escape(status)}</div>
  </div>
  ${cards}
  <div class="meta">Pinned: ${this.escape(pinnedText)}</div>
</body>
</html>`;
  }

  renderRow(row, index) {
    const ratio = row.modelContextWindow > 0 ? row.turnInputTokens / row.modelContextWindow : 0;
    const pct = (ratio * 100).toFixed(1);
    const kind = row.isPinned ? (row.isActive ? "Pinned+Active" : "Pinned") : "Active";
    const gauge = this.monitor.gauge(ratio, 20);
    return `<div class="card">
  <div class="title">#${index} ${this.escape(kind)}</div>
  <div class="mono">${this.escape(`${gauge} ${pct}%`)}</div>
  <div class="sub">${this.escape(`${row.turnInputTokens}/${row.modelContextWindow}`)}</div>
  <div class="meta">${this.escape(row.sessionId)}</div>
</div>`;
  }

  escape(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const monitor = new Monitor(context);
  const overlay = new OverlayViewProvider(monitor);

  context.subscriptions.push(
    monitor,
    overlay,
    vscode.window.registerWebviewViewProvider(OVERLAY_VIEW_ID, overlay),
    vscode.commands.registerCommand(CMD_START, () => {
      monitor.start();
      vscode.window.showInformationMessage("Codex Context Monitor started.");
    }),
    vscode.commands.registerCommand(CMD_STOP, () => {
      monitor.stop();
      vscode.window.showInformationMessage("Codex Context Monitor stopped.");
    }),
    vscode.commands.registerCommand(CMD_DETAILS, () => monitor.showDetails()),
    vscode.commands.registerCommand(CMD_PIN, () => monitor.pinSession()),
    vscode.commands.registerCommand(CMD_UNPIN, () => monitor.unpinSession()),
    vscode.commands.registerCommand(CMD_FOCUS_OVERLAY, async () => {
      await vscode.commands.executeCommand("workbench.view.explorer");
      await vscode.commands.executeCommand(`${OVERLAY_VIEW_ID}.focus`);
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration(SECTION)) return;
      const enabled = vscode.workspace.getConfiguration(SECTION).get("enabled", true);
      monitor.stop();
      if (enabled) monitor.start();
    })
  );

  if (vscode.workspace.getConfiguration(SECTION).get("enabled", true)) {
    monitor.start();
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
