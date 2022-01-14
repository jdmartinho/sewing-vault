const { app, BrowserWindow, dialog } = require("electron");
const fs = require("fs");
const db = require("./nosqldb");
const electron = require("electron");
const ipcMain = electron.ipcMain;
const path = require("path");

const INDEX_FILE_LOCATION = "app/index.html";
const ADD_NEW_FILE_LOCATION = "app/addnew.html";
const PATTERN_DETAIL_FILE_LOCATION = "app/patterndetail.html";
const IMAGE_DETAIL_FILE_LOCATION = "app/imagedetail.html";
// Special id for the Add New Pattern window
const ADD_NEW_WINDOW_ID = "addnew";

// Keeps track of windows
let windows = new Map();
let mainWindow = null;
// This Set serves as a proxy to all the garment types in the garments datastore
let GARMENT_TYPES = new Set();

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
  });

  mainWindow.loadFile(INDEX_FILE_LOCATION);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    getAllSewingPatterns();
  });

  mainWindow.on("close", () => {
    if (process.platform == "darwin") {
      return false;
    }
    app.quit();
  });
});

// If all windows are really closed we can go ahead and quit the app except for macOS
app.on("window-all-closed", () => {
  if (process.platform == "darwin") {
    return false;
  }
  app.quit();
});

/***** IPC Communication *****/

ipcMain.on("search-button-clicked", (event, searchOptions) => {
  let searchName = searchOptions.name;
  if (!searchName) {
    getAllSewingPatterns();
  } else {
    getSewingPatternsByName(searchName);
  }
});

/**
 * This handler reacts when the details button is clicked for a pattern in the
 * main window.
 * Once a pattern is selected we make sure there isn't already a window opened
 * for it, if so we focus on it.
 * Otherwise we create a new window with the proper HTML file location and an
 * identifier that matches the database id of the pattern selected.
 * After we create a window we await on the call to the function that retrieves
 * the pattern from the database and then send an event to the window, once its
 * focused, with the pattern to display the data.
 * @param {integer} id The unique id of the pattern to open
 */
ipcMain.on("details-button-clicked", async (event, id) => {
  let window;
  if (windows.has(id)) {
    window = windows.get(id);
    window.focus();
  } else {
    window = createNewWindow(PATTERN_DETAIL_FILE_LOCATION, id);
    let pattern = await openSewingPatternById(id);
    console.log("main - details button clicked for: " + pattern.name);
    window.setTitle("Sewing Vault - " + pattern.name);
    window.once("focus", () => {
      window.webContents.send("pattern-details-ready", pattern);
      console.log("main - sent pattern details ready event");
    });
  }
});

ipcMain.on("add-new-button-clicked", () => {
  let window;
  if (windows.has(ADD_NEW_WINDOW_ID)) {
    window = windows.get(ADD_NEW_WINDOW_ID);
    window.focus();
  } else {
    window = createNewWindow(ADD_NEW_FILE_LOCATION, ADD_NEW_WINDOW_ID);
    window.setTitle("Sewing Vault - Add New Pattern");
  }
});

ipcMain.on("submit-new-pattern-button-clicked", (event, pattern) => {
  addNewSewingPattern(pattern);
  let window = windows.get(ADD_NEW_WINDOW_ID);
  window.close();
  mainWindow.focus();
  getAllSewingPatterns();
});

// The dialog causes a refresh if the button in the HTML doesn't have
// the 'button' type set.
ipcMain.on("open-cover-image-button-clicked", (event, patternId) => {
  console.log("main - open cover image button clicked");
  let window = windows.get(patternId);
  const files = openDialogForImages(window, false);

  if (files) {
    console.log("main - open cover image button clicked -- image selected");
    let imageb64 = fs.readFileSync(files[0]).toString("base64");
    window.webContents.send("cover-image-uploaded", imageb64);
  }
});

ipcMain.on("save-changes-button-clicked", async (event, pattern) => {
  console.log("main - save changes button clicked");
  let updatedId = await updateSewingPattern(pattern);
  addGarmentTypes(pattern.garments);
  let window = windows.get(updatedId);
  window.close();
  mainWindow.focus();
  getAllSewingPatterns();
});

ipcMain.on("add-images-button-clicked", (event, patternId) => {
  console.log("main - open additional images button clicked");
  let window = windows.get(patternId);
  const files = openDialogForImages(window, true);

  if (files) {
    console.log(
      "main - open additional images button clicked -- images selected"
    );
    sendAdditionalImagesUploaded(window, files);
  }
});

