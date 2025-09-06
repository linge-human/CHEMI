import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const atomicMasses = {
    H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.180,
    Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948, K: 39.098, Ca: 40.078,
    Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38,
    Ga: 69.723, Ge: 72.630, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
    Nb: 92.906, Mo: 95.95, Tc: 98, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71,
    Sb: 121.76, Te: 127.60, I: 126.90, Xe: 131.29, Cs: 132.91, Ba: 137.33, La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24,
    Pm: 145, Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.50, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05,
    Lu: 174.97, Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59,
    Tl: 204.38, Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226, Ac: 227, Th: 232.04, Pa: 231.04, U: 238.03,
    Np: 237, Pu: 244, Am: 243, Cm: 247, Bk: 247, Cf: 251, Es: 252, Fm: 257, Md: 258, No: 259, Lr: 262, Rf: 267, Db: 268,
    Sg: 269, Bh: 270, Hs: 277, Mt: 278, Ds: 281, Rg: 282, Cn: 285, Nh: 286, Fl: 289, Mc: 290, Lv: 293, Ts: 294, Og: 294
};

const Fraction = ({ numerator, denominator }) => (
    <div className="inline-flex flex-col text-center text-sm">
        <span>{numerator}</span>
        <span className="w-full border-t border-current"></span>
        <span>{denominator}</span>
    </div>
);

