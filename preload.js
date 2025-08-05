const fs = require("fs");
const path = require("path");
const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld("electronAPI", {
    saveVideoFile : (arrayBuffer, filename, barcode, recording_date, user_id) => ipcRenderer.invoke('save-video-file', arrayBuffer, filename, barcode, recording_date, user_id),
    getAllDataByUserID: (user_id) => ipcRenderer.invoke('get-all-data', user_id),
    dbRun : () => ipcRenderer.invoke('dbRun', 1234), 
    checkIPC: (args) =>  ipcRenderer.invoke('check', args),
    openFileInExplorer: (filePath) => ipcRenderer.invoke('open-file-in-explorer', filePath),
    signup : (username, password, secret) => ipcRenderer.invoke('signup', username, password, secret),
    login : (username, password) => ipcRenderer.invoke('login', username, password)
});





// const {dbAPI} = require("./models/db.js")    //here exports object is imported so anything exported should be deconstructed
//  console.log(dbAPI)
// Base directory for saving files
// const baseDir = path.join(os.homedir(), "Documents", "barcovio", "video");

// Ensure the directory exists
// if (!fs.existsSync(baseDir)) {
//     fs.mkdirSync(baseDir, { recursive: true });
// }

// const saveVideoFile = async (blob, filename) => {
//     console.log("Saving to:", baseDir);

//     const arrayBuffer = await blob.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     const filePath = path.join(baseDir, `${filename}.webm`);
//     fs.writeFileSync(filePath, buffer);
//     console.log(`Video saved at: ${filePath}`);
// };

    // saveVideoFile: saveVideoFile,


// const fs = require("fs");
// const path = require("path");
// const { contextBridge } = require("electron");



// const saveVideoFile = async (blob, filename) => {
//     console.log("Blob from isolated world : ", blob)
//     // console.log("save video function that takes blob and utilise path fs module to save locally")
//     const arrayBuffer = await blob.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     fs.writeFileSync(`./video/${filename}.webm`, buffer)
// }


// contextBridge.exposeInMainWorld("electronAPI", {
//     data:'api',
//     saveVideoFile : saveVideoFile
    
    
// });

