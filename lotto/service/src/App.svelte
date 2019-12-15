<svelte:head>
	<meta charset='utf-8'>
</svelte:head>
<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	export let name;

	onMount(async () => {
		var margin = {top: 50, right: 50, bottom: 50, left: 50}
			, width = window.innerWidth - margin.left - margin.right
			, height = window.innerHeight - margin.top - margin.bottom;

		var n = 21;

		var xScale = d3.scaleLinear()
				.domain([0, n-1]) // input
				.range([0, width]); // output

		var yScale = d3.scaleLinear()
				.domain([0, 1]) // input 
				.range([height, 0]); // output 

		// 7. d3's line generator
		var line = d3.line()
				.x(function(d, i) { return xScale(i); }) // set the x values for the line generator
				.y(function(d) { return yScale(d.y); }) // set the y values for the line generator 
				.curve(d3.curveMonotoneX) // apply smoothing to the line

		// 8. An array of objects of length N. Each object has key -> value pair, the key being 'y' and the value is a random number
		var dataset = d3.range(n).map(function(d) { return {'y': d3.randomUniform(1)() } })

		// 1. Add the SVG to the page and employ #2
		var svg = d3.select('.line-chart').append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
			.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		// 3. Call the x axis in a group tag
		svg.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,' + height + ')')
				.call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

		// 4. Call the y axis in a group tag
		svg.append('g')
				.attr('class', 'y axis')
				.call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

		// 9. Append the path, bind the data, and call the line generator 
		svg.append('path')
				.datum(dataset) // 10. Binds data to the line 
				.attr('class', 'line') // Assign a class for styling 
				.attr('fill', 'none')
				.attr('stroke', '#ffab00')
				.attr('stroke-width', '3')
				.attr('d', line); // 11. Calls the line generator 

		// 12. Appends a circle for each datapoint 
		svg.selectAll('.dot')
				.data(dataset)
			.enter().append('circle') // Uses the enter().append() method
				.attr('class', 'dot') // Assign a class for styling
				.attr('cx', function(d, i) { return xScale(i) })
				.attr('cy', function(d) { return yScale(d.y) })
				.attr('r', 5)
				.attr('fill', '#ffab00')
				.attr('stroke', '#fff')
					.on('mouseover', function(a, b, c) {
				})
					.on('mouseout', function() {  })
	})
</script>

<main>
	<div class='line-chart'>
		<circle class='dot'></circle>
	</div>
</main>

<style>
	.line {
			fill: none;
			stroke: #ffab00;
			stroke-width: 3;
	}
		
	.overlay {
		fill: none;
		pointer-events: all;
	}

	/* Style the dots by assigning a fill and stroke */
	.dot {
			
	}
		
	.focus circle {
		fill: none;
		stroke: steelblue;
	}
</style>