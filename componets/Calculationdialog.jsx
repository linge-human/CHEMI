import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Atom, 
  FlaskConical, 
  Zap, 
  Droplets, 
  Scale, 
  PieChart,
  Thermometer,
  CircuitBoard
} from "lucide-react";

const calculationTypes = [
  {
    type: "molar_mass",
    title: "Molar Mass",
    description: "Calculate molecular weight from chemical formula",
    icon: Atom,
    color: "from-blue-500 to-blue-600"
  },
  {
    type: "molarity",
    title: "Molarity & Concentration",
    description: "Calculate molarity, dilutions, and concentrations",
    icon: FlaskConical,
    color: "from-emerald-500 to-emerald-600"
  },
  {
    type: "gas_law",
    title: "Gas Laws",
    description: "PV=nRT, combined gas law calculations",
    icon: Zap,
    color: "from-purple-500 to-purple-600"
  },
  {
    type: "ph_calculation",
    title: "pH & pOH",
    description: "Acid-base calculations and pH scale",
    icon: Droplets,
    color: "from-red-500 to-red-600"
  },
  {
    type: "stoichiometry",
    title: "Stoichiometry",
    description: "Mole-to-mole and mass-to-mass conversions",
    icon: Scale,
    color: "from-orange-500 to-orange-600"
  },
  {
    type: "percent_composition",
    title: "Percent Composition",
    description: "Calculate mass percentages in compounds",
    icon: PieChart,
    color: "from-cyan-500 to-cyan-600"
  }
];

export default function AddCalculationDialog({ open, onOpenChange, onAdd }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Choose Calculation Type
          </DialogTitle>
          <p className="text-slate-600 text-center">
            Select the type of chemistry calculation you want to perform
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {calculationTypes.map((calc) => {
            const IconComponent = calc.icon;
            return (
              <Button
                key={calc.type}
                variant="outline"
                className="h-auto p-6 flex flex-col items-start gap-4 hover:shadow-lg transition-all duration-300 group border-2 hover:border-blue-200"
                onClick={() => onAdd(calc.type)}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${calc.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-slate-800">{calc.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{calc.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
