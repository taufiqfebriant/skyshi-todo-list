import dayjs from 'dayjs';
import { useHead } from 'hoofd';
import { Form, json, Link, useLoaderData } from 'react-router-dom';
import createActivity from '../actions/createActivity';
import SvgIcon from '../components/SvgIcon';
import getActivities, { JsonResponse } from '../loaders/getActivities';

export const loader = async () => {
	const data = await getActivities();
	return json({ data });
};

type LoaderData = {
	data: JsonResponse['data'];
};

export const action = async () => {
	try {
		await createActivity();
	} catch (e) {
		console.log('Failed to create activity');
	}
};

const Dashboard = () => {
	useHead({
		title: 'To Do List - Dashboard'
	});

	const loaderData = useLoaderData() as LoaderData;

	return (
		<>
			<div className="mt-[2.6875rem] flex justify-between">
				<h1 className="text-4xl font-bold leading-[3.375rem]">Activity</h1>

				<Form method="post">
					<button
						type="submit"
						className="flex h-[3.375rem] items-center gap-x-[.375rem] rounded-[2.8125rem] bg-[#16ABF8] pl-[1.375rem] pr-[1.8125rem] text-white"
						data-cy="activity-add-button"
					>
						<SvgIcon name="plus" width={24} height={24} />

						<span className="text-lg">Tambah</span>
					</button>
				</Form>
			</div>

			{/** TODO: Tambah layout ketika activity kosong */}
			{loaderData.data.length ? (
				<article className="my-[3.0625rem] grid grid-cols-4 gap-x-5 gap-y-[1.625rem]">
					{loaderData.data.map(activity => (
						<article
							key={activity.id}
							className="flex h-[14.625rem] flex-col justify-between rounded-xl bg-white p-[1.375rem_1.625rem_1.5625rem_1.6875rem] shadow-[0_6px_10px_rgba(0,0,0,.1)]"
						>
							<Link to={`/detail/${activity.id}`} className="flex-1">
								<h2 className="text-lg font-bold">{activity.title}</h2>
							</Link>

							<div className="flex items-center justify-between text-[#888888]">
								<p className="text-sm font-medium leading-[1.3125rem]">
									{dayjs(activity.created_at).format('DD MMMM YYYY')}
								</p>

								<SvgIcon name="trash" width={24} height={24} color="#888888" />
							</div>
						</article>
					))}
				</article>
			) : null}
		</>
	);
};

export default Dashboard;
