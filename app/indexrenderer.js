const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

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

const renderSewingPatternsToList = (patterns) => {
  // First we make sure we clean all the previous results
  patternList.innerHTML = "";
  // After we create an entry for each new pattern and add to the list
  patterns.forEach((element) => {
    let item = document.createElement("li");
    item.setAttribute("id", element.id);
    item.appendChild(document.createTextNode(element.name));

    let detailsButton = createDetailsButton(element);
    item.appendChild(detailsButton);

    patternList.appendChild(item);
  });
};

const createDetailsButton = (element) => {
  let detailsButton = document.createElement("button");
  const detailsButtonId = "button-details-" + element.id;
  detailsButton.setAttribute("id", detailsButtonId);
  detailsButton.setAttribute("value", "See Details");
  detailsButton.innerText = "See Details";

  detailsButton.addEventListener("click", () => {
    console.log(`indexrenderer - details button ${detailsButtonId} clicked`);
    ipcRenderer.send("details-button-clicked", element.id);
  });

  return detailsButton;
};
