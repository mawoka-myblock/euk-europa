<script lang="ts">
	import type { PageData } from './$types';
	import { countries } from 'country-data';
	import half_index_data from '$lib/data/half_index_by_iso_3_country.json5';
	import WhatMeme from '$lib/media/what-meme.webp';
	import { createTippy } from 'svelte-tippy';
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

<p>
	Okay {user_name}, so you're from {countries[country].name}! Well, your country has a HALF index of {half_index.toFixed(
		0
	)}.
</p>
<img src={WhatMeme} alt="Meme where person asks what with expressive facial expression" />

<h2>HALF index</h2>
<p>Sounds really complex, is super easy.</p>

<p>
	It shows how much of the global land area would be used for agriculture if everyone would eat like
	the average person in your country, {countries[country].name}, would.
</p>

<p class="text-4xl">{half_index.toFixed(0)}%</p>

{#if half_index > 100}
	<p>
		Welcome to absurdity. That's too much. Unless you got we'd have a spare earth in someone's
		pocket. Do we? If so, please don't tell humanity so we don't also immediately destroy plan B.
	</p>
{:else if half_index > 50}
	<p>
		That's more land than is currently used by agriculture around the world. That's a problem, isn't
		it? How should we dedicate {half_index.toFixed(0)}% of land to farming and food production?
	</p>
{:else if half_index < 50}
	<p>
		That's pretty good. That means that we could feed the current population with less land usage
		than we currently have at around 50%. Pretty nice! But we mustn't forget: The population grows.
	</p>
{/if}

To demonstrate that amount, I've created this small visualization. Every circle represents all of
Earth's land (30%). The yellow-brown space shows the space occupied by food production and the green
space what's left for everything else.

<div>
	<div
		class="absolute z-20 block h-32 w-32 rounded-full bg-green-600"
		style="clip-path: circle(50% at center);"
	>
		<span class="relative block w-32 bg-yellow-700" style="height: {half_index}%;"></span>
	</div>
	{#if half_index > 100}
		<div
			class="absolute z-20 ml-40 block h-32 w-32 rounded-full bg-green-600"
			style="clip-path: circle(50% at center);"
			use:tippy={{
				content: `Woah, so we got ${(200 - half_index).toFixed(0)}% of the space of a second earth left for us and all the other ${(half_index - 100).toFixed(0)}% are also for food production.`
			}}
		>
			<span class="relative block w-32 bg-yellow-700" style="height: {half_index - 100}%;"></span>
		</div>
	{/if}
</div>
