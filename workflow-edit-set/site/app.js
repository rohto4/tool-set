const paletteItems = [
  { type: "compute", label: "EC2", color: "#f59e0b", description: "App runtime", icon: "../assets/icons/compute.png" },
  { type: "storage", label: "S3", color: "#fb7185", description: "Object storage", icon: "../assets/icons/storage.png" },
  { type: "database", label: "RDS", color: "#0ea5e9", description: "Relational DB", icon: "../assets/icons/database.png" },
  { type: "network", label: "VPC", color: "#10b981", description: "Network boundary", icon: "../assets/icons/network.png" },
  { type: "security", label: "IAM", color: "#8b5cf6", description: "Access control", icon: "../assets/icons/security.png" },
  { type: "integration", label: "Lambda", color: "#f97316", description: "Event handler", icon: "../assets/icons/integration.png" }
];

const state = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  connectMode: false
};

const palette = document.getElementById("palette");
const canvas = document.getElementById("canvas");
const nodeLayer = document.getElementById("nodeLayer");
const edgeLayer = document.getElementById("edgeLayer");
const nodeTemplate = document.getElementById("nodeTemplate");
const emptyInspector = document.getElementById("emptyInspector");
const inspectorForm = document.getElementById("inspectorForm");
const labelInput = document.getElementById("labelInput");
const colorInput = document.getElementById("colorInput");
const typeInput = document.getElementById("typeInput");
const deleteButton = document.getElementById("deleteButton");
const connectModeButton = document.getElementById("connectModeButton");
const clearButton = document.getElementById("clearButton");
const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");
const svgButton = document.getElementById("svgButton");
const fileInput = document.getElementById("fileInput");

let dragState = null;
let connectStartId = null;

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function getPaletteItem(type) {
  return paletteItems.find((item) => item.type === type) ?? paletteItems[0];
}

function hydrateNode(node) {
  const item = getPaletteItem(node.type);
  return {
    ...node,
    color: node.color ?? item.color,
    label: node.label ?? item.label,
    icon: node.icon ?? item.icon
  };
}

function addNode(item) {
  const offset = state.nodes.length * 24;
  state.nodes.push({
    id: createId("node"),
    type: item.type,
    label: item.label,
    color: item.color,
    icon: item.icon,
    x: 120 + offset,
    y: 120 + offset
  });
  render();
}

function getSelectedNode() {
  return state.nodes.find((node) => node.id === state.selectedNodeId) ?? null;
}

function selectNode(nodeId) {
  state.selectedNodeId = nodeId;
  render();
}

function removeSelectedNode() {
  if (!state.selectedNodeId) return;
  const nodeId = state.selectedNodeId;
  state.nodes = state.nodes.filter((node) => node.id !== nodeId);
  state.edges = state.edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId);
  state.selectedNodeId = null;
  render();
}

function toggleConnectMode() {
  state.connectMode = !state.connectMode;
  connectStartId = null;
  connectModeButton.textContent = `Connect: ${state.connectMode ? "On" : "Off"}`;
}

function updateInspector() {
  const selected = getSelectedNode();
  if (!selected) {
    emptyInspector.classList.remove("hidden");
    inspectorForm.classList.add("hidden");
    return;
  }

  emptyInspector.classList.add("hidden");
  inspectorForm.classList.remove("hidden");
  labelInput.value = selected.label;
  colorInput.value = selected.color;
  typeInput.value = selected.type;
}

function renderPalette() {
  palette.innerHTML = "";
  for (const item of paletteItems) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "palette-item";
    button.innerHTML = `
      <span class="palette-icon-wrap"><img class="palette-icon" src="${item.icon}" alt="" /></span>
      <span><strong>${item.label}</strong><small>${item.description}</small></span>
    `;
    button.addEventListener("click", () => addNode(item));
    palette.appendChild(button);
  }
}

function renderEdges() {
  edgeLayer.innerHTML = "";
  for (const edge of state.edges) {
    const from = state.nodes.find((node) => node.id === edge.from);
    const to = state.nodes.find((node) => node.id === edge.to);
    if (!from || !to) continue;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", "edge-line");
    line.setAttribute("x1", String(from.x + 110));
    line.setAttribute("y1", String(from.y + 44));
    line.setAttribute("x2", String(to.x + 110));
    line.setAttribute("y2", String(to.y + 44));
    edgeLayer.appendChild(line);
  }
}

function startDrag(event, nodeId) {
  if (state.connectMode) {
    if (!connectStartId) {
      connectStartId = nodeId;
      selectNode(nodeId);
      return;
    }

    if (connectStartId !== nodeId) {
      state.edges.push({
        id: createId("edge"),
        from: connectStartId,
        to: nodeId
      });
    }
    connectStartId = null;
    render();
    return;
  }

  const node = state.nodes.find((entry) => entry.id === nodeId);
  if (!node) return;

  dragState = {
    nodeId,
    startX: event.clientX,
    startY: event.clientY,
    originX: node.x,
    originY: node.y
  };
  selectNode(nodeId);
}

