// We get the APIs from preload
const ipcRenderer = window.ipcRendererApi;
const uifunctions = window.uifunctionsApi;

/***** HTML Elements *****/
const patternNameInput = document.querySelector("#pattern-name");
const coverImageDisplay = document.querySelector("#cover-image");
const changeCoverImageButton = document.querySelector("#change-cover-image");
const companyNameInput = document.querySelector("#company-name");
const yearInput = document.querySelector("#year");
const garmentTypeInput = document.querySelector("#garment");
const addGarmentTypeButton = document.querySelector("#add-garment-type");
const garmentsAddedDisplay = document.querySelector("#garments-added");
const notesInput = document.querySelector("#notes");
const additionalImagesDisplay = document.querySelector("#additional-images");
const addImagesButton = document.querySelector("#add-images");
const deletePatternButton = document.querySelector("#delete-pattern");
const saveChangesButton = document.querySelector("#save-changes-button");

let PATTERN_FULL_DATA;
let COVER_IMAGE;
// At any given time this array contains all the images that can be displayed and saved
let ADDITIONAL_IMAGES_TO_SAVE = [];
let GARMENT_TYPES_TO_SAVE = new Set();

/***** Event Listeners *****/

changeCoverImageButton.addEventListener("click", () => {
  console.log("patterndetailrenderer - click change cover image button");
  ipcRenderer.send("open-cover-image-button-clicked", PATTERN_FULL_DATA._id);
});

addGarmentTypeButton.addEventListener("click", () => {
  console.log("patterndetailrenderer - click add garment type button");
  if (garmentTypeInput.value) {
    GARMENT_TYPES_TO_SAVE = GARMENT_TYPES_TO_SAVE.add(garmentTypeInput.value);
    // Clean the input field
    garmentTypeInput.value = null;
    // Generate display for the newly added field and button to remove
    generateGarmentFieldAndRemoveButton(GARMENT_TYPES_TO_SAVE);
  }
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
  console.log("patterndetailrenderer - received details: " + pattern.name);
  fillDetailsFromPattern(pattern);
});

ipcRenderer.on("cover-image-uploaded", (event, cover) => {
  console.log("patterndetailrenderer - cover image uploaded");
  COVER_IMAGE = cover;
  uifunctions.displayCover(coverImageDisplay, cover);
});

ipcRenderer.on("additional-images-uploaded", (event, images) => {
  console.log("patterndetailrenderer - additional images uploaded");
  // We prepare the images with ids for when we want to save them
  let countStart =
    ADDITIONAL_IMAGES_TO_SAVE.length > 0
      ? ADDITIONAL_IMAGES_TO_SAVE[ADDITIONAL_IMAGES_TO_SAVE.length - 1].id + 1
      : 0;
  let imageObjectsToDisplay = uifunctions.prepareImagesForSave(
    countStart,
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
    company: companyNameInput.value,
    year: yearInput.value,
    notes: notesInput.value,
    garments: Array.from(GARMENT_TYPES_TO_SAVE),
  };
};

/**
 * Fills the UI fields with the provided pattern data and dynamically
 * generates garment type entries and buttons as well as adding listeners
 * to remove buttons for garment types and to additional images.
 * @param {Object} pattern The pattern to use for displaying data
 */
const fillDetailsFromPattern = (pattern) => {
  PATTERN_FULL_DATA = pattern;
  ADDITIONAL_IMAGES_TO_SAVE = pattern.additional_images
    ? pattern.additional_images
    : [];
  patternNameInput.value = pattern.name;
  companyNameInput.value = pattern.company;
  yearInput.value = pattern.year;
  notesInput.value = pattern.notes;
  GARMENT_TYPES_TO_SAVE = new Set(pattern.garments);

  generateGarmentFieldAndRemoveButton(GARMENT_TYPES_TO_SAVE);

  uifunctions.displayCover(coverImageDisplay, pattern.cover);
  if (ADDITIONAL_IMAGES_TO_SAVE.length > 0) {
    uifunctions.displayAdditionalImages(
      additionalImagesDisplay,
      ADDITIONAL_IMAGES_TO_SAVE
    );
  }
  addListenersToImages();
};

/**
 * This functions adds an event listener to each image area that when clicked
 * will send an "image-area-clicked" event to the main process with the pattern
 * data and with the image id.
 */
const addListenersToImages = () => {
  let imageAreas = additionalImagesDisplay.childNodes;
  imageAreas.forEach((element) => {
    element.addEventListener("click", () => {
      let id = element.id.match(/[0-9]+$/);
      ipcRenderer.send("image-area-clicked", PATTERN_FULL_DATA, id);
    });
  });
};

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
