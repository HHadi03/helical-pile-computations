// ServerExportPage.tsx (server component)
import { getSoils } from '@/lib/getSoils';
import { getPile } from '@/lib/getPile';
import { getFactors } from '@/lib/getFactors';
import Export from './export';

export default async function ServerExportPage() {
  const soilsData = await getSoils();
  const pileData = await getPile();
  const factorsData = await getFactors();
  
  return (
    <Export
      initialSoilsData={soilsData} 
      initialPileData={pileData} 
      initialFactorsData={factorsData} 
    />
  );
}