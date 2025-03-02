
// ----- Defined Constants ----------------------------------------------------
//const SERVER_URL = "https://essubia-backend.onrender.com/api";
const SERVER_URL = "http://localhost:5000/api";

// ----- Global Variables -----------------------------------------------------

// ----- Main Function --------------------------------------------------------
window.addEventListener('load', async function () {
document.getElementById('registerError').innerText = 'On Window Load';
console.log('On Window Load');
    const registerForm = document.getElementById('registerForm');
   
    registerForm.onsubmit = async (pEvent) => {
        pEvent.preventDefault();
        if (registerForm.password.value !== registerForm.confirmPassword.value) {
            document.getElementById('registerError').innerText = "Password and confirmation do not match";
            return false;
        }

        let targetURL = SERVER_URL + '/auth/register';
        const response = await fetch(targetURL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify ({
                username: registerForm.username.value,
                email: registerForm.email.value,
                password: registerForm.password.value,
                invitecode: registerForm.invitecode.value
            })
        });
        const parseResponse = await response.json();

        if (parseResponse.jwtToken) {
            localStorage.setItem('jwtToken', parseResponse.jwtToken);
            window.location.replace('../index.html')
        } else {
            document.getElementById('registerError').innerText = parseResponse.error;
        }

        return false;

    };

});