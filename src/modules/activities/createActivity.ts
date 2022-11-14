export const createActivity = async () => {
	const body = JSON.stringify({
		title: 'New Activity',
		email: import.meta.env.VITE_EMAIL
	});

	const response = await fetch(`${import.meta.env.VITE_API_URL}/activity-groups`, {
		method: 'POST',
		body,
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) throw new Error('Failed to create activity');

	return response.json();
};
