
// Changed: sqlite3 to better-sqlite3
const Database = require('better-sqlite3');

const {CONSTANTS} = require("../constants.js")
const {utils} = require("../utils/utils.js")
const path = require('path');
const fs = require('fs');

//db.run for insert update delete create
//db.get for one select
//db.all for all select
//table (id, barcode, filename, path, recording_date, size)

let db = null;
let isDbInitialised = false;

function INITIALIZEDBTABLES(db) {   //database record tables initialisation on every app usage opens
    return new Promise((resolve, reject)=> {
        const userSql = `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,  
            password TEXT NOT NULL
        )`
        
        const recordSql = `CREATE TABLE IF NOT EXISTS record (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode TEXT NOT NULL,
            filename TEXT NOT NULL,
            path TEXT NOT NULL,
            recording_date TEXT NOT NULL,
            size TEXT NOT NULL,
            user_id INT,
            FOREIGN KEY (user_id) REFERENCES users(id)
            
        )`
      

        if(!db) {
            console.error("Cannot initialize database table - SQLite is not connected!")
            reject(new Error("Cannot initialize database table - SQLite is not connected!"))
            return;
        }
        
        try {
            // Changed: No callback, direct execution
            db.exec(userSql)
            console.log("Successfully Initialized Users Database Tables");
            db.exec(recordSql);
            console.log("Successfully Initialized Record Database Tables");
            
            // Changed: Direct execution for indexes
            try {
                db.exec(`CREATE INDEX IF NOT EXISTS idx_barcode ON record(barcode)`);
            } catch(err) {
                console.error("Error creating barcode index ", err);
            }
            
            try {
                db.exec(`CREATE INDEX IF NOT EXISTS idx_recording_date ON record(recording_date)`);
            } catch(err) {
                console.error("Error creating recording_date index ", err);
            }
            
            resolve();
        } catch(err) {
            console.log("Initialisation of record and users database tables (schema) failed !")
            reject(err);
        }
    });
}

// Database initialization function
async function initializeDatabase() {
    if(isDbInitialised && db) {
        console.log("Database already initialised.");
        return db;
    }

    console.log("Initializing database.... at: ", CONSTANTS.dbFile);
    
    try {
        const dbDirectory = path.dirname(CONSTANTS.dbFile);
        const validate = utils.validateDir(dbDirectory)

        if(!validate.status) {
            throw new Error(`Directory validation failed: ${validate.msg}`);
        }

        console.log(validate.msg)
        
        // Changed: Synchronous connection, no callback
        db = new Database(CONSTANTS.dbFile);
        console.log('Connected to SQLite database successfully at:', CONSTANTS.dbFile)

        // Initialize tables
        await INITIALIZEDBTABLES(db)
        isDbInitialised = true;
        return db;
    }
    catch(err){
        console.error("Database initialization failed:", err)
        db = null;
        isDbInitialised = false;
        throw err
    }
}

function getDatabase(){
    if(!isDbInitialised || !db){
        throw(new Error("Database not initialized. Call initializeDatabase() first."))
    }
    return db;
}

function INSERTDATA(sql, params = []) {
    return new Promise((resolve, reject) => {
        try{
            const database = getDatabase();
            // Changed: Synchronous execution with prepare/run
            const stmt = database.prepare(sql);
            const result = stmt.run(params);
            
            resolve({
                status: true,
                id: result.lastInsertRowid,
                changes: result.changes
            })
        }
        catch(err) {
            console.error("Insert Error : ", err )
            reject(err);
        }
    })
}

function GETDATA(sql, params = [] ) {
    return new Promise((resolve, reject) => {
        try {
            const database = getDatabase()
            // Changed: Synchronous execution
            console.log("GETDATA SQL :", sql, params)
            const stmt = database.prepare(sql);
            const row = stmt.get(params);
            
            console.log("Retrieved Data :", row)
            resolve(row)
        } catch(err) {
            console.error("Get Data Error : ", err)
            reject(err);
        }
    })
}

