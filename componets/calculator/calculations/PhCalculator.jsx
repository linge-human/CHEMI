import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator } from "lucide-react";

export default function PhCalculator({ inputs, result, onUpdate }) {
  const [mode, setMode] = useState(inputs.mode || "find_ph");
  const [concentration, setConcentration] = useState(inputs.concentration || "");
  const [ph, setPh] = useState(inputs.ph || "");
  const [poh, setPoh] = useState(inputs.poh || "");
  const [isCalculating, setIsCalculating] = useState(false);

  const calculate = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      try {
        const steps = [];
        let results = {};
        
        if (mode === "find_ph") {
          const conc = parseFloat(concentration);
          steps.push(`Given: [H⁺] = ${concentration} M`);
          steps.push(`Using: pH = -log[H⁺]`);
          
          const phValue = -Math.log10(conc);
          steps.push(`pH = -log(${concentration}) = ${phValue.toFixed(2)}`);
          
          const pohValue = 14 - phValue;
          steps.push(`pOH = 14 - pH = 14 - ${phValue.toFixed(2)} = ${pohValue.toFixed(2)}`);
          
          const ohConc = Math.pow(10, -pohValue);
          steps.push(`[OH⁻] = 10^(-pOH) = 10^(-${pohValue.toFixed(2)}) = ${ohConc.toExponential(2)} M`);
          
          results = {
            ph: phValue,
            poh: pohValue,
            hConcentration: conc,
            ohConcentration: ohConc
          };
        } else if (mode === "find_concentration") {
          const phValue = parseFloat(ph);
          steps.push(`Given: pH = ${ph}`);
          steps.push(`Using: [H⁺] = 10^(-pH)`);
          
          const hConc = Math.pow(10, -phValue);
          steps.push(`[H⁺] = 10^(-${ph}) = ${hConc.toExponential(2)} M`);
          
          const pohValue = 14 - phValue;
          steps.push(`pOH = 14 - pH = 14 - ${ph} = ${pohValue.toFixed(2)}`);
          
          const ohConc = Math.pow(10, -pohValue);
          steps.push(`[OH⁻] = 10^(-pOH) = 10^(-${pohValue.toFixed(2)}) = ${ohConc.toExponential(2)} M`);
          
          results = {
            ph: phValue,
            poh: pohValue,
            hConcentration: hConc,
            ohConcentration: ohConc
          };
        } else if (mode === "poh_to_ph") {
          const pohValue = parseFloat(poh);
          steps.push(`Given: pOH = ${poh}`);
          steps.push(`Using: pH + pOH = 14`);
          
          const phValue = 14 - pohValue;
          steps.push(`pH = 14 - pOH = 14 - ${poh} = ${phValue.toFixed(2)}`);
          
          const hConc = Math.pow(10, -phValue);
          const ohConc = Math.pow(10, -pohValue);
          steps.push(`[H⁺] = 10^(-pH) = 10^(-${phValue.toFixed(2)}) = ${hConc.toExponential(2)} M`);
          steps.push(`[OH⁻] = 10^(-pOH) = 10^(-${poh}) = ${ohConc.toExponential(2)} M`);
          
          results = {
            ph: phValue,
            poh: pohValue,
            hConcentration: hConc,
            ohConcentration: ohConc
          };
        }
        
        // Determine if acidic, basic, or neutral
        let nature;
        if (results.ph < 7) nature = "Acidic";
        else if (results.ph > 7) nature = "Basic";
        else nature = "Neutral";
        
        results.nature = nature;
        steps.push(``);
        steps.push(`Solution is ${nature.toLowerCase()} (pH ${results.ph < 7 ? '<' : results.ph > 7 ? '>' : '='} 7)`);
        
        const newResult = {
          ...results,
          steps,
          mode
        };
        
        onUpdate({ 
          inputs: { mode, concentration, ph, poh }, 
          result: newResult 
        });
      } catch (error) {
        onUpdate({ 
          inputs: { mode, concentration, ph, poh }, 
          result: { error: "Please provide valid numerical inputs" } 
        });
      }
      
      setIsCalculating(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-100">
          <TabsTrigger value="find_ph">Find pH</TabsTrigger>
          <TabsTrigger value="find_concentration">Find [H⁺]</TabsTrigger>
          <TabsTrigger value="poh_to_ph">pOH to pH</TabsTrigger>
        </TabsList>

        <TabsContent value="find_ph" className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>H⁺ Concentration (M)</Label>
            <Input
              type="number"
              step="0.000001"
              value={concentration}
              onChange={(e) => setConcentration(e.target.value)}
              placeholder="e.g. 0.001, 1e-5"
              className="border-slate-200"
            />
          </div>
        </TabsContent>

        <TabsContent value="find_concentration" className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>pH Value</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="14"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              placeholder="e.g. 7.4, 3.2"
              className="border-slate-200"
            />
          </div>
        </TabsContent>

        <TabsContent value="poh_to_ph" className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>pOH Value</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="14"
              value={poh}
              onChange={(e) => setPoh(e.target.value)}
              placeholder="e.g. 6.8, 11.3"
              className="border-slate-200"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button
          onClick={calculate}
          disabled={isCalculating}
          className="bg-red-600 hover:bg-red-700 px-8"
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
        <div className="space-y-4 p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border border-red-100">
              <div className="text-sm text-slate-500">pH</div>
              <div className="text-xl font-bold text-slate-800">{result.ph.toFixed(2)}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-red-100">
              <div className="text-sm text-slate-500">pOH</div>
              <div className="text-xl font-bold text-slate-800">{result.poh.toFixed(2)}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-red-100">
              <div className="text-sm text-slate-500">[H⁺]</div>
              <div className="text-lg font-bold text-slate-800">{result.hConcentration.toExponential(2)}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-red-100">
              <div className="text-sm text-slate-500">[OH⁻]</div>
              <div className="text-lg font-bold text-slate-800">{result.ohConcentration.toExponential(2)}</div>
            </div>
          </div>

          <div className="flex justify-center">
            <Badge 
              className={`text-lg px-4 py-2 ${
                result.nature === 'Acidic' ? 'bg-red-100 text-red-800 border-red-200' :
                result.nature === 'Basic' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                'bg-green-100 text-green-800 border-green-200'
              }`}
            >
              {result.nature} Solution
            </Badge>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700">Step-by-Step Solution:</h4>
            <div className="space-y-1">
              {result.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  {step ? (
                    <>
                      <span className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center text-xs font-medium text-red-800 mt-0.5">
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
