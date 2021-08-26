const uifunctions = require("./uifunctions");
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

/***** HTML Elements *****/
const patternNameInput = document.querySelector("#pattern-name");
const coverImageDisplay = document.querySelector("#cover-image");
const openCoverImageButton = document.querySelector("#open-cover-image");
const companyNameInput = document.querySelector("#company-name");
const yearInput = document.querySelector("#year");
const notesInput = document.querySelector("#notes");
const additionalImagesDisplay = document.querySelector("#additional-images");
const addImagesButton = document.querySelector("#add-images");
const submitNewPatternButton = document.querySelector(
  "#submit-new-pattern-button"
);

const ADD_NEW_WINDOW_ID = "addnew";
let COVER_IMAGE;
// At any given moment this array contains the images to display and save
let ADDITIONAL_IMAGES_TO_SAVE = [];

/***** Event Listeners *****/

openCoverImageButton.addEventListener("click", () => {
  console.log("addnewrenderer - click open cover image button");
  ipcRenderer.send("open-cover-image-button-clicked", ADD_NEW_WINDOW_ID);
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
    company: companyNameInput.value,
    year: yearInput.value,
    notes: notesInput.value,
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
  // We prepare the images into objects with an id
  let imageObjectsToDisplay = uifunctions.prepareImagesForSave(
    ADDITIONAL_IMAGES_TO_SAVE.length,
    images
  );
  // We set the images aside to save later, in case the user clicks save changes
  imageObjectsToDisplay.forEach((element) => {
    ADDITIONAL_IMAGES_TO_SAVE.push(element);
  });
  uifunctions.displayAdditionalImages(
    additionalImagesDisplay,
    ADDITIONAL_IMAGES_TO_SAVE
  );
});
