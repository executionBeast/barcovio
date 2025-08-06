// ---------------------------------------------------Authentication-----------------------------------------------------------------------------------------

let isLoggedIn = null


function navigateToSignup() {
    let loginForm = document.getElementById('login-form')
    let signupForm = document.getElementById('signup-form')

    loginForm.style.display = "none"
    signupForm.style.display = "flex"
    console.log("navigate to signup") 
}

function navigateToLogin() {
    let loginForm = document.getElementById('login-form')
    let signupForm = document.getElementById('signup-form')

    loginForm.style.display = "flex"
    signupForm.style.display = "none"
    console.log("navigate to signup")
}

function showPassword(elID){
    console.log("Input Clicked : ",elID)
    let pass = document.getElementById(elID)
    pass.type = "text"
}
function hidePassword(elID){
    let pass = document.getElementById(elID)
    pass.type = "password"
}

function showLoginWarning(text){
    const loginWarningSpan = document.getElementById('loginWarning')
    loginWarningSpan.textContent = text

}
function showSignupWarning(text){
    const signupWarningSpan = document.getElementById('signupWarning')
    signupWarningSpan.textContent = text
    return setTimeout(()=> signupWarningSpan.text = '', 2000)

}

function setSessionStorage(key, value) {
    let val = JSON.stringify(value)
    window.sessionStorage.setItem(key, val)
}

function getSessionStorage(key){
    let value = window.sessionStorage.getItem(key)
    let jsonParsed = JSON.parse(value)
    return jsonParsed;
}

function hideLoginModal(){
    const loginModal = document.getElementById("login-modal")
    loginModal.style.display = 'none'
}

function loadLoggedInStateInUI(){
    const userSpan = document.getElementById('userSpan')
    console.log('Checking if logged in then hide login modal')
    let auth = getSessionStorage('auth')
    if(auth) {
      hideLoginModal();
      isLoggedIn = true;
    }
    userSpan.textContent = auth?.data?.username


}

loadLoggedInStateInUI();



async function handleLogin() {
    const userNameInput = document.getElementById('loginUsername')
    const loginPasswordInput = document.getElementById('loginPassword')
    try {
        let payload = {
            username : userNameInput.value,
            password : loginPasswordInput.value
        }
        let loginRes = await window.electronAPI.login(payload.username, payload.password)
        console.log("Login Payload : ", payload)
        console.log("Login Response : ", loginRes)
        if(loginRes.status){
            setSessionStorage('auth', loginRes)
            notify(loginRes.msg)
            // loginModal.style.display = 'none'
            // hideLoginModal()
            loadLoggedInStateInUI()
            isLoggedIn = true;

            ;(async function(){
              await loadDataInTable()
            })();
        }
        else{
            notify(loginRes.msg)
            showLoginWarning(loginRes.msg)
            isLoggedIn = false;

        }
    }
    catch(err) {
        console.log('Error Signup : ', err)
        notify('Error occured while logging in!')
    }
    
}

async function handleSignup() {
    const userNameInput = document.getElementById('signupUsername')
    const signupPasswordInput = document.getElementById('signupPassword')
    const secretPasswordInput = document.getElementById('secretPassword')
    const signupBtn = document.getElementById('signupBtn')
    try {
        let payload = {
            username : userNameInput.value, 
            password : signupPasswordInput.value,
            secret : secretPasswordInput.value
        }
        console.log('Signup Payload : ', payload )
        let singupRes = await  window.electronAPI.signup(payload.username, payload.password, payload.secret)
        console.log("Singup Res : ", singupRes)
        if(singupRes.status){
            notify(singupRes.msg)
            navigateToLogin()
        }
        else {
            console.log("Wrong Secret", singupRes)
            showSignupWarning(singupRes.msg)
            notify(singupRes.msg)
        }

    }
    catch (err) {
        console.log('Error Signup : ', err)
        notify('Some error occured kindly restart the application')
    }

}



// -------------------------------------------------/Authentication--------------------------------------------------------------------------------------------




