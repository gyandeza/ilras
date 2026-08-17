import { Outlet } from 'react-router-dom';
import Sidebar from '../components/organisms/Sidebar.jsx';
import TopBar from '../components/organisms/TopBar.jsx';
import { useDistrictContext } from './DistrictContext.jsx';
import { getBandColor } from '../lib/ilri.js';

export default function AppLayout() {
  const { activeDistrict, breadcrumb } = useDistrictContext();

  return (
    <div className="app-shell">
      <Sidebar
        simulationEnabled={!!activeDistrict}
        simulationHref={activeDistrict ? `/simulate/${activeDistrict.id}` : '#'}
      />
      <div className="app-shell__main">
        <TopBar
          breadcrumb={breadcrumb}
          activeDistrict={activeDistrict?.name}
          score={activeDistrict?.score}
          bandColor={activeDistrict ? getBandColor(activeDistrict.band) : null}
        />
        <div className="app-shell__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
