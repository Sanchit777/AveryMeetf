import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import PrivateRoute from 'components/PrivateRoute'; 
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));

// render - sample page

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
      path: 'color',
      element: <Color />
    },
    {
      path: 'dashboard',
        element: <DashboardDefault />
    },
  
   
    {
      path: 'upload',
      element: <Typography />
    }
  ]
};

export default MainRoutes;
