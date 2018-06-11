//BLOCK: Initialize variables
var neighborhoods = []; //list of all neighborhoods stored as objects
var listings = []; //list of all listings stored as objects
var inputWalkScoreRange={"min":0, "max":100};
var outputWalkScoreRange={"min":0, "max":10};
var hashMap = new Map();
var isZoomed = false;
var ratingsData = {};
var averageCrimeRating = 0;
var averageWalkScore = 0;
var currentPolygon = "undefined";
var currentNeighborhood = "undefined";
var currentHeapMap = "";
    
//BLOCK: Initialize controls

// Create the Google Map…
var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 12,
  center: new google.maps.LatLng(41.8750748 , -87.6514596),
  mapTypeId: google.maps.MapTypeId.roadmap
});

var safetyScale = d3.scale.linear().range([100,0]).domain([0,159.4]);

google.maps.Polygon.prototype.getBounds = function() {
    var bounds = new google.maps.LatLngBounds();
    this.getPath().forEach(function(element,index){ bounds.extend(element); });
    return bounds;
}

google.maps.Polygon.prototype.getApproximateCenter = function() {
  var boundsHeight = 0,
      boundsWidth = 0,
      centerPoint,
      heightIncr = 0,
      maxSearchLoops,
      maxSearchSteps = 10,
      n = 1,
      northWest,
      polygonBounds = this.getBounds(),
      testPos,
      widthIncr = 0;


  // Get polygon Centroid
  centerPoint = polygonBounds.getCenter();
  return centerPoint;
};

//Create a geoXML parser for KML neighborhood
var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
    var icons = {
       parking: {
         icon: iconBase + 'parking_lot_maps.png'
       },
       library: {
         icon: iconBase + 'library_maps.png'
       },
       info: {
         icon: iconBase + 'info-i_maps.png'
       }
};
var  neighborhoodParser = new geoXML3.parser(
        {
            map: map,
            singleInfoWindow: 0,
            zoom: false,
            afterParse:function(docs){
                if (docs[0].gpolygons.length>0){ 
                    var colorScale = d3.scale.linear().range([0,255]).domain([1,100]);
                    var crimeScale = d3.scale.linear().range([0,500]).domain([0,159.4]);
                    for(var i = 0; i < docs[0].gpolygons.length; i++){
                        var polygon = docs[0].gpolygons[i];
                        // var id = docs[0].placemarks[i].vars.val.sec_neigh;
                        // var name = docs[0].placemarks[i].vars.val.pri_neigh;
                        var id = toTitleCase(docs[0].placemarks[i].vars.val.community.toLowerCase());
                        var name = camelize(docs[0].placemarks[i].vars.val.community.toLowerCase());
                        var val = Math.floor(Math.random() * 100) + 1;
                        var neighborhood = new Neighborhood(polygon,id,name,val);
                        neighborhood.setAllListings(hashMap.get(name));
                        if(typeof neighborhood.getAllListings() == 'undefined'){
                             neighborhoodParser.docs[0].gpolygons[i].setMap(null);
                        }
                        else{
                            var ratings = getByValue(ratingsData,name);
                            if(typeof ratings != "undefined"){
                                neighborhood.setAverageWalkScore(ratings["Walk Score"]);
                                neighborhood.setCrimeRating(ratings["Crime_Rating"]);
                                neighborhoods.push(neighborhood);
                                //val = Math.floor(crimeScale(ratings["Crime_Rating"]));
                                val = Math.floor((70 * Math.floor(crimeScale(ratings["Crime_Rating"]))) / 100) + Math.floor((30 * ratings["Walk Score"]) / 100);
                                // console.log(val);
                                neighborhood.setValue(val);
                               // var color = "rgb(" + Math.floor(colorScale(val)) + "," + Math.floor(colorScale(val)) + ",255)";
                                var color = "rgb(" + Math.floor(colorScale(val)) + ",255," + Math.floor(colorScale(val)) + ")";
                                docs[0].placemarks[i].polygon.setOptions({fillColor: color, strokeColor: "#000000", fillOpacity: 0.8, strokeWidth: 10});
                                setPopup(polygon,neighborhood);
                            }
                        }  
                        
                    }

                     console.log(neighborhoods);
                }else{
                    //[.....]
                }
            }

        });

