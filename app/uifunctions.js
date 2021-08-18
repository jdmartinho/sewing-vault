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
 * @param {Object[]} images The images to display in the UI on the additional images section
 */
const displayAdditionalImages = (exports.displayAdditionalImages = (
  imagesLocation,
  images
) => {
  imagesLocation.innerHTML = "";
  images.forEach((element) => {
    const imgSrc = `data:image/jpg;base64,${element}`;
    const outHtml = `<img src=\"${imgSrc}\" style=\"width:300px;height:auto;\"/>`;
    imagesLocation.insertAdjacentHTML("beforeend", outHtml);
  });
});
