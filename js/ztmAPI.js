const checkForError = response => {
    if (!response.ok) throw Error(response.statusText);
    return response.json();
};

export function getVehicleList(vehiclesOutput = null) {
    let today = new Date();
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}:${today.getMilliseconds()}`;
    console.log(`Downloading vehicle list..%c${time}`, "color: yellow");
    return fetch('https://ckan2.multimediagdansk.pl/gpsPositions')
        .then(checkForError)
        .then(response => {
            console.log('%cVehicle list downloaded!', "color: yellow");

            return response;
        })
        .catch(err => new Error(`Downloading vehicle failed: ${err}`))
}

export function getRouteList() {
    let today = new Date();
    let time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    console.log(`Downloading route list...%c${time}`, "color: yellow")
    return fetch(`https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/b15bb11c-7e06-4685-964e-3db7775f912f/download/trips.json`)
        .then(checkForError)
        .then(routes => {
            let routeList = [];
            for (let key in routes) {
                if (routes.hasOwnProperty(key)) {
                    let arr = routes[key].trips
                    arr.forEach(route => {
                        let el = {
                            id: route.tripId,
                            name: route.tripHeadsign,
                            direction: route.directionId
                        }
                        routeList.push(el);
                    })
                }
            }
            console.log('%cRoute list downloaded!', "color: yellow");
            return routeList;

        })
        .catch(err => new Error(`Downloading route list failed: ${err}`));
}

export function getStopsList() {
    fetch(`https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/d3e96eb6-25ad-4d6c-8651-b1eb39155945/download/stopsingdansk.json`)
        .then(checkForError)
        .then(stops => {
            console.log([stops]);
            return stops;
        })
        .catch(err => new Error(`Stops failed: ${err}`))
}

export function getLineList() {
    let dat = new Date();
    let day = dat.getDate() < 10 ? '0' + dat.getDate() : dat.getDate();
    let month = dat.getMonth() + 1 < 10 ? '0' + dat.getMonth() + 1 : dat.getMonth() + 1;
    let year = dat.getFullYear();
    let today = `${year}-${month}-${day}`;

    let time = `${dat.getHours()}:${dat.getMinutes()}:${dat.getSeconds()}:${dat.getMilliseconds()}`;
    console.log(`Downloading line list..%c${time}`, "color: yellow");
    return fetch('https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/22313c56-5acf-41c7-a5fd-dc5dc72b3851/download/routes.json')
        .then(checkForError)
        .then(lines => {
            let lineList;
            for (let key in lines) {
                if (key == today)
                    lineList = lines[key].routes;
            }
            console.log('%cLine list downloaded!', "color: yellow");
            return lineList
        })
}

export function getActualLineList(vehicles) {
    let lines = [];
    let sortedLines = [];
    vehicles.forEach(el => sortedLines.push(el.Line));
    sortedLines = sortedLines.filter((item, index) => sortedLines.indexOf(item) === index);
    sortedLines.sort((a, b) => {
        return a - b;
    });

    sortedLines.forEach(el => {
        let line = {
            lineName: el,
            vehicles: []
        }
        lines.push(line)
    })

    vehicles.forEach((el, i) => {
        lines.forEach(line => {
            if (el.Line == line.lineName)
                line.vehicles.push(el.VehicleCode);
        })
    });
    return lines;
}

export function getLineVehicles(linesList = isRequired('linesList'), selectedLine = isRequired('selectedLine')) {
    let selectedVehicles;
    linesList.forEach(line => {
        if (line.lineName == selectedLine)
            selectedVehicles = line.vehicles
    })
    return selectedVehicles
}

export function getTrackedVehicleInfo(vehicleObj, vehicleList, lineList) {
    let car = {}
    vehicleList.forEach(el => {
        if (el.VehicleCode == vehicleObj.VehicleCode) {
            car = {
                VehicleCode: vehicleObj.VehicleCode,
                GPSQuality: el.GPSQuality,
                cords: [el.Lat, el.Lon],
                Speed: el.Speed,
                VehicleId: el.VehicleId,
                marker: vehicleObj.marker,
                routeId: el.Line,
            }
            if (lineList) {
                lineList.forEach(route => {
                    if (car.routeId == route.routeId)
                        car.routeName = route.routeLongName;
                });
            }
        }
    })
    return car;
}