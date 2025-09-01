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
  { category: "stoich", name: "Mole Calculation", id: "mole", desc: "Calculate moles from mass and molar mass" },
  { category: "stoich", name: "Mass Calculation", id: "mass", desc: "Calculate mass from moles and molar mass" },
  { category: "stoich", name: "Mole Ratio", id: "mole-ratio", desc: "Find the mole ratio from a chemical equation" },
  { category: "stoich", name: "Limiting Reactant", id: "limiting", desc: "Determine the limiting reactant and theoretical yield" },
  { category: "stoich", name: "Percent Yield", id: "yield", desc: "Calculate percent yield from experimental and theoretical" },
  { category: "stoich", name: "Empirical Formula", id: "empirical", desc: "Calculate empirical formula from percent composition" },
  
  // Solutions
  { category: "solutions", name: "Molarity", id: "molarity", desc: "Calculate solution molarity" },
  { category: "solutions", name: "Dilution", id: "dilution", desc: "Dilution calculations" },
  { category: "solutions", name: "pH Calculation", id: "ph", desc: "Calculate pH from H⁺ concentration" },
  
  // Atomic Structure
  { category: "atomic", name: "Molar Mass", id: "molar-mass", desc: "Calculate molar mass of a compound" },
  { category: "atomic", name: "Percent Composition", id: "percent-comp", desc: "Calculate percent composition from formula" },
  { category: "atomic", name: "Ion Charge", id: "ion", desc: "Lookup common ion charge" },
  
  // Conversions
  { category: "conversions", name: "Mass ⇄ Volume", id: "mass-vol", desc: "Convert mass to volume (water) and vice versa" },
  { category: "conversions", name: "Moles ⇄ Particles", id: "mol-particles", desc: "Convert moles to particles and vice versa" },
  { category: "conversions", name: "Temperature", id: "temp", desc: "Convert between °C and K" },
  
  // General
  { category: "general", name: "Gas Laws", id: "gas-laws", desc: "PV=nRT calculations" },
  { category: "general", name: "Concentration", id: "concentration", desc: "Various concentration calculations" }
];

export default function CalculatorPage() {
  const [selectedCategory, setSelectedCategory] = useState("stoich");
  const [selectedFunctions, setSelectedFunctions] = useState(["mole"]);

  const toggleFunction = (functionId) => {
    setSelectedFunctions(prev => {
      if (prev.includes(functionId)) {
        return prev.length > 1 ? prev.filter(id => id !== functionId) : prev;
      } else {
        return prev.length < 4 ? [...prev, functionId] : prev;
      }
    });
  };

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    // Don't automatically clear selected functions - allow cross-category
  };

  return (
    <div className="flex min-h-[calc(100vh-88px)]">
      <CategoryPanel
        categories={calculationCategories}
        functions={calculationFunctions}
        selectedCategory={selectedCategory}
        selectedFunctions={selectedFunctions}
        onSelectCategory={selectCategory}
        onToggleFunction={toggleFunction}
      />
      <CalculationWorkspace
        selectedFunctions={selectedFunctions}
        functions={calculationFunctions}
      />
    </div>
  );
}
