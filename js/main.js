var MOBILE_THRESHOLD = 600,
    PHONE_THRESHOLD = 450,
    isPhone = false,
    $graphic = $("#graphic")
    step = 1,
    step1Text = "Researchers studied the number of fatal alcohol-related motor vehicle crashes in the years leading up to the state’s two major alcohol excise tax increases.",
    step2Text = "The synthetic control method allowed the researchers to map out a trajectory of drunk-driving fatalities in the hypothetical Illinois that closely aligned with the actual state.",
    step3Text = "As the actual number of vehicle crashes never dipped below the synthetic line after the policy were in effect in 2000, this signaled that drunk-driving fatalities were not reduced by the higher excise tax.",
    step4Text = "Researchers tracked the same data for the years after the second excise tax increase, enacted in 2009.",
    step5Text = "The number of drunk driving deaths in the actual Illinois does not deviate significantly from the deaths in the hypothetical Illinois, indicating the policy didn’t reduce such deaths.",
    step6Text = "When border counties were removed from consideration, the data showed a steep drop in drunk-driving fatalities immediately after the 2009 tax increase. However, that drop was short lived, and drunk-driving deaths returned to previous levels (and aligned with the synthetic state’s trajectory) in 2013.";
transitionStatus(false)
interruptStatus(false)

