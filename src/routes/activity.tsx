import { Combobox, Dialog } from '@headlessui/react';
import clsx from 'clsx';
import { makeDomainFunction } from 'domain-functions';
import { useHead } from 'hoofd';
import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router-dom';
import {
	Form as FrameworkForm,
	json,
	Link,
	redirect,
	useActionData,
	useLoaderData,
	useNavigation,
	useSubmit
} from 'react-router-dom';
import { createForm, createFormAction } from 'remix-forms';
import { z } from 'zod';
import createTodo from '../actions/createTodo';
import deleteTodo from '../actions/deleteTodo';
import SvgIcon from '../components/SvgIcon';
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

const formAction = createFormAction({ json, redirect });

const Form = createForm({ component: FrameworkForm, useNavigation, useSubmit, useActionData });

const createSchema = z.object({
	activity_group_id: z.string().min(1),
	priority: z.nativeEnum(Priority).default(Priority.VeryHigh),
	title: z.string().min(1),
	_action: z.enum(['create', 'delete'])
});

const createMutation = makeDomainFunction(createSchema)(async values => {
	return createTodo(values);
});

export type CreateSchema = z.infer<typeof createSchema>;

const deleteSchema = z.object({
	id: z.number().min(1),
	_action: z.enum(['create', 'delete'])
});

const deleteMutation = makeDomainFunction(deleteSchema)(async values => {
	return deleteTodo({ id: values.id });
});

