let theRequest = require('request');

// Goal: Create a reusable function for getting the forecast
//
// 1. Setup the "forecast" function in utils/forecast.js
// 2. Require the function in app.js and call it as shown below
// 3. The forecast function should have three potential calls to callback:
//    - Low level error, pass string for error
//    - Coordinate error, pass string for error
//    - Success, pass forecast string for data (same format as from before)

let forecastWeather = (placeLatitude, placeLongitude, placelocation, userCallBack) => {
    let addStringVal = encodeURIComponent(placelocation); // This function returns a string thats going to get placed in URL.
    // let urlValue = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/india%2C%20delhi?unitGroup=metric&key=CDV7ZY3YPGQPUBLKGVS8TB5PA&contentType=json';
    let urlValue = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${addStringVal}?unitGroup=metric&key=CDV7ZY3YPGQPUBLKGVS8TB5PA&contentType=json`;

    theRequest({ url: urlValue, json: true}, (error, response) => {
        let errorMsg;
        if (error) {
            errorMsg = `Unable to connect to the local web service!`;
            userCallBack(errorMsg, undefined);
        }
        else if (response.body.error) {
            errorMsg = `Uable to find the location of the name provided!`;
            userCallBack(errorMsg, undefined);
        }
        else {
            let placeName = response.body.address;
            let outsideTemp = response.body.currentConditions.temp;
            let outsideCloudCover = response.body.currentConditions.cloudcover;
            userCallBack(undefined, `The Temperature in ${placeName} is currently ${outsideTemp} degrees. The cloud cover of the region is ${outsideCloudCover}.`)
        }
    })
}


module.exports = forecastWeather;