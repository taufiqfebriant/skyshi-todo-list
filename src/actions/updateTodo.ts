import type { TodoFormSchema } from '../schemas/todo';
import type { Todo } from '../utils';

export type UpdateTodoParams = Pick<Todo, 'id' | 'is_active'> & TodoFormSchema;

export const updateTodo = async (params: UpdateTodoParams) => {
	const { id, ...rest } = params;

	const response = await fetch(`${import.meta.env.VITE_API_URL}/todo-items/${id}`, {
		method: 'PATCH',
		body: JSON.stringify({ ...rest }),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) throw new Error('Failed to update todo');

	return response.json();
};
