const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

/***** HTML Elements *****/
const patternNameInput = document.querySelector("#patternname");

/***** Event Listeners *****/
ipcRenderer.on("pattern-details-ready", (event, pattern) => {
  console.log("----> got something");
  console.log("patterndetailrenderer - received details: " + pattern);
  patternNameInput.value = pattern.name;
});
