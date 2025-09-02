import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CategoryPanel from "../components/calculator/CategoryPanel";
import CalculationWorkspace from "../components/calculator/CalculationWorkspace";

const calculationCategories = [
  { name: "Stoichiometry", id: "stoich" },
  { name: "Solutions", id: "solutions" },
  { name: "Atomic Structure", id: "atomic" },
  { name: "Conversions", id: "conversions" },
  { name: "General", id: "general" }
];

const calculationFunctions = [
  // Stoichiometry
  { category: "stoich", name: "Mole Calculation", id: "mole", desc: "Calculate moles from mass and molar mass" },
  { category: "stoich", name: "Mass Calculation", id: "mass", desc: "Calculate mass from moles and molar mass" },
  { category: "stoich", name: "Percent Yield", id: "yield", desc: "Calculate percent yield" },
  
  // Solutions
  { category: "solutions", name: "Molarity", id: "molarity", desc: "Calculate solution molarity" },
  { category: "solutions", name: "Dilution", id: "dilution", desc: "Dilution calculations (M₁V₁=M₂V₂)" },
  { category: "solutions", name: "pH Calculation", id: "ph", desc: "Calculate pH from H⁺ concentration" },
  
  // Atomic Structure
  { category: "atomic", name: "Molar Mass", id: "molar-mass", desc: "Calculate molar mass of a compound" },
  { category: "atomic", name: "Percent Composition", id: "percent-comp", desc: "Calculate percent composition" },
  
  // Conversions
  { category: "conversions", name: "Temperature", id: "temp", desc: "Convert between °C, K, and °F" },
  
  // General
  { category: "general", name: "Gas Laws", id: "gas-laws", desc: "PV=nRT calculations" },
];

export default function CalculatorPage() {
  const [selectedCategory, setSelectedCategory] = useState("stoich");
  const [calculationBlocks, setCalculationBlocks] = useState([
    { id: Date.now(), functionId: 'mole' }
  ]);

  const addCalculation = (functionId) => {
    setCalculationBlocks(prev => [...prev, { id: Date.now(), functionId }]);
  };

  const removeCalculation = (blockId) => {
    setCalculationBlocks(prev => prev.filter(block => block.id !== blockId));
  };
  
  const clearAllCalculations = () => {
    setCalculationBlocks([]);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-88px)]">
      <CategoryPanel
        categories={calculationCategories}
        functions={calculationFunctions}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onAddCalculation={addCalculation}
      />
      <CalculationWorkspace
        calculationBlocks={calculationBlocks}
        functions={calculationFunctions}
        onRemoveCalculation={removeCalculation}
        onClearAll={clearAllCalculations}
      />
    </div>
  );
}
