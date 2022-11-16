import type { ComponentType } from 'react';

export const priorities = ['very-high', 'high', 'normal', 'low', 'very-low'] as const;

type Priority = typeof priorities[number];

export type PriorityInfo = {
	color: string;
};

export const priorityInfo: Record<Priority, PriorityInfo> = {
	'very-high': {
		color: '#ED4C5C'
	},
	high: {
		color: '#F8A541'
	},
	normal: {
		color: '#00A790'
	},
	low: {
		color: '#428BC1'
	},
	'very-low': {
		color: '#8942C1'
	}
} as const;

const activeStatus = [0, 1] as const;

type ActiveStatus = typeof activeStatus[number];

export type Todo = {
	id: number;
	title: string;
	activity_group_id: number;
	is_active: ActiveStatus;
	priority: Priority;
};

export type Activity = {
	id: number;
	title: string;
	created_at: string;
};

export type ExtractProps<T> = T extends ComponentType<infer P> ? P : T;
