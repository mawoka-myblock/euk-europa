<script lang="ts">
	import food_data from '$lib/data/foods.json';
	import Select from '$lib/components/select.svelte';
    import {countries} from "country-data"


    const transform_country_to_search = () => {
        let return_array = []
        for (let i = 0; i < countries.all.length; i++) {
            const country = countries.all[i]
            return_array.push({label: country.name, value: country.alpha3, id: i})
        }
        return return_array
    }

    const country_data_iso_3 = transform_country_to_search()

    


</script>

<Select data={country_data_iso_3} />
