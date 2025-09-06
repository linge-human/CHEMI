import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";

// Atomic masses for common elements
const atomicMasses = {
  H: 1.008, He: 4.003, Li: 6.941, Be: 9.012, B: 10.811, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.086, P: 30.974, S: 32.065,
  Cl: 35.453, Ar: 39.948, K: 39.098, Ca: 40.078, Ti: 47.867, Cr: 51.996, Mn: 54.938, Fe: 55.845,
  Ni: 58.693, Cu: 63.546, Zn: 65.38, Br: 79.904, Sr: 87.62, Ag: 107.868, I: 126.904, Ba: 137.327,
  Au: 196.967, Hg: 200.59, Pb: 207.2
};

export default function PercentCompositionCalculator({ inputs, result, onUpdate }) {
  const [formula, setFormula] = useState(inputs.formula || "");
  const [isCalculating, setIsCalculating] = useState(false);

  const parseFormula = (formula) => {
    const elements = {};
    const regex = /([A-Z][a-z]?)(\d*)/g;
    let match;
    
    while ((match = regex.exec(formula)) !== null) {
      const element = match[1];
      const count = parseInt(match[2]) || 1;
      elements[element] = (elements[element] || 0) + count;
    }
    
    return elements;
  };

  const calculate = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      try {
        const elements = parseFormula(formula.replace(/\s/g, ''));
        const steps = [];
        const breakdown = [];
        let totalMass = 0;
        
        steps.push(`Analyzing formula: ${formula}`);
        steps.push(`Step 1: Calculate mass contribution of each element`);
        steps.push(``);
        
        // Calculate total mass and element contributions
        for (const [element, count] of Object.entries(elements)) {
          if (!atomicMasses[element]) {
            throw new Error(`Unknown element: ${element}`);
          }
          
          const mass = atomicMasses[element] * count;
          totalMass += mass;
          breakdown.push({ 
            element, 
            count, 
            atomicMass: atomicMasses[element], 
            totalMass: mass 
          });
          
          if (count === 1) {
            steps.push(`${element}: ${atomicMasses[element]} g/mol × 1 = ${mass.toFixed(3)} g/mol`);
          } else {
            steps.push(`${element}: ${atomicMasses[element]} g/mol × ${count} = ${mass.toFixed(3)} g/mol`);
          }
        }
        
        steps.push(``);
        steps.push(`Total molar mass = ${breakdown.map(b => b.totalMass.toFixed(3)).join(' + ')} = ${totalMass.toFixed(3)} g/mol`);
        steps.push(``);
        steps.push(`Step 2: Calculate percent composition`);
        
        // Calculate percentages
        const percentages = breakdown.map(item => {
          const percentage = (item.totalMass / totalMass) * 100;
          steps.push(`${item.element}: (${item.totalMass.toFixed(3)} / ${totalMass.toFixed(3)}) × 100% = ${percentage.toFixed(2)}%`);
          return { ...item, percentage };
        });
        
        const newResult = {
          totalMass,
          percentages,
          steps,
          formula
        };
        
        onUpdate({ 
          inputs: { formula }, 
          result: newResult 
        });
      } catch (error) {
        onUpdate({ 
          inputs: { formula }, 
          result: { error: error.message } 
        });
      }
      
      setIsCalculating(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Chemical Formula</Label>
          <div className="flex gap-3">
            <Input
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g. H2SO4, CaCO3, C6H12O6"
              className="text-lg font-mono border-slate-200"
            />
            <Button
              onClick={calculate}
              disabled={!formula.trim() || isCalculating}
              className="bg-cyan-600 hover:bg-cyan-700 px-6"
            >
              {isCalculating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Calculator className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {result && !result.error && (
        <div className="space-y-4 p-6 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl border border-cyan-100">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">Percent Composition</Badge>
            <span className="text-lg font-bold text-slate-800">
              Total Molar Mass: {result.totalMass.toFixed(3)} g/mol
            </span>
          </div>

          <div className="grid gap-3">
            {result.percentages.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-cyan-100">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                    {item.element}
                  </Badge>
                  <span className="text-slate-600">
                    {item.count > 1 ? `${item.count} atoms` : '1 atom'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-cyan-700">
                    {item.percentage.toFixed(2)}%
                  </div>
                  <div className="text-sm text-slate-500">
                    {item.totalMass.toFixed(3)} g/mol
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 mt-6">
            <h4 className="font-semibold text-slate-700">Step-by-Step Solution:</h4>
            <div className="space-y-1">
              {result.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  {step ? (
                    <>
                      <span className="w-6 h-6 rounded-full bg-cyan-200 flex items-center justify-center text-xs font-medium text-cyan-800 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="font-mono text-slate-600 flex-1">{step}</span>
                    </>
                  ) : (
                    <div className="w-full h-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">Error: {result.error}</p>
          <p className="text-red-500 text-sm mt-1">Please check your chemical formula and try again.</p>
        </div>
      )}
    </div>
  );
}
