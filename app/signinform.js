import {signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js"
import { auth } from './firebase.js'
import { showMessage } from './ShowMessage.js'

const signinform = document.querySelector('#login-form');

signinform.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = signinform['login-email'].value
    const password = signinform['login-password'].value

    
    try {
        const credentials  = await signInWithEmailAndPassword(auth, email, password)
    console.log(credentials)


        window.location.href = 'conexion.html'


        const modal = bootstrap.Modal.getInstance(document.querySelector('#signinModal'))
        modal.hide()

        showMessage("Welcome " + credentials.user.email, "success")

    } catch (error) {
        if (error.code === 'auth/wrong-password') {
            showMessage("Wrong password", "error")
        } else if (error.code === 'auth/user-not-found') {
            showMessage("User not found", "error")

        } else if (error.code === 'auth/invalid-email') {
            showMessage("Invalid email", "error")
        } else if (error.code) {
            showMessage("Something went wrong", "error")
        }

    }})
    