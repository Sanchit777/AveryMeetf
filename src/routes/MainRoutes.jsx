import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import PrivateRoute from 'components/PrivateRoute'; 

// Lazy load pages
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));
const Home = Loadable(lazy(() => import('pages/home'))); // Lazy loading Home component

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      element: <DashboardDefault />
    },
    {
      path: 'home', // Added Home route
      element: <Home />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'upload',
      element: <Typography />
    }
  ]
};

export default MainRoutes;
