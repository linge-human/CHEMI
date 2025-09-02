import React, { useState } from "react";
import { Type } from "lucide-react";

export default function TextSizeSettings() {
  const [textSize, setTextSize] = useState(16); // Default 16px (medium)

  const sizeLabels = {
    14: "Small",
    16: "Medium", 
    18: "Large",
    20: "Extra Large"
  };

  const handleSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setTextSize(size);
    
    // Apply the text size to the document root
    document.documentElement.style.fontSize = `${size}px`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Text Size</h2>
      
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Type className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Adjust text size for better readability</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-12">Small</span>
              <input
                type="range"
                min="14"
                max="20"
                step="2"
                value={textSize}
                onChange={handleSizeChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #374151 0%, #374151 ${((textSize - 14) / 6) * 100}%, #e5e7eb ${((textSize - 14) / 6) * 100}%, #e5e7eb 100%)`
                }}
              />
              <span className="text-sm text-gray-600 w-16">Extra Large</span>
            </div>
            
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                {sizeLabels[textSize]} ({textSize}px)
              </span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded border">
            <p style={{ fontSize: `${textSize}px` }} className="text-gray-800 leading-relaxed">
              Sample calculation: The molar mass of H₂SO₄ is 98.08 g/mol
            </p>
            <p style={{ fontSize: `${Math.max(textSize - 2, 12)}px` }} className="text-gray-600 mt-2">
              Working: H: 1.008 × 2 = 2.016 g/mol, S: 32.065 g/mol, O: 15.999 × 4 = 63.996 g/mol
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 text-sm">
          <strong>Accessibility:</strong> Larger text sizes improve readability and reduce eye strain during long study sessions. Changes apply immediately across the entire application.
        </p>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #374151;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #374151;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
