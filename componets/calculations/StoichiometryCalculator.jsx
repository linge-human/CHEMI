import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calculator, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Inputs {
  givenAmount: string;
  givenAmountType: "moles" | "mass";
  givenMassUnit: "g" | "kg";
  givenMolarMass: string;
  givenCoeff: string;
  wantedCoeff: string;
  decimalPlaces: number;
}

interface Result {
  wantedMoles?: number;
  ratio?: number;
  steps?: string[];
  error?: string;
}

interface StoichiometryCalculatorProps {
  inputs: Inputs;
  result: Result;
  onUpdate: (data: { inputs: Inputs; result: Result }) => void;
}

const StoichiometryCalculator = ({ inputs, result, onUpdate }: StoichiometryCalculatorProps) => {
  const [givenAmount, setGivenAmount] = useState(inputs.givenAmount || "");
  const [givenAmountType, setGivenAmountType] = useState(inputs.givenAmountType || "moles");
  const [givenMassUnit, setGivenMassUnit] = useState(inputs.givenMassUnit || "g");
  const [givenMolarMass, setGivenMolarMass] = useState(inputs.givenMolarMass || "");
  const [givenCoeff, setGivenCoeff] = useState(inputs.givenCoeff || "");
  const [wantedCoeff, setWantedCoeff] = useState(inputs.wantedCoeff || "");
  const [decimalPlaces, setDecimalPlaces] = useState(inputs.decimalPlaces || 3);
  const [isCalculating, setIsCalculating] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const DEBOUNCE_MS = 300;
  const VALID_NUMBER = /^(\d*\.?\d*(?:[eE][-+]?\d+)?)$/;

  const validateInputs = useCallback(() => {
    if (givenAmountType === "moles" && !givenAmount) {
      return "Amount in moles is required.";
    }
    if (givenAmountType === "mass" && (!givenAmount || !givenMolarMass)) {
      return "Mass and molar mass are required.";
    }
    if (!givenCoeff || !wantedCoeff) {
      return "Both coefficients are required.";
    }
    if (
      (givenAmount && !VALID_NUMBER.test(givenAmount)) ||
      (givenMolarMass && !VALID_NUMBER.test(givenMolarMass)) ||
      (givenCoeff && !VALID_NUMBER.test(givenCoeff)) ||
      (wantedCoeff && !VALID_NUMBER.test(wantedCoeff))
    ) {
      return "Inputs must be valid numbers.";
    }
    if (
      (givenAmount && parseFloat(givenAmount) <= 0) ||
      (givenMolarMass && parseFloat(givenMolarMass) <= 0) ||
      (givenCoeff && parseFloat(givenCoeff) <= 0) ||
      (wantedCoeff && parseFloat(wantedCoeff) <= 0)
    ) {
      return "All inputs must be positive.";
    }
    return null;
  }, [givenAmount, givenAmountType, givenMolarMass, givenCoeff, wantedCoeff]);

  const isValidInput = useMemo(() => !validateInputs(), [validateInputs]);

  const calculate = useCallback(() => {
    const error = validateInputs();
    if (error) {
      setInputError(error);
      onUpdate({
        inputs: {
          givenAmount,
          givenAmountType,
          givenMassUnit,
          givenMolarMass,
          givenCoeff,
          wantedCoeff,
          decimalPlaces,
        },
        result: { error }
      });
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);
    setInputError(null);

    try {
      const steps: string[] = [];
      const givenC = parseFloat(givenCoeff);
      const wantedC = parseFloat(wantedCoeff);
      let givenMol = givenAmountType === "moles" ? parseFloat(givenAmount) : null;

      steps.push("Given:");
      if (givenAmountType === "moles") {
        steps.push(`Amount of given substance: ${givenAmount} mol`);
      } else {
        const mass = parseFloat(givenAmount) * (givenMassUnit === "kg" ? 1000 : 1);
        const molarMass = parseFloat(givenMolarMass);
        givenMol = mass / molarMass;
        steps.push(`Mass of given substance: ${givenAmount} ${givenMassUnit} = ${mass.toFixed(decimalPlaces)} g`);
        steps.push(`Molar mass of given substance: ${givenMolarMass} g/mol`);
        steps.push(`Moles = mass / molar mass = ${mass.toFixed(decimalPlaces)} g / ${givenMolarMass} g/mol = ${givenMol.toFixed(decimalPlaces)} mol`);
      }
      steps.push(`Coefficient of given substance: ${givenC}`);
      steps.push(`Coefficient of wanted substance: ${wantedC}`);
      steps.push("");

      steps.push("Calculation:");
      const ratio = wantedC / givenC;
      steps.push(`Stoichiometric ratio = ${wantedC} mol wanted / ${givenC} mol given = ${ratio.toFixed(decimalPlaces)}`);
      const wantedMoles = givenMol! * ratio;
      steps.push(`Wanted moles = ${givenMol!.toFixed(decimalPlaces)} mol × ${ratio.toFixed(decimalPlaces)}`);
      steps.push(`= ${wantedMoles.toFixed(decimalPlaces)} mol of wanted substance`);

      onUpdate({
        inputs: {
          givenAmount,
          givenAmountType,
          givenMassUnit,
          givenMolarMass,
          givenCoeff,
          wantedCoeff,
          decimalPlaces,
        },
        result: { wantedMoles, ratio, steps }
      });
    } catch (error) {
      onUpdate({
        inputs: {
          givenAmount,
          givenAmountType,
          givenMassUnit,
          givenMolarMass,
          givenCoeff,
          wantedCoeff,
          decimalPlaces,
        },
        result: { error: error instanceof Error ? error.message : "Calculation error" }
      });
    } finally {
      setIsCalculating(false);
    }
  }, [
    givenAmount,
    givenAmountType,
    givenMassUnit,
    givenMolarMass,
    givenCoeff,
    wantedCoeff,
    decimalPlaces,
    onUpdate,
    validateInputs
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        givenAmount !== inputs.givenAmount ||
        givenAmountType !== inputs.givenAmountType ||
        givenMassUnit !== inputs.givenMassUnit ||
        givenMolarMass !== inputs.givenMolarMass ||
        givenCoeff !== inputs.givenCoeff ||
        wantedCoeff !== inputs.wantedCoeff
      ) {
        calculate();
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [
    givenAmount,
    givenAmountType,
    givenMassUnit,
    givenMolarMass,
    givenCoeff,
    wantedCoeff,
    inputs,
    calculate
  ]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValidInput) {
      calculate();
    }
  };

  const handleReset = () => {
    setGivenAmount("");
    setGivenAmountType("moles");
    setGivenMassUnit("g");
    setGivenMolarMass("");
    setGivenCoeff("");
    setWantedCoeff("");
    setInputError(null);
    onUpdate({
      inputs: {
        givenAmount: "",
        givenAmountType: "moles",
        givenMassUnit: "g",
        givenMolarMass: "",
        givenCoeff: "",
        wantedCoeff: "",
        decimalPlaces
      },
      result: null
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" role="region" aria-label="Stoichiometry Calculator">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-orange-800">
          Stoichiometry Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="givenAmountType">Input Type</Label>
            <Select value={givenAmountType} onValueChange={setGivenAmountType}>
              <SelectTrigger id="givenAmountType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moles">Moles</SelectItem>
                <SelectItem value="mass">Mass</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {givenAmountType === "moles" ? (
            <div className="space-y-2">
              <Label htmlFor="givenAmount">Given Amount (mol)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="givenAmount"
                      type="text"
                      value={givenAmount}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setGivenAmount(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g. 0.5, 1e-3"
                      className={`border-slate-200 ${inputError && !givenAmount ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !givenAmount}
                      aria-describedby={inputError && !givenAmount ? "givenAmount-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter moles of the known substance (e.g., 0.5 or 1e-3).</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="givenAmount">Given Mass</Label>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          id="givenAmount"
                          type="text"
                          value={givenAmount}
                          onChange={(e) => VALID_NUMBER.test(e.target.value) && setGivenAmount(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="e.g. 10, 1e-3"
                          className={`border-slate-200 ${inputError && !givenAmount ? "border-red-400" : ""}`}
                          aria-invalid={inputError && !givenAmount}
                          aria-describedby={inputError && !givenAmount ? "givenAmount-error" : undefined}
                        />
                      </TooltipTrigger>
                      <TooltipContent>Enter mass in {givenMassUnit} (e.g., 10 or 1e-3).</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Select value={givenMassUnit} onValueChange={setGivenMassUnit}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="givenMolarMass">Molar Mass (g/mol)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="givenMolarMass"
                        type="text"
                        value={givenMolarMass}
                        onChange={(e) => VALID_NUMBER.test(e.target.value) && setGivenMolarMass(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="e.g. 18.015, 1e-2"
                        className={`border-slate-200 ${inputError && !givenMolarMass ? "border-red-400" : ""}`}
                        aria-invalid={inputError && !givenMolarMass}
                        aria-describedby={inputError && !givenMolarMass ? "givenMolarMass-error" : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>Enter molar mass in g/mol (e.g., 18.015 for water).</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="givenCoeff">Given Coefficient</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="givenCoeff"
                      type="text"
                      value={givenCoeff}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setGivenCoeff(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g. 2"
                      className={`border-slate-200 ${inputError && !givenCoeff ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !givenCoeff}
                      aria-describedby={inputError && !givenCoeff ? "givenCoeff-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter coefficient of the known substance from the balanced equation.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wantedCoeff">Wanted Coefficient</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="wantedCoeff"
                      type="text"
                      value={wantedCoeff}
                      onChange={(e) => VALID_NUMBER.test(e.target.value) && setWantedCoeff(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g. 3"
                      className={`border-slate-200 ${inputError && !wantedCoeff ? "border-red-400" : ""}`}
                      aria-invalid={inputError && !wantedCoeff}
                      aria-describedby={inputError && !wantedCoeff ? "wantedCoeff-error" : undefined}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Enter coefficient of the wanted substance from the balanced equation.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-orange-800 font-mono text-lg">
              {givenCoeff || "a"} Given → {wantedCoeff || "b"} Wanted
            </div>
            <p className="text-sm text-orange-600 mt-1">
              Stoichiometric ratio from balanced chemical equation
            </p>
          </div>
        </div>

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
            disabled={isCalculating || !isValidInput}
            className="bg-orange-600 hover:bg-orange-700 px-8"
            aria-label="Calculate stoichiometry"
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{inputError}</AlertDescription>
          </Alert>
        )}

        {result?.wantedMoles && !result.error && (
          <div className="space-y-4 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                Result
              </Badge>
              <h3 className="text-2xl font-bold text-slate-800">
                {result.wantedMoles.toFixed(decimalPlaces)} mol
              </h3>
            </div>

            <div className="p-4 bg-white rounded-lg border border-orange-100">
              <div className="text-center">
                <div className="text-lg font-bold text-orange-800">
                  Stoichiometric Ratio: {result.ratio?.toFixed(decimalPlaces)}:1
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  For every 1 mol of given substance, you get{" "}
                  {result.ratio?.toFixed(decimalPlaces)} mol of wanted substance
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700">Step-by-Step Solution:</h4>
              <div className="space-y-1" role="list">
                {result.steps?.map((step, index) => (
                  step ? (
                    <div key={index} className="flex items-start gap-2 text-sm" role="listitem">
                      <span className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center text-xs font-medium text-orange-800 mt-0.5">
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
      </CardContent>
    </Card>
  );
};

export default StoichiometryCalculator;
