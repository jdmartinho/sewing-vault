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
// At any given time this array contains all the images that can be displayed and saved
let ADDITIONAL_IMAGES_TO_SAVE = [];

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
  ADDITIONAL_IMAGES_TO_SAVE = pattern.additional_images;
  PATTERN_FULL_DATA = pattern;
  console.log("patterndetailrenderer - received details: " + pattern);
  patternNameInput.value = pattern.name;
  uifunctions.displayCover(coverImageDisplay, pattern.cover);
  if (ADDITIONAL_IMAGES_TO_SAVE.length > 0) {
    uifunctions.displayAdditionalImages(
      additionalImagesDisplay,
      ADDITIONAL_IMAGES_TO_SAVE
    );
  }
  addListenersToImages();
});

ipcRenderer.on("cover-image-uploaded", (event, cover) => {
  console.log("patterndetailrenderer - cover image uploaded");
  COVER_IMAGE = cover;
  uifunctions.displayCover(coverImageDisplay, cover);
});

ipcRenderer.on("additional-images-uploaded", (event, images) => {
  console.log("patterndetailrenderer - additional images uploaded");
  // We prepare the images with ids for when we want to save them
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

/***** Functions *****/

/**
 * Creates the sewing pattern object from the changes made so that it can be
 * passed to the database for saving.
 * @returns {Object} A full sewing pattern to save to the database
 */
const createPatternForSaving = () => {
  let coverImageToSave = COVER_IMAGE ? COVER_IMAGE : PATTERN_FULL_DATA.cover;
  return {
    id: PATTERN_FULL_DATA._id,
    name: patternNameInput.value,
    cover: coverImageToSave,
    additional_images: ADDITIONAL_IMAGES_TO_SAVE,
  };
};

/**
 * This functions adds an event listener to each image area that when clicked
 * will send an "image-area-clicked" event to the main process with the pattern
 * data and with the image id.
 */
const addListenersToImages = () => {
  let imageAreas = additionalImagesDisplay.childNodes;
  let count = 0;
  imageAreas.forEach((element) => {
    element.addEventListener("click", () => {
      let id = element.id.match(/[0-9]+$/);
      ipcRenderer.send("image-area-clicked", PATTERN_FULL_DATA, id);
    });
    count++;
  });
};
