import type { Todo } from '../../utils';

type Params = Pick<Todo, 'id'>;

export const deleteTodo = async (params: Params) => {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/todo-items/${params.id}`, {
		method: 'DELETE'
	});

	if (!response.ok) throw new Error('Failed to delete todo');

	return response.json();
};
