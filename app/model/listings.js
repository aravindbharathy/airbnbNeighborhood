//sample model
function Population(){
    "use strict";

    this.dimensions = [];
    this.dimensionsName = [];
    this.rawData = {};
    this.completePopulation = [];
    this.filteredPopulation = [];
    this.demographicData = [];
    this.accommodated = [];
    this.countByDemographic = {male: 0, female: 0, manual: 0, power: 0, scooter: 0};
    this.countByAccommodation = {male: 0, female: 0, manual: 0, power: 0, scooter: 0};
    this.demographicFilterFlags = {
        manual: true,
        power: true,
        scooter: true,
        male: true,
        female: true,
        ageMin: 18,
        ageMax: 100,
        validMin: 18,
        validMax: 100
    };
    this.statistic = {};
    this.accommodationPercentiles = {total:0 ,male: 0, female: 0, manual: 0, power: 0, scooter: 0};

    //BLOCK: setters

    //create a population with PERSON as the base entity using Raw Data
    this.createPopulation = function () {
        for (var i = 0; i < this.rawData[this.dimensions[0]].length; ++i) {
            var newPerson = {};
            newPerson['id'] = this.rawData[this.dimensions[0]][i].part_id;
            for (var j = 0; j < this.dimensions.length; ++j){
                //TODO check for greatest dist in KTC
                newPerson[this.dimensionsName[j]] = this.rawData[this.dimensions[j]][i].dist;
            }
            this.completePopulation.push(newPerson);
        }
        this.filteredPopulation = this.completePopulation.slice();
        //update counts and statistics
        this.updateDemographicCounts();
        this.calculateStatistic();
    };

    //set or update the selected population based on filter flags
    this.updatePopulation = function (changes) {
        //change the flags based on the changes
        for (var key in changes) {
            if (this.demographicFilterFlags.hasOwnProperty(key)) {
                this.demographicFilterFlags[key] = changes[key];
            }
        }
        //create a new filtered population
        var validIds = this.filterPopulation();
        this.filteredPopulation = [];
        for (var i = 0; i < validIds.length; i++) {
            this.filteredPopulation.push(this.completePopulation[parseInt(validIds[i]) - 1]);
        }

        //update counts and statistics
        this.updateDemographicCounts();
        this.calculateStatistic();
        this.calculateAccommodationPercentiles();
    };

    this.changeUnit = function (newUnit) {
        return 0;
    };

    this.calculateAccommodationPercentiles = function () {
        var totalPopulation = 0,
            totalAccommodated = 0;
        for(var key in this.countByDemographic) {
            if (this.countByDemographic.hasOwnProperty(key)) {
                totalPopulation += this.countByDemographic[key];
                totalAccommodated += this.countByAccommodation[key];
                this.accommodationPercentiles[key] = (this.countByAccommodation[key] / parseFloat(this.countByDemographic[key]) * 100).toFixed(2);
            }
        }
        if(totalAccommodated === 0 || totalPopulation === 0){
            this.accommodationPercentiles.total = 0;
        }
        else{
            this.accommodationPercentiles.total = (totalAccommodated / parseFloat(totalPopulation) * 100).toFixed(2);
        }
    };

    //BLOCK: getters

    //BLOCK: utility functions

    this.filterPopulation = function () {
        var filteredIds = this.demographicData.filter(this.isPersonValid.bind(this));
        for (var i = 0; i < filteredIds.length; i++) {
            filteredIds[i] = filteredIds[i]['Participant_ID'];
        }
        return filteredIds;
    };

    //checks the person's demographic against the selected demographic
    this.isPersonValid = function (person) {
        if (person.Gender === "1" && !this.demographicFilterFlags.male){ return false; }
        if (person.Gender === "2" && !this.demographicFilterFlags.female) { return false; }
        if (person.WheelChair_Type === "1" && !this.demographicFilterFlags.manual) { return false; }
        if (person.WheelChair_Type === "2" && !this.demographicFilterFlags.power) { return false; }
        if (person.WheelChair_Type === "3" && !this.demographicFilterFlags.scooter) { return false; }
        if (person.Age < this.demographicFilterFlags.ageMin || person.Age > this.demographicFilterFlags.ageMax) { return false; }
        if (person.Age < this.demographicFilterFlags.validMin || person.Age > this.demographicFilterFlags.validMax) { return false; }
        return true;
    };

    this.updateDemographicCounts = function () {
        this.filteredPopulation.forEach(function (d, i) {
            var participant = this.demographicData[d.id - 1];
            switch (participant.Gender) {
                case "1":
                    this.countByDemographic.female += 1;
                    break;
                case "2":
                    this.countByDemographic.male += 1;
                    break;
            }
            switch (participant.WheelChair_Type) {
                case "1":
                    this.countByDemographic.manual += 1;
                    break;
                case "2":
                    this.countByDemographic.power += 1;
                    break;
                case "3":
                    this.countByDemographic.scooter += 1;
                    break;
            }
        }.bind(this));
    };

    this.calculateStatistic = function () {
        this.dimensionsName.forEach(function (d) {
            var allDimensionData = [],
                filteredDimensionData = [];
            this.statistic[d] = {
                count: {}, mean : {}, sd : {}, min: {}, max: {}
            };
            for(var i = 0; i < this.completePopulation.length; i++){
                allDimensionData.push(this.completePopulation[i][d]);
            }
            for(i = 0; i < this.filteredPopulation.length; i++){
                filteredDimensionData.push(this.filteredPopulation[i][d]);
            }
            allDimensionData.sort(this.customSort);
            filteredDimensionData.sort(this.customSort);

            this.statistic[d]['count']['total'] = allDimensionData.length;
            this.statistic[d]['count']['selected'] = filteredDimensionData.length;
            this.statistic[d]['mean']['total'] = (Math.round(d3.mean(allDimensionData) * 10) / 10).toFixed(1);
            this.statistic[d]['mean']['selected'] = (Math.round(d3.mean(filteredDimensionData) * 10) / 10).toFixed(1);
            this.statistic[d]['sd']['total'] = (Math.round(d3.deviation(allDimensionData) * 10) / 10).toFixed(1);
            this.statistic[d]['sd']['selected'] = (Math.round(d3.deviation(filteredDimensionData) * 10) / 10).toFixed(1);
            this.statistic[d]['min']['total'] = (Math.round(allDimensionData[0] * 10) / 10).toFixed(1);
            this.statistic[d]['max']['total'] = (Math.round(allDimensionData[allDimensionData.length - 1] * 10) / 10).toFixed(1);
            this.statistic[d]['min']['selected'] = (Math.round(filteredDimensionData[0] * 10) / 10).toFixed(1);
            this.statistic[d]['max']['selected'] = (Math.round(filteredDimensionData[filteredDimensionData.length - 1] * 10) / 10).toFixed(1);

        }.bind(this));

        return 0;
    };

    this.customSort = function (a,b) {
        return ((a < b) ? -1 : ((a === b) ? 0 : 1));
    };
}