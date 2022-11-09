export enum Priority {
	VeryHigh = 'very-high',
	High = 'high',
	Normal = 'normal',
	Low = 'low',
	VeryLow = 'very-low'
}

export type Activity = {
	id: number;
	title: string;
	created_at: string;
	todo_items: Array<{
		id: number;
		title: string;
		activity_group_id: number;
		is_active: number;
		priority: Priority;
		color: string;
	}>;
};

type Params = {
	id: number;
};

const getActivity = async (params: Params): Promise<Activity> => {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/activity-groups/${params.id}`, {
		method: 'GET'
	});

	if (!response.ok) throw new Error('Failed to get activity');

	return response.json();
};

export default getActivity;