function setPopup(polygon,neighborhood){
    var colorInterpolateCrime = d3.scale.linear()
                .domain([0, Math.floor(safetyScale(averageCrimeRating)), 100])
                .range(['#d73027', '#fee08b', '#1a9850'])
                .interpolate(d3.interpolateHcl);

    var colorInterpolateWalkScore = d3.scale.linear()
                .domain([0, Math.floor(averageWalkScore), 100])
                .range(['#d73027', '#fee08b', '#1a9850'])
                .interpolate(d3.interpolateHcl);

    var contentString = '<div id="content">'+
                        '<h1 id="firstHeading" class="firstHeading">'+ neighborhood.id +'</h1>'+
                        '<p style="font-size:25px;"><b>Safety Rating: </b> <span style="color:' + colorInterpolateCrime(Math.floor(safetyScale(neighborhood.crimeRating))) + ';">' + Math.floor(safetyScale(neighborhood.crimeRating)) + '</span></p>' +
                        '<p style="font-size:25px;"><b>Convenience Rating: </b> <span style="color:' + colorInterpolateWalkScore(Math.floor(neighborhood.averageWalkScore)) + ';">' + Math.floor(neighborhood.averageWalkScore) + '</span></p>' +
                        '</div>';

    var infowindow = new google.maps.InfoWindow({
            minWidth:150, 
            maxWidth:400,
            content: contentString
        });

    var heatmap = new google.maps.visualization.HeatmapLayer({
          radius: 25,
          dissipating: true,
          gradient: ["rgba(255, 255, 255,0)","rgb(235, 250, 235)", "rgb(173, 235, 173)", "rgb(111, 220, 111)", "rgb(50, 205, 50)", "rgb(35, 144, 35)"]
        });

    var marker=new google.maps.Marker({
            title: name,
            position: polygon.getApproximateCenter(),
            map: map,
            icon: "../images/transparent-square-tiles.png"             
        });     

    google.maps.event.addListener(polygon,"mouseover",function() {                                
       // infowindow.open(map,marker);
       $('#info-window').empty();
       $('#info-window').append("<p></p><p></p>");
       $('#info-window').append(contentString);
       displayScatterPlot(neighborhood);
    });

    google.maps.event.addListener(polygon,"mouseout",function() {
        infowindow.close(map,marker);
    });

    google.maps.event.addListener(map, 'center_changed', function() {
        resetMap();
    });

    google.maps.event.addListener(map, 'zoom_changed', function() {
        //zoomLevel = map.getZoom();
        resetMap();
    });

    function resetMap(){
        if(currentPolygon != "undefined"){
            //console.log(neighborhood);
            var val = currentNeighborhood.value;
            var colorScale = d3.scale.linear().range([0,255]).domain([1,100]);
            var crimeScale = d3.scale.linear().range([0,500]).domain([0,159.4]);
            var color = "rgb(" + Math.floor(colorScale(val)) + ",255," + Math.floor(colorScale(val)) + ")";
            currentPolygon.setOptions({fillColor: color, strokeColor: "#000000", fillOpacity: 0.8, strokeWidth: 10});
            currentHeapMap.setMap(null);
            currentPolygon = "undefined";
        }
    }


    google.maps.event.addListener(polygon, 'click', function() {
        this.getMap().setCenter(this.getApproximateCenter());
        this.getMap().setZoom(14);
        currentPolygon = polygon;
        currentNeighborhood = neighborhood;
        console.log(neighborhood);
        isZoomed = true;
        infowindow.close(map,marker);
        this.setOptions({fillColor: "#000", strokeColor: "#000000", fillOpacity: 0, strokeWidth: 20});
        if (typeof(neighborhood.allListings) !== 'undefined'){
            let heatMapData = [];
            for (var i = 0; i < neighborhood.allListings.length; i++) {
                let index = neighborhood.allListings[i];
                heatMapData.push({location:new google.maps.LatLng(listings[index].lat, listings[index].long), weight: listings[index].walkScore});
            }
            heatmap.setData(heatMapData);               
            heatmap.setMap(map);
            currentHeapMap = heatmap;
        }
        $('#info-window').empty();
        $('#info-window').append("<p></p><p></p>");
        $('#info-window').append(contentString);
        displayScatterPlot(neighborhood);
    });
}

