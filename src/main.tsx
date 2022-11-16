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
import { ActivityPage, activityPageAction, activityPageLoader } from './modules/activity/page';
import { RootPage } from './modules/root/page';

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
