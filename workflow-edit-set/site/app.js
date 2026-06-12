const componentCatalog = [
  {
    title: "Compute",
    family: "compute",
    items: [
      { type: "ec2", label: "EC2", description: "Virtual machine" },
      { type: "ecs", label: "ECS", description: "Container service" },
      { type: "eks", label: "EKS", description: "Kubernetes cluster" },
      { type: "fargate", label: "Fargate", description: "Serverless container" },
      { type: "lambda", label: "Lambda", description: "Event compute" },
      { type: "batch", label: "Batch", description: "Batch job runner" }
    ]
  },
  {
    title: "Storage & Data",
    family: "database",
    items: [
      { type: "s3", label: "S3", description: "Object storage", family: "storage" },
      { type: "aurora", label: "Aurora", description: "Managed relational DB" },
      { type: "rds", label: "RDS", description: "Relational database" },
      { type: "dynamodb", label: "DynamoDB", description: "Key value store" },
      { type: "redshift", label: "Redshift", description: "Analytics warehouse" },
      { type: "elasticache", label: "ElastiCache", description: "Managed cache" }
    ]
  },
  {
    title: "Network",
    family: "network",
    items: [
      { type: "vpc", label: "VPC", description: "Private network" },
      { type: "alb", label: "ALB", description: "Application load balancer" },
      { type: "apigw", label: "API Gateway", description: "Managed API entry" },
      { type: "cloudfront", label: "CloudFront", description: "CDN edge" },
      { type: "route53", label: "Route 53", description: "DNS routing" },
      { type: "transitgw", label: "Transit GW", description: "Network hub" }
    ]
  },
  {
    title: "Security",
    family: "security",
    items: [
      { type: "iam", label: "IAM", description: "Identity and access" },
      { type: "cognito", label: "Cognito", description: "User identity" },
      { type: "kms", label: "KMS", description: "Key management" },
      { type: "waf", label: "WAF", description: "Web firewall" },
      { type: "secrets", label: "Secrets", description: "Secret storage" }
    ]
  },
  {
    title: "Integration",
    family: "integration",
    items: [
      { type: "sqs", label: "SQS", description: "Message queue" },
      { type: "sns", label: "SNS", description: "Pub sub topic" },
      { type: "eventbridge", label: "EventBridge", description: "Event bus" },
      { type: "stepfunctions", label: "Step Functions", description: "Workflow orchestration" },
      { type: "appflow", label: "AppFlow", description: "Data flow integration" }
    ]
  },
  {
    title: "Observability",
    family: "integration",
    items: [
      { type: "cloudwatch", label: "CloudWatch", description: "Metrics and logs" },
      { type: "xray", label: "X-Ray", description: "Trace analytics" },
      { type: "config", label: "Config", description: "Configuration audit" }
    ]
  }
];

const familyStyles = {
  compute: { color: "#f59e0b", icon: "../assets/icons/compute.png" },
  storage: { color: "#fb7185", icon: "../assets/icons/storage.png" },
  database: { color: "#0ea5e9", icon: "../assets/icons/database.png" },
  network: { color: "#10b981", icon: "../assets/icons/network.png" },
  security: { color: "#8b5cf6", icon: "../assets/icons/security.png" },
  integration: { color: "#f97316", icon: "../assets/icons/integration.png" }
};

const componentIndex = new Map(
  componentCatalog.flatMap((group) =>
    group.items.map((item) => {
      const family = item.family ?? group.family;
      return [
        item.type,
        {
          ...item,
          family,
          color: familyStyles[family].color,
          icon: familyStyles[family].icon,
          group: group.title
        }
      ];
    })
  )
);

const sampleState = {
  direction: "LR",
  nodes: [
    { id: "edge", type: "cloudfront", label: "CloudFront", x: 110, y: 140 },
    { id: "api", type: "apigw", label: "API Gateway", x: 390, y: 140 },
    { id: "web", type: "ecs", label: "Web Service", x: 690, y: 100 },
    { id: "worker", type: "lambda", label: "Event Worker", x: 690, y: 270 },
    { id: "queue", type: "sqs", label: "Job Queue", x: 985, y: 270 },
    { id: "db", type: "aurora", label: "Aurora Cluster", x: 985, y: 90 },
    { id: "bucket", type: "s3", label: "Asset Bucket", x: 1260, y: 110 }
  ],
  edges: [
    { id: "e1", from: "edge", to: "api" },
    { id: "e2", from: "api", to: "web" },
    { id: "e3", from: "api", to: "worker" },
    { id: "e4", from: "worker", to: "queue" },
    { id: "e5", from: "web", to: "db" },
    { id: "e6", from: "web", to: "bucket" }
  ]
};

