export type JsonResponse = {
	total: number;
	limit: number;
	skip: number;
	data: Array<{
		id: number;
		title: string;
		created_at: string;
	}>;
};

const getActivities = async () => {
	const params = new URLSearchParams({
		email: 'hello@taufiqf.com'
	});

	const response = await fetch(`${import.meta.env.VITE_API_URL}/activity-groups?${params}`, {
		method: 'GET'
	});

	if (!response.ok) throw new Error('Failed to get activities');

	const jsonResponse: JsonResponse = await response.json();

	return jsonResponse.data;
};

export default getActivities;
