import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'virtual:svg-icons-register';
import './index.css';
import Dashboard, {
	action as dashboardAction,
	loader as dashboardLoader
} from './routes/dashboard';
import Root from './routes/root';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Root />,
		children: [
			{
				path: '/',
				element: <Dashboard />,
				action: dashboardAction,
				loader: dashboardLoader
			}
		]
	}
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
