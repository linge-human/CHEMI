import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calculator, RefreshCw } from "lucide-react";

const PhCalculator = ({ inputs, result, onUpdate }) => {
  const [mode, setMode] = useState(inputs.mode || "find_ph");
  const [concentration, setConcentration] = useState(inputs.concentration || "");
  const [concentrationUnit, setConcentrationUnit] = useState(inputs.concentrationUnit || "M");
  const [ph, setPh] = useState(inputs.ph || "");
  const [poh, setPoh] = useState(inputs.poh || "");
  const [ka, setKa] = useState(inputs.ka || "");
  const [kb, setKb] = useState(inputs.kb || "");
  const [isCalculating, setIsCalculating] = useState(false);
  const [inputError, setInputError] = useState(null);
  const [decimalPlaces, setDecimalPlaces] = useState(inputs.decimalPlaces || 2);

  const DEBOUNCE_MS = 300;
  const VALID_NUMBER = /^(\d*\.?\d*(?:[eE][-+]?\d+)?)$/;
  const KW = 1e-14; // Ion product of water at 25°C

  const validateInputs = () => {
    if (mode === "find_ph" || mode === "find_concentration" || mode === "poh_to_ph") {
      if (mode === "find_ph" && !concentration) return "H⁺ concentration is required.";
      if (mode === "find_concentration" && !ph) return "pH value is required.";
      if (mode === "poh_to_ph" && !poh) return "pOH value is required.";
      if (
        (concentration && !VALID_NUMBER.test(concentration)) ||
        (ph && !VALID_NUMBER.test(ph)) ||
        (poh && !VALID_NUMBER.test(poh))
      ) {
        return "Inputs must be valid numbers.";
      }
      if (
        (concentration && parseFloat(concentration) <= 0) ||
        (ph && (parseFloat(ph) < 0 || parseFloat(ph) > 14)) ||
        (poh && (parseFloat(poh) < 0 || parseFloat(poh) > 14))
      ) {
        return "Concentration must be positive. pH and pOH must be between 0 and 14.";
      }
    } else if (mode === "weak_acid" || mode === "weak_base") {
      if (!concentration || !ka && mode === "weak_acid" || !kb && mode === "weak_base") {
        return `Concentration and ${mode === "weak_acid" ? "Ka" : "Kb"} are required.`;
      }
      if (
        (concentration && !VALID_NUMBER.test(concentration)) ||
        (ka && !VALID_NUMBER.test(ka)) ||
        (kb && !VALID_NUMBER.test(kb))
      ) {
        return "Inputs must be valid numbers.";
      }
      if (
        (concentration && parseFloat(concentration) <= 0) ||
        (ka && parseFloat(ka) <= 0) ||
        (kb && parseFloat(kb) <= 0)
      ) {
        return "Concentration and Ka/Kb must be positive.";
      }
    }
    return null;
  };

  const convertConcentration = (conc) => {
    return concentrationUnit === "mM" ? parseFloat(conc) / 1000 : parseFloat(conc);
  };

  const formatConcentration = (conc) => {
    return concentrationUnit === "mM" ? (conc * 1000).toExponential(decimalPlaces) : conc.toExponential(decimalPlaces);
  };

  const calculate = useCallback(() => {
    const error = validateInputs();
    if (error) {
      setInputError(error);
      onUpdate({
        inputs: { mode, concentration, concentrationUnit, ph, poh, ka, kb, decimalPlaces },
        result: { error }
      });
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);
    setInputError(null);

    try {
      const steps = [];
      let results = {};

      if (mode === "find_ph") {
        const conc = convertConcentration(concentration);
        steps.push(`Given: [H⁺] = ${concentration} ${concentrationUnit} = ${conc.toExponential(decimalPlaces)} M`);
        steps.push(`Using: pH = -log[H⁺]`);
        const phValue = -Math.log10(conc);
        steps.push(`pH = -log(${conc.toExponential(decimalPlaces)}) = ${phValue.toFixed(decimalPlaces)}`);
        const pohValue = 14 - phValue;
        steps.push(`pOH = 14 - pH = 14 - ${phValue.toFixed(decimalPlaces)} = ${pohValue.toFixed(decimalPlaces)}`);
        const ohConc = Math.pow(10, -pohValue);
        steps.push(`[OH⁻] = 10^(-pOH) = 10^(-${pohValue.toFixed(decimalPlaces)}) = ${formatConcentration(ohConc)} ${concentrationUnit}`);
        results = { ph: phValue, poh: pohValue, hConcentration: conc, ohConcentration: ohConc };
      } else if (mode === "find_concentration") {
        const phValue = parseFloat(ph);
        steps.push(`Given: pH = ${ph}`);
        steps.push(`Using: [H⁺] = 10^(-pH)`);
        const hConc = Math.pow(10, -phValue);
        steps.push(`[H⁺] = 10^(-${ph}) = ${formatConcentration(hConc)} ${concentrationUnit}`);
        const pohValue = 14 - phValue;
        steps.push(`pOH = 14 - pH = 14 - ${ph} = ${pohValue.toFixed(decimalPlaces)}`);
        const ohConc = Math.pow(10, -pohValue);
        steps.push(`[OH⁻] = 10^(-pOH) = 10^(-${pohValue.toFixed(decimalPlaces)}) = ${formatConcentration(ohConc)} ${concentrationUnit}`);
        results = { ph: phValue, poh: pohValue, hConcentration: hConc, ohConcentration: ohConc };
      } else if (mode === "poh_to_ph") {
        const pohValue = parseFloat(poh);
        steps.push(`Given: pOH = ${poh}`);
        steps.push(`Using: pH + pOH = 14`);
        const phValue = 14 - pohValue;
        steps.push(`pH = 14 - pOH = 14 - ${poh} = ${phValue.toFixed(decimalPlaces)}`);
        const hConc = Math.pow(10, -phValue);
        const ohConc = Math.pow(10, -pohValue);
        steps.push(`[H⁺] = 10^(-pH) = 10^(-${phValue.toFixed(decimalPlaces)}) = ${formatConcentration(hConc)} ${concentrationUnit}`);
        steps.push(`[OH⁻] = 10^(-pOH) = 10^(-${poh}) = ${formatConcentration(ohConc)} ${concentrationUnit}`);
        results = { ph: phValue, poh: pohValue, hConcentration: hConc, ohConcentration: ohConc };
      } else if (mode === "weak_acid") {
        const conc = convertConcentration(concentration);
        const kaValue = parseFloat(ka);
        steps.push(`Given: [HA] = ${concentration} ${concentrationUnit} = ${conc.toExponential(decimalPlaces)} M, Ka = ${ka.toExponential(decimalPlaces)}`);
        steps.push(`For weak acid: [H⁺] ≈ √(Ka × [HA]) (assuming weak dissociation)`);
        const hConc = Math.sqrt(kaValue * conc);
        steps.push(`[H⁺] = √(${kaValue.toExponential(decimalPlaces)} × ${conc.toExponential(decimalPlaces)}) = ${formatConcentration(hConc)} ${concentrationUnit}`);
        const phValue = -Math.log10(hConc);
        steps.push(`pH = -log[H⁺] = -log(${hConc.toExponential(decimalPlaces)}) = ${phValue.toFixed(decimalPlaces)}`);
        const pohValue = 14 - phValue;
        steps.push(`pOH = 14 - pH = 14 - ${phValue.toFixed(decimalPlaces)} = ${pohValue.toFixed(decimalPlaces)}`);
        const ohConc = Math.pow(10, -pohValue);
        steps.push(`[OH⁻] = 10^(-pOH) = 10^(-${pohValue.toFixed(decimalPlaces)}) = ${formatConcentration(ohConc)} ${concentrationUnit}`);
        results = { ph: phValue, poh: pohValue, hConcentration: hConc, ohConcentration: ohConc };
      } else if (mode === "weak_base") {
        const conc = convertConcentration(concentration);
        const kbValue = parseFloat(kb);
        steps.push(`Given: [B] = ${concentration} ${concentrationUnit} = ${conc.toExponential(decimalPlaces)} M, Kb = ${kb.toExponential(decimalPlaces)}`);
        steps.push(`For weak base: [OH⁻] ≈ √(Kb × [B]) (assuming weak dissociation)`);
        const ohConc = Math.sqrt(kbValue * conc);
        steps.push(`[OH⁻] = √(${kbValue.toExponential(decimalPlaces)} × ${conc.toExponential(decimalPlaces)}) = ${formatConcentration(ohConc)} ${concentrationUnit}`);
        const pohValue = -Math.log10(ohConc);
        steps.push(`pOH = -log[OH⁻] = -log(${ohConc.toExponential(decimalPlaces)}) = ${pohValue.toFixed(decimalPlaces)}`);
        const phValue = 14 - pohValue;
        steps.push(`pH = 14 - pOH = 14 - ${pohValue.toFixed(decimalPlaces)} = ${phValue.toFixed(decimalPlaces)}`);
        const hConc = Math.pow(10, -phValue);
        steps.push(`[H⁺] = 10^(-pH) = 10^(-${phValue.toFixed(decimalPlaces)}) = ${formatConcentration(hConc)} ${concentrationUnit}`);
        results = { ph: phValue, poh: pohValue, hConcentration: hConc, ohConcentration: ohConc };
      }

      const nature = results.ph < 7 ? "Acidic" : results.ph > 7 ? "Basic" : "Neutral";
      results.nature = nature;
      steps.push(``);
      steps.push(`Solution is ${nature.toLowerCase()} (pH ${results.ph < 7 ? "<" : results.ph > 7 ? ">" : "="} 7)`);

      onUpdate({
        inputs: { mode, concentration, concentrationUnit, ph, poh, ka, kb, decimalPlaces },
        result: { ...results, steps, mode }
      });
    } catch (error) {
      onUpdate({
        inputs: { mode, concentration, concentrationUnit, ph, poh, ka, kb, decimalPlaces },
        result: { error: "Calculation error. Please check inputs." }
      });
    } finally {
      setIsCalculating(false);
    }
  }, [mode, concentration, concentrationUnit, ph, poh, ka, kb, decimalPlaces, onUpdate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        mode !== inputs.mode ||
        concentration !== inputs.concentration ||
        concentrationUnit !== inputs.concentrationUnit ||
        ph !== inputs.ph ||
        poh !== inputs.poh ||
        ka !== inputs.ka ||
        kb !== inputs.kb
      ) {
        calculate();
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [mode, concentration, concentrationUnit, ph, poh, ka, kb, inputs, calculate]);

  const handleReset = () => {
    setMode("find_ph");
    setConcentration("");
    setConcentrationUnit("M");
    setPh("");
    setPoh("");
    setKa("");
    setKb("");
    setInputError(null);
    onUpdate({
      inputs: {
        mode: "find_ph",
        concentration: "",
        concentrationUnit: "M",
        ph: "",
        poh: "",
        ka: "",
        kb: "",
        decimalPlaces
      },
      result: null
    });
  };

  return (
    <div className="space-y-6" role="region" aria-label="pH Calculator">
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 bg-slate-100">
          <TabsTrigger value="find_ph" className="text-sm">Find pH</TabsTrigger>
          <TabsTrigger value="find_concentration" className="text-sm">Find [H⁺]</TabsTrigger>
          <TabsTrigger value="poh_to_ph" className="text-sm">pOH to pH</TabsTrigger>
          <TabsTrigger value="weak_acid" className="text-sm">Weak Acid</TabsTrigger>
          <TabsTrigger value="weak_base" className="text-sm">Weak Base</TabsTrigger>
        </TabsList>

        <TabsContent value="find_ph" className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="concentration">H⁺ Concentration</Label>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="concentration"
                      type="text"
                      value={concentration}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setConcentration(e.target.value)}
                      placeholder="e.g. 0.001, 1e-5"
                      className={`border-slate-200 ${inputError && !concentration ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !concentration}
                      aria-describedby={inputError && !concentration ? "concentration-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter H⁺ concentration in {concentrationUnit} (e.g., 0.001 or 1e-5).</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select value={concentrationUnit} onValueChange={setConcentrationUnit}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="mM">mM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="find_concentration" className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="ph">pH Value</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="ph"
                    type="text"
                    value={ph}
                    onChange={(e) => VALID_NUMBER.test(e.target.value) && setPh(e.target.value)}
                    placeholder="e.g. 7.4, 3.2"
                    className={`border-slate-200 ${inputError && !ph ? "border-red-400" : ""}`}
                    aria-invalid={inputError && !ph}
                    aria-describedby={inputError && !ph ? "ph-error" : undefined}
                  />
                </TooltipTrigger>
                <TooltipContent>Enter pH value (0–14).</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TabsContent>

        <TabsContent value="poh_to_ph" className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="poh">pOH Value</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="poh"
                    type="text"
                    value={poh}
                    onChange={(e) => VALID_NUMBER.test(e.target.value) && setPoh(e.target.value)}
                    placeholder="e.g. 6.8, 11.3"
                    className={`border-slate-200 ${inputError && !poh ? "border-red-400" : ""}`}
                    aria-invalid={inputError && !poh}
                    aria-describedby={inputError && !poh ? "poh-error" : undefined}
                  />
                </TooltipTrigger>
                <TooltipContent>Enter pOH value (0–14).</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TabsContent>

        <TabsContent value="weak_acid" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="concentration_weak_acid">Concentration</Label>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="concentration_weak_acid"
                        type="text"
                        value={concentration}
                        onChange={(e) => VALID_NUMBER.test(e.target.value) && setConcentration(e.target.value)}
                        placeholder="e.g. 0.1, 1e-3"
                        className={`border-slate-200 ${inputError && !concentration ? "border-red-400" : ""}`}
                        aria-invalid={inputError && !concentration}
                        aria-describedby={inputError && !concentration ? "concentration-weak-acid-error" : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Enter weak acid concentration in {concentrationUnit}.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={concentrationUnit} onValueChange={setConcentrationUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="mM">mM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ka">Ka (Acid Dissociation Constant)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="ka"
                      type="text"
                      value={ka}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setKa(e.target.value)}
                      placeholder="e.g. 1.8e-5"
                      className={`border-slate-200 ${inputError && !ka ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !ka}
                      aria-describedby={inputError && !ka ? "ka-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter Ka (e.g., 1.8e-5 for acetic acid).</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weak_base" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="concentration_weak_base">Concentration</Label>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="concentration_weak_base"
                        type="text"
                        value={concentration}
                        onChange={(e) => VALID_NUMBER.test(e.target.value) && setConcentration(e.target.value)}
                        placeholder="e.g. 0.1, 1e-3"
                        className={`border-slate-200 ${inputError && !concentration ? "border-red-400" : ""}`}
                        aria-invalid={inputError && !concentration}
                        aria-describedby={inputError && !concentration ? "concentration-weak-base-error" : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Enter weak base concentration in {concentrationUnit}.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={concentrationUnit} onValueChange={setConcentrationUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="mM">mM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kb">Kb (Base Dissociation Constant)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="kb"
                      type="text"
                      value={kb}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setKb(e.target.value)}
                      placeholder="e.g. 1.8e-5"
                      className={`border-slate-200 ${inputError && !kb ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !kb}
                      aria-describedby={inputError && !kb ? "kb-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter Kb (e.g., 1.8e-5 for ammonia).</TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
          className="bg-red-600 hover:bg-red-700 px-8"
          aria-label="Calculate pH"
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
        <div className="space-y-4 p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border border-red-100">
              <div className="text-sm text-slate-500">pH</div>
              <div className="text-xl font-bold text-slate-800">{result.ph.toFixed(decimalPlaces)}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-red-100">
              <div className="text-sm text-slate-500">pOH</div>
              <div className="text-xl font-bold text-slate-800">{result.poh.toFixed(decimalPlaces)}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-red-100">
              <div className="text-sm text-slate-500">[H⁺]</div>
              <div className="text-lg font-bold text-slate-800">{formatConcentration(result.hConcentration)} {concentrationUnit}</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-red-100">
              <div className="text-sm text-slate-500">[OH⁻]</div>
              <div className="text-lg font-bold text-slate-800">{formatConcentration(result.ohConcentration)} {concentrationUnit}</div>
            </div>
          </div>

          <div className="flex justify-center">
            <Badge
              className={`text-lg px-4 py-2 ${
                result.nature === "Acidic"
                  ? "bg-red-100 text-red-800 border-red-200"
                  : result.nature === "Basic"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-green-100 text-green-800 border-green-200"
              }`}
            >
              {result.nature} Solution
            </Badge>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700">Step-by-Step Solution:</h4>
            <div className="space-y-1" role="list">
              {result.steps.map((step, index) => (
                step ? (
                  <div key={index} className="flex items-start gap-2 text-sm" role="listitem">
                    <span className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center text-xs font-medium text-red-800 mt-0.5">
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

export default PhCalculator;
