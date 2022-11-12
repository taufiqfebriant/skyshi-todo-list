import { z } from 'zod';
import { Priority } from '../types';

export const updateTodoFormSchema = z.object({
	title: z.string().min(1),
	priority: z.nativeEnum(Priority)
});

export type UpdateTodoFormSchema = z.infer<typeof updateTodoFormSchema>;

export type UpdateTodoSchema = {
	id: number;
	is_active: 0 | 1;
} & UpdateTodoFormSchema;

export const updateTodo = async (params: UpdateTodoSchema) => {
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
