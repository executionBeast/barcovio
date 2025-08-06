const {app} = require("electron")
const path = require("path")



const baseDir = path.join(app.getPath("userData"));


const videoDir = path.join(baseDir, "videos");
const dbDir = path.join(baseDir, "database");
const configDir = path.join(baseDir, "config");
const dbFile = path.join(dbDir, "database.db")  //direct access to db.js
const adminSecret = 'dc-ventures@6988'
exports.CONSTANTS = {
    baseDir,
    videoDir,
    dbDir,
    configDir,
    dbFile,
    adminSecret,
    
}