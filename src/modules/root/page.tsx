import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export const RootPage = () => {
	useEffect(() => {
		document.body.classList.add('bg-[#F4F4F4]', 'text-[#111111]');
	}, []);

	return (
		<>
			<header
				className="sticky top-0 z-40 bg-[#16ABF8] shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
				data-cy="header-background"
			>
				<div className="mx-auto max-w-[62.5rem] pt-[2.375rem] pb-[1.9375rem]">
					<h1 className="max-w- text-2xl font-bold leading-9 text-white" data-cy="header-title">
						TO DO LIST APP
					</h1>
				</div>
			</header>
			<main className="mx-auto max-w-[62.5rem]">
				<Outlet />
			</main>
		</>
	);
};