ipcMain.on("delete-pattern-button-clicked", async (event, patternId) => {
  console.log("main - delete pattern button clicked");
  let deletedId = await deleteSewingPattern(patternId);
  let window = windows.get(deletedId);
  window.close();
  mainWindow.focus();
  getAllSewingPatterns();
});

ipcMain.on("image-area-clicked", (event, pattern, imageId) => {
  console.log(
    "main - image clicked " + imageId + " for pattern " + pattern.name
  );

  let imageWindowId = pattern._id + "-" + imageId;
  let window = createNewWindow(IMAGE_DETAIL_FILE_LOCATION, imageWindowId);
  window.setTitle("Sewing Vault - Image Detail - " + pattern.name);
  window.once("focus", () => {
    window.webContents.send("image-ready-to-display", pattern, imageId);
    console.log("main - sent pattern details ready event");
  });
});

ipcMain.on("delete-image-button-clicked", async (event, pattern, imageId) => {
  console.log("main - delete image button event received");
  let updatedPattern = await deleteImageFromPattern(pattern, imageId);
  // Close window automatically
  let imageWindow = windows.get(pattern._id + "-" + imageId);
  imageWindow.close();
  // Refresh data on the sewing pattern details window
  let window = windows.get(updatedPattern._id);
  window.focus();
  window.webContents.send("pattern-details-ready", updatedPattern);
});

/***** Functions *****/

/**
 * Creates a new window in the application that is not the main window.
 * Uses identifiers to add the new window to a Map. The identifiers are
 * tied to the database identifier of the sewing pattern and other data to display.
 * In the case of a window to add a new pattern a special string identifier
 * is passed to this function.
 * @param {string} fileLocation The HTML file to load in this window
 * @param {integer or string} id The identifier of the new window
 * @returns {BrowserWindow} The newly created window
 */
const createNewWindow = (fileLocation, id) => {
  let x, y;
  const currentWindow = BrowserWindow.getFocusedWindow();

  // When we already have a window we open a new one to the right and down of the current one
  if (currentWindow) {
    const [currentWindowX, currentWindowY] = currentWindow.getPosition();
    x = currentWindowX + 20;
    y = currentWindowY + 20;
  }

  let newWindow = new BrowserWindow({
    x,
    y,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
  });

  newWindow.loadFile(fileLocation);

  newWindow.once("ready-to-show", () => {
    newWindow.show();
  });

  // Necessary otherwise the HTML default title is always used
  newWindow.on("page-title-updated", (event) => {
    event.preventDefault();
  });

  newWindow.on("close", () => {
    windows.delete(id);
    newWindow = null;
  });

  windows.set(id, newWindow);
  console.log("main - finished new window creation for id: " + id);

  return newWindow;
};

/**
 * Sends an event to the main window to display this list of patterns.
 * @param {Object[]} patterns The array of patterns to display in the UI
 */
const displayPatterns = (patterns) => {
  // Needs to update the index.html
  // Send an event that is caught in the indexrenderer.js
  // This event handler should update the html with the results
  console.log("main - display patterns");
  mainWindow.webContents.send("list-updated", patterns);
};

/**
 * Opens a dialog and allows multiple images to be selected for the given window.
 * @param {BrowserWindow} window The window for which we are opening a dialog
 * @param {boolean} multiSelections If true allow selection of multiple files
 * @returns {Object[]} The images selected
 */
const openDialogForImages = (window, multiSelections) => {
  console.log("main - open dialog for additional images");
  let props = ["openFile"];
  if (multiSelections) {
    props.push("multiSelections");
  }
  const files = dialog.showOpenDialogSync(window, {
    properties: props,
    filters: [{ name: "Image Files", extensions: ["jpg", "jpeg", "png"] }],
  });
  return files;
};

/**
 * Sends the "additional-images-uploaded" even to the given window with the list
 * of files in base64 encoding.
 * @param {BrowserWindow} window The window for which we are sending the event
 * @param {Object[]} images The list of images to pass to the window for handling
 */
const sendAdditionalImagesUploaded = (window, images) => {
  let imagesb64 = [];
  images.forEach((element) => {
    imagesb64.push(fs.readFileSync(element).toString("base64"));
  });
  window.webContents.send("additional-images-uploaded", imagesb64);
};

/**
 * Calls the Database API to get all the existing sewing patterns
 * and then displays them by calling displayPatterns().
 * @returns {Object[]} All the patterns in the database
 */