function transitionStatus(status) {
  running = status;
}
function interruptStatus(status) {
  interrupt = status;
}
function buttonStyle(step) { 
    d3.select("#page-nav").text(step + " of 6")
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
  var IS_PHONE = d3.select("#isPhone").style("display") == "block";
   
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
    var dataset1c = dataset1b.filter(function(d) {
      return d.year > 1999; //DATA FROM 2000-2008
    })
    var dataset1d = dataset1b.filter(function(d) {
      return d.year > 1999 && d.year < 2001; //DATA FROM 2000-2008
    })
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

    if (IS_PHONE) {
        isPhone = true;
        var chart_aspect_height = 1.1;
        var margin = {
            top: 10,
            right: 60,
            bottom: 15,
            left: 35
        };
        var width = container_width - margin.left - margin.right,
            height = Math.min(500, (Math.ceil(width * chart_aspect_height))) - margin.top - margin.bottom - padding,
            graphWidth = width*1.1;
    }
     else {
        var chart_aspect_height = 0.7;
        var margin = {
            top: 20,
            right: 60,
            bottom: 15,
            left: 40
        };
        var width = container_width - margin.left - margin.right,
            height = Math.ceil(Math.max(350, width * chart_aspect_height)) - margin.top - margin.bottom - padding,
            graphWidth = width*.975;

    }

    $graphic.empty();
    //MAKE LINE GRAPH
    var svg = d3.select("#graphic").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + padding)
      .append("g")
      .attr("transform", "translate(" + 35 + "," + margin.top + ")");
    // Set the ranges
    var x = d3.scaleLinear().range([0, graphWidth]);
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

    function make_y_gridlines() {   
    return d3.axisLeft(y)
    }


    svg.append("g")
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-graphWidth)
          .tickFormat("")
      )
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .tickFormat(function(d) {
          if (IS_PHONE) {
            var string = d.toString()
            return "'" + string.slice(2,4)
          }else {
            return d
          }
        })
        .ticks(19)
      )
      .attr("class", "x-axis")
    $(window).on('resize', function() {
     
      svg.select(".x-axis").selectAll(".tick > text")
        .each(function(d) {
            d3.select(this)
              .text(function() {
                if (IS_PHONE) {
                  var string = d.toString()
                  return "'" + string.slice(2,4)
                }else { 
                  return d
                }
              })
          })
    })
    d3.selectAll(".x-axis .tick text").classed("remove", function(d,i){ 
      if(i%2 == 0) {
          return false
      }else {
          return true
      }
    });
    svg.append("g")
      .call(d3.axisLeft(y)
        .tickFormat(d3.format(".0%"))

      )
      .attr("class", "y-axis")
      .append("text")
      .attr("fill", "#000")
      .attr("x", 7)
      .attr("y", -20)
      .attr("dy", "0.71em")
      .attr("tanchor", "end")
      .attr("class", "y-axis-label")
      // .text("Percent");

    svg.append("path")
      .datum(dataset1a)
      .attr("fill", "none")
      .attr("stroke", "#008bb0")
      .style("stroke-width", "2px")
      .attr("d", lineActual)
      .attr("class", "line line-actual");
    $(window).on('resize', function() {

      step1("next")
      step = 1
      buttonStyle(1)
    })

  d3.selection.prototype.getTransition = function() {
    if(this[0][0].__transition__) {
      return this[0][0].__transition__[1];
    } else return undefined;
  }

    d3.select('#btnnext')
      .on("click", function () {
        if (running == true) { 
          interruptStatus(true)
          svg.selectAll('path')
            .interrupt()
            // .on('end', function() {
            //   changeStep("prev");
            // })
        }else {
          changeStep("next");
        }

      });

    d3.select('#btnprev')
      .on("click", function () {
        if (running == true) { 
          interruptStatus(true)
          svg.selectAll('path')
            .interrupt()
            // .on('end', function() {
            //   changeStep("prev");
            // })
        }else {
          changeStep("prev");
        }
        // changeStep("prev")
      });

    var actualG = svg.append("g")
      .attr("class", "actual-label")
      .attr("transform", function() { 
        return (IS_PHONE) ? "translate("+(width) +","+ y((dataset1a)[14]["actual"])+")" : "translate("+(width*.98) +","+ y((dataset1a)[18]["actual"])+")";
      })
      .append("text")
      .text("Actual")
    if (IS_PHONE) {
      $("#description-actual").text(step1Text)

    }else {
      svg.append("text")
        .attr("x", width/1.7)
        .attr("y", 0)
        .text(step1Text)
        .attr("dy", 0)
        .attr("class", "step-text step1-text")
        .call(wrapText, 170)
    }

    //when changing the step, change the graph
    function changeStep(direction){ 
      if (direction == "next"){
        step = step < 6 ? step + 1 : step;
      }else if (direction == "prev") {
        step = step > 1 ? step - 1 : step;
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
      if (direction == "next"){
        d3.select("#notes").style("opacity", 0)

      }else if (direction == "prev"){ 
        x.domain(d3.extent(dataset1a, function(d) { return d.year; }));
        d3.select(".line-actual")
          .transition()
          .duration(500)
          .attr("d", lineActual(dataset1a))

        d3.selectAll(".step2-text, .synthetic-label, .line-synthetic")
          .transition()
          .duration(500)
          .style("opacity", 0)
          .remove()
        $("#notes").css("opacity", "0")
        $("#description-synthetic").text("")

      }


    }

    function step2(direction) {
      if (direction == "next"){
      $("#notes").css("opacity", "1")


      //ADD SYNTHETIC LINE
      var path = d3.select("#graphic svg g").append("path")
        .datum(dataset1a)
        .attr("fill", "none")
        .attr("stroke", "#fcb64b")
        .style("stroke-width", "2.25px")
        .attr("d", lineSynthetic)
        .attr("class", "line line-synthetic");

      var totalLength = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", totalLength + ", " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
        .on("end", function() {
          if (IS_PHONE) {
            $("#description-synthetic").text(step2Text)
          }else {
            svg.append("text")
              .attr("x", function(){
                return (IS_PHONE) ? width/2 : width/1.5;
              })
              .attr("y", height/2)
              .text(step2Text)
              .attr("dy", 0)
              .attr("class", "step-text step2-text")
              .call(wrapText, 180)
              .style("opacity", 0)
              .transition()
              .duration(500)
              .style("opacity", 1)
          }
          svg.append("g")
            .attr("class", "synthetic-label")
            .attr("transform", function() {
              return (IS_PHONE) ? "translate("+(width*.97)+","+ (y((dataset1a)[14]["synthetic"]) + 20)+")" : "translate("+(width*.98)+","+ y((dataset1a)[18]["synthetic"])+")";
            })
            .append("text")
            .attr("transform", "translate(0,"+ 10+")")
            .text("Synthetic")
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style("opacity", 1)
        })


      }else if (direction == "prev"){
        $("#notes").html("<b>Notes:</b>" + " The synthetic Illinois is constructed by combining several untreated states based on historic drunk-driving fatality rates and other variables.")

        d3.select(".threshold")
          .remove()
        svg
          .call(function() {
            transitionElements2P(200, 604)
          })
         
        function addElements2P(duration) {
          svg.append("g")
            .attr("class", "synthetic-label")
            .attr("transform", function() { 
              return (IS_PHONE) ? "translate("+(width*.97)+","+ (y((dataset1a)[18]["synthetic"]) + 10)+")" : "translate("+(width*.98)+","+ y((dataset1a)[18]["synthetic"])+")";
            })
            .append("text")
            .attr("transform", "translate(0,"+ 10+")")
            .text("Synthetic")
            .style("opacity", 0)
            .transition()
            .duration(duration)
            .style("opacity", 1)
          svg.append("g")
            .attr("class", "actual-label")
            .attr("transform", function() { 
              return (IS_PHONE) ? "translate("+(width) +","+ y((dataset1a)[14]["actual"])+")" : "translate("+(width*.98) +","+ y((dataset1a)[18]["actual"])+")";
            })
            .append("text")
            .text("Actual")
            .style("opacity", 0)
            .transition()
            .duration(duration)
            .style("opacity", 1)
            if (IS_PHONE) {
              $("#description-actual").text(step1Text)
              $("#description-synthetic").text(step2Text)
            }else {
              svg.append("text")
                .attr("x", width/1.7)
                .attr("y", 0)
                .text(step1Text)
                .attr("dy", 0)
                .attr("class", "step-text step1-text")
                .call(wrapText, 170)
                .style("opacity", 0)
                .transition()
                .duration(duration)
                .style("opacity", 1)
              svg.append("text")
                .attr("x", function() {
                  return (IS_PHONE) ? width/2 : width/1.5;
                })
                .attr("y", height/2)
                .text(step2Text)
                .attr("dy", 0)
                .attr("class", "step-text step2-text")
                .call(wrapText, 180)
                .style("opacity", 0)
                .transition()
                .duration(duration)
                .style("opacity", 1)
            }
        }
        function transitionElements2P(duration1, duration2) { 
          d3.selectAll(".line-actual-ext, .line-synthetic-ext")
            // .transition()
            // .ease(d3.easeLinear)
            // .duration(duration1)
            // .attr("transform", function() { 
            //   return "translate("+(width)+",0)"
            // })
            // .style("opacity", 0)
            .remove()
        /*ATTEMPT BUT TRANSITIONING TO A SMALLER PATH DOESN'T SEEM TO WORK */
            // d3.select(".line-actual-ext")
            //   .transition()
            //   .ease(d3.easeLinear)
            //   .duration(20000)
            //   .attr("d", lineActual(dataset1d))

          d3.selectAll(".step3-text, .actual-label, .synthetic-label")
            .transition()
            .duration(duration1)
            .style("opacity", 0)
        
          d3.select("#graphic svg g")
            .data(dataset1a)
          x.domain(d3.extent(dataset1a, function(d) { return d.year; }));
          d3.select(".line-actual")
            .transition()
            .ease(d3.easeLinear)
            .duration(duration2)
            .attr("d", lineActual(dataset1a))
            .on('start', function() { 
              transitionStatus(true)
            })
            .on('end', function() {
              transitionStatus(false)
              if (interrupt == true) {
                addElements2P(0)
                interruptStatus(false)
                changeStep("prev")
              }else {
                addElements2P(500)
              }

            })
            .on('interrupt', function() {
              transitionStatus(false)
              transitionElements2P(0,0)
              // addElements(0)
              // step1("prev")
            })

          d3.select(".line-synthetic")
            .attr("stroke-dasharray", "none")
            .transition()
            .ease(d3.easeLinear)
            .duration(duration2)
            .attr("d", lineSynthetic(dataset1a))


          d3.selectAll("#graphic .x-axis")
            .transition()
            .duration(duration2)
            .call(d3.axisBottom(x)
              .tickFormat(function(d) {
                if (IS_PHONE){
                  var string = d.toString()
                  return "'" + string.slice(2,4)
                }else {
                  return d
                }
              })
            .ticks(19)
            )
          $(window).on('resize', function() {
            svg.select(".x-axis").selectAll(".tick > text")
              .each(function(d) {
                  d3.select(this)
                    .text(function() {
                      if (IS_PHONE) {
                        var string = d.toString()
                        return "'" + string.slice(2,4)
                      }else { 
                        return d
                      }
                    })
                })
          })

          d3.selectAll(".x-axis .tick text").classed("remove", function(d,i){ 
            if(i%2 == 0) {
                return false
            }else {
                return true
            }
          });
          d3.selectAll("#graphic .y-axis")
            .transition()
            // .delay(500)
            .duration(duration2)
            .call(d3.axisLeft(y)
              .tickFormat(d3.format(".0%"))
            )
        }
      }
    }

    function step3(direction) {
      if (direction == "next"){console.log(direction)
        $("#notes").html("<b>Notes:</b>" + " We highlight 2000 to reflect the first full year the new alcohol prices were in effect. The synthetic Illinois is constructed by combining several untreated states based on historic drunk-driving fatality rates and other variables.")

        // svg
        //   .call(function() {
            transitionElements3N(500,1000)
          // })
        function transitionElements3N(duration1, duration2) {console.log('transition')
          d3.selectAll(".step1-text, .step2-text, .actual-label, .synthetic-label")
            .transition()
            .duration(duration1)
            .style("opacity", 0)
            .remove()
          d3.select("#graphic svg g")
            .data(dataset1b)
          x.domain(d3.extent(dataset1b, function(d) { return d.year; }));
            //Keep line data up to 2000
          d3.select(".line-actual")
            .transition()
            .duration(duration2)
            .attr("d", lineActual(dataset1a))
            .on('end', function() {
              addElements3N(duration1)
            })
            .on('start', function() { 
              transitionStatus(true)
            })
            .on('end', function() {
              transitionStatus(false)
              if (interrupt == true) {
                addElements(0)
                interruptStatus(false)
                changeStep("next")
              }else {
                addElements3N(500)
              }

            })
            .on('interrupt', function() {
              transitionStatus(false)
              transitionElements3N(0,0)
              // addElements(0)
              // step1("prev")
            })
          d3.select(".line-synthetic")
            .attr("stroke-dasharray", "none")
            .transition()
            .duration(duration2)
            .attr("d", lineSynthetic(dataset1a))
          d3.selectAll("#graphic .x-axis")
            .transition()
            .duration(duration2)
            .call(d3.axisBottom(x)
              .tickFormat(function(d) {
                if (IS_PHONE){
                  var string = d.toString()
                  return "'" + string.slice(2,4)
                }else {
                  return d
                }
              })
            .ticks(27)
            )
          $(window).on('resize', function() {
            svg.select(".x-axis").selectAll(".tick > text")
              .each(function(d) {
                  d3.select(this)
                    .text(function() {
                      if (IS_PHONE) {
                        var string = d.toString()
                        return "'" + string.slice(2,4)
                      }else { 
                        return d
                      }
                    })
                })
          })
              // .on('interrupt', function(){
              //   var actualExtLength = actualExt.node().getTotalLength();
              //   actualExt
              //     .attr("d", lineActual(dataset1c))
              //     .attr("stroke-dasharray", actualExtLength + ", " + actualExtLength)
              //     .attr("stroke-dashoffset", actualExtLength)
              //     // .transition()
              //     // .delay(1000)
              //     // .duration(600)
              //     // .ease(d3.easeLinear)
              //     .attr("stroke-dashoffset", 0);
              //   var syntheticExtLength = syntheticExt.node().getTotalLength();
              //   syntheticExt
              //     .attr("stroke-dasharray", syntheticExtLength + ", " + syntheticExtLength)
              //     .attr("stroke-dashoffset", syntheticExtLength)
              //     // .transition()
              //     // .delay(1000)
              //     // .duration(600)
              //     // .ease(d3.easeLinear)
              //     .attr("stroke-dashoffset", 0);
              // })
          var ticks = svg.selectAll(".tick text");
          d3.selectAll(".x-axis .tick text").classed("remove", function(d,i){ 
            var number = (IS_PHONE) ? 4 : 2;
            if(i%number == 0) {
                return false
            }else {
                return true
            }
          });
          $(window).on('resize', function () {
            var ticks = svg.selectAll(".tick text");
            d3.selectAll(".x-axis .tick text").classed("remove", function(d,i){ 
              var number = (IS_PHONE) ? 4 : 2;
              if(i%number == 0) {
                  return false
              }else {
                  return true
              }
            });
          });
                    
          d3.selectAll("#graphic .y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(y)
              .tickFormat(d3.format(".0%"))
            )
      }
      function addElements3N(duration) {console.log('add')
        var threshold = d3.select("#graphic svg g").append("line")
          .attr("y1", 0)
          .attr("x1", x('2000'))
          .attr("y2", height)
          .attr("x2", x('2000'))
          .style("stroke-dasharray", 5)
          .attr("stroke", "#5c5859")
          .attr("class", "threshold")
        svg.append("g")
          .attr("class", "actual-label")
          .attr("transform", function() { 
            return (IS_PHONE) ? "translate("+(width)+","+ (y((dataset1c)[5]["actual"]) - 23)+")" : "translate("+(width*.98)+","+ y((dataset1c)[5]["actual"])+")";
          })
          .append("text")
          .text("Actual")
          .style("opacity", 0)
          .transition()
          .duration(duration)
          .style("opacity", 1)
        if (IS_PHONE) {
          $("#description-synthetic").text("")
          $("#description-actual").text(step3Text)

        }else {
          svg.append("text")
            .attr("x", function() {
              return (IS_PHONE) ? width/2 : width/1.4;
            })
            .attr("y", height/1.7)
            .text(step3Text)
            .attr("dy", 0)
            .attr("class", "step-text step3-text")
            .call(wrapText, 170)
            .style("opacity", 0)
            .transition()
            .duration(duration)
            .style("opacity", 1)
        }
        svg.append("g")
          .attr("class", "synthetic-label")
          .attr("transform", function() { 
            return (IS_PHONE) ? "translate("+(width*.97)+","+ (y((dataset1c)[8]["synthetic"]) + 10)+")" : "translate("+(width*.98)+","+ (5+ y((dataset1c)[8]["synthetic"]))+")";
          })
          .append("text")
          .text("Synthetic")
          .style("opacity", 0)
          .transition()
          .duration(duration)
          .style("opacity", 1)
        var syntheticExt = d3.select("#graphic svg g").append("path")
          .datum(dataset1c)
          .attr("fill", "none")
          .attr("stroke", "#fcb64b")
          .style("stroke-width", "2.25px")
          .attr("d", lineSynthetic)
          .attr("class", "line line-synthetic-ext");
        var syntheticExtLength = syntheticExt.node().getTotalLength();
        syntheticExt
          .attr("stroke-dasharray", syntheticExtLength + ", " + syntheticExtLength)
          .attr("stroke-dashoffset", syntheticExtLength)
          .transition()
          .duration(duration)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
        var actualExt = d3.select("#graphic svg g").append("path")
          .datum(dataset1c)
          .attr("fill", "none")
          .attr("stroke", "#008bb0")
          .style("stroke-width", "2.25px")
          .attr("d", lineActual)
          .attr("class", "line line-actual-ext")
        var actualExtLength = actualExt.node().getTotalLength();
        console.log(actualExtLength)
        actualExt
          .attr("stroke-dasharray", actualExtLength + ", " + actualExtLength)
          .attr("stroke-dashoffset", actualExtLength)
          .transition()
          .duration(duration)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
      }
     
        // Add extended line from 2000-2008

      }else if (direction == "prev"){ 
        $("#notes").html("<b>Notes:</b>" + " We highlight 2000 to reflect the first full year the new alcohol prices were in effect. The synthetic Illinois is constructed by combining several untreated states based on historic drunk-driving fatality rates and other variables.")
        svg
          .call(function() {
            transitionElements3P(412, 500)
          })
        var synG = svg.append("g")
          .attr("class", "synthetic-label")
          .attr("transform", function() { 
            return (IS_PHONE) ? "translate("+(width*.97)+","+ (y((dataset1c)[8]["synthetic"]) + 5)+")" : "translate("+(width*.98)+","+ (5+ y((dataset1c)[8]["synthetic"]))+")";
          })

        function transitionElements3P(duration1, duration2){ 
          if (duration1 == 0){
            d3.selectAll(".step4-text, .actual-label") 
              .remove()
            d3.select(".line-actual-ext2")
              .remove()
          }else {
            d3.selectAll(".step4-text, .actual-label") 
              .transition()
              .duration(duration1)
              .style("opacity", 0)
              .remove()
            d3.select(".line-actual-ext2")
              // .transition()
              // .ease(d3.easeLinear)
              // .duration(duration2)
              // .attr("transform", function() { 
              //   return "translate("+(width)+",0)"
              // })
              // .style("opacity", 0)
              .remove()
          }


          d3.select("#graphic svg g")
            .data(dataset1b)
          x.domain(d3.extent(dataset1b, function(d) { return d.year; }));
          d3.select(".threshold")
            .transition()
            .duration(duration2)
            .attr("x1", x('2000'))
            .attr("x2", x('2000'))
          d3.selectAll("#graphic .y-axis")
            .transition()
            .duration(duration2)
            .call(d3.axisLeft(y)
              .tickFormat(d3.format(".0%"))
            )
            .on('start', function() { 
              transitionStatus(true)
            })
            .on('end', function() {
              transitionStatus(false)
              if (interrupt == true) {
                addElements3P(0)
                interruptStatus(false)
                changeStep("prev")
              }else {
                addElements3P(500)
              }

            })
            .on('interrupt', function() {
              transitionStatus(false)
              transitionElements3P(0,0)
              // addElements(0)
              // step1("prev")
            })
           
          x.domain(d3.extent(dataset1b, function(d) { return d.year; }));
          d3.selectAll("#graphic .x-axis")
            .transition()
            .duration(duration1)
            .call(d3.axisBottom(x)
              .tickFormat(function(d) {
                if (IS_PHONE) {
                  var string = d.toString()
                  return "'" + string.slice(2,4)
                }else {
                  return d
                }
              })
            .ticks(27)
            )
          $(window).on('resize', function() {
            svg.select(".x-axis").selectAll(".tick > text")
              .each(function(d) {
                  d3.select(this)
                    .text(function() {
                      if (IS_PHONE) {
                        var string = d.toString()
                        return "'" + string.slice(2,4)
                      }else { 
                        return d
                      }
                    })
                })
          })
          d3.selectAll(".x-axis .tick text").classed("remove", function(d,i){ 
            if(i%2 == 0) {
                return false
            }else {
                return true
            }
          });
          d3.select(".line-actual")
            .transition()
            // .delay(300)
            .ease(d3.easeLinear)
            .duration(duration1)
            .attr("d", lineActual(dataset1a))
          d3.select(".line-actual-ext")
            .transition()
            // .delay(300)
            .ease(d3.easeLinear)
            .duration(duration1)
            .attr("stroke-dasharray", "none")
            .attr("d", lineActual(dataset1c))

        }
        function addElements3P(duration) {
          var synthetic = d3.select("#graphic svg g")
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "#fcb64b")
            .style("stroke-width", "2.25px")
            .attr("d", lineSynthetic(dataset1a))
            .attr("class", "line line-synthetic")
            .style("opacity", 0)
            .transition()
            .duration(duration)
            .style("opacity", 1)
          var syntheticExt = d3.select("#graphic svg g").append("path")
            .attr("fill", "none")
            .attr("stroke", "#fcb64b")
            .style("stroke-width", "2.25px")
            .attr("d", lineSynthetic(dataset1c))
            .attr("class", "line line-synthetic-ext")    
            .style("opacity", 0)
            .transition()
            .duration(duration)
            .style("opacity", 1)
          d3.select(".synthetic-label").append("text")
            .attr("transform", "translate(0,"+ 10+")")
            .text("Synthetic")
            .style("opacity", 0)
            .transition()
            .duration(duration)
            .style("opacity", 1)
          svg.append("g")
            .attr("class", "actual-label")
            .attr("transform", function() { 
              return (IS_PHONE) ? "translate("+(width)+","+ (y((dataset1c)[5]["actual"]) - 23)+")" : "translate("+(width*.98)+","+ y((dataset1c)[5]["actual"])+")";
            })
            .append("text")
            // .attr("transform", "translate(0,"+ 10+")")
            .text("Actual")
            .style("opacity", 0)
            .transition()
            .duration(duration)
            .style("opacity", 1)
          if (IS_PHONE) {
            $("#description-actual").text(step3Text)
          }else {
            svg.append("text")
              .attr("x", function() {
                return (IS_PHONE) ? width/2 : width/1.4;
              })
              .attr("y", height/1.7)
              .text(step3Text)
              .attr("dy", 0)
              .attr("class", "step-text step3-text")
              .call(wrapText, 170)
              .style("opacity", 0)
              .transition()
              .duration(500)
              .style("opacity", 1)
          }
        }

      }
    }

    function step4(direction) {
      if (direction == "next"){
        svg
          .call(function() {
            transitionElements4N(500,1000)
          })
        $("#notes").html("<b>Notes:</b> We highlight 2010 to reflect the first full year the new alcohol prices were in effect.")
        function addElements4N(duration) {
          if (IS_PHONE) {
            $("#description-actual").text(step4Text)
            $("#description-synthetic").text("")
          }else { 
            svg.append("text")
              .attr("x", function() {
                return (IS_PHONE) ? width/2 : width/1.8;
              })
              .attr("y", height/1.8)
              .text(step4Text)
              .attr("dy", 0)
              .attr("class", "step-text step4-text")
              .call(wrapText, 180)
              .style("opacity", 0)
              .transition()
              .duration(duration)
              .style("opacity", 1)
          }
        var actualExt = d3.select("#graphic svg g").append("path")
            .datum(dataset2b)
            .attr("fill", "none")
            .attr("stroke", "#008bb0")
            .style("stroke-width", "2.25px")
            .attr("d", lineActual)
            .attr("class", "line line-actual-ext2");
          var threshold = d3.select("#graphic svg g").append("line")
            .attr("y1", 0)
            .attr("x1", x('2010'))
            .attr("y2", height)
            .attr("x2", x('2010'))
            .style("stroke-dasharray", 5)
            .attr("stroke", "#5c5859")
            .attr("class", "threshold")


          svg.append("g")
            .attr("class", "actual-label")
            .attr("transform", function() { 
              return (IS_PHONE) ? "translate("+(width*.8)+","+ (y((dataset2b)[6]["actual"]) + 5)+")" : "translate("+(width*.98)+","+ y((dataset2b)[6]["actual"])+")";
            })
            .append("text")
            .attr("transform", "translate(0,"+ 10+")")
            .text("Actual")
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style("opacity", 1)
          var actualExtLength = actualExt.node().getTotalLength();
          actualExt
            .attr("stroke-dasharray", actualExtLength + ", " + actualExtLength)
            .attr("stroke-dashoffset", actualExtLength)
            .transition()
            .duration(500)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
        }

        function transitionElements4N(duration1, duration2) {
          d3.select(".threshold")
            .transition()
            // .duration(duration1)
            .remove()
          d3.select("#graphic svg g")
            .data(dataset2a)
          x.domain(d3.extent(dataset2a, function(d) { return d.year; }));
          //Keep line data up to 2000

          d3.select(".line-actual")
            .transition()
            .duration(duration2)
            .attr("d", lineActual(dataset1a))
            .on('start', function() { 
              transitionStatus(true)
            })
            .on('end', function() {
              transitionStatus(false)
              if (interrupt == true) {
                addElements4N(0)
                interruptStatus(false)
                changeStep("next")
              }else {
                addElements4N(500)
              }

            })
            .on('interrupt', function() {
              transitionStatus(false)
              transitionElements4N(0, 0)
              // addElements(0)
              // step1("prev")
            })
          d3.select(".line-actual-ext")
            .transition()
            .duration(duration2)
            .attr("d", lineActual(dataset1c))

          if (duration1 == 0) {
            d3.selectAll(".line-synthetic, .line-synthetic-ext, .synthetic-label, .actual-label")
              .remove()
            d3.selectAll(".step3-text")
              .remove()
          }else {
            d3.selectAll(".step3-text")
              .transition()
              .duration(duration1)
              .style("opacity", 0)
              .remove()
            d3.selectAll(".line-synthetic, .line-synthetic-ext, .synthetic-label, .actual-label")
              .transition()
              .duration(duration1)
              .style("opacity", 0)
              .remove()
          }
          d3.selectAll("#graphic .x-axis")
            .transition()
            .duration(duration2)
            .call(d3.axisBottom(x)
              .tickFormat(function(d) {
                if (IS_PHONE){
                  var string = d.toString()
                  return "'" + string.slice(2,4)
                }else {
                  return d
                }
              })
            .ticks(34)
            )
          $(window).on('resize', function() {
            svg.select(".x-axis").selectAll(".tick > text")
              .each(function(d) {
                  d3.select(this)
                    .text(function() {
                      if (IS_PHONE) {
                        var string = d.toString()
                        return "'" + string.slice(2,4)
                      }else { 
                        return d
                      }
                    })
                })
          })
          var ticks = svg.selectAll(".tick text");
          d3.selectAll(".x-axis .tick text").classed("remove", function(d,i){ 
            var number = (IS_PHONE) ? 4 : 2;
            if(i%number == 0) {
                return false
            }else { 
                return true
            }
          });
          $(window).on('resize', function () {
            d3.selectAll(".x-axis .tick text").classed("remove", function(d,i){ 
              var number = (IS_PHONE) ? 4 : 2;
              if(i%number == 0) {
                  return false
              }else { 
                  return true
              }
            });
          });
          d3.selectAll("#graphic .y-axis")
            .transition()
            .duration(duration2)
            .call(d3.axisLeft(y)
              .tickFormat(d3.format(".0%"))
            )
        }
       

      }else if (direction == "prev"){
        $("#description-synthetic").text("")
        $("#notes").html("<b>Notes:</b> We highlight 2010 to reflect the first full year the new alcohol prices were in effect.")
        svg
        .call(function() {
          transitionElements4P(500)
        })
        d3.select("#graphic svg g").append("path")
            .attr("fill", "none")
            .attr("stroke", "#008bb0")
            .style("stroke-width", "2.25px")
            .attr("d", lineActual(dataset1c))
            .attr("class", "line line-actual-ext");  
        d3.select("#graphic svg g").append("path")
            .attr("fill", "none")
            .attr("stroke", "#008bb0")
            .style("stroke-width", "2.25px")
            .attr("d", lineActual(dataset2b))
            .attr("class", "line line-actual-ext2")
        function transitionElements4P(duration) {
          if (duration == 0) {
            d3.select(".line-actual")
              .attr("d", lineActual(dataset1a))
              d3.selectAll(".line-synthetic, .step5-text, .synthetic-label")
                .remove()
                if (interrupt == true) {
                  interruptStatus(false)
                  changeStep("prev")
                }

          }else {
          d3.select(".line-actual")
            .attr("d", lineActual(dataset1a))
            d3.selectAll(".line-synthetic, .step5-text, .synthetic-label")
              .transition()
              .duration(duration)
              .style("opacity", 0)
              .remove()
              .on('start', function() { 
                transitionStatus(true)
              })
              .on('end', function() {
                transitionStatus(false)
                if (interrupt == true) {
                  interruptStatus(false)
                  changeStep("prev")
                }else {
                  // addElements(500)
                }

              })
              .on('interrupt', function() {
                transitionStatus(false)
                transitionElements4P(0)
                // addElements(0)
                // step1("prev")
              })

          }

        }
       
  
      }
    }

    function step5(direction) {
      if (direction == "next"){
        $("#notes").html("<b>Notes:</b> We highlight 2010 to reflect the first full year the new alcohol prices were in effect. The synthetic Illinois is constructed by combining several untreated states based on historic drunk-driving fatality rates and other variables.")
        var synG = svg.append("g")
          .attr("class", "synthetic-label")
          .attr("transform", function() { 
            return (IS_PHONE) ? "translate("+(width*.85)+","+ (y((dataset2a)[28]["synthetic"]) - 20)+")" : "translate("+(width*.98)+","+ y((dataset2a)[33]["synthetic"])+")";
          })
        var synthetic = d3.select("#graphic svg g").append("path")
          .attr("fill", "none")
          .attr("stroke", "#fcb64b")
          .style("stroke-width", "2.25px")
          .attr("d", lineSynthetic(dataset2a))
          .attr("class", "line line-synthetic");
        var syntheticLength = synthetic.node().getTotalLength();
        d3.selectAll(".line-actual, .line-actual-ext, .line-actual-ext2")
          .remove()
        d3.select("#graphic svg g").append("path")
            .datum(dataset2a)
            .attr("fill", "none")
            .attr("stroke", "#008bb0")
            .style("stroke-width", "2.25px")
            .attr("d", lineActual)
            .attr("class", "line line-actual");
        svg
          .call(function() {
            transitionElements5N(1000)
          })
        function transitionElements5N(duration1){
          synthetic
            .attr("stroke-dasharray", syntheticLength + ", " + syntheticLength)
            .attr("stroke-dashoffset", syntheticLength)
            .transition()
            .duration(duration1)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .on('start', function() { 
                transitionStatus(true)
              })
              .on('end', function() {
                transitionStatus(false)
                if (interrupt == true) {
                  addElements5N(0)
                  interruptStatus(false)
                  changeStep("next")
                }else {
                  addElements5N(500)
                }

              })
              .on('interrupt', function() {
                transitionStatus(false)
                transitionElements5N(0)
                // addElements(0)
                // step1("prev")
              })
      }
      function addElements5N(duration){
        d3.select(".synthetic-label").append("text")
          .attr("transform", function() {
            return (IS_PHONE) ? "translate("+(-12)+","+ -5+")" : "translate(0,"+ 10+")"
          })
          .text("Synthetic")
          .style("opacity", 0)
          .transition()
          .duration(duration)
          .style("opacity", 1)
        if (IS_PHONE) {
          $("#description-synthetic").text(step5Text)
        }else {
          svg.append("text")
            .attr("x", width/1.8)
            .attr("y", height/13)
            .text(step5Text)
            .attr("dy", 0)
            .attr("class", "step-text step5-text")
            .call(wrapText, 190)
            .style("opacity", 0)
            .transition()
            .duration(duration)
            .style("opacity", 1)
        }

      }
     

      }else if (direction == "prev"){
        $("#notes").html("<b>Notes:</b> We highlight 2010 to reflect the first full year the new alcohol prices were in effect. The synthetic Illinois is constructed by combining several untreated states based on historic drunk-driving fatality rates and other variables.")
        svg
          .call(function() {
            transitionElements5P(500, 1000)
          })
        function transitionElements5P(duration1, duration2) {
          d3.selectAll(".step6-text")
            .transition()
            .duration(duration1)
            .style("opacity", 0)
            .remove()
         
          d3.select(".line-synthetic")
            .attr("stroke-dasharray", "none")
            .transition()
            .duration(duration2)
            .attr("d", lineSynthetic(dataset2a))
            .on('start', function() { 
              transitionStatus(true)
            })
            .on('end', function() {
              transitionStatus(false)
              if (interrupt == true) {
                addElements5P(0)
                interruptStatus(false)
                changeStep("prev")
              }else {
                addElements5P(500)
              }

            })
            .on('interrupt', function() {
              transitionStatus(false)
              transitionElements5P(0,0)
              // addElements(0)
              // step1("prev")
            })


          d3.select(".line-actual")
            .transition()
            .duration(duration2)
            .attr("d", lineActual(dataset2a))
        }
        function addElements5P(duration) {
          d3.select(".subtitle")
            .style("opacity", 0)
            .transition()
            .duration(duration)
            .text("With border counties")
            .style("opacity", 1)
          if (IS_PHONE) {
            $("#description-actual").text(step4Text)
            $("#description-synthetic").text(step5Text)
          }else {
            svg.append("text")
              .attr("x", width/1.8)
              .attr("y", height/13)
              .text(step5Text)
              .attr("dy", 0)
              .attr("class", "step-text step5-text")
              .call(wrapText, 190)
              .style("opacity", 0)
              .transition()
              .duration(duration)
              .style("opacity", 1)
            svg.append("text")
              .attr("x", function() {
                return (IS_PHONE) ? width/2 : width/1.8;
              })
              .attr("y", height/1.8)
              .text(step4Text)
              .attr("dy", 0)
              .attr("class", "step-text step4-text")
              .call(wrapText, 180)
              .style("opacity", 0)
              .transition()
              .duration(duration)
              .style("opacity", 1)
          }
            
        }
       
      }
    }

    function step6(direction){
      if (direction == "next"){
        if (d3.select(".step6-text").node() == undefined) {
          $("#notes").html("<b>Notes:</b>" + " We highlight 2010 to reflect the first full year the new alcohol prices were in effect. For the borderless Illinois, our synthetic state is created by combining several untreated states based only on historic drunk-driving fatality rates.")
          function addElements6N(duration) {
            d3.select(".subtitle")
              .style("opacity", 0)
              .transition()
              .duration(duration)
              .text("Without border counties")
              .style("opacity", 1)
            if (IS_PHONE) {
              $("#description-actual").text(step6Text)
              $("#description-synthetic").text("")
            }else {
              svg.append("text")
                .attr("x", width/2.3)
                .attr("y", height/1.7)
                .text(step6Text)
                .attr("dy", 0)
                .attr("class", "step-text step6-text")
                .call(wrapText, 230)
                .style("opacity", 0)
                .transition()
                .duration(duration)
                .style("opacity", 1)
            }
          }
          
          d3.selectAll(".step5-text, .step4-text")
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove()
         
          d3.select(".line-synthetic")
            .attr("stroke-dasharray", "none")
            .transition()
            .duration(1000)
            .attr("d", lineSynthetic(dataset3))
            .on('end', function() {
              addElements6N(500)
            })
          d3.select(".line-actual")
            .transition()
            .duration(1000)
            .attr("d", lineActual(dataset3))
          }else {

          }
      
      }else if (direction == "prev"){
        
      }
    }


  })


};

var pymChild = new pym.Child({ renderCallback: drawLineGraph, polling: 500 });
