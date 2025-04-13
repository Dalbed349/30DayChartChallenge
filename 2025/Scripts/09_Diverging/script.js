// Diverging ---Cleveland Dot Plot --- Vehicle Miles of Travel by Functional System and State 1980-2023
// https://catalog.data.gov/dataset/vehicle-miles-of-travel-by-functional-system-and-state-1980-2023-vm-2
    // Data needed 
    // State --- Measure value 1 (1980) ---- Measure value 2 (2023)
    // Structure year,state,area,fclass,vmt
    // We want Urban Interstate Value (to keep it simple)
    // For each state, urban interstate value for year 1980. 
    // For each state, urban interstate value for year 2023.
    // 


(function() { 

  
    const chartContainer = document.getElementById('chartContainer');
    if (!chartContainer) {
        console.error("Error inside graph script: Container div with id 'chartContainer' not found.");
        return;
    }

    // ---  ---
    const dataUrl = '2025/Datasets/Vehicle_Miles_of_Travel_by_Functional_System_and_State__1980_-_2023__VM-2_.csv'
    const margin = {top: 150, right: 180, bottom: 100, left: 150};
    const fullWidth =1080; // Total width of SVG
    const fullHeight = 1000; 
    const width = fullWidth - margin.left - margin.right; // Chart area width
    const height = fullHeight - margin.top - margin.bottom; 
    // 
    const svg = d3.create("svg")
        .attr("width", fullWidth)
        .attr("height", fullHeight)
        .attr("viewBox", [0, 0, fullWidth, fullHeight]) 
        .attr("style", "max-width: 100%; height: auto;"); 
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
        svg.append("text")
        .attr("x", fullWidth / 2) 
        .attr("y", margin.top / 2-30) 
        .attr("text-anchor", "middle") 
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text(`Vehicle Miles of Travel by Functional System and State 1980-2023`);
    // Subtitle
    svg.append("text")
        .attr("x", fullWidth / 2)
        .attr("y", margin.top / 2 +40 ) 
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .text(` Vehicle Miles Traveled By 'Urban Interstate'`); 
        const datasetUrl = 'https://www.kaggle.com/datasets/atharvasoundankar/global-cybersecurity-threats-2015-2024/data';
        const linkText = 'Dataset Link';
      // Subtitle for source   
    svg.append("a")
        .attr("href", datasetUrl)
        .attr("target", "_blank")
        .attr("rel", "noopener noreferrer")
        .append("text")
            .attr("x", fullWidth/2)      
            .attr("y",fullHeight )
            .attr("text-anchor", "middle")  
            .style("font-size", "12px")     
            .style("fill", "blue")          
            .style("text-decoration", "underline") 
            .text( linkText); 
    // Y-Axis Title
    // svg.append("text")
    //     .attr("transform", "rotate(-90)") 
    //     .attr("y", margin.left / 2 )
    //     .attr("x", 0 - (margin.top + height / 2)) 
    //     .attr("dy", "2em") 
    //     .style("text-anchor", "middle")
    //     .style("font-size", "18px")
    //     .text("y - axis title");
    // X-Axis Title
    svg.append("text")
        .attr("x", fullWidth/2)
        .attr("text-anchor", "middle")  
        .attr("y", fullHeight - margin.bottom/2)
        .text("Vehicle Miles Traveled");

// -----------------------------------------------------------------

function rowConverter(d) {
    return {
    year: +d['Year'],
    USAstate: d['State'],
    area: d['Area'],
    FClass: d['FClass'],
    VMT: +d['VMT'],
    };
}
d3.csv(dataUrl, rowConverter).then(data => {
    console.log(data)

    const fClassExplorer = 'Interstate'
    const AreaExplorer = 'Urban'

    filteredData  = data.filter(d => {
        const is1980 = (d.year === 1980 && d.FClass === fClassExplorer && d.area === AreaExplorer)

        const is2023 = (d.year === 2023 && d.FClass === fClassExplorer && d.area === AreaExplorer)

        return is1980 || is2023;

    });
    console.log(filteredData )

// 
    rollup = d3.rollup(filteredData,v => {
            const data1980 = v.find(d=>d.year === 1980);
            const data2023 = v.find(d=> d.year === 2023);
            return {
                value1980: data1980?.VMT ?? null,
                value2023: data2023?.VMT ?? null, 
            };
        },
        d => d.USAstate // grp by state
    )
// Convert the Map returned by d3.rollup into an array suitable for plotting
const plotData = Array.from(rollup, ([state, values]) => {
    let difference = null;
    // Only calculate difference if both values are valid numbers
    if (values.value1980 !== null && values.value2023 !== null) {
        difference = values.value2023 - values.value1980; // Calculate 2023 - 1980
    }
    return {
        group: state,             
        value1: values.value1980, 
        value2: values.value2023, 
        difference: difference    
    };
}).filter(d => d.difference !== null);
plotData.sort((b, a) => b.difference - a.difference);
console.log(plotData)

const x = d3.scaleLinear()
    .domain(d3.extent(plotData.flatMap(d => [d.value1, d.value2])))
    .range([15, width])
    .nice();
    g.append("g") 
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("s")));

  // Y axis
  var y = d3.scaleBand()
  .range([0, height])
  .domain(plotData.map(d => d.group)) 
  .paddingInner(0.1) 
  .paddingOuter(0.1);

  g.append("g")
  .call(d3.axisLeft(y))
  .attr("transform", `translate(0, 0)`);

  
  g.selectAll(".row-background")
        .data(plotData, d => d.group)
        .enter()
        .append("rect")
        .attr("class", "row-background")
        .attr("x", 0)
        .attr("y", d => y(d.group))
        .attr("width", width)
        .attr("height", y.bandwidth())
        .attr("fill", (d, i) => i % 2 === 0 ? "#f0f8ff" : "none")
        .attr("opacity", 0.7)
        .lower();

g.selectAll(".dumbbell-line") 
        .data(plotData, d => d.group) 
        .enter()
        .append("line")
        .attr("class", "dumbbell-line") // Add class
        .attr("x1", d => x(d.value1))
        .attr("x2", d => x(d.value2))
        .attr("y1", d => y(d.group) + y.bandwidth() / 2)
        .attr("y2", d => y(d.group) + y.bandwidth() / 2)
        .attr("stroke", "grey")
        .attr("stroke-width", "1px");

    g.selectAll(".circle-1980") 
    .data(plotData, d => d.group) 
    .enter()
    .append("circle")
    .attr("class", "circle-1980") // Add class
    .attr("cx", d => x(d.value1))
    // **FIX 3: Center vertically using bandwidth**
    .attr("cy", d => y(d.group) + y.bandwidth() / 2)
    .attr("r", 6) 
    .style("fill", "#69b3a2");

// Circles of variable 2 *
g.selectAll(".circle-2023") 
    .data(plotData, d => d.group) //
    .enter()
    .append("circle")
    .attr("class", "circle-2023") //
    .attr("cx", d => x(d.value2))
    .attr("cy", d => y(d.group) + y.bandwidth() / 2)
    .attr("r", 6) 
    .style("fill", "#4C4082");


//  --- LEGEND

const legendData = [
    { year: "1980", color: "#69b3a2" }, 
    { year: "2023", color: "#4C4082" } 
];
const legendItemSize = 10; 
const legendSpacing = 5;  
const legendItemHeight = legendItemSize + legendSpacing; 

const legendX = width - 200;
const legendY = 100;          

const legend = g.append("g") 
    .attr("class", "legend-container")
    .attr("transform", `translate(${legendX}, ${legendY})`);

// Legend Title
legend.append("text")
    .attr("x", 0)
    .attr("y", -10) 
    .style("font-weight", "bold")
    .style("font-size", "12px")
    .text("Year"); 

const legendItems = legend.selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    // Position each item vertically
    .attr("transform", (d, i) => `translate(0, ${i * legendItemHeight})`);

// Add circles (to match plot)
legendItems.append("circle") 
    .attr("cx", legendItemSize / 2) 
    .attr("cy", legendItemSize / 2) 
    .attr("r", legendItemSize / 2)  
    .style("fill", d => d.color);


legendItems.append("text")
    .attr("x", legendItemSize + legendSpacing * 2) 
    .attr("y", legendItemSize / 2) 
    .attr("dy", "0.35em") 
    .style("font-size", "11px") 
    .text(d => d.year);


    chartContainer.append(svg.node());

}).catch(error => {
    console.log("error is", error)
})
    console.log('Chart script executed and SVG appended.'); // Optional: for debugging
})(); 