import {
    createMap,
    getUserLocation,
    checkMouseClickCoordinates,
    createPin,
    setNewMarkerLocation,
    createPopup
} from './leafletModule.js';

import {
    getRouteList,
    getActualLineList,
    getVehicleList,
    getLineVehicles,
    getLineList
} from './ztmAPI.js';

export class ApiData {
    constructor(refreshDataTime = 20) {
        this.updateTime = '';
        this.vehicleList = [];
        this.routeList = [];
        this.linesList = [];
        this.lineVehicles = [];
        this.refreshDataTime = refreshDataTime;
    }
}

export class MapObj {
    constructor(refreshBtn, trackTargetBtn, showAllvehiclesBtn, lineSelectInpt, vehicleSelectInpt, vehiclesAmountSpn, updateTimeSpn, trackedVehicleSpeedSpn, trackedVehicleCodeSpn, trackedVehicleRouteSpn, gpsSignalSpn, timeToRefreshSpn, apiData) {
        this.map = createMap(undefined, 12);
        this.trackedLine = -1;
        this.trackedVehicle = {};
        this.allVehicles = [];
        this.showAllVehicles = false;
        this.trackTargetOnMap = false;
        this.markerIcons = {
            busIcon: L.icon({
                iconUrl: '../img/busIcon.png',
                iconSize: [64, 64],
                iconAnchor: [32, 62],
                popupAnchor: [0, -64]
            }),
            userIcon: L.icon({
                iconUrl: '../img/userIcon.png',
                iconSize: [64, 64],
                iconAnchor: [32, 64],
                popupAnchor: [0, -64]
            }),
            busAll: L.icon({
                iconUrl: '../img/busAll.png',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            }),
        };
        this.buttons = {
            refreshBtn: refreshBtn,
            trackTargetBtn: trackTargetBtn,
            showAllvehiclesBtn: showAllvehiclesBtn,
        };
        this.selectInput = {
            lineSelect: lineSelectInpt,
            vehicleSelect: vehicleSelectInpt,
        };
        this.inputToFill = {
            vehiclesAmount: vehiclesAmountSpn,
            updateTime: updateTimeSpn,
            trackedVehicleSpeed: trackedVehicleSpeedSpn,
            trackedVehicleCode: trackedVehicleCodeSpn,
            trackedVehicleRoute: trackedVehicleRouteSpn,
            gpsSignal: gpsSignalSpn,
            timeToRefresh: timeToRefreshSpn,
        }
        this.apiData = apiData;
        this.secondsToRefresh = this.apiData.refreshDataTime;
        this.timerInterval = setInterval(() => {
            this.inputToFill.timeToRefresh.textContent = --this.secondsToRefresh;
        }, 1000);

        this.addButtonEvents();
    }

    addButtonEvents() {
        this.buttons.showAllvehiclesBtn.addEventListener('change', () => this.toggleAllVehiclesVisibility(this.buttons.showAllvehiclesBtn));
        this.buttons.trackTargetBtn.addEventListener('change', () => this.toggleTrackTarget(this.buttons.trackTargetBtn));
        this.buttons.refreshBtn.addEventListener('click', this.refreshAll.bind(this));
        this.selectInput.lineSelect.addEventListener('change', () => this.lineChange(this.selectInput.lineSelect.value));
        this.selectInput.vehicleSelect.addEventListener('change', e => this.vehicleChange(this.selectInput.vehicleSelect.value));
    }

    fillSelects() {
        let out = '';
        this.apiData.linesList.forEach(line => out += `<option value="${line.lineName}">${line.lineName}</option>`);
        this.selectInput.lineSelect.innerHTML = out;
        this.selectInput.lineSelect.value = this.trackedLine;

        out = '';
        this.apiData.lineVehicles.forEach(vehicle => out += `<option value="${vehicle}">${vehicle}</option>`);
        this.selectInput.vehicleSelect.innerHTML = out;
        this.selectInput.vehicleSelect.value = this.trackedVehicle.VehicleCode;
    }

