import React from "react";
import { Button } from "@/components/ui/button";
import CalculationBox from "./CalculationBox";
import { XCircle } from "lucide-react";

export default function CalculationWorkspace({ calculationBlocks, functions, onRemoveCalculation, onClearAll }) {

  return (
    <div className="flex-1 p-4 md:p-7 bg-white">
      {calculationBlocks.length > 0 && (
        <div className="flex justify-end mb-4">
          <Button variant="destructive" onClick={onClearAll}>
            <XCircle className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}
      <div className="flex flex-wrap gap-7 justify-start items-start">
        {calculationBlocks.map((block) => {
          const calculation = functions.find(fn => fn.id === block.functionId);
          if (!calculation) return null;
          return (
            <CalculationBox
              key={block.id}
              blockId={block.id}
              functionId={calculation.id}
              functionName={calculation.name}
              onRemove={onRemoveCalculation}
            />
          );
        })}
        
        {calculationBlocks.length === 0 && (
          <div className="flex items-center justify-center w-full h-64 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">🧪</div>
              <p className="text-lg">Select a calculation from the left panel to get started.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