type DeleteSchema = z.infer<typeof deleteSchema>;

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.clone().formData();
	const data = Object.fromEntries(formData) as CreateSchema | DeleteSchema;

	if (data._action === 'create') {
		return formAction({
			request,
			schema: createSchema,
			mutation: createMutation
		});
	}

	if (data._action === 'delete') {
		return formAction({
			request,
			schema: deleteSchema,
			mutation: deleteMutation
		});
	}
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

	const [selectedPriority, setSelectedPriority] = useState(priorities[0]);
	const [editActivityTitle, setEditActivityTitle] = useState(false);

	const [query, setQuery] = useState('');
	const filteredPriority =
		query === ''
			? priorities
			: priorities.filter(priority => {
					return priority.name.toLowerCase().includes(query.toLowerCase());
			  });

	const [deleteData, setDeleteData] = useState<
		typeof loaderData['data']['todo_items'][number] | null
	>(null);
	const [isConfirmDeletionOpen, setIsConfirmDeletionOpen] = useState(false);

	const handleTrashClick = (todo: typeof loaderData['data']['todo_items'][number]) => {
		setDeleteData(todo);
		setIsConfirmDeletionOpen(true);
	};

	const handleConfirmDeleteClose = () => {
		setDeleteData(null);
		setIsConfirmDeletionOpen(false);
	};

	const submit = useSubmit();

	const handleDelete = () => {
		if (deleteData) {
			const formData = new FormData();

			formData.append('_action', 'delete');
			formData.append('id', `${deleteData.id}`);

			submit(formData, { method: 'post' });
			setIsConfirmDeletionOpen(false);
		}
	};

	const actionData = useActionData();
	useEffect(() => {
		let close = true;

		if (actionData && close) {
			setIsOpen(false);
		}

		return () => {
			close = false;
		};
	}, [actionData]);

	return (
		<>
			<div className="mt-[2.6875rem] flex justify-between">
				<div className="flex items-center justify-between gap-x-[1.1875rem]">
					<Link to="/">
						<SvgIcon name="chevron-left" width={32} height={32} color="#111111" />
					</Link>

					{editActivityTitle ? (
						<input
							type="text"
							name="activity_title"
							defaultValue={loaderData.data.title}
							className="border-b border-[#111111] bg-transparent text-4xl font-bold leading-[3.375rem] focus:outline-none"
							onBlur={() => console.log('blurred')}
						/>
					) : (
						<h1
							className="text-4xl font-bold leading-[3.375rem]"
							onClick={() => setEditActivityTitle(true)}
						>
							{loaderData.data.title}
						</h1>
					)}

					<div className="pr-10 text-[#A4A4A4]">
						<SvgIcon name="pencil" width={24} height={24} color="#A4A4A4" />
					</div>
				</div>

				<div className="flex items-center gap-x-[1.125rem]">
					{loaderData.data.todo_items.length ? (
						<button
							type="button"
							className="flex h-[3.375rem] w-[3.375rem] items-center justify-center rounded-[2.8125rem] border border-[#E5E5E5] text-[#888888]"
						>
							<SvgIcon name="sort" width={24} height={24} color="#888888" />
						</button>
					) : null}

					<button
						type="button"
						className="flex h-[3.375rem] items-center gap-x-[.375rem] rounded-[2.8125rem] bg-[#16ABF8] pl-[1.375rem] pr-[1.8125rem] text-white"
						onClick={() => setIsOpen(true)}
					>
						<SvgIcon name="plus" width={24} height={24} />

						<span className="text-lg">Tambah</span>
					</button>
				</div>
			</div>

			{loaderData.data.todo_items.length ? (
				<article className="mt-12 flex flex-col gap-y-[.625rem]">
					{loaderData.data.todo_items.map(todo => (
						<article
							key={todo.id}
							className="flex items-center rounded-xl bg-white pt-[1.625rem] pr-6 pb-[1.6875rem] pl-7 shadow-[0_6px_10px_rgba(0,0,0,.1)]"
						>
							<input type="checkbox" className="h-5 w-5" />

							<Color
								color={
									priorities.find(priority => priority.name === todo.priority)?.color ?? '#ffffff'
								}
								className="ml-[1.375rem] h-[.5625rem] w-[.5625rem]"
							/>

							<h2 className="ml-4 text-lg font-medium leading-[1.6875rem]">{todo.title}</h2>

							<div className="flex flex-1 items-center">
								<button type="button" className="ml-4 w-fit text-[#C4C4C4]">
									<SvgIcon name="pencil" width={20} height={20} color="#C4C4C4" />
								</button>
							</div>

							<button
								type="button"
								className="text-[#888888]"
								onClick={() => handleTrashClick(todo)}
							>
								<SvgIcon name="trash" width={24} height={24} color="#888888" />
							</button>
						</article>
					))}
				</article>
			) : null}

			{/** TODO: Tambah animasi */}
			<Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
				{/* The backdrop, rendered as a fixed sibling to the panel container */}
				<div className="fixed inset-0 bg-black/50" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
					<Dialog.Panel className="w-[51.875rem] rounded-xl bg-white shadow-[0_4px_10px_rgba(0,0,0,.1)]">
						<div className="flex items-center justify-between border-b border-[#E5E5E5] pt-6 pr-[2.5625rem] pb-[1.1875rem] pl-[1.875rem]">
							<Dialog.Title className="text-lg font-semibold leading-[1.6875rem]">
								Tambah List Item
							</Dialog.Title>

							<button type="button" className="text-[#A4A4A4]">
								<SvgIcon name="close" width={24} height={24} color="#A4A4A4" />
							</button>
						</div>

						<Form
							schema={createSchema}
							method="post"
							hiddenFields={['activity_group_id', '_action']}
							values={{ activity_group_id: loaderData.data.id, _action: 'create' }}
						>
							{({ Field, Button, control, formState }) => (
								<>
									<Field name="activity_group_id" />
									<Field name="_action" />

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
											{({ Error, Label }) => (
												<div className="mt-[1.625rem] flex flex-col gap-y-[.5625rem]">
													<Label className="text-xs font-semibold leading-[1.125rem]" />

													<Controller
														control={control}
														name="priority"
														defaultValue={selectedPriority.name}
														render={({ field: { onChange, value, ...rest } }) => (
															<>
																<Combobox
																	as="div"
																	className="relative"
																	defaultValue={selectedPriority.name}
																	onChange={(priority: Priority) => {
																		onChange(priority);

																		const relatedPriority = priorities.find(
																			p => p.name === priority
																		);

																		if (relatedPriority) {
																			setSelectedPriority(relatedPriority);
																		}
																	}}
																	{...rest}
																>
																	{({ open }) => (
																		<>
																			<div
																				className={clsx(
																					'flex h-[3.25rem] max-w-[12.8125rem] items-center rounded-md border border-[#E5E5E5] px-[1.0625rem] focus-within:border-[#16ABF8] focus:outline-none',
																					{ 'bg-[#F4F4F4]': open }
																				)}
																			>
																				<Color
																					color={selectedPriority.color}
																					className="h-[.875rem] w-[.875rem] shrink-0"
																				/>

																				<Combobox.Input
																					onChange={e => setQuery(e.target.value)}
																					className="h-full w-full bg-inherit pl-[1.125rem] pr-2 focus:outline-none"
																					placeholder="Pilih priority"
																					displayValue={() => selectedPriority.display}
																				/>

																				<Combobox.Button>
																					{open ? (
																						<SvgIcon name="chevron-up" width={24} height={24} />
																					) : (
																						<SvgIcon name="chevron-down" width={24} height={24} />
																					)}
																				</Combobox.Button>
																			</div>

																			<Combobox.Options className="absolute w-full max-w-[12.8125rem] divide-y divide-[#E5E5E5] rounded-md border border-[#E5E5E5] bg-white">
																				{filteredPriority.map(priority => (
																					<Combobox.Option
																						key={priority.name}
																						value={priority.name}
																						className="flex items-center py-[.875rem] pl-[1.0625rem] pr-[1.4375rem] text-[#4A4A4A] hover:cursor-pointer"
																					>
																						{({ selected }) => (
																							<>
																								<Color
																									color={priority.color}
																									className="mr-[1.1875rem] h-[.875rem] w-[.875rem] shrink-0"
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
																					</Combobox.Option>
																				))}
																			</Combobox.Options>
																		</>
																	)}
																</Combobox>
															</>
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
					<Dialog.Panel className="h-[22.1875rem] w-[30.625rem] rounded-xl bg-white pt-10 pr-[3.875rem] pb-[2.6875rem] pl-[3.9375rem] shadow-[0_4px_10px_rgba(0,0,0,.1)]">
						<div className="flex justify-center text-[#ED4C5C]">
							<SvgIcon name="warning" width={84} height={84} color="#ED4C5C" />
						</div>

						<p className="mt-[2.125rem] text-center text-lg font-medium leading-[1.6875rem]">
							Apakah anda yakin menghapus List Item{' '}
							<span className="font-bold">&quot;{deleteData?.title}&quot;</span>?
						</p>

						<div className="mt-[2.875rem] flex justify-center gap-x-5">
							<button
								className="h-[3.375rem] w-[9.375rem] rounded-[2.8125rem] bg-[#F4F4F4] text-lg font-semibold leading-[1.6875rem] text-[#4A4A4A]"
								onClick={handleConfirmDeleteClose}
							>
								Batal
							</button>

							{/** TODO: Tambah style untuk disabled state */}
							<button
								className="h-[3.375rem] w-[9.375rem] rounded-[2.8125rem] bg-[#ED4C5C] text-lg font-semibold leading-[1.6875rem] text-white"
								type="button"
								onClick={handleDelete}
							>
								Hapus
							</button>
						</div>
					</Dialog.Panel>
				</div>
			</Dialog>
		</>
	);
};

export default ActivityPage;
