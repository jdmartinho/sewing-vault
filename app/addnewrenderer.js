const uifunctions = require("./uifunctions");
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

/***** HTML Elements *****/
const patternNameInput = document.querySelector("#pattern-name");
const coverImageDisplay = document.querySelector("#cover-image");
const openCoverImageButton = document.querySelector("#open-cover-image");
const additionalImagesDisplay = document.querySelector("#additional-images");
const addImagesButton = document.querySelector("#add-images");
const submitNewPatternButton = document.querySelector(
  "#submit-new-pattern-button"
);

const ADD_NEW_WINDOW_ID = "addnew";
let COVER_IMAGE;
let ADDITIONAL_IMAGES_TO_SAVE;

/***** Event Listeners *****/

openCoverImageButton.addEventListener("click", () => {
  console.log("addnewrenderer - click open cover image button");
  ipcRenderer.send("open-cover-image-button-clicked");
});

addImagesButton.addEventListener("click", () => {
  console.log("addnewrenderer - click add images button");
  ipcRenderer.send("add-images-button-clicked", ADD_NEW_WINDOW_ID);
});

submitNewPatternButton.addEventListener("click", () => {
  console.log("addnewrenderer - click submit new pattern button");
  let pattern = {
    name: patternNameInput.value,
    cover: COVER_IMAGE,
    additional_images: ADDITIONAL_IMAGES_TO_SAVE,
  };
  ipcRenderer.send("submit-new-pattern-button-clicked", pattern);
});

ipcRenderer.on("cover-image-uploaded", (event, cover) => {
  console.log("addnewrenderer - cover image uploaded");
  COVER_IMAGE = cover;
  uifunctions.displayCover(coverImageDisplay, cover);
});

ipcRenderer.on("additional-images-uploaded", (event, images) => {
  console.log("patterndetailsrenderer - additional images uploaded");
  // We set the images aside to save later, in case the user clicks save changes
  ADDITIONAL_IMAGES_TO_SAVE = images;
  uifunctions.displayAdditionalImages(additionalImagesDisplay, images);
});
