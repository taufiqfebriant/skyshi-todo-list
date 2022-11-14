export type UpdateActivityTitleParams = {
	id: number;
	title: string;
};

export const updateActivityTitle = async (params: UpdateActivityTitleParams) => {
	const { id, ...rest } = params;

	const response = await fetch(`${import.meta.env.VITE_API_URL}/activity-groups/${id}`, {
		method: 'PATCH',
		body: JSON.stringify({ ...rest }),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) throw new Error('Failed to update activity title');

	return response.json();
};
