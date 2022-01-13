console.log(`Client Side JavaScript...`);

// fetch() is a function defined inside the java script
fetch('http://puzzle.mead.io/puzzle').then((response) => {
    response.json().then((returnedData) => {
        console.log(returnedData);
    })
});

// fetch('http://localhost:3000/weather?address=delhi').then((response) => {
//     response.json().then((returnedData) => {
//         if (returnedData.error) {
//             console.log(`Unable to fetch the data for the weather forecast.`);
//         }
//         else {
//             console.log(returnedData);
//         }
//     })
// })

let weatherForm = document.querySelector('form');
let weatherSearchInput = document.querySelector('.inputLocation');
let weatherSearchButton = document.querySelector('.buttonSearch');
let messageVal1 = document.querySelector('#message-1');
let messageVal2 = document.querySelector('#message-2');
let weatherBox = document.querySelector('.displayForecast');

messageVal1.textContent = messageVal2.textContent = '';

weatherForm.addEventListener('submit', function(event) {
    event.preventDefault();

    let location = weatherSearchInput.value;

    if (location === '') {
        // alert("Location Field is Empty! Enter your Location...");
        console.log('empty error');
        messageVal2.textContent = '';
        messageVal1.textContent = `"Location Field is Empty! Enter your Location..."`;
    }
    else {

        // // Can only used for local - hosting
        // fetch(`http://localhost:3000/weather?address=${weatherSearchInput.value}`).then((response) => {
        fetch(`/weather?address=${weatherSearchInput.value}`).then((response) => {    
            response.json().then((returnedData) => {
                if (returnedData.error) {
                    // prompt(`Unable to fetch the data for the weather forecast.`);
                    console.log('error');
                    messageVal2.textContent = '';
                    weatherBox.textContent = '';
                    messageVal1.textContent = `Unable to fetch the data for the weather forecast.`;
                }
                else {
                    messageVal1.textContent = messageVal1.innerHTML = '';
                    let loc = returnedData.LocationSelected;
                    let lat = returnedData.Latitude;
                    let lng = returnedData.Longitude;
                    let inf = returnedData.ForecastReport;

                    if (loc === undefined) {
                        messageVal2.textContent = '';
                        weatherBox.textContent = '';
                        weatherBox.innerHTML = '';
                        messageVal1.textContent = `Unable to fetch the data for the Location Provided.`;
                    }
                    else {
                        weatherBox.innerHTML = `
                            <b>Location    : </b> ${loc}
                            <b>Latitude    : </b> ${lat} 
                            <b>Longitude   : </b> ${lng}
                            <b>Information : </b> ${inf} 
                        `;
                        console.log(returnedData);
                        weatherSearchInput.value = '';
                    }
                    
                }
            })
        })
    }

})