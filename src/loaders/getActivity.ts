import type { PriorityInfo, Todo } from '../utils';
import { priorityInfo } from '../utils';

type ModifiedTodo = Todo & Pick<PriorityInfo, 'color'>;

type Activity = {
	id: number;
	title: string;
	created_at: string;
	todo_items: Todo[];
};

export type ModifiedActivity = Omit<Activity, 'todo_items'> & {
	todo_items: ModifiedTodo[];
};

type Params = {
	id: number;
};

export const getActivity = async (params: Params) => {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/activity-groups/${params.id}`, {
		method: 'GET'
	});

	if (!response.ok) throw new Error('Failed to get activity');

	const jsonResponse: Activity = await response.json();

	const newTodos: ModifiedTodo[] = jsonResponse.todo_items.map(todo => {
		return {
			...todo,
			color: priorityInfo[todo.priority].color
		};
	});

	const activity: ModifiedActivity = {
		...jsonResponse,
		todo_items: newTodos
	};

	return activity;
};
