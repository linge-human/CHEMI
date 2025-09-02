import React, { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

// ... (atomicMasses and ionCharges constants remain the same) ...
const atomicMasses = {
  H: 1.008, He: 4.003, Li: 6.941, Be: 9.012, B: 10.811, C: 12.011, N: 14.007, O: 15.999,
  F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.086, P: 30.974, S: 32.065,
  Cl: 35.453, Ar: 39.948, K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996,
  Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723, Ge: 72.630,
  As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798, Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224,
  Nb: 92.906, Mo: 95.95, Tc: 98, Ru: 101.07, Rh: 102.906, Pd: 106.42, Ag: 107.868, Cd: 112.414,
  In: 114.818, Sn: 118.711, Sb: 121.760, Te: 127.60, I: 126.904, Xe: 131.293, Cs: 132.905,
  Ba: 137.327, La: 138.905, Ce: 140.116, Pr: 140.908, Nd: 144.242, Pm: 145, Sm: 150.36,
  Eu: 151.964, Gd: 157.25, Tb: 158.925, Dy: 162.500, Ho: 164.930, Er: 167.259, Tm: 168.934,
  Yb: 173.045, Lu: 174.967, Hf: 178.49, Ta: 180.948, W: 183.84, Re: 186.207, Os: 190.23,
  Ir: 192.217, Pt: 195.084, Au: 196.967, Hg: 200.592, Tl: 204.38, Pb: 207.2, Bi: 208.980,
  Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226, Ac: 227, Th: 232.038, Pa: 231.036, U: 238.029,
  Np: 237, Pu: 244, Am: 243, Cm: 247, Bk: 247, Cf: 251, Es: 252, Fm: 257, Md: 258, No: 259,
  Lr: 262, Rf: 267, Db: 270, Sg: 271, Bh: 270, Hs: 277, Mt: 278, Ds: 281, Rg: 282, Cn: 285,
  Nh: 286, Fl: 289, Mc: 290, Lv: 293, Ts: 294, Og: 294,
  // Common polyatomic ions
  NH4: 18.04, NO3: 62.00, SO4: 96.06, CO3: 60.01, PO4: 94.97, OH: 17.01, ClO3: 83.45, ClO4: 99.45
};

const ionCharges = {
  H: "+1", Li: "+1", Na: "+1", K: "+1", Rb: "+1", Cs: "+1", Fr: "+1",
  Be: "+2", Mg: "+2", Ca: "+2", Sr: "+2", Ba: "+2", Ra: "+2",
  Al: "+3", Ga: "+3", In: "+3",
  F: "-1", Cl: "-1", Br: "-1", I: "-1", At: "-1",
  O: "-2", S: "-2", Se: "-2", Te: "-2",
  N: "-3", P: "-3", As: "-3",
  Fe: "+2, +3", Cu: "+1, +2", Zn: "+2", Ag: "+1", Sn: "+2, +4", Pb: "+2, +4",
  Cr: "+2, +3, +6", Mn: "+2, +3, +4, +6, +7", Co: "+2, +3", Ni: "+2, +3",
  // Polyatomic ions
  NH4: "+1", OH: "-1", NO3: "-1", SO4: "-2", CO3: "-2", PO4: "-3",
  ClO3: "-1", ClO4: "-1", SO3: "-2", NO2: "-1", HCO3: "-1", HSO4: "-1"
};


export default function CalculationBox({ blockId, functionId, functionName, onRemove }) {
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState("");
  const [workingOut, setWorkingOut] = useState("");
  const [showWorking, setShowWorking] = useState(false);

  // ... (updateInput, parseFormula, getMolarMassFromFormula, and calculate functions remain largely the same) ...
  const updateInput = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const parseFormula = (formula) => {
    const elements = {};
    const regex = /([A-Z][a-z]?|NH4|NO3|SO4|CO3|PO4|OH|ClO3|ClO4|SO3|NO2|HCO3|HSO4)(\d*)/g;
    let match;
    
    while ((match = regex.exec(formula)) !== null) {
      const element = match[1];
      const count = match[2] === "" ? 1 : parseInt(match[2]);
      elements[element] = (elements[element] || 0) + count;
    }
    
    return elements;
  };

  const getMolarMassFromFormula = (formula) => {
    const elements = parseFormula(formula);
    let totalMass = 0;
    
    for (const [element, count] of Object.entries(elements)) {
      if (atomicMasses[element]) {
        totalMass += atomicMasses[element] * count;
      }
    }
    
    return totalMass;
  };

  const calculate = () => {
    let resultText = "";
    let working = "";

    try {
      switch (functionId) {
        case "mole":
          const mass = parseFloat(inputs.mass || 0);
          const formula = inputs.formula || "";
          let molarMass = inputs.molarMass ? parseFloat(inputs.molarMass) : 0;
          
          if (formula && !molarMass) {
            molarMass = getMolarMassFromFormula(formula);
          }
          
          if (mass && molarMass) {
            const moles = mass / molarMass;
            resultText = `${moles.toFixed(4)} mol`;
            
            if (formula && !inputs.molarMass) {
              working = `Given: ${mass} g of ${formula}\n`;
              working += `Step 1: Calculate molar mass of ${formula}\n`;
              const elements = parseFormula(formula);
              for (const [element, count] of Object.entries(elements)) {
                if (atomicMasses[element]) {
                  const elementMass = atomicMasses[element] * count;
                  working += `  ${element}: ${atomicMasses[element]} × ${count} = ${elementMass.toFixed(3)} g/mol\n`;
                }
              }
              working += `  Total molar mass = ${molarMass.toFixed(3)} g/mol\n\n`;
              working += `Step 2: Calculate moles\n`;
              working += `  n = m ÷ M\n`;
              working += `  n = ${mass} g ÷ ${molarMass.toFixed(3)} g/mol\n`;
              working += `  n = ${moles.toFixed(4)} mol`;
            } else {
              working = `Given:\n  Mass = ${mass} g\n  Molar mass = ${molarMass} g/mol\n\n`;
              working += `Formula: n = m ÷ M\n`;
              working += `n = ${mass} ÷ ${molarMass} = ${moles.toFixed(4)} mol`;
            }
          }
          break;

        case "mass":
          const mol = parseFloat(inputs.moles || 0);
          const massFormula = inputs.formula || "";
          let mm = inputs.molarMass ? parseFloat(inputs.molarMass) : 0;

          if (massFormula && !mm) {
            mm = getMolarMassFromFormula(massFormula);
          }
          
          if (mol && mm) {
            const calculatedMass = mol * mm;
            resultText = `${calculatedMass.toFixed(3)} g`;
            
            if (massFormula && !inputs.molarMass) {
              working = `Given: ${mol} mol of ${massFormula}\n\n`;
              working += `Step 1: Calculate molar mass of ${massFormula}\n`;
              const elements = parseFormula(massFormula);
              for (const [element, count] of Object.entries(elements)) {
                if (atomicMasses[element]) {
                  const elementMass = atomicMasses[element] * count;
                  working += `  ${element}: ${atomicMasses[element]} × ${count} = ${elementMass.toFixed(3)} g/mol\n`;
                }
              }
              working += `  Total molar mass = ${mm.toFixed(3)} g/mol\n\n`;
              working += `Step 2: Calculate mass\n`;
              working += `  m = n × M\n`;
              working += `  m = ${mol} mol × ${mm.toFixed(3)} g/mol\n`;
              working += `  m = ${calculatedMass.toFixed(3)} g`;
            } else {
              working = `Given:\n  Moles = ${mol} mol\n  Molar mass = ${mm} g/mol\n\n`;
              working += `Formula: m = n × M\n`;
              working += `m = ${mol} × ${mm} = ${calculatedMass.toFixed(3)} g`;
            }
          }
          break;

        case "molarity":
          const molesSolute = parseFloat(inputs.moles || 0);
          const volumeL = parseFloat(inputs.volume || 0) / 1000; // Convert mL to L
          if (molesSolute && volumeL) {
            const molarity = molesSolute / volumeL;
            resultText = `${molarity.toFixed(4)} M`;
            working = `Given:\n  Moles of solute = ${molesSolute} mol\n  Volume = ${inputs.volume} mL = ${volumeL.toFixed(3)} L\n\n`;
            working += `Formula: M = n ÷ V\n`;
            working += `M = ${molesSolute} mol ÷ ${volumeL.toFixed(3)} L\n`;
            working += `M = ${molarity.toFixed(4)} M`;
          }
          break;

        case "dilution":
          const M1 = parseFloat(inputs.initialMolarity || 0);
          const V1 = parseFloat(inputs.initialVolume || 0);
          const V2 = parseFloat(inputs.finalVolume || 0);
          
          if (M1 && V1 && V2) {
            const M2 = (M1 * V1) / V2;
            resultText = `${M2.toFixed(4)} M`;
            working = `Given:\n  M₁ = ${M1} M\n  V₁ = ${V1} L\n  V₂ = ${V2} L\n\n`;
            working += `Using dilution formula: M₁V₁ = M₂V₂\n`;
            working += `(${M1})(${V1}) = M₂(${V2})\n`;
            working += `M₂ = (${M1} × ${V1}) ÷ ${V2}\n`;
            working += `M₂ = ${M2.toFixed(4)} M`;
          }
          break;

        case "ph":
          const hConc = parseFloat(inputs.hConcentration || 0);
          if (hConc > 0) {
            const ph = -Math.log10(hConc);
            const poh = 14 - ph;
            const ohConc = Math.pow(10, -poh);
            
            resultText = `pH = ${ph.toFixed(2)}`;
            working = `Given: [H⁺] = ${hConc} M\n\n`;
            working += `Step 1: Calculate pH\n`;
            working += `pH = -log₁₀[H⁺]\n`;
            working += `pH = -log₁₀(${hConc})\n`;
            working += `pH = ${ph.toFixed(2)}\n\n`;
            working += `Step 2: Calculate pOH\n`;
            working += `pOH = 14 - pH = 14 - ${ph.toFixed(2)} = ${poh.toFixed(2)}\n\n`;
            working += `Step 3: Calculate [OH⁻]\n`;
            working += `[OH⁻] = 10^(-pOH) = 10^(-${poh.toFixed(2)})\n`;
            working += `[OH⁻] = ${ohConc.toExponential(2)} M`;
          }
          break;

        case "molar-mass":
          const mmFormula = inputs.formula || "";
          if (mmFormula) {
            const elements = parseFormula(mmFormula);
            let totalMass = 0;
            const breakdown = [];
            
            working = `Calculating molar mass of ${mmFormula}:\n\n`;
            
            for (const [element, count] of Object.entries(elements)) {
              if (atomicMasses[element]) {
                const mass = atomicMasses[element] * count;
                totalMass += mass;
                
                if (count === 1) {
                  breakdown.push(`${element}: ${atomicMasses[element].toFixed(3)} g/mol`);
                  working += `${element}: ${atomicMasses[element].toFixed(3)} g/mol\n`;
                } else {
                  breakdown.push(`${element}: ${atomicMasses[element].toFixed(3)} × ${count} = ${mass.toFixed(3)} g/mol`);
                  working += `${element}: ${atomicMasses[element].toFixed(3)} × ${count} = ${mass.toFixed(3)} g/mol\n`;
                }
              }
            }
            
            resultText = `${totalMass.toFixed(3)} g/mol`;
            working += `\nTotal molar mass = ${breakdown.map(b => b.split('=')[1] || b.split(':')[1]).join(' + ').replace(/g\/mol/g, '').trim().split(' + ').join(' + ')} g/mol\n`;
            working += `Total molar mass = ${totalMass.toFixed(3)} g/mol`;
          }
          break;

        case "percent-comp":
          const compFormula = inputs.formula || "";
          if (compFormula) {
            const elements = parseFormula(compFormula);
            let totalMass = 0;
            const compositions = [];
            
            // Calculate total mass
            for (const [element, count] of Object.entries(elements)) {
              if (atomicMasses[element]) {
                totalMass += atomicMasses[element] * count;
              }
            }
            
            working = `Percent composition of ${compFormula}:\n\n`;
            working += `Step 1: Calculate total molar mass\n`;
            for (const [element, count] of Object.entries(elements)) {
              if (atomicMasses[element]) {
                const elementMass = atomicMasses[element] * count;
                working += `${element}: ${atomicMasses[element]} × ${count} = ${elementMass.toFixed(3)} g/mol\n`;
              }
            }
            working += `Total = ${totalMass.toFixed(3)} g/mol\n\n`;
            
            working += `Step 2: Calculate percentages\n`;
            // Calculate percentages
            for (const [element, count] of Object.entries(elements)) {
              if (atomicMasses[element]) {
                const elementMass = atomicMasses[element] * count;
                const percent = (elementMass / totalMass * 100).toFixed(2);
                compositions.push(`${element}: ${percent}%`);
                working += `%${element} = (${elementMass.toFixed(3)} ÷ ${totalMass.toFixed(3)}) × 100% = ${percent}%\n`;
              }
            }
            
            resultText = compositions.join(', ');
          }
          break;

        case "percent-yield":
            const actual = parseFloat(inputs.actualYield || 0);
            const theoretical = parseFloat(inputs.theoreticalYield || 0);
            if (actual && theoretical) {
                const yieldPercent = (actual / theoretical) * 100;
                resultText = `${yieldPercent.toFixed(2)}%`;
                working = `Given:\n  Actual Yield = ${actual} g\n  Theoretical Yield = ${theoretical} g\n\n`;
                working += `Formula: % Yield = (Actual ÷ Theoretical) × 100%\n`;
                working += `% Yield = (${actual} ÷ ${theoretical}) × 100% = ${yieldPercent.toFixed(2)}%`;
            }
            break;

        case "temp":
          const celsius = parseFloat(inputs.celsius || "");
          if (!isNaN(celsius)) {
            const kelvin = celsius + 273.15;
            const fahrenheit = (celsius * 9/5) + 32;
            resultText = `${kelvin.toFixed(2)} K`;
            working = `Temperature conversions for ${celsius}°C:\n\n`;
            working += `Celsius to Kelvin:\nK = °C + 273.15\nK = ${celsius} + 273.15 = ${kelvin.toFixed(2)} K\n\n`;
            working += `Celsius to Fahrenheit:\n°F = (°C × 9/5) + 32\n°F = (${celsius} × 9/5) + 32 = ${fahrenheit.toFixed(1)}°F`;
          }
          break;

        case "gas-laws":
          const P = parseFloat(inputs.pressure || "");
          const V = parseFloat(inputs.volume || "");
          const n = parseFloat(inputs.moles || "");
          const T = parseFloat(inputs.temperature || "");
          const R = 0.0821; // L·atm/(mol·K)
          
          working = "Using Ideal Gas Law: PV = nRT\nR = 0.0821 L·atm/(mol·K)\n\n";
          
          // Count how many variables are provided
          const provided = [P, V, n, T].filter(val => !isNaN(val)).length;
          
          if (provided === 3) {
            const TK = !isNaN(T) ? T + 273.15 : null;
            
            if (isNaN(P) && !isNaN(V) && !isNaN(n) && !isNaN(T)) {
              // Solve for P
              const pressure = (n * R * TK) / V;
              resultText = `${pressure.toFixed(3)} atm`;
              working += `Given: V = ${V} L, n = ${n} mol, T = ${T}°C = ${TK.toFixed(2)} K\n\n`;
              working += `Solving for P:\nP = nRT ÷ V\n`;
              working += `P = (${n} × ${R} × ${TK.toFixed(2)}) ÷ ${V}\n`;
              working += `P = ${pressure.toFixed(3)} atm`;
            } else if (!isNaN(P) && isNaN(V) && !isNaN(n) && !isNaN(T)) {
              // Solve for V
              const volume = (n * R * TK) / P;
              resultText = `${volume.toFixed(3)} L`;
              working += `Given: P = ${P} atm, n = ${n} mol, T = ${T}°C = ${TK.toFixed(2)} K\n\n`;
              working += `Solving for V:\nV = nRT ÷ P\n`;
              working += `V = (${n} × ${R} × ${TK.toFixed(2)}) ÷ ${P}\n`;
              working += `V = ${volume.toFixed(3)} L`;
            } else if (!isNaN(P) && !isNaN(V) && isNaN(n) && !isNaN(T)) {
              // Solve for n
              const moles = (P * V) / (R * TK);
              resultText = `${moles.toFixed(3)} mol`;
              working += `Given: P = ${P} atm, V = ${V} L, T = ${T}°C = ${TK.toFixed(2)} K\n\n`;
              working += `Solving for n:\nn = PV ÷ RT\n`;
              working += `n = (${P} × ${V}) ÷ (${R} × ${TK.toFixed(2)})\n`;
              working += `n = ${moles.toFixed(3)} mol`;
            } else if (!isNaN(P) && !isNaN(V) && !isNaN(n) && isNaN(T)) {
              // Solve for T
              const tempK = (P * V) / (n * R);
              const tempC = tempK - 273.15;
              resultText = `${tempC.toFixed(1)}°C`;
              working += `Given: P = ${P} atm, V = ${V} L, n = ${n} mol\n\n`;
              working += `Solving for T:\nT = PV ÷ nR\n`;
              working += `T = (${P} × ${V}) ÷ (${n} × ${R})\n`;
              working += `T = ${tempK.toFixed(2)} K = ${tempC.toFixed(1)}°C`;
            }
          } else {
            resultText = "Enter exactly 3 values";
            working += "Please provide exactly 3 of the 4 variables (P, V, n, T) to solve for the fourth.";
          }
          break;

        default:
          resultText = "Calculation not implemented";
          working = "This calculation type is not yet implemented.";
      }
    } catch (error) {
      console.error("Calculation error:", error);
      resultText = "Error in calculation";
      working = "Please check your inputs and try again.";
    }

    setResult(resultText);
    setWorkingOut(working);
    setShowWorking(false);
  };
  const renderInputs = () => {
    switch (functionId) {
      case "mole":
        return (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Mass (g):</label>
              <input
                type="number"
                step="0.001"
                value={inputs.mass || ""}
                onChange={(e) => updateInput("mass", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="Enter mass"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Chemical Formula:</label>
              <input
                type="text"
                value={inputs.formula || ""}
                onChange={(e) => updateInput("formula", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="e.g. H2SO4, CaCO3"
              />
            </div>
            <div className="text-center text-sm text-gray-500">OR</div>
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Molar Mass (g/mol):</label>
              <input
                type="number"
                step="0.001"
                value={inputs.molarMass || ""}
                onChange={(e) => updateInput("molarMass", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="Enter molar mass"
              />
            </div>
          </div>
        );

      case "mass":
        return (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Moles (mol):</label>
              <input
                type="number"
                step="0.001"
                value={inputs.moles || ""}
                onChange={(e) => updateInput("moles", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="Enter moles"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Chemical Formula:</label>
              <input
                type="text"
                value={inputs.formula || ""}
                onChange={(e) => updateInput("formula", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="e.g. H2SO4, CaCO3"
              />
            </div>
            <div className="text-center text-sm text-gray-500">OR</div>
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Molar Mass (g/mol):</label>
              <input
                type="number"
                step="0.001"
                value={inputs.molarMass || ""}
                onChange={(e) => updateInput("molarMass", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="Enter molar mass"
              />
            </div>
          </div>
        );
      
      case "yield":
      case "percent-yield":
          return (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1.5 text-gray-700">Actual Yield (g):</label>
                <input
                  type="number"
                  step="0.001"
                  value={inputs.actualYield || ""}
                  onChange={(e) => updateInput("actualYield", e.target.value)}
                  className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                  placeholder="Enter actual yield"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1.5 text-gray-700">Theoretical Yield (g):</label>
                <input
                  type="number"
                  step="0.001"
                  value={inputs.theoreticalYield || ""}
                  onChange={(e) => updateInput("theoreticalYield", e.target.value)}
                  className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                  placeholder="Enter theoretical yield"
                />
              </div>
            </div>
          );

      case "molarity":
        return (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Moles of Solute (mol):</label>
              <input
                type="number"
                step="0.001"
                value={inputs.moles || ""}
                onChange={(e) => updateInput("moles", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="Enter moles"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Volume (mL):</label>
              <input
                type="number"
                step="0.1"
                value={inputs.volume || ""}
                onChange={(e) => updateInput("volume", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="Enter volume in mL"
              />
            </div>
          </div>
        );

      case "dilution":
        return (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Initial Molarity (M):</label>
              <input
                type="number"
                step="0.001"
                value={inputs.initialMolarity || ""}
                onChange={(e) => updateInput("initialMolarity", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="M₁"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Initial Volume (L):</label>
              <input
                type="number"
                step="0.001"
                value={inputs.initialVolume || ""}
                onChange={(e) => updateInput("initialVolume", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="V₁"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Final Volume (L):</label>
              <input
                type="number"
                step="0.001"
                value={inputs.finalVolume || ""}
                onChange={(e) => updateInput("finalVolume", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="V₂"
              />
            </div>
          </div>
        );

      case "ph":
        return (
          <div>
            <label className="block font-semibold mb-1.5 text-gray-700">[H⁺] Concentration (mol/L):</label>
            <input
              type="number"
              step="any"
              value={inputs.hConcentration || ""}
              onChange={(e) => updateInput("hConcentration", e.target.value)}
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
              placeholder="e.g. 0.001, 1e-5"
            />
          </div>
        );

      case "molar-mass":
      case "percent-comp":
        return (
          <div>
            <label className="block font-semibold mb-1.5 text-gray-700">Chemical Formula:</label>
            <input
              type="text"
              value={inputs.formula || ""}
              onChange={(e) => updateInput("formula", e.target.value)}
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
              placeholder="e.g. H2SO4, CaCO3, Ca(OH)2"
            />
          </div>
        );

      case "temp":
        return (
          <div>
            <label className="block font-semibold mb-1.5 text-gray-700">Temperature (°C):</label>
            <input
              type="number"
              step="0.1"
              value={inputs.celsius || ""}
              onChange={(e) => updateInput("celsius", e.target.value)}
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
              placeholder="Enter temperature in Celsius"
            />
          </div>
        );

      case "gas-laws":
        return (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Pressure (atm):</label>
              <input
                type="number"
                step="0.001"
                value={inputs.pressure || ""}
                onChange={(e) => updateInput("pressure", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="Leave blank to solve"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Volume (L):</label>
              <input
                type="number"
                step="0.001"
                value={inputs.volume || ""}
                onChange={(e) => updateInput("volume", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="Leave blank to solve"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Moles (mol):</label>
              <input
                type="number"
                step="0.001"
                value={inputs.moles || ""}
                onChange={(e) => updateInput("moles", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="Leave blank to solve"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1.5 text-gray-700">Temperature (°C):</label>
              <input
                type="number"
                step="0.1"
                value={inputs.temperature || ""}
                onChange={(e) => updateInput("temperature", e.target.value)}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-lg outline-none focus:border-gray-900 transition-colors"
                placeholder="Leave blank to solve"
              />
            </div>
            <p className="text-sm text-gray-500">Enter exactly 3 values to solve for the 4th</p>
          </div>
        );

      default:
        return <div className="text-gray-500">Calculation type not implemented.</div>;
    }
  };

  return (
    <div className="relative min-w-[340px] max-w-[500px] w-full bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-7">
      <button
        onClick={() => onRemove(blockId)}
        className="absolute top-2 left-2 w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 hover:text-red-800 transition-colors"
        aria-label="Remove calculation"
      >
        <X className="w-4 h-4" />
      </button>

      <h3 className="font-bold text-lg mb-4 text-gray-800 text-center">{functionName}</h3>
      
      {/* Inputs Section */}
      <div className="mb-4">
        {renderInputs()}
        
        <button
          onClick={calculate}
          className="w-full mt-4 px-4 py-2 bg-gray-900 text-white rounded font-medium hover:bg-gray-800 transition-colors"
        >
          Calculate
        </button>
      </div>
      
      {/* Result Section */}
      {result && (
        <div className="mb-4">
          <div className="p-3 bg-gray-100 rounded text-gray-800 font-bold text-lg border-l-4 border-gray-900">
            {result}
          </div>
        </div>
      )}

      {/* Working Out Section - Folds Down */}
      {workingOut && (
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowWorking(!showWorking)}
            className="flex items-center gap-2 text-gray-600 font-semibold text-sm mb-3 hover:text-gray-900 transition-colors"
          >
            {showWorking ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showWorking ? "Hide Working Out" : "Show Working Out"}
          </button>
          
          {showWorking && (
            <div className="bg-gray-50 p-4 rounded border-l-4 border-gray-900 text-sm text-gray-700 whitespace-pre-line font-mono">
              {workingOut}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
