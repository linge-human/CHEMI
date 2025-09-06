import React from 'react';
import MolarMassCalculator from './calculations/MolarMassCalculator';
import PercentCompositionCalculator from './calculations/PercentCompositionCalculator';
import SolubilityCheck from './calculations/SolubilityCheck';
import CompoundNamer from './calculations/CompoundNamer';
import MolarityCalculator from './calculations/MolarityCalculator';
import StoichiometryCalculator from './calculations/StoichiometryCalculator';
import GasLawCalculator from './calculations/GasLawCalculator';
import PhCalculator from './calculations/PhCalculator';
import CalculationBox from './CalculationBox';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const calculationComponents = {
    'Molar Mass': MolarMassCalculator,
    'Percent Composition': PercentCompositionCalculator,
    'Solubility Check': SolubilityCheck,
    'Compound Naming': CompoundNamer,
    'Molarity': MolarityCalculator,
    'Stoichiometry': StoichiometryCalculator,
    'Gas Law': GasLawCalculator,
    'pH': PhCalculator
};

export default function CalculationWorkspace({ calculations, updateCalculation, removeCalculation, setCalculations }) {

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setCalculations((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={calculations.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-6">
                    {calculations.map(calc => {
                        const CalculationComponent = calculationComponents[calc.type];
                        return (
                            <CalculationBox
                                key={calc.id}
                                id={calc.id}
                                type={calc.type}
                                onRemove={() => removeCalculation(calc.id)}
                            >
                                {CalculationComponent && (
                                    <CalculationComponent
                                        inputs={calc.inputs}
                                        result={calc.result}
                                        onUpdate={(newInputs, newResult) => updateCalculation(calc.id, newInputs, newResult)}
                                    />
                                )}
                            </CalculationBox>
                        );
                    })}
                </div>
            </SortableContext>
        </DndContext>
    );
}
