// We get the APIs from preload
const ipcRenderer = window.ipcRendererApi;

/***** HTML Elements *****/
const addNewButton = document.querySelector("#add-new-button");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const patternList = document.querySelector("#pattern-list");

/***** Event Listeners *****/
addNewButton.addEventListener("click", () => {
  console.log("indexrenderer - click add new button");
  ipcRenderer.send("add-new-button-clicked");
});

searchButton.addEventListener("click", () => {
  console.log("indexrenderer - click search button");
  let searchText = searchInput.value;
  ipcRenderer.send("search-button-clicked", searchText);
});

ipcRenderer.on("list-updated", (event, patterns) => {
  console.log("indexrenderer - event list-updated received");
  renderSewingPatternsToList(patterns);
});

/***** Functions *****/

/**
 * Renders a list of patterns in the UI.
 * @param {Object[]} patterns The list of patterns to show in the UI
 */
const renderSewingPatternsToList = (patterns) => {
  // First we make sure we clean all the previous results
  patternList.innerHTML = "";
  // After we create an entry for each new pattern and add to the list
  patterns.forEach((element) => {
    let item = document.createElement("li");
    item.setAttribute("id", element._id);
    item.appendChild(document.createTextNode(element.name));

    let detailsButton = createDetailsButton(element);
    item.appendChild(detailsButton);

    let coverImage = createCoverImage(element);
    item.appendChild(coverImage);

    patternList.appendChild(item);
  });
};

/**
 * Creates the HTML of a details button for the pattern.
 * @param {Object} element The pattern to use
 * @returns {HTMLElement} A details button for the provided pattern
 */
const createDetailsButton = (element) => {
  let detailsButton = document.createElement("button");
  const detailsButtonId = "button-details-" + element._id;
  detailsButton.setAttribute("id", detailsButtonId);
  detailsButton.setAttribute("value", "See Details");
  detailsButton.innerText = "See Details";

  detailsButton.addEventListener("click", () => {
    console.log(`indexrenderer - details button ${detailsButtonId} clicked`);
    ipcRenderer.send("details-button-clicked", element._id);
  });

  return detailsButton;
};

/**
 * Creates a new div with the cover image for the pattern inside.
 * @param {Object} element The pattern to use
 * @returns {HTMLElement} A div with the cover image inside
 */
const createCoverImage = (element) => {
  let coverImage = document.createElement("div");
  const imgSrc = `data:image/jpg;base64,${element.cover}`;
  const outHtml = `<img src=\"${imgSrc}\" style=\"width:100px;height:auto;\"/>`;
  coverImage.insertAdjacentHTML("beforeend", outHtml);
  return coverImage;
};
