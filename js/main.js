var MOBILE_THRESHOLD = 600,
isMobile = false,
$graphic = $("#graphic")
step = 1;


function buttonStyle(step) {

    d3.selectAll(".button.num").classed("greyed", true);
    d3.select(".button.b" + step).classed("greyed", false);

    if (step == 1) {
        d3.select("#btnprev").classed("greyed", true);
    } else if (step != 1) {
        d3.select("#btnprev").classed("greyed", false);
    }
    if (step == 6) {
        d3.select("#btnnext").classed("greyed", true);
    } else if (step != 6) {
        d3.select("#btnnext").classed("greyed", false);
    }

}

function wrapText(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}


buttonStyle(1);

function drawLineGraph(container_width) {

   
  d3.csv("data/step-data.csv", function(data) {
      data.forEach(function(d) {
        d.year = +d.year;
        d.actual = +d.actual;
        d.synthetic = +d.synthetic;
      })
    //FILTER DATA FOR STEPS 1-3

    var dataset1a = data.filter(function(d) { 
        return d.figure == "8a"; //DATA UP TO 2000
    })
    var dataset1b = data.filter(function(d) {
      return d.figure == "8b"; //DATA UP TO 2008
    })
    console.log(dataset1b)
    var dataset1c = dataset1b.filter(function(d) {
      return d.year > 1999; //DATA FROM 2000-2008
    })
    console.log(dataset1c)
    //FILTER DATA FOR STEPS 4-5
    var dataset2a = data.filter(function(d) { 
        return d.figure == 19;
    })
    var dataset2b = dataset2a.filter(function(d) { 
        return d.year > 2007; //DATA FROM 2008-2015
    })
    //FILTER DATA FOR STEP 6

    var dataset3 = data.filter(function(d) { //FULL DATA 
        return d.figure == 24;
    })

    if (container_width == undefined || isNaN(container_width)) {
        container_width = 1170;
    }
    var padding = 20;

    if (container_width <= MOBILE_THRESHOLD) {
        isMobile = true;
        var chart_aspect_height = 1.75;
        var margin = {
            top: 125,
            right: 20,
            bottom: 15,
            left: 60
        };
        var width = container_width - margin.left - margin.right,
            height = Math.min(500, (Math.ceil(width * chart_aspect_height))) - margin.top - margin.bottom - padding;
    } else {
        isMobile = false;
        var chart_aspect_height = 0.7;
        var margin = {
            top: 80,
            right: 60,
            bottom: 15,
            left: 40
        };
        var width = container_width - margin.left - margin.right,
            height = Math.ceil(Math.max(350, width * chart_aspect_height)) - margin.top - margin.bottom - padding;
            console.log(width)
    }

    $graphic.empty();
    //MAKE LINE GRAPH
    var svg = d3.select("#graphic").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + padding)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // Set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().rangeRound([height, 0]);
    // Define actual and synthetic lines
    var lineActual = d3.line()
      .x(function(d) { return x(d.year); })
      .y(function(d) { return y(d.actual); });
    var lineSynthetic = d3.line()
      .x(function(d) { return x(d.year); })
      .y(function(d) { return y(d.synthetic); });
    x.domain(d3.extent(dataset1a, function(d) { return d.year; }));
    y.domain([0, .5]);


    svg.append("text")
      .attr("x", width/3)
      .attr("y", height/2)
      .text("step1 text: Lorem ipsum dolor sit amet, omnes quidam per ei, mutat commune sed ex. Graeco moderatius sea et. ")
      .attr("dy", 0)
      .attr("class", "step-text step1-text")
      .call(wrapText, 170)

    function make_y_gridlines() {   
    return d3.axisLeft(y)
    }
    svg.append("g")
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      )
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .tickFormat(d3.format(""))
      )
      .attr("class", "x-axis")

    svg.append("g")
      .call(d3.axisLeft(y))
      .attr("class", "y-axis")
      .append("text")
      .attr("fill", "#000")
      .attr("x", 5)
      .attr("y", -20)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .attr("class", "y-axis-label")
      .text("Percent");

    svg.append("path")
      .datum(dataset1a)
      .attr("fill", "none")
      .attr("stroke", "#154b7c")
      .style("stroke-width", "1.5px")
      .attr("d", lineActual)
      .attr("class", "line line-actual");
  
    d3.select('#btnnext')
      .on("click", function () {
          changeStep("next");
      });

    d3.select('#btnprev')
      .on("click", function () {
          changeStep("prev");
      });

    var actualG = svg.append("g")
      .attr("class", "actual-label")
      .attr("transform", function() { console.log(((dataset1a)))
        return "translate("+(width)+","+ y((dataset1a)[18]["actual"])+")"
      })
      .append("text")
      .text("Actual")

    //when changing the step, change the graph
    function changeStep(direction){
      if (direction == "next"){
        step = step < 6 ? step + 1 : step;
        console.log(step)
      }else if (direction == "prev") {
        step = step > 1 ? step - 1 : step;
        console.log(step)
      }
      buttonStyle(step);
      switch(step){
      case 1:
        step1(direction);
        break;
      case 2:
        step2(direction);
        break;
      case 3:
        step3(direction);
        break;
      case 4:
        step4(direction);
        break;
      case 5:
        step5(direction);
        break;
      case 6:
        step6(direction);
        break;      
      }

    }

    function step1(direction) {
      console.log('step1')
      if (direction == "next"){

      }else if (direction == "prev"){
        x.domain(d3.extent(dataset1a, function(d) { return d.year; }));
        y.domain([0, .5]);
        d3.selectAll("#graphic .y-axis")
          .transition()
          .duration(1800)
          .call(d3.axisLeft(y))
        d3.select(".line-synthetic")
          .transition()
          .duration(500)
          .remove()
        d3.select(".line-actual")
          .transition()
          .duration(1800)
          .attr("d", lineActual(dataset1a))
        d3.selectAll(".step2-text, .synthetic-label")
          .transition()
          .duration(1000)
          .style("opacity", 0)
          .remove()
      }

    }

    function step2(direction) {
      console.log('step2')
      if (direction == "next"){
      svg.append("text")
        .attr("x", width/1.5)
        .attr("y", height/6)
        .text("step2 text: Lorem ipsum dolor sit amet, omnes quidam per ei, mutat commune sed ex. Graeco moderatius sea et. ")
        .attr("dy", 0)
        .attr("class", "step-text step2-text")
        .call(wrapText, 170)
        .style("opacity", 0)
        .transition()
        .delay(1800)
        .duration(1000)
        .style("opacity", 1)

      //ADD SYNTHETIC LINE
      var path = d3.select("#graphic svg g").append("path")
        .datum(dataset1a)
        .attr("fill", "none")
        .attr("stroke", "#f0583f")
        .style("stroke-width", "1.5px")
        .attr("d", lineSynthetic)
        .attr("class", "line line-synthetic");

      var totalLength = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", totalLength + ", " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1800)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
      var synG = svg.append("g")
        .attr("class", "synthetic-label")
        .attr("transform", function() { console.log(((dataset1a)))
          return "translate("+(width)+","+ y((dataset1a)[18]["synthetic"])+")"
        })
      synG.append("text")
        .attr("transform", "translate(0,"+ 10+")")
        .text("Synthetic")
        .style("opacity", 0)
        .transition()
        .delay(1800)
        .duration(1000)
        .style("opacity", 1)

      }else if (direction == "prev"){
        console.log('prev')
        d3.select(".step3-text")
          .transition()
          .duration(1000)
          .style("opacity", 0)
          .remove()
        svg.append("text")
          .attr("x", width/3)
          .attr("y", height/2)
          .text("step1 text: Lorem ipsum dolor sit amet, omnes quidam per ei, mutat commune sed ex. Graeco moderatius sea et. ")
          .attr("dy", 0)
          .attr("class", "step-text step1-text")
          .call(wrapText, 170)
          .style("opacity", 0)
          .transition()
          .delay(1000)
          .duration(1000)
          .style("opacity", 1)
        svg.append("text")
          .attr("x", width/1.5)
          .attr("y", height/6)
          .text("step2 text: Lorem ipsum dolor sit amet, omnes quidam per ei, mutat commune sed ex. Graeco moderatius sea et. ")
          .attr("dy", 0)
          .attr("class", "step-text step2-text")
          .call(wrapText, 170)
          .style("opacity", 0)
          .transition()
          .delay(1000)
          .duration(1000)
          .style("opacity", 1)

        d3.select("#graphic svg g")
          .data(dataset1a)
        x.domain(d3.extent(dataset1a, function(d) { return d.year; }));
        d3.selectAll(".line-actual-ext, .line-synthetic-ext")
          .transition()
          .duration(500)
          .remove()
        d3.select(".line-actual")
          .transition()
          .duration(1800)
          .attr("d", lineActual(dataset1a))
        d3.select(".line-synthetic")
          .attr("stroke-dasharray", "none")
          .transition()
          .duration(1800)
          .attr("d", lineSynthetic(dataset1a))
        d3.selectAll("#graphic .x-axis")
          .transition()
          .duration(1800)
          .call(d3.axisBottom(x)
            .tickFormat(d3.format(""))
          )
        d3.selectAll("#graphic .y-axis")
          .transition()
          .duration(1800)
          .call(d3.axisLeft(y))
      }
    }

    function step3(direction) {
      console.log('step3')
      if (direction == "next"){
        d3.selectAll(".step1-text, .step2-text, .actual-label, .synthetic-label")
          .transition()
          .duration(1000)
          .style("opacity", 0)
          .remove()
        svg.append("g")
          .attr("class", "actual-label")
          .attr("transform", function() { console.log(dataset1c)
            return "translate("+(width)+","+ y((dataset1c)[5]["actual"])+")"
          })
          .append("text")
          .text("Actual")
          .style("opacity", 0)
          .transition()
          .delay(2500)
          .duration(1000)
          .style("opacity", 1)
        svg.append("text")
          .attr("x", width/1.5)
          .attr("y", height/1.5)
          .text("step3 text: Lorem ipsum dolor sit amet, omnes quidam per ei, mutat commune sed ex. Graeco moderatius sea et. ")
          .attr("dy", 0)
          .attr("class", "step-text step3-text")
          .call(wrapText, 170)
          .style("opacity", 0)
          .transition()
          .delay(2500)
          .duration(1000)
          .style("opacity", 1)
        svg.append("g")
          .attr("class", "synthetic-label")
          .attr("transform", function() { console.log(dataset1c)
            return "translate("+(width)+","+ (5+ y((dataset1c)[8]["synthetic"]))+")"
          })
          .append("text")
          .text("Synthetic")
          .style("opacity", 0)
          .transition()
          .delay(2500)
          .duration(1000)
          .style("opacity", 1)
        d3.select("#graphic svg g")
          .data(dataset1b)
        x.domain(d3.extent(dataset1b, function(d) { return d.year; }));
        //Keep line data up to 2000
        d3.select(".line-actual")
          .transition()
          .duration(1800)
          .attr("d", lineActual(dataset1a))
        d3.select(".line-synthetic")
          .attr("stroke-dasharray", "none")
          .transition()
          .duration(1800)
          .attr("d", lineSynthetic(dataset1a))
        d3.selectAll("#graphic .x-axis")
          .transition()
          .duration(1800)
          .call(d3.axisBottom(x)
            .tickFormat(d3.format(""))
          )
        d3.selectAll("#graphic .y-axis")
          .transition()
          .duration(1800)
          .call(d3.axisLeft(y))
        // Add extended line from 2000-2008
        var syntheticExt = d3.select("#graphic svg g").append("path")
            .datum(dataset1c)
            .attr("fill", "none")
            .attr("stroke", "#f0583f")
            .style("stroke-width", "1.5px")
            .attr("d", lineSynthetic)
            .attr("class", "line line-synthetic-ext");
        var syntheticExtLength = syntheticExt.node().getTotalLength();
        syntheticExt
          .attr("stroke-dasharray", syntheticExtLength + ", " + syntheticExtLength)
          .attr("stroke-dashoffset", syntheticExtLength)
          .transition()
          .delay(1800)
          .duration(1000)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
        var actualExt = d3.select("#graphic svg g").append("path")
            .datum(dataset1c)
            .attr("fill", "none")
            .attr("stroke", "#154b7c")
            .style("stroke-width", "1.5px")
            .attr("d", lineActual)
            .attr("class", "line line-actual-ext");
        var actualExtLength = actualExt.node().getTotalLength();
        actualExt
          .attr("stroke-dasharray", actualExtLength + ", " + actualExtLength)
          .attr("stroke-dashoffset", actualExtLength)
          .transition()
          .delay(1800)
          .duration(1000)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
      }else if (direction == "prev"){
        var synG = svg.append("g")
          .attr("class", "synthetic-label")
          .attr("transform", function() { console.log(dataset1c)
            return "translate("+(width)+","+ y((dataset1c)[5]["synthetic"])+")"
          })
        synG.append("text")
          .attr("transform", "translate(0,"+ 10+")")
          .text("Synthetic")
          .style("opacity", 0)
          .transition()
          .delay(1800)
          .duration(1000)
          .style("opacity", 1)
        d3.selectAll(".step4-text, .actual-label")
          .transition()
          .duration(300)
          .style("opacity", 0)
          .remove()
        svg.append("g")
          .attr("class", "actual-label")
          .attr("transform", function() { console.log(dataset1c)
            return "translate("+(width)+","+ y((dataset1c)[7]["actual"])+")"
          })
          .append("text")
          .attr("transform", "translate(0,"+ 10+")")
          .text("Actual")
          .style("opacity", 0)
          .transition()
          .delay(1800)
          .duration(1000)
          .style("opacity", 1)
        svg.append("text")
          .attr("x", width/1.5)
          .attr("y", height/1.5)
          .text("step3 text: Lorem ipsum dolor sit amet, omnes quidam per ei, mutat commune sed ex. Graeco moderatius sea et. ")
          .attr("dy", 0)
          .attr("class", "step-text step3-text")
          .call(wrapText, 170)
          .style("opacity", 0)
          .transition()
          .delay(1800)
          .duration(1000)
          .style("opacity", 1)
        d3.select("#graphic svg g")
          .data(dataset1b)
        x.domain(d3.extent(dataset1b, function(d) { return d.year; }));
        d3.selectAll("#graphic .y-axis")
          .transition()
          .duration(1800)
          .call(d3.axisLeft(y))

        d3.select(".line-actual-ext2")
          .transition()
          .duration(300)
          .remove()
        x.domain(d3.extent(dataset1b, function(d) { return d.year; }));
        d3.selectAll("#graphic .x-axis")
          .transition()
          .duration(1800)
          .call(d3.axisBottom(x)
            .tickFormat(d3.format(""))
          )
        d3.select(".line-actual")
          .transition()
          .delay(300)
          .duration(1800)
          .attr("d", lineActual(dataset1a))
        d3.select(".line-actual-ext")
          .transition()
          .delay(300)
          .duration(1800)
          .attr("stroke-dasharray", "none")
          .attr("d", lineActual(dataset1c))
        var synthetic = d3.select("#graphic svg g")
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "#f0583f")
            .style("stroke-width", "1.5px")
            .attr("d", lineSynthetic(dataset1a))
            .attr("class", "line line-synthetic")
            .style("opacity", 0)
            .transition()
            .delay(1000)
            .duration(1000)
            .style("opacity", 1)


        var syntheticExt = d3.select("#graphic svg g").append("path")
            .attr("fill", "none")
            .attr("stroke", "#f0583f")
            .style("stroke-width", "1.5px")
            .attr("d", lineSynthetic(dataset1c))
            .attr("class", "line line-synthetic-ext")    
            .style("opacity", 0)
            .transition()
            .delay(1000)
            .duration(1000)
            .style("opacity", 1)
      }
    }

    function step4(direction) {
      console.log('step4')
      if (direction == "next"){
        svg.append("text")
          .attr("x", width/1.3)
          .attr("y", height/1.5)
          .text("step4 text: Lorem ipsum dolor sit amet, omnes quidam per ei, mutat commune sed ex. Graeco moderatius sea et. ")
          .attr("dy", 0)
          .attr("class", "step-text step4-text")
          .call(wrapText, 120)
          .style("opacity", 0)
          .transition()
          .delay(2500)
          .duration(1000)
          .style("opacity", 1)
        d3.selectAll(".step3-text")
          .transition()
          .duration(300)
          .remove()
        d3.select("#graphic svg g")
          .data(dataset2a)
        x.domain(d3.extent(dataset2a, function(d) { return d.year; }));
        //Keep line data up to 2000
        d3.select(".line-actual")
          .transition()
          .duration(1800)
          .attr("d", lineActual(dataset1a))
        d3.select(".line-actual-ext")
          .transition()
          .duration(1800)
          .attr("d", lineActual(dataset1c))
        d3.selectAll(".line-synthetic, .line-synthetic-ext, .synthetic-label, .actual-label")
          .transition()
          .duration(500)
          .remove()
        d3.selectAll("#graphic .x-axis")
          .transition()
          .duration(1800)
          .call(d3.axisBottom(x)
            .tickFormat(d3.format(""))
          )
        d3.selectAll("#graphic .y-axis")
          .transition()
          .duration(1800)
          .call(d3.axisLeft(y))
        svg.append("g")
          .attr("class", "actual-label")
          .attr("transform", function() { 
            return "translate("+(width)+","+ y((dataset2b)[6]["actual"])+")"
          })
          .append("text")
          .attr("transform", "translate(0,"+ 10+")")
          .text("Actual")
          .style("opacity", 0)
          .transition()
          .delay(2300)
          .duration(1000)
          .style("opacity", 1)
        var actualExt = d3.select("#graphic svg g").append("path")
            .datum(dataset2b)
            .attr("fill", "none")
            .attr("stroke", "#154b7c")
            .style("stroke-width", "1.5px")
            .attr("d", lineActual)
            .attr("class", "line line-actual-ext2");
        var actualExtLength = actualExt.node().getTotalLength();
        actualExt
          .attr("stroke-dasharray", actualExtLength + ", " + actualExtLength)
          .attr("stroke-dashoffset", actualExtLength)
          .transition()
          .delay(1800)
          .duration(1000)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
      }else if (direction == "prev"){
        d3.selectAll(".line-synthetic, .line-actual, .step5-text, .synthetic-label")
          .transition()
          .duration(500)
          .style("opacity", 0)
          .remove()
        d3.select("#graphic svg g").append("path")
            .attr("fill", "none")
            .attr("stroke", "#154b7c")
            .style("stroke-width", "1.5px")
            .attr("d", lineActual(dataset1a))
            .attr("class", "line line-actual");     
        d3.select("#graphic svg g").append("path")
            .attr("fill", "none")
            .attr("stroke", "#154b7c")
            .style("stroke-width", "1.5px")
            .attr("d", lineActual(dataset1c))
            .attr("class", "line line-actual-ext");  
        d3.select("#graphic svg g").append("path")
            .attr("fill", "none")
            .attr("stroke", "#154b7c")
            .style("stroke-width", "1.5px")
            .attr("d", lineActual(dataset2b))
            .attr("class", "line line-actual-ext2");   
      }
    }

    function step5(direction) {
    console.log('step5')
      if (direction == "next"){
        var synG = svg.append("g")
          .attr("class", "synthetic-label")
          .attr("transform", function() { 
            return "translate("+(width)+","+ y((dataset2a)[33]["synthetic"])+")"
          })
        synG.append("text")
          .attr("transform", "translate(0,"+ 10+")")
          .text("Synthetic")
          .style("opacity", 0)
          .transition()
          .delay(1800)
          .duration(1000)
          .style("opacity", 1)
        svg.append("text")
          .attr("x", width/1.8)
          .attr("y", height/6)
          .text("step5 text: Lorem ipsum dolor sit amet, omnes quidam per ei, mutat commune sed ex. Graeco moderatius sea et. ")
          .attr("dy", 0)
          .attr("class", "step-text step5-text")
          .call(wrapText, 170)
          .style("opacity", 0)
          .transition()
          .delay(1800)
          .duration(1000)
          .style("opacity", 1)
        var synthetic = d3.select("#graphic svg g").append("path")
          .attr("fill", "none")
          .attr("stroke", "#f0583f")
          .style("stroke-width", "1.5px")
          .attr("d", lineSynthetic(dataset2a))
          .attr("class", "line line-synthetic");
        var syntheticLength = synthetic.node().getTotalLength();
        synthetic
          .attr("stroke-dasharray", syntheticLength + ", " + syntheticLength)
          .attr("stroke-dashoffset", syntheticLength)
          .transition()
          .duration(1800)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
        d3.selectAll(".line-actual, .line-actual-ext, .line-actual-ext2")
          .remove()
        d3.select("#graphic svg g").append("path")
            .datum(dataset2a)
            .attr("fill", "none")
            .attr("stroke", "#154b7c")
            .style("stroke-width", "1.5px")
            .attr("d", lineActual)
            .attr("class", "line line-actual");
      }else if (direction == "prev"){
        d3.selectAll(".step6-text")
          .transition()
          .duration(500)
          .style("opacity", 0)
          .remove()
        svg.append("text")
          .attr("x", width/1.8)
          .attr("y", height/6)
          .text("step5 text: Lorem ipsum dolor sit amet, omnes quidam per ei, mutat commune sed ex. Graeco moderatius sea et. ")
          .attr("dy", 0)
          .attr("class", "step-text step5-text")
          .call(wrapText, 170)
          .style("opacity", 0)
          .transition()
          .delay(1000)
          .duration(1000)
          .style("opacity", 1)
        svg.append("text")
          .attr("x", width/1.3)
          .attr("y", height/1.5)
          .text("step4 text: Lorem ipsum dolor sit amet, omnes quidam per ei, mutat commune sed ex. Graeco moderatius sea et. ")
          .attr("dy", 0)
          .attr("class", "step-text step4-text")
          .call(wrapText, 120)
          .style("opacity", 0)
          .transition()
          .delay(1000)
          .duration(1000)
          .style("opacity", 1)
        d3.select(".line-synthetic")
          .attr("stroke-dasharray", "none")
          .transition()
          .duration(1800)
          .attr("d", lineSynthetic(dataset2a))

        d3.select(".line-actual")
          .transition()
          .duration(1800)
          .attr("d", lineActual(dataset2a))
      }
    }

    function step6(direction){
    console.log('step6')
      if (direction == "next"){
        if (d3.select(".step6-text").node() == undefined) {
          d3.selectAll(".step5-text, .step4-text")
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove()
          svg.append("text")
            .attr("x", width/1.8)
            .attr("y", height/1.5)
            .text("step6 text: Lorem ipsum dolor sit amet, omnes quidam per ei, mutat commune sed ex. Graeco moderatius sea et. ")
            .attr("dy", 0)
            .attr("class", "step-text step6-text")
            .call(wrapText, 170)
            .style("opacity", 0)
            .transition()
            .delay(1000)
            .duration(1000)
            .style("opacity", 1)
          d3.selectAll("#graphic .y-axis")
            .transition()
            .duration(1800)
            .call(d3.axisLeft(y))
          d3.select(".line-synthetic")
            .attr("stroke-dasharray", "none")
            .transition()
            .duration(1800)
            .attr("d", lineSynthetic(dataset3))

          d3.select(".line-actual")
            .transition()
            .duration(1800)
            .attr("d", lineActual(dataset3))
          }else {

          }
      
      }else if (direction == "prev"){
        
      }
    }


  })


};

var pymChild = new pym.Child({ renderCallback: drawLineGraph, polling: 500 });
