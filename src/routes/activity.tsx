import { Dialog, Listbox } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useHead } from 'hoofd';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router-dom';
import {
	json,
	Link,
	useActionData,
	useLoaderData,
	useNavigation,
	useSubmit
} from 'react-router-dom';
import type { CheckTodoSchema } from '../actions/checkTodo';
import { checkTodo } from '../actions/checkTodo';
import type { CreateTodoParams } from '../actions/createTodo';
import { createTodo } from '../actions/createTodo';
import type { DeleteTodoSchema } from '../actions/deleteTodo';
import { deleteTodo } from '../actions/deleteTodo';
import type { UpdateActivityTitleParams } from '../actions/updateActivityTitle';
import { updateActivityTitle } from '../actions/updateActivityTitle';
import type { UpdateTodoParams } from '../actions/updateTodo';
import { updateTodo } from '../actions/updateTodo';
import SvgIcon from '../components/SvgIcon';
import emptyStateImg from '../images/todo-empty-state.png';
import type { ModifiedActivity } from '../loaders/getActivity';
import { getActivity } from '../loaders/getActivity';
import type { TodoFormSchema } from '../schemas/todo';
import { todoFormSchema } from '../schemas/todo';
import type { Todo } from '../utils';
import { priorities, priorityInfo } from '../utils';

type LoaderData = {
	data: ModifiedActivity;
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

const subAction = ['create', 'delete', 'check', 'update', 'updateActivityTitle'] as const;

type SubAction = typeof subAction[number];

type Schema = {
	subAction: SubAction;
};

type CreateSchema = Schema &
	Omit<CreateTodoParams, 'activity_group_id'> & {
		activity_group_id: string;
	};

type UpdateSchema = Schema &
	Omit<UpdateTodoParams, 'id' | 'is_active'> & {
		id: string;
		is_active: '0' | '1';
	};

type DeleteSchema = Schema & DeleteTodoSchema;
type CheckSchema = Schema & CheckTodoSchema;

type UpdateActivityTitleSchema = Schema &
	Omit<UpdateActivityTitleParams, 'id'> & {
		id: string;
	};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const subAction = formData.get('subAction') as SubAction | null;

	let success = false;

	if (subAction === 'create') {
		try {
			const { subAction, activity_group_id, ...rest } = Object.fromEntries(
				formData
			) as unknown as CreateSchema;

			await createTodo({ ...rest, activity_group_id: +activity_group_id });

			success = true;
		} catch {
			success = false;
		}
	}

	if (subAction === 'delete') {
		try {
			const { subAction, ...rest } = Object.fromEntries(formData) as unknown as DeleteSchema;
			await deleteTodo({ ...rest });
			success = true;
		} catch {
			success = false;
		}
	}

	if (subAction === 'check') {
		try {
			const { subAction, ...rest } = Object.fromEntries(formData) as unknown as CheckSchema;
			await checkTodo({ ...rest });
			success = true;
		} catch {
			success = false;
		}
	}

	if (subAction === 'update') {
		try {
			const { subAction, id, is_active, ...rest } = Object.fromEntries(
				formData
			) as unknown as UpdateSchema;

			await updateTodo({ ...rest, id: +id, is_active: +is_active as Todo['is_active'] });

			success = true;
		} catch {
			success = false;
		}
	}

	if (subAction === 'updateActivityTitle') {
		try {
			const { subAction, ...rest } = Object.fromEntries(
				formData
			) as unknown as UpdateActivityTitleSchema;

			await updateActivityTitle({ ...rest, id: +rest.id });

			success = true;
		} catch {
			success = false;
		}
	}

	return json({ subAction, success });
};

