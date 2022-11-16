import type { Activity } from '../../utils';

export type GetActivitiesResponse = {
	total: number;
	limit: number;
	skip: number;
	data: Activity[];
};

export const getActivities = async () => {
	const params = new URLSearchParams({
		email: import.meta.env.VITE_EMAIL
	});

	const response = await fetch(`${import.meta.env.VITE_API_URL}/activity-groups?${params}`, {
		method: 'GET'
	});

	if (!response.ok) throw new Error('Failed to get activities');

	const jsonResponse: GetActivitiesResponse = await response.json();

	return jsonResponse.data;
};
