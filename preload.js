const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("spark", {
  appName: "Spark Browser",
  version: "2.0.0"
});