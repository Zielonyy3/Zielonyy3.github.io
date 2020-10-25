import {
    createMap,
    getUserLocation,
    createTrackerLine,
    createPin,
    createPopup,
    flyToCords
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
    constructor(refreshBtn, trackTargetBtn, showAllvehiclesBtn, trackUserLocationBtn, canTrackUserBtn, drawTrackedVehicleRouteBtn, lineSelectInpt, vehicleSelectInpt, vehicleCodeForm, vehiclesAmountSpn, updateTimeSpn, trackedVehicleSpeedSpn, trackedVehicleCodeSpn, trackedVehicleRouteSpn, gpsSignalSpn, timeToRefreshSpn, loadingAnimDiv, trackedVehicleCodeSmallSpn, trackedVehicleSpeedSmallSpn, apiData) {
        this.map = createMap(undefined, 12);
        this.routeTracker = createTrackerLine(this.map);
        this.trackedLine = -1;
        this.trackedVehicle = {};
        this.allVehicles = [];
        this.loadingAnimDiv = loadingAnimDiv;
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
            trackUserLocationBtn: trackUserLocationBtn,
            canTrackUserBtn: canTrackUserBtn,
            drawTrackedVehicleRouteBtn: drawTrackedVehicleRouteBtn,
        };
        this.selectInput = {
            lineSelect: lineSelectInpt,
            vehicleSelect: vehicleSelectInpt,
            findVehicleByCode: vehicleCodeForm,
        };
        this.inputToFill = {
            vehiclesAmount: vehiclesAmountSpn,
            updateTime: updateTimeSpn,
            trackedVehicleSpeed: trackedVehicleSpeedSpn,
            trackedVehicleCode: trackedVehicleCodeSpn,
            trackedVehicleRoute: trackedVehicleRouteSpn,
            gpsSignal: gpsSignalSpn,
            timeToRefresh: timeToRefreshSpn,
            trackedVehicleCodeSmall: trackedVehicleCodeSmallSpn,
            trackedVehicleSpeedSmall: trackedVehicleSpeedSmallSpn,
        }
        this.showAllVehicles = this.buttons.showAllvehiclesBtn.checked;
        this.canTrackUser = this.buttons.canTrackUserBtn.checked;
        this.trackTargetOnMap = this.buttons.trackTargetBtn.checked;
        this.trackUserLocationOnMap = this.buttons.trackUserLocationBtn.checked;
        this.drawTrackedVehicleRoute = this.buttons.drawTrackedVehicleRouteBtn.checked;

        this.apiData = apiData;
        this.secondsToRefresh = this.apiData.refreshDataTime;
        this.addButtonEvents();
    }

    addButtonEvents() {
        this.buttons.showAllvehiclesBtn.addEventListener('change', () => this.toggleAllVehiclesVisibility(this.buttons.showAllvehiclesBtn));
        this.buttons.trackTargetBtn.addEventListener('change', () => this.toggleTrackTarget(this.buttons.trackTargetBtn));
        this.buttons.trackUserLocationBtn.addEventListener('change', () => this.toggleTrackuser(this.buttons.trackUserLocationBtn));
        this.buttons.drawTrackedVehicleRouteBtn.addEventListener('change', () => this.toggleDrawTrackedVehicleRoute(this.buttons.drawTrackedVehicleRouteBtn));
        this.buttons.refreshBtn.addEventListener('click', this.refreshAll.bind(this));
        this.selectInput.lineSelect.addEventListener('change', () => this.lineChange(this.selectInput.lineSelect.value));
        this.selectInput.vehicleSelect.addEventListener('change', () => this.vehicleChange(this.selectInput.vehicleSelect.value));
        this.selectInput.findVehicleByCode.addEventListener('submit', e => this.findForVehicleByCode(e, this.selectInput.findVehicleByCode));

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
        this.inputToFill.trackedVehicleCodeSmall.textContent = this.trackedVehicle.VehicleCode;
        this.inputToFill.trackedVehicleSpeedSmall.textContent = `${this.trackedVehicle.Speed} km/h `;
    }
    findForVehicleByCode(e, form) {
        e.preventDefault();
        const vehicleCode = form.querySelector('#find-vehicle').value;
        if (vehicleCode) {
            this.vehicleChange(vehicleCode);
            flyToCords(this.map, this.trackedVehicle.cords);
        }
    }

    toggleAllVehiclesVisibility(checkbox) {
        this.showAllVehicles = checkbox.checked;
        if (checkbox.checked) {
            this.removeAllvehiclesMarkers();
            this.showAllVehiclesMarkers();
        } else
            this.removeAllvehiclesMarkers();
    }

    toggleTrackTarget(checkbox) {
        this.trackTargetOnMap = checkbox.checked
        if (checkbox.checked)
            flyToCords(this.map, this.trackedVehicle.cords);
    }

    toggleTrackuser(checkbox) {
        this.trackUserLocationOnMap = checkbox.checked
        if (checkbox.checked) {
            flyToCords(this.map, [this.userMarker._latlng.lat, this.userMarker._latlng.lng]);
        }
    }

    toggleDrawTrackedVehicleRoute(checkbox) {
        this.drawTrackedVehicleRoute = checkbox.checked;
        this.routeTracker.setLatLngs(0);
        if (this.drawTrackedVehicleRoute)
            this.routeTracker.addLatLng(this.trackedVehicle.marker.getLatLng());

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

    lineChange(value) {
        this.trackedLine = value;
        this.apiData.lineVehicles = getLineVehicles(this.apiData.linesList, this.trackedLine)
        this.trackedVehicle.VehicleCode = this.apiData.lineVehicles[0];
        this.vehicleChange()
    }

    vehicleChange(vehicleCode) {
        if (vehicleCode)
            this.trackedVehicle.VehicleCode = vehicleCode;
        this.getTrackedVehicleInfo(true);
        this.routeTracker.setLatLngs(0);
        this.routeTracker.addLatLng(this.trackedVehicle.marker.getLatLng());

        if (this.trackTargetOnMap)
            flyToCords(this.map, this.trackedVehicle.cords);

        this.removeAllvehiclesMarkers();
        if (this.showAllVehicles)
            this.showAllVehiclesMarkers();
        this.fillSelects();
        this.fillInputs();
    }

    getTrackedVehicleInfo(refresh = false, change = false) {
        let find = false
        this.apiData.vehiclesList.forEach(el => {
            if (el.VehicleCode == this.trackedVehicle.VehicleCode) {
                find = true;
                if (!refresh || change)
                    this.trackedVehicle = new Vehicle(el.VehicleCode, el.GPSQuality, [el.Lat, el.Lon], el.Speed, el.VehicleId, el.Line, this.apiData.routeList, this, 'busIcon');
                else {
                    this.trackedVehicle.GPSQuality = el.GPSQuality;
                    this.trackedVehicle.Speed = el.Speed;
                    this.trackedVehicle.cords = [el.Lat, el.Lon];
                    this.trackedVehicle.marker.setLatLng(this.trackedVehicle.cords);
                }
            }
        })
        if (!find) {
            this.trackedVehicle.VehicleCode = this.apiData.lineVehicles[0];
            alert('Twój pojazd nie jest dostępny');
        }
    }

    start() {
        this.loadingAnimDiv.classList.remove('no-active');
        getLineList()
            .then(res => {
                this.apiData.routeList = res;
                getVehicleList()
                    .then(response => {
                        try {
                            this.apiData.updateTime = response.LastUpdateData;
                            this.apiData.vehiclesList = response.Vehicles;
                            this.apiData.linesList = getActualLineList(this.apiData.vehiclesList)
                            this.trackedLine = this.apiData.linesList[0].lineName;
                            this.apiData.lineVehicles = getLineVehicles(this.apiData.linesList, this.trackedLine)
                            this.trackedVehicle.VehicleCode = this.apiData.lineVehicles[0];

                            this.getTrackedVehicleInfo();
                            this.routeTracker.setLatLngs(0);
                            if (this.drawTrackedVehicleRoute)
                                this.routeTracker.addLatLng(this.trackedVehicle.marker.getLatLng());

                            getUserLocation(this.map, false, this.markerIcons.userIcon, this.canTrackUser)
                                .then((res) => this.userMarker = res)
                                .finally(() => {
                                    this.loadingAnimDiv.classList.add('no-active');
                                    if (this.trackTargetOnMap)
                                        flyToCords(this.map, this.trackedVehicle.cords);
                                    else if (this.trackUserLocationOnMap) {
                                        const tmpCords = [this.userMarker._latlng.lat, this.userMarker._latlng.lng]
                                        flyToCords(this.map, tmpCords);
                                    }
                                    if (this.showAllVehicles)
                                        this.showAllVehiclesMarkers();
                                    this.fillSelects();
                                    this.fillInputs();
                                    this.timerInterval = setInterval(() => this.inputToFill.timeToRefresh.textContent = --this.secondsToRefresh, 1000);
                                    this.refreshInterval = setInterval(() => this.refreshAll(), this.secondsToRefresh * 1000);
                                })
                        } catch (err) {
                            console.error(err);
                            alert('START: Wystąpił tymczasowy błąd prawdopodobnie spowodowany brakiem danych z systemu Tristar. Spróbuj ponownie za kilka minut!');
                        }
                    })
            })
    }

    refreshAll() {
        this.loadingAnimDiv.classList.remove('no-active');
        getVehicleList()
            .then(response => {
                try {
                    this.apiData.updateTime = response.LastUpdateData;
                    this.apiData.vehiclesList = response.Vehicles;
                    this.apiData.linesList = getActualLineList(this.apiData.vehiclesList)

                    this.apiData.lineVehicles = getLineVehicles(this.apiData.linesList, this.trackedLine)
                    this.canTrackUser = this.buttons.canTrackUserBtn.checked;
                    this.trackTargetOnMap = this.buttons.trackTargetBtn.checked;
                    this.trackUserLocationOnMap = this.buttons.trackUserLocationBtn.checked;

                    this.getTrackedVehicleInfo(true);
                    if (this.drawTrackedVehicleRoute)
                        this.routeTracker.addLatLng(this.trackedVehicle.marker.getLatLng());

                    getUserLocation(this.map, true, this.markerIcons.userIcon, this.canTrackUser)
                        .then((res) => {
                            this.userMarker._latlng.lat = res[0];
                            this.userMarker._latlng.lng = res[1];
                        })
                        .finally(() => {
                            this.loadingAnimDiv.classList.add('no-active');
                            if (this.trackTargetOnMap)
                                flyToCords(this.map, this.trackedVehicle.cords);
                            else if (this.trackUserLocationOnMap) {
                                const tmpCords = [this.userMarker._latlng.lat, this.userMarker._latlng.lng]
                                flyToCords(this.map, tmpCords);
                            }
                            this.showAllVehicles = document.querySelector('#show-all-vehicle').checked
                            if (this.showAllVehicles) {
                                this.removeAllvehiclesMarkers();
                                this.showAllVehiclesMarkers();
                            } else
                                this.removeAllvehiclesMarkers()

                            this.fillSelects();
                            this.fillInputs();
                            this.secondsToRefresh = this.apiData.refreshDataTime;
                            clearInterval(this.refreshInterval);
                            this.refreshInterval = setInterval(() => this.refreshAll(), this.secondsToRefresh * 1000);
                        })
                } catch (err) {
                    clearInterval(this.refreshInterval);
                    clearInterval(this.timerInterval);
                    console.error(err);
                    alert('Wystąpił tymczasowy błąd prawdopodobnie spowodowany brakiem danych z systemu Tristar. Spróbuj ponownie za kilka minut!');
                }
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
            this.marker.bindPopup(createPopup(this, `ID: <b>${this.VehicleCode}</b> <br> Speed: <b>${this.Speed} km/h</b></br> <b>${this.routeName}</b>`, 'Śledz mnie', mapObj, mapObj.vehicleChange));
        else
            this.marker.bindPopup(`ID: <b>${this.VehicleCode}</b> <br> Speed: <b>${this.Speed} km/h</b></br><button class="popup-btn">Śledź mnie</button>`)
    }
}

const refreshBtn = document.querySelector('#refresh');
const trackTargetBtn = document.querySelector('#track-target');
const trackUserLocationBtn = document.querySelector('#track-user-position');
const canTrackUserBtn = document.querySelector('#update-user-location');
const showAllvehiclesBtn = document.querySelector('#show-all-vehicle');
const drawTrackedVehicleRouteBtn = document.querySelector('#draw-vehicle-route');

const loadingAnimDiv = document.querySelector('.loading-anim-div');

const lineSelect = document.querySelector('#line-select')
const vehicleSelect = document.querySelector('#vehicles-select');
const findVehicleForm = document.querySelector('#find-vehicle-form');

const vehiclesAmountSpan = document.querySelector('#vehicles-amount span');
const trackedVehicleSpeedSpan = document.querySelector('#tracked-speed span');
const trackedVehicleCodeSpan = document.querySelector('#tracked-code span');
const trackedVehicleGpsSignalSpan = document.querySelector('#gps-signal span');
const trackedVehicleRouteSpan = document.querySelector('#tracked-route span');
const trackedVehicleCodeSmallSpn = document.querySelector('#vehicle-code-info');
const trackedVehicleSpeedSmallSpn = document.querySelector('#vehicle-speed-info');

const updateTimeSpan = document.querySelector('#update-time span');
const timeToRefreshSpan = document.querySelector('#refresh-time span');

const apiObj = new ApiData();
const myMap = new MapObj(refreshBtn, trackTargetBtn, showAllvehiclesBtn, trackUserLocationBtn, canTrackUserBtn, drawTrackedVehicleRouteBtn, lineSelect, vehicleSelect, findVehicleForm, vehiclesAmountSpan, updateTimeSpan, trackedVehicleSpeedSpan, trackedVehicleCodeSpan, trackedVehicleRouteSpan, trackedVehicleGpsSignalSpan, timeToRefreshSpan, loadingAnimDiv, trackedVehicleCodeSmallSpn, trackedVehicleSpeedSmallSpn, apiObj);
myMap.start();