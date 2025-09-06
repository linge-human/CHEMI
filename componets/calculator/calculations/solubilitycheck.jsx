import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const solubilityRules = {
    soluble: [
        { ions: ['NO3-'], exception: [] },
        { ions: ['CH3COO-'], exception: [] },
        { ions: ['ClO3-'], exception: [] },
        { ions: ['Cl-', 'Br-', 'I-'], exception: ['Ag+', 'Pb2+', 'Hg2^2+'] },
        { ions: ['SO4^2-'], exception: ['Sr2+', 'Ba2+', 'Pb2+', 'Ag+', 'Ca2+'] },
        { ions: ['NH4+'], exception: [] },
        { ions: ['Li+', 'Na+', 'K+', 'Rb+', 'Cs+'], exception: [] } // Group 1
    ],
    insoluble: [
        { ions: ['S2-'], exception: ['Li+', 'Na+', 'K+', 'Rb+', 'Cs+', 'NH4+', 'Ca2+', 'Sr2+', 'Ba2+'] },
        { ions: ['CO3^2-'], exception: ['Li+', 'Na+', 'K+', 'Rb+', 'Cs+', 'NH4+'] },
        { ions: ['PO4^3-'], exception: ['Li+', 'Na+', 'K+', 'Rb+', 'Cs+', 'NH4+'] },
        { ions: ['OH-'], exception: ['Li+', 'Na+', 'K+', 'Rb+', 'Cs+', 'NH4+', 'Ca2+', 'Sr2+', 'Ba2+'] }
    ]
};

const commonIons = {
    // Cations
    'H+': 'Hydrogen', 'Li+': 'Lithium', 'Na+': 'Sodium', 'K+': 'Potassium', 'Rb+': 'Rubidium', 'Cs+': 'Caesium',
    'Mg2+': 'Magnesium', 'Ca2+': 'Calcium', 'Sr2+': 'Strontium', 'Ba2+': 'Barium', 'Al3+': 'Aluminium',
    'NH4+': 'Ammonium', 'Fe2+': 'Iron(II)', 'Fe3+': 'Iron(III)', 'Cu+': 'Copper(I)', 'Cu2+': 'Copper(II)',
    'Zn2+': 'Zinc', 'Ag+': 'Silver', 'Pb2+': 'Lead(II)', 'Hg2^2+': 'Mercury(I)',
    
    // Anions
    'F-': 'Fluoride', 'Cl-': 'Chloride', 'Br-': 'Bromide', 'I-': 'Iodide', 'O2-': 'Oxide', 'S2-': 'Sulfide',
    'OH-': 'Hydroxide', 'CN-': 'Cyanide', 'SO4^2-': 'Sulfate', 'CO3^2-': 'Carbonate', 'PO4^3-': 'Phosphate',
    'NO3-': 'Nitrate', 'NO2-': 'Nitrite', 'CH3COO-': 'Acetate', 'ClO3-': 'Chlorate'
};

const checkSolubility = (compound) => {
    // Basic parser to find a cation and an anion. This is a simplification.
    const ions = Object.keys(commonIons);
    let cation = null;
    let anion = null;

    // A very naive parser. Looks for known ions in the formula.
    for (const ion of ions) {
        if (compound.includes(ion.replace(/\^?\d?[\+\-]/, ''))) {
            if (ion.includes('+')) {
                cation = ion;
            } else if (ion.includes('-')) {
                anion = ion;
            }
        }
    }

    if (!cation || !anion) {
        return { result: 'Unknown', reason: 'Could not identify a valid cation and anion in the formula.' };
    }

    // Check soluble rules
    for (const rule of solubilityRules.soluble) {
        if (rule.ions.includes(anion)) {
            if (rule.exception.includes(cation)) {
                return { result: 'Insoluble', reason: `${commonIons[anion]}s are usually soluble, but ${commonIons[cation]} is an exception.` };
            }
            return { result: 'Soluble', reason: `Compounds containing ${commonIons[anion]} are generally soluble.` };
        }
        if (rule.ions.includes(cation)) {
             return { result: 'Soluble', reason: `Compounds containing ${commonIons[cation]} (Group 1 / Ammonium) are generally soluble.` };
        }
    }

    // Check insoluble rules
    for (const rule of solubilityRules.insoluble) {
        if (rule.ions.includes(anion)) {
            if (rule.exception.includes(cation)) {
                return { result: 'Soluble', reason: `${commonIons[anion]}s are usually insoluble, but ${commonIons[cation]} is an exception.` };
            }
            return { result: 'Insoluble', reason: `Compounds containing ${commonIons[anion]} are generally insoluble.` };
        }
    }

    return { result: 'Unknown', reason: 'Could not determine solubility based on the provided rules.' };
};

export default function SolubilityCheck({ inputs, result, onUpdate }) {
    const [compound, setCompound] = useState(inputs.compound || '');

    const handleCheck = useCallback(() => {
        if (!compound) return;
        const solubilityResult = checkSolubility(compound);
        onUpdate({ compound }, solubilityResult);
    }, [compound, onUpdate]);

    useEffect(() => {
        const handleKeyPress = (e) => { if (e.key === 'Enter') handleCheck(); };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleCheck]);

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="compound-input">Compound Formula</Label>
                <div className="flex gap-2 mt-1">
                    <Input
                        id="compound-input"
                        placeholder="e.g., AgCl, Na2SO4"
                        value={compound}
                        onChange={(e) => setCompound(e.target.value)}
                    />
                    <Button onClick={handleCheck}>Check</Button>
                </div>
            </div>

            {result && (
                <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-lg">Result</h4>
                        <Badge variant={result.result === 'Soluble' ? 'default' : result.result === 'Insoluble' ? 'destructive' : 'secondary'}>
                            {result.result}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{result.reason}</p>
                </div>
            )}
        </div>
    );
}