export default function MolarMassCalculator({ inputs, result, onUpdate }) {
    const [formula, setFormula] = useState(inputs.formula || "");
    const [mass, setMass] = useState(inputs.mass || "");
    const [moles, setMoles] = useState(inputs.moles || "");
    const [molarMass, setMolarMass] = useState(inputs.molarMass || "");
    const [precision, setPrecision] = useState(inputs.precision || 3);
    const [unknown, setUnknown] = useState(inputs.unknown || 'mass');
    const [isCalculating, setIsCalculating] = useState(false);

    const parseFormula = (f) => {
        const elements = f.match(/[A-Z][a-z]*\d*/g);
        if (!elements) return null;
        const elementMap = new Map();
        for (const el of elements) {
            const match = el.match(/([A-Z][a-z]*)(\d*)/);
            const symbol = match[1];
            const count = parseInt(match[2] || "1", 10);
            if (atomicMasses[symbol]) {
                elementMap.set(symbol, (elementMap.get(symbol) || 0) + count);
            } else {
                throw new Error(`Invalid element: ${symbol}`);
            }
        }
        return elementMap;
    };

    const calculateMolarMass = useCallback(() => {
        if (!formula.trim()) return { molarMass: 0, breakdown: [] };
        const elements = parseFormula(formula.replace(/\s/g, ''));
        let totalMass = 0;
        const breakdown = [];
        for (const [symbol, count] of elements.entries()) {
            const mass = atomicMasses[symbol] * count;
            totalMass += mass;
            breakdown.push({ symbol, count, mass });
        }
        return { molarMass: totalMass, breakdown };
    }, [formula]);

    const handleCalculate = useCallback(() => {
        setIsCalculating(true);
        let calculatedMass = 0, calculatedMoles = 0, calculatedMolarMass = 0;
        let work = null;

        const { molarMass: mmFromFormula, breakdown } = calculateMolarMass();
        const finalMolarMass = mmFromFormula || parseFloat(molarMass);
        
        if (isNaN(finalMolarMass) || finalMolarMass <= 0) {
            setIsCalculating(false);
            return;
        }

        const massValue = parseFloat(mass);
        const molesValue = parseFloat(moles);

        if (unknown === 'mass' && !isNaN(molesValue) && finalMolarMass > 0) {
            calculatedMass = molesValue * finalMolarMass;
            work = `mass = moles × M = ${molesValue} × ${finalMolarMass.toFixed(precision)} = ${calculatedMass.toFixed(precision)} g`;
        } else if (unknown === 'moles' && !isNaN(massValue) && finalMolarMass > 0) {
            calculatedMoles = massValue / finalMolarMass;
            work = { numerator: `mass = ${massValue} g`, denominator: `M = ${finalMolarMass.toFixed(precision)} g/mol` };
        } else if (unknown === 'molarMass' && !isNaN(massValue) && !isNaN(molesValue) && molesValue > 0) {
            calculatedMolarMass = massValue / molesValue;
            work = { numerator: `mass = ${massValue} g`, denominator: `moles = ${molesValue} mol` };
        }
        
        onUpdate(
            { formula, mass, moles, molarMass: mmFromFormula || molarMass, precision, unknown },
            { mass: calculatedMass, moles: calculatedMoles, molarMass: calculatedMolarMass || mmFromFormula, breakdown, work }
        );

        setTimeout(() => setIsCalculating(false), 300);
    }, [mass, moles, molarMass, formula, unknown, precision, onUpdate, calculateMolarMass]);

    useEffect(() => {
        const handleKeyPress = (e) => { if (e.key === 'Enter') handleCalculate(); };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleCalculate]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`mass-${formula}`}>Mass (g)</Label>
                    <Input id={`mass-${formula}`} type="number" placeholder="e.g., 18.02" value={mass} onChange={e => { setMass(e.target.value); setUnknown('mass'); }} disabled={unknown === 'mass'} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`moles-${formula}`}>Amount (mol)</Label>
                    <Input id={`moles-${formula}`} type="number" placeholder="e.g., 1" value={moles} onChange={e => { setMoles(e.target.value); setUnknown('moles'); }} disabled={unknown === 'moles'} />
                </div>
                <div className="space-y-2">
                    <Label>Molar Mass (g/mol)</Label>
                    <Tabs defaultValue="formula" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-9">
                            <TabsTrigger value="formula" className="text-xs px-1">Formula</TabsTrigger>
                            <TabsTrigger value="manual" className="text-xs px-1">Manual</TabsTrigger>
                        </TabsList>
                        <TabsContent value="formula">
                            <Input type="text" placeholder="e.g., H2O" value={formula} onChange={e => setFormula(e.target.value)} disabled={unknown === 'molarMass'} />
                        </TabsContent>
                        <TabsContent value="manual">
                             <Input type="number" placeholder="e.g., 18.015" value={molarMass} onChange={e => { setMolarMass(e.target.value); setUnknown('molarMass'); setFormula(''); }} disabled={unknown === 'molarMass'} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Label htmlFor="precision">Precision</Label>
                    <Select value={precision.toString()} onValueChange={val => setPrecision(Number(val))}>
                        <SelectTrigger className="w-20 h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5].map(p => <SelectItem key={p} value={p.toString()}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleCalculate} disabled={isCalculating}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate {unknown}
                </Button>
            </div>

            {result && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div className="flex justify-between items-center">
                         <h4 className="font-bold text-lg">Result</h4>
                         <Badge variant="secondary">
                            {unknown === 'mass' && `${result.mass.toFixed(precision)} g`}
                            {unknown === 'moles' && `${result.moles.toFixed(precision)} mol`}
                            {unknown === 'molarMass' && `${(result.molarMass).toFixed(precision)} g/mol`}
                        </Badge>
                    </div>

                    {result.breakdown && result.breakdown.length > 0 && (
                        <div>
                            <h5 className="font-semibold mb-2">Molar Mass Breakdown:</h5>
                            <div className="flex flex-wrap gap-2">
                                {result.breakdown.map((el, i) => (
                                    <Badge key={i} variant="outline">{el.symbol}{el.count > 1 && el.count}: {el.mass.toFixed(precision)}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {result.work && (
                         <div>
                            <h5 className="font-semibold mb-2">Working Out:</h5>
                            <div className="bg-muted p-3 rounded-md text-sm font-mono">
                                {typeof result.work === 'string' ? result.work : (
                                    <div className="flex items-center gap-2">
                                        <span>n = </span>
                                        <Fraction numerator={result.work.numerator} denominator={result.work.denominator} />
                                        <span> = {result.moles.toFixed(precision)} mol</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
