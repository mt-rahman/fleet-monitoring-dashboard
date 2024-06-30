/********************************************************** LOCATION TRACKING PAGE **********************************************************/

"use strict";

/********************************************************** status card **********************************************************/

update_status_cards();

// function to update status cards
async function update_status_cards() {
  //fetch api
  let url = "http://localhost:3000/api/get-count";
  const response = await fetch(url);
  var data = await response.json();

  //update card contents
  document.getElementById('loading').innerHTML = data.loading;
  document.getElementById('dumping').innerHTML = data.dumping;
  document.getElementById('transit').innerHTML = data.in_transit;
}

/********************************************************** location tracking map **********************************************************/

var loading_area_coordinates = [
  [4.1890171,96.2418973],
  [4.1880647,96.2478411],
  [4.1892632,96.2508023],
  [4.1925695,96.2507164],
  [4.1937037,96.2428522],
  [4.1890171,96.2418973]
];

var dumping_area_coordinates = [
  [4.1113514,96.1922497],
  [4.1098532,96.1935693],
  [4.1115921,96.1956078],
  [4.1129137,96.1942613],
  [4.1113514,96.1922497]
];

// base map
var map_init = L.map('map', {
  center: [4.143303, 96.237728],
  zoom: 13
});

// add satellite layer
var osm = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Esri'
}).addTo(map_init);

var loading_polygon = L.polygon(loading_area_coordinates, {color: 'red'}).addTo(map_init);
var dumping_polygon = L.polygon(dumping_area_coordinates, {color: 'red'}).addTo(map_init);

// add marker & popup
var marker = L.marker([4.143303, 96.237728]).addTo(map_init);
marker.bindPopup("Fetching data... Please wait...").openPopup();
update_marker(map_init, marker, true);

// function & event listener to react to unit id change
document.getElementById("unit_id").addEventListener("change", change_id);
function change_id() {
  update_marker(map_init, marker, true);
}

// function to update marker position & popup content
async function update_marker(map, marker, initial) {
  // get user choice
  let sel = document.getElementById("unit_id");
  let primemover_id = String(sel.value);
  let url = `http://localhost:3000/api/get-location?primemover_id=${primemover_id}`;

  // fetch coordinates
  const response = await fetch(url);
  var data = await response.json();

  // update marker position & popup
  marker.setLatLng([data.latitude, data.longitude])
  let text= sel.options[sel.selectedIndex].text;
  let popup_text = "<h5>" + text +"</h5>" +
                  "Timestamp: " + String(data.datetime) + "," +
                  "<br>Speed: " + parseFloat(String(data.speed)).toFixed(2) + " km/h," +
                  "<br>Location Status: " + String(data.location_status) + "," +
                  "<br>Payload Status: " + String(data.payload_status);
  marker.setPopupContent(popup_text);

  // only center view to marker on first update
  if (initial == true) {
    marker.openPopup();
    center_to_marker(map_init, marker);
  }
}

// function to center map view to marker
function center_to_marker(map, marker) {
  var latlng = marker.getLatLng();
  var lat = latlng.lat;
  var lng = latlng.lng;

  map.setView([lat, lng], 15);
}

/********************************************************** update location tracking page **********************************************************/

// update data every 5 seconds
var intervalId = setInterval(function() {
  update_status_cards();
  update_marker(map_init, marker, false);
}, 5000);