// ------------------------------------------------View All Record Panel---------------------------------------------



const viewAllDataTable = document.getElementById('view-all-data-table')
const viewAllDataTableTbody = document.getElementById('view-all-data-table-tbody')
const searchBtn = document.getElementById('search-btn')
const filterField = document.getElementById('filter-field')

filterField.addEventListener('focusin', function(e){
  searchBtn.disabled = false;
  searchBtn.classList.remove('cursor-not-allowed')
})

function searchRecordByBarcode(){
  let search = filterField.value
  if(search){
    ;(async function(){
      await loadDataInViewAllTable(search)

    })();
    console.log("Search is : ", search)
  }else { 
    alert(`Search field is empty : ${filterField.value}`)

  }

}


async function loadDataInViewAllTable(search=null) {
  
  try {
    if(search){
      console.log("Load Data for Single product : ", search)
      viewAllDataTableTbody.replaceChildren('')
      let user_id = getUserInfo().id;
      const record = await electronAPI.getDataByBarcode(search);
      console.log("Record of searched item : ", record)
      if(record){
        // console.log(record)
        let row = document.createElement('tr')
        // row.className = 'text-[10px]'
        row.className =  'whitespace-nowrap h-[30px] border-b-[1px] border-[#21212155]'
        // row.classList.add('text-[10px whitespace-nowrap border-b-[1px] border-[#21212155] w-full flex justify-between text-left')
        // let idTd = document.createElement('td')
        // idTd.className= "w-[30px]"
        let barcodeTd = document.createElement('td')
        barcodeTd.className = 'px-4 text-sm text-gray-800'
        // barcodeTd.className='text-[10px]'
        let filenameTd = document.createElement('td')
        filenameTd.className = 'px-4 text-sm text-gray-800'
        let filePathTd = document.createElement('td')
        filePathTd.className = 'px-4 text-sm text-gray-800'
        let recordDateTd = document.createElement('td')
        recordDateTd.className = 'px-4 text-sm text-gray-800 whitespace-nowrap'
        let sizeTd = document.createElement('td')
        sizeTd.className = 'px-4 text-sm text-gray-800'
        let packaged_by = document.createElement('td')
        packaged_by.className = 'px-4 text-sm text-gray-800'


        let actionTd = document.createElement('td')
        actionTd.className = 'px-4  text-sm text-gray-800 flex gap-2'
        let openBtn  = document.createElement('button')
        openBtn.className = 'border rounded bg-gray-400 text-[#fff] px-1 border-white'
        let copyBtn = document.createElement('button')
        copyBtn.className = 'border rounded px-1 bg-gray-200 border-black'
        openBtn.textContent = 'Open'
        openBtn.onclick = () => {
          console.log("Openingn file "+ record.filename)
          electronAPI.openFileInExplorer(record.path)
        }
        copyBtn.textContent = 'Play'
        copyBtn.onclick = () => {
          console.log("Playing video file "+ record.filename)
          electronAPI.openFileInExplorer(record.path, 'play-video')

        }
        // openBtn.className = "border rounded bg-gray-400 text-[#fff] px-1 border-white"
        // openBtn.style.marginRight = '4px'
        // copyBtn.className = "border rounded px-1 bg-gray-200 border-black"
        actionTd.appendChild(openBtn);
        actionTd.appendChild(copyBtn);


        // idTd.textContent = record.id;
        // idTd.textContent = countId;

        barcodeTd.textContent = record.barcode;
        filenameTd.textContent = record.filename + '.webm';
        filePathTd.textContent = record.path;
        recordDateTd.textContent = record.recording_date;
        sizeTd.textContent = record.size + 'MB'
        packaged_by.textContent = record.username

        //append to tbody
        // row.appendChild(idTd)
        row.appendChild(barcodeTd)
        row.appendChild(filenameTd)
        row.appendChild(filePathTd)
        row.appendChild(recordDateTd)
        row.appendChild(sizeTd)
        row.appendChild(packaged_by)
        row.appendChild(actionTd)
        viewAllDataTableTbody.appendChild(row)
        return;
      }


    }
    else{

      console.log('No search provided loading bulk data....')

   



    viewAllDataTableTbody.replaceChildren('')
    let user_id = getUserInfo().id;
    const record = await electronAPI.getAllDataByUserID(user_id, limit=30);
    console.log("Record Data : ",record)
    // const record = {status: true, data: []}
    if(record.status) {

      if(record.data.length < 1){
        let emptyRow = document.createElement('div')
        let emptyTd = document.createElement('span')
        emptyTd.textContent = 'There is no record to show! (Record Database is empty).'
        emptyRow.style.textAlign = 'center'
        emptyRow.style.display = 'flex'
        // emptyRow.style.position = 'absolute'
        emptyRow.style.marginTop = '10px'
        // emptyRow.style.backgroundColor = 'green'
        emptyRow.style.alignItems = 'center'
        emptyRow.style.justifyContent = 'center'
        emptyRow.appendChild(emptyTd)
        viewAllDataTable.innerHTML = ''
        // recentTable.style.backgroundColor = 'pink'
        viewAllDataTable.appendChild(emptyRow)
      }

      let countId= 1
      record.data.forEach(record => {
        // console.log(record)
        let row = document.createElement('tr')
        // row.className = 'text-[10px]'
        row.className =  'whitespace-nowrap h-[30px] border-b-[1px] border-[#21212155]'
        // row.classList.add('text-[10px whitespace-nowrap border-b-[1px] border-[#21212155] w-full flex justify-between text-left')
        // let idTd = document.createElement('td')
        // idTd.className= "w-[30px]"
        let barcodeTd = document.createElement('td')
        barcodeTd.className = 'px-4 text-sm text-gray-800'
        // barcodeTd.className='text-[10px]'
        let filenameTd = document.createElement('td')
        filenameTd.className = 'px-4 text-sm text-gray-800'
        let filePathTd = document.createElement('td')
        filePathTd.className = 'px-4 text-sm text-gray-800'
        let recordDateTd = document.createElement('td')
        recordDateTd.className = 'px-4 text-sm text-gray-800 whitespace-nowrap'
        let sizeTd = document.createElement('td')
        sizeTd.className = 'px-4 text-sm text-gray-800'
        let packaged_by = document.createElement('td')
        packaged_by.className = 'px-4 text-sm text-gray-800'


        let actionTd = document.createElement('td')
        actionTd.className = 'px-4  text-sm text-gray-800 flex gap-2'
        let openBtn  = document.createElement('button')
        openBtn.className = 'border rounded bg-gray-400 text-[#fff] px-1 border-white'
        let copyBtn = document.createElement('button')
        copyBtn.className = 'border rounded px-1 bg-gray-200 border-black'
        openBtn.textContent = 'Open'
        openBtn.onclick = () => {
          console.log("Openingn file "+ record.filename)
          electronAPI.openFileInExplorer(record.path)
        }
        // copyBtn.textContent = 'Play'
        copyBtn.textContent = 'Play'
        copyBtn.onclick = () => {
          console.log("Playing video file "+ record.filename)
          electronAPI.openFileInExplorer(record.path, 'play-video')

        }
        // openBtn.className = "border rounded bg-gray-400 text-[#fff] px-1 border-white"
        // openBtn.style.marginRight = '4px'
        // copyBtn.className = "border rounded px-1 bg-gray-200 border-black"
        actionTd.appendChild(openBtn);
        actionTd.appendChild(copyBtn);


        // idTd.textContent = record.id;
        // idTd.textContent = countId;

        barcodeTd.textContent = record.barcode;
        filenameTd.textContent = record.filename + '.webm';
        filePathTd.textContent = record.path;
        recordDateTd.textContent = record.recording_date;
        sizeTd.textContent = record.size + 'MB'
        packaged_by.textContent = record.username

        //append to tbody
        // row.appendChild(idTd)
        row.appendChild(barcodeTd)
        row.appendChild(filenameTd)
        row.appendChild(filePathTd)
        row.appendChild(recordDateTd)
        row.appendChild(sizeTd)
        row.appendChild(packaged_by)
        row.appendChild(actionTd)
        viewAllDataTableTbody.appendChild(row)
        // countId++;
          
      })
    }

  }


  }
  catch(err){
    alert("Error: Unable to fetch record from database "+err)
    console.log("Error : ",err)
  }
}







