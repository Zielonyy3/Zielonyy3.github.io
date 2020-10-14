import {
    createMap,
    getUserLocation,
    checkMouseClickCoordinates,
    createPin,
    setNewMarkerLocation,
} from './mapModule.js';

import {
    getRouteList,
    getActualLineList,
    getVehicleList,
    getLineVehicles,
    getLineList
} from './ztmAPI.js';

const myMap = {
    map: createMap(undefined, 12),
    trackedLine: -1,
    trackedVehicle: {},
    allVehicles: [],
    showAllVehicles: false,
    trackTargetOnMap: false,
    icons: {
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
    }
}

const ztmData = {
    updateTime: '',
    vehiclesList: [],
    routeList: [],
    linesList: [],
    lineVehicles: [],
    refreshTime: 20,
}

export function createPopup(vehicleObj, paragraphText, btn1Text, functionToRun) {
    function createParagraph(text, className, container) {
        const p = L.DomUtil.create('p', className, container)
        p.innerHTML = text;
        return p;
    }

    function createButton(label, className, container) {
        const btn = L.DomUtil.create('button', '', container);
        btn.setAttribute('type', 'button');
        btn.innerHTML = label;
        return btn;
    }

    const popUp = L.popup();
    const container = L.DomUtil.create('div');

    const topText = createParagraph(paragraphText, '', container),
        startBtn = createButton(btn1Text, '', container);

    popUp.setContent(container);
    L.DomEvent.on(startBtn, 'click', () => {
        myMap.trackedVehicle.VehicleCode = vehicleObj.VehicleCode;
        refreshAll();
    })


    return popUp;
}

function runFunction(functionName, param) {
    functionName(param);
}

const Vehicle = class {
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

        this.marker = createPin(mapObj, this.cords, mapObj.icons[icon]);
        if (this.routeName)
            this.marker.bindPopup(createPopup(this, `ID: <b>${this.VehicleCode}</b> <br> Speed: <b>${this.Speed} km/h</b></br> <b>${this.routeName}</b>`, 'Śledz mnie'));
        else
            this.marker.bindPopup(`ID: <b>${this.VehicleCode}</b> <br> Speed: <b>${this.Speed} km/h</b></br><button class="popup-btn">Śledź mnie</button>`)
    }
}

function showAllVehiclesMarkers() {
    ztmData.vehiclesList.forEach(el => {
        if (el.VehicleCode != myMap.trackedVehicle.VehicleCode) {
            const vehicle = new Vehicle(el.VehicleCode, el.GPSQuality, [el.Lat, el.Lon], el.Speed, el.VehicleId, el.Line, ztmData.routeList, myMap, 'busAll')
            myMap.allVehicles.push(vehicle);
        }
    })
}

function removeAllvehiclesMarkers() {
    myMap.allVehicles.forEach(el => {
        myMap.map.removeLayer(el.marker)
    })
    myMap.allVehicles.length = 0;
}

function toggleAllVehiclesVisibility(checkbox) {
    myMap.showAllVehicles = checkbox.checked;
    if (checkbox.checked) {
        removeAllvehiclesMarkers();
        showAllVehiclesMarkers();
    } else
        removeAllvehiclesMarkers();
}

function getTrackedVehicleInfo() {
    let tempMarker = myMap.trackedVehicle.marker
    if (tempMarker)
        myMap.map.removeLayer(tempMarker)
    tempMarker = {};
    let vehicle = {};
    ztmData.vehiclesList.forEach(el => {
        if (el.VehicleCode == myMap.trackedVehicle.VehicleCode)
            vehicle = new Vehicle(el.VehicleCode, el.GPSQuality, [el.Lat, el.Lon], el.Speed, el.VehicleId, el.Line, ztmData.routeList, myMap, 'busIcon');
    })
    return vehicle;
}

function toggleTrackTarget(checkbox) {
    myMap.trackTargetOnMap = checkbox.checked
    if (checkbox.checked)
        setNewMarkerLocation(myMap.trackedVehicle, myMap.trackedVehicle.cords, myMap);
}

function start() {
    getLineList()
        .then(res => {
            ztmData.routeList = res;
            getVehicleList()
                .then(response => {
                    ztmData.updateTime = response.LastUpdateData;
                    ztmData.vehiclesList = response.Vehicles;
                    ztmData.linesList = getActualLineList(ztmData.vehiclesList)
                    myMap.trackedLine = ztmData.linesList[0].lineName;

                    ztmData.lineVehicles = getLineVehicles(ztmData.linesList, myMap.trackedLine)

                    myMap.trackedVehicle.VehicleCode = ztmData.lineVehicles[0];
                    myMap.trackedVehicle = getTrackedVehicleInfo();

                    if (myMap.trackTargetOnMap) {
                        myMap.userMarker = getUserLocation(myMap.map, myMap.icons.userIcon);
                        setNewMarkerLocation(myMap.trackedVehicle, myMap.trackedVehicle.cords, myMap);
                    } else
                        myMap.userMarker = getUserLocation(myMap.map, true, myMap.icons.userIcon);

                    myMap.showAllVehicles = document.querySelector('#all-vehicles').checked
                    if (myMap.showAllVehicles)
                        showAllVehiclesMarkers();
                    fillSelects();
                    fillInputs();
                    ztmData.timer = ztmData.refreshTime;
                })
        })
}

