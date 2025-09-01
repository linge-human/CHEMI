import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calculator, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const atomicMasses: { [key: string]: number } = {
  H: 1.008, He: 4.003, Li: 6.941, Be: 9.012, B: 10.811, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.086, P: 30.974, S: 32.065,
  Cl: 35.453, Ar: 39.948, K: 39.098, Ca: 40.078, Ti: 47.867, Cr: 51.996, Mn: 54.938, Fe: 55.845,
  Ni: 58.693, Cu: 63.546, Zn: 65.38, Br: 79.904, Sr: 87.62, Ag: 107.868, I: 126.904, Ba: 137.327,
  Au: 196.967, Hg: 200.59, Pb: 207.2
};

interface Inputs {
  formula: string;
  decimalPlaces: number;
}

interface Result {
  totalMass?: number;
  percentages?: Array<{
    element: string;
    count: number;
    atomicMass: number;
    totalMass: number;
    percentage: number;
  }>;
  steps?: string[];
  error?: string;
}

interface PercentCompositionCalculatorProps {
  inputs: Inputs;
  result: Result;
  onUpdate: (data: { inputs: Inputs; result: Result }) => void;
}

const PercentCompositionCalculator = ({ inputs, result, onUpdate }: PercentCompositionCalculatorProps) => {
  const [formula, setFormula] = useState(inputs.formula || "");
  const [decimalPlaces, setDecimalPlaces] = useState(inputs.decimalPlaces || 3);
  const [isCalculating, setIsCalculating] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const DEBOUNCE_MS = 300;
  const VALID_FORMULA = /^[A-Z][a-z]?\d*(\([A-Z][a-z]?\d*\)*)*(\·\d*[A-Z][a-z]?\d*)?$/;

  const parseFormula = useCallback((formula: string): { [key: string]: number } => {
    const cleanedFormula = formula.replace(/\s/g, '');
    const elements: { [key: string]: number } = {};

    const parseSegment = (segment: string, multiplier: number = 1) => {
      const regex = /([A-Z][a-z]?)(\d*)/g;
      let match;
      while ((match = regex.exec(segment)) !== null) {
        const element = match[1];
        const count = parseInt(match[2]) || 1;
        if (!atomicMasses[element]) throw new Error(`Unknown element: ${element}`);
        elements[element] = (elements[element] || 0) + count * multiplier;
      }
    };

    try {
      // Handle hydrates (e.g., CuSO4·5H2O)
      const [mainFormula, hydrate] = cleanedFormula.split('·');
      let hydrateMultiplier = 1;
      if (hydrate) {
        const hydrateMatch = hydrate.match(/^(\d*)(.*)$/);
        if (hydrateMatch) {
          hydrateMultiplier = parseInt(hydrateMatch[1]) || 1;
          parseSegment(hydrateMatch[2], hydrateMultiplier);
        }
      }

      // Handle parentheses (e.g., Fe2(SO4)3)
      const parenRegex = /\(([A-Z][a-z]?\d*)*\)(\d*)/g;
      let currentFormula = mainFormula || cleanedFormula;
      let parenMatch;
      while ((parenMatch = parenRegex.exec(mainFormula || cleanedFormula)) !== null) {
        const group = parenMatch[1].replace(/[()]/g, '');
        const multiplier = parseInt(parenMatch[2]) || 1;
        parseSegment(group, multiplier);
        currentFormula = currentFormula.replace(parenMatch[0], '');
      }

      // Parse remaining elements
      parseSegment(currentFormula);
      return elements;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Invalid formula syntax");
    }
  }, []);

  const validateInput = useCallback(() => {
    if (!formula.trim()) return "Chemical formula is required.";
    if (!VALID_FORMULA.test(formula.replace(/\s/g, ''))) {
      return "Invalid formula syntax. Use format like H2SO4, Fe2(SO4)3, or CuSO4·5H2O.";
    }
    try {
      parseFormula(formula);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Invalid formula";
    }
  }, [formula, parseFormula]);

  const calculate = useCallback(() => {
    const error = validateInput();
    if (error) {
      setInputError(error);
      onUpdate({
        inputs: { formula, decimalPlaces },
        result: { error }
      });
      setIsCalculating(false);
      return;
    }

    setIsCalculating(true);
    setInputError(null);

    try {
      const elements = parseFormula(formula.replace(/\s/g, ''));
      const steps: string[] = [];
      const breakdown: Array<{
        element: string;
        count: number;
        atomicMass: number;
        totalMass: number;
      }> = [];
      let totalMass = 0;

      steps.push(`Analyzing formula: ${formula}`);
      steps.push(`Step 1: Calculate mass contribution of each element`);
      steps.push(``);

      for (const [element, count] of Object.entries(elements)) {
        const mass = atomicMasses[element] * count;
        totalMass += mass;
        breakdown.push({
          element,
          count,
          atomicMass: atomicMasses[element],
          totalMass: mass
        });
        steps.push(`${element}: ${atomicMasses[element].toFixed(decimalPlaces)} g/mol × ${count} = ${mass.toFixed(decimalPlaces)} g/mol`);
      }

      steps.push(``);
      steps.push(`Total molar mass = ${breakdown.map(b => b.totalMass.toFixed(decimalPlaces)).join(' + ')} = ${totalMass.toFixed(decimalPlaces)} g/mol`);
      steps.push(``);
      steps.push(`Step 2: Calculate percent composition`);

      const percentages = breakdown.map(item => {
        const percentage = (item.totalMass / totalMass) * 100;
        steps.push(`${item.element}: (${item.totalMass.toFixed(decimalPlaces)} / ${totalMass.toFixed(decimalPlaces)}) × 100% = ${percentage.toFixed(decimalPlaces)}%`);
        return { ...item, percentage };
      });

      onUpdate({
        inputs: { formula, decimalPlaces },
        result: { totalMass, percentages, steps, formula }
      });
    } catch (error) {
      onUpdate({
        inputs: { formula, decimalPlaces },
        result: { error: error instanceof Error ? error.message : "Calculation error" }
      });
    } finally {
      setIsCalculating(false);
    }
  }, [formula, decimalPlaces, onUpdate, parseFormula, validateInput]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formula !== inputs.formula) {
        calculate();
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [formula, inputs.formula, calculate]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !validateInput()) {
      calculate();
    }
  };

  const handleReset = () => {
    setFormula("");
    setInputError(null);
    onUpdate({
      inputs: { formula: "", decimalPlaces },
      result: null
    });
  };

  return (
    <div className="space-y-6" role="region" aria-label="Percent Composition Calculator">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="formula">Chemical Formula</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  id="formula"
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g. H2SO4, Fe2(SO4)3, CuSO4·5H2O"
                  className={`text-lg font-mono border-slate-200 ${inputError ? "border-red-400" : ""}`}
                  aria-invalid={!!inputError}
                  aria-describedby={inputError ? "formula-error" : undefined}
                />
              </TooltipTrigger>
              <TooltipContent>
                Enter a chemical formula (e.g., H2SO4, Fe2(SO4)3, CuSO4·5H2O). Use capital letters for elements, numbers for subscripts, () for groups, and · for hydrates.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-sm text-slate-500">
          <p>Supported formats:</p>
          <ul className="list-disc pl-5">
            <li>Simple: H2SO4, NaCl</li>
            <li>Complex: Fe2(SO4)3</li>
            <li>Hydrates: CuSO4·5H2O</li>
          </ul>
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
          disabled={!formula.trim() || isCalculating}
          className="bg-cyan-600 hover:bg-cyan-700 px-6"
          aria-label="Calculate percent composition"
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

      {result && !result.error && (
        <div className="space-y-4 p-6 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl border border-cyan-100">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">Percent Composition</Badge>
            <span className="text-lg font-bold text-slate-800">
              Total Molar Mass: {result.totalMass?.toFixed(decimalPlaces)} g/mol
            </span>
          </div>

          <div className="grid gap-3">
            {result.percentages?.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-cyan-100">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                    {item.element}
                  </Badge>
                  <span className="text-slate-600">
                    {item.count > 1 ? `${item.count} atoms` : "1 atom"}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-cyan-700">
                    {item.percentage.toFixed(decimalPlaces)}%
                  </div>
                  <div className="text-sm text-slate-500">
                    {item.totalMass.toFixed(decimalPlaces)} g/mol
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 mt-6">
            <h4 className="font-semibold text-slate-700">Step-by-Step Solution:</h4>
            <div className="space-y-1" role="list">
              {result.steps?.map((step, index) => (
                step ? (
                  <div key={index} className="flex items-start gap-2 text-sm" role="listitem">
                    <span className="w-6 h-6 rounded-full bg-cyan-200 flex items-center justify-center text-xs font-medium text-cyan-800 mt-0.5">
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

export default PercentCompositionCalculator;