//------------------------------------------------/View All Record Panel---------------------------------------------








//--------------------------------------------------Recorder Scanner-----------------------------------------------------------------------------------------------


const barcodeInput = document.getElementById('barcode-input');
const videoPreview = document.getElementById("video-preview");
const recordStatusSpan = document.getElementById("record-status-span");
const blinkWrapper = document.getElementById("blink-wrapper");
const timer = document.getElementById("timer");
const recordTable = document.getElementById("record-table");
const recordTbody = document.getElementById("record-tbody")
const scannerState = document.getElementById("scanner-state")
const scanInstructLabel = document.getElementById("scan-instruction")
const recentTable = document.getElementById('recent-table')

//tabNavigation
const scanRecordTabBtn = document.getElementById('scan-and-record-btn')
const viewRecordTabBtn = document.getElementById('view-all-record-panel-btn')
const viewAllRecordPanel = document.getElementById('view-all-record-panel')
const recordScanPanel = document.getElementById('record-scan-panel')
// let isLoggedIn = null


;(function(){
  try{

    let userSession = sessionStorage.getItem('auth')
    let parsed = JSON.parse(userSession)
    console.log("checking if logged in : ", parsed?.status)
    if(parsed?.status){
      window.isLoggedIn = true;
    }else {
      window.isLoggedIn = false;
    }
    
  }
  catch(err){
    console.log("Not logged in : ", err)
  }
  
})();

