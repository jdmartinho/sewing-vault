const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

/***** HTML Elements *****/
const patternNameInput = document.querySelector("#pattern-name");
const coverImageDisplay = document.querySelector("#cover-image");
const saveChangesButton = document.querySelector("#save-changes-button");
const additionalImagesDisplay = document.querySelector("#additional-images");
const addImagesButton = document.querySelector("#add-images");
const coverImageFile = document.querySelector("#cover-image-img");

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

ipcRenderer.on("pattern-details-ready", (event, pattern) => {
  PATTERN_FULL_DATA = pattern;
  console.log("----> got something");
  console.log("patterndetailrenderer - received details: " + pattern);
  patternNameInput.value = pattern.name;
  displayCover(pattern.cover);
  if (pattern.additional_images) {
    displayAdditionalImages(pattern.additional_images);
  }
});

ipcRenderer.on("additional-images-uploaded", (event, images) => {
  console.log("patterndetailsrenderer - additional images uploaded");
  // We set the images aside to save later, in case the user clicks save changes
  ADDITIONAL_IMAGES_TO_SAVE = images;
  displayAdditionalImages(images);
});

/***** Functions *****/

/**
 * Displays the cover image in the UI.
 * @param {Object} cover The cover image to display in the UI
 */
const displayCover = (cover) => {
  coverImageDisplay.innerHTML = "";
  const imgSrc = `data:image/jpg;base64,${cover}`;
  const outHtml = `<img id="cover-image-img" src=\"${imgSrc}\" style=\"width:300px;height:auto;\"/>`;
  coverImageDisplay.insertAdjacentHTML("beforeend", outHtml);
};

/**
 * Displays the additional images contained in the pattern.
 * @param {Object[]} images The images to display in the UI on the additional images section.
 */
const displayAdditionalImages = (images) => {
  additionalImagesDisplay.innerHTML = "";
  images.forEach((element) => {
    const imgSrc = `data:image/jpg;base64,${element}`;
    const outHtml = `<img src=\"${imgSrc}\" style=\"width:300px;height:auto;\"/>`;
    additionalImagesDisplay.insertAdjacentHTML("beforeend", outHtml);
  });
};
