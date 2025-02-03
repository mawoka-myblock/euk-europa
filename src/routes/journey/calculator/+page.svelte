<script lang="ts">
	import type { PageData } from './$types';
	import FoodData from '$lib/data/foods.json';
	import {
		Chart,
		BarController,
		BarElement,
		CategoryScale,
		LinearScale,
		RadarController,
		RadialLinearScale,
		PointElement,
		LineController,
		LineElement,
		type ChartDataset
	} from 'chart.js';
	import BrownButton from '$lib/components/BrownButton.svelte';
	import { onMount } from 'svelte';
	import ChangeAmount from './ChangeAmount.svelte';
	import { page } from '$app/stores';
	let { data }: { data: PageData } = $props();

	let food_to_add = $state('');
	let chart_canvas: HTMLCanvasElement | undefined = $state();
	// let radar_chart_canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart<'bar', number[], string> | undefined = undefined;
	// let radar_chart: Chart<'radar', number[], string> | undefined = undefined;

	type FoodDataType = {
		[k: string]: {
			water_per_kg: number;
			ghg_emissions_per_kg: number;
			land_use_per_kg: number;
			scarcity_weighted_water_use_per_kg: number;
		};
	};

	type FoodDataTypeAdjusted = {
		[k: string]: {
			water_per_kg: number;
			ghg_emissions_per_kg: number;
			land_use_per_kg: number;
			scarcity_weighted_water_use_per_kg: number;
			kilo_per_year: number;
			weight_per_unit: number | null;
			color: string;
		};
	};

	let selected_food: FoodDataTypeAdjusted = $state({});

	let change_amount_of: string | undefined = $state(undefined);

	let food_amount_data: {
		[k: string]: {
			grams: number;
			frequency: number;
			period_multiplier: number;
		};
	} = $state({});

	const add_food = () => {
		let added_food = food_to_add;
		selected_food[food_to_add] = { ...FoodData[food_to_add], kilo_per_year: 1 };
		food_to_add = '';
		open_change_amount_of(added_food);
	};

	const save_data = () => {
		let new_url = new URL($page.url.href);
		new_url.searchParams.set('selected_food', JSON.stringify(Object.keys(selected_food)));
		new_url.searchParams.set('food_amount_data', JSON.stringify(food_amount_data));
		window.history.pushState(null, '', new_url);
	};

	let change_amount_of_data = $state({
		grams: 0,
		grams_raw: '',
		frequency_raw: '',
		frequency: 0,
		period_multiplier: 1
	});

	onMount(() => {
		Chart.register(
			BarController,
			BarElement,
			CategoryScale,
			LinearScale,
			RadarController,
			RadarController,
			RadialLinearScale,
			PointElement,
			LineController,
			LineElement
		);
		let params = $page.url.searchParams;
		let param_selected_food = params.get('selected_food');
		let param_food_amount_data = params.get('food_amount_data');
		if (param_food_amount_data) {
			food_amount_data = JSON.parse(param_food_amount_data);
		}
		if (param_selected_food) {
			let selected_food_array = JSON.parse(param_selected_food);
			let temp_selected_food = {};
			for (let fi of selected_food_array) {
				temp_selected_food[fi] = {
					...FoodData[fi],
					kilo_per_year:
						(food_amount_data[fi].frequency *
							food_amount_data[fi].grams *
							food_amount_data[fi].period_multiplier) /
						1000
				};
			}
			selected_food = temp_selected_food;
			render_chart();
		}
	});

	$inspect(selected_food);

	const open_change_amount_of = (food: string) => {
		if (food_amount_data[food]) {
			change_amount_of_data = {
				grams: food_amount_data[food].grams,
				grams_raw: food_amount_data[food].grams.toString(),
				frequency_raw: food_amount_data[food].frequency.toString(),
				frequency: food_amount_data[food].frequency,
				period_multiplier: food_amount_data[food].period_multiplier
			};
		} else {
			change_amount_of_data = {
				grams: 0,
				grams_raw: '',
				frequency_raw: '',
				frequency: 0,
				period_multiplier: 365
			};
		}
		if (selected_food[food].weight_per_unit) {
			change_amount_of_data.grams = parseInt(
				(selected_food[food].weight_per_unit * 1000).toFixed(0)
			);
			change_amount_of_data.grams_raw = String(change_amount_of_data.grams);
		}
		change_amount_of = food;
	};

	const render_chart = () => {
		chart = new Chart(chart_canvas, {
			type: 'bar',
			data: {
				labels: Object.keys(selected_food),
				datasets: [
					{
						label: 'm² of land',
						borderWidth: 1,
						data: Object.values(selected_food).map((d) => {
							return d.kilo_per_year * d.land_use_per_kg;
						}),
						backgroundColor: Object.values(selected_food).map((d) => {
							return d.color + '95';
						})
					}
				]
			}
		});
	};
	/*
	const render_radar_chart = () => {
		let datasets: ChartDataset[] = [];
		for (const [food_name, data] of Object.entries(selected_food)) {
			datasets.push({
				label: food_name,
				data: [
					data.water_per_kg,
					data.ghg_emissions_per_kg,
					data.land_use_per_kg
					// data.scarcity_weighted_water_use_per_kg
				],
				backgroundColor: data.color
			});
		}
		if (radar_chart) {
			radar_chart.destroy();
			radar_chart = undefined;
		}

		radar_chart = new Chart(radar_chart_canvas, {
			type: 'radar',
			data: {
				labels: ['Water', 'Greenhouse Gas Emissions', 'Land usage', 'Scarcity Water'],
				datasets
			}
		});
	};
	*/