//dataTable


//check if logged in then hide login modal


// function loadDataInDataTable() {
//   console.log("loading data in data table")
//   ;(async ()=> {
//     // let record = await electronAPI.getAllRecordData()
//     // if(record.status) {
//     //   dataTable.rows.add(record.data).draw();

//     //   // record.data.forEach(record=> {
//     //   //   dataTable.row.add(record)
//     //   // })
//     // }

//   })();
// }

// loadDataInDataTable()


//  let data = [
//   {
//       "id": 1,
//       "barcode": "43534534634",
//       "filename": "43534534634_2025-07-26_00-44",
//       "path": "C:\\Users\\raos9\\AppData\\Roaming\\simple-electron-app\\videos\\43534534634_2025-07-26_00-44.webm",
//       "recording_date": "2025-07-26_00-44",
//       "size": "0.94"
//   },
    
//   {
//     "id": 1,
//     "barcode": "43534534634",
//     "filename": "43534534634_2025-07-26_00-44",
//     "path": "C:\\Users\\raos9\\AppData\\Roaming\\simple-electron-app\\videos\\43534534634_2025-07-26_00-44.webm",
//     "recording_date": "2025-07-26_00-44",
//     "size": "0.94"
//   }
// ]



let recorder;
let chunks = [];
let isRecording = false;
let isCameraSupported = null;
let activeBarcode = null;   // barcode for *current* recording
let activeStartTs = null;   // timestamp captured when recording starts
let queuedBarcode = null;   // barcode scanned while recording
isPackagingComplete = null;
const ignoredKeys = [ /* ... your list ... */ ];

// window.addEventListener('hashchange', () => {
//   const hash = window.location.hash.slice(1);
//   if (hash) showPanel(hash);
// });

/* -------- Utilities -------- */

function finalizePackage() {      //--> stop recording, setIsRecording = false, activeBarcode=null, activeStartTs=null, queuedBarcode=null 
  let sureFinal = confirm("Are you sure this is the last product to scan and package?")
  console.log("Confirm :",sureFinal)
  if(sureFinal) {
    // console.log("L")
    // stopRecording()
    stopRecording();
    // alert('Last product scan completed.')
  }
  else{
    console.log("Mistakenly user clicked on last scan button")
  }
}



