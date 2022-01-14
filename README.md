# Architecture

The application follows an architecture that has three tiers for logic
1. renderer - at this level we deal with all UI interactions
    * Listen for events from UI elements
    * Send events to the main process when needed
    * Listen on ipcRenderer for events sent from the main process via ipcMain
    * Rebuild the UI elements and populate them
2. main - this is the main level where most things happen and through where all actions must pass
    * Manage windows (creating, destroying and selecting)
    * Assign HTML files for each renderer process/window pair
    * Listen for events sent from the renderer processes and interpret them
    * Interact with the database through the Database API
    * Send results to the renderer processes through ipcMain
    * Deal with all system level operations
3. database - this is the database level where we just interact with the database without context
    * Provide API for CRUD and most common operations
    * The API is provided in a way that multiple database technologies can be used/swapped
    * The database.js file uses SQLite 3 while the nosqldb.js file uses NeDB

  ```
    ┌─────────────────┐
    │                 │
    │    renderer     │
    └───┬─────────────┘
        │        ▲
ipcRenderer    │
        │        │
        │      ipcMain
        ▼        │
    ┌────────────┴────┐
    │                 │
    │     main        │
    └───┬─────────────┘
        │        ▲
        │        │
        │  API   │
        │        │
        ▼        │
    ┌────────────┴────┐
    │                 │
    │    database     │
    │                 │
    └─────────────────┘
```

# Notes
* The best practice of exposing only required APIs in the renderer processes through the preload.js file is used.
This file uses a contextBridge object to expose only the desired functions from required files such as uifunctions.js and the
electron.ipcRenderer object. By using this we maintain security and context isolation and we seamlessly continue to use the
ipcRenderer object in the renderer processes. The preload.js file must be specified when we create the window.





