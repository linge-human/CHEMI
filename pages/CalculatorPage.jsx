import React, { useState } from "react";
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
  { category: "stoich", name: "Mole Calculation", id: "mole" },
  { category: "stoich", name: "Mass Calculation", id: "mass" },
  { category: "stoich", name: "Percent Yield", id: "yield" },
  
  // Solutions
  { category: "solutions", name: "Molarity", id: "molarity" },
  { category: "solutions", name: "Dilution", id: "dilution" },
  { category: "solutions", name: "pH Calculation", id: "ph" },
  
  // Atomic Structure
  { category: "atomic", name: "Molar Mass", id: "molar-mass" },
  { category: "atomic", name: "Percent Composition", id: "percent-comp" },
  { category: "atomic", name: "Ion Charge", id: "ion" },
  { category: "atomic", name: "Solubility Check", id: "solubility-check" },
  
  // Conversions
  { category: "conversions", name: "Temperature", id: "temp" },
  
  // General
  { category: "general", name: "Gas Laws", id: "gas-laws" },
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
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-88px)] bg-background">
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
