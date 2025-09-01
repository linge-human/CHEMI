import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calculator, ArrowRight, RefreshCw } from "lucide-react";
import elements from "../data/elementsData"; // Import complete elements database

// Map atomic masses from elements data
const atomicMasses = Object.fromEntries(elements.map(e => [e.symbol, e.atomicMass]));

const MolarMassCalculator = ({ inputs, result, onUpdate }) => {
  const [formula, setFormula] = useState(inputs.formula || "");
  const [isCalculating, setIsCalculating] = useState(false);
  const [inputError, setInputError] = useState(null);

  const DEBOUNCE_MS = 300;
  const VALID_CHARACTERS = /^[A-Za-z0-9()·]*$/;

  const parseFormula = (input) => {
    const elements = {};
    let formula = input.replace(/\s/g, '');

    // Handle hydrates (e.g., CuSO4·5H2O)
    if (formula.includes('·')) {
      const [mainFormula, hydrate] = formula.split('·');
      formula = mainFormula + (hydrate ? `(${hydrate})` : '');
    }

    // Recursive function to handle parentheses
    const parseGroup = (str, multiplier = 1) => {
      const regex = /([A-Z][a-z]?)(\d*)|(\()|(\))(\d*)/g;
      let match;
      let i = 0;
      let currentElements = {};

      while (i < str.length && (match = regex.exec(str)) !== null) {
        const [fullMatch, element, countStr, openParen, closeParen, groupCountStr] = match;
        i = regex.lastIndex;

        if (element) {
          const count = parseInt(countStr) || 1;
          currentElements[element] = (currentElements[element] || 0) + count * multiplier;
        } else if (openParen) {
          let parenCount = 1;
          let subFormula = '';
          while (parenCount > 0 && i < str.length) {
            const char = str[i++];
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
            if (parenCount > 0) subFormula += char;
          }
          const nextMatch = str.slice(i).match(/^\d*/);
          const groupMultiplier = nextMatch && nextMatch[0] ? parseInt(nextMatch[0]) : 1;
          i += nextMatch ? nextMatch[0].length : 0;
          regex.lastIndex = i;
          const subElements = parseGroup(subFormula, groupMultiplier);
          for (const [el, count] of Object.entries(subElements)) {
            currentElements[el] = (currentElements[el] || 0) + count * multiplier;
          }
        }
      }

      return currentElements;
    };

    try {
      const parsed = parseGroup(formula);
      for (const element of Object.keys(parsed)) {
        if (!atomicMasses[element]) {
          throw new Error(`Unknown element: ${element}`);
        }
      }
      return parsed;
    } catch (error) {
      throw new Error("Invalid formula format. Ensure correct element symbols and parentheses.");
    }
  };

  const calculateMolarMass = useCallback(() => {
    if (!formula.trim()) {
      setInputError("Formula cannot be empty.");
      return;
    }

    if (!VALID_CHARACTERS.test(formula)) {
      setInputError("Formula contains invalid characters. Use letters, numbers, parentheses, or '·' for hydrates.");
      return;
    }

    setIsCalculating(true);
    setInputError(null);

    try {
      const elements = parseFormula(formula);
      let totalMass = 0;
      const breakdown = [];
      const steps = [];

      steps.push(`Parsing formula: ${formula}`);

      for (const [element, count] of Object.entries(elements)) {
        const mass = atomicMasses[element] * count;
        totalMass += mass;
        breakdown.push({ element, count, atomicMass: atomicMasses[element], totalMass: mass });

        if (count === 1) {
          steps.push(`${element}: ${atomicMasses[element].toFixed(3)} g/mol`);
        } else {
          steps.push(`${element}: ${atomicMasses[element].toFixed(3)} × ${count} = ${mass.toFixed(3)} g/mol`);
        }
      }

      steps.push(`Total: ${breakdown.map(b => b.totalMass.toFixed(3)).join(' + ')} = ${totalMass.toFixed(3)} g/mol`);

      onUpdate({
        inputs: { formula },
        result: { molarMass: totalMass, breakdown, steps, formula }
      });
    } catch (error) {
      onUpdate({
        inputs: { formula },
        result: { error: error.message }
      });
    } finally {
      setIsCalculating(false);
    }
  }, [formula, onUpdate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formula && formula !== inputs.formula) {
        calculateMolarMass();
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [formula, inputs.formula, calculateMolarMass]);

  const handleReset = () => {
    setFormula("");
    setInputError(null);
    onUpdate({ inputs: { formula: "" }, result: null });
  };

  return (
    <div className="space-y-6" role="region" aria-label="Molar Mass Calculator">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="formula" className="text-slate-700 font-medium">
            Chemical Formula
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex gap-3">
                  <Input
                    id="formula"
                    value={formula}
                    onChange={(e) => setFormula(e.target.value)}
                    placeholder="e.g. H2SO4, CaCO3, CuSO4·5H2O"
                    className={`text-lg font-mono border-slate-200 focus:border-blue-400 ${inputError ? "border-red-400" : ""}`}
                    aria-invalid={!!inputError}
                    aria-describedby={inputError ? "formula-error" : undefined}
                  />
                  <Button
                    onClick={calculateMolarMass}
                    disabled={!formula.trim() || isCalculating}
                    className="bg-blue-600 hover:bg-blue-700 px-6"
                    aria-label="Calculate molar mass"
                  >
                    {isCalculating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Calculator className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="border-slate-200 text-slate-600 hover:bg-slate-100"
                    aria-label="Reset formula"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Enter a chemical formula (e.g., H2O, NaCl, CuSO4·5H2O). Use parentheses for groups and '·' for hydrates.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {inputError && (
            <p id="formula-error" className="text-red-500 text-sm mt-1" role="alert">
              {inputError}
            </p>
          )}
        </div>
      </div>

      {result && !result.error && (
        <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Result</Badge>
            <h3 className="text-xl font-bold text-slate-800">
              {result.molarMass.toFixed(3)} g/mol
            </h3>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-700">Element Breakdown:</h4>
            <div className="grid gap-2">
              {result.breakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">{item.element}</Badge>
                    <span className="text-slate-600">
                      {item.count > 1 ? `${item.count} atoms` : "1 atom"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.totalMass.toFixed(3)} g/mol</div>
                    <div className="text-sm text-slate-500">
                      {item.atomicMass.toFixed(3)} × {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700">Step-by-Step Working:</h4>
            <div className="space-y-1" role="list">
              {result.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-slate-600"
                  role="listitem"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="font-mono">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <p className="text-red-600 font-medium">Error: {result.error}</p>
          <p className="text-red-500 text-sm mt-1">Please check your chemical formula and try again.</p>
        </div>
      )}
    </div>
  );
};

export default MolarMassCalculator;
