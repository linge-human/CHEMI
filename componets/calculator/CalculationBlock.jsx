import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Edit3, Calculator } from "lucide-react";
import { motion } from "framer-motion";

import MolarMassCalculator from "./calculations/MolarMassCalculator";
import MolarityCalculator from "./calculations/MolarityCalculator";
import GasLawCalculator from "./calculations/GasLawCalculator";
import PhCalculator from "./calculations/PhCalculator";
import StoichiometryCalculator from "./calculations/StoichiometryCalculator";
import PercentCompositionCalculator from "./calculations/PercentCompositionCalculator";

const calculationComponents = {
  molar_mass: MolarMassCalculator,
  molarity: MolarityCalculator,
  gas_law: GasLawCalculator,
  ph_calculation: PhCalculator,
  stoichiometry: StoichiometryCalculator,
  percent_composition: PercentCompositionCalculator,
};

export default function CalculationBlock({ calculation, onUpdate, onRemove }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(calculation.title);

  const CalculationComponent = calculationComponents[calculation.type];

  const handleTitleUpdate = () => {
    onUpdate({ title: tempTitle });
    setIsEditingTitle(false);
  };

  if (!CalculationComponent) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Calculation type not found: {calculation.type}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div layout>
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleUpdate()}
                    className="text-lg font-semibold border-blue-200 focus:border-blue-400"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleTitleUpdate}>Save</Button>
                </div>
              ) : (
                <CardTitle 
                  className="text-lg font-semibold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {calculation.title}
                  <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <CalculationComponent
            inputs={calculation.inputs}
            result={calculation.result}
            onUpdate={(updates) => onUpdate(updates)}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