function refreshAll() {
    getVehicleList()
        .then(response => {
            ztmData.updateTime = response.LastUpdateData;
            ztmData.vehiclesList = response.Vehicles;
            ztmData.linesList = getActualLineList(ztmData.vehiclesList)

            ztmData.lineVehicles = getLineVehicles(ztmData.linesList, myMap.trackedLine)

            myMap.trackedVehicle = getTrackedVehicleInfo();

            if (myMap.trackTargetOnMap)
                setNewMarkerLocation(myMap.trackedVehicle, myMap.trackedVehicle.cords, myMap);
            else
                setNewMarkerLocation(myMap.trackedVehicle, myMap.trackedVehicle.cords);

            console.log(`Pozycja dla ${myMap.trackedVehicle.VehicleCode} ustawiona na %c${myMap.trackedVehicle.cords}`, "color: red");

            myMap.showAllVehicles = document.querySelector('#all-vehicles').checked
            if (myMap.showAllVehicles) {
                removeAllvehiclesMarkers();
                showAllVehiclesMarkers();
            } else
                removeAllvehiclesMarkers()

            fillSelects();
            fillInputs();
            ztmData.timer = ztmData.refreshTime;
        })

}

function lineChange(value) {
    myMap.trackedLine = value;

    ztmData.lineVehicles = getLineVehicles(ztmData.linesList, myMap.trackedLine)

    myMap.trackedVehicle.VehicleCode = ztmData.lineVehicles[0];
    myMap.trackedVehicle = getTrackedVehicleInfo();

    if (myMap.trackTargetOnMap)
        setNewMarkerLocation(myMap.trackedVehicle, myMap.trackedVehicle.cords, myMap);
    else
        setNewMarkerLocation(myMap.trackedVehicle, myMap.trackedVehicle.cords)
    removeAllvehiclesMarkers();
    if (myMap.showAllVehicles)
        showAllVehiclesMarkers();
    fillSelects();
    fillInputs();
}

function vehicleChange(value) {
    myMap.trackedVehicle.VehicleCode = value;

    myMap.trackedVehicle = getTrackedVehicleInfo();
    if (myMap.trackTargetOnMap)
        setNewMarkerLocation(myMap.trackedVehicle, myMap.trackedVehicle.cords, myMap);
    else
        setNewMarkerLocation(myMap.trackedVehicle, myMap.trackedVehicle.cords)
    removeAllvehiclesMarkers();
    if (myMap.showAllVehicles)
        showAllVehiclesMarkers();
    fillSelects();
    fillInputs();
}

function fillSelects() {
    const lineSelect = document.querySelector('#line-select')
    const vehicleSelect = document.querySelector('#vehicles-select');

    let out = '';
    ztmData.linesList.forEach(line => out += `<option value="${line.lineName}">${line.lineName}</option>`);
    lineSelect.innerHTML = out;
    lineSelect.value = myMap.trackedLine;

    out = '';
    ztmData.lineVehicles.forEach(vehicle => out += `<option value="${vehicle}">${vehicle}</option>`);
    vehicleSelect.innerHTML = out;
    vehicleSelect.value = myMap.trackedVehicle.VehicleCode;
}

function fillInputs() {
    document.querySelector('#vehicles-amount span').textContent = ztmData.vehiclesList.length;
    document.querySelector('#max-speed .speed').textContent = `${myMap.trackedVehicle.Speed} km/h `;
    document.querySelector('#max-speed .speedId').textContent = myMap.trackedVehicle.VehicleCode;
    document.querySelector('#gps-signal span').textContent = myMap.trackedVehicle.GPSQuality;
    document.querySelector('#route span').textContent = myMap.trackedVehicle.routeName;
    document.querySelector('#update-time span').textContent = ztmData.updateTime;
}

start();
let timer = setInterval(() => {
    document.querySelector('#refresh-time span').textContent = --ztmData.timer;
}, 1000)

let refresh = setInterval(refreshAll, ztmData.refreshTime * 1000)

myMap.showAllVehicles = document.querySelector('#all-vehicles').checked;
myMap.trackTargetOnMap = document.querySelector('#track-target').checked;

document.querySelector('#all-vehicles').addEventListener('change', e => toggleAllVehiclesVisibility(e.target))
document.querySelector('#track-target').addEventListener('change', e => toggleTrackTarget(e.target))
document.querySelector('#line-select').addEventListener('change', e => lineChange(e.target.value))
document.querySelector('#vehicles-select').addEventListener('change', e => vehicleChange(e.target.value))

document.querySelector('#refresh').addEventListener('click', refreshAll)