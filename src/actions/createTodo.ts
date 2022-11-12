import { z } from 'zod';
import { Priority } from '../types';

export const createTodoFormSchema = z.object({
	title: z.string().min(1),
	priority: z.nativeEnum(Priority)
});

export type CreateTodoFormSchema = z.infer<typeof createTodoFormSchema>;

export type CreateTodoSchema = {
	activity_group_id: number;
} & CreateTodoFormSchema;

export const createTodo = async (params: CreateTodoSchema) => {
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