    fillInputs() {
        this.inputToFill.vehiclesAmount.textContent = this.apiData.vehiclesList.length;
        this.inputToFill.updateTime.textContent = this.apiData.updateTime;
        this.inputToFill.trackedVehicleSpeed.textContent = `${this.trackedVehicle.Speed} km/h `;
        this.inputToFill.trackedVehicleCode.textContent = this.trackedVehicle.VehicleCode;
        this.inputToFill.trackedVehicleRoute.textContent = this.trackedVehicle.routeName;
        this.inputToFill.gpsSignal.textContent = this.trackedVehicle.GPSQuality;
    }

    toggleAllVehiclesVisibility(checkbox) {
        this.showAllVehicles = checkbox.checked;
        if (checkbox.checked) {
            this.removeAllvehiclesMarkers();
            this.showAllVehiclesMarkers();
        } else
            this.removeAllvehiclesMarkers();
    }

    showAllVehiclesMarkers() {
        this.apiData.vehiclesList.forEach(el => {
            if (el.VehicleCode != this.trackedVehicle.VehicleCode) {
                const vehicle = new Vehicle(el.VehicleCode, el.GPSQuality, [el.Lat, el.Lon], el.Speed, el.VehicleId, el.Line, this.apiData.routeList, this, 'busAll')
                this.allVehicles.push(vehicle);
            }
        })
    }

    removeAllvehiclesMarkers() {
        this.allVehicles.forEach(el => {
            this.map.removeLayer(el.marker)
        })
        this.allVehicles.length = 0;
    }

    lineChange(value, vehicleCode) {
        this.trackedLine = value;

        this.apiData.lineVehicles = getLineVehicles(this.apiData.linesList, this.trackedLine)
        if (!vehicleCode)
            this.trackedVehicle.VehicleCode = this.apiData.lineVehicles[0];
        else
            this.trackedVehicle.VehicleCode = vehicleCode
        this.trackedVehicle = this.getTrackedVehicleInfo();

        if (this.trackTargetOnMap)
            setNewMarkerLocation(this.trackedVehicle, this.trackedVehicle.cords, this);
        else
            setNewMarkerLocation(this.trackedVehicle, this.trackedVehicle.cords)
        this.removeAllvehiclesMarkers();
        if (this.showAllVehicles)
            this.showAllVehiclesMarkers();
        this.fillSelects();
        this.fillInputs();
    }

    vehicleChange(vehicleCode) {
        this.trackedVehicle.VehicleCode = vehicleCode;
        this.trackedVehicle = this.getTrackedVehicleInfo();
        if (this.trackTargetOnMap)
            setNewMarkerLocation(this.trackedVehicle, this.trackedVehicle.cords, this);
        else
            setNewMarkerLocation(this.trackedVehicle, this.trackedVehicle.cords)
        this.removeAllvehiclesMarkers();
        if (this.showAllVehicles)
            this.showAllVehiclesMarkers();
        this.fillSelects();
        this.fillInputs();
    }

    getTrackedVehicleInfo() {
        let tempMarker = this.trackedVehicle.marker
        if (tempMarker)
            this.map.removeLayer(tempMarker)
        tempMarker = {};
        let vehicle;
        this.apiData.vehiclesList.forEach(el => {
            if (el.VehicleCode == this.trackedVehicle.VehicleCode)
                vehicle = new Vehicle(el.VehicleCode, el.GPSQuality, [el.Lat, el.Lon], el.Speed, el.VehicleId, el.Line, this.apiData.routeList, this, 'busIcon');
        })
        if (vehicle == undefined) {
            alert('Twój pojazd nie jest już dłużej dostępny');
        }
        return vehicle;
    }

    toggleTrackTarget(checkbox) {
        this.trackTargetOnMap = checkbox.checked
        if (checkbox.checked)
            setNewMarkerLocation(this.trackedVehicle, this.trackedVehicle.cords, this);
    }


    start() {
        getLineList()
            .then(res => {
                this.apiData.routeList = res;
                getVehicleList()
                    .then(response => {
                        this.apiData.updateTime = response.LastUpdateData;
                        this.apiData.vehiclesList = response.Vehicles;
                        this.apiData.linesList = getActualLineList(this.apiData.vehiclesList)
                        this.trackedLine = this.apiData.linesList[0].lineName;

                        this.apiData.lineVehicles = getLineVehicles(this.apiData.linesList, this.trackedLine)
                        this.trackedVehicle.VehicleCode = this.apiData.lineVehicles[0];
                        this.trackedVehicle = this.getTrackedVehicleInfo();

                        if (this.trackTargetOnMap) {
                            this.userMarker = getUserLocation(this.map, this.icons.userIcon);
                            setNewMarkerLocation(this.trackedVehicle, this.trackedVehicle.cords, this);
                        } else
                            this.userMarker = getUserLocation(this.map, true, this.markerIcons.userIcon);

                        this.showAllVehicles = this.buttons.showAllvehiclesBtn.checked
                        if (this.showAllVehicles)
                            this.showAllVehiclesMarkers();
                        this.fillSelects();
                        this.fillInputs();
                        this.secondsToRefresh = this.apiData.refreshDataTime;
                        setTimeout(this.refreshAll.bind(this), this.secondsToRefresh * 1000);
                    })
            })
    }

