import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js"
import { auth } from './app/firebase.js'
import {logincheck} from './app/logincheck.js'
import './app/signinform.js'


import './app/signupForm.js'
import './app/logout.js'
import './app/googlelogin.js'


onAuthStateChanged(auth, async (user) => {
logincheck(user)
//    if (user) {

//    } else {
//        loginCheck(user)
//    }

})