function GETALLDATA(sql, params = [] ){
    return new Promise((resolve, reject)=> {
        try {
            const database = getDatabase()
            // Changed: Synchronous execution
            const stmt = database.prepare(sql);
            const rows = stmt.all(params);
            
            console.log("Retrieved Data :", rows)
            resolve({
                status:true,
                data: rows
            })
        }
        catch(err) {
            console.error("Get All Data Error : ", err)
            reject({
                status:false,
                data: null
            })
        }
    })
}

function closeDatabase() {
    return new Promise((resolve, reject) => {
        if(db) {
            try {
                // Changed: Synchronous close, no callback
                db.close();
                console.log("Database connection closed")
                db = null;
                isDbInitialised = false;
                resolve();
            } catch(err) {
                console.error("Error closing database :", err);
                db = null;
                isDbInitialised = false;
                resolve(); // Still resolve to not break the flow
            }
        }
        else {
            resolve();
        }
    })
}

// Changed: Updated dbRun function for better-sqlite3
function dbRun() {
    try {
        const database = getDatabase();
        
        // Create table
        database.exec("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");

        // Insert data
        const stmt = database.prepare("INSERT INTO lorem VALUES (?)");
        for (let i = 0; i < 10; i++) {
            stmt.run("Ipsum " + i);
        }

        // Get data
        const selectStmt = database.prepare("SELECT rowid AS id, info FROM lorem");
        const rows = selectStmt.all();
        
        rows.forEach(row => {
            console.log(row.id + ": " + row.info);
        });

        return rows;
    } catch(err) {
        console.error("dbRun error:", err);
        return [];
    }
}

const recordAPI = {
    insert: async function(recordData){
        const { barcode, filename, path, recording_date, size, user_id } = recordData;
        const sql = `
            INSERT INTO record(barcode, filename, path, recording_date, size, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `
        return await INSERTDATA(sql, [barcode, filename, path, recording_date, size, user_id]);
    },

    getAll : async function() {
        const sql = `SELECT * FROM record ORDER BY recording_date DESC `
        return await GETALLDATA(sql)
    },

    getAllDataByUserID : async function(user_id){
        const sql = `SELECT r.* , u.username FROM record r JOIN users u ON r.user_id = u.id WHERE u.id = ? ORDER BY r.recording_date DESC LIMIT 3`
        return await GETALLDATA(sql, [user_id])
    },

    getByBarCode : async function(barcode) {
        const sql = `SELECT * FROM record WHERE barcode = ? ORDER BY recording_date DESC`
        return await GETDATA(sql, [barcode])
    },

    getById : async function(id) {
        const  sql = `SELECT * FROM record WHERE id = ?`
        return await GETDATA(sql, [id])
    },

    searchByFileName : async function(filename) {
        const sql = `SELECT * FROM record WHERE filename LIKE ? ORDER BY recording_date DESC`
        return await GETALLDATA(sql, [`%${filename}%`])
    }
}

const authAPI = {
    login : async function(username, password) {
        const sql = `SELECT * FROM users WHERE username = ?`
        console.log('Login Db utility : ', {username, password})
        const userdata =  await GETDATA(sql, [username])
        console.log("uSERSATA FROM GETDATA : ", userdata)
        if(!userdata){
            console.log("No user found")
            return {
                status: false,
                data: null,
                msg : `There is no user named : ${username}. signup first!`
            }
        }
        console.log("Password compare : ", password, userdata.password)
        if(password === userdata.password) {
            console.log("Logged In")
            return {
                status: true,
                data: userdata,
                msg: 'Loggedin successfully' 
            }
        }
        else {
            return {
                status: false,
                data : null,
                msg : 'Wrong password'
            }
        }
    },

    signup : async function(username, password) {
        const sql = `INSERT INTO users (username, password) VALUES (?, ?)`
        const signupInsert =  await INSERTDATA(sql, [username, `${password}`])
        if(signupInsert.status){
            return {
                status: true,
                data : signupInsert,
                msg : `User ${username} signed up successfully.`
            }
        }
        else {
            return {
                status: false,
                data : null,
                msg : `Unable to signup`
            }
        }
    }
}

