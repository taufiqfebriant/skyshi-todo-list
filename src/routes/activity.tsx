import { Dialog, Listbox } from '@headlessui/react';
import clsx from 'clsx';
import { makeDomainFunction } from 'domain-functions';
import { useHead } from 'hoofd';
import { useEffect, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router-dom';
import {
	Form as FrameworkForm,
	json,
	Link,
	useActionData,
	useLoaderData,
	useNavigation,
	useSubmit
} from 'react-router-dom';
import { createForm, performMutation } from 'remix-forms';
import { z } from 'zod';
import checkTodo from '../actions/checkTodo';
import createTodo from '../actions/createTodo';
import deleteTodo from '../actions/deleteTodo';
import updateTodo from '../actions/updateTodo';
import SvgIcon from '../components/SvgIcon';
import emptyStateImg from '../images/todo-empty-state.png';
import type { Activity } from '../loaders/getActivity';
import getActivity, { Priority } from '../loaders/getActivity';

type LoaderData = {
	data: Activity;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
	// TODO: Betulkan types & validasi
	if (!params.id)
		return json(
			{ message: 'Anda harus menyertakan ID' },
			{
				status: 400
			}
		);

	const data = await getActivity({ id: +params.id });
	return json({ data });
};

type PriorityOption = {
	color: string;
	name: Priority;
	display: string;
};

const priorities: PriorityOption[] = [
	{
		color: '#ED4C5C',
		name: Priority.VeryHigh,
		display: 'Very High'
	},
	{
		color: '#F8A541',
		name: Priority.High,
		display: 'High'
	},
	{
		color: '#00A790',
		name: Priority.Normal,
		display: 'Normal'
	},
	{
		color: '#428BC1',
		name: Priority.Low,
		display: 'Low'
	},
	{
		color: '#8942C1',
		name: Priority.VeryLow,
		display: 'Very Low'
	}
];

const Form = createForm({ component: FrameworkForm, useNavigation, useSubmit, useActionData });

const ACTIONS = ['create', 'delete', 'check', 'update'] as const;
const PRIORITY_NAMES = ['very-high', 'high', 'normal', 'low', 'very-low'] as const;

const createSchema = z.object({
	activity_group_id: z.string().min(1),
	priority: z.enum(PRIORITY_NAMES),
	title: z.string().min(1),
	_action: z.enum(ACTIONS)
});

const createMutation = makeDomainFunction(createSchema)(async values => {
	return createTodo(values);
});

export type CreateSchema = z.infer<typeof createSchema>;

const deleteSchema = z.object({
	id: z.number().min(1),
	_action: z.enum(ACTIONS)
});

const deleteMutation = makeDomainFunction(deleteSchema)(async values => {
	return deleteTodo({ id: values.id });
});

type DeleteSchema = z.infer<typeof deleteSchema>;

const checkSchema = z.object({
	id: z.number().min(1),
	priority: z.enum(PRIORITY_NAMES),
	is_active: z.number().int().gte(0).lte(1),
	_action: z.enum(ACTIONS)
});

const checkMutation = makeDomainFunction(checkSchema)(async values => {
	return checkTodo(values);
});

export type CheckSchema = z.infer<typeof checkSchema>;

const updateSchema = z.object({
	id: z.number().min(1),
	priority: z.enum(PRIORITY_NAMES),
	title: z.string().min(1),
	is_active: z.number().int().gte(0).lte(1),
	_action: z.enum(ACTIONS)
});

const updateMutation = makeDomainFunction(updateSchema)(async values => {
	return updateTodo(values);
});

export type UpdateSchema = z.infer<typeof updateSchema>;

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.clone().formData();
	const data = Object.fromEntries(formData) as CreateSchema | DeleteSchema;

	let success = false;

	if (data._action === 'create') {
		const result = await performMutation({
			request,
			schema: createSchema,
			mutation: createMutation
		});

		if (result.success) {
			success = true;
		}
	}

	if (data._action === 'delete') {
		const result = await performMutation({
			request,
			schema: deleteSchema,
			mutation: deleteMutation
		});

		if (result.success) {
			success = true;
		}
	}

	if (data._action === 'check') {
		const result = await performMutation({
			request,
			schema: checkSchema,
			mutation: checkMutation
		});

		if (result.success) {
			success = true;
		}
	}

	if (data._action === 'update') {
		const result = await performMutation({
			request,
			schema: updateSchema,
			mutation: updateMutation
		});

		if (result.success) {
			success = true;
		}
	}

	return json({ _action: data._action, success });
};

