import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'virtual:svg-icons-register';
import './index.css';
import ActivityPage, {
	action as activityPageAction,
	loader as activityPageLoader
} from './routes/activity';
import DashboardPage, {
	action as dashboardPageAction,
	loader as dashboardPageLoader
} from './routes/dashboard';
import Root from './routes/root';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Root />,
		children: [
			{
				path: '/',
				element: <DashboardPage />,
				action: dashboardPageAction,
				loader: dashboardPageLoader
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