function displayScatterPlot(neighborhood){
    d3.select('p').remove();
    d3.select('p').remove();
    d3.select('svg').remove();
    d3.select('svg').remove();

    var colorInterpolateCrime = d3.scale.linear()
                .domain([0, Math.floor(safetyScale(averageCrimeRating)), 100])
                .range(['#d73027', '#fee08b', '#1a9850'])
                .interpolate(d3.interpolateHcl);

    var colorInterpolateWalkScore = d3.scale.linear()
                .domain([0, Math.floor(averageWalkScore), 100])
                .range(['#d73027', '#fee08b', '#1a9850'])
                .interpolate(d3.interpolateHcl);

// crime rating
    var fixY = 10;
    var avglineX = Math.floor(safetyScale(averageCrimeRating));
    var allData = [];
    for(var i = 0; i < neighborhoods.length; i++){
        allData.push(Math.floor(safetyScale(neighborhoods[i].crimeRating)));
    }
    var data = [Math.floor(safetyScale(neighborhood.crimeRating))];
    // console.log("avglineX" + avglineX);

    var margin = {top: 20, right: 20, bottom: 50, left: 20};
    var width = 400 - margin.left - margin.right;
    var height = 120 - margin.top - margin.bottom;
    var x = d3.scale.linear()
              .domain([0, 100])
              .range([ 0, width ]);
    
    var y = d3.scale.linear()
            .domain([0, fixY])
            .range([ height, 0 ]);
    

    var chart = d3.select("#info-graphs1")
                  .append('svg')
                  .attr('width', width + margin.right + margin.left)
                  .attr('height', height + margin.top + margin.bottom)
                  .attr('class', 'chart')
    var main = chart.append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('class', 'main')
    // draw the x axis
    var xAxis = d3.svg.axis()
                      .scale(x)
                      .orient('bottom');

    main.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'main axis date')
        .call(xAxis);

    // draw the y axis
    // var yAxis = d3.svg.axis()
    //                   .scale(y)
    //                   .orient('left');

    main.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'main axis date')
        // .call(yAxis);

    var g = main.append("svg:g"); 
    
    
    g.selectAll("scatter-dots")
      .data(allData)
      .enter().append("svg:circle")
      .attr("cx", function (d) { return x(d); } )
      .attr("cy", fixY)
      .attr("r", 8)
      .style("fill", function(d) {
          return "rgba(125,125,125,0.1)";
      });

    g.selectAll("scatter-dots")
      .data(data)
      .enter().append("svg:circle")
      .attr("cx", function (d) { return x(d); } )
      .attr("cy", fixY)
      .attr("r", 8)
      .attr("stroke-width", 1)
      .attr("stroke", "#000000")
      .style("fill", function(d) {
          return colorInterpolateCrime(d);
      });
    var lineData = [{xcoord:x(avglineX),ycoord:5},{xcoord:x(avglineX),ycoord: (height+margin.bottom)}];

    var line = d3.svg.line()
                 .x(function(d) {
                      return d.xcoord;
                  })
                  .y(function(d) {
                  return d.ycoord;
                  });



    g.append('path')
     .attr({
        'd': line(lineData),
        'y': 0,
        'stroke': '#000',
        'stroke-width': '2px',
        'fill': 'none'
     });

    g.append("rect")
        .attr("x", function() { return lineData[0].xcoord - 50 ; })
        .attr("y", function() { return height + 30 ; })
        .attr("width", 100)
        .attr("height", 20)
        .attr("fill", "rgb(125,125,125)");

    g.append("text")
    .attr("x", function() { return lineData[0].xcoord; })
    .attr("y", function() { return height + 40 ; })
    .attr("dy", ".35em")
    .style("fill", "#fff")
    .attr("text-anchor", "middle")
    .text("City Average");


