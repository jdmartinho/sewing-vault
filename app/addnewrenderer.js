const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

/***** HTML Elements *****/
const submitNewPatternButton = document.querySelector(
  "#submit-new-pattern-button"
);
const patternNameInput = document.querySelector("#patternname");

/***** Event Listeners *****/
submitNewPatternButton.addEventListener("click", () => {
  console.log("addnewrenderer - click submit new pattern button");
  let name = patternNameInput.value;
  ipcRenderer.send("submit-new-pattern-button-clicked", name);
});
