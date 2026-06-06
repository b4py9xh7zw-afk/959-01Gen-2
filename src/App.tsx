import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Forbidden from '@/pages/Forbidden';
import Layout from '@/components/Layout';
import PrivateRoute from '@/components/PrivateRoute';
import { ToastContainer } from '@/components/Toast';

import Dashboard from '@/pages/Dashboard';
import FontMarket from '@/pages/FontMarket';
import FontDetail from '@/pages/FontDetail';
import LicenseList from '@/pages/LicenseList';
import LicenseDetail from '@/pages/LicenseDetail';
import ProjectList from '@/pages/ProjectList';
import ProjectDetail from '@/pages/ProjectDetail';
import NewProject from '@/pages/NewProject';
import DownloadCenter from '@/pages/DownloadCenter';
import FontPreview from '@/pages/FontPreview';
import CertificateList from '@/pages/CertificateList';
import CertificateDetail from '@/pages/CertificateDetail';

export default function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forbidden" element={<Forbidden />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route element={<PrivateRoute allowedRoles={['brand']} />}>
              <Route path="/fonts" element={<FontMarket />} />
              <Route path="/fonts/:id" element={<FontDetail />} />
              <Route path="/licenses" element={<LicenseList />} />
              <Route path="/licenses/:id" element={<LicenseDetail />} />
              <Route path="/projects/new" element={<NewProject />} />
            </Route>

            <Route element={<PrivateRoute allowedRoles={['designer']} />}>
              <Route path="/downloads" element={<DownloadCenter />} />
              <Route path="/downloads/:id" element={<FontPreview />} />
            </Route>

            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/certificates" element={<CertificateList />} />
            <Route path="/certificates/:id" element={<CertificateDetail />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
