const tabsEl = document.getElementById("tabs");
const browser = document.getElementById("browser");
const address = document.getElementById("address");
let tabs = [];
let activeId = null;
let nextId = 1;

function normalize(input) {
  const value = input.trim();
  if (!value) return null;
  if (/^(https?:\/\/|file:\/\/)/i.test(value)) return value;
  if (/^[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(value) && !value.includes(" ")) return "https://" + value;
  return "https://www.google.com/search?q=" + encodeURIComponent(value);
}
function current() { return tabs.find(t => t.id === activeId); }

function createTab(url = null) {
  const id = nextId++;
  const view = document.createElement("webview");
  view.setAttribute("partition", "persist:spark");
  view.setAttribute("allowpopups", "false");
  view.setAttribute("webpreferences", "contextIsolation=yes,sandbox=yes");
  view.style.display = "none";
  browser.appendChild(view);
  const tab = { id, view, title: "New Tab", url: null };
  tabs.push(tab);
  view.addEventListener("page-title-updated", e => { tab.title = e.title || "New Tab"; renderTabs(); });
  view.addEventListener("did-navigate", e => { tab.url = e.url; if (activeId === id) address.value = e.url; });
  view.addEventListener("did-navigate-in-page", e => { tab.url = e.url; if (activeId === id) address.value = e.url; });
  view.addEventListener("did-start-loading", () => { if (activeId === id) document.title = "Loading — Spark Browser"; });
  view.addEventListener("did-stop-loading", () => { if (activeId === id) document.title = tab.title + " — Spark Browser"; });
  view.addEventListener("dom-ready", () => { if (activeId === id) address.value = view.getURL(); });
  switchTab(id);
  if (url) navigate(url, tab);
  return tab;
}
function switchTab(id) {
  activeId = id;
  tabs.forEach(t => { t.view.style.display = t.id === id ? "flex" : "none"; });
  const tab = current();
  const welcome = document.getElementById("welcome");
  if (tab && tab.url) {
    welcome.style.display = "none";
    address.value = tab.url;
  } else {
    welcome.style.display = "flex";
    address.value = "";
  }
  renderTabs();
}
function renderTabs() {
  tabsEl.innerHTML = "";
  tabs.forEach(t => {
    const button = document.createElement("button");
    button.className = "tab" + (t.id === activeId ? " active" : "");
    const title = document.createElement("span");
    title.className = "tab-title";
    title.textContent = t.title;
    const close = document.createElement("span");
    close.className = "close-tab";
    close.textContent = "×";
    close.addEventListener("click", e => { e.stopPropagation(); closeTab(t.id); });
    button.append(title, close);
    button.addEventListener("click", () => switchTab(t.id));
    tabsEl.appendChild(button);
  });
}
function navigate(raw, tab = current()) {
  const url = normalize(raw);
  if (!url || !tab) return;
  tab.url = url;
  tab.title = "Loading…";
  tab.view.loadURL(url).catch(() => { tab.title = "Page unavailable"; renderTabs(); });
  document.getElementById("welcome").style.display = "none";
  if (tab.id === activeId) address.value = url;
  renderTabs();
}
function closeTab(id) {
  const index = tabs.findIndex(t => t.id === id);
  if (index < 0) return;
  tabs[index].view.remove();
  tabs.splice(index, 1);
  if (!tabs.length) createTab();
  else if (activeId === id) switchTab(tabs[Math.max(0, index - 1)].id);
  else renderTabs();
}
document.getElementById("newTab").addEventListener("click", () => createTab());
document.getElementById("addressForm").addEventListener("submit", e => { e.preventDefault(); navigate(address.value); });
document.getElementById("welcomeForm").addEventListener("submit", e => { e.preventDefault(); navigate(document.getElementById("welcomeInput").value); });
document.getElementById("back").addEventListener("click", () => { const t=current(); if (t?.view.canGoBack()) t.view.goBack(); });
document.getElementById("forward").addEventListener("click", () => { const t=current(); if (t?.view.canGoForward()) t.view.goForward(); });
document.getElementById("reload").addEventListener("click", () => current()?.view.reload());
document.getElementById("home").addEventListener("click", () => { const t=current(); if(t){ t.url=null; t.title="New Tab"; t.view.loadURL("about:blank"); switchTab(t.id); } });
document.getElementById("bookmark").addEventListener("click", () => {
  const t=current();
  if (t?.url) {
    const saved = JSON.parse(localStorage.getItem("spark-bookmarks") || "[]");
    if (!saved.includes(t.url)) saved.push(t.url);
    localStorage.setItem("spark-bookmarks", JSON.stringify(saved));
    const b = document.getElementById("bookmark"); b.textContent = "★"; setTimeout(() => b.textContent = "☆", 900);
  }
});
document.querySelectorAll("[data-url]").forEach(b => b.addEventListener("click", () => navigate(b.dataset.url)));
createTab();