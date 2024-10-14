// Link to GeoJson data
let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Link to tectonic plates (raw GitHub link)
let techPlates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Create a base map layer
let baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create satellite map layer
let satMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Create layer groups for the overlays
let earthquakesLayer = L.layerGroup();  // Earthquakes layer
let techlayers = L.layerGroup();        // Tectonic plates layer

// Define base maps
let baseMap = {
    "Basic": baseLayer,
    "Satellite": satMap
};

// Define overlay maps
let overlayMap = {
    "Earthquakes": earthquakesLayer,
    "Tectonic Plates": techlayers
};

// Initialize the map object
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [baseLayer]  // Start with the basic layer
});

// Add layer control to the map
L.control.layers(baseMap, overlayMap).addTo(myMap);

// A function to determine marker size based on earthquake magnitude
function getMagnitude(magnitude) {
    return magnitude * 4;
}

// A function to determine marker color based on earthquake depth
function getColor(depth) {
    return depth > 90 ? 'red' :
           depth > 70 ? 'orangered' :
           depth > 50 ? 'darkorange' :
           depth > 30 ? 'gold' :
           depth > 10 ? 'yellowgreen' :
                        'limegreen';
}

// Load earthquake data using D3
d3.json(geoData).then(function(data) {
    data.features.forEach(function(feature) {
        let coordinates = feature.geometry.coordinates;
        let magnitude = feature.properties.mag;
        let depth = coordinates[2]; 
        let location = feature.properties.place;

        // Create a circle marker for each earthquake
        let marker = L.circleMarker([coordinates[1], coordinates[0]], {
            radius: getMagnitude(magnitude),
            fillColor: getColor(depth),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<h2>Location: ${location}</h2> <hr> <h3>Magnitude: ${magnitude}<br>Depth: ${depth} km</h3>`);

        // Add the marker to the earthquakes layer
        earthquakesLayer.addLayer(marker);
    });
});

// Load tectonic plates data
d3.json(techPlates).then(function(data) {
    L.geoJson(data, {
        style: function(feature) {
            return {
                color: "orange",
                weight: 2
            };
        }
    }).addTo(techlayers);  // Add to the tectonic plates layer group
});

// Set up the legend
let legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");

    let limits = [-10, 10, 30, 50, 70, 90];
    let colors = limits.map(depth => getColor(depth + 1));
    let labels = [];

    let legendInfo = `
        <h2>Earthquake Depth (km)</h2>
        <div class="labels">
            <div class="min">${limits[0]}</div>
            <div class="max">${limits[limits.length - 1]}+</div>
        </div>`;

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
        labels.push(
            `<li style="background-color: ${colors[index]}"></li> 
             ${limit}${limits[index + 1] ? "&ndash;" + limits[index + 1] : "+"}`
        );
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
};

// Add the legend to the map
legend.addTo(myMap);