import { z } from 'zod';
import { priorities } from '../utils';

export const todoFormSchema = z.object({
	title: z.string().min(1),
	priority: z.enum(priorities)
});

export type TodoFormSchema = z.infer<typeof todoFormSchema>;
