'use client';

import { useState, ChangeEvent} from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { getSoils } from '@/app/lib/api/getSoils';
import { getPile } from '@/app/lib/api/getPile';
import { getFactors } from '@/app/lib/api/getFactors';


interface FormData {
  jobNumber: string;
  location: string;
  pileNumber: string;
  additionalInfo: string;
}

export default function ExportPage() {
  const [formData, setFormData] = useState<FormData>({
    jobNumber: '',
    location: '',
    pileNumber: '',
    additionalInfo: '',
  });
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const captureOverviewPage = async (): Promise<{ dataUrl: string, width: number, height: number } | null> => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.width = '1000px';
      iframe.style.height = '1000px';
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      
      document.body.appendChild(iframe);
      
      return new Promise((resolve) => {
        iframe.onload = async () => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            
            if (!iframeDoc) {
              throw new Error('Could not access iframe document');
            }
            
            await new Promise(r => setTimeout(r, 1000));
            
            const soilProfileElement = iframeDoc.querySelector('main');
            
            if (!soilProfileElement) {
              throw new Error('Could not find soil profile element in overview page');
            }
            
            const canvas = await html2canvas(soilProfileElement, {
              scale: 1,
              useCORS: true,
              allowTaint: true,
              logging: false
            });
            
            const dataUrl = canvas.toDataURL('image/png');
            
            document.body.removeChild(iframe);
            
            resolve({
              dataUrl,
              width: canvas.width,
              height: canvas.height
            });
          } catch (error) {
            console.error('Error capturing overview page:', error);
            document.body.removeChild(iframe);
            resolve(null);
          }
        };
        
        iframe.src = '/overview';
      });
    } catch (error) {
      console.error('Error setting up iframe:', error);
      return null;
    }
  };

  const generatePDF = async () => {
    try {
      setIsCapturing(true);
      
      const soilsData = await getSoils();
      const pileData = await getPile();
      const factorsData = await getFactors();
      
      if (!pileData) {
        alert('No pile data found. Please configure pile data to generate the report.');
        setIsCapturing(false);
        return;
      }

      if (soilsData.length === 0) {
        alert('No soil entries found. Please add soil data to generate the report.');
        setIsCapturing(false);
        return;
      }

      if (!factorsData) {
        alert('Failed to fetch safety factors data. Please try again.');
        setIsCapturing(false);
        return;
      }

      const soilProfileResult = await captureOverviewPage();
      
      if (!soilProfileResult) {
        console.warn('Could not capture soil profile, proceeding without it');
      }
      
      const relevantSoils = soilsData.filter(soil => soil.startDepth < pileData.pileLength);
     
      const ultimatePulloutCapacity = relevantSoils.reduce(
        (sum, { shaftCapacity = 0 }) => sum + shaftCapacity, 0
      );
      
      const lastLayer = soilsData.find(soil => 
        soil.startDepth < pileData.pileLength && pileData.pileLength <= soil.endDepth
      );
      const bearingCapacity = lastLayer?.bearingCapacity ?? 0;

      const compressiveResistance1 = ultimatePulloutCapacity / factorsData.gammaS1 + 
        bearingCapacity / factorsData.gammaB1;
      const compressiveIsSafe1 = factorsData.combination1! <= compressiveResistance1;

      const compressiveResistance2 = ultimatePulloutCapacity / factorsData.gammaS2 + 
        bearingCapacity / factorsData.gammaB2;
      const compressiveIsSafe2 = factorsData.combination2! <= compressiveResistance2;

      const tensileResistance1 = ultimatePulloutCapacity / factorsData.gammaS1;
      const tensileIsSafe1 = factorsData.combination1! <= tensileResistance1;

      const tensileResistance2 = ultimatePulloutCapacity / factorsData.gammaS2;
      const tensileIsSafe2 = factorsData.combination2! <= tensileResistance2;

      const doc = new jsPDF();
      const currentFont = doc.getFont();
      const currentFontStyle = doc.getFont().fontStyle;

      const pageWidth = doc.internal.pageSize.width;

      const logoWidth = 50;
      const logoHeight = 15;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage('/logo.png', 'PNG', logoX, 10, logoWidth, logoHeight);

      doc.setFontSize(16);
      const title = 'Helical Piles Design Report';
      const titleWidth = doc.getTextWidth(title);
      const titleX = (pageWidth - titleWidth) / 2;
      doc.text(title, titleX, 32);

      doc.setFontSize(12);
      doc.text(`Job Number: ${formData.jobNumber}`, 14, 42);
      doc.text(`Location: ${formData.location}`, 14, 49);
      doc.text(`Pile Number: ${formData.pileNumber}`, 14, 56);
      doc.text(`Additional Notes: ${formData.additionalInfo}`, 14, 63);

      doc.line(14, 72, 196, 72); 
      
      let currentYPosition = 72;
      
      if (soilProfileResult) {
        // Calculate dynamic dimensions based on aspect ratio
        const aspectRatio = soilProfileResult.height / soilProfileResult.width;
        const imageWidth = 180; // mm (fixed width)
        const imageHeight = imageWidth * aspectRatio;

        currentYPosition += 10;
        doc.setFontSize(14);
        
        // Center the "Soil Profile" text above the image
        const soilProfileText = 'Soil Profile';
        const soilProfileTextWidth = doc.getTextWidth(soilProfileText);
        const soilProfileTextX = (pageWidth - soilProfileTextWidth) / 2;
        doc.text(soilProfileText, soilProfileTextX, currentYPosition);
        
        // Reduce the gap slightly between the title and image
        currentYPosition += 5;
        
        try {
          // Center the image horizontally
          const imageX = (pageWidth - imageWidth) / 2;
          doc.addImage(
            soilProfileResult.dataUrl, 
            'PNG', 
            imageX, 
            currentYPosition,
            imageWidth,
            imageHeight
          );
          currentYPosition += imageHeight + 5; // Reduced gap after the image
        } catch (error) {
          console.error('Error adding soil profile image to PDF:', error);
          currentYPosition += 5;
        }
      } else {
        currentYPosition += 5;
      }

      // Check if we need a new page (if we're too close to the bottom)
      if (currentYPosition > 250) {
        doc.addPage();
        currentYPosition = 20;
      }

      doc.setFontSize(14);
      doc.text('Compressive Capacity', 14, currentYPosition + 5); // Reduced gap before Compressive Capacity

      doc.setFontSize(12);

      doc.text('Test 1:', 14, currentYPosition + 15);
      doc.setFont('times', 'italic');
      doc.text(`${factorsData.combination1!.toFixed(2)}kN < ${compressiveResistance1.toFixed(2)}kN`, 30, currentYPosition + 15);
      doc.setFont(currentFont.fontName, currentFontStyle);
      doc.setTextColor(compressiveIsSafe1 ? 0 : 255, compressiveIsSafe1 ? 128 : 0, compressiveIsSafe1 ? 0 : 0);
      doc.text(compressiveIsSafe1 ? 'PASS' : 'FAIL', 68, currentYPosition + 15);

      doc.setTextColor(0, 0, 0);
      doc.text('Test 2:', 14, currentYPosition + 25);
      doc.setFont('times', 'italic');
      doc.text(`${factorsData.combination2!.toFixed(2)}kN < ${compressiveResistance2.toFixed(2)}kN`, 30, currentYPosition + 25);
      doc.setFont(currentFont.fontName, currentFontStyle);
      doc.setTextColor(compressiveIsSafe2 ? 0 : 255, compressiveIsSafe2 ? 128 : 0, compressiveIsSafe2 ? 0 : 0);
      doc.text(compressiveIsSafe2 ? 'PASS' : 'FAIL', 68, currentYPosition + 25);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text('Tensile Capacity', 14, currentYPosition + 40);

      doc.setFontSize(12);

      doc.text('Test 1:', 14, currentYPosition + 50);
      doc.setFont('times', 'italic');
      doc.text(`${factorsData.combination1!.toFixed(2)}kN < ${tensileResistance1.toFixed(2)}kN`, 30, currentYPosition + 50);
      doc.setFont(currentFont.fontName, currentFontStyle);
      doc.setTextColor(tensileIsSafe1 ? 0 : 255, tensileIsSafe1 ? 128 : 0, tensileIsSafe1 ? 0 : 0);
      doc.text(tensileIsSafe1 ? 'PASS' : 'FAIL', 68, currentYPosition + 50);

      doc.setTextColor(0, 0, 0);
      doc.text('Test 2:', 14, currentYPosition + 60);
      doc.setFont('times', 'italic');
      doc.text(`${factorsData.combination2!.toFixed(2)}kN < ${tensileResistance2.toFixed(2)}kN`, 30, currentYPosition + 60);
      doc.setFont(currentFont.fontName, currentFontStyle);
      doc.setTextColor(tensileIsSafe2 ? 0 : 255, tensileIsSafe2 ? 128 : 0, tensileIsSafe2 ? 0 : 0);
      doc.text(tensileIsSafe2 ? 'PASS' : 'FAIL', 68, currentYPosition + 60);
      
      doc.save(`helical-piles-design-report.pdf`);
      setIsCapturing(false);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      setIsCapturing(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Export to PDF</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Enter Report Information</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="jobNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Job Number:
            </label>
            <input
              type="text"
              id="jobNumber"
              name="jobNumber"
              value={formData.jobNumber}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location:
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="pileNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Pile Number:
            </label>
            <input
              type="text"
              id="pileNumber"
              name="pileNumber"
              value={formData.pileNumber}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Information:
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={generatePDF}
        disabled={isCapturing}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isCapturing ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isCapturing ? 'Generating PDF...' : 'Generate PDF Report'}
      </button>
    </div>
  );
}