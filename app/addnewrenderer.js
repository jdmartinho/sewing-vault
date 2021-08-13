const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

/***** HTML Elements *****/
const submitNewPatternButton = document.querySelector(
  "#submit-new-pattern-button"
);
const openCoverImageButton = document.querySelector("#open-cover-image");
const patternNameInput = document.querySelector("#patternname");
const coverImageDisplay = document.querySelector("#cover-image");

let COVER_IMAGE = null;

/***** Event Listeners *****/
submitNewPatternButton.addEventListener("click", () => {
  console.log("addnewrenderer - click submit new pattern button");
  let pattern = { name: patternNameInput.value, cover: COVER_IMAGE };
  ipcRenderer.send("submit-new-pattern-button-clicked", pattern);
});

openCoverImageButton.addEventListener("click", () => {
  console.log("addnewrenderer - click open cover image button");
  ipcRenderer.send("open-cover-image-button-clicked");
});

ipcRenderer.on("cover-image-uploaded", (event, cover) => {
  console.log("addnewrenderer - cover image uploaded");
  COVER_IMAGE = cover;
  coverImageDisplay.innerHTML = "";
  const imgSrc = `data:image/jpg;base64,${cover}`;
  const outHtml = `<img src=\"${imgSrc}\" style=\"width:300px;height:auto;\"/>`;
  coverImageDisplay.insertAdjacentHTML("beforeend", outHtml);
});
