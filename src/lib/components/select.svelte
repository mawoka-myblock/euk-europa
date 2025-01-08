<script lang="ts">
	import MiniSearch from 'minisearch';
	import type { SearchResult } from 'minisearch';

	type InputData = {
		label: string;
		value: any;
		id?: any;
	}[];
	let { data, default_text = 'Start typing...' }: { data: InputData; default_text?: string } =
		$props();

	let search_results: SearchResult[] = $state([]);
	let input_data = $state('');
	let ms: MiniSearch;

	const search = (term: string) => {
		if (!term || term === '') {
			search_results = [];
		}
		let results = ms.search(term.toLowerCase(), { fuzzy: true, prefix: true });
		search_results = results;
		console.log(results, term, data);
	};
    
	$effect(() => {
		let label_as_id = true;
		if (data[0].id != undefined) label_as_id = false;
		console.log('label_as_id', label_as_id, data[0].id);
		ms = new MiniSearch<any>({
			fields: ['label'],
			storeFields: ['label', 'value'],
			idField: label_as_id ? 'label' : 'id'
		});
		ms.addAll(data);
	});

	$effect(() => {
		search(input_data);
	});
</script>

<div>
	<input type="text" bind:value={input_data} />
	{#if search_results.length !== 0}
		<div class="h-[15vh] overflow-y-scroll">
			{#each search_results as res}
				<div>
					{res.label}
				</div>
			{/each}
		</div>
	{/if}
</div>
