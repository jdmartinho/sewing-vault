const uifunctions = require("./uifunctions");
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

/***** HTML Elements *****/
const patternNameInput = document.querySelector("#pattern-name");
const coverImageDisplay = document.querySelector("#cover-image");
const openCoverImageButton = document.querySelector("#open-cover-image");
const companyNameInput = document.querySelector("#company-name");
const yearInput = document.querySelector("#year");
const garmentTypeInput = document.querySelector("#garment");
const addGarmentTypeButton = document.querySelector("#add-garment-type");
const garmentsAddedDisplay = document.querySelector("#garments-added");
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
let GARMENT_TYPES_TO_SAVE = new Set();
garmentTypeInput.value = null;

/***** Event Listeners *****/

openCoverImageButton.addEventListener("click", () => {
  console.log("addnewrenderer - click open cover image button");
  ipcRenderer.send("open-cover-image-button-clicked", ADD_NEW_WINDOW_ID);
});

addGarmentTypeButton.addEventListener("click", () => {
  console.log("addnewrenderer - click add garment type button");
  if (garmentTypeInput.value) {
    GARMENT_TYPES_TO_SAVE = GARMENT_TYPES_TO_SAVE.add(garmentTypeInput.value);
    // Clean the input field
    garmentTypeInput.value = null;
    // Generate display for the newly added field and button to remove
    generateGarmentFieldAndRemoveButton(GARMENT_TYPES_TO_SAVE);
  }
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
    garments: Array.from(GARMENT_TYPES_TO_SAVE),
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

/**
 * Creates a row for each element in the garment type list and
 * adds it to the table if it doesn't exist yet.
 * It also adds an event listener for a remove button for each
 * entry that when clicked removes the HTML element from the UI
 * and also the same element from the list.
 */
const generateGarmentFieldAndRemoveButton = () => {
  console.log("garments: " + GARMENT_TYPES_TO_SAVE.size);
  GARMENT_TYPES_TO_SAVE.forEach((element) => {
    // If an element hasn't been added yet add it now
    let rowId = element + "-tr";
    if (document.getElementById(rowId) === null) {
      let row = document.createElement("tr");
      row.setAttribute("id", rowId);
      let garmentNameCell = document.createElement("td");
      garmentNameCell.innerText = element;
      let removeButtonCell = document.createElement("td");
      let removeButton = document.createElement("button");
      removeButton.setAttribute("id", element + "-button");
      removeButton.setAttribute("type", "button");
      removeButton.innerText = "Remove";
      removeButton.addEventListener("click", () => {
        // Remove the HTML for the corresponding row
        document.getElementById(rowId).remove();
        // Remove the element from the global array
        GARMENT_TYPES_TO_SAVE.delete(element);
      });
      removeButtonCell.appendChild(removeButton);
      row.appendChild(garmentNameCell);
      row.appendChild(removeButtonCell);
      garmentsAddedDisplay.appendChild(row);
    }
  });
};