const getAllSewingPatterns = () => {
  console.log("main - Getting all sewing patterns");
  db.getAllPatterns().then((results) => {
    results.forEach((element) => {
      console.log("main - id: " + element._id + " name: " + element.name);
    });
    displayPatterns(results);
  });
  // We also get all the garment types to update the UI for search suggestions
  db.getAllGarmentTypes().then((results) => {
    results.forEach((element) => {
      console.log("main - id: " + element._id + " name: " + element.name);
    });
    updateGarmentTypes(results);
  });
};

/**
 * Calls the Database API to search for sewing patterns containing the
 * provided string in the name and then displays them in the results
 * are by calling displayPatterns().
 * @param {string} searchText
 * @returns {Object[]} The patterns that matched the query
 */
const getSewingPatternsByName = (searchText) => {
  console.log("main - Getting sewing patterns by name: " + searchText);
  db.getSewingPatternsByName(searchText).then((results) => {
    displayPatterns(results);
  });
};

/**
 * This function is async and awaits for the database query to finish and return.
 * It uses the Database API to get the sewing pattern matching the provided id.
 * @param {integer} id The identifier in the database of the pattern to open
 * @returns {Object} The retrieved pattern
 */
const openSewingPatternById = async (id) => {
  console.log("main - Getting sewing pattern by id: " + id);
  var pattern = null;
  var aPromise = await db.getSewingPatternById(id).then((results) => {
    pattern = results[0];
    console.log("got the pattern " + pattern.name);
  });
  return pattern;
};

/**
 * Calls the Database API to insert a new sewing pattern in the database.
 * @param {Object} pattern The sewing pattern object to insert
 * @returns {integer} The identifier of the inserted pattern
 */
const addNewSewingPattern = (pattern) => {
  console.log("main - Adding a new sewing pattern");
  db.addNewSewingPattern(pattern).then((insertedId) => {
    console.log("main - inserted new with id " + insertedId);
  });
  // We also need to consider any new additions to the garment types database
  addGarmentTypes(pattern.garments);
};

/**
 * Calls the Database API to update a sewing pattern.
 * @param {Object} pattern The sewing pattern object to update
 * @returns {integer} The identifier of the updated pattern
 */
const updateSewingPattern = async (pattern) => {
  console.log("main - Updating sewing pattern");
  var updatedId = null;
  var aPromise = await db.updateSewingPattern(pattern).then((returnedId) => {
    console.log("main - updated pattern with id " + returnedId);
    updatedId = returnedId;
  });
  return updatedId;
};

/**
 * Calls the Database API to delete a sewing pattern.
 * @param {string} patternId The identifier of the pattern to delete
 * @returns {string} The identifier of the pattern removed
 */
const deleteSewingPattern = async (patternId) => {
  console.log("main - Deleting sewing pattern");
  var deletedId = null;
  var aPromise = await db.deleteSewingPattern(patternId).then((returnedId) => {
    console.log("mai - deleted pattern with id " + returnedId);
    deletedId = returnedId;
  });
  return deletedId;
};

/**
 * Removes an image from the array of images contained in the sewing pattern.
 * @param {Object} pattern The pattern to update
 * @param {integer} imageId The id of the image to remove from the pattern
 * @returns {Object} The updated pattern without the image
 */
const deleteImageFromPattern = async (pattern, imageId) => {
  console.log(
    "main - Deleting image " + imageId + " from pattern " + pattern.name
  );
  // Call the Database API for deleting
  let updatedPattern = null;
  var aPromise = await db
    .deleteImageFromPattern(pattern, imageId)
    .then((returnedObject) => {
      console.log("main - removed image from pattern");
      updatedPattern = returnedObject;
    });
  return updatedPattern;
};

/**
 * Takes an array of garment types and creates a Set from it. It then sends an
 * event to the renderer process to update the UI with them.
 * @param {Object[]} garmentTypes All the garment types to pass in the update
 */
const updateGarmentTypes = (garmentTypes) => {
  console.log("main - updating garment types");
  let garmentNames = garmentTypes.map((elem) => elem.name);
  GARMENT_TYPES = new Set(garmentNames);
  mainWindow.webContents.send("garment-types-updated", GARMENT_TYPES);
};

/**
 * Takes an array of garment types (with names only) and if they don't
 * exist on the GARMENT_TYPES proxy Set, it adds them to the database.
 * @param {Object[]} garmentTypes The array of garment types to try to add
 */
const addGarmentTypes = (garmentTypes) => {
  garmentTypes.forEach((element) => {
    // Only insert it if it doesn't exist yet
    if (!GARMENT_TYPES.has(element)) {
      let garmentType = { name: element };
      db.addNewGarmentType(garmentType).then((insertedId) => {
        console.log("main - inserted new garment type with id " + insertedId);
      });
    }
  });
};
