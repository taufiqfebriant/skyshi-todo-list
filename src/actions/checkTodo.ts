import type { CheckSchema } from '../routes/activity';

const checkTodo = async (params: CheckSchema) => {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/todo-items/${params.id}`, {
		method: 'PATCH',
		body: JSON.stringify({
			is_active: params.is_active,
			priority: params.priority
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) throw new Error('Failed to check todo');

	return response.json();
};

export default checkTodo;
