import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltips";
import { Calculator, RefreshCw } from "lucide-react";

const MolarityCalculator = ({ inputs, result, onUpdate }) => {
  const [mode, setMode] = useState(inputs.mode || "find_molarity");
  const [moles, setMoles] = useState(inputs.moles || "");
  const [volume, setVolume] = useState(inputs.volume || "");
  const [volumeUnit, setVolumeUnit] = useState(inputs.volumeUnit || "mL");
  const [molarity, setMolarity] = useState(inputs.molarity || "");
  const [mass, setMass] = useState(inputs.mass || "");
  const [molarMass, setMolarMass] = useState(inputs.molarMass || "");
  const [isCalculating, setIsCalculating] = useState(false);
  const [inputError, setInputError] = useState(null);
  const [decimalPlaces, setDecimalPlaces] = useState(inputs.decimalPlaces || 3);

  const DEBOUNCE_MS = 300;
  const VALID_NUMBER = /^(\d*\.?\d*)$/;

  const validateInputs = () => {
    if (mode === "find_molarity") {
      if (!moles && (!mass || !molarMass)) {
        return "Provide either moles or both mass and molar mass.";
      }
      if (!volume) return "Volume is required.";
    } else if (mode === "find_volume") {
      if (!moles) return "Moles are required.";
      if (!molarity) return "Molarity is required.";
    } else if (mode === "find_moles") {
      if (!molarity) return "Molarity is required.";
      if (!volume) return "Volume is required.";
    }
    if (
      (moles && !VALID_NUMBER.test(moles)) ||
      (volume && !VALID_NUMBER.test(volume)) ||
      (molarity && !VALID_NUMBER.test(molarity)) ||
      (mass && !VALID_NUMBER.test(mass)) ||
      (molarMass && !VALID_NUMBER.test(molarMass))
    ) {
      return "Inputs must be valid numbers.";
    }
    if (
      (moles && parseFloat(moles) < 0) ||
      (volume && parseFloat(volume) < 0) ||
      (molarity && parseFloat(molarity) < 0) ||
      (mass && parseFloat(mass) < 0) ||
      (molarMass && parseFloat(molarMass) <= 0)
    ) {
      return "Inputs cannot be negative, and molar mass must be positive.";
    }
    return null;
  };

  const calculate = useCallback(() => {
    const error = validateInputs();
    if (error) {
      setInputError(error);
      onUpdate({
        inputs: { mode, moles, volume, volumeUnit, molarity, mass, molarMass, decimalPlaces },
        result: { error }
      });
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);
    setInputError(null);

    try {
      const steps = [];
      let resultValue;
      let unit;
      const volumeL = volumeUnit === "mL" ? parseFloat(volume) / 1000 : parseFloat(volume);

      if (mode === "find_molarity") {
        let n;
        if (moles) {
          n = parseFloat(moles);
          steps.push(`Given: n = ${moles} mol, V = ${volume} ${volumeUnit} = ${volumeL.toFixed(decimalPlaces)} L`);
        } else {
          n = parseFloat(mass) / parseFloat(molarMass);
          steps.push(`Calculate moles: n = mass / molar mass`);
          steps.push(`n = ${mass} g / ${molarMass} g/mol = ${n.toFixed(decimalPlaces)} mol`);
          steps.push(`Given: n = ${n.toFixed(decimalPlaces)} mol, V = ${volume} ${volumeUnit} = ${volumeL.toFixed(decimalPlaces)} L`);
        }
        steps.push(`Using: M = n / V`);
        resultValue = n / volumeL;
        steps.push(`M = ${n.toFixed(decimalPlaces)} mol / ${volumeL.toFixed(decimalPlaces)} L = ${resultValue.toFixed(decimalPlaces)} M`);
        unit = "M";
      } else if (mode === "find_volume") {
        const M = parseFloat(molarity);
        const n = parseFloat(moles);
        steps.push(`Given: n = ${moles} mol, M = ${molarity} M`);
        steps.push(`Using: V = n / M`);
        resultValue = n / M;
        steps.push(`V = ${n} mol / ${M} M = ${resultValue.toFixed(decimalPlaces)} L`);
        if (volumeUnit === "mL") {
          resultValue *= 1000;
          steps.push(`Convert to mL: ${resultValue.toFixed(decimalPlaces)} mL`);
        }
        unit = volumeUnit;
      } else if (mode === "find_moles") {
        const M = parseFloat(molarity);
        steps.push(`Given: M = ${molarity} M, V = ${volume} ${volumeUnit} = ${volumeL.toFixed(decimalPlaces)} L`);
        steps.push(`Using: n = M × V`);
        resultValue = M * volumeL;
        steps.push(`n = ${M} M × ${volumeL.toFixed(decimalPlaces)} L = ${resultValue.toFixed(decimalPlaces)} mol`);
        unit = "mol";
      }

      onUpdate({
        inputs: { mode, moles, volume, volumeUnit, molarity, mass, molarMass, decimalPlaces },
        result: { value: resultValue, unit, steps, mode }
      });
    } catch (error) {
      onUpdate({
        inputs: { mode, moles, volume, volumeUnit, molarity, mass, molarMass, decimalPlaces },
        result: { error: "Calculation error. Please check inputs." }
      });
    } finally {
      setIsCalculating(false);
    }
  }, [mode, moles, volume, volumeUnit, molarity, mass, molarMass, decimalPlaces, onUpdate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        moles !== inputs.moles ||
        volume !== inputs.volume ||
        volumeUnit !== inputs.volumeUnit ||
        molarity !== inputs.molarity ||
        mass !== inputs.mass ||
        molarMass !== inputs.molarMass ||
        mode !== inputs.mode
      ) {
        calculate();
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [moles, volume, volumeUnit, molarity, mass, molarMass, mode, inputs, calculate]);

  const handleReset = () => {
    setMoles("");
    setVolume("");
    setVolumeUnit("mL");
    setMolarity("");
    setMass("");
    setMolarMass("");
    setInputError(null);
    onUpdate({
      inputs: { mode, moles: "", volume: "", volumeUnit: "mL", molarity: "", mass: "", molarMass: "", decimalPlaces },
      result: null
    });
  };

  return (
    <div className="space-y-6" role="region" aria-label="Molarity Calculator">
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-100">
          <TabsTrigger value="find_molarity" className="text-sm">Find Molarity</TabsTrigger>
          <TabsTrigger value="find_volume" className="text-sm">Find Volume</TabsTrigger>
          <TabsTrigger value="find_moles" className="text-sm">Find Moles</TabsTrigger>
        </TabsList>

        <TabsContent value="find_molarity" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="moles">Moles (mol)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="moles"
                      type="text"
                      value={moles}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setMoles(e.target.value)}
                      placeholder="Enter moles"
                      className={`border-slate-200 ${inputError && !moles ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !moles}
                      aria-describedby={inputError && !moles ? "moles-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter the number of moles of solute.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="volume"
                        type="text"
                        value={volume}
                        onChange={(e) => VALID_NUMBER.test(e.target.value) && setVolume(e.target.value)}
                        placeholder={`Enter volume in ${volumeUnit}`}
                        className={`border-slate-200 ${inputError && !volume ? "border-red-400" : ""}`}
                        aria-invalid={inputError && !volume}
                        aria-describedby={inputError && !volume ? "volume-error" : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Enter the solution volume in {volumeUnit}.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={volumeUnit} onValueChange={setVolumeUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mL">mL</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="text-center text-slate-500 text-sm">OR calculate moles from mass:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mass">Mass (g)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="mass"
                      type="text"
                      value={mass}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setMass(e.target.value)}
                      placeholder="Enter mass in grams"
                      className={`border-slate-200 ${inputError && !moles && !mass ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !moles && !mass}
                      aria-describedby={inputError && !moles && !mass ? "mass-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter the mass of the solute in grams.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Label htmlFor="molarMass">Molar Mass (g/mol)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="molarMass"
                      type="text"
                      value={molarMass}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setMolarMass(e.target.value)}
                      placeholder="Enter molar mass"
                      className={`border-slate-200 ${inputError && !moles && !molarMass ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !moles && !molarMass}
                      aria-describedby={inputError && !moles && !molarMass ? "molarMass-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter the molar mass of the solute in g/mol.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="find_volume" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="moles_volume">Moles (mol)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="moles_volume"
                      type="text"
                      value={moles}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setMoles(e.target.value)}
                      placeholder="Enter moles"
                      className={`border-slate-200 ${inputError && !moles ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !moles}
                      aria-describedby={inputError && !moles ? "moles-volume-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter the number of moles of solute.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Label htmlFor="molarity_volume">Molarity (M)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="molarity_volume"
                      type="text"
                      value={molarity}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setMolarity(e.target.value)}
                      placeholder="Enter molarity"
                      className={`border-slate-200 ${inputError && !molarity ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !molarity}
                      aria-describedby={inputError && !molarity ? "molarity-volume-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter the molarity in mol/L.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="volumeUnit">Result Volume Unit</Label>
            <Select value={volumeUnit} onValueChange={setVolumeUnit}>
              <SelectTrigger id="volumeUnit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mL">mL</SelectItem>
                <SelectItem value="L">L</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="find_moles" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="molarity_moles">Molarity (M)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="molarity_moles"
                      type="text"
                      value={molarity}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setMolarity(e.target.value)}
                      placeholder="Enter molarity"
                      className={`border-slate-200 ${inputError && !molarity ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !molarity}
                      aria-describedby={inputError && !molarity ? "molarity-moles-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter the molarity in mol/L.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume_moles">Volume</Label>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="volume_moles"
                        type="text"
                        value={volume}
                        onChange={(e) => VALID_NUMBER.test(e.target.value) && setVolume(e.target.value)}
                        placeholder={`Enter volume in ${volumeUnit}`}
                        className={`border-slate-200 ${inputError && !volume ? "border-red-400" : ""}`}
                        aria-invalid={inputError && !volume}
                        aria-describedby={inputError && !volume ? "volume-moles-error" : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Enter the solution volume in {volumeUnit}.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={volumeUnit} onValueChange={setVolumeUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mL">mL</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center gap-4">
        <div className="space-y-2">
          <Label htmlFor="decimalPlaces">Decimal Places</Label>
          <Select value={decimalPlaces.toString()} onValueChange={(value) => setDecimalPlaces(parseInt(value))}>
            <SelectTrigger id="decimalPlaces" className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={calculate}
          disabled={isCalculating}
          className="bg-emerald-600 hover:bg-emerald-700 px-8"
          aria-label="Calculate molarity"
        >
          {isCalculating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Calculator className="w-4 h-4 mr-2" />
          )}
          Calculate
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-slate-200 text-slate-600 hover:bg-slate-100"
          aria-label="Reset inputs"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {inputError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <p className="text-red-600 font-medium">Error: {inputError}</p>
          <p className="text-red-500 text-sm mt-1">Please check your inputs and try again.</p>
        </div>
      )}

      {result && !result.error && (
        <div className="space-y-4 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Result</Badge>
            <h3 className="text-2xl font-bold text-slate-800">
              {result.value.toFixed(decimalPlaces)} {result.unit}
            </h3>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700">Step-by-Step Solution:</h4>
            <div className="space-y-1" role="list">
              {result.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm" role="listitem">
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
    </div>
  );
};

export default MolarityCalculator;
