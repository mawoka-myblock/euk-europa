<script lang="ts">
	import BrownButton from '$lib/components/BrownButton.svelte';
	import type { Chart } from 'chart.js';
	import { fade } from 'svelte/transition';

	let {
		change_amount_of = $bindable(),
		change_amount_of_data = $bindable(),
		food_amount_data,
		chart = $bindable(),
		selected_food = $bindable(),
		init_chart
	}: {
		change_amount_of: string | undefined;
		food_amount_data: {
			[k: string]: {
				grams: number;
				frequency: number;
				period_multiplier: number;
			};
		};
		selected_food: FoodDataTypeAdjusted;
		chart: Chart<'bar', number[], string> | undefined;
	} = $props();

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

	$effect(() => {
		if (!change_amount_of) return;
		selected_food[change_amount_of].kilo_per_year =
			(change_amount_of_data.frequency *
				change_amount_of_data.grams *
				change_amount_of_data.period_multiplier) /
			1000;
		if (chart) {
			if (!chart.data.labels?.includes(change_amount_of)) chart.data.labels?.push(change_amount_of);
			let item_index = chart.data.labels.indexOf(change_amount_of);

			chart.data.datasets[0].data[item_index] =
				selected_food[change_amount_of].kilo_per_year *
				selected_food[change_amount_of].land_use_per_kg;
			chart.data.datasets[0].backgroundColor[item_index] =
				selected_food[change_amount_of].color + '95';
			chart.update();
		}
		food_amount_data[change_amount_of] = {
			grams: change_amount_of_data.grams,
			frequency: change_amount_of_data.frequency,
			period_multiplier: change_amount_of_data.period_multiplier
		};
	});

	const close_change_amount_of = () => {
		if (!chart) {
			init_chart();
		}
		if (chart) {
			if (!chart.data.labels?.includes(change_amount_of)) chart.data.labels?.push(change_amount_of);
			let item_index = chart.data.labels.indexOf(change_amount_of);
			chart.data.datasets[0].data[item_index] =
				selected_food[change_amount_of].kilo_per_year *
				selected_food[change_amount_of].land_use_per_kg;
			chart.data.datasets[0].backgroundColor[item_index] =
				selected_food[change_amount_of].color + '95';
			chart.update();
		}
		if (selected_food[change_amount_of].kilo_per_year === 0) {
			delete chart.data.datasets[0].data[chart.data.labels.indexOf(change_amount_of)];
			chart.data.labels.splice(chart.data.labels.indexOf(change_amount_of), 1);
			chart.update();
			delete selected_food[change_amount_of];
		}

		change_amount_of = undefined;
		change_amount_of_data = {
			grams: 0,
			grams_raw: '',
			frequency_raw: '',
			frequency: 0,
			period_multiplier: 1
		};
	};
</script>

{#if change_amount_of}
	<div
		class="fixed left-0 top-0 z-20 flex h-screen w-screen bg-black/60"
		transition:fade={{ duration: 100 }}
	>
		<div class="m-2 flex w-full flex-col rounded-lg bg-white/90 p-2 xl:m-auto xl:h-2/3 xl:w-1/3">
			<h2 class="mx-auto text-center text-5xl">
				Change the amount of {change_amount_of}
			</h2>
			<p class="mx-auto mt-1">Set how much {change_amount_of} you eat!</p>
			<div class="mx-auto flex w-fit md:flex-row flex-col place-items-center align-middle">
				I eat <span
					bind:innerHTML={change_amount_of_data.grams_raw}
					role="textbox"
					contenteditable
					class="ml-1 inline-block w-fit min-w-6 border-b-2 border-l-0 border-r-0 border-t-0 border-dotted border-black bg-transparent p-0 outline-none"
				></span>g of {change_amount_of}
				<span
					role="textbox"
					bind:innerHTML={change_amount_of_data.frequency_raw}
					contenteditable
					class="ml-1 inline-block w-fit min-w-6 border-b-2 border-l-0 border-r-0 border-t-0 border-dotted border-black bg-transparent p-0 outline-none"
				></span> times each
				<select
					class="w-24 border-0 bg-transparent p-0 px-2 focus:outline-none"
					bind:value={change_amount_of_data.period_multiplier}
				>
					<option value={365}
						>Day</option
					>
					<option value={52}
						>Week</option
					>
					<option value={12}
						>Month</option
					>
					<option value={1}
						>Year</option
					>
				</select>
			</div>
			{#if selected_food[change_amount_of].weight_per_unit}
				<p class="mx-auto text-center">
					For your reference, a single unit weights roughly {(
						selected_food[change_amount_of].weight_per_unit * 1000
					).toFixed(0)}g.
				</p>
			{/if}
			<div class="mx-auto my-4 flex flex-col justify-center">
				<p class="text-center">So, you eat</p>
				<p class="text-center text-2xl">{selected_food[change_amount_of].kilo_per_year} kg/year</p>
				<p class="text-center">every year, right?</p>
			</div>
			<div>
				<BrownButton on:click={close_change_amount_of}>Save and close</BrownButton>
			</div>
		</div>
	</div>
{/if}
