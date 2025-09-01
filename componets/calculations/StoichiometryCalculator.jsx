import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Type definitions for better type safety
interface Inputs {
  givenMoles: string;
  givenCoeff: string;
  wantedCoeff: string;
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

export default function StoichiometryCalculator({
  inputs,
  result,
  onUpdate,
}: StoichiometryCalculatorProps) {
  const [givenMoles, setGivenMoles] = useState(inputs.givenMoles || "");
  const [givenCoeff, setGivenCoeff] = useState(inputs.givenCoeff || "");
  const [wantedCoeff, setWantedCoeff] = useState(inputs.wantedCoeff || "");
  const [isCalculating, setIsCalculating] = useState(false);

  // Validate inputs
  const isValidInput = useMemo(() => {
    const moles = parseFloat(givenMoles);
    const givenC = parseFloat(givenCoeff);
    const wantedC = parseFloat(wantedCoeff);
    return (
      !isNaN(moles) &&
      !isNaN(givenC) &&
      !isNaN(wantedC) &&
      moles > 0 &&
      givenC > 0 &&
      wantedC > 0
    );
  }, [givenMoles, givenCoeff, wantedCoeff]);

  const calculate = useCallback(() => {
    setIsCalculating(true);

    setTimeout(() => {
      try {
        const steps: string[] = [];
        const givenMol = parseFloat(givenMoles);
        const givenC = parseFloat(givenCoeff);
        const wantedC = parseFloat(wantedCoeff);

        // Input validation
        if (!isValidInput) {
          throw new Error("Please provide positive numerical values");
        }

        steps.push("Given:");
        steps.push(`Amount of given substance: ${givenMol.toFixed(3)} mol`);
        steps.push(`Coefficient of given substance: ${givenC}`);
        steps.push(`Coefficient of wanted substance: ${wantedC}`);
        steps.push("");
        steps.push("Calculation:");
        steps.push(
          `${givenMol.toFixed(3)} mol × (${wantedC} mol wanted / ${givenC} mol given)`
        );

        const ratio = wantedC / givenC;
        const wantedMoles = givenMol * ratio;

        steps.push(`= ${givenMol.toFixed(3)} × ${ratio.toFixed(3)}`);
        steps.push(`= ${wantedMoles.toFixed(3)} mol of wanted substance`);

        onUpdate({
          inputs: { givenMoles, givenCoeff, wantedCoeff },
          result: { wantedMoles, ratio, steps },
        });
      } catch (error) {
        onUpdate({
          inputs: { givenMoles, givenCoeff, wantedCoeff },
          result: { error: error instanceof Error ? error.message : "Calculation error" },
        });
      } finally {
        setIsCalculating(false);
      }
    }, 300); // Reduced timeout for better UX
  }, [givenMoles, givenCoeff, wantedCoeff, onUpdate, isValidInput]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValidInput) {
      calculate();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-orange-800">
          Stoichiometry Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="givenMoles">Given Amount (mol)</Label>
            <Input
              id="givenMoles"
              type="number"
              step="0.001"
              min="0"
              value={givenMoles}
              onChange={(e) => setGivenMoles(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter moles of known substance"
              className="border-slate-200"
              aria-invalid={!isValidInput && givenMoles !== ""}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="givenCoeff">Given Coefficient</Label>
              <Input
                id="givenCoeff"
                type="number"
                step="1"
                min="0"
                value={givenCoeff}
                onChange={(e) => setGivenCoeff(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter coefficient"
                className="border-slate-200"
                aria-invalid={!isValidInput && givenCoeff !== ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wantedCoeff">Wanted Coefficient</Label>
              <Input
                id="wantedCoeff"
                type="number"
                step="1"
                min="0"
                value={wantedCoeff}
                onChange={(e) => setWantedCoeff(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter coefficient"
                className="border-slate-200"
                aria-invalid={!isValidInput && wantedCoeff !== ""}
              />
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

        <div className="flex justify-center">
          <Button
            onClick={calculate}
            disabled={isCalculating || !isValidInput}
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

        {result?.wantedMoles && !result.error && (
          <div className="space-y-4 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                Result
              </Badge>
              <h3 className="text-2xl font-bold text-slate-800">
                {result.wantedMoles.toFixed(3)} mol
              </h3>
            </div>

            <div className="p-4 bg-white rounded-lg border border-orange-100">
              <div className="text-center">
                <div className="text-lg font-bold text-orange-800">
                  Stoichiometric Ratio: {result.ratio?.toFixed(3)}:1
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  For every 1 mol of given substance, you get{" "}
                  {result.ratio?.toFixed(3)} mol of wanted substance
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-700">Step-by-Step Solution:</h4>
              <div className="space-y-1">
                {result.steps?.map((step, index) => (
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

        {result?.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
