import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calculator, RefreshCw } from "lucide-react";

const GasLawCalculator = ({ inputs, result, onUpdate }) => {
  const [mode, setMode] = useState(inputs.mode || "ideal_gas");
  const [pressure1, setPressure1] = useState(inputs.pressure1 || "");
  const [volume1, setVolume1] = useState(inputs.volume1 || "");
  const [moles, setMoles] = useState(inputs.moles || "");
  const [temperature1, setTemperature1] = useState(inputs.temperature1 || "");
  const [pressure2, setPressure2] = useState(inputs.pressure2 || "");
  const [volume2, setVolume2] = useState(inputs.volume2 || "");
  const [temperature2, setTemperature2] = useState(inputs.temperature2 || "");
  const [pressureUnit, setPressureUnit] = useState(inputs.pressureUnit || "atm");
  const [temperatureUnit, setTemperatureUnit] = useState(inputs.temperatureUnit || "°C");
  const [isCalculating, setIsCalculating] = useState(false);
  const [inputError, setInputError] = useState(null);
  const [decimalPlaces, setDecimalPlaces] = useState(inputs.decimalPlaces || 3);

  const R = 0.0821; // L·atm/(mol·K)
  const R_kPa = 8.314; // L·kPa/(mol·K)
  const DEBOUNCE_MS = 300;
  const VALID_NUMBER = /^(\d*\.?\d*)$/;

  const validateInputs = () => {
    if (mode === "ideal_gas") {
      const provided = [pressure1, volume1, moles, temperature1].filter(Boolean).length;
      if (provided !== 3) {
        return "Provide exactly three inputs to solve for the fourth.";
      }
    } else if (mode === "combined_gas") {
      const provided = [pressure1, volume1, temperature1, pressure2, volume2, temperature2].filter(Boolean).length;
      if (provided !== 5) {
        return "Provide exactly five inputs to solve for the sixth.";
      }
    }
    if (
      (pressure1 && !VALID_NUMBER.test(pressure1)) ||
      (volume1 && !VALID_NUMBER.test(volume1)) ||
      (moles && !VALID_NUMBER.test(moles)) ||
      (temperature1 && !VALID_NUMBER.test(temperature1)) ||
      (pressure2 && !VALID_NUMBER.test(pressure2)) ||
      (volume2 && !VALID_NUMBER.test(volume2)) ||
      (temperature2 && !VALID_NUMBER.test(temperature2))
    ) {
      return "Inputs must be valid numbers.";
    }
    if (
      (pressure1 && parseFloat(pressure1) <= 0) ||
      (volume1 && parseFloat(volume1) <= 0) ||
      (moles && parseFloat(moles) <= 0) ||
      (pressure2 && parseFloat(pressure2) <= 0) ||
      (volume2 && parseFloat(volume2) <= 0) ||
      (temperature1 && temperatureUnit === "K" && parseFloat(temperature1) <= 0) ||
      (temperature2 && temperatureUnit === "K" && parseFloat(temperature2) <= 0)
    ) {
      return "Pressure, volume, and moles must be positive. Temperature in Kelvin must be positive.";
    }
    return null;
  };

  const calculate = useCallback(() => {
    const error = validateInputs();
    if (error) {
      setInputError(error);
      onUpdate({
        inputs: {
          mode,
          pressure1,
          volume1,
          moles,
          temperature1,
          pressure2,
          volume2,
          temperature2,
          pressureUnit,
          temperatureUnit,
          decimalPlaces
        },
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
      const R_value = pressureUnit === "atm" ? R : R_kPa;
      const convertTemp = (temp) =>
        temperatureUnit === "°C" && temp ? parseFloat(temp) + 273.15 : parseFloat(temp);

      const P1 = pressure1 ? parseFloat(pressure1) : null;
      const V1 = volume1 ? parseFloat(volume1) : null;
      const n = moles ? parseFloat(moles) : null;
      const T1 = temperature1 ? convertTemp(temperature1) : null;
      const P2 = pressure2 ? parseFloat(pressure2) : null;
      const V2 = volume2 ? parseFloat(volume2) : null;
      const T2 = temperature2 ? convertTemp(temperature2) : null;

      steps.push(`Given values:`);
      if (pressure1) steps.push(`P₁ = ${pressure1} ${pressureUnit}`);
      if (volume1) steps.push(`V₁ = ${volume1} L`);
      if (moles) steps.push(`n = ${moles} mol`);
      if (temperature1) steps.push(`T₁ = ${temperature1} ${temperatureUnit} = ${T1.toFixed(2)} K`);
      if (pressure2) steps.push(`P₂ = ${pressure2} ${pressureUnit}`);
      if (volume2) steps.push(`V₂ = ${volume2} L`);
      if (temperature2) steps.push(`T₂ = ${temperature2} ${temperatureUnit} = ${T2.toFixed(2)} K`);
      steps.push(`R = ${R_value.toFixed(4)} ${pressureUnit === "atm" ? "L·atm/(mol·K)" : "L·kPa/(mol·K)"}`);

      if (mode === "ideal_gas") {
        steps.push(`Using ideal gas law: PV = nRT`);
        if (!pressure1 && V1 && n && T1) {
          resultValue = (n * R_value * T1) / V1;
          steps.push(`Solving for P: P = nRT / V`);
          steps.push(`P = (${n} mol)(${R_value.toFixed(4)} ${pressureUnit === "atm" ? "L·atm/(mol·K)" : "L·kPa/(mol·K)"})(${T1.toFixed(2)} K) / ${V1} L`);
          steps.push(`P = ${resultValue.toFixed(decimalPlaces)} ${pressureUnit}`);
          unit = pressureUnit;
        } else if (!volume1 && P1 && n && T1) {
          resultValue = (n * R_value * T1) / P1;
          steps.push(`Solving for V: V = nRT / P`);
          steps.push(`V = (${n} mol)(${R_value.toFixed(4)} ${pressureUnit === "atm" ? "L·atm/(mol·K)" : "L·kPa/(mol·K)"})(${T1.toFixed(2)} K) / ${P1} ${pressureUnit}`);
          steps.push(`V = ${resultValue.toFixed(decimalPlaces)} L`);
          unit = "L";
        } else if (!moles && P1 && V1 && T1) {
          resultValue = (P1 * V1) / (R_value * T1);
          steps.push(`Solving for n: n = PV / RT`);
          steps.push(`n = (${P1} ${pressureUnit})(${V1} L) / ((${R_value.toFixed(4)} ${pressureUnit === "atm" ? "L·atm/(mol·K)" : "L·kPa/(mol·K)"})(${T1.toFixed(2)} K))`);
          steps.push(`n = ${resultValue.toFixed(decimalPlaces)} mol`);
          unit = "mol";
        } else if (!temperature1 && P1 && V1 && n) {
          const T_kelvin = (P1 * V1) / (n * R_value);
          resultValue = temperatureUnit === "°C" ? T_kelvin - 273.15 : T_kelvin;
          steps.push(`Solving for T: T = PV / nR`);
          steps.push(`T = (${P1} ${pressureUnit})(${V1} L) / ((${n} mol)(${R_value.toFixed(4)} ${pressureUnit === "atm" ? "L·atm/(mol·K)" : "L·kPa/(mol·K)"}))`);
          steps.push(`T = ${T_kelvin.toFixed(2)} K = ${resultValue.toFixed(decimalPlaces)} ${temperatureUnit}`);
          unit = temperatureUnit;
        }
      } else if (mode === "combined_gas") {
        steps.push(`Using combined gas law: P₁V₁/T₁ = P₂V₂/T₂`);
        if (!pressure2 && P1 && V1 && T1 && V2 && T2) {
          resultValue = (P1 * V1 * T2) / (V2 * T1);
          steps.push(`Solving for P₂: P₂ = P₁V₁T₂ / (V₂T₁)`);
          steps.push(`P₂ = (${P1} ${pressureUnit})(${V1} L)(${T2.toFixed(2)} K) / ((${V2} L)(${T1.toFixed(2)} K))`);
          steps.push(`P₂ = ${resultValue.toFixed(decimalPlaces)} ${pressureUnit}`);
          unit = pressureUnit;
        } else if (!volume2 && P1 && V1 && T1 && P2 && T2) {
          resultValue = (P1 * V1 * T2) / (P2 * T1);
          steps.push(`Solving for V₂: V₂ = P₁V₁T₂ / (P₂T₁)`);
          steps.push(`V₂ = (${P1} ${pressureUnit})(${V1} L)(${T2.toFixed(2)} K) / ((${P2} ${pressureUnit})(${T1.toFixed(2)} K))`);
          steps.push(`V₂ = ${resultValue.toFixed(decimalPlaces)} L`);
          unit = "L";
        } else if (!temperature2 && P1 && V1 && T1 && P2 && V2) {
          const T_kelvin = (P2 * V2 * T1) / (P1 * V1);
          resultValue = temperatureUnit === "°C" ? T_kelvin - 273.15 : T_kelvin;
          steps.push(`Solving for T₂: T₂ = P₂V₂T₁ / (P₁V₁)`);
          steps.push(`T₂ = (${P2} ${pressureUnit})(${V2} L)(${T1.toFixed(2)} K) / ((${P1} ${pressureUnit})(${V1} L))`);
          steps.push(`T₂ = ${T_kelvin.toFixed(2)} K = ${resultValue.toFixed(decimalPlaces)} ${temperatureUnit}`);
          unit = temperatureUnit;
        }
      }

      onUpdate({
        inputs: {
          mode,
          pressure1,
          volume1,
          moles,
          temperature1,
          pressure2,
          volume2,
          temperature2,
          pressureUnit,
          temperatureUnit,
          decimalPlaces
        },
        result: { value: resultValue, unit, steps, mode }
      });
    } catch (error) {
      onUpdate({
        inputs: {
          mode,
          pressure1,
          volume1,
          moles,
          temperature1,
          pressure2,
          volume2,
          temperature2,
          pressureUnit,
          temperatureUnit,
          decimalPlaces
        },
        result: { error: "Calculation error. Please check inputs." }
      });
    } finally {
      setIsCalculating(false);
    }
  }, [
    mode,
    pressure1,
    volume1,
    moles,
    temperature1,
    pressure2,
    volume2,
    temperature2,
    pressureUnit,
    temperatureUnit,
    decimalPlaces,
    onUpdate
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        mode !== inputs.mode ||
        pressure1 !== inputs.pressure1 ||
        volume1 !== inputs.volume1 ||
        moles !== inputs.moles ||
        temperature1 !== inputs.temperature1 ||
        pressure2 !== inputs.pressure2 ||
        volume2 !== inputs.volume2 ||
        temperature2 !== inputs.temperature2 ||
        pressureUnit !== inputs.pressureUnit ||
        temperatureUnit !== inputs.temperatureUnit
      ) {
        calculate();
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [
    mode,
    pressure1,
    volume1,
    moles,
    temperature1,
    pressure2,
    volume2,
    temperature2,
    pressureUnit,
    temperatureUnit,
    inputs,
    calculate
  ]);

  const handleReset = () => {
    setMode("ideal_gas");
    setPressure1("");
    setVolume1("");
    setMoles("");
    setTemperature1("");
    setPressure2("");
    setVolume2("");
    setTemperature2("");
    setPressureUnit("atm");
    setTemperatureUnit("°C");
    setInputError(null);
    onUpdate({
      inputs: {
        mode: "ideal_gas",
        pressure1: "",
        volume1: "",
        moles: "",
        temperature1: "",
        pressure2: "",
        volume2: "",
        temperature2: "",
        pressureUnit: "atm",
        temperatureUnit: "°C",
        decimalPlaces
      },
      result: null
    });
  };

  return (
    <div className="space-y-6" role="region" aria-label="Gas Law Calculator">
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="grid w-full grid-cols-2 bg-slate-100">
          <TabsTrigger value="ideal_gas" className="text-sm">Ideal Gas Law (PV = nRT)</TabsTrigger>
          <TabsTrigger value="combined_gas" className="text-sm">Combined Gas Law (P₁V₁/T₁ = P₂V₂/T₂)</TabsTrigger>
        </TabsList>

        <TabsContent value="ideal_gas" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pressure1">Pressure</Label>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="pressure1"
                        type="text"
                        value={pressure1}
                        onChange={(e) => VALID_NUMBER.test(e.target.value) && setPressure1(e.target.value)}
                        placeholder="Leave blank to solve for P"
                        className={`border-slate-200 ${inputError && !pressure1 ? "border-red-400" : ""}`}
                        aria-invalid={inputError && !pressure1}
                        aria-describedby={inputError && !pressure1 ? "pressure1-error" : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Enter pressure in {pressureUnit} or leave blank to solve.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={pressureUnit} onValueChange={setPressureUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atm">atm</SelectItem>
                    <SelectItem value="kPa">kPa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume1">Volume (L)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="volume1"
                      type="text"
                      value={volume1}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setVolume1(e.target.value)}
                      placeholder="Leave blank to solve for V"
                      className={`border-slate-200 ${inputError && !volume1 ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !volume1}
                      aria-describedby={inputError && !volume1 ? "volume1-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter volume in liters or leave blank to solve.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
                      placeholder="Leave blank to solve for n"
                      className={`border-slate-200 ${inputError && !moles ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !moles}
                      aria-describedby={inputError && !moles ? "moles-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter moles or leave blank to solve.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature1">Temperature</Label>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="temperature1"
                        type="text"
                        value={temperature1}
                        onChange={(e) => VALID_NUMBER.test(e.target.value) && setTemperature1(e.target.value)}
                        placeholder="Leave blank to solve for T"
                        className={`border-slate-200 ${inputError && !temperature1 ? "border-red-400" : ""}`}
                        aria-invalid={inputError && !temperature1}
                        aria-describedby={inputError && !temperature1 ? "temperature1-error" : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Enter temperature in {temperatureUnit} or leave blank to solve.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={temperatureUnit} onValueChange={setTemperatureUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="°C">°C</SelectItem>
                    <SelectItem value="K">K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-block p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-purple-800 font-mono text-lg">PV = nRT</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Leave one field blank to solve for that variable.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="combined_gas" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pressure1_combined">Initial Pressure</Label>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="pressure1_combined"
                        type="text"
                        value={pressure1}
                        onChange={(e) => VALID_NUMBER.test(e.target.value) && setPressure1(e.target.value)}
                        placeholder="Enter initial pressure"
                        className={`border-slate-200 ${inputError && !pressure1 ? "border-red-400" : ""}`}
                        aria-invalid={inputError && !pressure1}
                        aria-describedby={inputError && !pressure1 ? "pressure1-combined-error" : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Enter initial pressure in {pressureUnit}.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={pressureUnit} onValueChange={setPressureUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atm">atm</SelectItem>
                    <SelectItem value="kPa">kPa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume1_combined">Initial Volume (L)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="volume1_combined"
                      type="text"
                      value={volume1}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setVolume1(e.target.value)}
                      placeholder="Enter initial volume"
                      className={`border-slate-200 ${inputError && !volume1 ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !volume1}
                      aria-describedby={inputError && !volume1 ? "volume1-combined-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter initial volume in liters.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature1_combined">Initial Temperature</Label>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="temperature1_combined"
                        type="text"
                        value={temperature1}
                        onChange={(e) => VALID_NUMBER.test(e.target.value) && setTemperature1(e.target.value)}
                        placeholder="Enter initial temperature"
                        className={`border-slate-200 ${inputError && !temperature1 ? "border-red-400" : ""}`}
                        aria-invalid={inputError && !temperature1}
                        aria-describedby={inputError && !temperature1 ? "temperature1-combined-error" : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Enter initial temperature in {temperatureUnit}.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={temperatureUnit} onValueChange={setTemperatureUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="°C">°C</SelectItem>
                    <SelectItem value="K">K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pressure2">Final Pressure</Label>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="pressure2"
                        type="text"
                        value={pressure2}
                        onChange={(e) => VALID_NUMBER.test(e.target.value) && setPressure2(e.target.value)}
                        placeholder="Leave blank to solve for P₂"
                        className={`border-slate-200 ${inputError && !pressure2 ? "border-red-400" : ""}`}
                        aria-invalid={inputError && !pressure2}
                        aria-describedby={inputError && !pressure2 ? "pressure2-error" : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Enter final pressure in {pressureUnit} or leave blank to solve.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={pressureUnit} onValueChange={setPressureUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atm">atm</SelectItem>
                    <SelectItem value="kPa">kPa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume2">Final Volume (L)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="volume2"
                      type="text"
                      value={volume2}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setVolume2(e.target.value)}
                      placeholder="Leave blank to solve for V₂"
                      className={`border-slate-200 ${inputError && !volume2 ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !volume2}
                      aria-describedby={inputError && !volume2 ? "volume2-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter final volume in liters or leave blank to solve.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature2">Final Temperature</Label>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="temperature2"
                        type="text"
                        value={temperature2}
                        onChange={(e) => VALID_NUMBER.test(e.target.value) && setTemperature2(e.target.value)}
                        placeholder="Leave blank to solve for T₂"
                        className={`border-slate-200 ${inputError && !temperature2 ? "border-red-400" : ""}`}
                        aria-invalid={inputError && !temperature2}
                        aria-describedby={inputError && !temperature2 ? "temperature2-error" : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Enter final temperature in {temperatureUnit} or leave blank to solve.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={temperatureUnit} onValueChange={setTemperatureUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="°C">°C</SelectItem>
                    <SelectItem value="K">K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-block p-3 bg-purple-50 rounded-lg border border-purple-200">
              <span className="text-purple-800 font-mono text-lg">P₁V₁/T₁ = P₂V₂/T₂</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Leave one field blank to solve for that variable.
            </p>
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
          className="bg-purple-600 hover:bg-purple-700 px-8"
          aria-label="Calculate gas law"
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
        <div className="space-y-4 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">Result</Badge>
            <h3 className="text-2xl font-bold text-slate-800">
              {result.value.toFixed(decimalPlaces)} {result.unit}
            </h3>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700">Step-by-Step Solution:</h4>
            <div className="space-y-1" role="list">
              {result.steps.map((step, index) => (
                step ? (
                  <div key={index} className="flex items-start gap-2 text-sm" role="listitem">
                    <span className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-xs font-medium text-purple-800 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="font-mono text-slate-600 flex-1">{step}</span>
                  </div>
                ) : (
                  <div key={index} className="w-full h-2" />
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GasLawCalculator;
