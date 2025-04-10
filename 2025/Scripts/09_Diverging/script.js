
(function() { 

  
    const chartContainer = document.getElementById('chartContainer');
    if (!chartContainer) {
        console.error("Error inside graph script: Container div with id 'chartContainer' not found.");
        return;
    }

    // --- Your existing chart code goes here ---
    const width = 640;
    const height = 400;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 30;
    const marginLeft = 40;

    // Declare the x (horizontal position) scale.
    const x = d3.scaleUtc()
        .domain([new Date("2023-01-01"), new Date("2024-01-01")]) // Adjust domain as needed per chart
        .range([marginLeft, width - marginRight]);

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
        .domain([0, 100]) // Adjust domain as needed per chart
        .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    // Add the x-axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x));

    // Add the y-axis.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y));
    
        svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("life expectancy (years)");
    // --- Add your specific chart drawing logic here (lines, bars, etc.) ---
    // e.g., svg.append("path").datum(data)....


    // Append the SVG element to the container.
    chartContainer.append(svg.node());

    console.log('Chart script executed and SVG appended.'); // Optional: for debugging

})(); 