import React from "react";

export default function ElementDetails({ element, isSelected }) {
  if (!element) {
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 h-96 sticky top-28">
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">🔬</div>
            <p>Hover over or click an element to see details</p>
          </div>
        </div>
      </div>
    );
  }

  const getElementColor = (category) => {
    const colors = {
      "alkali metal": "bg-red-100 border-red-300 text-red-800",
      "alkaline earth metal": "bg-orange-100 border-orange-300 text-orange-800",
      "transition metal": "bg-yellow-100 border-yellow-300 text-yellow-800",
      "post-transition metal": "bg-green-100 border-green-300 text-green-800",
      "metalloid": "bg-blue-100 border-blue-300 text-blue-800",
      "nonmetal": "bg-purple-100 border-purple-300 text-purple-800",
      "halogen": "bg-pink-100 border-pink-300 text-pink-800",
      "noble gas": "bg-indigo-100 border-indigo-300 text-indigo-800",
      "lanthanide": "bg-teal-100 border-teal-300 text-teal-800",
      "actinide": "bg-cyan-100 border-cyan-300 text-cyan-800",
      'unknown': 'bg-gray-200 border-gray-400 text-gray-800'
    };
    return colors[category] || "bg-gray-100 border-gray-300 text-gray-800";
  };

  return (
    <div className={`border-2 rounded-lg p-6 transition-all duration-300 ${isSelected ? 'bg-white border-gray-900 shadow-2xl' : 'bg-gray-50 border-gray-200'}`}>
      {/* Element Header */}
      <div className="flex items-center gap-6 mb-6">
        <div className={`flex-shrink-0 inline-flex items-center justify-center w-24 h-24 rounded-lg border-2 text-4xl font-bold ${getElementColor(element.category)}`}>
          {element.symbol}
        </div>
        <div className="flex-grow">
            <p className="text-gray-500 font-semibold">{element.number}</p>
            <h2 className="text-4xl font-bold text-gray-900">{element.name}</h2>
            <p className="text-gray-600 capitalize text-lg">{element.category.replace(/-/g, ' ')}</p>
        </div>
      </div>

      {/* Properties */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-sm">
        <div className="p-4 bg-gray-50 rounded-lg">
            <span className="font-semibold text-gray-700 block mb-1">Atomic Mass</span>
            <div className="text-gray-900 text-lg font-mono">{element.atomicMass}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg col-span-2 md:col-span-1 lg:col-span-2">
            <span className="font-semibold text-gray-700 block mb-1">Electron Configuration</span>
            <div className="text-gray-900 font-mono text-base break-words">{element.electronConfig}</div>
        </div>
         <div className="p-4 bg-gray-50 rounded-lg">
            <span className="font-semibold text-gray-700 block mb-1">State at 20°C</span>
            <div className="text-gray-900 text-lg">{element.state || 'Unknown'}</div>
          </div>
         <div className="p-4 bg-gray-50 rounded-lg">
            <span className="font-semibold text-gray-700 block mb-1">Melting Point</span>
            <div className="text-gray-900 text-lg">{element.meltingPoint ? `${element.meltingPoint}°C` : 'N/A'}</div>
          </div>
        <div className="p-4 bg-gray-50 rounded-lg">
            <span className="font-semibold text-gray-700 block mb-1">Boiling Point</span>
            <div className="text-gray-900 text-lg">{element.boilingPoint ? `${element.boilingPoint}°C` : 'N/A'}</div>
          </div>
        <div className="p-4 bg-gray-50 rounded-lg">
            <span className="font-semibold text-gray-700 block mb-1">Density</span>
            <div className="text-gray-900 text-lg">{element.density ? `${element.density} g/cm³` : 'N/A'}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
            <span className="font-semibold text-gray-700 block mb-1">Discovered</span>
            <div className="text-gray-900 text-lg">{element.discovery}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg col-span-2 md:col-span-3 lg:col-span-full">
            <span className="font-semibold text-gray-700 block mb-1">Common Uses</span>
            <div className="text-gray-900">{element.uses}</div>
        </div>
      </div>
    </div>
  );
}
