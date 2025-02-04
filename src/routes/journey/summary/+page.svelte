<script lang="ts">
	import eu_land_usage from '$lib/data/eu_land_usage.json';
	import half_index_data from '$lib/data/half_index_by_iso_3_country.json5';
	import {
		Chart,
		BarController,
		BarElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Legend
	} from 'chart.js';
	import Annotation from 'chartjs-plugin-annotation';
	import { onMount } from 'svelte';
	let chart_canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart<'bar', number[], string> | undefined = undefined;

	const alpha_3_eu = [
		'AUT',
		'BEL',
		'BGR',
		'HRV',
		'CYP',
		'CZE',
		'DNK',
		'EST',
		'FIN',
		'FRA',
		'DEU',
		'GRC',
		'HUN',
		'IRL',
		'ITA',
		'LVA',
		'LTU',
		'LUX',
		'MLT',
		'NLD',
		'POL',
		'PRT',
		'ROU',
		'SVK',
		'SVN',
		'ESP',
		'SWE'
	];

	onMount(() => {
		Chart.register(
			BarController,
			BarElement,
			CategoryScale,
			LinearScale,
			Tooltip,
			Annotation,
			Legend
		);
		let combined_data = alpha_3_eu.map((cc) => ({
			label: half_index_data[cc].name,
			index: eu_land_usage[cc],
			half: half_index_data[cc].index
		}));
		combined_data.sort((a, b) => b.index - a.index);
		console.log(combined_data);
		let sorted_labels = combined_data.map((item) => item.label);
		let sorted_dataset_data = combined_data.map((item) => item.index as number);
		let sorted_dataset_half_data = combined_data.map((item) => item.half as number);

		const land_usage_line = {
			type: 'line',
			scaleID: 'y',
			value: 38.4,
			label: {
				content: 'EU average land usage',
				display: true
			},
			borderWidth: 4,
			borderColor: '#FFB1C180'
		};
		const half_index_line = {
			type: 'line',
			scaleID: 'y',
			value: 95.6,
			label: {
				content: 'EU average HALF index',
				display: true
			},
			borderWidth: 4,
			borderColor: '#9BD0F580'
		};

		chart = new Chart(chart_canvas, {
			type: 'bar',
			data: {
				labels: sorted_labels,
				datasets: [
					{
						data: sorted_dataset_data,
						backgroundColor: new Array(sorted_dataset_data.length).fill('#FFB1C1'),
						label: '% of space used by agriculture'
					},
					{
						data: sorted_dataset_half_data,
						backgroundColor: new Array(sorted_dataset_half_data.length).fill('#9BD0F5'),
						label: 'HALF-index'
					}
				]
			},
			options: {
				plugins: {
					annotation: {
						annotations: {
							land_usage_line,
							half_index_line
						}
					}
				}
			}
		});
	});
</script>

<div class="flex min-h-screen flex-col">
	<h1 class="marck-script mx-auto mt-4 text-8xl">The End</h1>
	<p class="mx-auto">I hope you've learned something, but we're not completely done yet.</p>
	<p class="mx-auto">
		38.4% of the EU's land is used for food production. In the following chart, the amount of land
		used by every country for agricultural purposes can be seen.
	</p>
	<canvas class="mx-4" bind:this={chart_canvas}></canvas>
	<p class="mx-auto">
		This visualization shows again that we in the EU are far from future proof if we consider our
		eating habits.
	</p>
	<p class="mx-auto text-xl font-extrabold">This cannot stay like this.</p>
	<p class="mx-auto">
		We need to change. You already had the chance to figure some problematic foods out on your own,
		but it can also be really simple:
	</p>
	<p class="mx-auto text-xl font-extrabold">Eat less meat and dairy products.</p>
	<p class="mx-auto">Those require lots of land and thus being very inefficient.</p>
	<p class="mx-auto text-3xl font-extrabold mb-64 mt-64">Let us reconsider our eating habits.</p>
</div>
