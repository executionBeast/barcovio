const path = require("path")
const os = require("os")
const fs = require("fs")
const {CONSTANTS} = require("../constants.js")
const {app}  = require('electron')

function checkIPC(args) {
    console.log("ARGS : ", args)
    return args
}

function validateDir(dir) {   //run this in every utility that operate on filesystem
    try {
        if (!fs.existsSync(dir)) {
            console.log(`Directory '${dir}' does not exist! attempting to create it.`)
            fs.mkdirSync(dir, { recursive: true });
            return {
                status : true,
                msg : `Directory '${dir}' created successfully`
            }
        }
        else {
            console.log(`Directory '${dir}' already exists.`)
            return {
                status : true,
                msg : `Directory '${dir}' already exists`
            }
        }

    }
    catch(err) {
        console.log(`Error validating directory ${dir}`, err)
        return {
            status: false,
            msg : 'Some error occured validating directory'
        }

    }       
    
}

// const videoDir = path.join(os.homedir(), "Documents", "barcovio", "video");

const saveVideoFile = async (arrayBuffer, filename) => {
    try {
                
        const videoDir = CONSTANTS.videoDir;
        const validate = validateDir(videoDir);
        if(validate.status){
            console.log("Saving ", filename, "at", videoDir);

            // const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const filePath = path.join(videoDir, `${filename}.webm`);
            fs.writeFileSync(filePath, buffer);
            console.log(`Video saved at: ${filePath}`);
            return {
                success: true,
                data: {
                    path: filePath
                },
                msg :  `Successfully saved video ${filePath}`

            }
        }else {
            console.log("saveVideoFile error!", validate)
            return {
                success: false,
                data: null,
                msg: `Error in validating video save directory!`
            }
        }
        
    }
    catch(err) {
        console.log("ERROR SAVING VIDEO FILE : ", err)
        return {
            success : false,
            msg:  `Error Saving Video ${filePath}`
        }
    }
 
};

// const openFileInExplorer(file){
//     app.
// }

exports.utils = {
    saveVideoFile,
    validateDir,
    checkIPC
}
