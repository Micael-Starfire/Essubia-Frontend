
// ----- Defined Constants ----------------------------------------------------

//const SERVER_URL = "https://essubia-backend.onrender.com/api";
const SERVER_URL = "http://localhost:5000/api";

// ----- HTML Elements --------------------------------------------------------
const loginBox = document.getElementById('loginBox');
const loginForm = document.getElementById('loginForm');
const welcomeBox = document.getElementById('welcomeBox');

// ----- Global Variables -----------------------------------------------------


// ----- Main Function --------------------------------------------------------
window.addEventListener('load', async function () {
    // Try to get user details from the server
    if (localStorage.jwtToken) {
        let userURL = SERVER_URL + '/user/profile';
        const res = await fetch( userURL, {
            method: 'GET',
            headers: {jwtToken: localStorage.jwtToken }
        });
        const parseRes = await res.json();
        
        if (parseRes.user_name) {
            welcomeBox.children[1].innerText += `Welcome back ${parseRes.user_name} 
                                     from ${parseRes.user_email}`;
            sessionStorage.setItem('username', parseRes.user_name);

            loginBox.style.display = 'none';
            welcomeBox.style.display = 'block'
        } else {
            loginBox.style.display = 'block';
            welcomeBox.style.display = 'none';
        }
    } else {
        loginBox.style.display = 'block';
        welcomeBox.style.display = 'none';
    }

    // Get news feed
    //-------------------------------------------------------------------------
    // TODO: Add News Feed
    //-------------------------------------------------------------------------

    // Add the Advance turn event listener
    document.getElementById('advanceTurn').addEventListener( 'click', async (pEvent) => {
        let targetURL = SERVER_URL + '/turn';
        await fetch( targetURL, {
            method: 'POST',
            headers: {
                'Content-Length': '0'
            }
        });
    });

    // Add the logout event listener
    document.getElementById('logout').addEventListener('click', async (pEvent) => {
        localStorage.removeItem('jwtToken');
        sessionStorage.removeItem('username');
        location.reload();
    })

    // Add the reset map event listener
    document.getElementById('resetMap').addEventListener( 'click', async (pEvent) => {
        let targetURL = SERVER_URL + '/reset';
        await fetch( targetURL, {
            method: 'POST',
            headers: {
                'Content-Length': '0'
            }
        });
    });

    // Add the login event listener
    loginForm.onsubmit = async (pEvent) => {
        pEvent.preventDefault();
        let targetURL = SERVER_URL + '/auth/login';
        const loginForm = document.getElementById('loginForm');
        const response = await fetch( targetURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: loginForm.login.value,
                password: loginForm.password.value
            })
        });

        const parseResponse = await response.json();
console.log(parseResponse);

        if (parseResponse.jwtToken) {
            localStorage.setItem('jwtToken', parseResponse.jwtToken);
            location.reload();
        } else {
            // Display error message
            document.getElementById('loginError').innerText = parseResponse.error;
        }
    };

});

