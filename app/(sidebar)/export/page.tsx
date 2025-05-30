// ServerExportPage.tsx (server component)
import { getSoils } from '@/lib/getSoils';

import { getFactors } from '@/lib/getFactors';
import Export from './export';

export default async function ServerExportPage() {
  const soilsData = await getSoils();

  const factorsData = await getFactors();
  
  return (
    <Export
      initialSoilsData={soilsData} 

      initialFactorsData={factorsData} 
    />
  );
}