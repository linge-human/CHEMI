import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";

export default function StoichiometryCalculator({ inputs, result, onUpdate }) {
  const [givenMoles, setGivenMoles] = useState(inputs.givenMoles || "");
  const [givenCoeff, setGivenCoeff] = useState(inputs.givenCoeff || "");
  const [wantedCoeff, setWantedCoeff] = useState(inputs.wantedCoeff || "");
  const [isCalculating, setIsCalculating] = useState(false);

  const calculate = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      try {
        const steps = [];
        
        const givenMol = parseFloat(givenMoles);
        const givenC = parseFloat(givenCoeff);
        const wantedC = parseFloat(wantedCoeff);
        
        steps.push(`Given:`);
        steps.push(`Amount of given substance = ${givenMoles} mol`);
        steps.push(`Coefficient of given substance = ${givenCoeff}`);
        steps.push(`Coefficient of wanted substance = ${wantedCoeff}`);
        steps.push(``);
        
        steps.push(`Using stoichiometric ratio:`);
        steps.push(`${givenMoles} mol given × (${wantedCoeff} mol wanted / ${givenCoeff} mol given)`);
        
        const wantedMoles = (givenMol * wantedC) / givenC;
        steps.push(`= ${givenMoles} × ${(wantedC/givenC).toFixed(3)}`);
        steps.push(`= ${wantedMoles.toFixed(3)} mol of wanted substance`);
        
        const newResult = {
          wantedMoles,
          ratio: wantedC / givenC,
          steps
        };
        
        onUpdate({ 
          inputs: { givenMoles, givenCoeff, wantedCoeff }, 
          result: newResult 
        });
      } catch (error) {
        onUpdate({ 
          inputs: { givenMoles, givenCoeff, wantedCoeff }, 
          result: { error: "Please provide valid numerical inputs" } 
        });
      }
      
      setIsCalculating(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Given Amount (mol)</Label>
          <Input
            type="number"
            step="0.001"
            value={givenMoles}
            onChange={(e) => setGivenMoles(e.target.value)}
            placeholder="Moles of known substance"
            className="border-slate-200"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Given Coefficient</Label>
            <Input
              type="number"
              step="1"
              value={givenCoeff}
              onChange={(e) => setGivenCoeff(e.target.value)}
              placeholder="Coefficient in equation"
              className="border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label>Wanted Coefficient</Label>
            <Input
              type="number"
              step="1"
              value={wantedCoeff}
              onChange={(e) => setWantedCoeff(e.target.value)}
              placeholder="Coefficient of wanted substance"
              className="border-slate-200"
            />
          </div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="text-orange-800 font-mono text-lg">
            {givenCoeff || 'a'} Given → {wantedCoeff || 'b'} Wanted
          </div>
          <p className="text-sm text-orange-600 mt-1">
            Stoichiometric ratio from balanced chemical equation
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={calculate}
          disabled={isCalculating || !givenMoles || !givenCoeff || !wantedCoeff}
          className="bg-orange-600 hover:bg-orange-700 px-8"
        >
          {isCalculating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Calculator className="w-4 h-4 mr-2" />
          )}
          Calculate
        </Button>
      </div>

      {result && !result.error && (
        <div className="space-y-4 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
          <div className="flex items-center gap-3">
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">Result</Badge>
            <h3 className="text-2xl font-bold text-slate-800">
              {result.wantedMoles.toFixed(3)} mol
            </h3>
          </div>

          <div className="p-4 bg-white rounded-lg border border-orange-100">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-800">
                Stoichiometric Ratio: {result.ratio.toFixed(3)}:1
              </div>
              <p className="text-sm text-slate-600 mt-1">
                For every 1 mol of given substance, you get {result.ratio.toFixed(3)} mol of wanted substance
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700">Step-by-Step Solution:</h4>
            <div className="space-y-1">
              {result.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  {step ? (
                    <>
                      <span className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center text-xs font-medium text-orange-800 mt-0.5">
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
        </div>
      )}
    </div>
  );
}
