// We get the APIs from preload
const ipcRenderer = window.ipcRendererApi;

/***** HTML Elements *****/
const imageAreaDisplay = document.querySelector("#image-area-display");
const deleteImageButton = document.querySelector("#delete-image");

let PATTERN_FULL_DATA;
let IMAGE_ID;

/***** Event Listeners *****/

deleteImageButton.addEventListener("click", () => {
  console.log("imagedetailrenderer - delete button clicked");
  ipcRenderer.send("delete-image-button-clicked", PATTERN_FULL_DATA, IMAGE_ID);
});

ipcRenderer.on("image-ready-to-display", (event, pattern, imageId) => {
  console.log("imagedetaillrenderer - image ready to display");
  PATTERN_FULL_DATA = pattern;
  IMAGE_ID = imageId;
  displayFullImage(pattern, imageId);
});

/***** Functions *****/

/**
 * Displays the image in full size on this window.
 * @param {Object} pattern The sewing pattern object
 * @param {Integer} imageId The image id for the image to display
 */
const displayFullImage = (pattern, imageId) => {
  let imageToDisplay = pattern.additional_images.find(
    (elem) => elem.id == imageId
  );
  const imgSrc = `data:image/jpg;base64,${imageToDisplay.image}`;
  imageAreaDisplay.setAttribute("src", imgSrc);
  imageAreaDisplay.setAttribute("style", "width:100%;height:auto;");
};
