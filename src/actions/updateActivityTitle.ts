import type { UpdateActivityTitleSchema } from '../routes/activity';

const updateActivityTitle = async (params: UpdateActivityTitleSchema) => {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/activity-groups/${params.id}`, {
		method: 'PATCH',
		body: JSON.stringify({
			title: params.title
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) throw new Error('Failed to update activity title');

	return response.json();
};

export default updateActivityTitle;