// walkscore
    var fixY = 10;
    var avglineX = averageWalkScore;
    // console.log("avglineX" + avglineX);
    var allData = []
    for(var i = 0; i < neighborhoods.length; i++){
        allData.push(neighborhoods[i].averageWalkScore);
    }
    var data = [neighborhood.averageWalkScore];
    var margin = {top: 20, right: 20, bottom: 50, left: 20};
    var width = 400 - margin.left - margin.right;
    var height = 120 - margin.top - margin.bottom;
    var x = d3.scale.linear()
              .domain([0, 100])
              .range([ 0, width ]);
    
    var y = d3.scale.linear()
            .domain([0, fixY])
            .range([ height, 0 ]);
 
    var chart = d3.select("#info-graphs2")
                  .append('svg')
                  .attr('width', width + margin.right + margin.left)
                  .attr('height', height + margin.top + margin.bottom)
                  .attr('class', 'chart')
    var main = chart.append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('class', 'main')
    // draw the x axis
    var xAxis = d3.svg.axis()
                      .scale(x)
                      .orient('bottom');

    main.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'main axis date')
        .call(xAxis);

    // draw the y axis
    // var yAxis = d3.svg.axis()
    //                   .scale(y)
    //                   .orient('left');

    main.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'main axis date')
        // .call(yAxis);

    var g = main.append("svg:g"); 
    
    g.selectAll("scatter-dots")
      .data(allData)
      .enter().append("svg:circle")
      .attr("cx", function (d) { return x(d); } )
      .attr("cy", fixY)
      .attr("r", 8)
      .style("fill", function(d) {
          return "rgba(125,125,125,0.1)";
      });


    g.selectAll("scatter-dots")
      .data(data)
      .enter().append("svg:circle")
      .attr("cx", function (d) { return x(d); } )
      .attr("cy", fixY)
      .attr("r", 8)
      .attr("stroke-width", 1)
      .attr("stroke", "#000000")
      .style("fill", function(d) {
          return colorInterpolateWalkScore(d);
      });

    var lineData = [{xcoord:x(avglineX),ycoord:5},{xcoord:x(avglineX),ycoord:200}];

    var line = d3.svg.line()
                 .x(function(d) {
                      return d.xcoord;
                  })
                  .y(function(d) {
                  return d.ycoord;
                  });
    g.append('path')
     .attr({
        'd': line(lineData),
        'y': 0,
        'stroke': '#000',
        'stroke-width': '2px',
        'fill': 'none'
     });

      g.append("rect")
        .attr("x", function() { return lineData[0].xcoord - 50 ; })
        .attr("y", function() { return height + 30 ; })
        .attr("width", 100)
        .attr("height", 20)
        .attr("fill", "rgb(125,125,125)");

    g.append("text")
    .attr("x", function() { return lineData[0].xcoord; })
    .attr("y", function() { return height + 40 ; })
    .attr("dy", ".35em")
    .style("fill", "#fff")
    .attr("text-anchor", "middle")
    .text("City Average");
}

function zoomOut(){
    console.log("click");  
    isZoomed = false;
    map.setZoom(12);
}

function initialize(){
    loadData();
}

