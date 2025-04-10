
//  summarize discrete / continuous data at interval scale  
//  https://data.cityofnewyork.us/Environment/Air-Quality/c3uy-2p5r/about_data

(function() { 
    const chartContainer = document.getElementById('chartContainer');
    if (!chartContainer) {
        console.error("Error inside graph script: Container div with id 'chartContainer' not found.");
        return;
    }
    // ---------------------------------------------------------------------------------
    const dataUrl = '2025/Datasets/Global_Cybersecurity_Threats_2015-2024.csv'
    const margin = {top: 150, right: 180, bottom: 100, left: 100};
    const fullWidth =1080; // Total width of SVG
    const fullHeight = 700; 
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
    // 
    // --------------------------------------------------------------------------------
    // Main Title
    svg.append("text")
        .attr("x", fullWidth / 2) 
        .attr("y", margin.top / 2-30) 
        .attr("text-anchor", "middle") 
        .style("font-size", "26px")
        .style("font-weight", "bold")
        .text(`Global Cybersecurity Threats: Summary`);
    // Subtitle
    svg.append("text")
        .attr("x", fullWidth / 2)
        .attr("y", margin.top / 2 +40 ) 
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .text(` Distribution of Total Affected Users`); 
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
    svg.append("text")
        .attr("transform", "rotate(-90)") 
        .attr("y", margin.left / 2 - 30)
        .attr("x", 0 - (margin.top + height / 2)) 
        .attr("dy", "2em") 
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Number of occurances");
    // X-Axis Title
    svg.append("text")
        .attr("x", fullWidth/2)
        .attr("text-anchor", "middle")  
        .attr("y", fullHeight - margin.bottom/2)
        .text("Number of Users Affected");

//   Process data rows function - numbers etc 
function rowConverter(d) {
            return {
            year: +d['Year'],
            financialLossMillions: +d['Financial Loss (in Million $)'],
            attackType: d['Attack Type'],
            targetIndustry: d['Target Industry'],
            affectedUsers: +d['Number of Affected Users'],
            resoltionTime: +d['Incident Resolution Time (in Hours)']
            };
        }

d3.csv(dataUrl, rowConverter).then(data => {

// add the x-axis first for histogram *************
    const x = d3.scaleLinear()
        .domain([0,d3.max(data, function(d) {
            return d.affectedUsers
        })]) 
        .range([margin.left, fullWidth - margin.right]);
    svg.append("g")
        .attr("transform", `translate(0,${fullHeight- margin.bottom})`)
        .call(d3.axisBottom(x)
        .tickFormat("")
        .tickSizeOuter(0));
// histogram and bin math ----------------------------
    const histogram = d3.histogram()
                        .value(function(d){ return d.affectedUsers;})
                        .domain(x.domain())
                        .thresholds(x.ticks(10));

    const bins = histogram(data);
    const totalCount = data.length;
    let bottomTwoBinsCount = 0;
    if (bins.length > 0) {
        bottomTwoBinsCount += bins[0].length; // Count from the very first bin (index 0)
    }
    if (bins.length > 1) {
        bottomTwoBinsCount += bins[1].length; // Count from the second bin (index 1)
    }
    let percentageBottomTwo = 0;
    if (totalCount > 0) {
        percentageBottomTwo = (bottomTwoBinsCount / totalCount) * 100;
    }
    console.log(`Total items processed: ${totalCount}`);
    console.log(`Count in bottom two bins: ${bottomTwoBinsCount}`);
    console.log(`Percentage in bottom two bins: ${percentageBottomTwo.toFixed(2)}%`); // Format to 2 decimal places
    // ------------------------

    const formatNumber = d3.format(".2s"); 

    svg.append("g")
            .attr("class", "x-axis-labels")
            .attr("fill", "currentColor") 
            .attr("text-anchor", "middle") 
            .attr("font-size", "10px")
            .selectAll("text")
            .data(bins)
            .join("text")
            .attr("x", d => x(d.x0) + (x(d.x1) - x(d.x0)) / 2)
            .attr("y", fullHeight - margin.bottom + 15)
            .text(d => `${formatNumber(d.x0)}-${formatNumber(d.x1)}`);
// y
    const y = d3.scaleLinear()
            .domain([0, 
                d3.max(bins, function(d) { return d.length;})])
                .nice()
            .range([fullHeight - margin.bottom, margin.top]);

    svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
    svg.selectAll("rect")
            .data(bins)
            .join("rect")
            .attr("x",1)
            .attr("transform", function(d) { return `translate(${x(d.x0)} , ${y(d.length)})`})
            .attr("width", function(d) { return x(d.x1) - x(d.x0) -1})
            .attr("height", function(d) { return fullHeight- margin.bottom - y(d.length); })
            .style("fill", function(d){ if(d.x0<200000 ){return "#cf7a81"} else {return "#d3d9d2"}})
    svg.append("line")
            .attr("x1", x(200350) )
            .attr("x2", x(200350) )
            .attr("y1", y(0))
            .attr("y2", y(325))
            .attr("stroke", "grey")
            .attr("stroke-width", 5)
            .attr("stroke-dasharray", "8")
    svg.append("text")
            .attr("x", x(205000))
            .attr("y", y(325))
            .text(`Attacks affecting 200k people or below represent ${percentageBottomTwo.toFixed(2)} % of all cases`)
            .style("font-size", "15px")



            // 
    chartContainer.append(svg.node());
}).catch(error => {
    console.log("error w/ graph or data", error)
})
    console.log('Chart script executed and SVG appended.'); // Optional: for debugging

})(); 