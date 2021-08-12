const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

/***** HTML Elements *****/
const submitNewPatternButton = document.querySelector(
  "#submit-new-pattern-button"
);
const openImageButton = document.querySelector("#open-cover-image");
const patternNameInput = document.querySelector("#patternname");
const coverImageDisplay = document.querySelector("#cover-image");

let COVER_PATH = null;

/***** Event Listeners *****/
submitNewPatternButton.addEventListener("click", () => {
  console.log("addnewrenderer - click submit new pattern button");
  let pattern = { name: patternNameInput.value, cover: COVER_PATH };
  ipcRenderer.send("submit-new-pattern-button-clicked", pattern);
});

openImageButton.addEventListener("click", () => {
  console.log("addnewrenderer - click open cover image button");
  ipcRenderer.send("open-new-image-button-clicked");
});

ipcRenderer.on("cover-image-uploaded", (event, cover) => {
  console.log("addnewrenderer - cover image uploaded");
  console.log(cover);
  COVER_PATH = cover;
  coverImageDisplay.innerHTML = "";
  const imgSrc = `data:image/jpg;base64,${cover}`;
  const outHtml = `<img src=\"${imgSrc}\" style=\"width:300px;height:auto;\"/>`;
  coverImageDisplay.insertAdjacentHTML("beforeend", outHtml);
});
