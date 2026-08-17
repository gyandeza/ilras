import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DistrictProvider } from './layout/DistrictContext.jsx';
import AppLayout from './layout/AppLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DistrictDetailPage from './pages/DistrictDetailPage.jsx';
import SimulationPage from './pages/SimulationPage.jsx';
import GISExplorerPage from './pages/GISExplorerPage.jsx';
import ComparisonPage from './pages/ComparisonPage.jsx';
import MethodologyPage from './pages/MethodologyPage.jsx';

export default function App() {
  return (
    <DistrictProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/peta" element={<GISExplorerPage />} />
            <Route path="/perbandingan" element={<ComparisonPage />} />
            <Route path="/metodologi" element={<MethodologyPage />} />
            <Route path="/district/:id" element={<DistrictDetailPage />} />
            <Route path="/simulate/:id" element={<SimulationPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DistrictProvider>
  );
}