exports.dbAPI = {
    initializeDatabase,
    getDatabase,
    closeDatabase,

    INSERTDATA,
    GETDATA,
    GETALLDATA,

    record : recordAPI,
    auth : authAPI,
    isDbInitialised : () => isDbInitialised, 
    
    dbRun
}










// const sqlite3 = require('sqlite3').verbose();

// const {CONSTANTS} = require("../constants.js")
// const {utils} = require("../utils/utils.js")
// const path = require('path');
// const fs = require('fs');


// //db.run for insert update delete create
// //db.get for one select
// //db.all for all select
// //table (id, barcode, filename, path, recording_date, size)

// let db = null;
// let isDbInitialised = false;



// function INITIALIZEDBTABLES(db) {   //database record tables initialisation on every app usage opens
//     return new Promise((resolve, reject)=> {
//         const sql = `CREATE TABLE IF NOT EXISTS record (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             barcode TEXT NOT NULL,
//             filename TEXT NOT NULL,
//             path TEXT NOT NULL,
//             recording_date TEXT NOT NULL,
//             size TEXT NOT NULL
//         )`
//         if(!db) {
//             console.error("Cannot initialize database table - SQLite is not connected!")
//             reject(new Error("Cannot initialize database table - SQLite is not connected!"))
//             return;
        
//         }
//         db.run(sql, function(err) {
//             if(err) {
//                 console.log("Initialisation of record database tables (schema) failed !")
//                 reject(err);
//             }
//             else{
//                 console.log("Successfully Initialized Record Database Tables");
//                 //indexing
//                 db.run(`CREATE INDEX IF NOT EXISTS idx_barcode ON record(barcode)`, (err)=> {
//                     if (err) console.error("Error creating barcode index ", err);
//                 })
//                 db.run(`CREATE INDEX IF NOT EXISTS idx_recording_date ON record(recording_date)`, (err) => {
//                     if (err) console.error("Error creating recording_date index ",err)
//                 })
//                 resolve();

//             }
//         });
//     });
// }



// // Database initialization function
// async function initializeDatabase() {
//     if(isDbInitialised && db) {
//         console.log("Database already initialised.");
//         return db;
//     }

//     console.log("Initializing database.... at: ", CONSTANTS.dbFile);
    
//     // The directory should already be validated by main.js
//     // But we can double-check here
//     try {
//         const dbDirectory = path.dirname(CONSTANTS.dbFile);
//         const validate = utils.validateDir(dbDirectory)

//         if(!validate.status) {
//             throw new Error(`Directory validation failed: ${validate.msg}`);

//         }

//         console.log(validate.msg)
//         db = await new Promise((resolve, reject)=> {
//             const database = new sqlite3.Database(CONSTANTS.dbFile, (err) => {
//                 if(err) {
//                     console.log("Error opening database connection ", err)
//                     reject(err);
//                 }
//                 else {
//                     console.log('Connected to SQLite database successfully at:', CONSTANTS.dbFile)
//                     resolve(database);
//                 }
//             });
//         });
//         //now we have db instance

    
//         await INITIALIZEDBTABLES(db)
//         isDbInitialised = true;
//         return db;
//     }
//     catch(err){
//         console.error("Database initialization failed:", err)
//         db = null;
//         isDbInitialised = false;
//         throw err
//     }
//     // db = new sqlite3.Database(CONSTANTS.dbFile, (err) => {
//     //     if (err) {
//     //         console.error('Error opening database connection :', err.message);
//     //         return null;
//     //     }
//     //     console.log('Connected to SQLite database successfully at:', CONSTANTS.dbFile);  
//     // });


//     // if (!fs.existsSync(dbDirectory)) {
//     //     console.error("Database directory does not exist:", dbDirectory);
//     //     return null;
//     // }
    
//     // Create database connection

// }

// // const db = initializeDatabase()


// //**Becoz we are outsourcing the initializeDatabase() we have to make a function that check for initialised and db instance exist and use that in every query */
// function getDatabase(){
//     if(!isDbInitialised || !db){
//         throw(new Error("Database not initialized. Call initializeDatabase() first."))
//     }
//     return db;
// }

