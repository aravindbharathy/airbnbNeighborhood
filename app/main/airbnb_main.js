

//BLOCK: Initialize variables
var listings = new Listings();
    
//BLOCK: Initialize UI controls
// Create the Google Map…
var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 13,
  center: new google.maps.LatLng(41.8750748 , -87.6514596),
  mapTypeId: google.maps.MapTypeId.roadmap
});

// add metroline
// var metroline = new google.maps.KmlLayer({
//   url: 'http://googlemaps.github.io/js-v2-samples/ggeoxml/cta.kml',
//   map: map
// });

// add niehgborhood
// var neighborhoodsLayerP = new google.maps.KmlLayer({
//   url: 'https://hungwenc.people.si.umich.edu/chicagoneighbor.kml',
//   preserveViewport: true,
//   map: map
// });

var neighborhoodsLayer = new google.maps.KmlLayer({
  url: 'http://chicagomap.zolk.com/sources/neighborhoods/source.kml',
  preserveViewport: true,
  map: map
});

neighborhoodsLayer.addListener('click', function(kmlEvent) {
  var text = kmlEvent.featureData.name;
  console.log(text);
});

// var neighborhoodsLayerP1 = new google.maps.KmlLayer({
//   url: 'http://chicagomap.zolk.com/sources/neighborhoods/source_p1.kml',
//   preserveViewport: true,
//   map: map
// });

// var neighborhoodsLayerP2 = new google.maps.KmlLayer({
//   url: 'http://chicagomap.zolk.com/sources/neighborhoods/source_p2.kml',
//   preserveViewport: true,
//   map: map
// });




// Load the listings data. When the data comes back, create an overlay.
d3.json("data/listings.json", function(error, data) {
  if (error) throw error;

  var overlay = new google.maps.OverlayView();

  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "listings");

    // Draw each marker as a separate SVG element.
    overlay.draw = function() {
      var projection = this.getProjection(),
          padding = 10;

      var marker = layer.selectAll("svg")
          .data(d3.entries(data))
          .each(transform) // update existing markers
        .enter().append("svg")
          .each(transform)
          .attr("class", "marker");

      // Add a circle.
      marker.append("circle")
          .attr("r", 2.5)
          .attr("cx", padding)
          .attr("cy", padding);

      // Add a label.
      // marker.append("text")
      //     .attr("x", padding + 7)
      //     .attr("y", padding)
      //     .attr("dy", ".31em")
      //     .text(function(d) { return d.key; });

      function transform(d) {
        d = new google.maps.LatLng(d.value.latitude, d.value.longitude);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
      }
    };
  };

  // Bind our overlay to the map…
  overlay.setMap(map);
});

// Load the listings data. When the data comes back, create an overlay.
d3.json("data/Chicago_Metro_Stop_Data.json", function(error, data) {
  if (error) throw error;

  var overlay = new google.maps.OverlayView();

  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "metro");

    // Draw each marker as a separate SVG element.
    overlay.draw = function() {
      var projection = this.getProjection(),
          padding = 10;

      var marker = layer.selectAll("svg")
          .data(d3.entries(data))
          .each(transform) // update existing markers
        .enter().append("svg")
          .each(transform)
          .attr("class", "marker");

      // Add a circle.
      marker.append("circle")
          .attr("r", 4.5)
          .attr("cx", padding)
          .attr("cy", padding);

      // Add a label.
      // marker.append("text")
      //     .attr("x", padding + 7)
      //     .attr("y", padding)
      //     .attr("dy", ".31em")
      //     .text(function(d) { return d.key; });

      function transform(d) {
        var temp = parseTuple(d.value.Location);
        d = new google.maps.LatLng(temp[0][0], temp[0][1]);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
      }

      function parseTuple(t) {
            var items = t.replace(/^\(|\)$/g, "").split("),(");
            items.forEach(function(val, index, array) {
               array[index] = val.split(",").map(Number);
            });
            return items;
        }
    };
  };

  // Bind our overlay to the map…
  overlay.setMap(map);
});

function drawUIControl() {
    return;
}