function getUserInfo(){
  let userSession = sessionStorage.getItem('auth')
  let parsed = JSON.parse(userSession)
  console.log("user session storage : ", parsed)
  let user = {id: parsed.data.id, username: parsed.data.username}
  return user;
}


function switchToRecordScanPanel(){
  recordScanPanel.classList.add('active')
  viewAllRecordPanel.classList.remove('active')

  scanRecordTabBtn.classList.add('active')
  viewRecordTabBtn.classList.remove('active')
  recordScanPanel.style.display = 'flex'
  viewAllRecordPanel.style.display = 'none'

}
function switchToViewAllRecordPanel(){
  
  viewAllRecordPanel.classList.add('active')
  recordScanPanel.classList.remove('active')

  viewRecordTabBtn.classList.add('active')
  scanRecordTabBtn.classList.remove('active')
  recordScanPanel.style.display = 'none'
  viewAllRecordPanel.style.display = 'flex'
  // alert('switch')
  ;(async function(){
    loadDataInViewAllTable()
  })();
}


 //by default Record and Scan Panle is Shown
 switchToRecordScanPanel()
//development
// switchToViewAllRecordPanel()




/* 
<tr class="text-[13px] whitespace-nowrap h-[30px] border-b-[1px] border-[#21212155]">
                            <td class="w-[30px]">1</td>
                            <td>128374823748393487</td>
                            <td>128374823748393487_2025-07-26_00-44.webm</td>
                            <td class="">C:\\Users\\raos9\\AppData\\Roaming\\simple-electron-app\\videos\\128374823748393487_2025-07-26_00-44.webm</td>
                            <td>11.3MB</td>
                            <td>
                                <button class="border rounded bg-gray-400 text-[#fff] px-1 border-white">Open</button>
                                <button class="border rounded px-1 bg-gray-200 border-black">Copy</button>
                            </td>
                        </tr>
*/



