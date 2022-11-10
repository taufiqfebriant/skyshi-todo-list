import type { UpdateSchema } from '../routes/activity';

const updateTodo = async (params: UpdateSchema) => {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/todo-items/${params.id}`, {
		method: 'PATCH',
		body: JSON.stringify({
			is_active: params.is_active,
			priority: params.priority,
			title: params.title
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) throw new Error('Failed to update todo');

	return response.json();
};

export default updateTodo;
