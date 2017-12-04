(function(undefined){

    d3.svg.rangeSlider = function(){
        "use strict";

        var validEvents = ["change", "slide"];

        var range = [0, 100],
            values = [0, 100],
            displayValues = [0,100],
            colors = ["#f9f9f9","#cccccc"],
            margin = {top: 5, bottom: 5, right: 5, left:12},
            height = 30,
            width = 360,
            tickSize = 5,
            tickValues,
            tickFormat,
            ticks = 10,
            minInterval = 1;
            //stepValues = Array.apply(null, {length: 101}).map(Number.call, Number);
           // stepValues = [10,20,30,40,50,60,70,80,90,100];

        var eventListeners = {
            "slide" : [],
            "change": []
        };


        function slider(g) {
            g.each(function(){
                var svg = d3.select(this);

                var g = svg.append('g');

                var w = width - margin.left - margin.right,
                    h = height - margin.top - margin.bottom;

                g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var scale = d3.scale.linear().domain(range).range([0, w]);

                var background = g.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", w)
                    .attr("height", h)
                    .attr("fill", colors[0]);

                var rangeRect = g.append("rect")
                    .attr("x", scale(values[0]))
                    .attr("y", 0)
                    .attr("width", scale(values[1])-scale(values[0]))
                    .attr("height", h)
                    .attr("fill", colors[1]);

                //left handle
                var leftHandle = g.append("circle")
                    .attr("cx", scale(values[0]))
                    .attr("cy", h/2)
                    .attr("r", h/2)
                    .attr("fill", "white")
                    .attr("stroke", "black")
                    .attr('cursor','pointer');

                var rightHandle = g.append("circle")
                    .attr("cx", scale(values[1]) )
                    .attr("cy", h/2)
                    .attr("r", h/2)
                    .attr("fill", "white")
                    .attr("stroke", "black");

                // Axis
                var axis = d3.svg.axis()
                    .scale(scale)
                    .orient("bottom");

                if (ticks !== 0) {
                    axis.ticks(ticks);
                    axis.tickSize(tickSize);
                }
                else if (tickValues) {
                    axis.tickValues(tickValues);
                    axis.tickSize(tickSize);
                }
                else {
                    axis.ticks(0);
                    axis.tickSize(0);
                }
                if (tickFormat) {
                    axis.tickFormat(tickFormat);
                }

                g.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + h + ")")
                    .call(axis);

                var leftDrag = d3.behavior.drag(),
                    rightDrag = d3.behavior.drag(),
                    rangeDrag = d3.behavior.drag();



                leftDrag.on("drag", function(){
                    var currentX = +leftHandle.attr("cx");
                    var newX = currentX + d3.event.dx;
                    if (scale.invert(newX) < range[0]) {
                        values[0] = range[0];
                    }else if((values[1] - scale.invert(newX)) < minInterval){
                        values[0] = values[0];
                    } else if (scale.invert(newX + h/2) < values[1] ) {
                        values[0] = scale.invert(newX);
                        displayValues = values.slice();
                        displayValues = [Math.round(displayValues[0]),Math.round(displayValues[1])];
                        callEventListeners("slide", { handle: "left" });
                    }
                    redraw();
                    })
                    .on("dragend", function(){
                        callEventListeners("change", { handle: "left" });
                    });

                leftHandle.call(leftDrag);

                rightDrag.on("drag", function(){
                    var currentX = +rightHandle.attr("cx");

                    var newX = currentX + d3.event.dx;

                    if (scale.invert(newX) > range[1]) {
                        values[1] = range[1];
                    }else if((scale.invert(newX) - values[0]) < minInterval){
                        values[1] = values[1];
                    } else if (scale.invert(newX) > values[0] ){
                        values[1] = scale.invert(newX);
                        displayValues = values.slice();
                        displayValues = [Math.round(displayValues[0]),Math.round(displayValues[1])];
                        callEventListeners("slide", { handle: "right" });
                    }
                    redraw();
                    })
                    .on("dragend", function(){
                        callEventListeners("change", { handle: "right" });
                    });

                rightHandle.call(rightDrag);

                rangeDrag.on("drag", function(){
                    var currentLeftX = +leftHandle.attr("cx");
                    var newLeftX = currentLeftX + d3.event.dx;

                    var currentRightX = +rightHandle.attr("cx");
                    var newRightX = currentRightX + d3.event.dx;

                    if (scale.invert(newLeftX) >= range[0] && scale.invert(newRightX) <= range[1]) {
                        values[0] = scale.invert(newLeftX);
                        values[1] = scale.invert(newRightX);
                        displayValues = values.slice();
                        displayValues = [Math.round(displayValues[0]),Math.round(displayValues[1])];
                        callEventListeners("slide", { handle: "range" });
                    }
                    redraw();
                })
                    .on("dragend", function(){
                        callEventListeners("change", { handle: "range" });
                    });
                rangeRect.call(rangeDrag);

                function callEventListeners(event, params){
                    var listeners = eventListeners[event];
                    for(var i in listeners){
                        listeners[i](event, params);
                    }
                }

                //  this function redraws the slider
                function redraw(){
                    rightHandle.attr("cx", scale(values[1]));
                    leftHandle.attr("cx", scale(values[0]));
                    rangeRect.attr("x", scale(values[0])).attr("width", scale(values[1]) - scale(values[0]));
                }
            });
        }

        slider.on = function(event, listener) {
            if(!event || !arrayContains(validEvents, event)){
                throw new Error(event + " is not a valid range slider event. It should be one of " + validEvents);
            }
            eventListeners[event].push(listener);
            return slider;
        }

        slider.range = function(x) {
            if(!arguments.length) {return range;}
            range = x;
            return slider;
        }

        slider.values = function(x){
            if(!arguments.length) {return values;}
            values = x;
            displayValues = values;
            return slider;
        }

        slider.displayValues = function(x){
            if(!arguments.length) {return displayValues;}
            displayValues = x;
            return slider;
        }

        slider.height = function(x){
            if(!arguments.length) {return height;}
            height = x;
            return slider;
        }

        slider.width = function(x){
            if(!arguments.length) {return width;}
            width = x;
            return slider;
        }

        slider.colors = function(x){
            if(!arguments.length) {return colors;}
            colors = x;
            return slider;
        }

        slider.tickFormat = function(_) {
            if (!arguments.length) return tickFormat;
            tickFormat = _;
            return slider;
        }

        slider.tickValues = function(_) {
            if (!arguments.length) return tickValues;
            tickValues = _;
            return slider;
        }

        slider.minInterval = function(_) {
            if (!arguments.length) return minInterval;
            minInterval = _;
            return slider;
        }

        slider.stepSize = function(_) {
            if (!arguments.length) return stepSize;
            stepSize = _;
            return slider;
        }

        return slider;
    };

    // utility functions
    /**
     * Checks if an array contains a value
     * @param  {[type]} array [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    function arrayContains(array, value) {
        for(var i in array){
            if (array[i] === value){
                return true;
            }
        }
        return false;
    }
})(undefined);