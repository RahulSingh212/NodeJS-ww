'use strict';
console.log('Welcome to the Bankist App...');

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const okFormButton = document.querySelector('.form__btn');

// Classes

class WorkOutData {
    date = new Date();
    idUnq = (Date.now() + '').slice(-10);
    clicksUser = 0;

    constructor(coordinates, distance, duration) {
        this.coordinates = coordinates;
        this.distance = distance; // in km
        this.duration = duration; // in min
    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.typeWorkout[0].toUpperCase()}${this.typeWorkout.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }

    UserClicking() {
        this.clicksUser++;
    }
}

class RunningData extends WorkOutData {
    typeWorkout = 'running';

    constructor(coordinates, distance, duration, cadence) {
        super(coordinates, distance, duration);
        this.cadence = cadence;

        this.calculatePace();
        this._setDescription();
    }

    calculatePace() {
        this.paceValue = this.duration / this.distance;
        return this.pace;
    }
}

class CyclingData extends WorkOutData {
    typeWorkout = 'cycling';

    constructor(coordinates, distance, duration, elevationGain) {
        super(coordinates, distance, duration);
        this.elevationGain = elevationGain;

        this.calculateSpeed();
        this._setDescription();
    }

    calculateSpeed() {
        this.speedValue = this.distance / (this.duration / 60);
        return this.speedValue;
    }
}

// let run1 = new RunningData([12, -57], 9.8, 32, 125);
// let cycle1 = new CyclingData([42, -15], 12.4, 52, 225);
// console.log(run1);
// console.log(cycle1);

///////////////////////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
class AppWorkOut {
    #map;
    #mapEvent;
    #mapZoomLevel = 13;
    #workoutsList = [];

    constructor() {
        // Getting the User's Position
        this._getPosition();
        
        // Getting the Data from the Local Storage
        this._getLocalStorageData();

        // Attaching the Event Handlers
        form.addEventListener('submit', this._newWorkOut.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);

        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    }