// function INSERTDATA(sql, params = []) {
//     return new Promise((resolve, reject) => {
//         try{
//             const database = getDatabase();
//             database.run(sql, params, function (err) {
//                 if(err) {
//                     console.error("Insert Error : ", err )
//                     reject(err);
//                 }
//                 else {
//                     resolve({
//                         status: true,
//                         id: this.lastID,
//                         changes: this.changes
//                     })
//                 }
//             })

//         }
//         catch(err) {
//             reject(error);
//         }

//     })
// }

// function GETDATA(sql, params = [] ) {
//     return new Promise((resolve, reject) => {
//         try {
//             const database = getDatabase()
//             database.get(sql, params, (err, row) => {
//                 if(err) {
//                     console.error("Get Data Error : ", err)
//                     reject(err);
//                 }else {
//                     console.log("Retrieved Data :", row)
//                     resolve(row)
//                 }
//             })

//         }catch(err) {
//             console.error("Get Data Function Error : ", err)
//             reject(err)
//         }
//     })
// }


// function GETALLDATA(sql, params = [] ){
//     return new Promise((resolve, reject)=> {
//         try {
//             const database = getDatabase()
//             database.all(sql, params, (err, rows) => {
//                 if(err){
//                     console.error("Get All Data Error : ", err)
//                     reject({
//                         status:false,
//                         data: null
//                     })
//                 }
//                 else {
//                     console.log("Retrieved Data :", rows)
//                     resolve({
//                         status:true,
//                         data: rows
//                     })
//                 }
//             })
//         }
//         catch(err) {
//             console.error("Get All Data function Error : ", err)
//             reject({
//                         status:false,
//                         data: null
//                     })
//         }
//     })
// }


// function closeDatabase() {
//     return new Promise((resolve, reject) => {
//         if(db) {
//             db.close(err=> {
//                 if(err) {
//                     console.error("Error closing database :", err);
//                 }
//                 else {
//                     console.log("Database connection closed")
//                 }
//                 db = null;
//                 isDbInitialised = false;
//                 resolve();
//             })
//         }
//         else {
//             resolve();
//         }

//     })
// }


// function dbRun() {
//     let result = []
//     db.serialize(() => {
//         db.run("CREATE TABLE  IF NOT EXISTS lorem  (info TEXT)");

//         const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//         for (let i = 0; i < 10; i++) {
//             stmt.run("Ipsum " + i);
//         }
//         stmt.finalize();

//         db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
//             console.log(row.id + ": " + row.info);
//             result.push(row)
//         });
//     });

//     db.close();
//     return result;
// }


// const recordAPI = {
//     insert: async function(recordData){
//         const { barcode, filename, path, recording_date, size } = recordData;
//         // const recording_date = new Date().toISOString();
//         const sql = `
//             INSERT INTO record (barcode, filename, path, recording_date, size)
//             VALUES (?, ?, ?, ?, ?)
//         `
//         return await INSERTDATA(sql, [barcode, filename, path, recording_date, size]);

//     },

//     getAll : async function() {
//         const sql = `SELECT * FROM record ORDER BY recording_date DESC`
//         return await GETALLDATA(sql)

//     },

//     getByBarCode : async function(barcode) {
//         const sql = `SELECT * FROM record WHERE barcode = ? ORDER BY recording_date DESC`
//         return await GETDATA(sql, [barcode])
//     },

//     getById : async function(id) {
//         const  sql = `SELECT * FROM record WHERE id = ?`
//         return await GETDATA(sql, [id])
//     },

//     searchByFileName : async function(filename) {
//         const sql = `SELECT * FROM record WHERE filename LIKE ? ORDER BY recording_date DESC`
//         return await GETALLDATA(sql, [`%${filename}%`])
//     }

// }

// exports.dbAPI = {
//     initializeDatabase,
//     getDatabase,
//     closeDatabase,

//     INSERTDATA,
//     GETDATA,
//     GETALLDATA,

//     record : recordAPI,

//     isDbInitialised : () => isDbInitialised, 
    
//     dbRun
// }



