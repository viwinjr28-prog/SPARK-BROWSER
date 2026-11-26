const tabsEl = document.getElementById("tabs");
const browser = document.getElementById("browser");
const address = document.getElementById("address");
const welcome = document.getElementById("welcome");
let tabs = [];
let activeId = null;
let nextId = 1;
let toastTimer;

function normalize(input) {
  const value = input.trim();
  if (!value) return null;
  if (/^(https?:\/\/|file:\/\/)/i.test(value)) return value;
  if (/^[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(value) && !value.includes(" ")) return "https://" + value;
  return "https://www.google.com/search?q=" + encodeURIComponent(value);
}
function current() { return tabs.find(t => t.id === activeId); }
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 1800);
}
function createTab(url = null) {
  const id = nextId++;
  const view = document.createElement("webview");
  view.setAttribute("partition", "persist:spark");
  view.setAttribute("allowpopups", "false");
  view.setAttribute("webpreferences", "contextIsolation=yes,sandbox=yes");
  view.className = "page-view";
  view.style.display = "none";
  browser.appendChild(view);
  const tab = { id, view, title: "New Tab", url: null, loading: false };
  tabs.push(tab);
  view.addEventListener("page-title-updated", e => { tab.title = e.title || "New Tab"; renderTabs(); });
  view.addEventListener("did-navigate", e => syncLocation(tab, e.url));
  view.addEventListener("did-navigate-in-page", e => syncLocation(tab, e.url));
  view.addEventListener("did-start-loading", () => {
    tab.loading = true;
    if (activeId === id) document.getElementById("reload").textContent = "×";
    renderTabs();
  });
  view.addEventListener("did-stop-loading", () => {
    tab.loading = false;
    if (activeId === id) document.getElementById("reload").textContent = "↻";
    renderTabs();
  });
  view.addEventListener("dom-ready", () => { if (activeId === id) address.value = view.getURL(); });
  switchTab(id);
  if (url) navigate(url, tab);
  return tab;
}
function syncLocation(tab, url) {
  tab.url = url;
  if (activeId === tab.id) {
    address.value = url;
    document.getElementById("siteIndicator").textContent = url.startsWith("https://") ? "♙" : "✧";
    welcome.style.display = "none";
  }
}
function switchTab(id) {
  activeId = id;
  tabs.forEach(t => { t.view.style.display = t.id === id && t.url ? "flex" : "none"; });
  const tab = current();
  welcome.style.display = tab && tab.url ? "none" : "flex";
  address.value = tab?.url || "";
  document.getElementById("siteIndicator").textContent = tab?.url?.startsWith("https://") ? "♙" : "✧";
  document.getElementById("reload").textContent = tab?.loading ? "×" : "↻";
  renderTabs();
}
function renderTabs() {
  tabsEl.innerHTML = "";
  tabs.forEach(t => {
    const button = document.createElement("button");
    button.className = "tab" + (t.id === activeId ? " active" : "");
    const favicon = document.createElement("span");
    favicon.className = "tab-favicon";
    favicon.textContent = t.loading ? "◌" : "◈";
    const title = document.createElement("span");
    title.className = "tab-title";
    title.textContent = t.title;
    const close = document.createElement("span");
    close.className = "close-tab";
    close.textContent = "×";
    close.addEventListener("click", e => { e.stopPropagation(); closeTab(t.id); });
    button.append(favicon, title, close);
    button.addEventListener("click", () => switchTab(t.id));
    tabsEl.appendChild(button);
  });
}
function navigate(raw, tab = current()) {
  const url = normalize(raw);
  if (!url || !tab) return;
  tab.url = url;
  tab.title = "Loading…";
  tab.loading = true;
  tab.view.loadURL(url).catch(() => { tab.title = "Page unavailable"; tab.loading = false; renderTabs(); });
  welcome.style.display = "none";
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
function getBookmarks() {
  try { return JSON.parse(localStorage.getItem("spark-bookmarks") || "[]"); }
  catch { return []; }
}
function saveBookmarks(items) { localStorage.setItem("spark-bookmarks", JSON.stringify(items)); }
function addBookmark() {
  const tab = current();
  if (!tab?.url) { showToast("Open a page to bookmark it"); return; }
  const items = getBookmarks();
  if (!items.some(item => item.url === tab.url)) {
    items.push({ url: tab.url, title: tab.title || new URL(tab.url).hostname });
    saveBookmarks(items);
    showToast("Added to favourites");
  } else showToast("Already in favourites");
  renderBookmarks();
}
function renderBookmarks() {
  const holder = document.getElementById("bookmarkItems");
  holder.innerHTML = "";
  getBookmarks().slice(0, 8).forEach(item => {
    const button = document.createElement("button");
    button.className = "bookmark-item";
    button.textContent = item.title || item.url;
    button.title = item.url;
    button.addEventListener("click", () => navigate(item.url));
    holder.appendChild(button);
  });
}
function toggleTheme() {
  const next = document.body.dataset.theme === "light" ? "dark" : "light";
  document.body.dataset.theme = next;
  localStorage.setItem("spark-theme", next);
  document.getElementById("themeToggle").textContent = next === "light" ? "☾" : "☼";
}
function goHome() {
  const tab = current();
  if (tab) { tab.url = null; tab.title = "New Tab"; tab.view.loadURL("about:blank"); switchTab(tab.id); }
}
document.getElementById("newTab").addEventListener("click", () => createTab());
document.getElementById("addressForm").addEventListener("submit", e => { e.preventDefault(); navigate(address.value); });
document.getElementById("welcomeForm").addEventListener("submit", e => { e.preventDefault(); navigate(document.getElementById("welcomeInput").value); });
document.getElementById("back").addEventListener("click", () => { const t=current(); if (t?.view.canGoBack()) t.view.goBack(); });
document.getElementById("forward").addEventListener("click", () => { const t=current(); if (t?.view.canGoForward()) t.view.goForward(); });
document.getElementById("reload").addEventListener("click", () => {
  const t = current(); if (!t) return;
  if (t.loading) t.view.stop(); else if (t.url) t.view.reload(); else showToast("Ready when you are");
});
document.getElementById("bookmark").addEventListener("click", addBookmark);
document.getElementById("addFavourite").addEventListener("click", addBookmark);
document.getElementById("bookmarksToggle").addEventListener("click", () => document.getElementById("bookmarksBar").classList.toggle("collapsed"));
document.getElementById("themeToggle").addEventListener("click", toggleTheme);
document.getElementById("clearAddress").addEventListener("click", () => { address.value = ""; address.focus(); });
document.querySelectorAll("[data-url]").forEach(b => b.addEventListener("click", () => navigate(b.dataset.url)));
const menu = document.getElementById("menuPopover");
document.getElementById("menuButton").addEventListener("click", () => menu.classList.toggle("open"));
document.getElementById("menuHome").addEventListener("click", () => { menu.classList.remove("open"); goHome(); });
document.getElementById("menuBookmarks").addEventListener("click", () => { menu.classList.remove("open"); document.getElementById("bookmarksBar").classList.remove("collapsed"); });
document.getElementById("menuTheme").addEventListener("click", () => { menu.classList.remove("open"); toggleTheme(); });
document.addEventListener("click", e => { if (!menu.contains(e.target) && e.target.id !== "menuButton") menu.classList.remove("open"); });
document.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "t") { e.preventDefault(); createTab(); }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") { e.preventDefault(); address.focus(); address.select(); }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "w") { e.preventDefault(); if (current()) closeTab(activeId); }
  if (e.key === "Escape") menu.classList.remove("open");
});
const savedTheme = localStorage.getItem("spark-theme");
if (savedTheme) { document.body.dataset.theme = savedTheme; document.getElementById("themeToggle").textContent = savedTheme === "light" ? "☾" : "☼"; }
renderBookmarks();
createTab();