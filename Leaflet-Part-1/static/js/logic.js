// Link to GeoJson data
let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create a base map layer using OpenStreetMap tiles
let baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Initialize the map object
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [baseLayer]
});

// Create a new layer group to hold earthquake markers
let earthquakesLayer = L.layerGroup().addTo(myMap);

// A function to determine marker size based on earthquake magnitude
function getMagnitude(magnitude) {
    return magnitude * 4;
}

// A function to determine marker color based on earthquake depth
function getColor(depth) {
    return depth > 90 ? 'red' :            // Deepest
           depth > 70 ? 'orangered' :      // Very deep
           depth > 50 ? 'darkorange' :     // Deep
           depth > 30 ? 'gold' :           // Moderate
           depth > 10 ? 'yellowgreen' :    // Shallow
                        'limegreen';       // Very shallow
}

// Load GeoJSON data using D3
d3.json(geoData).then(function(data) {
    // Loop through each feature in the GeoJSON data
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
})

// Set up the legend.
let legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");

    // Define the depth ranges and corresponding green colors.
    let limits = [-10, 10, 30, 50, 70, 90];
    let colors = limits.map(depth => getColor(depth + 1));
    let labels = [];

    // Add title and min/max labels.
    let legendInfo = `
        <h2>Earthquake Depth (km)</h2>
        <div class="labels">
            <div class="min">${limits[0]}</div>
            <div class="max">${limits[limits.length - 1]}+</div>
        </div>`;

    div.innerHTML = legendInfo;

    // Generate color labels for each depth range.
    limits.forEach(function(limit, index) {
        labels.push(
            `<li style="background-color: ${colors[index]}"></li> 
             ${limit}${limits[index + 1] ? "&ndash;" + limits[index + 1] : "+"}`
        );
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
};

// Adding the legend to the map.
legend.addTo(myMap);