const state = {
  nodes: [],
  edges: [],
  direction: "LR",
  selectedNodeIds: [],
  connectMode: false
};

const history = [];
const future = [];
let dragState = null;
let marqueeState = null;
let connectStartId = null;
let clipboard = null;
let lastCanvasGestureAt = 0;

const palette = document.getElementById("palette");
const canvas = document.getElementById("canvas");
const nodeLayer = document.getElementById("nodeLayer");
const edgeLayer = document.getElementById("edgeLayer");
const nodeTemplate = document.getElementById("nodeTemplate");
const marquee = document.getElementById("marquee");
const emptyInspector = document.getElementById("emptyInspector");
const inspectorForm = document.getElementById("inspectorForm");
const labelInput = document.getElementById("labelInput");
const colorInput = document.getElementById("colorInput");
const typeInput = document.getElementById("typeInput");
const metaInput = document.getElementById("metaInput");
const deleteButton = document.getElementById("deleteButton");
const duplicateButton = document.getElementById("duplicateButton");
const connectModeButton = document.getElementById("connectModeButton");
const clearButton = document.getElementById("clearButton");
const saveButton = document.getElementById("saveButton");
const loadButton = document.getElementById("loadButton");
const svgButton = document.getElementById("svgButton");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const selectAllButton = document.getElementById("selectAllButton");
const alignLeftButton = document.getElementById("alignLeftButton");
const alignTopButton = document.getElementById("alignTopButton");
const distributeXButton = document.getElementById("distributeXButton");
const bringFrontButton = document.getElementById("bringFrontButton");
const sendBackButton = document.getElementById("sendBackButton");
const textPanelButton = document.getElementById("textPanelButton");
const loadSampleButton = document.getElementById("loadSampleButton");
const paletteSearchInput = document.getElementById("paletteSearchInput");
const fileInput = document.getElementById("fileInput");
const textPanel = document.getElementById("textPanel");
const textArea = document.getElementById("textArea");
const textStatus = document.getElementById("textStatus");
const exportTextButton = document.getElementById("exportTextButton");
const importTextButton = document.getElementById("importTextButton");
const downloadTextButton = document.getElementById("downloadTextButton");
const copyTextButton = document.getElementById("copyTextButton");
const closeTextButton = document.getElementById("closeTextButton");
const statusLabel = document.getElementById("statusLabel");

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function getComponent(type) {
  return componentIndex.get(type) ?? componentIndex.get("ec2");
}

function decorateNode(node) {
  const component = getComponent(node.type);
  return {
    id: node.id ?? createId("node"),
    type: node.type ?? component.type,
    label: node.label ?? component.label,
    x: Number(node.x ?? 120),
    y: Number(node.y ?? 120),
    color: node.color ?? component.color,
    family: node.family ?? component.family,
    icon: node.icon ?? component.icon,
    group: node.group ?? component.group
  };
}

function serializeDiagram() {
  return {
    direction: state.direction,
    nodes: state.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      label: node.label,
      x: node.x,
      y: node.y,
      color: node.color
    })),
    edges: state.edges.map((edge) => ({
      id: edge.id,
      from: edge.from,
      to: edge.to
    }))
  };
}

function snapshot() {
  return cloneData(serializeDiagram());
}

function restore(data, options = {}) {
  state.direction = data.direction ?? "LR";
  state.nodes = Array.isArray(data.nodes) ? data.nodes.map(decorateNode) : [];
  state.edges = Array.isArray(data.edges) ? data.edges.map((edge) => ({
    id: edge.id ?? createId("edge"),
    from: edge.from,
    to: edge.to
  })) : [];
  state.selectedNodeIds = options.keepSelection ? state.selectedNodeIds.filter((id) => state.nodes.some((node) => node.id === id)) : [];
  connectStartId = null;
  render();
}

function commitHistory(previous) {
  history.push(previous);
  if (history.length > 100) {
    history.shift();
  }
  future.length = 0;
}