type ActionData = {
	subAction: SubAction;
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

enum Sort {
	Latest = 'latest',
	Oldest = 'oldest',
	AZ = 'az',
	ZA = 'za',
	Unfinished = 'unfinished'
}

type SortOption = {
	value: Sort;
	display: string;
};

const sortOptions: SortOption[] = [
	{
		value: Sort.Latest,
		display: 'Terbaru'
	},
	{
		value: Sort.Oldest,
		display: 'Terlama'
	},
	{
		value: Sort.AZ,
		display: 'A-Z'
	},
	{
		value: Sort.ZA,
		display: 'Z-A'
	},
	{
		value: Sort.Unfinished,
		display: 'Belum Selesai'
	}
];

// TODO: Handle 404
const ActivityPage = () => {
	useHead({
		title: 'To Do List - Detail'
	});

	const createForm = useForm<TodoFormSchema>({ resolver: zodResolver(todoFormSchema) });
	const updateForm = useForm<TodoFormSchema>({ resolver: zodResolver(todoFormSchema) });

	const submit = useSubmit();

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

	const actionData = useActionData() as ActionData | undefined;
	useEffect(() => {
		let run = true;

		if (actionData?.subAction === 'create' && actionData.success && run) {
			setIsOpen(false);
		}

		if (actionData?.subAction === 'update' && actionData.success && run) {
			setIsEditOpen(false);
		}

		if (actionData?.subAction === 'delete' && actionData.success && run) {
			setIsInfoOpen(true);
		}

		return () => {
			run = false;
		};
	}, [actionData]);

	const [isEditOpen, setIsEditOpen] = useState(false);

	const handlePencilTodoClick = (todo: typeof loaderData['data']['todo_items'][number]) => {
		setSelectedTodo(todo);

		const relatedPriority = priorities.find(p => p === todo.priority);
		if (relatedPriority) {
			setSelectedPriority(relatedPriority);
		}

		setIsEditOpen(true);
	};

	const [selectedSort, setSelectedSort] = useState<Sort>(Sort.Latest);

	const sortedTodos = loaderData.data.todo_items;
	sortedTodos.sort((a, b) => {
		if (selectedSort === Sort.Oldest) {
			return a.id - b.id;
		}

		if (selectedSort === Sort.AZ) {
			return a.title.localeCompare(b.title);
		}

		if (selectedSort === Sort.ZA) {
			return b.title.localeCompare(a.title);
		}

		if (selectedSort === Sort.Unfinished) {
			return b.is_active - a.is_active;
		}

		return b.id - a.id;
	});

	const [isInfoOpen, setIsInfoOpen] = useState(false);
	const refInfoDiv = useRef<HTMLDivElement>(null);

	const [selectedPriority, setSelectedPriority] = useState<typeof priorities[number] | null>(null);

	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		function assertIsNode(e: EventTarget | null): asserts e is Node {
			if (!e || !('nodeType' in e)) {
				throw new Error(`Node expected`);
			}
		}

		function handleClickOutside(event: MouseEvent) {
			assertIsNode(event.target);

			if (inputRef.current && !inputRef.current.contains(event.target)) {
				setEditActivityTitle(false);

				const formData = new FormData();

				formData.append('subAction', 'updateActivityTitle');
				formData.append('id', `${loaderData.data.id}`);
				formData.append('title', inputRef.current.value);

				submit(formData, { method: 'post' });
			}
		}
		// Bind the event listener
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [inputRef, loaderData.data.id, submit]);

	const navigation = useNavigation();
	const activityTitle =
		navigation.formData?.get('subAction') === 'updateActivityTitle' &&
		navigation.formData?.get('title')
			? navigation.formData?.get('title')
			: loaderData.data.title;

	const handleCreate = (params: TodoFormSchema) => {
		const formData = new FormData();

		formData.append('title', params.title);
		formData.append('priority', params.priority);
		formData.append('subAction', 'create');
		formData.append('activity_group_id', `${loaderData.data.id}`);

		submit(formData, { method: 'post' });
	};

	type HandleDeleteParams = {
		id: number;
	};

	const handleDelete = (params: HandleDeleteParams) => {
		const formData = new FormData();

		formData.append('subAction', 'delete');
		formData.append('id', `${params.id}`);

		submit(formData, { method: 'post' });
		setIsConfirmDeletionOpen(false);
	};

	const handleCheck = (todo: typeof loaderData['data']['todo_items'][number]) => {
		const formData = new FormData();

		formData.append('subAction', 'check');
		formData.append('id', `${todo.id}`);
		formData.append('priority', `${todo.priority}`);
		formData.append('is_active', todo.is_active ? '0' : '1');

		submit(formData, { method: 'post' });
	};

	const handleUpdate = (params: TodoFormSchema) => {
		if (!selectedTodo) return;

		const formData = new FormData();

		formData.append('title', params.title);
		formData.append('priority', params.priority);
		formData.append('subAction', 'update');
		formData.append('id', `${selectedTodo.id}`);
		formData.append('is_active', `${selectedTodo.is_active}`);

		submit(formData, { method: 'post' });
	};

	return (
		<>
			<div className="mt-[2.6875rem] flex w-full justify-between">
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
							ref={inputRef}
						/>
					) : (
						<h1
							className="text-4xl font-bold leading-[3.375rem]"
							onClick={() => setEditActivityTitle(true)}
							data-cy="todo-title"
						>
							{activityTitle?.toString()}
						</h1>
					)}

					<button
						type="button"
						className="pr-10 text-[#A4A4A4]"
						data-cy="todo-title-edit-button"
						onClick={() => setEditActivityTitle(true)}
					>
						<SvgIcon name="pencil" width={24} height={24} color="#A4A4A4" />
					</button>
				</div>

				<div className="flex shrink-0 items-center gap-x-[1.125rem]">
					{loaderData.data.todo_items.length ? (
						<Listbox as="div" className="relative" value={selectedSort} onChange={setSelectedSort}>
							<Listbox.Button
								className="flex h-[3.375rem] w-[3.375rem] items-center justify-center rounded-[2.8125rem] border border-[#E5E5E5] text-[#888888]"
								data-cy="todo-sort-button"
							>
								<SvgIcon name="sort" width={24} height={24} color="#888888" />
							</Listbox.Button>

							<Listbox.Options
								className="absolute right-0 top-16 w-[14.6875rem] divide-y divide-[#E5E5E5] rounded-md bg-white text-[#4A4A4A] shadow-[0_6px_15px_5px_rgba(0,0,0,.1)]"
								data-cy="sort-parent"
							>
								{sortOptions.map(sortOption => (
									<Listbox.Option
										value={sortOption.value}
										className="flex items-center gap-x-[.9375rem] py-[.875rem] px-[1.3125rem]"
										data-cy="sort-selection"
										key={sortOption.value}
									>
										{({ selected }) => (
											<>
												<SvgIcon
													name={sortOption.value}
													width={18}
													height={18}
													color="#16ABF8"
													className="text-[#16ABF8]"
												/>

												<span className="flex-1 text-[#4A4A4A]">{sortOption.display}</span>

												{selected ? (
													<div className="text-[#4A4A4A]">
														<SvgIcon name="check" width={18} height={18} color="#4A4A4A" />
													</div>
												) : null}
											</>
										)}
									</Listbox.Option>
								))}
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
								onChange={() => handleCheck(todo)}
								data-cy="todo-item-checkbox"
							/>

							<Color
								color={priorityInfo[todo.priority].color}
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

						<form onSubmit={createForm.handleSubmit(handleCreate)}>
							<div className="pl-[1.875rem] pr-[2.5625rem] pt-[2.375rem] pb-[1.4375rem]">
								<div className="flex flex-col gap-y-[.5625rem]">
									<label
										className="text-xs font-semibold leading-[1.125rem]"
										data-cy="modal-add-name-title"
										htmlFor="title"
									>
										NAMA LIST ITEM
									</label>

									<input
										className="h-[3.25rem] rounded-md border border-[#E5E5E5] px-[1.125rem] focus:border-[#16ABF8] focus:outline-none"
										placeholder="Tambahkan nama list item"
										data-cy="modal-add-name-input"
										id="title"
										{...createForm.register('title')}
									/>
								</div>

								<div className="mt-[1.625rem]">
									<Controller
										control={createForm.control}
										name="priority"
										render={({ field: { value, ...rest } }) => (
											<Listbox as="div" value={value} {...rest}>
												<Listbox.Label
													className="text-xs font-semibold leading-[1.125rem]"
													data-cy="modal-add-priority-title"
												>
													PRIORITY
												</Listbox.Label>

												<div className="relative mt-[.5625rem] box-border max-w-[12.8125rem]">
													<Listbox.Button
														data-cy="modal-add-priority-dropdown"
														className="flex w-full items-center justify-between rounded-md border border-[#E5E5E5] px-[1.0625rem] py-[.875rem] focus:border-[#16ABF8]"
													>
														{value ? (
															<div
																data-cy="modal-add-priority-item"
																className="flex items-center gap-x-[1.1875rem]"
															>
																<Color
																	color={priorityInfo[value].color}
																	className="h-[.875rem] w-[.875rem]"
																/>

																<span className="capitalize">{value.replace('-', ' ')}</span>
															</div>
														) : (
															<span>Pilih priority</span>
														)}

														<SvgIcon name="chevron-down" width={24} height={24} color="#111111" />
													</Listbox.Button>

													<Listbox.Options className="absolute top-0 left-0 w-full divide-y divide-[#E5E5E5] overflow-hidden rounded-md border border-[#16ABF8] bg-white">
														<Listbox.Option
															disabled={true}
															value={null}
															className="flex items-center justify-between bg-[#F4F4F4] py-[.875rem] pl-[1.0625rem] pr-[1.4375rem]"
														>
															<span>Pilih priority</span>

															<SvgIcon name="chevron-up" width={24} height={24} color="#111111" />
														</Listbox.Option>

														{priorities.map(priority => (
															<Listbox.Option
																key={priority}
																value={priority}
																data-cy="modal-add-priority-item"
																className="flex items-center gap-x-[1.1875rem] py-[.875rem] pl-[1.0625rem] pr-[1.4375rem] text-[#4A4A4A] hover:cursor-pointer"
															>
																{({ selected }) => (
																	<>
																		<Color
																			color={priorityInfo[priority].color}
																			className="h-[.875rem] w-[.875rem]"
																		/>

																		<span className="flex-1 capitalize">
																			{priority.replace('-', ' ')}
																		</span>

																		{selected ? (
																			<SvgIcon
																				name="check"
																				width={18}
																				height={18}
																				color="#4A4A4A"
																			/>
																		) : null}
																	</>
																)}
															</Listbox.Option>
														))}
													</Listbox.Options>
												</div>
											</Listbox>
										)}
									/>
								</div>
							</div>

							<div className="flex justify-end border-t border-[#E5E5E5] pr-10 pt-[.9375rem] pb-[1.1875rem]">
								<button
									disabled={!createForm.formState.isValid}
									className="rounded-[2.8125rem] bg-[#16ABF8] py-[.84375rem] px-[2.4375rem] text-lg font-semibold leading-[1.6875rem] text-white disabled:opacity-20"
									data-cy="modal-add-save-button"
									type="submit"
								>
									Simpan
								</button>
							</div>
						</form>
					</Dialog.Panel>
				</div>
			</Dialog>

			{/* * TODO: Tambah animasi
			<Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} className="relative z-50">
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

						<form onSubmit={updateForm.handleSubmit(handleUpdate)}>
							<div className="pl-[1.875rem] pr-[2.5625rem] pt-[2.375rem] pb-[1.4375rem]">
								<div className="flex flex-col gap-y-[.5625rem]">
									<label className="text-xs font-semibold leading-[1.125rem]" htmlFor="title">
										NAMA LIST ITEM
									</label>

									<input
										className="h-[3.25rem] rounded-md border border-[#E5E5E5] px-[1.125rem] focus:border-[#16ABF8] focus:outline-none"
										placeholder="Tambahkan nama list item"
										id="title"
										defaultValue={selectedTodo?.title}
										{...updateForm.register('title')}
									/>
								</div>

								<div className="mt-[1.625rem]">
									<Controller
										control={updateForm.control}
										defaultValue={selectedTodo?.priority}
										name="priority"
										render={({ field: { onChange, ...rest } }) => (
											<Listbox
												as="div"
												onChange={priority => {
													onChange(priority);

													const relatedPriority = priorities.find(p => p.name === priority);
													if (relatedPriority) {
														setSelectedPriority(relatedPriority);
													}
												}}
												{...rest}
											>
												<Listbox.Label className="text-xs font-semibold leading-[1.125rem]">
													PRIORITY
												</Listbox.Label>

												<div className="relative mt-[.5625rem] box-border max-w-[12.8125rem]">
													<Listbox.Button className="flex w-full items-center justify-between rounded-md border border-[#E5E5E5] px-[1.0625rem] py-[.875rem] focus:border-[#16ABF8]">
														{selectedPriority ? (
															<div className="flex items-center gap-x-[1.1875rem]">
																<Color
																	color={selectedPriority.color}
																	className="h-[.875rem] w-[.875rem]"
																/>

																<span>{selectedPriority.display}</span>
															</div>
														) : (
															<span>Pilih priority</span>
														)}

														<SvgIcon name="chevron-down" width={24} height={24} color="#111111" />
													</Listbox.Button>

													<Listbox.Options className="absolute top-0 left-0 w-full divide-y divide-[#E5E5E5] overflow-hidden rounded-md border border-[#16ABF8] bg-white">
														<Listbox.Option
															disabled={true}
															value={null}
															className="flex items-center justify-between bg-[#F4F4F4] py-[.875rem] pl-[1.0625rem] pr-[1.4375rem]"
														>
															<span>Pilih priority</span>

															<SvgIcon name="chevron-up" width={24} height={24} color="#111111" />
														</Listbox.Option>

														{priorities.map(priority => (
															<Listbox.Option
																key={priority.name}
																value={priority.name}
																className="flex items-center gap-x-[1.1875rem] py-[.875rem] pl-[1.0625rem] pr-[1.4375rem] text-[#4A4A4A] hover:cursor-pointer"
															>
																{({ selected }) => (
																	<>
																		<Color
																			color={priority.color}
																			className="h-[.875rem] w-[.875rem]"
																		/>

																		<span className="flex-1">{priority.display}</span>

																		{selected ? (
																			<SvgIcon
																				name="check"
																				width={18}
																				height={18}
																				color="#4A4A4A"
																			/>
																		) : null}
																	</>
																)}
															</Listbox.Option>
														))}
													</Listbox.Options>
												</div>
											</Listbox>
										)}
									/>
								</div>
							</div>

							<div className="flex justify-end border-t border-[#E5E5E5] pr-10 pt-[.9375rem] pb-[1.1875rem]">
								<button
									disabled={!updateForm.formState.isValid}
									className="rounded-[2.8125rem] bg-[#16ABF8] py-[.84375rem] px-[2.4375rem] text-lg font-semibold leading-[1.6875rem] text-white disabled:opacity-20"
									type="submit"
								>
									Simpan
								</button>
							</div>
						</form>
					</Dialog.Panel>
				</div>
			</Dialog> */}

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
								onClick={() => {
									if (selectedTodo) {
										handleDelete({ id: selectedTodo.id });
									}
								}}
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
