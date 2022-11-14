import { Dialog } from '@headlessui/react';
import dayjs from 'dayjs';
import { useHead } from 'hoofd';
import { useEffect, useRef, useState } from 'react';
import type { ActionFunctionArgs } from 'react-router-dom';
import {
	Form,
	json,
	Link,
	useActionData,
	useLoaderData,
	useNavigation,
	useSubmit
} from 'react-router-dom';
import SvgIcon from '../../components/SvgIcon';
import emptyStateImg from './activity-empty-state.png';
import { createActivity } from './createActivity';
import { deleteActivity } from './deleteActivity';
import type { GetActivitiesResponse } from './getActivities';
import { getActivities } from './getActivities';

type LoaderData = {
	data: GetActivitiesResponse['data'];
};

export const activitiesPageLoader = async () => {
	const data = await getActivities();
	return json({ data });
};

const subAction = ['create', 'delete'] as const;

type SubAction = typeof subAction[number];

type RequestFormData = {
	subAction: SubAction;
};

type DeleteRequestData = RequestFormData & {
	id: string;
};

type ActionData = RequestFormData & {
	success: boolean;
};

export const activitiesPageAction = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const subAction = formData.get('subAction') as SubAction | null;

	let success = false;

	if (subAction === 'create') {
		try {
			await createActivity();
			success = true;
		} catch {
			success = false;
		}
	}

	if (subAction === 'delete') {
		try {
			const requestData = Object.fromEntries(formData) as unknown as DeleteRequestData;
			await deleteActivity({ id: +requestData.id });
			success = true;
		} catch {
			success = false;
		}
	}

	return json({ subAction, success });
};

export const ActivitiesPage = () => {
	useHead({
		title: 'To Do List - Dashboard'
	});

	const [isOpen, setIsOpen] = useState(false);
	const [selectedActivity, setSelectedActivity] = useState<LoaderData['data'][number] | null>(null);

	const navigation = useNavigation();
	const isCreating =
		navigation.state === 'submitting' && navigation.formData.get('_action') === 'create';
	const isDeleting =
		navigation.state === 'submitting' && navigation.formData.get('_action') === 'delete';

	const handleOpen = (activity: LoaderData['data'][number]) => {
		setSelectedActivity(activity);
		setIsOpen(true);
	};

	const handleClose = () => {
		setSelectedActivity(null);
		setIsOpen(false);
	};

	const submit = useSubmit();

	type HandleDeleteParams = Pick<LoaderData['data'][number], 'id'>;

	const handleDelete = (params: HandleDeleteParams) => {
		const formData = new FormData();

		formData.append('subAction', subAction[1]);
		formData.append('id', `${params.id}`);

		submit(formData, { method: 'post' });
		setIsOpen(false);
	};

	const loaderData = useLoaderData() as LoaderData;

	const actionData = useActionData() as ActionData | undefined;
	const [isInfoOpen, setIsInfoOpen] = useState(false);
	const refResultDiv = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let run = true;

		if (actionData?.subAction === 'delete' && actionData.success && run) {
			setIsInfoOpen(true);
		}

		return () => {
			run = false;
		};
	}, [actionData]);

	return (
		<>
			<div className="mt-[2.6875rem] flex justify-between">
				<h1 className="text-4xl font-bold leading-[3.375rem]" data-cy="activity-title">
					Activity
				</h1>

				<Form method="post">
					{/** TODO: Tambah style untuk disabled state */}
					<button
						type="submit"
						className="flex h-[3.375rem] items-center gap-x-[.375rem] rounded-[2.8125rem] bg-[#16ABF8] pl-[1.375rem] pr-[1.8125rem] text-white"
						data-cy="activity-add-button"
						name="subAction"
						value={subAction[0]}
						disabled={isCreating}
					>
						<SvgIcon name="plus" width={24} height={24} />

						<span className="text-lg">Tambah</span>
					</button>
				</Form>
			</div>

			{loaderData.data.length ? (
				<article className="my-[3.0625rem] grid grid-cols-4 gap-x-5 gap-y-[1.625rem]">
					{loaderData.data.map(activity => (
						<article
							key={activity.id}
							className="flex h-[14.625rem] flex-col justify-between rounded-xl bg-white p-[1.375rem_1.625rem_1.5625rem_1.6875rem] shadow-[0_6px_10px_rgba(0,0,0,.1)]"
							data-cy="activity-item"
						>
							<Link to={`/detail/${activity.id}`} className="flex-1">
								<h2 className="text-lg font-bold" data-cy="activity-item-title">
									{activity.title}
								</h2>
							</Link>

							<div className="flex items-center justify-between text-[#888888]">
								<p className="text-sm font-medium leading-[1.3125rem]" data-cy="activity-item-date">
									{dayjs(activity.created_at).format('DD MMMM YYYY')}
								</p>

								<button
									type="button"
									onClick={() => handleOpen(activity)}
									data-cy="activity-item-delete-button"
								>
									<SvgIcon name="trash" width={24} height={24} color="#888888" />
								</button>
							</div>
						</article>
					))}
				</article>
			) : (
				<Form method="post" className="my-[3.6875rem] flex justify-center">
					<button
						type="submit"
						name="subAction"
						value={subAction[0]}
						disabled={isCreating}
						data-cy="activity-empty-state"
						className="max-h-[30.625rem] max-w-[47.9375rem]"
					>
						<img src={emptyStateImg} alt="Add activity illustration" />
					</button>
				</Form>
			)}

			{/** TODO: Tambah animasi */}
			<Dialog open={isOpen} onClose={handleClose} className="relative z-50">
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
							Apakah anda yakin menghapus activity{' '}
							<span className="font-bold">&quot;{selectedActivity?.title}&quot;</span>?
						</p>

						<div className="mt-[2.875rem] flex justify-center gap-x-5">
							<button
								className="h-[3.375rem] w-[9.375rem] rounded-[2.8125rem] bg-[#F4F4F4] text-lg font-semibold leading-[1.6875rem] text-[#4A4A4A]"
								onClick={handleClose}
								data-cy="modal-delete-cancel-button"
							>
								Batal
							</button>

							{/** TODO: Tambah style untuk disabled state */}
							<button
								className="h-[3.375rem] w-[9.375rem] rounded-[2.8125rem] bg-[#ED4C5C] text-lg font-semibold leading-[1.6875rem] text-white"
								type="button"
								onClick={() => {
									if (!selectedActivity) return;
									handleDelete({ id: selectedActivity.id });
								}}
								disabled={isDeleting}
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
				initialFocus={refResultDiv}
			>
				<div className="fixed inset-0 bg-black/50" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center p-4">
					<Dialog.Panel
						className="flex h-[3.625rem] w-[30.625rem] items-center gap-x-[.625rem] rounded-xl bg-white py-[1.0625rem] px-[1.6875rem] shadow-[0_4px_10px_rgba(0,0,0,.1)]"
						ref={refResultDiv}
						data-cy="modal-information"
					>
						<div className="text-[#00A790]" data-cy="modal-information-icon">
							<SvgIcon name="info" width={24} height={24} color="#00A790" />
						</div>

						<p
							className="text-sm font-medium leading-[1.3125rem]"
							data-cy="modal-information-title"
						>
							Activity berhasil dihapus
						</p>
					</Dialog.Panel>
				</div>
			</Dialog>
		</>
	);
};
