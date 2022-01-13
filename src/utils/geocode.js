let theRequest = require('request');

// encodeURIComponent : This function convert special characters like (? -> %3F) which prevents to throw error if some place is seleted which contains such special characters.
let geocodeCalling = (address, userCallBack) => {
    let addStringVal = encodeURIComponent(address); // This function returns a string thats going to get placed in URL.
    let urlValue = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + addStringVal + '.json?access_token=pk.eyJ1IjoicmFodWxzaW5naHJzMjAiLCJhIjoiY2t5NmN3MnYzMHV1YzJxbzRpanU5Mm1mbSJ9.T1CJaypqf026PjQnizOx1Q';

    theRequest({ url: urlValue, json: true}, (error, response) => {
        let errorMsg;
        if (error) {
            errorMsg = 'Error occoured while connecting to the geocoding API!';
            userCallBack(errorMsg, undefined);
        }
        else if (response.body.features.length === 0) {
            errorMsg = 'Unable to find your entered Location... Try another search!'
            userCallBack(errorMsg, undefined);
        }
        else {
            userCallBack(undefined, {
                placelatitude: response.body.features[0].center[1],
                placelongitude: response.body.features[0].center[0],
                placelocation: response.body.features[0].place_name,
            })
        }
    })
}

module.exports = geocodeCalling;