    refreshAll() {
        getVehicleList()
            .then(response => {
                this.apiData.updateTime = response.LastUpdateData;
                this.apiData.vehiclesList = response.Vehicles;
                this.apiData.linesList = getActualLineList(this.apiData.vehiclesList)

                this.apiData.lineVehicles = getLineVehicles(this.apiData.linesList, this.trackedLine)

                this.trackedVehicle = this.getTrackedVehicleInfo();

                if (this.trackTargetOnMap)
                    setNewMarkerLocation(this.trackedVehicle, this.trackedVehicle.cords, this);
                else
                    setNewMarkerLocation(this.trackedVehicle, this.trackedVehicle.cords);

                this.showAllVehicles = document.querySelector('#show-all-vehicle').checked
                if (this.showAllVehicles) {
                    this.removeAllvehiclesMarkers();
                    this.showAllVehiclesMarkers();
                } else
                    this.removeAllvehiclesMarkers()

                this.fillSelects();
                this.fillInputs();
                this.secondsToRefresh = this.apiData.refreshDataTime;
                // clearInterval(this.refreshInterval);
                setTimeout(this.refreshAll.bind(this), this.secondsToRefresh * 1000);
            })

    }
}

export class Vehicle {
    constructor(VehicleCode, GPSQuality, cords, Speed, VehicleId, routeId, routeList, mapObj, icon) {
        this.VehicleCode = VehicleCode;
        this.GPSQuality = GPSQuality;
        this.cords = cords;
        this.Speed = Speed;
        this.VehicleId = VehicleId;
        this.routeId = routeId;
        this.routeName = '';
        this.marker = {};

        routeList.forEach(route => {
            if (this.routeId == route.routeId)
                this.routeName = route.routeLongName
        })

        this.marker = createPin(mapObj, this.cords, mapObj.markerIcons[icon]);
        if (this.routeName)
            this.marker.bindPopup(createPopup(this, `ID: <b>${this.VehicleCode}</b> <br> Speed: <b>${this.Speed} km/h</b></br> <b>${this.routeName}</b>`, 'Śledz mnie', mapObj, mapObj.lineChange));
        else
            this.marker.bindPopup(`ID: <b>${this.VehicleCode}</b> <br> Speed: <b>${this.Speed} km/h</b></br><button class="popup-btn">Śledź mnie</button>`)
    }
}

const refreshBtn = document.querySelector('#refresh');
const trackTargetBtn = document.querySelector('#track-target');
const showAllvehiclesBtn = document.querySelector('#show-all-vehicle');

const lineSelect = document.querySelector('#line-select')
const vehicleSelect = document.querySelector('#vehicles-select');

const vehiclesAmountSpan = document.querySelector('#vehicles-amount span');
const trackedVehicleSpeedSpan = document.querySelector('#tracked-speed span');
const trackedVehicleCodeSpan = document.querySelector('#tracked-code span');
const trackedVehicleGpsSignalSpan = document.querySelector('#gps-signal span');
const trackedVehicleRouteSpan = document.querySelector('#tracked-route span');
const updateTimeSpan = document.querySelector('#update-time span');
const timeToRefreshSpan = document.querySelector('#refresh-time span');

const apiObj = new ApiData();
const myMap = new MapObj(refreshBtn, trackTargetBtn, showAllvehiclesBtn, lineSelect, vehicleSelect, vehiclesAmountSpan, updateTimeSpan, trackedVehicleSpeedSpan, trackedVehicleCodeSpan, trackedVehicleRouteSpan, trackedVehicleGpsSignalSpan, timeToRefreshSpan, apiObj);
myMap.start();