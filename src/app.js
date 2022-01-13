// Handlebars/hbs : It allows us to render dynamic documents(i.e, things inside the webpage will be changed when page is refreshed) as compared to the ones which don't change even if the page is refreshed

console.log(`Welcome To app.js`);

let herokuPortValue = process.env.PORT || 3000;

let corePath = require('path'); // No need to install as it's a core node module
let theExpress = require('express');
let theRequest = require('request');
let theHBS = require('hbs');
const { response } = require('express');
const { request } = require('http');

let geocodeCalling = require('./utils/geocode');
let forecastWeather = require('./utils/forecastWeather');

let appData = theExpress();

// Printing the locations of all possible required directories that we'll going to need:
console.log(__dirname); // Gives the current location of the file directory
console.log(__filename); // Gives the name of the file location
console.log(corePath.join(__dirname, '../public'));

// Defining the Paths for the Express Configuration:
let pathToPublicFld = corePath.join(__dirname, '../public');
let dbsFilesPath = corePath.join(__dirname, '../dbsFiles/views');
let partialsPath = corePath.join(__dirname, '../dbsFiles/partials');

// Setting up the Handlebars engine and chaning the default directory of the 'views' which stores the dbs files
appData.set('view engine', 'hbs');
appData.set('views', dbsFilesPath); // changing the default path of 'views' directory to 'templates' directory

theHBS.registerPartials(partialsPath); // takes a path to the directory where our partials file are present
// .set -> It allows to set value for a given express setting. It has 2 options: 1st is key(the setting name) & the 2nd is the value to be set.    'view engine' will always be in the same & the 2nd option is the npm module that we installed

// .use -> it is used to customize the server
// static -> It takes the path to the folder that we want to serve up
// ALl the links that are made inside the main index file to link the css and js file should be link from the original path.

// Setting up the static directory to serve
appData.use(theExpress.static(pathToPublicFld));
// By default, node expects the dbs files to be inside a directory named 'views' which should be just inside the main directory but if we don't want that to happen, we have to setup the path of the new directory by ourselves

// // Function call to use the html file for the 'main' page of the webpage
// appData.get('', (request, response) => {
//     response.send(`Hello Express!`);
// })
// Using the 'render' method to setup the .hbs file that converts the content into html tyoe
appData.get('', (request, response) => {
    let changeableObj = {
        title: 'WorkOut & Fitness',
        name: 'Rahul Singh',
    }
    // response.render('index'); // or
    response.render('index', changeableObj);
})

// // Function call to use the html file for the 'help' page of the webpage
// appData.get('/help', (request, response) => {
//     response.send(`Inside the 'Help' Page.`);
// })
appData.get('/help', (request, response) => {
    let helpChanges = {
        title: `Help`,
        message1: `rendering function call in the {Help} Web-Page...`,
        creator: 'Rahul Singh',
        info: 'You would be able to find the answers to all your queries.',
    }
    response.render('help', helpChanges);
})

// // Function call to use the html file for the 'about' page of the webpage
// appData.get('/about', (request, response) => {
//     response.send(`<h1>About the Content:</h1>`);
// })
appData.get('/about', (request, response) => {
    let aboutChanges = {
        title: `About`,
        message1: `rendering function call in the {About} Web-Page...`,
        creator: 'Rahul Singh',
        info: 'This section briefs about the things that we are known for.'
    }
    response.render('about', aboutChanges);
})

appData.get('/showWeather', (request, response) => {
    response.render('showWeather');
})

appData.get('/weather', (request, response) => {
    if (!request.query.address) {
        return response.send({
            error: 'No Address field provided!',
        })
    }
    else if (request.query.address === '') {
        return response.send({
            error: 'You must provide an address to find the weather forecast.'
        })
    }  

    let userAddress = request.query.address;

    geocodeCalling(userAddress, (error, {placelatitude, placelongitude, placelocation} = {}) => {
        if (error) {
            return response.send({
                Error: `Error Occoured while fetching the details for your Entered Coordinates...`,
            });
        }

        console.log(`\nLocation: ${placelocation}`);
        console.log(`Latitude : ${placelatitude}`);
        console.log(`Longitude : ${placelongitude}\n`);

        forecastWeather(placelatitude, placelongitude, placelocation, (error, forecastData) => {
            if (error) {
                return response.send({
                    Error: `Error Occoured while fetching the details for the Weather...`,
                })
            }

            console.log('Data Received : ', forecastData);

            response.send({
                AddressProvided: request.query.address,
                LocationSelected: placelocation,
                Latitude: placelatitude,
                Longitude: placelongitude,

                ForecastReport: forecastData,
            })
        })
    })

    // let weatherDetails = {
    //     forecast: 'Sunny',
    //     location: request.query.address,
    //     creator: 'Rahul Singh',
    // };
    // response.send(weatherDetails);
})

appData.get('/products', (request, response) => {
    if (request.query.search === '') {
        return response.send({
            error: 'You must provide a search value!',
        })
    }
    console.log(request.query);
    response.send({
        products: [],
    })
})

appData.get('/help/*', (request, response) => {
    let errObj = {
        title: 'Help Section URL DOES NOT EXISTS.',
        message1: 'Unable to load the Help Section URL asked for',
        creator: 'Help Section ERROR',
        info: 'Check the entered URL and try again...',
    };
    response.render('404ErrorPage', errObj);
})

// Creating a Default page not found(i.e, 404 page) and calling it from this command if something gets wrong.
// '*' character consists of all the anything that has not been matched so far.
// This function has to come last as it'll check from the top if the entered field exits & it doesn't, then this page will be showed up
appData.get('*', (request, response) => {
    let errObj = {
        title: 'Url DOES NOT EXISTS.',
        message1: 'Unable to load the URL asked for',
        creator: 'ERROR',
        info: 'Check the entered URL and try again...',
    };
    response.render('404ErrorPage', errObj);
})

// // Running on our local server without heroku providing the port value
// appData.listen(3000, () => {
//     console.log(`Server has been setup on port 30000 and it's up and running.`);
// });


appData.listen(herokuPortValue, () => {
    console.log(`Server is up and is running on ${herokuPortValue}.`);
});