function moveDrag(event) {
  if (!dragState) return;
  const node = state.nodes.find((entry) => entry.id === dragState.nodeId);
  if (!node) return;

  const dx = event.clientX - dragState.startX;
  const dy = event.clientY - dragState.startY;
  node.x = Math.max(20, dragState.originX + dx);
  node.y = Math.max(20, dragState.originY + dy);
  render();
}

function endDrag() {
  dragState = null;
}

function renderNodes() {
  nodeLayer.innerHTML = "";
  for (const node of state.nodes) {
    const fragment = nodeTemplate.content.cloneNode(true);
    const element = fragment.querySelector(".diagram-node");
    const icon = fragment.querySelector(".node-icon");
    const type = fragment.querySelector(".node-type");
    const label = fragment.querySelector(".node-label");

    icon.src = node.icon;
    type.textContent = node.type;
    label.textContent = node.label;
    element.style.left = `${node.x}px`;
    element.style.top = `${node.y}px`;
    element.style.boxShadow = `0 20px 40px rgba(15, 23, 42, 0.18), 0 0 0 1px ${node.color}22`;
    if (node.id === state.selectedNodeId) {
      element.classList.add("selected");
    }

    element.addEventListener("mousedown", (event) => startDrag(event, node.id));
    element.addEventListener("click", (event) => {
      event.stopPropagation();
      selectNode(node.id);
    });

    nodeLayer.appendChild(fragment);
  }
}

function render() {
  renderNodes();
  renderEdges();
  updateInspector();
}

function exportJson() {
  const blob = new Blob([JSON.stringify({ nodes: state.nodes, edges: state.edges }, null, 2)], {
    type: "application/json"
  });
  downloadBlob(blob, "workflow-edit-set-diagram.json");
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(String(reader.result));
    state.nodes = Array.isArray(data.nodes) ? data.nodes.map(hydrateNode) : [];
    state.edges = Array.isArray(data.edges) ? data.edges : [];
    state.selectedNodeId = null;
    render();
  };
  reader.readAsText(file);
}

function exportSvg() {
  const nodesMarkup = state.nodes.map((node) => `
    <g transform="translate(${node.x}, ${node.y})">
      <rect rx="22" ry="22" width="220" height="88" fill="#10243c" stroke="${node.color}" stroke-opacity="0.25" />
      <rect x="14" y="12" rx="18" ry="18" width="64" height="64" fill="#17324f" stroke="#ffffff" stroke-opacity="0.08" />
      <text x="96" y="34" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" fill="#bae6fd">${escapeXml(node.type.toUpperCase())}</text>
      <text x="96" y="58" font-family="Segoe UI, sans-serif" font-size="18" font-weight="700" fill="#f8fbff">${escapeXml(node.label)}</text>
    </g>
  `).join("");

  const edgesMarkup = state.edges.map((edge) => {
    const from = state.nodes.find((node) => node.id === edge.from);
    const to = state.nodes.find((node) => node.id === edge.to);
    if (!from || !to) return "";
    return `<line x1="${from.x + 110}" y1="${from.y + 44}" x2="${to.x + 110}" y2="${to.y + 44}" stroke="#4b5563" stroke-width="3" />`;
  }).join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
      <rect width="1600" height="1000" fill="#f8fbff" />
      ${edgesMarkup}
      ${nodesMarkup}
    </svg>
  `.trim();

  const blob = new Blob([svg], { type: "image/svg+xml" });
  downloadBlob(blob, "workflow-edit-set-diagram.svg");
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

labelInput.addEventListener("input", () => {
  const node = getSelectedNode();
  if (!node) return;
  node.label = labelInput.value;
  render();
});

colorInput.addEventListener("input", () => {
  const node = getSelectedNode();
  if (!node) return;
  node.color = colorInput.value;
  render();
});

deleteButton.addEventListener("click", removeSelectedNode);
connectModeButton.addEventListener("click", toggleConnectMode);
clearButton.addEventListener("click", () => {
  state.nodes = [];
  state.edges = [];
  state.selectedNodeId = null;
  connectStartId = null;
  render();
});
saveButton.addEventListener("click", exportJson);
loadButton.addEventListener("click", () => fileInput.click());
svgButton.addEventListener("click", exportSvg);
fileInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) importJson(file);
  fileInput.value = "";
});

canvas.addEventListener("click", () => {
  state.selectedNodeId = null;
  render();
});

window.addEventListener("mousemove", moveDrag);
window.addEventListener("mouseup", endDrag);

renderPalette();
render();
