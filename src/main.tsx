import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'virtual:svg-icons-register';
import './index.css';
import {
	ActivitiesPage,
	activitiesPageAction,
	activitiesPageLoader
} from './modules/activities/page';
import { RootPage } from './modules/root/page';
import ActivityPage, {
	action as activityPageAction,
	loader as activityPageLoader
} from './routes/activity';

const router = createBrowserRouter([
	{
		path: '/',
		element: <RootPage />,
		children: [
			{
				path: '/',
				element: <ActivitiesPage />,
				loader: activitiesPageLoader,
				action: activitiesPageAction
			},
			{
				path: '/detail/:id',
				element: <ActivityPage />,
				loader: activityPageLoader,
				action: activityPageAction
			}
		]
	}
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