function mutate(action, options = {}) {
  const previous = snapshot();
  action();
  if (!options.skipHistory) {
    commitHistory(previous);
  }
  if (options.clearSelection) {
    state.selectedNodeIds = [];
  }
  render();
}

function replaceDiagram(data) {
  commitHistory(snapshot());
  restore(data);
}

function undo() {
  if (history.length === 0) return;
  future.push(snapshot());
  restore(history.pop());
}

function redo() {
  if (future.length === 0) return;
  history.push(snapshot());
  restore(future.pop());
}

function getSelectedNodes() {
  return state.nodes.filter((node) => state.selectedNodeIds.includes(node.id));
}

function setSelectedNodeIds(ids) {
  state.selectedNodeIds = [...new Set(ids)].filter((id) => state.nodes.some((node) => node.id === id));
  render();
}

function clearSelection() {
  setSelectedNodeIds([]);
}

function selectAll() {
  setSelectedNodeIds(state.nodes.map((node) => node.id));
}

function toggleConnectMode() {
  state.connectMode = !state.connectMode;
  connectStartId = null;
  render();
}

function addNode(component, point = null) {
  mutate(() => {
    const offset = state.nodes.length * 24;
    const x = point?.x ?? 120 + offset;
    const y = point?.y ?? 120 + offset;
    const node = decorateNode({
      id: createId("node"),
      type: component.type,
      label: component.label,
      x,
      y,
      color: component.color
    });
    state.nodes.push(node);
    state.selectedNodeIds = [node.id];
  });
}

function deleteSelected() {
  if (state.selectedNodeIds.length === 0) return;
  const ids = new Set(state.selectedNodeIds);
  mutate(() => {
    state.nodes = state.nodes.filter((node) => !ids.has(node.id));
    state.edges = state.edges.filter((edge) => !ids.has(edge.from) && !ids.has(edge.to));
    state.selectedNodeIds = [];
  });
}

function duplicateSelected() {
  const selected = getSelectedNodes();
  if (selected.length === 0) return;
  const selectedIds = new Set(selected.map((node) => node.id));
  mutate(() => {
    const idMap = new Map();
    const clones = selected.map((node) => {
      const clone = decorateNode({
        ...node,
        id: createId("node"),
        x: node.x + 40,
        y: node.y + 40
      });
      idMap.set(node.id, clone.id);
      return clone;
    });
    const cloneEdges = state.edges
      .filter((edge) => selectedIds.has(edge.from) && selectedIds.has(edge.to))
      .map((edge) => ({
        id: createId("edge"),
        from: idMap.get(edge.from),
        to: idMap.get(edge.to)
      }));
    state.nodes.push(...clones);
    state.edges.push(...cloneEdges);
    state.selectedNodeIds = clones.map((node) => node.id);
  });
}

function alignSelected(axis) {
  const selected = getSelectedNodes();
  if (selected.length < 2) return;
  mutate(() => {
    if (axis === "left") {
      const left = Math.min(...selected.map((node) => node.x));
      selected.forEach((node) => { node.x = left; });
    }
    if (axis === "top") {
      const top = Math.min(...selected.map((node) => node.y));
      selected.forEach((node) => { node.y = top; });
    }
  });
}

function distributeSelected(axis) {
  const selected = [...getSelectedNodes()];
  if (selected.length < 3) return;
  mutate(() => {
    const key = axis === "x" ? "x" : "y";
    selected.sort((a, b) => a[key] - b[key]);
    const start = selected[0][key];
    const end = selected[selected.length - 1][key];
    const span = end - start;
    const step = span / (selected.length - 1);
    selected.forEach((node, index) => {
      node[key] = Math.round(start + step * index);
    });
  });
}

function reorderSelected(direction) {
  if (state.selectedNodeIds.length === 0) return;
  mutate(() => {
    const selectedSet = new Set(state.selectedNodeIds);
    const selected = state.nodes.filter((node) => selectedSet.has(node.id));
    const unselected = state.nodes.filter((node) => !selectedSet.has(node.id));
    state.nodes = direction === "front" ? [...unselected, ...selected] : [...selected, ...unselected];
  });
}

function copySelected() {
  const selected = getSelectedNodes();
  if (selected.length === 0) return;
  const selectedIds = new Set(selected.map((node) => node.id));
  clipboard = {
    nodes: cloneData(selected),
    edges: cloneData(state.edges.filter((edge) => selectedIds.has(edge.from) && selectedIds.has(edge.to)))
  };
  setStatus(`Copied ${selected.length} node(s).`);
}

