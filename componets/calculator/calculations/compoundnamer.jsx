import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

const commonCompounds = {
    // Inorganic compounds
    'H2O': 'Water',
    'CO2': 'Carbon Dioxide',
    'O2': 'Oxygen',
    'N2': 'Nitrogen',
    'H2': 'Hydrogen',
    'NH3': 'Ammonia',
    'CH4': 'Methane',
    'HCl': 'Hydrochloric Acid',
    'H2SO4': 'Sulfuric Acid',
    'HNO3': 'Nitric Acid',
    'H3PO4': 'Phosphoric Acid',
    'CH3COOH': 'Acetic Acid (Ethanoic Acid)',
    'NaOH': 'Sodium Hydroxide',
    'KOH': 'Potassium Hydroxide',
    'CaCO3': 'Calcium Carbonate',
    'NaHCO3': 'Sodium Bicarbonate',
    'NaCl': 'Sodium Chloride (Salt)',
    'KCl': 'Potassium Chloride',
    'CaCl2': 'Calcium Chloride',
    'MgSO4': 'Magnesium Sulfate',
    'CuSO4': 'Copper(II) Sulfate',
    'FeSO4': 'Iron(II) Sulfate',
    'Fe2(SO4)3': 'Iron(III) Sulfate',
    'Na2CO3': 'Sodium Carbonate',
    'Na2SO4': 'Sodium Sulfate',
    'AgNO3': 'Silver Nitrate',
    'BaSO4': 'Barium Sulfate',
    'Pb(NO3)2': 'Lead(II) Nitrate',
    'Al2O3': 'Aluminum Oxide',
    'ZnO': 'Zinc Oxide',
    'CuO': 'Copper(II) Oxide',
    'Fe2O3': 'Iron(III) Oxide',
    // Organic compounds (simple, relevant to VCE)
    'C2H6': 'Ethane',
    'C3H8': 'Propane',
    'C4H10': 'Butane',
    'C5H12': 'Pentane',
    'C6H6': 'Benzene',
    'C2H4': 'Ethene',
    'C3H6': 'Propene',
    'C4H8': 'Butene',
    'C2H2': 'Ethyne',
    // Simple alcohols and carboxylic acids (VCE focus)
    'CH3OH': 'Methanol',
    'C2H5OH': 'Ethanol',
    'CH3COOH': 'Ethanoic Acid (Acetic Acid)',
    // Sugars
    'C6H12O6': 'Glucose',
    'C12H22O11': 'Sucrose',
    // Selected amino acids (as per VCE Data Book)
    'C3H7NO2': 'Alanine',
    'C5H11NO2': 'Leucine',
    'C6H14N4O2': 'Arginine',
    // Polyatomic ions, acids, and bases
    'NH4+': 'Ammonium Ion',
    'NO3-': 'Nitrate Ion',
    'NO2-': 'Nitrite Ion',
    'SO4^2-': 'Sulfate Ion',
    'CO3^2-': 'Carbonate Ion',
    'OH-': 'Hydroxide Ion',
    'PO4^3-': 'Phosphate Ion',
    'Cl-': 'Chloride Ion',
    'Br-': 'Bromide Ion',
    'I-': 'Iodide Ion',
    'MnO4-': 'Permanganate Ion',
    'Cr2O7^2-': 'Dichromate Ion',
    'CH3COO-': 'Ethanoate Ion',
    // Fatty acids (representative, VCE Data Book)
    'C16H32O2': 'Palmitic Acid',
    'C18H36O2': 'Stearic Acid',
    'C18H34O2': 'Oleic Acid',
    'C18H32O2': 'Linoleic Acid'
    // Feel free to add more based on teaching requirements
};

export default function CompoundNamer({ inputs, result, onUpdate }) {
    const [formula, setFormula] = useState(inputs.formula || '');

    const handleLookup = useCallback(() => {
        const cleanedFormula = formula.replace(/\s/g, '');
        const name = commonCompounds[cleanedFormula] || 'Name not found in common compounds list.';
        onUpdate({ formula }, { name });
    }, [formula, onUpdate]);

     useEffect(() => {
        const handleKeyPress = (e) => { if (e.key === 'Enter') handleLookup(); };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleLookup]);

    return (
        <div className="space-y-4">
             <div>
                <Label htmlFor="compound-formula-input">Compound Formula</Label>
                <div className="flex gap-2 mt-1">
                    <Input
                        id="compound-formula-input"
                        placeholder="e.g., H2O"
                        value={formula}
                        onChange={(e) => setFormula(e.target.value)}
                    />
                    <Button onClick={handleLookup}><Search className="w-4 h-4 mr-2" />Lookup</Button>
                </div>
            </div>
            
            {result && result.name && (
                <div className="pt-4 border-t border-border">
                     <div className="flex justify-between items-center">
                        <h4 className="font-bold text-lg">Common Name</h4>
                        <Badge variant="secondary">{result.name}</Badge>
                    </div>
                </div>
            )}
        </div>
    );
}
