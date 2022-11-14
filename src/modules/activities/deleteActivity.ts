type Params = {
	id: number;
};

export const deleteActivity = async (params: Params) => {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/activity-groups/${params.id}`, {
		method: 'DELETE'
	});

	if (!response.ok) throw new Error('Failed to delete activity');

	return response.json();
};
