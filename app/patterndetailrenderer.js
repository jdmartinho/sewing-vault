const uifunctions = require("./uifunctions");
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

/***** HTML Elements *****/
const patternNameInput = document.querySelector("#pattern-name");
const coverImageDisplay = document.querySelector("#cover-image");
const changeCoverImageButton = document.querySelector("#change-cover-image");
const additionalImagesDisplay = document.querySelector("#additional-images");
const addImagesButton = document.querySelector("#add-images");
const deletePatternButton = document.querySelector("#delete-pattern");
const saveChangesButton = document.querySelector("#save-changes-button");

let PATTERN_FULL_DATA;
let COVER_IMAGE;
let ADDITIONAL_IMAGES_TO_SAVE;

/***** Event Listeners *****/

changeCoverImageButton.addEventListener("click", () => {
  console.log("patterndetailrenderer - click change cover image button");
  ipcRenderer.send("open-cover-image-button-clicked", PATTERN_FULL_DATA._id);
});

addImagesButton.addEventListener("click", () => {
  console.log("patterndetailrenderer - click add images button");
  ipcRenderer.send("add-images-button-clicked", PATTERN_FULL_DATA._id);
});

saveChangesButton.addEventListener("click", () => {
  console.log("patterndetailrenderer - click save changes button");
  let pattern = createPatternForSaving();
  ipcRenderer.send("save-changes-button-clicked", pattern);
});

deletePatternButton.addEventListener("click", () => {
  console.log("patterndetailrenderer - click delete pattern button");
  ipcRenderer.send("delete-pattern-button-clicked", PATTERN_FULL_DATA._id);
});

ipcRenderer.on("pattern-details-ready", (event, pattern) => {
  PATTERN_FULL_DATA = pattern;
  console.log("----> got something");
  console.log("patterndetailrenderer - received details: " + pattern);
  patternNameInput.value = pattern.name;
  uifunctions.displayCover(coverImageDisplay, pattern.cover);
  if (pattern.additional_images) {
    uifunctions.displayAdditionalImages(
      additionalImagesDisplay,
      pattern.additional_images
    );
  }
});

ipcRenderer.on("cover-image-uploaded", (event, cover) => {
  console.log("patterndetailrenderer - cover image uploaded");
  COVER_IMAGE = cover;
  uifunctions.displayCover(coverImageDisplay, cover);
});

ipcRenderer.on("additional-images-uploaded", (event, images) => {
  console.log("patterndetailrenderer - additional images uploaded");
  // We set the images aside to save later, in case the user clicks save changes
  ADDITIONAL_IMAGES_TO_SAVE = images;
  uifunctions.displayAdditionalImages(additionalImagesDisplay, images);
});

/***** Functions *****/

/**
 * Creates the sewing pattern object from the changes made so that it can be
 * passed to the database for saving.
 * @returns {Object} A full sewing pattern to save to the database
 */
const createPatternForSaving = () => {
  let coverImageToSave = COVER_IMAGE ? COVER_IMAGE : PATTERN_FULL_DATA.cover;
  let additionalImagesToSave = ADDITIONAL_IMAGES_TO_SAVE
    ? ADDITIONAL_IMAGES_TO_SAVE
    : PATTERN_FULL_DATA.additional_images;
  return {
    id: PATTERN_FULL_DATA._id,
    name: patternNameInput.value,
    cover: coverImageToSave,
    additional_images: additionalImagesToSave,
  };
};
