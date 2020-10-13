export function createMap(startCoordinates = [54.49074313834612, 18.46927088224449], startZoom = 11) {
    let myMap = L.map('mapid').setView(startCoordinates, startZoom);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        // id: 'mapbox/satellite-v9',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiemllbG9ueXkzIiwiYSI6ImNrZnlhcGIxbzFzcDgycHQ4cHV3N3F5bmIifQ.ZC3kl6eDh_Y4McuZgMWtZg'
    }).addTo(myMap);

    return myMap;
}

export function checkMouseClickCoordinates(e, map) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
    const point = [e.latlng.lat, e.latlng.lng]
    console.log(point);
}

export function getUserLocation(map, flyToCords = false, iconPNG = false) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const cords = [position.coords.latitude, position.coords.longitude]
            let myPostion = L.marker(cords, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 500
            }).addTo(map);

            if (iconPNG)
                myPostion.setIcon(iconPNG);

            if (flyToCords) {
                map.flyTo(cords, map.getZoom(), {
                    animate: true,
                    duration: .8
                });
            }
            myPostion.bindPopup(`Your location is: </br><b>x: ${cords[0].toFixed(2)}, </br> y: ${cords[1].toFixed(2)}</b>`).openPopup();
            return myPostion;
        });
    } else {
        alert(`These browser doesn't support geolocation`)
    }
}

export function createPin(mapObj, cords, iconPNG = false) {
    let marker = L.marker(cords, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500,
    }).addTo(mapObj.map)
    if (iconPNG)
        marker.setIcon(iconPNG);
    return marker;
}

export function setNewMarkerLocation(vehicleObj, cords, mapObj = false) {
    let newLatLng = new L.LatLng(cords[0], cords[1]);
    vehicleObj.marker.setLatLng(newLatLng);
    if (mapObj) {
        mapObj.map.flyTo(cords, mapObj.map.getZoom(), {
            animate: true,
            duration: .45
        });
    }
}