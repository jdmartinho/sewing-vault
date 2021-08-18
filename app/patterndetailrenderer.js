const uifunctions = require("./uifunctions");
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

/***** HTML Elements *****/
const patternNameInput = document.querySelector("#pattern-name");
const coverImageDisplay = document.querySelector("#cover-image");
const additionalImagesDisplay = document.querySelector("#additional-images");
const addImagesButton = document.querySelector("#add-images");
const deletePatternButton = document.querySelector("#delete-pattern");
const saveChangesButton = document.querySelector("#save-changes-button");

let PATTERN_FULL_DATA;
let ADDITIONAL_IMAGES_TO_SAVE;

/***** Event Listeners *****/

addImagesButton.addEventListener("click", () => {
  console.log("patterndetailsrenderer - click add images button");
  ipcRenderer.send("add-images-button-clicked", PATTERN_FULL_DATA._id);
});

saveChangesButton.addEventListener("click", () => {
  console.log("patterndetailsrenderer - click save changes button");
  let imagesToSave = ADDITIONAL_IMAGES_TO_SAVE
    ? ADDITIONAL_IMAGES_TO_SAVE
    : PATTERN_FULL_DATA.additional_images;
  let pattern = {
    id: PATTERN_FULL_DATA._id,
    name: patternNameInput.value,
    cover: PATTERN_FULL_DATA.cover,
    additional_images: imagesToSave,
  };
  ipcRenderer.send("save-changes-button-clicked", pattern);
});

deletePatternButton.addEventListener("click", () => {
  console.log("patterndetailsrenderer - click delete pattern button");
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

ipcRenderer.on("additional-images-uploaded", (event, images) => {
  console.log("patterndetailsrenderer - additional images uploaded");
  // We set the images aside to save later, in case the user clicks save changes
  ADDITIONAL_IMAGES_TO_SAVE = images;
  uifunctions.displayAdditionalImages(additionalImagesDisplay, images);
});