function pasteClipboard() {
  if (!clipboard || clipboard.nodes.length === 0) return;
  mutate(() => {
    const idMap = new Map();
    const clones = clipboard.nodes.map((node) => {
      const clone = decorateNode({
        ...node,
        id: createId("node"),
        x: node.x + 48,
        y: node.y + 48
      });
      idMap.set(node.id, clone.id);
      return clone;
    });
    const cloneEdges = clipboard.edges.map((edge) => ({
      id: createId("edge"),
      from: idMap.get(edge.from),
      to: idMap.get(edge.to)
    }));
    state.nodes.push(...clones);
    state.edges.push(...cloneEdges);
    state.selectedNodeIds = clones.map((node) => node.id);
  });
}

function nudgeSelected(stepX, stepY) {
  if (state.selectedNodeIds.length === 0) return;
  mutate(() => {
    for (const node of state.nodes) {
      if (!state.selectedNodeIds.includes(node.id)) continue;
      node.x = Math.max(20, node.x + stepX);
      node.y = Math.max(20, node.y + stepY);
    }
  });
}

function openTextPanel(exportCurrent = false) {
  textPanel.classList.remove("hidden");
  if (exportCurrent) {
    textArea.value = exportText();
    setTextStatus("Exported current workflow to text.");
  }
}

function closeTextPanel() {
  textPanel.classList.add("hidden");
}

function setTextStatus(message) {
  textStatus.textContent = message;
}

function setStatus(message) {
  statusLabel.textContent = message;
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left + canvas.scrollLeft,
    y: event.clientY - rect.top + canvas.scrollTop
  };
}

function getNodeCenter(node) {
  return {
    x: node.x + 110,
    y: node.y + 44
  };
}

function renderPalette() {
  palette.innerHTML = "";
  const query = paletteSearchInput.value.trim().toLowerCase();
  for (const group of componentCatalog) {
    const visibleItems = group.items.filter((item) => {
      if (!query) return true;
      const haystack = [item.type, item.label, item.description, group.title].join(" ").toLowerCase();
      return haystack.includes(query);
    });
    if (visibleItems.length === 0) continue;
    const section = document.createElement("section");
    section.className = "palette-group";
    section.innerHTML = `<h3>${group.title}</h3>`;
    const list = document.createElement("div");
    list.className = "palette-group-list";
    for (const item of visibleItems) {
      const component = getComponent(item.type);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "palette-item";
      button.innerHTML = `
        <span class="palette-icon-wrap"><img class="palette-icon" src="${component.icon}" alt="" /></span>
        <span><strong>${item.label}</strong><small>${item.description}</small></span>
      `;
      button.addEventListener("click", () => addNode(component));
      list.appendChild(button);
    }
    section.appendChild(list);
    palette.appendChild(section);
  }
}

function renderEdges() {
  edgeLayer.innerHTML = "";
  for (const edge of state.edges) {
    const from = state.nodes.find((node) => node.id === edge.from);
    const to = state.nodes.find((node) => node.id === edge.to);
    if (!from || !to) continue;

    const fromCenter = getNodeCenter(from);
    const toCenter = getNodeCenter(to);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const curve = Math.max(60, Math.abs(toCenter.x - fromCenter.x) * 0.35);
    path.setAttribute("class", "edge-line");
    path.setAttribute(
      "d",
      `M ${fromCenter.x} ${fromCenter.y} C ${fromCenter.x + curve} ${fromCenter.y}, ${toCenter.x - curve} ${toCenter.y}, ${toCenter.x} ${toCenter.y}`
    );
    edgeLayer.appendChild(path);
  }
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
    icon.style.objectPosition = "center center";
    type.textContent = node.type;
    label.textContent = node.label;
    element.dataset.nodeId = node.id;
    element.style.left = `${node.x}px`;
    element.style.top = `${node.y}px`;
    element.style.boxShadow = `0 20px 40px rgba(15, 23, 42, 0.18), 0 0 0 1px ${node.color}22`;
    element.style.borderColor = `${node.color}33`;
    if (state.selectedNodeIds.includes(node.id)) {
      element.classList.add("selected");
    }
    if (connectStartId === node.id) {
      element.classList.add("connect-source");
    }

    element.addEventListener("mousedown", (event) => startNodePointer(event, node.id));
    element.addEventListener("click", (event) => handleNodeClick(event, node.id));

    nodeLayer.appendChild(fragment);
  }
}

