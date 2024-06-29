/********************************************************** ROAD CONDITION PAGE **********************************************************/

"use strict";

var featuregroup_to_pit = L.featureGroup();
var featuregroup_to_port = L.featureGroup();

// base map
var map_init = L.map('map', {
  center: [4.143303, 96.237728],
  zoom: 13
});

// add satellite layer
var osm = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Esri'
}).addTo(map_init);

// add marker & popup
var marker = L.marker([4.143303, 96.237728]).addTo(map_init);
marker.bindPopup("Fetching data... Please wait...").openPopup();

plot_sections(map_init);

// function & event listener to react to direction change
document.getElementById("map_direction").addEventListener("change", change_direction);
function change_direction() {
  let direction = document.getElementById('map_direction').value;

  if (direction == 'To Pit') {
    map_init.removeLayer(featuregroup_to_port);
    featuregroup_to_pit.addTo(map_init);
  } else if (direction == 'To Port'){
    map_init.removeLayer(featuregroup_to_pit);
    featuregroup_to_port.addTo(map_init);
  }
}

// function to plot sections
async function plot_sections(map) {
  // fetch coordinates
  // TODO: MOVE API TO .ENV
  let url = "https://d7jzoht5xl.execute-api.ap-southeast-1.amazonaws.com/doubleSDT/road-condition/get-coordinates";
  const response = await fetch(url);
  var sections_coordinates = await response.json();

  // fetch sections data
  // TODO: MOVE API TO .ENV
  let url2 = "https://d7jzoht5xl.execute-api.ap-southeast-1.amazonaws.com/doubleSDT/road-condition/get-sections";
  const response2 = await fetch(url2);
  var sections_data = await response2.json();

  for (let i = 0; i < sections_data.section.length; i++) {
    let to_port = parseInt(sections_data.to_port[i]);
    let az = parseFloat(sections_data.az_lead_rms[i]);
    let pitch = parseFloat(sections_data.pitch_lead_rms[i]);
    let roll = parseFloat(sections_data.roll_lead_rms[i]);
    let speed = parseFloat(sections_data.v_avg[i]);
    let start_time = sections_data.start_time[i].slice(0,19);
    let finish_time = sections_data.finish_time[i].slice(0,19);
    let section = parseInt(sections_data.section[i]);
    let meter = ((section) % 10) * 100;
    let kilometer = Math.floor(section / 10);

    if (az > 0.06) {
      var line_color = 'red';
    } else {
      var line_color = 'green';
    }

    if (to_port == 0) {
      var poly = L.polyline(sections_coordinates[section].to_pit, {color: line_color}).addTo(featuregroup_to_pit);
      var direction = "To Pit";
    } else {
      var poly = L.polyline(sections_coordinates[section].to_pit, {color: line_color}).addTo(featuregroup_to_port);
      var direction = "To Port";
    }

    let popup = "<h5>KM" + String(kilometer) + "-" + String(meter) + "</h5>" +
                "Section: " + String(section) +
                "<br>Direction: " + String(direction) +
                "<br>Time: " + start_time + " - " + finish_time +
                "<br>Vibration Intensity: " + az.toFixed(3) + " grms" +
                "<br>Average Inclination: " + pitch.toFixed(3) + " degrees" +
                "<br>Average Body Roll: " + roll.toFixed(3) + " degrees" +
                "<br>Average Speed: " + speed.toFixed(3) + " km/h";
    poly.bindPopup(popup);
  }

  featuregroup_to_pit.addTo(map);
  map.removeLayer(marker);
}