import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {

    const name = url.searchParams.get("name")
    const country = url.searchParams.get("country")
    if (!name || name === "") {
        return error(400, "Name not set!")
    }
    if (!country || country === "") {
        return error(400, "Country not set!")
    }

    return {name, country}
}