function renderMarquee() {
  if (!marqueeState) {
    marquee.classList.add("hidden");
    return;
  }
  const x = Math.min(marqueeState.origin.x, marqueeState.current.x);
  const y = Math.min(marqueeState.origin.y, marqueeState.current.y);
  const width = Math.abs(marqueeState.current.x - marqueeState.origin.x);
  const height = Math.abs(marqueeState.current.y - marqueeState.origin.y);
  marquee.classList.remove("hidden");
  marquee.style.left = `${x}px`;
  marquee.style.top = `${y}px`;
  marquee.style.width = `${width}px`;
  marquee.style.height = `${height}px`;
}

function updateInspector() {
  const selected = getSelectedNodes();
  if (selected.length === 0) {
    emptyInspector.classList.remove("hidden");
    inspectorForm.classList.add("hidden");
    return;
  }

  emptyInspector.classList.add("hidden");
  inspectorForm.classList.remove("hidden");

  if (selected.length === 1) {
    const node = selected[0];
    labelInput.disabled = false;
    labelInput.value = node.label;
    colorInput.value = node.color;
    typeInput.value = node.type;
    metaInput.value = `${node.group} / ${node.family}`;
  } else {
    labelInput.disabled = true;
    labelInput.value = "";
    colorInput.value = selected[0].color;
    typeInput.value = `${selected.length} nodes selected`;
    metaInput.value = "Batch edit enabled";
  }
}

function renderButtons() {
  connectModeButton.textContent = `Connect: ${state.connectMode ? "On" : "Off"}`;
  undoButton.disabled = history.length === 0;
  redoButton.disabled = future.length === 0;
}

function render() {
  renderNodes();
  renderEdges();
  renderMarquee();
  updateInspector();
  renderButtons();
  setStatus(`${state.selectedNodeIds.length} selected / ${state.nodes.length} nodes / ${state.edges.length} links`);
}

function selectNodesInMarquee(additive = false) {
  if (!marqueeState) return;
  const x1 = Math.min(marqueeState.origin.x, marqueeState.current.x);
  const y1 = Math.min(marqueeState.origin.y, marqueeState.current.y);
  const x2 = Math.max(marqueeState.origin.x, marqueeState.current.x);
  const y2 = Math.max(marqueeState.origin.y, marqueeState.current.y);

  const hits = state.nodes
    .filter((node) => node.x < x2 && node.x + 220 > x1 && node.y < y2 && node.y + 88 > y1)
    .map((node) => node.id);

  if (additive) {
    setSelectedNodeIds([...state.selectedNodeIds, ...hits]);
    return;
  }
  setSelectedNodeIds(hits);
}

function startNodePointer(event, nodeId) {
  if (event.button !== 0) return;
  const selectedIds = state.selectedNodeIds.includes(nodeId) ? [...state.selectedNodeIds] : [nodeId];

  if (state.connectMode) {
    return;
  }

  if (event.shiftKey) {
    const next = state.selectedNodeIds.includes(nodeId)
      ? state.selectedNodeIds.filter((id) => id !== nodeId)
      : [...state.selectedNodeIds, nodeId];
    setSelectedNodeIds(next);
    return;
  }

  if (!state.selectedNodeIds.includes(nodeId)) {
    state.selectedNodeIds = [nodeId];
    render();
  }

  dragState = {
    nodeIds: selectedIds,
    origin: getCanvasPoint(event),
    positions: selectedIds.map((id) => {
      const node = state.nodes.find((entry) => entry.id === id);
      return { id, x: node.x, y: node.y };
    }),
    historyCommitted: false
  };
}

function handleNodeClick(event, nodeId) {
  event.stopPropagation();

  if (state.connectMode) {
    if (!connectStartId) {
      connectStartId = nodeId;
      render();
      return;
    }

    if (connectStartId !== nodeId) {
      const duplicate = state.edges.some((edge) => edge.from === connectStartId && edge.to === nodeId);
      if (!duplicate) {
        mutate(() => {
          state.edges.push({ id: createId("edge"), from: connectStartId, to: nodeId });
        });
      }
    }
    connectStartId = null;
    render();
    return;
  }

  if (event.shiftKey) {
    const next = state.selectedNodeIds.includes(nodeId)
      ? state.selectedNodeIds.filter((id) => id !== nodeId)
      : [...state.selectedNodeIds, nodeId];
    setSelectedNodeIds(next);
    return;
  }

  setSelectedNodeIds([nodeId]);
}

