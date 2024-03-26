// Load the data
const penguins = d3.csv("penguins.csv");

// Once the data is loaded, proceed with plotting
penguins.then(function (data) {
    // Convert string values to numbers
    data.forEach(function (d) {
        d.bill_length_mm = +d.bill_length_mm;
        d.flipper_length_mm = +d.flipper_length_mm;
    });

    // Define the dimensions and margins for the SVG

    let width = 600, height = 400;
    let margin = {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
    }

    // Create the SVG container

    let svg = d3.select('#scatterplot')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'lightblue')

    // Set up scales for x and y axes
    // d3.min(data, d => d.bill_length_mm)-5

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.species))
        .range(d3.schemeCategory10);

    // Add scales     

    let yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.flipper_length_mm) - 5, d3.max(data, d => d.flipper_length_mm) + 5])
        .range([height - margin.bottom, margin.top]);

    let yAxis = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft().scale(yScale))

    let xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.bill_length_mm) - 5, d3.max(data, d => d.bill_length_mm) + 5])
        .range([margin.left, width - margin.right])

    let xAxis = svg
        .append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom().scale(xScale))


    // Add circles for each data point

    let circle = svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.bill_length_mm))
        .attr('cy', d => yScale(d.flipper_length_mm))
        .attr('r', 5)
        .attr('fill', d => colorScale(d.species))

    // Add x-axis label

    xAxis.append('text')
        .attr('x', 570)
        .attr('y', -10)
        .style('stroke', 'black')
        .text('Bill Length');


    // Add y-axis label

    yAxis.append('text')
        .attr('x', 40)
        .attr('y', 20)
        .style('stroke', 'black')
        .text('Flipper Length');


    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(90," + (i * 20 + 60) + ")");

    legend.append('text')
        .attr('x', 10)
        .attr('y', 5)
        .text(d => d)

    legend.append('circle')
        .attr('r', 5)
        .attr('fill', colorScale)

});

penguins.then(function (data) {
    // Convert string values to numbers

    data.forEach(function (d) {
        d.flipper_length_mm = +d.flipper_length_mm;
    });

    // Define the dimensions and margins for the SVG

    let width = 600, height = 400;
    let margin = {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
    }

    // Create the SVG container

    let svg = d3.select('#boxplot')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'lightblue')

    // Set up scales for x and y axes

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.species))
        .range(d3.schemeCategory10);

    // Add scales     
    
    let yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.flipper_length_mm) - 5, d3.max(data, d => d.flipper_length_mm) + 5])
        .range([height - margin.bottom, margin.top]);

    let yAxis = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft().scale(yScale))

    let xScale = d3.scaleBand()
        .domain(data.map(d => d.species))
        .range([margin.left, width - margin.right])
        .padding(0.5)

    let xAxis = svg
        .append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom().scale(xScale))

    // Add x-axis label

    xAxis.append('text')
        .attr('x', 570)
        .attr('y', -10)
        .style('stroke', 'black')
        .text('Species');

    // Add y-axis label

    yAxis.append('text')
        .attr('x', 40)
        .attr('y', 20)
        .style('stroke', 'black')
        .text('Flipper Length');

    const rollupFunction = function (groupData) {
        const values = groupData.map(d => d.flipper_length_mm).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const min = q1 - 1.5 * iqr;
        const max = q3 + 1.5 * iqr;
        return { q1, median, q3, iqr, min, max };
    };

    // This is grouping together the quartiles for each of the different species so that it can be easily graphed.
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.species);

    // This is applying a box size for the value of each of the quartiles by species.
    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScale(species);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines

    svg.append('line')
        .attr('class', 'lines')
        .attr('x1', x + boxWidth / 2)
        .attr('x2', x + boxWidth / 2)
        .attr('y1', yScale(quartiles.min))
        .attr('y2', yScale(quartiles.max))
        .attr('stroke', 'black')
        .attr('stroke-width', 2);

        // Draw box

    svg.append('rect')
        .attr('x', x)
        .attr('y', yScale(quartiles.q3))
        .attr('width', boxWidth)
        .attr('height', yScale(quartiles.q1) - yScale(quartiles.q3))
        .attr('fill', colorScale(species));

        // Draw median line

    svg.append('line')
        .attr('class', 'lines')
        .attr('x1', x)
        .attr('x2', x + boxWidth)
        .attr('y1', yScale(quartiles.median))
        .attr('y2', yScale(quartiles.median))
        .attr('stroke', 'black')
        .attr('stroke-width', 2);


    });
});