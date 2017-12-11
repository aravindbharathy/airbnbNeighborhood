//sample model
function Neighborhood(polygon,id,name,value){
    "use strict";
    
    this.polygon = polygon;
    this.id = id;
    this.name = name;
    this.value = value;
    this.allListings = []; //array of listing ids
    this.crimeData = "";
    this.metroStops = []; //[{lat: 22.33, long: 23.33},{lat: 22.33, long: 23.33}]
    this.averageWalkScore = 0;
    this.crimeRating = 0;

    //constructor

    //BLOCK: setters
    this.setAllListings = function (listings) { 
        this.allListings = listings;
    };

    this.setCrimeData = function(){

    }

    this.setValue = function(x){
        this.value = x;
    }

    this.setMetroStops = function(){

    }

    this.setAverageWalkScore = function(x){
        this.averageWalkScore = x;
    }

    this.setCrimeRating = function(x){
        this.crimeRating = x;
    }

    //BLOCK: getters

    this.getAllListings = function () {
        return this.allListings;
    };

    this.getCrimeData = function(){
        return this.crimeData;
    }

    this.getMetroStops = function(){
        return this.metroStops;
    }


    //BLOCK: utility functions

}