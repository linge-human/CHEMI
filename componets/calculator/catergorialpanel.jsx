import React from 'react';

const categories = [
    {
        name: 'Atomic Structure',
        calculators: ['Molar Mass', 'Percent Composition', 'Solubility Check', 'Compound Naming']
    },
    {
        name: 'Stoichiometry',
        calculators: ['Molarity', 'Stoichiometry']
    },
    {
        name: 'Gas Laws',
        calculators: ['Gas Law']
    },
    {
        name: 'Solutions & pH',
        calculators: ['pH']
    }
];

export default function CategoryPanel({ onAddCalculation }) {
    return (
        <div className="bg-card p-6 rounded-xl shadow-md border border-border">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Add a Calculation</h2>
            <div className="space-y-6">
                {categories.map(category => (
                    <div key={category.name}>
                        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">{category.name}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {category.calculators.map(calcName => (
                                <button
                                    key={calcName}
                                    onClick={() => onAddCalculation(calcName)}
                                    className="w-full bg-secondary text-secondary-foreground font-semibold py-2 px-3 rounded-md hover:bg-secondary/80 transition-colors text-sm text-left"
                                >
                                    {calcName}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
