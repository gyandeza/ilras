import { createContext, useContext, useState } from 'react';

const DistrictContext = createContext(null);

export function DistrictProvider({ children }) {
  const [activeDistrict, setActiveDistrict] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState('Dasbor');

  return (
    <DistrictContext.Provider value={{ activeDistrict, setActiveDistrict, breadcrumb, setBreadcrumb }}>
      {children}
    </DistrictContext.Provider>
  );
}

export function useDistrictContext() {
  const ctx = useContext(DistrictContext);
  if (!ctx) throw new Error('useDistrictContext must be used within DistrictProvider');
  return ctx;
}