</script>

<div class="min-h-screen">
	<div class="mx-2 flex flex-col">
		<h1 class="mx-auto text-6xl">Calculate food data</h1>
		<p class="mx-auto">
			Hi {data.name}! let's calculate your basic food emissions, like land requirement, water usage
			and greenhouse gas emissions.
		</p>
		<p>
			You can set all the food you eat regularly here. Select them in the dropdown on the left and
			click "add".
		</p>
	</div>
	<div class="m-2 grid grid-rows-2 lg:grid-cols-2">
		<div class="flex flex-col">
			<div class="flex flex-col gap-2">
				{#each Object.entries(selected_food) as [food, food_data]}
					<div class="rounded shadow-lg bg-black/10 p-2">
						<p class="text-center">{food}</p>
						<p>
							You eat {food_data.kilo_per_year}kg/year and it requires {food_data.land_use_per_kg}m²/kg
							of land.
						</p>
						<div class="p-1">
							<BrownButton
								on:click={() => {
									open_change_amount_of(food);
								}}>Change amount</BrownButton
							>
						</div>
					</div>
				{/each}
			</div>
			<div class="m-2 flex flex-row gap-2">
				<select bind:value={food_to_add}>
					{#each Object.keys(FoodData) as food_key}
						<option value={food_key}>{food_key}</option>
					{/each}
				</select>
				<BrownButton on:click={add_food} disabled={!food_to_add}>Add!</BrownButton>
			</div>
		</div>
		<div class="mx-2">
			<canvas bind:this={chart_canvas}></canvas>
			<p>
				The chart above shows the land usage for the different foods you've selected over the year.
				This should make it easier for you to see where you can save some land usage.
			</p>
			<p>
				That means that your eating habits require {Object.values(selected_food)
					.reduce(
						(acc, { kilo_per_year, land_use_per_kg }) => acc + kilo_per_year * land_use_per_kg,
						0
					)
					.toFixed(0)}m² of land. Just for you. But it also emits {Object.values(selected_food)
					.reduce(
						(acc, { kilo_per_year, ghg_emissions_per_kg }) =>
							acc + kilo_per_year * ghg_emissions_per_kg,
						0
					)
					.toFixed(0)}kg of Greenhouse Gases every year. And you also require {Object.values(
					selected_food
				)
					.reduce((acc, { kilo_per_year, water_per_kg }) => acc + kilo_per_year * water_per_kg, 0)
					.toFixed(0)}l of water.
			</p>
			<!-- <BrownButton on:click={render_radar_chart}>Render Radar graph</BrownButton> -->
			<!-- <canvas bind:this={radar_chart_canvas}></canvas> -->
			<BrownButton on:click={save_data}>Save data</BrownButton>
			<p>
				The "Save data" button saves the data into the URL, so if you close this tab, all your data
				is gone, too. If you want to come back later, click the save button and add a bookmark.
			</p>
			<BrownButton href="/journey/summary">View summary</BrownButton>
		</div>
	</div>
</div>
<ChangeAmount
	bind:change_amount_of
	bind:change_amount_of_data
	{food_amount_data}
	bind:chart
	bind:selected_food
	init_chart={render_chart}
/>
