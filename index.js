
// ----- Defined Constants ----------------------------------------------------

const SERVER_URL = "https://essubia-backend.onrender.com/api";
//const SERVER_URL = "http://localhost:3000/api";

// ----- Global Variables -----------------------------------------------------


// ----- Main Function --------------------------------------------------------
window.addEventListener('load', async function () {
    document.getElementById('advanceTurn').addEventListener( 'click', async (pEvent) => {
        let targetURL = SERVER_URL + '/turn';
        await fetch( targetURL, {
            method: 'POST',
            headers: {
                'Content-Length': '0'
            }
        });
    });

    document.getElementById('resetMap').addEventListener( 'click', async (pEvent) => {
        let targetURL = SERVER_URL + '/reset';
        await fetch( targetURL, {
            method: 'POST',
            headers: {
                'Content-Length': '0'
            }
        });
    });

});

