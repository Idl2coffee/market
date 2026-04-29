import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js"
import { auth } from './firebase.js'
import { showMessage } from './ShowMessage.js'

const signupForm = document.querySelector('#signup-form')

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.querySelector('#signup-email').value
    const password = document.querySelector('#signup-password').value

    try {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password)
        console.log(userCredentials)

        window.location.href = 'conexion.html'
        
        
        const signupModal = document.querySelector('#signupModal')
        const modal = bootstrap.Modal.getInstance(signupModal)
        modal.hide()

        showMessage ("Welcome " + userCredentials.user.email, "success")

    } catch (error) {
        console.log(error.message)
        console.log(error.code)

        if (error.code === 'auth/email-already-in-use') {
            showMessage("Email already in use", "error")
        }    else if (error.code === 'auth/invalid-email') {
            showMessage("Invalid Email", "error")
        } else if (error.code === 'auth/weak-password') {
            showMessage("Password is too weak", "error")
        } else if (error.code) {
            showMessage("Something went wrong", "error")
        }
    }
})

