import React, { useState } from 'react';
import { Search, Plus, Download, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const FormulaSheet = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddingFormula, setIsAddingFormula] = useState(false);
  const [newFormula, setNewFormula] = useState({ category: '', formula: '', variables: '' });

  const formulaCategories = [
    { 
      category: 'Stoichiometry & Moles', 
      items: [
        { formula: 'n = m / M', variables: 'n: moles (mol), m: mass (g), M: molar mass (g/mol)' },
        { formula: 'n = N / N_A', variables: 'n: moles (mol), N: number of particles, N_A: Avogadro constant (6.022 × 10²³ mol⁻¹)' },
        { formula: 'c = n / V', variables: 'c: concentration (mol/L), n: moles (mol), V: volume (L)' },
        { formula: 'n = V / V_m', variables: 'n: moles (mol), V: gas volume (L), V_m: molar volume (22.71 L/mol at STP)' },
        { formula: 'n₁/v₁ = n₂/v₂', variables: 'Stoichiometric ratio from balanced equations' },
        { formula: 'Theoretical yield = n_limiting × M_product', variables: 'Based on limiting reagent calculations' },
        { formula: '% Yield = (Actual yield / Theoretical yield) × 100', variables: 'Efficiency of chemical reactions' },
      ] 
    },
    { 
      category: 'Gas Laws', 
      items: [
        { formula: 'P₁V₁ = P₂V₂', variables: 'Boyle\'s Law (constant T, n). P: pressure, V: volume' },
        { formula: 'V₁/T₁ = V₂/T₂', variables: 'Charles\' Law (constant P, n). T: absolute temperature (K)' },
        { formula: 'P₁/T₁ = P₂/T₂', variables: 'Gay-Lussac\'s Law (constant V, n)' },
        { formula: 'P₁V₁/T₁ = P₂V₂/T₂', variables: 'Combined Gas Law (constant n)' },
        { formula: 'PV = nRT', variables: 'Ideal Gas Law. R = 8.314 J K⁻¹ mol⁻¹ or 0.0821 L atm K⁻¹ mol⁻¹' },
        { formula: 'V_m = 22.71 L/mol', variables: 'Molar volume at STP (0°C, 100 kPa)' },
        { formula: 'V_m = 24.79 L/mol', variables: 'Molar volume at SLC (25°C, 100 kPa)' },
      ] 
    },
    { 
      category: 'Thermochemistry', 
      items: [
        { formula: 'q = mcΔT', variables: 'q: heat energy (J), m: mass (g), c: specific heat capacity (J g⁻¹ K⁻¹), ΔT: temperature change (K)' },
        { formula: 'ΔH = -q / n', variables: 'ΔH: enthalpy change (kJ/mol), q: heat (kJ), n: moles' },
        { formula: 'ΔH_reaction = ΣΔH_f(products) - ΣΔH_f(reactants)', variables: 'Standard enthalpy of reaction from formation enthalpies' },
        { formula: 'ΔH_combustion = -q_combustion / n_fuel', variables: 'Enthalpy of combustion calculations' },
        { formula: 'Bond Energy = Energy required to break - Energy released to form', variables: 'Net energy change in bond breaking/forming' },
      ] 
    },
    {
      category: 'Solutions & Concentration',
      items: [
        { formula: 'c = n / V', variables: 'c: molarity (mol/L), n: moles solute, V: solution volume (L)' },
        { formula: 'n_solute = c × V', variables: 'Moles of solute from concentration and volume' },
        { formula: 'C₁V₁ = C₂V₂', variables: 'Dilution formula. C: concentration, V: volume' },
        { formula: 'n_total = n_solute + n_solvent', variables: 'Total moles in solution' },
        { formula: 'ppm = (mass_solute / mass_solution) × 10⁶', variables: 'Parts per million concentration' },
        { formula: '% w/w = (mass_solute / mass_solution) × 100', variables: 'Weight/weight percentage' },
        { formula: '% w/v = (mass_solute / volume_solution) × 100', variables: 'Weight/volume percentage' },
      ]
    },
    {
      category: 'Electrochemistry',
      items: [
        { formula: 'Q = It', variables: 'Q: charge (C), I: current (A), t: time (s)' },
        { formula: 'n(e⁻) = Q / F', variables: 'n(e⁻): moles of electrons, F: Faraday constant (96485 C/mol)' },
        { formula: 'E°_cell = E°_cathode - E°_anode', variables: 'Standard cell potential' },
        { formula: 'm = (Q × M) / (n × F)', variables: 'm: mass deposited (g), Q: charge (C), M: molar mass, n: electrons transferred' },
        { formula: 'ΔG° = -nFE°', variables: 'Gibbs free energy and cell potential relationship' },
      ]
    },
    {
      category: 'Acids & Bases',
      items: [
        { formula: 'pH = -log₁₀[H⁺]', variables: '[H⁺]: hydronium ion concentration (mol/L)' },
        { formula: 'pOH = -log₁₀[OH⁻]', variables: '[OH⁻]: hydroxide ion concentration (mol/L)' },
        { formula: 'pH + pOH = 14', variables: 'At 25°C for aqueous solutions' },
        { formula: 'K_w = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴', variables: 'Ion product of water at 25°C' },
        { formula: '[H⁺] = 10^(-pH)', variables: 'Calculate hydronium concentration from pH' },
        { formula: '[OH⁻] = 10^(-pOH)', variables: 'Calculate hydroxide concentration from pOH' },
        { formula: 'n_acid = c_acid × V_acid', variables: 'Moles of acid in titration calculations' },
        { formula: 'n_base = c_base × V_base', variables: 'Moles of base in titration calculations' },
      ]
    },
    {
      category: 'Organic Chemistry',
      items: [
        { formula: 'C_nH_{2n+2}', variables: 'General formula for alkanes' },
        { formula: 'C_nH_{2n}', variables: 'General formula for alkenes and cycloalkanes' },
        { formula: 'C_nH_{2n-2}', variables: 'General formula for alkynes' },
        { formula: 'Molecular formula = (Empirical formula)_n', variables: 'Relationship between molecular and empirical formulas' },
        { formula: '% Composition = (Mass of element / Molecular mass) × 100', variables: 'Percentage composition calculations' },
      ]
    }
  ];

  const constants = [
    { name: 'Avogadro Constant (N_A)', value: '6.022 × 10²³ mol⁻¹' },
    { name: 'Faraday Constant (F)', value: '96485 C mol⁻¹' },
    { name: 'Gas Constant (R)', value: '8.314 J K⁻¹ mol⁻¹' },
    { name: 'Gas Constant (R)', value: '0.0821 L atm K⁻¹ mol⁻¹' },
    { name: 'Molar Volume (STP)', value: '22.71 L mol⁻¹ at 0°C, 100 kPa' },
    { name: 'Molar Volume (SLC)', value: '24.79 L mol⁻¹ at 25°C, 100 kPa' },
    { name: 'Speed of Light (c)', value: '2.998 × 10⁸ m s⁻¹' },
    { name: 'Planck Constant (h)', value: '6.626 × 10⁻³⁴ J s' },
  ];
  
  const polyatomicIons = [
    { name: 'Ammonium', formula: 'NH₄⁺', charge: '+1' },
    { name: 'Hydroxide', formula: 'OH⁻', charge: '-1' },
    { name: 'Nitrate', formula: 'NO₃⁻', charge: '-1' },
    { name: 'Nitrite', formula: 'NO₂⁻', charge: '-1' },
    { name: 'Sulfate', formula: 'SO₄²⁻', charge: '-2' },
    { name: 'Sulfite', formula: 'SO₃²⁻', charge: '-2' },
    { name: 'Carbonate', formula: 'CO₃²⁻', charge: '-2' },
    { name: 'Hydrogen Carbonate', formula: 'HCO₃⁻', charge: '-1' },
    { name: 'Phosphate', formula: 'PO₄³⁻', charge: '-3' },
    { name: 'Hydrogen Phosphate', formula: 'HPO₄²⁻', charge: '-2' },
    { name: 'Dihydrogen Phosphate', formula: 'H₂PO₄⁻', charge: '-1' },
    { name: 'Perchlorate', formula: 'ClO₄⁻', charge: '-1' },
    { name: 'Chlorate', formula: 'ClO₃⁻', charge: '-1' },
    { name: 'Chlorite', formula: 'ClO₂⁻', charge: '-1' },
    { name: 'Hypochlorite', formula: 'ClO⁻', charge: '-1' },
    { name: 'Acetate', formula: 'CH₃COO⁻', charge: '-1' },
    { name: 'Cyanide', formula: 'CN⁻', charge: '-1' },
    { name: 'Permanganate', formula: 'MnO₄⁻', charge: '-1' },
    { name: 'Chromate', formula: 'CrO₄²⁻', charge: '-2' },
    { name: 'Dichromate', formula: 'Cr₂O₇²⁻', charge: '-2' },
  ];

  const organicNaming = [
    { carbons: '1', prefix: 'meth-', alkane: 'methane', alkene: 'methene', alkyne: 'methyne', alcohol: 'methanol' },
    { carbons: '2', prefix: 'eth-', alkane: 'ethane', alkene: 'ethene', alkyne: 'ethyne', alcohol: 'ethanol' },
    { carbons: '3', prefix: 'prop-', alkane: 'propane', alkene: 'propene', alkyne: 'propyne', alcohol: 'propanol' },
    { carbons: '4', prefix: 'but-', alkane: 'butane', alkene: 'butene', alkyne: 'butyne', alcohol: 'butanol' },
    { carbons: '5', prefix: 'pent-', alkane: 'pentane', alkene: 'pentene', alkyne: 'pentyne', alcohol: 'pentanol' },
    { carbons: '6', prefix: 'hex-', alkane: 'hexane', alkene: 'hexene', alkyne: 'hexyne', alcohol: 'hexanol' },
    { carbons: '7', prefix: 'hept-', alkane: 'heptane', alkene: 'heptene', alkyne: 'heptyne', alcohol: 'heptanol' },
    { carbons: '8', prefix: 'oct-', alkane: 'octane', alkene: 'octene', alkyne: 'octyne', alcohol: 'octanol' },
    { carbons: '9', prefix: 'non-', alkane: 'nonane', alkene: 'nonene', alkyne: 'nonyne', alcohol: 'nonanol' },
    { carbons: '10', prefix: 'dec-', alkane: 'decane', alkene: 'decene', alkyne: 'decyne', alcohol: 'decanol' },
  ];

  const functionalGroups = [
    { name: 'Alkane', suffix: '-ane', example: 'CH₃CH₃ → ethane', priority: 1 },
    { name: 'Alkene', suffix: '-ene', example: 'CH₂=CH₂ → ethene', priority: 2 },
    { name: 'Alkyne', suffix: '-yne', example: 'HC≡CH → ethyne', priority: 3 },
    { name: 'Alcohol', suffix: '-ol', example: 'CH₃OH → methanol', priority: 4 },
    { name: 'Aldehyde', suffix: '-al', example: 'CH₃CHO → ethanal', priority: 5 },
    { name: 'Ketone', suffix: '-one', example: 'CH₃COCH₃ → propanone', priority: 6 },
    { name: 'Carboxylic Acid', suffix: '-oic acid', example: 'CH₃COOH → ethanoic acid', priority: 7 },
    { name: 'Ester', suffix: '-oate', example: 'CH₃COOCH₃ → methyl ethanoate', priority: 8 },
    { name: 'Amine', suffix: '-amine', example: 'CH₃NH₂ → methanamine', priority: 9 },
    { name: 'Amide', suffix: '-amide', example: 'CH₃CONH₂ → ethanamide', priority: 10 },
    { name: 'Ether', suffix: 'ether', example: 'CH₃OCH₃ → dimethyl ether', priority: 11 },
    { name: 'Halogenoalkane', suffix: 'prefix + alkane', example: 'CH₃Cl → chloromethane', priority: 12 },
  ];

  const filteredFormulas = formulaCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      (selectedCategory === 'all' || cat.category === selectedCategory) &&
      (item.formula.toLowerCase().includes(searchTerm.toLowerCase()) || 
       item.variables.toLowerCase().includes(searchTerm.toLowerCase()) ||
       cat.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(cat => cat.items.length > 0);

  const categories = ['all', ...formulaCategories.map(cat => cat.category)];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white text-black">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">VCE Chemistry Reference</h1>
        <Button onClick={() => window.print()} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Print / Export PDF
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search formulas, variables, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Formulas */}
      <div className="space-y-8">
        {filteredFormulas.map((cat) => (
          <section key={cat.category} className="bg-gray-50 p-6 rounded-lg border">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">{cat.category}</h2>
            <div className="grid gap-4">
              {cat.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-4 bg-white rounded border">
                  <div className="flex-1">
                    <div className="font-mono text-lg font-bold text-blue-600 mb-2">{item.formula}</div>
                    <div className="text-gray-600">{item.variables}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Constants */}
        <section className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Physical Constants</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {constants.map((constant, index) => (
              <div key={index} className="flex justify-between p-3 bg-white rounded border">
                <span className="font-semibold">{constant.name}</span>
                <span className="font-mono text-blue-600">{constant.value}</span>
              </div>
            ))}
          </div>
        </section>
        
        {/* Polyatomic Ions */}
        <section className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Common Polyatomic Ions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {polyatomicIons.map((ion, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                <span className="font-semibold">{ion.name}</span>
                <div className="text-right">
                  <div className="font-mono text-blue-600">{ion.formula}</div>
                  <div className="text-sm text-gray-500">Charge: {ion.charge}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Organic Naming */}
        <section className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Organic Compound Naming (IUPAC)</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Carbon Chain Prefixes</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">Carbons</th>
                    <th className="border border-gray-300 p-2">Prefix</th>
                    <th className="border border-gray-300 p-2">Alkane</th>
                    <th className="border border-gray-300 p-2">Alkene</th>
                    <th className="border border-gray-300 p-2">Alkyne</th>
                    <th className="border border-gray-300 p-2">Alcohol</th>
                  </tr>
                </thead>
                <tbody>
                  {organicNaming.map((row, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2 text-center font-bold">{row.carbons}</td>
                      <td className="border border-gray-300 p-2 font-mono">{row.prefix}</td>
                      <td className="border border-gray-300 p-2 font-mono">{row.alkane}</td>
                      <td className="border border-gray-300 p-2 font-mono">{row.alkene}</td>
                      <td className="border border-gray-300 p-2 font-mono">{row.alkyne}</td>
                      <td className="border border-gray-300 p-2 font-mono">{row.alcohol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">Functional Group Priority (Highest to Lowest)</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">Priority</th>
                    <th className="border border-gray-300 p-2">Functional Group</th>
                    <th className="border border-gray-300 p-2">Suffix</th>
                    <th className="border border-gray-300 p-2">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {functionalGroups.map((group, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2 text-center font-bold">{group.priority}</td>
                      <td className="border border-gray-300 p-2">{group.name}</td>
                      <td className="border border-gray-300 p-2 font-mono">{group.suffix}</td>
                      <td className="border border-gray-300 p-2 font-mono text-sm">{group.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Solubility Rules */}
        <section className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">Solubility Rules</h2>
          <div className="space-y-3">
            <div className="p-3 bg-green-100 rounded border-l-4 border-green-500">
              <strong>Always Soluble:</strong> Group 1 metals (Li⁺, Na⁺, K⁺, etc.), NH₄⁺, NO₃⁻, CH₃COO⁻, ClO₄⁻
            </div>
            <div className="p-3 bg-yellow-100 rounded border-l-4 border-yellow-500">
              <strong>Usually Soluble:</strong> Cl⁻, Br⁻, I⁻ (except with Ag⁺, Pb²⁺, Hg₂²⁺) | SO₄²⁻ (except with Ba²⁺, Pb²⁺, Ca²⁺, Sr²⁺)
            </div>
            <div className="p-3 bg-red-100 rounded border-l-4 border-red-500">
              <strong>Usually Insoluble:</strong> OH⁻ (except Group 1, Ba²⁺, Ca²⁺) | CO₃²⁻, PO₄³⁻, S²⁻ (except Group 1, NH₄⁺)
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FormulaSheet;
