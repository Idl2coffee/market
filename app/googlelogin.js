import {GoogleAuthProvider, signInWithPopup} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js"
import { auth } from './firebase.js'
import { showMessage } from './ShowMessage.js'

const googleButton = document.getElementById('googlelogin')

googleButton.addEventListener('click', async (e) => {
    e.preventDefault()
    const provider = new GoogleAuthProvider()
    try {
        const credentials = await signInWithPopup(auth, provider)
        console.log(credentials)
        console.log("Google sign in successful");


        window.location.href = 'conexion.html'


        const modalInstance = bootstrap.Modal.getInstance(googleButton.closest('.modal'));
        modalInstance.hide()

        showMessage("Welcome " + credentials.user.displayName, "success")

    } catch (error) {
        console.log(error)

    }
})