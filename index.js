const JSONFILE = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
const RADIUS = "7px";
const BIGGERRADIUS = "9px";
const RED = "rgba(255, 0, 0, 0.7)";
const GREEN = "rgba(0, 200, 0, 0.7)";
const BORDER_COLOR = "black";
const LEGEND_SQUARE_SIDE = 20;
const LEGEND_PADDING = 5;
const PADDING = 60;

function makeLegend(left, top, side, padding, arr) {

        let svg = d3.select("svg")
          .append("g")
          .attr("id", "legend")
          .attr("transform", "translate(" + left + "," + top + ")");
    
        svg.selectAll("rect")
          .data(arr)
          .enter()
          .append("rect")
          .style("fill", (d) => d.color)
          .style("stroke", BORDER_COLOR)
            .attr("width", side)
            .attr("height", side)
            .attr("x", "0" )
            .attr("y", (d, i) => i*side + padding*i);
    
        svg.selectAll("text")
          .data(arr)
          .enter()
          .append("text")
          .text((d) => d.text)
          .attr("x", side + padding)
          .attr("y", (d, i) => (i+1)*side + i*padding)
          .style("fill", (d) => d.color);      
    
}

document.addEventListener('DOMContentLoaded', function() {
    const visWidth = document.getElementById('container').clientWidth - PADDING;
    const titlesHeight = document.getElementById("title").offsetHeight + document.getElementById("title2").offsetHeight;
    const visHeight = document.getElementById('container').clientHeight 
                        - titlesHeight
                        - PADDING*2;


    d3.json(JSONFILE, function(data){
        const years = data.map(item => item.Year);
        const times = data.map(item => (+item.Time.slice(0, 2)*60 + +item.Time.slice(3, 5))*1000);
        const doping = data.map(item => item.Doping === "" ? false : true);

        // Making SVG:
        var svg = d3.select("#visData")
                .append("svg")
                .attr("width", visWidth)
                .attr("height", visHeight+PADDING*2);

        // Making scales:                
        const xScale = d3.scaleLinear()
                .domain([d3.min(data, (d) => d.Year - 1),
                         d3.max(data, (d) => d.Year + 1)])
                .range([PADDING, visWidth - PADDING]);
        const yScale = d3.scaleLinear()
                .domain([d3.min(times), d3.max(times)])
                .range([visHeight - PADDING, PADDING])
                .nice();   
                
        // Making Axes:
        const xAxis = d3.axisBottom(xScale)
                        .tickFormat(d3.format("d"));
        svg.append("g")
                .attr("transform", "translate(0, " + (visHeight - PADDING) + ")")
                .attr('id', 'x-axis')
                .call(xAxis);                

        const yAxis = d3.axisLeft(yScale)
                        .tickFormat(d3.timeFormat("%M:%S"));
        svg.append("g")
            .attr("transform", "translate(" + PADDING + ", 0)")
            .attr('id', 'y-axis')
            .call(yAxis);

        // Making legend:
        makeLegend(PADDING, visHeight-PADDING+20, LEGEND_SQUARE_SIDE, 
                   LEGEND_PADDING, 
                   [{color: RED, text: "Riders with doping allegations"}, 
                    {color: GREEN, text: "Riders without doping allegations"}]);

        // Tooltip:
        const tooltip = d3.selectAll('#visData')
                          .append('div')
                          .attr('id', 'tooltip')
                          .style('opacity', 0);        
                
        
        // Making plots:            
        svg.selectAll('circle')
                .data(times.map(item => yScale(item)))
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", (d, i) => xScale(years[i]))
                .attr("cy", (d) => d)
                .attr("r", (d, i) => doping[i] ? RADIUS : BIGGERRADIUS)
                .attr("stroke", BORDER_COLOR)
                .attr("fill", (d, i) => doping[i] ? RED : GREEN)
                .attr("data-xvalue", (d, i) => years[i])
                .attr("data-yvalue", (d, i) => new Date(times[i]))
                .on("mouseover", (d, i) => {
                        tooltip.transition()
                               .duration(200)
                               .style("opacity", 1);
                        tooltip.html(data[i].Name + " (" + data[i].Nationality + ")<br>" +
                                     data[i].Year.toString() + ", time: " + data[i].Time + "<br>" + 
                                     data[i].Doping)
                                .style("left", xScale(years[i])+"px")
                                .style("top", d+titlesHeight+"px")
                                .attr("data-year", years[i]);
                })
                .on("mouseout", () => {
                        tooltip.transition()
                                .duration(200)
                                .style("opacity", 0);
                });
    })
});

