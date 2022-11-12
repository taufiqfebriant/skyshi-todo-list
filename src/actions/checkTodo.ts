import type { Priority } from '../types';

export type CheckTodoSchema = {
	id: number;
	is_active: 0 | 1;
	priority: Priority;
};

export const checkTodo = async (params: CheckTodoSchema) => {
	const { id, ...rest } = params;

	const response = await fetch(`${import.meta.env.VITE_API_URL}/todo-items/${id}`, {
		method: 'PATCH',
		body: JSON.stringify({ ...rest }),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) throw new Error('Failed to check todo');

	return response.json();
};
