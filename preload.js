const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("spark", {
  appName: "Spark Browser",
  version: "1.0.0"
});