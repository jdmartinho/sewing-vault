const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

/***** HTML Elements *****/
const patternNameInput = document.querySelector("#patternname");
const coverImageDisplay = document.querySelector("#cover-image");

/***** Event Listeners *****/
ipcRenderer.on("pattern-details-ready", (event, pattern) => {
  console.log("----> got something");
  console.log("patterndetailrenderer - received details: " + pattern);
  patternNameInput.value = pattern.name;
  coverImageDisplay.innerHTML = "";
  const imgSrc = `data:image/jpg;base64,${pattern.cover}`;
  const outHtml = `<img src=\"${imgSrc}\" style=\"width:300px;height:auto;\"/>`;
  coverImageDisplay.insertAdjacentHTML("beforeend", outHtml);
});
