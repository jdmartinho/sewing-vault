const electron = require("electron");
const contextBridge = electron.contextBridge;
const ipcRenderer = electron.ipcRenderer;
const uifunctions = require("./uifunctions");

// Renderer processes can use this API by calling window.ipcRendererApi
contextBridge.exposeInMainWorld("ipcRendererApi", {
  send: (channel, ...data) => ipcRenderer.send(channel, ...data),
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
  },
});

// Renderer processes can use this API by calling window.uifunctionsApi
contextBridge.exposeInMainWorld("uifunctionsApi", {
  displayCover: (coverLocation, cover) =>
    uifunctions.displayCover(coverLocation, cover),
  displayAdditionalImages: (imagesLocation, images) =>
    uifunctions.displayAdditionalImages(imagesLocation, images),
  prepareImagesForSave: (countStart, images) =>
    uifunctions.prepareImagesForSave(countStart, images),
});
