import type { TodoFormSchema } from '../schemas/todo';
import type { Todo } from '../utils';

export type CreateTodoParams = Pick<Todo, 'activity_group_id'> & TodoFormSchema;

export const createTodo = async (params: CreateTodoParams) => {
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
