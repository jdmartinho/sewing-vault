const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

/***** HTML Elements *****/
const patternNameInput = document.querySelector("#pattern-name");
const coverImageDisplay = document.querySelector("#cover-image");
const saveChangesButton = document.querySelector("#save-changes-button");

let PATTERN_ID;

/***** Event Listeners *****/
saveChangesButton.addEventListener("click", () => {
  console.log("patterndetailsrenderer - click save changes button");
  // create the new pattern object to save
  let pattern = { id: PATTERN_ID, name: patternNameInput.value };
  // send event to the main process
  ipcRenderer.send("save-changes-button-clicked", pattern);
});

ipcRenderer.on("pattern-details-ready", (event, pattern) => {
  PATTERN_ID = pattern._id;
  console.log("----> got something");
  console.log("patterndetailrenderer - received details: " + pattern);
  patternNameInput.value = pattern.name;
  coverImageDisplay.innerHTML = "";
  const imgSrc = `data:image/jpg;base64,${pattern.cover}`;
  const outHtml = `<img src=\"${imgSrc}\" style=\"width:300px;height:auto;\"/>`;
  coverImageDisplay.insertAdjacentHTML("beforeend", outHtml);
});
