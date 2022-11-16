import type { Todo } from '../../utils';

type UpdateTodoParams = Pick<Todo, 'id' | 'is_active' | 'title' | 'priority'>;

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