function movePointer(event) {
  if (dragState) {
    const point = getCanvasPoint(event);
    const dx = point.x - dragState.origin.x;
    const dy = point.y - dragState.origin.y;

    if (!dragState.historyCommitted && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
      commitHistory(snapshot());
      dragState.historyCommitted = true;
      future.length = 0;
    }

    for (const item of dragState.positions) {
      const node = state.nodes.find((entry) => entry.id === item.id);
      if (!node) continue;
      node.x = Math.max(20, item.x + dx);
      node.y = Math.max(20, item.y + dy);
    }
    render();
    return;
  }

  if (marqueeState) {
    marqueeState.current = getCanvasPoint(event);
    renderMarquee();
  }
}

function endPointer() {
  if (dragState || marqueeState) {
    lastCanvasGestureAt = Date.now();
  }
  dragState = null;
  if (marqueeState) {
    selectNodesInMarquee(marqueeState.additive);
    marqueeState = null;
    renderMarquee();
  }
}

function startMarquee(event) {
  if (event.button !== 0) return;
  if (event.target.closest(".diagram-node")) return;

  if (!event.shiftKey) {
    state.selectedNodeIds = [];
    render();
  }

  marqueeState = {
    origin: getCanvasPoint(event),
    current: getCanvasPoint(event),
    additive: event.shiftKey
  };
  renderMarquee();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(serializeDiagram(), null, 2)], {
    type: "application/json"
  });
  downloadBlob(blob, "workflow-edit-set-diagram.json");
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const raw = String(reader.result);
    const isJson = file.name.toLowerCase().endsWith(".json") || raw.trim().startsWith("{");
    if (isJson) {
      const data = JSON.parse(raw);
      replaceDiagram(data);
      setTextStatus("Imported JSON workflow.");
      return;
    }
    const parsed = parseTextDiagram(raw);
    replaceDiagram(parsed);
    textArea.value = raw;
    setTextStatus("Imported text workflow.");
  };
  reader.readAsText(file);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
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
    const fromCenter = getNodeCenter(from);
    const toCenter = getNodeCenter(to);
    const curve = Math.max(60, Math.abs(toCenter.x - fromCenter.x) * 0.35);
    return `<path d="M ${fromCenter.x} ${fromCenter.y} C ${fromCenter.x + curve} ${fromCenter.y}, ${toCenter.x - curve} ${toCenter.y}, ${toCenter.x} ${toCenter.y}" stroke="#4b5563" stroke-width="3" fill="none" />`;
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

function exportText() {
  const lines = [`flowchart ${state.direction}`];
  for (const node of state.nodes) {
    lines.push(`${node.id}["${node.label.replaceAll('"', '\\"')}"]`);
  }
  for (const edge of state.edges) {
    lines.push(`${edge.from} --> ${edge.to}`);
  }
  for (const node of state.nodes) {
    lines.push(`%% type ${node.id} ${node.type}`);
    lines.push(`%% pos ${node.id} ${Math.round(node.x)} ${Math.round(node.y)}`);
    lines.push(`%% color ${node.id} ${node.color}`);
  }
  return lines.join("\n");
}

