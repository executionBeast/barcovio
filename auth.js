// window.isLoggedIn = null;


// function navigateToSignup() {
//     let loginForm = document.getElementById('login-form')
//     let signupForm = document.getElementById('signup-form')

//     loginForm.style.display = "none"
//     signupForm.style.display = "flex"
//     console.log("navigate to signup") 
// }

// function navigateToLogin() {
//     let loginForm = document.getElementById('login-form')
//     let signupForm = document.getElementById('signup-form')

//     loginForm.style.display = "flex"
//     signupForm.style.display = "none"
//     console.log("navigate to signup")
// }

// function showPassword(elID){
//     console.log("Input Clicked : ",elID)
//     let pass = document.getElementById(elID)
//     pass.type = "text"
// }
// function hidePassword(elID){
//     let pass = document.getElementById(elID)
//     pass.type = "password"
// }

// function showLoginWarning(text){
//     const loginWarningSpan = document.getElementById('loginWarning')
//     loginWarningSpan.textContent = text

// }
// function showSignupWarning(text){
//     const signupWarningSpan = document.getElementById('signupWarning')
//     signupWarningSpan.textContent = text
//     return setTimeout(()=> signupWarningSpan.text = '', 2000)

// }

// function setSessionStorage(key, value) {
//     let val = JSON.stringify(value)
//     window.sessionStorage.setItem(key, val)
// }

// function getSessionStorage(key){
//     let value = window.sessionStorage.getItem(key)
//     let jsonParsed = JSON.parse(value)
//     return jsonParsed;
// }

// function hideLoginModal(){
//     const loginModal = document.getElementById("login-modal")
//     loginModal.style.display = 'none'
// }

// function loadLoggedInStateInUI(){
//     const userSpan = document.getElementById('userSpan')
//     console.log('Checking if logged in then hide login modal')
//     let auth = getSessionStorage('auth')
//     if(auth) hideLoginModal();
//     userSpan.textContent = auth?.data?.username

// }

// loadLoggedInStateInUI();



// async function handleLogin() {
//     const userNameInput = document.getElementById('loginUsername')
//     const loginPasswordInput = document.getElementById('loginPassword')
//     try {
//         let payload = {
//             username : userNameInput.value,
//             password : loginPasswordInput.value
//         }
//         let loginRes = await window.electronAPI.login(payload.username, payload.password)
//         console.log("Login Payload : ", payload)
//         console.log("Login Response : ", loginRes)
//         if(loginRes.status){
//             setSessionStorage('auth', loginRes)
//             notify(loginRes.msg)
//             // loginModal.style.display = 'none'
//             // hideLoginModal()
//             loadLoggedInStateInUI()
//             window.isLoggedIn = true;
//         }
//         else{
//             notify(loginRes.msg)
//             showLoginWarning(loginRes.msg)
//             window.isLoggedIn = false;

//         }
//     }
//     catch(err) {
//         console.log('Error Signup : ', err)
//         notify('Error occured while logging in!')
//     }
    
// }

// async function handleSignup() {
//     const userNameInput = document.getElementById('signupUsername')
//     const signupPasswordInput = document.getElementById('signupPassword')
//     const secretPasswordInput = document.getElementById('secretPassword')
//     const signupBtn = document.getElementById('signupBtn')
//     try {
//         let payload = {
//             username : userNameInput.value, 
//             password : signupPasswordInput.value,
//             secret : secretPasswordInput.value
//         }
//         console.log('Signup Payload : ', payload )
//         let singupRes = await  window.electronAPI.signup(payload.username, payload.password, payload.secret)
//         console.log("Singup Res : ", singupRes)
//         if(singupRes.status){
//             notify(singupRes.msg)
//             navigateToLogin()
//         }
//         else {
//             console.log("Wrong Secret", singupRes)
//             showSignupWarning(singupRes.msg)
//             notify(singupRes.msg)
//         }

//     }
//     catch (err) {
//         console.log('Error Signup : ', err)
//         notify('Some error occured kindly restart the application')
//     }

// }