type ActionData = {
	_action: z.infer<typeof createSchema>['_action'];
	success: boolean;
};

interface ColorProps extends React.ComponentPropsWithoutRef<'div'> {
	color: string;
}

const Color = (props: ColorProps) => {
	const { color, className, style, ...rest } = props;

	return (
		<div
			className={`rounded-full ${className}`}
			style={{ backgroundColor: color, ...style }}
			{...rest}
		/>
	);
};

// TODO: Handle 404
const ActivityPage = () => {
	useHead({
		title: 'To Do List - Detail'
	});

	const [isOpen, setIsOpen] = useState(false);

	const loaderData = useLoaderData() as LoaderData;

	const [editActivityTitle, setEditActivityTitle] = useState(false);

	const [selectedTodo, setSelectedTodo] = useState<
		typeof loaderData['data']['todo_items'][number] | null
	>(null);
	const [isConfirmDeletionOpen, setIsConfirmDeletionOpen] = useState(false);

	const handleTrashClick = (todo: typeof loaderData['data']['todo_items'][number]) => {
		setSelectedTodo(todo);
		setIsConfirmDeletionOpen(true);
	};

	const handleConfirmDeleteClose = () => {
		setSelectedTodo(null);
		setIsConfirmDeletionOpen(false);
	};

	const submit = useSubmit();

	const handleDelete = () => {
		if (selectedTodo) {
			const formData = new FormData();

			formData.append('_action', 'delete');
			formData.append('id', `${selectedTodo.id}`);

			submit(formData, { method: 'post' });
			setIsConfirmDeletionOpen(false);
		}
	};

	const actionData = useActionData() as ActionData | undefined;
	useEffect(() => {
		let close = true;

		if (actionData?._action === 'create' && actionData.success && close) {
			setIsOpen(false);
		}

		return () => {
			close = false;
		};
	}, [actionData?._action, actionData?.success]);

	useEffect(() => {
		let close = true;

		if (actionData?._action === 'update' && actionData.success && close) {
			setIsEditOpen(false);
		}

		return () => {
			close = false;
		};
	}, [actionData?._action, actionData?.success]);

	const handleTodoCheck = (todo: typeof loaderData['data']['todo_items'][number]) => {
		const formData = new FormData();

		formData.append('_action', 'check');
		formData.append('id', `${todo.id}`);
		formData.append('priority', `${todo.priority}`);
		formData.append('is_active', todo.is_active ? '0' : '1');

		submit(formData, { method: 'post' });
		setIsConfirmDeletionOpen(false);
	};

	const [isEditOpen, setIsEditOpen] = useState(false);

	const handlePencilTodoClick = (todo: typeof loaderData['data']['todo_items'][number]) => {
		setSelectedTodo(todo);
		setIsEditOpen(true);
	};

	const [selectedSort, setSelectedSort] = useState<
		'latest' | 'oldest' | 'az' | 'za' | 'unfinished'
	>('latest');

	const sortedTodos = loaderData.data.todo_items;
	sortedTodos.sort((a, b) => {
		if (selectedSort === 'oldest') {
			return a.id - b.id;
		}

		if (selectedSort === 'az') {
			return a.title.localeCompare(b.title);
		}

		if (selectedSort === 'za') {
			return b.title.localeCompare(a.title);
		}

		if (selectedSort === 'unfinished') {
			return b.is_active - a.is_active;
		}

		return b.id - a.id;
	});

	const [isInfoOpen, setIsInfoOpen] = useState(false);
	const refInfoDiv = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let open = true;

		if (actionData?._action === 'delete' && actionData.success && open) {
			setIsInfoOpen(true);
		}

		return () => {
			open = false;
		};
	}, [actionData?._action, actionData?.success]);

	const [selectedPriority, setSelectedPriority] = useState(priorities[0]);

	return (
		<>
			<div className="mt-[2.6875rem] flex justify-between">
				<div className="flex items-center justify-between gap-x-[1.1875rem]">
					<Link to="/" data-cy="todo-back-button">
						<SvgIcon name="chevron-left" width={32} height={32} color="#111111" />
					</Link>

					{editActivityTitle ? (
						<input
							type="text"
							name="activity_title"
							defaultValue={loaderData.data.title}
							className="border-b border-[#111111] bg-transparent text-4xl font-bold leading-[3.375rem] focus:outline-none"
							data-cy="todo-title"
						/>
					) : (
						<h1
							className="text-4xl font-bold leading-[3.375rem]"
							onClick={() => setEditActivityTitle(true)}
							data-cy="todo-title"
						>
							{loaderData.data.title}
						</h1>
					)}

					<button type="button" className="pr-10 text-[#A4A4A4]" data-cy="todo-title-edit-button">
						<SvgIcon name="pencil" width={24} height={24} color="#A4A4A4" />
					</button>
				</div>

				<div className="flex items-center gap-x-[1.125rem]">
					{loaderData.data.todo_items.length ? (
						<Listbox value={selectedSort} onChange={setSelectedSort}>
							<Listbox.Button
								className="flex h-[3.375rem] w-[3.375rem] items-center justify-center rounded-[2.8125rem] border border-[#E5E5E5] text-[#888888]"
								data-cy="todo-sort-button"
							>
								<SvgIcon name="sort" width={24} height={24} color="#888888" />
							</Listbox.Button>

							<Listbox.Options
								className="w-[14.6875rem] bg-white text-[#4A4A4A]"
								data-cy="sort-parent"
							>
								<Listbox.Option value="latest" className="py-[.875rem]" data-cy="sort-selection">
									Terbaru
								</Listbox.Option>
								<Listbox.Option value="oldest" className="py-[.875rem]" data-cy="sort-selection">
									Terlama
								</Listbox.Option>
								<Listbox.Option value="az" className="py-[.875rem]" data-cy="sort-selection">
									A-Z
								</Listbox.Option>
								<Listbox.Option value="za" className="py-[.875rem]" data-cy="sort-selection">
									Z-A
								</Listbox.Option>
								<Listbox.Option
									value="unfinished"
									className="py-[.875rem]"
									data-cy="sort-selection"
								>
									Belum Selesai
								</Listbox.Option>
							</Listbox.Options>
						</Listbox>
					) : null}

					<button
						type="button"
						className="flex h-[3.375rem] items-center gap-x-[.375rem] rounded-[2.8125rem] bg-[#16ABF8] pl-[1.375rem] pr-[1.8125rem] text-white"
						onClick={() => setIsOpen(true)}
						data-cy="todo-add-button"
					>
						<SvgIcon name="plus" width={24} height={24} />

						<span className="text-lg">Tambah</span>
					</button>
				</div>
			</div>

			{loaderData.data.todo_items.length ? (
				<article className="my-12 flex flex-col gap-y-[.625rem]">
					{sortedTodos.map(todo => (
						<article
							key={todo.id}
							className="flex items-center rounded-xl bg-white pt-[1.625rem] pr-6 pb-[1.6875rem] pl-7 shadow-[0_6px_10px_rgba(0,0,0,.1)]"
							data-cy="todo-item"
						>
							<input
								type="checkbox"
								className="h-5 w-5"
								checked={!todo.is_active}
								onChange={() => handleTodoCheck(todo)}
								data-cy="todo-item-checkbox"
							/>

							<Color
								color={
									priorities.find(priority => priority.name === todo.priority)?.color ?? '#ffffff'
								}
								className="ml-[1.375rem] h-[.5625rem] w-[.5625rem]"
								data-cy="todo-item-priority-indicator"
							/>

							<h2
								className={clsx('ml-4 text-lg font-medium leading-[1.6875rem]', {
									'text-[#888888] line-through': !todo.is_active
								})}
								data-cy="todo-item-title"
							>
								{todo.title}
							</h2>

							<div className="flex flex-1 items-center">
								<button
									type="button"
									className="ml-4 w-fit text-[#C4C4C4]"
									data-cy="todo-item-edit-button"
									onClick={() => handlePencilTodoClick(todo)}
								>
									<SvgIcon name="pencil" width={20} height={20} color="#C4C4C4" />
								</button>
							</div>

							<button
								type="button"
								className="text-[#888888]"
								onClick={() => handleTrashClick(todo)}
								data-cy="todo-item-delete-button"
							>
								<SvgIcon name="trash" width={24} height={24} color="#888888" />
							</button>
						</article>
					))}
				</article>
			) : (
				<div className="my-[6.0625rem] flex justify-center">
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						className="max-h-[25.8125rem] max-w-[33.8125rem]"
						data-cy="todo-empty-state"
					>
						<img src={emptyStateImg} alt="Add todo illustration" />
					</button>
				</div>
			)}

			{/** TODO: Tambah animasi */}
			<Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
				{/* The backdrop, rendered as a fixed sibling to the panel container */}
				<div className="fixed inset-0 bg-black/50" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
					<Dialog.Panel
						className="w-[51.875rem] rounded-xl bg-white shadow-[0_4px_10px_rgba(0,0,0,.1)]"
						data-cy="modal-add"
					>
						<div className="flex items-center justify-between border-b border-[#E5E5E5] pt-6 pr-[2.5625rem] pb-[1.1875rem] pl-[1.875rem]">
							<Dialog.Title
								className="text-lg font-semibold leading-[1.6875rem]"
								data-cy="modal-add-title"
							>
								Tambah List Item
							</Dialog.Title>

							<button
								type="button"
								className="text-[#A4A4A4]"
								onClick={() => setIsOpen(false)}
								data-cy="modal-add-close-button"
							>
								<SvgIcon name="close" width={24} height={24} color="#A4A4A4" />
							</button>
						</div>

						<Form
							schema={createSchema}
							method="post"
							hiddenFields={['activity_group_id', '_action']}
							values={{
								activity_group_id: loaderData.data.id,
								_action: 'create',
								priority: 'very-high'
							}}
						>
							{({ Field, Button, formState, control }) => (
								<>
									<Field name="activity_group_id" />
									<Field name="_action" />

									<div className="pl-[1.875rem] pr-[2.5625rem] pt-[2.375rem] pb-[1.4375rem]">
										<Field name="title">
											{({ Label, SmartInput, Error }) => (
												<div className="flex flex-col gap-y-[.5625rem]">
													<Label
														className="text-xs font-semibold leading-[1.125rem]"
														data-cy="modal-add-name-title"
													>
														NAMA LIST ITEM
													</Label>

													<SmartInput
														className="h-[3.25rem] rounded-md border border-[#E5E5E5] px-[1.125rem] focus:border-[#16ABF8] focus:outline-none"
														placeholder="Tambahkan nama list item"
														data-cy="modal-add-name-input"
													/>

													<Error />
												</div>
											)}
										</Field>

										<Field name="priority" label="PRIORITY">
											{({ Error, Label }) => (
												<div className="mt-[1.625rem] flex flex-col gap-y-[.5625rem]">
													<Label
														className="text-xs font-semibold leading-[1.125rem]"
														data-cy="modal-add-priority-title"
													/>

													<Controller
														control={control}
														defaultValue="very-high"
														name="priority"
														render={({ field: { onChange, ...rest } }) => (
															<Listbox
																as="div"
																defaultValue={selectedPriority.name}
																onChange={priority => {
																	onChange(priority);

																	const relatedPriority = priorities.find(p => p.name === priority);
																	if (relatedPriority) {
																		setSelectedPriority(relatedPriority);
																	}
																}}
																{...rest}
															>
																<Listbox.Button data-cy="modal-add-priority-dropdown">
																	<div
																		data-cy="modal-add-priority-item"
																		className="flex items-center"
																	>
																		<Color
																			color={selectedPriority.color}
																			className="h-[.875rem] w-[.875rem]"
																		/>

																		<span>{selectedPriority.display}</span>
																	</div>
																</Listbox.Button>

																<Listbox.Options>
																	{priorities.map(priority => (
																		<Listbox.Option
																			key={priority.name}
																			value={priority.name}
																			data-cy="modal-add-priority-item"
																		>
																			{priority.display}
																		</Listbox.Option>
																	))}
																</Listbox.Options>
															</Listbox>
														)}
													/>

													<Error />
												</div>
											)}
										</Field>
									</div>

									<div className="flex justify-end border-t border-[#E5E5E5] pr-10 pt-[.9375rem] pb-[1.1875rem]">
										<Button
											disabled={!formState.isValid}
											className="rounded-[2.8125rem] bg-[#16ABF8] py-[.84375rem] px-[2.4375rem] text-lg font-semibold leading-[1.6875rem] text-white disabled:opacity-20"
											data-cy="modal-add-save-button"
										>
											Simpan
										</Button>
									</div>
								</>
							)}
						</Form>
					</Dialog.Panel>
				</div>
			</Dialog>

			{/** TODO: Tambah animasi */}
			<Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} className="relative z-50">
				{/* The backdrop, rendered as a fixed sibling to the panel container */}
				<div className="fixed inset-0 bg-black/50" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
					<Dialog.Panel className="w-[51.875rem] rounded-xl bg-white shadow-[0_4px_10px_rgba(0,0,0,.1)]">
						<div className="flex items-center justify-between border-b border-[#E5E5E5] pt-6 pr-[2.5625rem] pb-[1.1875rem] pl-[1.875rem]">
							<Dialog.Title className="text-lg font-semibold leading-[1.6875rem]">
								Edit Item
							</Dialog.Title>

							<button type="button" className="text-[#A4A4A4]" onClick={() => setIsEditOpen(false)}>
								<SvgIcon name="close" width={24} height={24} color="#A4A4A4" />
							</button>
						</div>

						<Form
							schema={updateSchema}
							method="post"
							hiddenFields={['id', '_action', 'is_active']}
							values={{
								id: selectedTodo?.id,
								_action: 'update',
								title: selectedTodo?.title,
								priority: selectedTodo?.priority,
								is_active: selectedTodo?.is_active
							}}
						>
							{({ Field, Button, formState }) => (
								<>
									<Field name="id" />
									<Field name="_action" />
									<Field name="is_active" />

									<div className="pl-[1.875rem] pr-[2.5625rem] pt-[2.375rem] pb-[1.4375rem]">
										<Field name="title">
											{({ Label, SmartInput, Error }) => (
												<div className="flex flex-col gap-y-[.5625rem]">
													<Label className="text-xs font-semibold leading-[1.125rem]">
														NAMA LIST ITEM
													</Label>

													<SmartInput
														className="h-[3.25rem] rounded-md border border-[#E5E5E5] px-[1.125rem] focus:border-[#16ABF8] focus:outline-none"
														placeholder="Tambahkan nama list item"
													/>

													<Error />
												</div>
											)}
										</Field>

										<Field name="priority" label="PRIORITY">
											{({ Error, Label, Select }) => (
												<div className="mt-[1.625rem] flex flex-col gap-y-[.5625rem]">
													<Label className="text-xs font-semibold leading-[1.125rem]" />

													<Select />

													<Error />
												</div>
											)}
										</Field>
									</div>

									<div className="flex justify-end border-t border-[#E5E5E5] pr-10 pt-[.9375rem] pb-[1.1875rem]">
										<Button
											disabled={!formState.isValid}
											className="rounded-[2.8125rem] bg-[#16ABF8] py-[.84375rem] px-[2.4375rem] text-lg font-semibold leading-[1.6875rem] text-white disabled:opacity-20"
										>
											Simpan
										</Button>
									</div>
								</>
							)}
						</Form>
					</Dialog.Panel>
				</div>
			</Dialog>

			{/** TODO: Tambah animasi */}
			<Dialog
				open={isConfirmDeletionOpen}
				onClose={handleConfirmDeleteClose}
				className="relative z-50"
			>
				{/* The backdrop, rendered as a fixed sibling to the panel container */}
				<div className="fixed inset-0 bg-black/50" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center p-4">
					<Dialog.Panel
						className="h-[22.1875rem] w-[30.625rem] rounded-xl bg-white pt-10 pr-[3.875rem] pb-[2.6875rem] pl-[3.9375rem] shadow-[0_4px_10px_rgba(0,0,0,.1)]"
						data-cy="modal-delete"
					>
						<div className="flex justify-center text-[#ED4C5C]" data-cy="modal-delete-icon">
							<SvgIcon name="warning" width={84} height={84} color="#ED4C5C" />
						</div>

						<p
							className="mt-[2.125rem] text-center text-lg font-medium leading-[1.6875rem]"
							data-cy="modal-delete-title"
						>
							Apakah anda yakin menghapus List Item{' '}
							<span className="font-bold">&quot;{selectedTodo?.title}&quot;</span>?
						</p>

						<div className="mt-[2.875rem] flex justify-center gap-x-5">
							<button
								className="h-[3.375rem] w-[9.375rem] rounded-[2.8125rem] bg-[#F4F4F4] text-lg font-semibold leading-[1.6875rem] text-[#4A4A4A]"
								onClick={handleConfirmDeleteClose}
								data-cy="modal-delete-cancel-button"
							>
								Batal
							</button>

							{/** TODO: Tambah style untuk disabled state */}
							<button
								className="h-[3.375rem] w-[9.375rem] rounded-[2.8125rem] bg-[#ED4C5C] text-lg font-semibold leading-[1.6875rem] text-white"
								type="button"
								onClick={handleDelete}
								data-cy="modal-delete-confirm-button"
							>
								Hapus
							</button>
						</div>
					</Dialog.Panel>
				</div>
			</Dialog>

			{/** TODO: Tambah animasi */}
			<Dialog
				open={isInfoOpen}
				onClose={() => setIsInfoOpen(false)}
				className="relative z-50"
				initialFocus={refInfoDiv}
			>
				{/* The backdrop, rendered as a fixed sibling to the panel container */}
				<div className="fixed inset-0 bg-black/50" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center p-4">
					<Dialog.Panel
						className="flex h-[3.625rem] w-[30.625rem] items-center gap-x-[.625rem] rounded-xl bg-white py-[1.0625rem] px-[1.6875rem] shadow-[0_4px_10px_rgba(0,0,0,.1)]"
						ref={refInfoDiv}
						data-cy="modal-information"
					>
						<div className="text-[#00A790]" data-cy="modal-information-icon">
							<SvgIcon name="info" width={24} height={24} color="#00A790" />
						</div>

						<p
							className="text-sm font-medium leading-[1.3125rem]"
							data-cy="modal-information-title"
						>
							Todo berhasil dihapus
						</p>
					</Dialog.Panel>
				</div>
			</Dialog>
		</>
	);
};

export default ActivityPage;