function parseTextDiagram(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  const parsed = { direction: "LR", nodes: [], edges: [] };
  const nodesById = new Map();

  function ensureNode(id, partial = {}) {
    if (!nodesById.has(id)) {
      const component = getComponent(partial.type ?? "ec2");
      const node = {
        id,
        type: partial.type ?? component.type,
        label: partial.label ?? id,
        x: Number(partial.x ?? 120 + nodesById.size * 40),
        y: Number(partial.y ?? 120 + nodesById.size * 30),
        color: partial.color ?? component.color
      };
      nodesById.set(id, node);
      return node;
    }

    const existing = nodesById.get(id);
    Object.assign(existing, partial);
    return existing;
  }

  for (const line of lines) {
    if (line.startsWith("flowchart ")) {
      parsed.direction = line.split(/\s+/)[1] ?? "LR";
      continue;
    }
    if (line.startsWith("workflow ")) {
      parsed.direction = line.split(/\s+/)[1] ?? "LR";
      continue;
    }

    const nodeMatch = line.match(/^node\s+([A-Za-z0-9_-]+)\s+"((?:\\"|[^"])*)"\s+type=([A-Za-z0-9_-]+)(?:\s+x=(\d+))?(?:\s+y=(\d+))?(?:\s+color=(#[0-9A-Fa-f]{6}))?$/);
    if (nodeMatch) {
      const [, id, rawLabel, type, x, y, color] = nodeMatch;
      const component = getComponent(type);
      ensureNode(id, {
        type,
        label: rawLabel.replaceAll('\\"', '"'),
        x: Number(x ?? 120 + parsed.nodes.length * 40),
        y: Number(y ?? 120 + parsed.nodes.length * 30),
        color: color ?? component.color
      });
      continue;
    }

    const edgeMatch = line.match(/^edge\s+([A-Za-z0-9_-]+)\s+->\s+([A-Za-z0-9_-]+)$/);
    if (edgeMatch) {
      const [, from, to] = edgeMatch;
      ensureNode(from);
      ensureNode(to);
      parsed.edges.push({ id: createId("edge"), from, to });
      continue;
    }

    const mermaidNodeMatch = line.match(/^([A-Za-z0-9_-]+)\[(?:"((?:\\"|[^"])*)"|([^\]]+))\]$/);
    if (mermaidNodeMatch) {
      const [, id, quotedLabel, plainLabel] = mermaidNodeMatch;
      ensureNode(id, { label: (quotedLabel ?? plainLabel ?? id).replaceAll('\\"', '"') });
      continue;
    }

    const mermaidEdgeMatch = line.match(/^([A-Za-z0-9_-]+)\s+-->\s+([A-Za-z0-9_-]+)$/);
    if (mermaidEdgeMatch) {
      const [, from, to] = mermaidEdgeMatch;
      ensureNode(from);
      ensureNode(to);
      parsed.edges.push({ id: createId("edge"), from, to });
      continue;
    }

    const typeDirective = line.match(/^%%\s+type\s+([A-Za-z0-9_-]+)\s+([A-Za-z0-9_-]+)$/);
    if (typeDirective) {
      const [, id, type] = typeDirective;
      const component = getComponent(type);
      ensureNode(id, { type, color: component.color });
      continue;
    }

    const positionDirective = line.match(/^%%\s+pos\s+([A-Za-z0-9_-]+)\s+(-?\d+)\s+(-?\d+)$/);
    if (positionDirective) {
      const [, id, x, y] = positionDirective;
      ensureNode(id, { x: Number(x), y: Number(y) });
      continue;
    }

    const colorDirective = line.match(/^%%\s+color\s+([A-Za-z0-9_-]+)\s+(#[0-9A-Fa-f]{6})$/);
    if (colorDirective) {
      const [, id, color] = colorDirective;
      ensureNode(id, { color });
      continue;
    }

    throw new Error(`Cannot parse line: ${line}`);
  }

  parsed.nodes = [...nodesById.values()];

  for (const edge of parsed.edges) {
    if (!nodesById.has(edge.from) || !nodesById.has(edge.to)) {
      throw new Error(`Edge references unknown node: ${edge.from} -> ${edge.to}`);
    }
  }

  return parsed;
}

function importText() {
  try {
    const parsed = parseTextDiagram(textArea.value);
    replaceDiagram(parsed);
    setTextStatus("Imported workflow text.");
    setStatus("Workflow text imported.");
  } catch (error) {
    setTextStatus(error.message);
  }
}

async function copyTextToClipboard() {
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(textArea.value);
    } else {
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
    }
    setTextStatus("Copied text to clipboard.");
  } catch (_error) {
    setTextStatus("Clipboard copy failed in this context.");
  }
}

function downloadTextFile() {
  const blob = new Blob([textArea.value], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, "workflow-edit-set-diagram.workflow.txt");
}

function loadSample() {
  const sample = cloneData(sampleState);
  replaceDiagram(sample);
}

function isEditableTarget(target) {
  return Boolean(target.closest("input, textarea"));
}

function handleKeyboard(event) {
  if (isEditableTarget(event.target)) {
    if (event.key === "Escape") {
      event.target.blur();
    }
    return;
  }

  const mod = event.ctrlKey || event.metaKey;

  if (mod && event.key.toLowerCase() === "z" && !event.shiftKey) {
    event.preventDefault();
    undo();
    return;
  }
  if ((mod && event.key.toLowerCase() === "y") || (mod && event.shiftKey && event.key.toLowerCase() === "z")) {
    event.preventDefault();
    redo();
    return;
  }
  if (mod && event.key.toLowerCase() === "a") {
    event.preventDefault();
    selectAll();
    return;
  }
  if (mod && event.key.toLowerCase() === "d") {
    event.preventDefault();
    duplicateSelected();
    return;
  }
  if (mod && event.key.toLowerCase() === "c") {
    event.preventDefault();
    copySelected();
    return;
  }
  if (mod && event.key.toLowerCase() === "x") {
    event.preventDefault();
    copySelected();
    deleteSelected();
    return;
  }
  if (mod && event.key.toLowerCase() === "v") {
    event.preventDefault();
    pasteClipboard();
    return;
  }
  if (mod && event.key.toLowerCase() === "s") {
    event.preventDefault();
    exportJson();
    return;
  }
  if (mod && event.key === "]") {
    event.preventDefault();
    reorderSelected("front");
    return;
  }
  if (mod && event.key === "[") {
    event.preventDefault();
    reorderSelected("back");
    return;
  }
  if (mod && event.key.toLowerCase() === "e") {
    event.preventDefault();
    openTextPanel(true);
    return;
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    deleteSelected();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    connectStartId = null;
    clearSelection();
    closeTextPanel();
    return;
  }

  const step = event.shiftKey ? 10 : 1;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    nudgeSelected(-step, 0);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    nudgeSelected(step, 0);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    nudgeSelected(0, -step);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    nudgeSelected(0, step);
  }
}

labelInput.addEventListener("input", () => {
  const selected = getSelectedNodes();
  if (selected.length !== 1) return;
  const nodeId = selected[0].id;
  mutate(() => {
    const node = state.nodes.find((entry) => entry.id === nodeId);
    node.label = labelInput.value;
  });
});

colorInput.addEventListener("input", () => {
  if (state.selectedNodeIds.length === 0) return;
  mutate(() => {
    for (const node of state.nodes) {
      if (!state.selectedNodeIds.includes(node.id)) continue;
      node.color = colorInput.value;
    }
  });
});

deleteButton.addEventListener("click", deleteSelected);
duplicateButton.addEventListener("click", duplicateSelected);
connectModeButton.addEventListener("click", toggleConnectMode);
clearButton.addEventListener("click", () => {
  mutate(() => {
    state.nodes = [];
    state.edges = [];
    state.selectedNodeIds = [];
  });
});
saveButton.addEventListener("click", exportJson);
loadButton.addEventListener("click", () => fileInput.click());
svgButton.addEventListener("click", exportSvg);
undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);
selectAllButton.addEventListener("click", selectAll);
alignLeftButton.addEventListener("click", () => alignSelected("left"));
alignTopButton.addEventListener("click", () => alignSelected("top"));
distributeXButton.addEventListener("click", () => distributeSelected("x"));
bringFrontButton.addEventListener("click", () => reorderSelected("front"));
sendBackButton.addEventListener("click", () => reorderSelected("back"));
textPanelButton.addEventListener("click", () => openTextPanel(true));
loadSampleButton.addEventListener("click", loadSample);
exportTextButton.addEventListener("click", () => {
  textArea.value = exportText();
  setTextStatus("Exported current workflow to text.");
});
importTextButton.addEventListener("click", importText);
downloadTextButton.addEventListener("click", downloadTextFile);
copyTextButton.addEventListener("click", copyTextToClipboard);
closeTextButton.addEventListener("click", closeTextPanel);
paletteSearchInput.addEventListener("input", renderPalette);

fileInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) importJson(file);
  fileInput.value = "";
});

canvas.addEventListener("mousedown", startMarquee);
canvas.addEventListener("click", (event) => {
  if (Date.now() - lastCanvasGestureAt < 120) return;
  if (event.target.closest(".diagram-node")) return;
  if (state.connectMode) {
    connectStartId = null;
    render();
    return;
  }
  if (!event.shiftKey) {
    clearSelection();
  }
});

window.addEventListener("mousemove", movePointer);
window.addEventListener("mouseup", endPointer);
window.addEventListener("keydown", handleKeyboard);

renderPalette();
restore(sampleState);
textArea.value = exportText();