async function loadDataInTable() {
  
  try {
    recordTbody.replaceChildren('')
    let user_id = getUserInfo().id;
    const record = await electronAPI.getAllDataByUserID(user_id, limit=3);
    console.log("Record Data : ",record)
    // const record = {status: true, data: []}
    if(record.status) {

      if(record.data.length < 1){
        let emptyRow = document.createElement('div')
        let emptyTd = document.createElement('span')
        emptyTd.textContent = 'There is no record to show! (Record Database is empty).'
        emptyRow.style.textAlign = 'center'
        emptyRow.style.display = 'flex'
        // emptyRow.style.position = 'absolute'
        emptyRow.style.marginTop = '10px'
        // emptyRow.style.backgroundColor = 'green'
        emptyRow.style.alignItems = 'center'
        emptyRow.style.justifyContent = 'center'
        emptyRow.appendChild(emptyTd)
        recentTable.innerHTML = ''
        // recentTable.style.backgroundColor = 'pink'
        recentTable.appendChild(emptyRow)
      }

      let countId= 1
      record.data.forEach(record => {
        // console.log(record)
        let row = document.createElement('tr')
        // row.className = 'text-[10px]'
        row.className =  'whitespace-nowrap h-[30px] border-b-[1px] border-[#21212155]'
        // row.classList.add('text-[10px whitespace-nowrap border-b-[1px] border-[#21212155] w-full flex justify-between text-left')
        // let idTd = document.createElement('td')
        // idTd.className= "w-[30px]"
        let barcodeTd = document.createElement('td')
        barcodeTd.className = 'px-2  py-1 text-sm text-gray-800'
        // barcodeTd.className='text-[10px]'
        let filenameTd = document.createElement('td')
        filenameTd.className = 'px-2  py-1 text-sm text-gray-800'
        let filePathTd = document.createElement('td')
        filePathTd.className = 'px-2  py-1 text-sm text-gray-800'
        let recordDateTd = document.createElement('td')
        recordDateTd.className = 'px-2  py-1 text-sm text-gray-800 whitespace-nowrap'
        let sizeTd = document.createElement('td')
        sizeTd.className = 'px-2  py-1 text-sm text-gray-800'
        let packaged_by = document.createElement('td')
        packaged_by.className = 'px-2  py-1 text-sm text-gray-800'


        let actionTd = document.createElement('td')
        actionTd.className = 'px-2 py-1  text-sm text-gray-800 flex gap-2'
        let openBtn  = document.createElement('button')
        openBtn.className = 'border rounded bg-gray-400 text-[#fff] px-1 border-white'
        let copyBtn = document.createElement('button')
        copyBtn.className = 'border rounded px-1 bg-gray-200 border-black'
        openBtn.textContent = 'Open'
        openBtn.onclick = () => {
          console.log("Openingn file "+ record.filename)
          electronAPI.openFileInExplorer(record.path)
        }
        // copyBtn.textContent = 'Copy'
        copyBtn.textContent = 'Play'
        copyBtn.onclick = () => {
          console.log("Playing video file "+ record.filename)
          electronAPI.openFileInExplorer(record.path, 'play-video')

        }
        // openBtn.className = "border rounded bg-gray-400 text-[#fff] px-1 border-white"
        // openBtn.style.marginRight = '4px'
        // copyBtn.className = "border rounded px-1 bg-gray-200 border-black"
        actionTd.appendChild(openBtn);
        actionTd.appendChild(copyBtn);


        // idTd.textContent = record.id;
        // idTd.textContent = countId;

        barcodeTd.textContent = record.barcode;
        filenameTd.textContent = record.filename + '.webm';
        filePathTd.textContent = record.path;
        recordDateTd.textContent = record.recording_date;
        sizeTd.textContent = record.size + 'MB'
        packaged_by.textContent = record.username

        //append to tbody
        // row.appendChild(idTd)
        row.appendChild(barcodeTd)
        row.appendChild(filenameTd)
        row.appendChild(filePathTd)
        row.appendChild(recordDateTd)
        row.appendChild(sizeTd)
        row.appendChild(packaged_by)
        row.appendChild(actionTd)
        recordTbody.appendChild(row)
        // countId++;
          
      })
    }


  }
  catch(err){
    alert("Error: Unable to fetch record from database "+err)
    console.log("Error : ",err)
  }
}

//first time initialisation




console.log("Storage Change Detected")
if(isLoggedIn){
  console.log('logged in so loading data')
  ;(async function(){
    await loadDataInTable()
  })();
  

}else {
  console.log("Not loggedIn skipping load record data", window.isLoggedIn)
}







// loadDataInTable()
function recordingStatusUI(mode) {
  let interval = 0
  let minutes = '00';
  let seconds = '00';
  let setIntervalObject;
  if(mode === 'show'){
    blinkWrapper.style.display = 'flex'
    
    setIntervalObject = setInterval(()=> {
      interval++;
      // minutes = `0${Math.floor(interval/60)}`
      minutes = `${Math.floor(interval/60).toString().length == 1 ? `0${Math.floor(interval/60)}` : `${Math.floor(interval/60)}`}`
      seconds = `${(interval%60).toString().length == 1 ? `0${interval%60}` : `${interval%60}`}`
      // timer.innerText = `${minutes}:${seconds}_____${interval}----${(interval%60).toString().length}`
      timer.innerText = `${minutes}:${seconds}`
    }, 1000)
    return setIntervalObject

  }
  else if(mode === 'hide'){
    interval = 0
    minutes = '00'
    seconds = '00'
    clearInterval(setIntervalObject)
    blinkWrapper.style.display = 'none'
  }
}


function notify(text="Notification") {
  Toastify({
    text,
    duration: 2000,
    gravity: "top",
    position: "right",
    background: "linear-gradient(to right,#770000,#00991177)"
  }).showToast();
}

