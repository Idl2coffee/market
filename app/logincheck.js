const loggedOutLinks = document.querySelectorAll('.logged-out')
const loggedInLinks = document.querySelectorAll('.logged-in')

console.log(loggedInLinks)
console.log(loggedOutLinks)

export const logincheck = user => {
    if (user) {
     loggedInLinks.forEach(link => link.style.display = 'block')   
        loggedOutLinks.forEach(link => link.style.display = 'none')
       

    } else {
        loggedInLinks.forEach(link => link.style.display = 'none')
        loggedOutLinks.forEach(link => link.style.display = 'block')

    }  
}