    _getPosition() {
        // First function is for successful findings of the coordinates & Second function is for unsuccessful findings of the coordinates
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition (
                this._loadMap.bind(this), // For Successful fetching of the coordinates
                function() { // Unsuccessful fetching of the coordinates
                    alert('Unable to Fetch your coordinates.');
                }
            );
        };
    }

    _loadMap(currPosition) {
        let latitude = currPosition.coords.latitude;
        let longitude = currPosition.coords.longitude;
        // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

        let coordsMap = [latitude, longitude];

        this.#map = L.map('map').setView(coordsMap, this.#mapZoomLevel); // L is a name space here

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // Handling clicks on map
        this.#map.on('click', this._showForm.bind(this));
        
        this.#workoutsList.forEach(workSetter => {
            this._renderWorkOutMarker(workSetter);
        })
    }

    _showForm(mapEvt) {
        this.#mapEvent = mapEvt;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm(formEvent) {
        // Emptying the form fields
        inputDistance.value = '';
        inputDuration.value = '';
        inputCadence.value = '';
        inputElevation.value = '';

        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1010);
    }

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkOut(formEvent) {
        let validInputs = (...inputs) => inputs.every(ipt => Number.isFinite(ipt));


        formEvent.preventDefault();
        
        // Get the Data from the Form
        let typeValue = inputType.value;
        let distanceValue = +inputDistance.value; // + converts the value into number
        let durationValue = +inputDuration.value;
        let {lat, lng} = this.#mapEvent.latlng;
        let cadenceValue;
        let elevationValue;
        let workoutActivity;

        // If the Workout is Running, create a running object
        if (typeValue === 'running') {
            cadenceValue = +inputCadence.value;

            // Checking if the cadenceValue is valid or not
            if (!Number.isFinite(distanceValue) || !Number.isFinite(durationValue) || !Number.isFinite(cadenceValue)) {
                if (!Number.isFinite(distanceValue)) {
                    inputDistance.value = '';
                    return alert('The Distance travelled have to be Numbers!');
                }
                if (!Number.isFinite(durationValue)) {
                    inputDuration.value = '';
                    return alert('The Duration of WorkOut have to be Numbers!');
                }
                if (!Number.isFinite(cadenceValue)) {
                    inputCadence.value = '';
                    return alert('The Cadence Value have to be Numbers!');
                }
            }
            else if (Number(distanceValue) < 0 || Number(durationValue) < 0) {
                if (Number(distanceValue) < 0) {
                    inputDistance.value = '';
                    return alert('The Distance travelled should be Positive Numbers!');
                }
                if (Number(durationValue) < 0) {
                    inputDuration.value = '';
                    return alert('The Duration of WorkOut should be Positive Numbers!');
                }
                if (Number(cadenceValue) < 0) {
                    inputCadence.value = '';
                    return alert('The Cadence Value should be Positive Numbers!');
                }
            }

            workoutActivity = new RunningData([lat, lng], distanceValue, durationValue, cadenceValue);
        }

        // If the Workout is Cycling, create a running object
        if (typeValue === 'cycling') {
            elevationValue = +inputElevation.value;

            // Checking if the elevationValue is valid or not
            if (!Number.isFinite(distanceValue) || !Number.isFinite(durationValue) || !Number.isFinite(elevationValue)) {
                if (!Number.isFinite(distanceValue)) {
                    inputDistance.value = '';
                    return alert('The Distance travelled have to be Numbers!');
                }
                if (!Number.isFinite(durationValue)) {
                    inputDuration.value = '';
                    return alert('The Duration of WorkOut have to be Numbers!');
                }
                if (!Number.isFinite(elevationValue)) {
                    inputElevation.value = '';
                    return alert('The Elevation Value have to be Numbers!');
                }
            }
            else if (Number(distanceValue) < 0 || Number(durationValue) < 0) {
                if (Number(distanceValue) < 0) {
                    inputDistance.value = '';
                    return alert('The Distance travelled should be Positive Numbers!');
                }
                if (Number(durationValue) < 0) {
                    inputDuration.value = '';
                    return alert('The Duration of WorkOut should be Positive Numbers!');
                }
            }

            workoutActivity = new CyclingData([lat, lng], distanceValue, durationValue, elevationValue);
        }

        // Add a new Object to the WorkOut Array
        this.#workoutsList.push(workoutActivity);
        this._renderWorkOutMarker(workoutActivity);

        // Render the WorkOut on the List
        this._renderWorkOut(workoutActivity);

        // Hide the Form + clear the input Fields
        this._hideForm();

        // Set local Storage to all Workouts
        this._setLocalStorage();
    }

    _renderWorkOutMarker(workoutActivity) {
        L.marker(workoutActivity.coordinates)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workoutActivity.typeWorkout}-popup`,
            })
        )
        .setPopupContent(`${workoutActivity.typeWorkout === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workoutActivity.description}`)
        .openPopup();
    }

    _renderWorkOut(workoutActivity) {
        let htmlViewPart = `
            <li class="workout workout--${workoutActivity.typeWorkout}" data-id = "${workoutActivity.idUnq}">
                <h2 class="workout__title">${workoutActivity.description}</h2>
                <div class="workout__details">
                    <span class="workout__icon">${workoutActivity.typeWorkout === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                    <span class="workout__value">${workoutActivity.distance}</span>
                    <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⏱</span>
                    <span class="workout__value">${workoutActivity.duration}</span>
                    <span class="workout__unit">min</span>
                </div>
        `;

        if (workoutActivity.typeWorkout === 'running') {
            let pv, cd;
            if (workoutActivity.paceValue !== null && workoutActivity.paceValue !== undefined) {
                pv = workoutActivity.paceValue.toFixed(1);
            } 
            else {
                pv = workoutActivity.paceValue;
            }
            htmlViewPart += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${pv}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workoutActivity.cadence}</span>
                    <span class="workout__unit">spm</span>
                </div>
            </li>
            `;
        }

        if (workoutActivity.typeWorkout === 'cycling') {
            htmlViewPart += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workoutActivity.speedValue.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workoutActivity.elevationGain}</span>
                    <span class="workout__unit">m</span>
                </div>
            </li>
            `;
        }
            
        form.insertAdjacentHTML('afterend', htmlViewPart);
    }

    _moveToPopup(pageEvent) {
        let workOutEle = pageEvent.target.closest('.workout');

        if (!workOutEle) return;

        let workoutLocator = this.#workoutsList.find(wrk => wrk.idUnq === workOutEle.dataset.id);

        this.#map.setView(workoutLocator.coordinates, this.#mapZoomLevel+1.2, {
            animate: true,
            pan: {
                duration: 1,
            },
        });

        // // Using the Public Interface
        // workoutLocator.UserClicking();
    }

    _setLocalStorage() {
        // JSON.stringify() => it converts any object into string
        localStorage.setItem('WorkoutsData', JSON.stringify(this.#workoutsList));
    }

    _getLocalStorageData() {
        // JSON.parse() => it converts the strings into the objects
        let availableData = JSON.parse(localStorage.getItem('WorkoutsData'));

        if (!availableData) return;

        this.#workoutsList = availableData;
        this.#workoutsList.forEach(workSetter => {
            this._renderWorkOut(workSetter);
        })
    }

    resetLocalStorage() {
        localStorage.removeItem('WorkoutsData');
        location.reload();
    }
}

let appObj = new AppWorkOut();
// appObj.resetLocalStorage();