function loadData(){
    // Load the listings data.
    // assign listing ids to each neighborhood : call neighborhood.setAllListings()
    // assign walk scores to each listing -  read score from json -Hung Wen 
    queue()
        .defer(d3.json, "data/listings_all.json")
        .defer(d3.json, "data/score.json")
        .defer(d3.json, "data/ratings.json")
        .await(ready);

    function ready(error, datalistings, dataScore, ratings) {
        if (error) throw error;
        //TODO: parse listings data and populate listings array 
        ratingsData = ratings;
        var tempCrimeSum = 0;
        var tempWalkSum = 0;
        for (var i = 0; i < ratingsData.length; i++){
            ratingsData[i].name = camelize(ratingsData[i].name);
            tempCrimeSum += ratingsData[i]["Crime_Rating"];
            tempWalkSum += ratingsData[i]["Walk Score"];
        }
        averageCrimeRating = Math.floor(tempCrimeSum / ratingsData.length);
        averageWalkScore = Math.floor(tempWalkSum / ratingsData.length);


        for (i = 0; i < datalistings.length; i++) { 
            let lat = datalistings[i].latitude;
            let lon = datalistings[i].longitude;
            let address = datalistings[i].street;
            let room_type = datalistings[i].room_type;
            let list = new Listings();
            if (room_type === "Entire home/apt") {
              datalistings[i].room_type = 2;
            } else if (room_type === "Private room") {
              datalistings[i].room_type = 1;
            } else {
              datalistings[i].room_type = 0;
            }
            if (hashMap.has(camelize(datalistings[i].neighbourhood_cleansed))) {
                hashMap.get(camelize(datalistings[i].neighbourhood_cleansed)).push(i);
            } else {
                var element = [];
                element.push(i);
                hashMap.set(camelize(datalistings[i].neighbourhood_cleansed), element);
            }
            list.createListing(datalistings[i].id, datalistings[i].name, datalistings[i].latitude, datalistings[i].longitude, datalistings[i].room_type, datalistings[i].price, datalistings[i].street);
            list.walkScore = calculateScale(dataScore[i], inputWalkScoreRange, outputWalkScoreRange);
           // list.walkScore = dataScore[i];
            listings.push(list);

        }

        neighborhoodParser.parse('/airbnbNeighborhood/data/neighborhoods2.kml');
    }


    // Load the metro data.
    d3.json("data/Chicago_Metro_Stop_Data.json", function(error, data) {
        if (error) throw error;

      
    });
}

function calculateScale(input, inputDomain, outputRange){
    //helper function to scale values 
    var inputDiff = inputDomain.max - inputDomain.min;
    var outputDiff = outputRange.max - outputRange.min;
    if ((input - inputDomain.min) == 0) {
      return (outputRange.min);
    }
    return (input - inputDomain.min) / inputDiff * outputDiff + outputRange.min
}


//call initialize
initialize();


function displayListings(allListings){
    let data = [];
    var colorScale = d3.scale.linear().range([0,255]).domain([1,100]);
    for (var i = 0; i < allListings.length; i++) {
        let index = allListings[i];
        data.push({lat : listings[index].lat, lng: listings[index].long, walkScore: listings[index].walkScore});
    }

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
              .attr("r", 3.5)
              .attr("cx", padding)
              .attr("cy", padding);

          // Add a label.
          // marker.append("text")
          //     .attr("x", padding + 7)
          //     .attr("y", padding)
          //     .attr("dy", ".31em")
          //     .text(function(d) { return d.key; });

          function transform(d) {
            // console.log(d);
            d = new google.maps.LatLng(d.value.lat, d.value.lng);
            d = projection.fromLatLngToDivPixel(d);
            //console.log("rgb(" + Math.floor(colorScale(d.walkScore)) + "," + Math.floor(colorScale(d.walkScore)) + ",255)");
            //console.log(d.value);
           // var colorRGB = "rgb(" + Math.floor(colorScale(d.value.walkScore)) + "," + Math.floor(colorScale(d.value.walkScore)) + ",255)";
            return d3.select(this)
                .style("left", (d.x - padding) + "px")
                .style("top", (d.y - padding) + "px")
                //.attr("fill", colorRGB);
          }
        };
      };

      // Bind our overlay to the map…
      overlay.setMap(map);
}


function displayMetros(data){
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
}


function displayHeatMap(allListings){
    if (typeof(allListings) !== 'undefined'){
        let heatMapData = [];
        for (var i = 0; i < allListings.length; i++) {
            let index = allListings[i];
            heatMapData.push({location:new google.maps.LatLng(listings[index].lat, listings[index].long), weight: listings[index].walkScore});
        }
        var heatmap = new google.maps.visualization.HeatmapLayer({
          data: heatMapData,
          radius: 30,
          gradient: ["rgba(255, 255, 255,0)","rgb(235, 250, 235)", "rgb(173, 235, 173)", "rgb(111, 220, 111)", "rgb(50, 205, 50)", "rgb(35, 144, 35)"]
        });
        heatmap.setMap(map);
    }
}

function getByValue(arr, value) {

  for (var i=0, iLen=arr.length; i<iLen; i++) {

    if (arr[i].name == value) return arr[i];
  }
}


function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