function tsString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}`
  // return d.getFullYear()
  //   + String(d.getMonth()+1).padStart(2,'0')
  //   + String(d.getDate()).padStart(2,'0') + "_"
  //   + String(d.getHours()).padStart(2,'0')
  //   + String(d.getMinutes()).padStart(2,'0')
  //   + String(d.getSeconds()).padStart(2,'0');
}

function sanitize(name) {
  return String(name).replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();
}

/* -------- Camera / Recorder Init -------- */
async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  videoPreview.srcObject = stream;
  let intervalObject = null
  recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });

  recorder.onstart = (e) => {
    intervalObject = recordingStatusUI('show')
    isRecording = true;
    chunks = [];
    let lastPkgBtn = document.getElementById("last-pkg-btn")
    lastPkgBtn.classList.remove('cursor-not-allowed')
    lastPkgBtn.disabled = false;
    lastPkgBtn.style.backgroundColor = 'green'
    recordStatusSpan.innerText = `${activeBarcode}`;
    recordStatusSpan.style.color = "#009911";
    console.log("[Recorder] started for", activeBarcode);
  };

  recorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = async () => {
    clearInterval(intervalObject)
    recordingStatusUI('hide')

    isRecording = false;
    recordStatusSpan.innerText = "Stopped";
    recordStatusSpan.style.color = "#991122";
    console.log("[Recorder] stopped. chunks:", chunks.length);

    if (chunks.length > 0 && activeBarcode) {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const arrayBuffer = await blob.arrayBuffer()
      const safe = sanitize(activeBarcode);
      const fname = `${safe}_${activeStartTs}`;
      //table (id, barcode, filename, path, recording_date, size)
      let user_id = getUserInfo().id;
      const videoFile = await window.electronAPI.saveVideoFile(arrayBuffer, fname, barcode=safe, recording_date=activeStartTs, user_id);
      // notify(`Saved: ${fname}.webm`);
      notify(`Saved: ${videoFile?.msg}`);
      
    }

    // clear current session
    activeBarcode = null;
    activeStartTs = null;
    chunks = [];

    // Was another barcode scanned while we were recording? Start that now.
    if (queuedBarcode) {
      const next = queuedBarcode;
      queuedBarcode = null;
      startRecordingForBarcode(next);
    }
    ;(async ()=> {
      await loadDataInTable()
    })();

  };
}

initCamera().then(() =>{ 
  console.log("Camera ready.")
  isCameraSupported = true;
}).catch(err => {
  console.error("Camera init failed:", err);
  notify("Camera failed");
  isCameraSupported = false;
});

/* -------- Recording Control -------- */
function startRecordingForBarcode(barcode) {
  if (!recorder) return;
  activeBarcode = barcode;
  activeStartTs = tsString();
  recorder.start(); // triggers onstart
  notify(`Recording: ${barcode}`);
}

function stopRecording() {
  if (recorder && isRecording) {
    recorder.stop(); // triggers onstop -> save -> maybe queue next
  }
}

function startRecording() {
  recorder.start()
}

/* -------- Barcode Input Handling -------- */
let scanBuffer = "";

function finalizeScan(scan) {
  const trimmed = scan.trim();
  if (!trimmed) return;

  // show in input
  barcodeInput.value = trimmed;
  barcodeInput.style.color = "green";
  barcodeInput.style.fontWeight = "700";

  // main control logic
  if (isRecording) {
    // queue next and stop current
    queuedBarcode = trimmed;
    stopRecording();
  } else {
    startRecordingForBarcode(trimmed);
  }
}



function keyHandler(e) {
  if (e.key === "Enter") {
    console.log("Scanned Buffer : ", scanBuffer)
    if(scanBuffer.trim() === 'END' || 'LAST') {
      stopRecording();
      // setTimeout(()=> console.log("Timeout for the scanner part to stop recording"), 3000)
      // alert('Last product scan completed.')
    }else{
      console.log("A product is scanned continue scanning and recording the packaging")
      finalizeScan(scanBuffer);

    }
    scanBuffer = "";
  } else if (!ignoredKeys.includes(e.key) && e.key.length === 1) {
    scanBuffer += e.key;
  }
}


 barcodeInput.addEventListener('focusin', (e) => {
    // alert("Hwllo")
    console.log("docused")
    scannerState.textContent = 'Activated'
    barcodeInput.classList.add('scanning')
    scannerState.style.color = '#39FF14'
    scanInstructLabel.textContent = " (scan any barcode using your scanner)"

    // barcodeInput.style.borderColor = 'green'
    // barcodeInput.style.borderWidth = '10px'
  })

 barcodeInput.addEventListener('focusout', (e) => {
    // alert("Hwllo")
    console.log("docused")
    scannerState.textContent = 'Deactivated'
    scannerState.style.color = '#ff4f14'
    barcodeInput.classList.remove('scanning')
    scanInstructLabel.textContent = " (click on input box to activate scanner)"
    // barcodeInput.style.borderColor = 'green'
    // barcodeInput.style.borderWidth = '10px'
  })



function handleKeyDownWhenScanRecordPanelActive(e) {

  if(!isCameraSupported) {
    alert("Camera is not working! Please Restart.")
    return;
  }

  let isActive = null;
  if(recordScanPanel.style.display != 'none' && recordScanPanel.classList.contains('active') ){
    // alert("Scan Record Panel Active")
    isActive = true;
  }

  if(isActive) {
    // if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    //   console.log("Ignoring keydown from input field");
    //   console.log("Target element", e.target.id)
    //   return;
    // }
    // keyHandler(e)
    if(e.target.id === 'barcode-input') {
      keyHandler(e)
    }

  }
  else {
    console.log("Currently on View All Record Panel no need to listen on keydown event! ")
    // window.removeEventListener('keydown', handleKeyDownWhenScanRecordPanelActive)
    // window.removeEventListener('keyup' , handleKeyDownWhenScanRecordPanelActive)
    // window.removeEventListener("keypress", handleKeyDownWhenScanRecordPanelActive)

  }
  // const isRecordScanPanelDisplayed = 
  // const isActive = recordScanPanel.classList.contains('active')
}

window.addEventListener("keydown", handleKeyDownWhenScanRecordPanelActive);






//----------------------------------------------------View All Record---------------------------------------------



// var table = new Tabulator("#example-table", {
//     height: 400,
//     width:1280,
//     data: [], // Start with empty data
//     columns: [
//         {title: "ID", field: "id", width: 50},
//         {title: "Barcode", field: "barcode"},
//         {title: "Filename", field: "filename"},
//         {title: "Path", field: "path"},
//         {title: "Date", field: "recording_date"},
//         {title: "Size", field: "size"}
//     ],
//     pagination: true,
//     paginationSize: 10,
//     paginationCounter: "rows",
//     headerFilter: true, // Enable column filtering
// });
// document.getElementById("filter-field").addEventListener("keyup", function(e){
//     table.setFilter("barcode", "like", e.target.value);
// });

// // Add data function
// async function loadDataInTable() {
//     try {
//         const record = await electronAPI.getAllRecordData();
        
//         if (record.status && record.data.length > 0) {
//             // Transform data
//             const transformedData = record.data.map((item, index) => ({
//                 id: index + 1,
//                 barcode: item.barcode,
//                 filename: item.filename + '.webm',
//                 path: item.path,
//                 recording_date: item.recording_date,
//                 size: item.size + 'MB'
//             }));
            
//             // Set data to table
//             table.setData(transformedData);
//         } else {
//             table.setData([]);
//         }
//     } catch (err) {
//         console.log("Error loading data:", err);
//     }
// }
// (async () => {
//     await loadDataInTable()
// })();

// table.data =[{name: 'fwef', pass: 'wdwdwf'}]







//----------------------------------------------------/View All Record---------------------------------------------
