document.addEventListener('DOMContentLoaded', () => {
    // Get references to the necessary HTML elements
    const graphSelector = document.getElementById('graphSelector');
    const chartContainer = document.getElementById('chartContainer');
    if (!graphSelector) {
        console.error("Error: Dropdown with id 'graphSelector' not found.");
        return; 
    }
    if (!chartContainer) {
        console.error("Error: Container div with id 'chartContainer' not found.");
        return; 
    }
    // Add an event listener that triggers when the selected option changes
    graphSelector.addEventListener('change', (event) => {
        const selectedGraphValue = event.target.value;

        chartContainer.innerHTML = '';
        if (selectedGraphValue) {
            const scriptPath = `2025/scripts/${selectedGraphValue}/script.js`;
            const graphScript = document.createElement('script');
            graphScript.src = scriptPath;
            graphScript.onerror = () => {
                console.error(`Failed to load graph script: ${scriptPath}`);
                chartContainer.innerHTML = `<p style="color: red;">Sorry, could not load the script for "${selectedGraphValue}". Please check the console.</p>`;
            };
            document.head.appendChild(graphScript);

        }
    });

    graphSelector.dispatchEvent(new Event('change'));

}); 