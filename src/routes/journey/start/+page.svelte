<script lang="ts">
	import BrownButton from '$lib/components/BrownButton.svelte';

	let data = $state({
		name: '', // Null this
		country: 'DE'
	});

	let screen = $state(0);
</script>

<div class="flex min-h-screen w-screen flex-col">
	{#if screen === 0}
		<div class="m-auto flex flex-col items-center gap-2">
			<h2 class="text-3xl">What's your name?</h2>
			<p>Don't worry, your name wil solely be saved in your browser.</p>
			<input bind:value={data.name} class="rounded p-1 text-center text-lg" />
			<div>
				<BrownButton on:click={() => (screen = 1)} disabled={data.name.length < 2}
					>Continue</BrownButton
				>
			</div>
		</div>
	{:else if screen === 1}
		<div class="m-auto flex flex-col items-center gap-2">
			<h2 class="text-3xl">Hey {data.name}! Nice to meet you! Where are you from?</h2>
			<p>For now, please only enter your 2-letter country code here. For Germany, it'd be "DE".</p>
			<!-- TODO Proper country selection-->
			<input bind:value={data.country} class="rounded p-1 text-center text-lg" />
			<div class="mt-1">
				<BrownButton
					href="/journey/overview/?name={data.name}&country={data.country}"
					disabled={data.country.length < 2}>Continue</BrownButton
				>
			</div>
		</div>
	{/if}
</div>
