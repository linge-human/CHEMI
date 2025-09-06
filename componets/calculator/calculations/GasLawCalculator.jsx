import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator } from "lucide-react";

export default function GasLawCalculator({ inputs, result, onUpdate }) {
  const [mode, setMode] = useState(inputs.mode || "ideal_gas");
  const [pressure, setPressure] = useState(inputs.pressure || "");
  const [volume, setVolume] = useState(inputs.volume || "");
  const [moles, setMoles] = useState(inputs.moles || "");
  const [temperature, setTemperature] = useState(inputs.temperature || "");
  const [isCalculating, setIsCalculating] = useState(false);

  const R = 0.0821; // L·atm/(mol·K)

  const calculate = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      try {
        const steps = [];
        let resultValue;
        let unit;
        
        const P = parseFloat(pressure);
        const V = parseFloat(volume);
        const n = parseFloat(moles);
        const T = parseFloat(temperature) + 273.15; // Convert to Kelvin
        
        steps.push(`Given values:`);
        if (pressure) steps.push(`P = ${pressure} atm`);
        if (volume) steps.push(`V = ${volume} L`);
        if (moles) steps.push(`n = ${moles} mol`);
        if (temperature) steps.push(`T = ${temperature}°C = ${T.toFixed(2)} K`);
        steps.push(`R = ${R} L·atm/(mol·K)`);
        steps.push(``);
        
        if (mode === "ideal_gas") {
          steps.push(`Using ideal gas law: PV = nRT`);
          
          if (!pressure && V && n && T) {
            // Find pressure
            resultValue = (n * R * T) / V;
            steps.push(`Solving for P: P = nRT / V`);
            steps.push(`P = (${n} mol)(${R} L·atm/(mol·K))(${T.toFixed(2)} K) / ${V} L`);
            steps.push(`P = ${resultValue.toFixed(3)} atm`);
            unit = "atm";
          } else if (!volume && P && n && T) {
            // Find volume
            resultValue = (n * R * T) / P;
            steps.push(`Solving for V: V = nRT / P`);
            steps.push(`V = (${n} mol)(${R} L·atm/(mol·K))(${T.toFixed(2)} K) / ${P} atm`);
            steps.push(`V = ${resultValue.toFixed(3)} L`);
            unit = "L";
          } else if (!moles && P && V && T) {
            // Find moles
            resultValue = (P * V) / (R * T);
            steps.push(`Solving for n: n = PV / RT`);
            steps.push(`n = (${P} atm)(${V} L) / ((${R} L·atm/(mol·K))(${T.toFixed(2)} K))`);
            steps.push(`n = ${resultValue.toFixed(3)} mol`);
            unit = "mol";
          } else if (!temperature && P && V && n) {
            // Find temperature
            resultValue = ((P * V) / (n * R)) - 273.15;
            steps.push(`Solving for T: T = PV / nR`);
            steps.push(`T = (${P} atm)(${V} L) / ((${n} mol)(${R} L·atm/(mol·K)))`);
            steps.push(`T = ${((P * V) / (n * R)).toFixed(2)} K = ${resultValue.toFixed(1)}°C`);
            unit = "°C";
          }
        }
        
        const newResult = {
          value: resultValue,
          unit,
          steps,
          mode
        };
        
        onUpdate({ 
          inputs: { mode, pressure, volume, moles, temperature }, 
          result: newResult 
        });
      } catch (error) {
        onUpdate({ 
          inputs: { mode, pressure, volume, moles, temperature }, 
          result: { error: "Please provide valid numerical inputs" } 
        });
      }
      
      setIsCalculating(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="grid w-full grid-cols-1 bg-slate-100">
          <TabsTrigger value="ideal_gas">Ideal Gas Law (PV = nRT)</TabsTrigger>
        </TabsList>

        <TabsContent value="ideal_gas" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pressure (atm)</Label>
              <Input
                type="number"
                step="0.001"
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                placeholder="Leave blank to solve for P"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Volume (L)</Label>
              <Input
                type="number"
                step="0.001"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="Leave blank to solve for V"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Moles (mol)</Label>
              <Input
                type="number"
                step="0.001"
                value={moles}
                onChange={(e) => setMoles(e.target.value)}
                placeholder="Leave blank to solve for n"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Temperature (°C)</Label>
              <Input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Leave blank to solve for T"
                className="border-slate-200"
              />
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-block p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-purple-800 font-mono text-lg">PV = nRT</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Leave one field blank to solve for that variable
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button
          onClick={calculate}
          disabled={isCalculating}
          className="bg-purple-600 hover:bg-purple-700 px-8"
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
        <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">Result</Badge>
            <h3 className="text-2xl font-bold text-slate-800">
              {result.value.toFixed(3)} {result.unit}
            </h3>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700">Step-by-Step Solution:</h4>
            <div className="space-y-1">
              {result.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  {step ? (
                    <>
                      <span className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-xs font-medium text-purple-800 mt-0.5">
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
