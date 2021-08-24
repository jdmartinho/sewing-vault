const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

const imageAreaDisplay = document.querySelector("#image-area-display");

ipcRenderer.on("image-ready-to-display", (event, pattern, imageId) => {
  console.log("imagedetaillrenderer - image ready to display");
  displayFullImage(pattern, imageId);
});

/**
 * Displays the image in full size on this window.
 * @param {Object} pattern The sewing pattern object
 * @param {Integer} imageId The image id for the image to display
 */
const displayFullImage = (pattern, imageId) => {
  let imageToDisplay = pattern.additional_images[imageId].image;
  const imgSrc = `data:image/jpg;base64,${imageToDisplay}`;
  imageAreaDisplay.setAttribute("src", imgSrc);
  imageAreaDisplay.setAttribute("style", "width:100%;height:auto;");
};
