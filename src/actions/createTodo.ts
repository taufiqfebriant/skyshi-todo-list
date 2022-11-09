import type { CreateSchema } from '../routes/activity';

const createTodo = async (params: CreateSchema) => {
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

export default createTodo;
