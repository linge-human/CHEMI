import React, { useState } from "react";
import ElementDetails from "../components/periodic-table/ElementDetails";

// Essential element data based on Royal Society of Chemistry standards
const elements = [
  {
    number: 1, symbol: "H", name: "Hydrogen", 
    atomicMass: 1.008, 
    category: "nonmetal",
    electronConfig: "1s¹",
    state: "gas",
    meltingPoint: -259.1,
    boilingPoint: -252.9,
    density: 0.00008988,
    discovery: 1766,
    uses: "Fuel cells, ammonia production, hydrogenation"
  },
  {
    number: 2, symbol: "He", name: "Helium", 
    atomicMass: 4.003, 
    category: "noble gas",
    electronConfig: "1s²",
    state: "gas",
    meltingPoint: -272.2,
    boilingPoint: -268.9,
    density: 0.0001785,
    discovery: 1868,
    uses: "Balloons, cryogenics, breathing gas"
  },
  {
    number: 3, symbol: "Li", name: "Lithium", 
    atomicMass: 6.941, 
    category: "alkali metal",
    electronConfig: "[He] 2s¹",
    state: "solid",
    meltingPoint: 180.5,
    boilingPoint: 1342,
    density: 0.534,
    discovery: 1817,
    uses: "Batteries, ceramics, psychiatric medication"
  },
  {
    number: 4, symbol: "Be", name: "Beryllium", 
    atomicMass: 9.012, 
    category: "alkaline earth metal",
    electronConfig: "[He] 2s²",
    state: "solid",
    meltingPoint: 1287,
    boilingPoint: 2470,
    density: 1.85,
    discovery: 1797,
    uses: "Aerospace alloys, X-ray windows"
  },
  {
    number: 5, symbol: "B", name: "Boron", 
    atomicMass: 10.811, 
    category: "metalloid",
    electronConfig: "[He] 2s² 2p¹",
    state: "solid",
    meltingPoint: 2077,
    boilingPoint: 4000,
    density: 2.34,
    discovery: 1808,
    uses: "Glass, ceramics, semiconductors"
  },
  {
    number: 6, symbol: "C", name: "Carbon", 
    atomicMass: 12.011, 
    category: "nonmetal",
    electronConfig: "[He] 2s² 2p²",
    state: "solid",
    meltingPoint: 3825,
    boilingPoint: 4827,
    density: 2.267,
    discovery: "Ancient",
    uses: "Steel production, diamonds, organic compounds"
  },
  {
    number: 7, symbol: "N", name: "Nitrogen", 
    atomicMass: 14.007, 
    category: "nonmetal",
    electronConfig: "[He] 2s² 2p³",
    state: "gas",
    meltingPoint: -210.0,
    boilingPoint: -195.8,
    density: 0.0012506,
    discovery: 1772,
    uses: "Fertilizers, explosives, inert atmosphere"
  },
  {
    number: 8, symbol: "O", name: "Oxygen", 
    atomicMass: 15.999, 
    category: "nonmetal",
    electronConfig: "[He] 2s² 2p⁴",
    state: "gas",
    meltingPoint: -218.3,
    boilingPoint: -182.9,
    density: 0.001429,
    discovery: 1774,
    uses: "Respiration, combustion, steel production"
  },
  {
    number: 9, symbol: "F", name: "Fluorine", 
    atomicMass: 18.998, 
    category: "halogen",
    electronConfig: "[He] 2s² 2p⁵",
    state: "gas",
    meltingPoint: -219.6,
    boilingPoint: -188.1,
    density: 0.001696,
    discovery: 1886,
    uses: "Toothpaste, refrigerants, uranium enrichment"
  },
  {
    number: 10, symbol: "Ne", name: "Neon", 
    atomicMass: 20.180, 
    category: "noble gas",
    electronConfig: "[He] 2s² 2p⁶",
    state: "gas",
    meltingPoint: -248.6,
    boilingPoint: -246.1,
    density: 0.0008999,
    discovery: 1898,
    uses: "Neon lights, lasers, cryogenics"
  },
  {
    number: 11, symbol: "Na", name: "Sodium", 
    atomicMass: 22.990, 
    category: "alkali metal",
    electronConfig: "[Ne] 3s¹",
    state: "solid",
    meltingPoint: 97.7,
    boilingPoint: 883,
    density: 0.968,
    discovery: 1807,
    uses: "Table salt, soap production, street lighting"
  },
  {
    number: 12, symbol: "Mg", name: "Magnesium", 
    atomicMass: 24.305, 
    category: "alkaline earth metal",
    electronConfig: "[Ne] 3s²",
    state: "solid",
    meltingPoint: 650,
    boilingPoint: 1090,
    density: 1.738,
    discovery: 1808,
    uses: "Alloys, fireworks, automotive parts"
  },
  {
    number: 13, symbol: "Al", name: "Aluminum", 
    atomicMass: 26.982, 
    category: "post-transition metal",
    electronConfig: "[Ne] 3s² 3p¹",
    state: "solid",
    meltingPoint: 660.3,
    boilingPoint: 2519,
    density: 2.70,
    discovery: 1825,
    uses: "Packaging, construction, transportation"
  },
  {
    number: 14, symbol: "Si", name: "Silicon", 
    atomicMass: 28.086, 
    category: "metalloid",
    electronConfig: "[Ne] 3s² 3p²",
    state: "solid",
    meltingPoint: 1414,
    boilingPoint: 3265,
    density: 2.3296,
    discovery: 1824,
    uses: "Computer chips, solar cells, glass"
  },
  {
    number: 15, symbol: "P", name: "Phosphorus", 
    atomicMass: 30.974, 
    category: "nonmetal",
    electronConfig: "[Ne] 3s² 3p³",
    state: "solid",
    meltingPoint: 44.2,
    boilingPoint: 280.5,
    density: 1.823,
    discovery: 1669,
    uses: "Fertilizers, matches, DNA/RNA"
  },
  {
    number: 16, symbol: "S", name: "Sulfur", 
    atomicMass: 32.065, 
    category: "nonmetal",
    electronConfig: "[Ne] 3s² 3p⁴",
    state: "solid",
    meltingPoint: 115.2,
    boilingPoint: 444.6,
    density: 1.96,
    discovery: "Ancient",
    uses: "Sulfuric acid, vulcanizing rubber, gunpowder"
  },
  {
    number: 17, symbol: "Cl", name: "Chlorine", 
    atomicMass: 35.453, 
    category: "halogen",
    electronConfig: "[Ne] 3s² 3p⁵",
    state: "gas",
    meltingPoint: -101.5,
    boilingPoint: -34.0,
    density: 0.003214,
    discovery: 1774,
    uses: "Water purification, bleach, PVC"
  },
  {
    number: 18, symbol: "Ar", name: "Argon", 
    atomicMass: 39.948, 
    category: "noble gas",
    electronConfig: "[Ne] 3s² 3p⁶",
    state: "gas",
    meltingPoint: -189.3,
    boilingPoint: -185.9,
    density: 0.0017837,
    discovery: 1894,
    uses: "Welding, light bulbs, wine preservation"
  },
  {
    number: 19, symbol: "K", name: "Potassium", 
    atomicMass: 39.098, 
    category: "alkali metal",
    electronConfig: "[Ar] 4s¹",
    state: "solid",
    meltingPoint: 63.4,
    boilingPoint: 759,
    density: 0.89,
    discovery: 1807,
    uses: "Fertilizers, gunpowder, glass production"
  },
  {
    number: 20, symbol: "Ca", name: "Calcium", 
    atomicMass: 40.078, 
    category: "alkaline earth metal",
    electronConfig: "[Ar] 4s²",
    state: "solid",
    meltingPoint: 842,
    boilingPoint: 1484,
    density: 1.55,
    discovery: 1808,
    uses: "Bones and teeth, cement, cheese production"
  }
];

