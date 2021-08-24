/***** Functions *****/

/**
 * Displays the cover image in the UI.
 * @param {HTMLElement} coverlocation The UI element to use for display
 * @param {Object} cover The cover image to display in the UI
 */
const displayCover = (exports.displayCover = (coverlocation, cover) => {
  coverlocation.innerHTML = "";
  const imgSrc = `data:image/jpg;base64,${cover}`;
  const outHtml = `<img id="cover-image-img" src=\"${imgSrc}\" style=\"width:300px;height:auto;\"/>`;
  coverlocation.insertAdjacentHTML("beforeend", outHtml);
});

/**
 * Displays the additional images contained in the pattern.
 * @param {HTMLElement} imagesLocation The UI element to use for display
 * @param {Object[]} images The image objects to display in the UI on the additional images section
 */
const displayAdditionalImages = (exports.displayAdditionalImages = (
  imagesLocation,
  images
) => {
  imagesLocation.innerHTML = "";
  images.forEach((element) => {
    const imgSrc = `data:image/jpg;base64,${element.image}`;
    const outHtml = `<img id=additional-image-${element.id} src=\"${imgSrc}\" style=\"width:300px;height:auto;\"/>`;
    imagesLocation.insertAdjacentHTML("beforeend", outHtml);
  });
});

/**
 * Prepares the images uploaded for saving by adding an incremental counter
 * as the identifier of the image. Since each array of images (the returned object)
 * is intended to be passed into the sewing pattern object, the id is unique
 * to the sewing pattern only and not globally.
 * @param {Object[]} images The images to prepare for saving
 * @returns {Object[]} The objects with the id and the image for saving
 */
const prepareImagesForSave = (exports.prepareImagesForSave = (
  countStart,
  images
) => {
  console.log(
    "uifunctions - prepare images for save starting at " + countStart
  );
  let imagesObject = [];
  let count = countStart;
  images.forEach((element) => {
    let imageObject = { id: count, image: element };
    imagesObject.push(imageObject);
    count++;
  });
  return imagesObject;
});
