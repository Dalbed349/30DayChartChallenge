// data.gov 
    (function() { 
        const chartContainer = document.getElementById('chartContainer');
        if (!chartContainer) {
            console.error("Error inside graph script: Container div with id 'chartContainer' not found.");
            return;
        }
        // ---  ---
        const dataUrl = '2025/Scripts/12_dataGov/cdc_data_d3.csv'
        const margin = {top: 150, right: 150, bottom: 100, left:150};
        const fullWidth =1080; // Total width of SVG
        const fullHeight = 800; 
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
            .text(`CDC Census Report: Percent of adults who engage in no leisure-time physical activity`);
        // Subtitle
        svg.append("text")
            .attr('id', 'year-display')
            .attr("x", fullWidth / 2)
            .attr("y", margin.top / 2 +40 ) 
            .attr("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "bold")
            .text(` Subtitle`); 

            const datasetUrl = 'https://data.cdc.gov/api/views/hn4x-zwk7/rows.json?accessType=DOWNLOAD';
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
        // svg.append("text")
        //     .attr("x", fullWidth/2)
        //     .attr("text-anchor", "middle")  
        //     .attr("y", fullHeight - margin.bottom/2)
        //     .text("Vehicle Miles Traveled");
        // d3.select(chartContainer).append('div')
        //     .attr('id', 'year-display') // Crucial: Keep the ID for selection later
        //     .style('font-size', '1.5em') // Example: Apply styles directly
        //     .style('font-weight', 'bold')
        //     .style('margin-bottom', '10px')
        //     .text('Year: Loading...'); // Initial text
    // -----------------------------------------------------------------
    let yearIndex = 0;
    let sortedYears = [];
    let animationInterval = null;
    const intervalDuration = 2000;
    const targetQuestion = "Percent of adults who engage in no leisure-time physical activity";
    const targetStratification = "Overall"; 

    const colorScale = d3.scaleQuantize()
        .range(d3.schemeBlues[9]); 

    // --- Load Data ---
    Promise.all([
        d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"), // US states TopoJSON with FIPS ids
        d3.csv(dataUrl) 
    ]).then(([us, cdcData]) => {
        console.log("Data loaded:", us, cdcData.length, "rows");
        const statesGeoJSON = topojson.feature(us, us.objects.states);
        console.log("GeoJSON features:", statesGeoJSON.features.length);
        const projection = d3.geoAlbersUsa().fitSize([width, height], statesGeoJSON); // Auto-fit to SVG size
        const pathGenerator = d3.geoPath().projection(projection);

        // --- Process CDC Data ---
        const dataMap = new Map();
        let globalMaxValue = 0;

        cdcData.forEach(d => {
            // Convert year and value to numbers
            const year = +d.YearStart; // '+' converts string to number
            const fips = d.StateFIPS;
            const value = +d.DataValue;

                // Create inner map if year doesn't exist
                if (!dataMap.has(year)) {
                    dataMap.set(year, new Map());
                }
                // Store value keyed by FIPS for that year
                dataMap.get(year).set(fips, value);

                // Track the global maximum value across all relevant data
                if (value > globalMaxValue) {
                    globalMaxValue = value;
                }
        });
        sortedYears = Array.from(dataMap.keys()).sort((a,b) => a - b)

        console.log(`Processed data for ${sortedYears.length} years: ${sortedYears.join(', ')}`);
        console.log(`Global Max Value for ${targetQuestion} (${targetStratification}): ${globalMaxValue}`);

        if (sortedYears.length === 0) {
            yearDisplay.text("Error: No data found matching criteria.");
            console.error("No data matched the filter criteria across all years.");
            return; // Stop if no relevant data
        }

        // --- Update Color Scale Domain ---
        colorScale.domain([0,globalMaxValue]); // Set domain from min to max value

        // --- Convert TopoJSON to GeoJSON ---
        // The TopoJSON file has state geometries. 'states' is the object key within the TopoJSON file.

        // --- Draw the Map ---
        g.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(statesGeoJSON.features)
            .join("path")
              .attr("d", pathGenerator)
              .attr("fill", "#ccc")

        // --- Draw State Borders ---
        // Use topojson.mesh to get interior borders between states
        g.append("path")
            .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "#fff") // White borders
            .attr("stroke-linejoin", "round")
            .attr("d", pathGenerator);

        // --- Add Legend (Basic Example - customize or use d3-legend library) ---
        const legendWidth = 260;
        const legendHeight = 8; // Height of each color rect
        const legendMargin = { top: 10, right: 10, bottom: 10, left: 10 };

        const legendSvg = g.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - legendWidth - legendMargin.right}, ${height - 50})`); // Position legend

        const legendScale = d3.scaleLinear()
             .domain(colorScale.domain())
             .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
             .ticks(5) // Adjust number of ticks
             .tickSize(legendHeight * 1.5)
             .tickFormat(d => d.toFixed(0) + '%'); // Format ticks as percentage

        legendSvg.selectAll("rect")
            .data(colorScale.range().map(color => {
                const d = colorScale.invertExtent(color);
                if (!d[0]) d[0] = legendScale.domain()[0];
                if (!d[1]) d[1] = legendScale.domain()[1];
                return d;
            }))
            .enter().append("rect")
              .attr("height", legendHeight)
              .attr("x", d => legendScale(d[0]))
              .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
              .attr("fill", d => colorScale(d[0]));

        legendSvg.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis)
            .select(".domain").remove(); // Remove the axis line

        legendSvg.append("text")
            .attr("x", 0)
            .attr("y", -5)
            .attr("fill", "#000")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-size", "12px")
            .text("Percent (%)");

        chartContainer.append(svg.node());
        updateMap(); // Initial call to display the first year
        animationInterval = setInterval(updateMap, intervalDuration);
        
        function updateMap() {
            if (sortedYears.length === 0) return; // Stop if no years
            const yearDisplay = d3.select("#year-display");

            const currentYear = sortedYears[yearIndex];
            yearDisplay.text(`Year: ${currentYear}`); // Update year display
    
            const currentYearData = dataMap.get(currentYear) || new Map(); // Get data for current year
    
            // Select states and update fill color
            svg.selectAll(".states path")
                .transition() // Add a smooth transition (optional)
                .duration(500) // Duration of the transition in ms
                .attr("fill", d => {
                    const stateFIPS = d.id;
                    const value = currentYearData.get(stateFIPS);
                    return value !== undefined ? colorScale(value) : "#ccc"; // Use color scale or gray
                });
    
            // Move to the next year, looping back to the start
            yearIndex = (yearIndex + 1) % sortedYears.length;
        }
    }).catch(error => {
        console.log("error is", error)
    })

        console.log('Chart script executed and SVG appended.'); // Optional: for debugging
    })(); 