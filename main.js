const { app, BrowserWindow, shell} = require("electron");
const {ipcMain}  = require("electron")
const path = require("path");
const {utils} = require("./utils/utils.js")
const {dbAPI} = require("./models/db.js")
const {CONSTANTS} = require("./constants.js")
const fs = require('fs')


function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    title : 'Barcovio',
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,                       // required for security
      enableRemoteModule: true,
      nodeIntegration: false,
      sandbox: false
    }   
  });

  // win.loadFile("index.html"); // load your main UI
  win.loadFile("index.html"); // load your main UI

}

async function initialiseApp() {
  try{
    //path validation
    const videoDirValidation = utils.validateDir(CONSTANTS.videoDir)
    const dbDirValidation = utils.validateDir(CONSTANTS.dbDir)
    const configDirValidation = utils.validateDir(CONSTANTS.configDir)

    console.log("Directory validations:", {
        database: dbDirValidation.status,
        videos: videoDirValidation.status,
        config: configDirValidation.status
    });
    
    //db initialisation
    await dbAPI.initializeDatabase()
    console.log("Database initialized successfully");

    //check database initialisation
    const isDbInitialised = dbAPI.isDbInitialised();
    console.log("Database status:", isDbInitialised ? "Ready" : "Not ready");

    return true;


  }
  catch(err) {
    console.error("❌ Failed to initialize app:", err);
    return false;
  }
  
}

// //initialize db File
// utils.validateDir(CONSTANTS.dbDir)


console.log("userData path :",app.getPath("userData")) //C:\Users\raos9\AppData\Roaming\simple-electron-app
console.log("appData path :",app.getPath("appData"))   //C:\Users\raos9\AppData\Roaming
console.log("CONSTANTS of paths : ", CONSTANTS) //working 


//all IPCs
ipcMain.handle("check", (event, args) => {
  console.log("ARGS : ", args)
  return { success: true}
})

ipcMain.handle('dbRun', (event, args) => {
  console.log("ARGS : ", args)
  return dbAPI.dbRun();
})

///save video as well as store in db working
// arrayBuffer, filename, barcode, recording_date
ipcMain.handle('save-video-file', async (event, arrayBuffer, filename, barcode, recording_date) => {
  console.log("IPC 'save-video-file' : ",{ filename: filename, size: arrayBuffer.byteLength / 1024*1024 })
  const result = await utils.saveVideoFile(arrayBuffer, filename)
  const fileSizeMB = (arrayBuffer.byteLength / (1024*1024)).toFixed(2);
  if(result.success) {
    const recordData = {
      barcode, filename, path:result.data.path, recording_date, size: fileSizeMB
    }
    console.log("Prepared recordData to store in db :", recordData)

    const dbResponse = await dbAPI.record.insert(recordData)
    if (dbResponse.status) console.log("recordData successfully inserted in record database")

  }
  return result
})

//get all data ipc
ipcMain.handle('get-all-data', async function (event) {
  console.log("Get All Data IPC fired...")
  const data = await dbAPI.record.getAll();
  if(data.status){
    return data
  }
  return null;
  
})

ipcMain.handle('open-file-in-explorer', async (event, filePath) => {
  try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
          return { success: false, error: 'File does not exist' };
      }

      // Open file with default application
      await shell.openPath(filePath);
      return { success: true };
  } catch (error) {
      return { success: false, error: error.message };
  }
});


ipcMain.handle('login', async (event, username, password) => {
  try {
    let loginResponse = await dbAPI.auth.login(username, password.toString())
    return loginResponse;  //login failure and all handled there
  }
  catch(err){
    console.log("Auth Error : ", err)
    return {
      status: false,
      data: null,
      msg : 'Unable to login',
      
    }
  }
})

ipcMain.handle('signup', async (event, username, password, secret) => {
  console.log('Signup IPC : ', {username, password, secret})
    if(secret === CONSTANTS.adminSecret){
      
      let signupResponse = await dbAPI.auth.signup(username, password)
      console.log("Signup response : ",signupResponse);
      return signupResponse;

    }
    else{
      return {
        status: false,
        data : null,
        msg : 'Wrong admin secret ',
      }
    }
})



app.on("ready", async () => {
  const initialised = await initialiseApp();
  if(initialised) {
    createWindow()
  }
  else {
    console.error("💥 Failed to initialize app");
    app.quit();
  }

});

app.on("window-all-closed", async () => {
  try {
    await dbAPI.closeDatabase();
    console.log("Database connection closed cleanly")
  }
  catch(err) {
    console.error("Error closing database:", err);
  }
  if (process.platform !== "darwin") app.quit();

});


if (!process.env.NODE_ENV === 'production') {
    Menu.setApplicationMenu(null);
  }

app.on("before-quit", async () => {
  try{
    await dbAPI.closeDatabase();
  }
  catch(err) {
    console.error("Error closing database on quit:", err);
  }
})
