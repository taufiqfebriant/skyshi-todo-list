import type { Todo } from '../../utils';

type Params = Pick<Todo, 'id' | 'is_active' | 'priority'>;

export const checkTodo = async (params: Params) => {
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
