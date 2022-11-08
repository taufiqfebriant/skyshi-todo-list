import { useHead } from 'hoofd';
import SvgIcon from '../components/SvgIcon';

const Dashboard = () => {
	useHead({
		title: 'To Do List - Dashboard'
	});

	return (
		<>
			<div className="mt-[2.6875rem] flex justify-between">
				<h1 className="text-4xl font-bold leading-[3.375rem]">Activity</h1>

				<button
					type="button"
					className="flex h-[3.375rem] items-center gap-x-[.375rem] rounded-[2.8125rem] bg-[#16ABF8] pl-[1.375rem] pr-[1.8125rem] text-white"
				>
					<SvgIcon name="plus" width={24} height={24} />
					<span className="text-[1.125rem]">Tambah</span>
				</button>
			</div>
		</>
	);
};

export default Dashboard;
