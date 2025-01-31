<script lang="ts">
	import type { PageData } from './$types';
	import FoodData from '$lib/data/foods.json';
	import { Chart, BarController, BarElement, CategoryScale, LinearScale } from 'chart.js';
	import BrownButton from '$lib/components/BrownButton.svelte';
	import { onMount } from 'svelte';
	let { data }: { data: PageData } = $props();

	let food_to_add = $state('');
	let chart_canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart<'bar', number[], string> | undefined = undefined;

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
		};
	};

	let selected_food: FoodDataTypeAdjusted = $state({});

	let change_amount_of: string | undefined = $state(undefined);

	const add_food = () => {
		selected_food[food_to_add] = { ...FoodData[food_to_add], kilo_per_year: 1 };
		food_to_add = '';
	};

	let change_amount_of_data = $state({
		grams: 0,
		grams_raw: '',
		frequency_raw: '',
		frequency: 0,
		period_multiplier: 1
	});

	const ANY_NON_DIGIT_REGEX = /\D+/g;
	$effect(() => {
		change_amount_of_data.grams_raw = change_amount_of_data.grams_raw.replaceAll(
			ANY_NON_DIGIT_REGEX,
			''
		);
		const parsed_number = parseInt(change_amount_of_data.grams_raw);
		if (isNaN(parsed_number)) {
			change_amount_of_data.grams_raw = change_amount_of_data.grams_raw.slice(0, -1);
			return;
		}
		change_amount_of_data.grams = parsed_number;
	});
	$effect(() => {
		change_amount_of_data.frequency_raw = change_amount_of_data.frequency_raw.replaceAll(
			ANY_NON_DIGIT_REGEX,
			''
		);
		const parsed_number = parseInt(change_amount_of_data.frequency_raw);
		if (isNaN(parsed_number)) {
			change_amount_of_data.frequency_raw = change_amount_of_data.frequency_raw.slice(0, -1);
			return;
		}
		change_amount_of_data.frequency = parsed_number;
	});

	$inspect(change_amount_of_data);
	$effect(() => {
		if (!change_amount_of) return;
		console.log('hallo');
		selected_food[change_amount_of].kilo_per_year =
			(change_amount_of_data.frequency *
				change_amount_of_data.grams *
				change_amount_of_data.period_multiplier) /
			1000;
		if (chart) {
			if (!chart.data.labels?.includes(change_amount_of)) chart.data.labels?.push(change_amount_of);
			chart.data.datasets[0].data[chart.data.labels.indexOf(change_amount_of)] =
				selected_food[change_amount_of].kilo_per_year;
			chart.update()
		}
		console.log(selected_food[change_amount_of].kilo_per_year);
	});

	onMount(() => {
		Chart.register(BarController, BarElement, CategoryScale, LinearScale);
	});

	const close_change_amount_of = () => {
		change_amount_of = undefined;
		change_amount_of_data = {
			grams: 0,
			grams_raw: '',
			frequency_raw: '',
			frequency: 0,
			period_multiplier: 1
		};
	};

	const render_chart = () => {
		chart = new Chart(chart_canvas, {
			type: 'bar',
			data: {
				labels: Object.keys(selected_food),
				datasets: [
					{
						label: '# of kg',
						borderWidth: 1,
						data: Object.values(selected_food).map((d) => {
							return d.kilo_per_year;
						})
					}
				]
			}
		});
	};
</script>

<h1>
	Hi {data.name}! let's calculate your basic food emissions, like land requirement, water usage and
	greenhouse gas emissions.
</h1>

<div class="grid grid-cols-2 lg:grid-cols-2">
	<div class="flex flex-col">
		<div class="grid grid-cols-3">
			{#each Object.entries(selected_food) as [food, food_data]}
				<p>{food}</p>
				<p>{food_data.kilo_per_year}kg/year</p>
				<BrownButton
					on:click={() => {
						change_amount_of = food;
					}}>Change amount</BrownButton
				>
			{/each}
		</div>
		<div class="flex flex-row">
			<select bind:value={food_to_add}>
				{#each Object.keys(FoodData) as food_key}
					<option value={food_key}>{food_key}</option>
				{/each}
			</select>
			<BrownButton on:click={add_food}>Add!</BrownButton>
		</div>
		<BrownButton on:click={render_chart}>Update chart</BrownButton>
	</div>
	<div>
		<canvas bind:this={chart_canvas}></canvas>
	</div>
</div>

{#if change_amount_of}
	<div class="fixed left-0 top-0 z-20 flex h-screen w-screen bg-black/60">
		<div class="m-10 flex w-full flex-col rounded-lg bg-white/80 p-2 lg:m-auto lg:h-2/3 lg:w-1/3">
			<h2 class="marck-script mx-auto text-5xl text-center">Change the amount of {change_amount_of}</h2>
			<p class="mx-auto mt-1">Set how much {change_amount_of} you eat!</p>
			<div class="flex w-full flex-row place-items-center align-middle">
				I eat <span
					bind:innerHTML={change_amount_of_data.grams_raw}
					role="textbox"
					contenteditable
					class="ml-1 inline-block w-fit min-w-6 border-b-2 border-l-0 border-r-0 border-t-0 border-dotted border-black bg-transparent p-0 outline-none"
				></span>g of {change_amount_of} every
				<span
					role="textbox"
					bind:innerHTML={change_amount_of_data.frequency_raw}
					contenteditable
					class="ml-1 inline-block w-fit min-w-6 border-b-2 border-l-0 border-r-0 border-t-0 border-dotted border-black bg-transparent p-0 outline-none"
				></span>
				<select
					class="w-24 border-0 bg-transparent p-0 px-2 focus:outline-none"
					bind:value={change_amount_of_data.period_multiplier}
				>
					<option value={365}>Days</option>
					<option value={52}>Weeks</option>
					<option value={12}>Months</option>
					<option value={1}>Years</option>
				</select>
			</div>
			<div>
				<BrownButton on:click={close_change_amount_of}>Save and close</BrownButton>
			</div>
		</div>
	</div>
{/if}
