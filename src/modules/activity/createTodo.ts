import type { Todo } from '../../utils';

type Params = Pick<Todo, 'activity_group_id' | 'priority' | 'title'>;

export const createTodo = async (params: Params) => {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/todo-items`, {
		method: 'POST',
		body: JSON.stringify(params),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) throw new Error('Failed to create todo');

	return response.json();
};
