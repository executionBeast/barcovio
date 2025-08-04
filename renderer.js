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

const ignoredKeys = [ /* ... your list ... */ ];

// window.addEventListener('hashchange', () => {
//   const hash = window.location.hash.slice(1);
//   if (hash) showPanel(hash);
// });

/* -------- Utilities -------- */

function switchToRecordScanPanel(){
  recordScanPanel.classList.add('active')
  viewAllRecordPanel.classList.remove('active')

  scanRecordTabBtn.classList.add('active')
  viewRecordTabBtn.classList.remove('active')
  recordScanPanel.style.display = 'flex'
  viewAllRecordPanel.style.display = 'none'
  // alert("hello"+recordScanPanel.style.display)

 
  // alert('control')
 }
 //by default Record and Scan Panle is Shown
 switchToRecordScanPanel()

function switchToViewAllRecordPanel(){

  viewAllRecordPanel.classList.add('active')
  recordScanPanel.classList.remove('active')

  viewRecordTabBtn.classList.add('active')
  scanRecordTabBtn.classList.remove('active')
  recordScanPanel.style.display = 'none'
  viewAllRecordPanel.style.display = 'flex'
  // alert('switch')
}

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
    const record = await electronAPI.getAllRecordData();
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
        row.className = 'text-[13px] whitespace-nowrap h-[30px] border-b-[1px] border-[#21212155]'
        let idTd = document.createElement('td')
        idTd.className= "w-[30px]"
        let barcodeTd = document.createElement('td')
        let filenameTd = document.createElement('td')
        let filePathTd = document.createElement('td')
        let recordDateTd = document.createElement('td')
        let sizeTd = document.createElement('td')

        let actionTd = document.createElement('td')
        let openBtn  = document.createElement('button')
        let copyBtn = document.createElement('button')
        openBtn.textContent = 'Open'
        openBtn.onclick = () => {
          console.log("Openingn file "+ record.filename)
          electronAPI.openFileInExplorer(record.path)
        }
        copyBtn.textContent = 'Copy'
        openBtn.className = "border rounded bg-gray-400 text-[#fff] px-1 border-white"
        openBtn.style.marginRight = '4px'
        copyBtn.className = "border rounded px-1 bg-gray-200 border-black"
        actionTd.appendChild(openBtn);
        actionTd.appendChild(copyBtn);


        // idTd.textContent = record.id;
        idTd.textContent = countId;

        barcodeTd.textContent = record.barcode;
        filenameTd.textContent = record.filename + '.webm';
        filePathTd.textContent = record.path;
        recordDateTd.textContent = record.recording_date;
        sizeTd.textContent = record.size + 'MB'

        //append to tbody
        row.appendChild(idTd)
        row.appendChild(barcodeTd)
        row.appendChild(filenameTd)
        row.appendChild(filePathTd)
        row.appendChild(recordDateTd)
        row.appendChild(sizeTd)
        row.appendChild(actionTd)
        recordTbody.appendChild(row)
        countId++;
          
      })
    }


  }
  catch(err){
    alert("Error: Unable to fetch record from database "+err)
    console.log("Error : ",err)
  }
}

//first time initialisation
;(async ()=> {
  await loadDataInTable()
})();


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

  recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });

  recorder.onstart = (e) => {
    recordingStatusUI('show')
    isRecording = true;
    chunks = [];
    recordStatusSpan.innerText = `Recording: ${activeBarcode}`;
    recordStatusSpan.style.color = "#009911";
    console.log("[Recorder] started for", activeBarcode);
  };

  recorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = async () => {
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
      const videoFile = await window.electronAPI.saveVideoFile(arrayBuffer, fname, barcode=safe, recording_date=activeStartTs);
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
    finalizeScan(scanBuffer);
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




