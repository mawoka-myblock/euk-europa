<script lang="ts">
	import type { PageData } from './$types';
	import { countries } from 'country-data';
	import half_index_data from '$lib/data/half_index_by_iso_3_country.json5';
	import WhatMeme from '$lib/media/what-meme.webp';
	import { createTippy } from 'svelte-tippy';
	import BrownButton from '$lib/components/BrownButton.svelte';
	let { data }: { data: PageData } = $props();

	const user_name = data.name;
	const country = data.country;
	const half_index = half_index_data[countries[country].alpha3].index as number;

	const tippy = createTippy({
		arrow: true,
		animation: 'perspective-subtle',
		placement: 'top'
	});
</script>

<div class="min-h-screen">
	<h1 class="text-center text-6xl">Let's get you an overview of the problem</h1>
	<div class="mt-6 flex flex-col">
		<p class="mx-auto text-xl">
			Okay {user_name}, so you're from {countries[country].name}! Well, your country has a HALF
			index of {half_index.toFixed(0)}.
		</p>
		<!-- <img class="w-1/5 mx-auto rounded-lg" src={WhatMeme} alt="Meme where person asks what with expressive facial expression" /> -->
	</div>

	<section class="flex flex-col">
		<h2 class="mx-auto text-4xl">HALF index</h2>
		<p class="mx-auto">Sounds really complex, is super easy.</p>

		<p class="mx-auto mt-4 lg:w-1/2">
			It shows how much of the global land area would be used for agriculture if everyone would eat
			like the average person in your country, {countries[country].name}, would.
		</p>

		<p class="mx-auto text-4xl">{half_index.toFixed(0)}%</p>

		{#if half_index > 100}
			<p class="mx-auto mt-4 lg:w-1/2">
				Welcome to absurdity. That's too much. Unless you got we'd have a spare earth in someone's
				pocket. Do we? If so, please don't tell humanity so we don't also immediately destroy plan
				B.
			</p>
		{:else if half_index > 50}
			<p class="mx-auto mt-4 lg:w-1/2">
				That's more land than is currently used by agriculture around the world. That's a problem,
				isn't it? How should we dedicate {half_index.toFixed(0)}% of land to farming and food
				production?
			</p>
		{:else if half_index < 50}
			<p class="mx-auto mt-4 lg:w-1/2">
				That's pretty good. That means that we could feed the current population with less land
				usage than we currently have at around 50%. Pretty nice! But we mustn't forget: The
				population grows.
			</p>
		{/if}
		<p class="mx-auto mt-4 lg:w-1/2">
			To demonstrate that amount, I've created this small visualization. Every circle represents all
			of Earth's land (30%). The yellow-brown space shows the space occupied by food production and
			the green space what's left for everything else.
		</p>
		<div class="mx-auto" class:w-40={!(half_index > 100)} class:w-80={half_index > 100}>
			<div
				class="absolute z-20 block h-40 w-40 rounded-full bg-green-600"
				style="clip-path: circle(50% at center);"
			>
				<span class="relative block w-40 bg-yellow-700" style="height: {half_index}%;"></span>
			</div>
			{#if half_index > 100}
				<div
					class="absolute z-20 ml-40 block h-40 w-40 rounded-full bg-green-600"
					style="clip-path: circle(50% at center);"
					use:tippy={{
						content: `Woah, so we got ${(200 - half_index).toFixed(0)}% of the space of a second earth left for us and all the other ${(half_index - 100).toFixed(0)}% are also for food production.`
					}}
				>
					<span class="relative block w-40 bg-yellow-700" style="height: {half_index - 100}%;"
					></span>
				</div>
			{/if}
		</div>
		<span class="mt-44"></span>
		{#if half_index > 100}
			<p class="mx-auto lg:w-1/2">
				Something seems really odd. There are two earths. That's, well, unfortunate and downright
				impossible. That means that the eating habit in your country will and has to change. On the
				next page, you'll figure out on your own what the issue about your eating habits are.
			</p>
		{/if}
		<div class="mx-auto text-2xl">
			<BrownButton href="/journey/calculator?name={user_name}&country={data.country}"
				>Continue</BrownButton
			>
		</div>
	</section>
</div>
