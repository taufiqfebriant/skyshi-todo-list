const createActivity = async () => {
	const body = {
		title: 'New Activity',
		email: 'hello@taufiqf.com'
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

export default createActivity;