export default function PeriodicTablePage() {
  const [selectedElement, setSelectedElement] = useState(null);
  const [hoveredElement, setHoveredElement] = useState(null);

  const getElementColor = (category) => {
    const colors = {
      "alkali metal": "bg-red-200 hover:bg-red-300 border-red-300",
      "alkaline earth metal": "bg-orange-200 hover:bg-orange-300 border-orange-300",
      "transition metal": "bg-yellow-200 hover:bg-yellow-300 border-yellow-300",
      "post-transition metal": "bg-green-200 hover:bg-green-300 border-green-300",
      "metalloid": "bg-blue-200 hover:bg-blue-300 border-blue-300",
      "nonmetal": "bg-purple-200 hover:bg-purple-300 border-purple-300",
      "halogen": "bg-pink-200 hover:bg-pink-300 border-pink-300",
      "noble gas": "bg-indigo-200 hover:bg-indigo-300 border-indigo-300",
      "lanthanide": "bg-teal-200 hover:bg-teal-300 border-teal-300",
      "actinide": "bg-cyan-200 hover:bg-cyan-300 border-cyan-300"
    };
    return colors[category] || "bg-gray-200 hover:bg-gray-300 border-gray-300";
  };

  const renderElement = (element) => {
    if (!element) {
      return <div className="w-16 h-16" key={`empty-${Math.random()}`}></div>;
    }

    return (
      <div
        key={element.number}
        className={`w-16 h-16 border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-xs font-medium ${getElementColor(element.category)} ${
          selectedElement?.number === element.number ? "ring-2 ring-gray-900 ring-offset-1" : ""
        }`}
        onClick={() => setSelectedElement(element)}
        onMouseEnter={() => setHoveredElement(element)}
        onMouseLeave={() => setHoveredElement(null)}
      >
        <div className="text-xs font-bold">{element.number}</div>
        <div className="text-lg font-bold">{element.symbol}</div>
        <div className="text-xs truncate w-full text-center">{element.name}</div>
      </div>
    );
  };

  // Create the periodic table grid
  const createPeriodicTable = () => {
    const table = [];
    
    // Period 1
    table.push([
      elements.find(e => e.symbol === "H"),
      null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
      elements.find(e => e.symbol === "He")
    ]);

    // Period 2
    table.push([
      elements.find(e => e.symbol === "Li"),
      elements.find(e => e.symbol === "Be"),
      null, null, null, null, null, null, null, null, null, null,
      elements.find(e => e.symbol === "B"),
      elements.find(e => e.symbol === "C"),
      elements.find(e => e.symbol === "N"),
      elements.find(e => e.symbol === "O"),
      elements.find(e => e.symbol === "F"),
      elements.find(e => e.symbol === "Ne")
    ]);

    // Period 3
    table.push([
      elements.find(e => e.symbol === "Na"),
      elements.find(e => e.symbol === "Mg"),
      null, null, null, null, null, null, null, null, null, null,
      elements.find(e => e.symbol === "Al"),
      elements.find(e => e.symbol === "Si"),
      elements.find(e => e.symbol === "P"),
      elements.find(e => e.symbol === "S"),
      elements.find(e => e.symbol === "Cl"),
      elements.find(e => e.symbol === "Ar")
    ]);

    // Period 4 - partial
    table.push([
      elements.find(e => e.symbol === "K"),
      elements.find(e => e.symbol === "Ca"),
      null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
    ]);

    return table;
  };

  const periodicTable = createPeriodicTable();

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Periodic Table of Elements</h1>
          <p className="text-gray-600">Click on any element to explore its properties</p>
        </div>

        <div className="flex gap-8">
          {/* Periodic Table */}
          <div className="flex-1">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {periodicTable.map((period, periodIndex) => (
                  <div key={periodIndex} className="flex gap-1 mb-1">
                    {period.map((element, elementIndex) => renderElement(element))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {[
                { category: "alkali metal", name: "Alkali Metals" },
                { category: "alkaline earth metal", name: "Alkaline Earth" },
                { category: "transition metal", name: "Transition Metals" },
                { category: "post-transition metal", name: "Post-transition" },
                { category: "metalloid", name: "Metalloids" },
                { category: "nonmetal", name: "Nonmetals" },
                { category: "halogen", name: "Halogens" },
                { category: "noble gas", name: "Noble Gases" },
                { category: "lanthanide", name: "Lanthanides" },
                { category: "actinide", name: "Actinides" }
              ].map(({ category, name }) => (
                <div key={category} className="flex items-center gap-2">
                  <div className={`w-4 h-4 border-2 ${getElementColor(category)}`}></div>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Element Details */}
          <div className="w-80">
            <ElementDetails 
              element={selectedElement || hoveredElement} 
              isSelected={!!selectedElement}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
