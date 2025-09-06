import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator } from "lucide-react";

export default function MolarityCalculator({ inputs, result, onUpdate }) {
  const [mode, setMode] = useState(inputs.mode || "find_molarity");
  const [moles, setMoles] = useState(inputs.moles || "");
  const [volume, setVolume] = useState(inputs.volume || "");
  const [molarity, setMolarity] = useState(inputs.molarity || "");
  const [mass, setMass] = useState(inputs.mass || "");
  const [molarMass, setMolarMass] = useState(inputs.molarMass || "");
  const [isCalculating, setIsCalculating] = useState(false);

  const calculate = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      try {
        const steps = [];
        let resultValue;
        let unit;
        
        const volumeL = parseFloat(volume) / 1000; // Convert mL to L
        
        if (mode === "find_molarity") {
          // M = n / V
          let n;
          if (moles) {
            n = parseFloat(moles);
            steps.push(`Given: n = ${moles} mol, V = ${volume} mL = ${volumeL.toFixed(3)} L`);
          } else if (mass && molarMass) {
            n = parseFloat(mass) / parseFloat(molarMass);
            steps.push(`First, calculate moles: n = mass / molar mass`);
            steps.push(`n = ${mass} g / ${molarMass} g/mol = ${n.toFixed(3)} mol`);
            steps.push(`Given: n = ${n.toFixed(3)} mol, V = ${volume} mL = ${volumeL.toFixed(3)} L`);
          }
          
          steps.push(`Using: M = n / V`);
          resultValue = n / volumeL;
          steps.push(`M = ${n.toFixed(3)} mol / ${volumeL.toFixed(3)} L = ${resultValue.toFixed(3)} M`);
          unit = "M";
        } else if (mode === "find_volume") {
          // V = n / M
          const M = parseFloat(molarity);
          const n = parseFloat(moles);
          steps.push(`Given: n = ${moles} mol, M = ${molarity} M`);
          steps.push(`Using: V = n / M`);
          resultValue = (n / M) * 1000; // Convert to mL
          steps.push(`V = ${n} mol / ${M} M = ${(n/M).toFixed(3)} L = ${resultValue.toFixed(1)} mL`);
          unit = "mL";
        } else if (mode === "find_moles") {
          // n = M × V
          const M = parseFloat(molarity);
          steps.push(`Given: M = ${molarity} M, V = ${volume} mL = ${volumeL.toFixed(3)} L`);
          steps.push(`Using: n = M × V`);
          resultValue = M * volumeL;
          steps.push(`n = ${M} M × ${volumeL.toFixed(3)} L = ${resultValue.toFixed(3)} mol`);
          unit = "mol";
        }
        
        const newResult = {
          value: resultValue,
          unit,
          steps,
          mode
        };
        
        onUpdate({ 
          inputs: { mode, moles, volume, molarity, mass, molarMass }, 
          result: newResult 
        });
      } catch (error) {
        onUpdate({ 
          inputs: { mode, moles, volume, molarity, mass, molarMass }, 
          result: { error: "Please check your inputs and try again" } 
        });
      }
      
      setIsCalculating(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-100">
          <TabsTrigger value="find_molarity">Find Molarity</TabsTrigger>
          <TabsTrigger value="find_volume">Find Volume</TabsTrigger>
          <TabsTrigger value="find_moles">Find Moles</TabsTrigger>
        </TabsList>

        <TabsContent value="find_molarity" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Moles (mol)</Label>
              <Input
                type="number"
                step="0.001"
                value={moles}
                onChange={(e) => setMoles(e.target.value)}
                placeholder="Enter moles"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Volume (mL)</Label>
              <Input
                type="number"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="Enter volume in mL"
                className="border-slate-200"
              />
            </div>
          </div>
          
          <div className="text-center text-slate-500 text-sm">OR calculate moles from mass:</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mass (g)</Label>
              <Input
                type="number"
                step="0.001"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                placeholder="Enter mass in grams"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Molar Mass (g/mol)</Label>
              <Input
                type="number"
                step="0.001"
                value={molarMass}
                onChange={(e) => setMolarMass(e.target.value)}
                placeholder="Enter molar mass"
                className="border-slate-200"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="find_volume" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Moles (mol)</Label>
              <Input
                type="number"
                step="0.001"
                value={moles}
                onChange={(e) => setMoles(e.target.value)}
                placeholder="Enter moles"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Molarity (M)</Label>
              <Input
                type="number"
                step="0.001"
                value={molarity}
                onChange={(e) => setMolarity(e.target.value)}
                placeholder="Enter molarity"
                className="border-slate-200"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="find_moles" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Molarity (M)</Label>
              <Input
                type="number"
                step="0.001"
                value={molarity}
                onChange={(e) => setMolarity(e.target.value)}
                placeholder="Enter molarity"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Volume (mL)</Label>
              <Input
                type="number"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="Enter volume in mL"
                className="border-slate-200"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button
          onClick={calculate}
          disabled={isCalculating}
          className="bg-emerald-600 hover:bg-emerald-700 px-8"
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
        <div className="space-y-4 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Result</Badge>
            <h3 className="text-2xl font-bold text-slate-800">
              {result.value.toFixed(3)} {result.unit}
            </h3>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700">Step-by-Step Solution:</h4>
            <div className="space-y-1">
              {result.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-xs font-medium text-emerald-800 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="font-mono text-slate-600 flex-1">{step}</span>
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
