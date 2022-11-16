import type { Activity } from '../../utils';

export const createActivity = async () => {
	type RequestBody = Pick<Activity, 'title'> & { email: string };

	const body: RequestBody = {
		title: 'New Activity',
		email: import.meta.env.VITE_EMAIL
	};

	const response = await fetch(`${import.meta.env.VITE_API_URL}/activity-groups`, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) throw new Error('Failed to create activity');

	return response.json();
};
