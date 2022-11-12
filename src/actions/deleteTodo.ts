export type DeleteTodoSchema = {
	id: number;
};

export const deleteTodo = async (params: DeleteTodoSchema) => {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/todo-items/${params.id}`, {
		method: 'DELETE'
	});

	if (!response.ok) throw new Error('Failed to delete todo');

	return response.json();
};
