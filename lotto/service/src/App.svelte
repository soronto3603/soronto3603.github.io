<svelte:head>
	<meta charset='utf-8'>
</svelte:head>
<script>
	import * as d3 from 'd3';
	import { onMount } from 'svelte';
	// import dataset from '../data/statistics.json';
	export let name;

	onMount(async () => {
		var margin = {top: 50, right: 50, bottom: 50, left: 50}
			, width = window.innerWidth - margin.left - margin.right
			, height = window.innerHeight - margin.top - margin.bottom;

		var n = 21;

		var xScale = d3.scaleLinear()
				.domain([0, n-1])
				.range([0, width]);

		var yScale = d3.scaleLinear()
				.domain([0, 1])
				.range([height, 0]);

		var line = d3.line()
				.x(function(d, i) { return xScale(i); })
				.y(function(d) { return yScale(d.y); })
				.curve(d3.curveMonotoneX)

		var dataset = d3.range(n).map(function(d) { return {'y': d3.randomUniform(1)() } })


		var svg = d3.select('.line-chart').append('svg')
				.attr('width', width + margin.left + margin.right)
				.attr('height', height + margin.top + margin.bottom)
			.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		svg.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,' + height + ')')
				.call(d3.axisBottom(xScale));

		svg.append('g')
				.attr('class', 'y axis')
				.call(d3.axisLeft(yScale));

		svg.append('path')
				.datum(dataset)
				.attr('class', 'line')
				.attr('fill', 'none')
				.attr('stroke', '#ffab00')
				.attr('stroke-width', '3')
				.attr('d', line);

		svg.selectAll('.dot')
				.data(dataset)
			.enter().append('circle')
				.attr('class', 'dot')
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

</style>