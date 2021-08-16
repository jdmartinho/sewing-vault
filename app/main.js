const { app, BrowserWindow, dialog } = require("electron");
const fs = require("fs");
const db = require("./database");
const electron = require("electron");
const ipcMain = electron.ipcMain;

const ADD_NEW_FILE_LOCATION = "app/addnew.html";
const PATTERN_DETAIL_FILE_LOCATION = "app/patterndetail.html";
const ADD_NEW_WINDOW_ID = "addnew";

// Keeps track of windows
let windows = new Map();
let mainWindow = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
  });

  mainWindow.loadFile("app/index.html");

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

ipcMain.on("search-button-clicked", (event, searchText) => {
  if (!searchText) {
    getAllSewingPatterns();
  } else {
    getSewingPatternsByName(searchText);
  }
});

ipcMain.on("add-new-button-clicked", () => {
  let window;
  if (windows.has(ADD_NEW_WINDOW_ID)) {
    window = windows.get(ADD_NEW_WINDOW_ID);
    window.focus();
  } else {
    window = createNewSewingPatternWindow(
      ADD_NEW_FILE_LOCATION,
      ADD_NEW_WINDOW_ID
    );
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
ipcMain.on("open-cover-image-button-clicked", (event) => {
  let window = windows.get(ADD_NEW_WINDOW_ID);
  console.log("main - open cover image button clicked");
  const files = dialog.showOpenDialogSync(window, {
    properties: ["openFile"],
    filters: [{ name: "Image Files", extensions: ["jpg", "jpeg", "png"] }],
  });

  if (files) {
    console.log("main - open cover image button clicked -- image selected");
    let imageb64 = fs.readFileSync(files[0]).toString("base64");
    window.webContents.send("cover-image-uploaded", imageb64);
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
    window = createNewSewingPatternWindow(PATTERN_DETAIL_FILE_LOCATION, id);
    let pattern = await openSewingPatternById(id);
    console.log("this is the pattern before sending: " + pattern.name);
    window.setTitle("Sewing Vault - " + pattern.name);
    window.on("focus", () => {
      window.webContents.send("pattern-details-ready", pattern);
      console.log("sent the event");
    });
  }
});

ipcMain.on("save-changes-button-clicked", (event, pattern) => {
  updateSewingPattern(pattern);
});

/***** Functions *****/

/**
 * Creates a new window in the application that is not the main window.
 * Uses identifiers to add the new window to a Map. The identifiers are
 * tied to the database identifier of the sewing pattern to display.
 * In the case of a window to add a new pattern a special string identifier
 * is passed to this function.
 * @param {string} fileLocation The HTML file to load in this window
 * @param {integer or string} id The identifier of the new window
 * @returns {BrowserWindow} The newly created window
 */
const createNewSewingPatternWindow = (fileLocation, id) => {
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
      nodeIntegration: true,
      contextIsolation: false,
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
 * Calls the Database API to get all the existing sewing patterns
 * and then displays them by calling displayPatterns().
 * @returns {Object[]} All the patterns in the database
 */
const getAllSewingPatterns = () => {
  console.log("main - Getting all sewing patterns");
  db.getAllPatterns().then((results) => {
    results.forEach((element) => {
      console.log("main - id: " + element.id + " name: " + element.name);
    });
    displayPatterns(results);
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
};

/**
 * Calls the Database API to update a sewing pattern.
 * @param {Object} pattern The sewing pattern object to update
 * @returns {integer} The identifier of the updated pattern
 */
const updateSewingPattern = (pattern) => {
  console.log("main - Updating sewing pattern");
  db.updateSewingPattern(pattern).then((updatedId) => {
    console.log("main - updated pattern with id " + updatedId);
  });
};
