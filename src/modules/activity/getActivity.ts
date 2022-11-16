import type { Activity, PriorityInfo, Todo } from '../../utils';
import { priorityInfo } from '../../utils';

type ModifiedTodo = Todo & PriorityInfo;

export type ModifiedActivity = Activity & {
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

	const jsonResponse: ModifiedActivity = await response.json();

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
