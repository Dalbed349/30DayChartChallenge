(function() {
    const chartContainer = document.getElementById('chartContainer');
    if (!chartContainer) {
        console.error("Error inside graph script: Container div with id 'chartContainer' not found.");
        return;
    }
// //////////////////////////////////////////////////////////////////////////////////////////////////////////
    const dataUrl = '2025/Datasets/Global_Cybersecurity_Threats_2015-2024.csv'
    const margin = {top: 150, right: 180, bottom: 50, left: 100};
    const fullWidth =1080; // Total width of SVG
    const fullHeight = 700; 
    const width = fullWidth - margin.left - margin.right; // Chart area width
    const height = fullHeight - margin.top - margin.bottom; 
    const axisBottomPadding = 15;
    const svg = d3.create("svg")
        .attr("width", fullWidth)
        .attr("height", fullHeight)
        .attr("viewBox", [0, 0, fullWidth, fullHeight]) 
        .attr("style", "max-width: 100%; height: auto;"); 
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const targetYear = 2024;
    // Main Title
    svg.append("text")
        .attr("x", fullWidth / 2) 
        .attr("y", margin.top / 2-30) 
        .attr("text-anchor", "middle") 
        .style("font-size", "26px")
        .style("font-weight", "bold")
        .text(`Global Cybersecurity Threats: ${targetYear} Summary`);
    // Subtitle
    svg.append("text")
        .attr("x", fullWidth / 2)
        .attr("y", margin.top / 2 ) 
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .style("font-weight", "bold")
        .text(` Distribution of Incident Response Times by Targeted Industry`); 
        const datasetUrl = 'https://www.kaggle.com/datasets/atharvasoundankar/global-cybersecurity-threats-2015-2024/data';
        const linkText = 'Kaggle Dataset Link';
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
        .text("Resolution Time (Hours)");
    // X-Axis Title
    // svg.append("text")
    //     .attr("x", margin.left + width / 2) 
    //     .attr("y", fullHeight - margin.bottom / 2 + 20) 
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "12px")
    //     .text("Target Industry");

// // ////////////////////////Title Done //////////////////////////////////////////////////////////////////

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
// ///////////////////////////////////////Tooltip -=---------------------------------------------------------------------------
    let tooltip = d3.select("body").select(".tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip") 
            .style("opacity", 0);
    }
    // (event, d) where 'event' has mouse info and 'd' is data
    const mouseover = function(event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9); 
        tooltip.html(`
                <strong>Attack Type:</strong> ${d.attackType}<br>
                <strong>Resolution Time:</strong> ${d.resoltionTime ? d.resoltionTime.toLocaleString() : 'N/A'}`) 
            .style("left", (event.pageX + 15) + "px") 
            .style("top", (event.pageY - 28) + "px");
    };
    const mousemove = function(event, d) {
        // Update position using event.pageX/Y
        tooltip.style("left", (event.pageX + 15) + "px")
               .style("top", (event.pageY - 28) + "px");
    };
    const mouseleave = function(event, d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0); 
    };
    // ///////////////////////////////////////Tooltip DONE -=---------------------------------------------------------------------------
    d3.csv(dataUrl, rowConverter).then(data => {
        // Filter on d.year 
        data = data.filter(d => d.year === targetYear)
        const plotData = data.filter(d =>
            d.resoltionTime !== null &&
            !isNaN(d.resoltionTime) && 
            d.targetIndustry !== null &&     
            typeof d.targetIndustry === 'string' 
        );
        if (plotData.length === 0) {
            console.error("No valid data to plot after filtering. Check CSV content and rowConverter.");
            chartContainer.innerHTML = `<p style="color: red;">No valid data found. Check console.</p>`;
            return; // Stop if no data
        }
        const sumstatMap = d3.rollup(plotData, group => {
            const lengths = group.map(d => d.resoltionTime).sort(d3.ascending); 
            const q1 = d3.quantile(lengths, 0.25);
            const median = d3.quantile(lengths, 0.5);
            const q3 = d3.quantile(lengths, 0.75);
            const interQuantileRange = q3 - q1;
            const actualMin = d3.min(lengths);
            const actualMax = d3.max(lengths);
            const minWhisker = q1 - 1.5 * interQuantileRange;
            const maxWhisker = q3 + 1.5 * interQuantileRange;
            const min = Math.max(actualMin, minWhisker);
            const max = Math.min(actualMax, maxWhisker);

            return { q1, median, q3, interQuantileRange, min, max, minWhisker, maxWhisker };
        }, d => d.targetIndustry); // group by targeted Industry 
        // Convert the Map returned by d3.rollup into an array suitable for d3.data()
        const sumstat = Array.from(sumstatMap, ([key, value]) => ({ key, value }));
        sumstat.sort((a, b) => {
            // Handle potential NaN values 
            const medianA = a.value.median ?? -Infinity; 
            const medianB = b.value.median ?? -Infinity;
            return medianA - medianB; 
        });
// --- Scales ---
// X scale
        const x = d3.scaleBand()
            .domain(sumstat.map(d => d.key))  
            .range([0, width])
            .paddingInner(0.8) 
            .paddingOuter(0.3); 
// Y Scale 
        const yDomain = d3.extent(plotData, d => d.resoltionTime); 
        const y = d3.scaleLinear()
            .domain(yDomain).nice() 
            .range([height - axisBottomPadding, 0]); 
// Color Scale for Cyber attackType
            const uniqueAttackTypes = Array.from(new Set(plotData.map(d => d.attackType))).sort();
            const colorScale = d3.scaleOrdinal()
                .domain(uniqueAttackTypes)
                .range(d3.schemeTableau10);
// --- Axes ---
// Add X axis
        const xAxisGroup = g.append("g")
            .attr("transform", `translate(0, -25)`)
            .style("font-weight", "bold")
            .style("font-size", "12px")
            .call(d3.axisTop(x));
            xAxisGroup.select(".domain").remove();
// Add Y axis
        g.append("g")
            .call(d3.axisLeft(y))
            .style("font-size", "12px");

// --- Draw Box Plot Elements ---
        const boxWidth = x.bandwidth(); // Use scale's bandwidth for box width

// Vertical Lines (Whiskers)
        g.selectAll(".vertLines") // Use classes for selection
            .data(sumstat)
            .enter()
            .append("line")
            .attr("class", "vertLines")
            .attr("x1", d => x(d.key) + boxWidth / 2)
            .attr("x2", d => x(d.key) + boxWidth / 2)
            .attr("y1", d => y(d.value.min))
            .attr("y2", d => y(d.value.max))
            .attr("stroke", "black")
            .attr("stroke-width", 1);

// Boxes (Interquartile Range)
        g.selectAll(".boxes")
            .data(sumstat)
            .enter()
            .append("rect")
            .attr("class", "boxes")
            .attr("x", d => x(d.key))
            .attr("y", d => y(d.value.q3))
            .attr("height", d => y(d.value.q1) - y(d.value.q3))
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .attr("fill", "#69b3a2"); // Box color

// Median Lines
        g.selectAll(".medianLines")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("class", "medianLines")
            .attr("x1", d => x(d.key))
            .attr("x2", d => x(d.key) + boxWidth)
            .attr("y1", d => y(d.value.median))
            .attr("y2", d => y(d.value.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2); // Make median line thicker

// --- Draw Points ---
        const jitterWidth = boxWidth * 1 // Jitter within a fraction of the box width
        g.selectAll(".indPoints")
            .data(plotData) // Bind to the original data
            .enter()
            .append("circle")
            .attr("class", "indPoints")
            .attr("cx", d => x(d.targetIndustry) + boxWidth / 2 - jitterWidth / 2 + Math.random() * jitterWidth) 
            .attr("cy", d => y(d.resoltionTime))
            .attr("r", 3) 
            .attr("fill", d => colorScale(d.attackType)) 
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .style("opacity", 0.6)
            .on("mouseover", mouseover) 
            .on("mousemove", mousemove) 
            .on("mouseout", mouseleave); 

//  --- LEGEND
            const legendItemSize = 12;
            const legendSpacing = 4;
            const legendX = width + margin.right - 150; // Position legend in top-right area
            const legendY = -margin.top + 270; // Adjust Y position relative to top margin
   
            const legend = g.append("g")
               .attr("class", "legend-container")
               .attr("transform", `translate(${legendX}, ${legendY})`);
   
            legend.append("text")
                .attr("x", 0)
                .attr("y", -10) // Position title above items
                .style("font-weight", "bold")
                .style("font-size", "12px")
                .text("Attack Type");
   
            const legendItems = legend.selectAll(".legend-item")
                .data(uniqueAttackTypes)
                .enter()
                .append("g")
                .attr("class", "legend-item")
                .attr("transform", (d, i) => `translate(0, ${i * (legendItemSize + legendSpacing)})`); // Vertical spacing
   
            legendItems.append("rect") // Or circle
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", legendItemSize)
                .attr("height", legendItemSize)
                .style("fill", d => colorScale(d)); // Use color scale
   
            legendItems.append("text")
                .attr("x", legendItemSize + legendSpacing * 2) 
                .attr("y", legendItemSize / 2) 
                .attr("dy", "0.35em") 
                .style("font-size", "10px")
                .text(d => d); 

//  MEDIAN LINE OVERALL INDUSTRY MEDIAN 
            const allResolutionTimes = plotData.map(d => d.resoltionTime).filter(t => t !== null && !isNaN(t)).sort(d3.ascending);
            const overallMedian = d3.median(allResolutionTimes);
            if (overallMedian !== undefined && !isNaN(overallMedian)) { // Only draw if median is valid
                g.append("line")
                    .attr("class", "overall-median-line")
                    .attr("x1", 0)                
                    .attr("x2", width)             
                    .attr("y1", y(overallMedian))     
                    .attr("y2", y(overallMedian))      
                    .attr("stroke", "red")            
                    .attr("stroke-width", 1.5)         
                    .attr("stroke-dasharray", "5,5"); 
                g.append("text")
                   .attr("class", "overall-median-label")
                   .attr("x", width+50) 
                   .attr("y", y(overallMedian)) 
                   .attr("dy", "-0.3em") 
                   .attr("dx", "5.3em") 
                   .attr("text-anchor", "end") 
                   .style("font-size", "12px")
                   .text(`Overall Median: ${overallMedian.toFixed(1)} hrs`); 
            }
// --- Append SVG
        chartContainer.innerHTML = '';
        chartContainer.append(svg.node())
        }).catch(error => {
            console.error("Error loading or processing data:", error);
        });
    
    })();