// CHEMI - Advanced Chemistry Calculator Engine
class ChemiCalculator {
    constructor() {
        this.calculationsData = {};
        this.lookupData = [];
        this.favorites = JSON.parse(localStorage.getItem('chemi-favorites')) || [];
        this.workspaceCalculators = [];
        this.calculatorIdCounter = 0;
        this.init();
    }

    async init() {
        this.loadData();
        this.setupEventListeners();
        this.setupLookupSystem();
        this.updateEmptyState();
        this.renderCategoryLists();
    }

    loadData() {
        // Load calculation data
        this.calculationsData = {
            "stoichiometry": [
                {
                    "id": "moles-mass",
                    "title": "Moles to Mass",
                    "formula": "m = n × M",
                    "description": "Calculate mass from moles and molar mass",
                    "inputs": [
                        {"id": "moles", "label": "Moles (n)", "unit": "mol", "type": "number"},
                        {"id": "molar_mass", "label": "Molar Mass (M)", "unit": "g/mol", "type": "text", "placeholder": "Enter value or formula (e.g., H2O)"}
                    ]
                },
                {
                    "id": "mass-moles",
                    "title": "Mass to Moles",
                    "formula": "n = m / M",
                    "description": "Calculate moles from mass and molar mass",
                    "inputs": [
                        {"id": "mass", "label": "Mass (m)", "unit": "g", "type": "number"},
                        {"id": "molar_mass", "label": "Molar Mass (M)", "unit": "g/mol", "type": "text", "placeholder": "Enter value or formula"}
                    ]
                },
                {
                    "id": "molarity",
                    "title": "Molarity",
                    "formula": "C = n / V",
                    "description": "Calculate molarity from moles and volume",
                    "inputs": [
                        {"id": "moles", "label": "Moles (n)", "unit": "mol", "type": "number"},
                        {"id": "volume", "label": "Volume (V)", "unit": "L", "type": "number"}
                    ]
                },
                {
                    "id": "ideal-gas",
                    "title": "Ideal Gas Law",
                    "formula": "PV = nRT",
                    "description": "Calculate using ideal gas law",
                    "inputs": [
                        {"id": "pressure", "label": "Pressure (P)", "unit": "atm", "type": "number", "optional": true},
                        {"id": "volume", "label": "Volume (V)", "unit": "L", "type": "number", "optional": true},
                        {"id": "moles", "label": "Moles (n)", "unit": "mol", "type": "number", "optional": true},
                        {"id": "temperature", "label": "Temperature (T)", "unit": "K", "type": "number", "optional": true}
                    ]
                },
                {
                    "id": "percent-yield",
                    "title": "Percent Yield",
                    "formula": "% = (Actual/Theoretical) × 100",
                    "description": "Calculate percentage yield",
                    "inputs": [
                        {"id": "actual", "label": "Actual Yield", "unit": "g", "type": "number"},
                        {"id": "theoretical", "label": "Theoretical Yield", "unit": "g", "type": "number"}
                    ]
                },
                {
                    "id": "limiting-reagent",
                    "title": "Limiting Reagent",
                    "formula": "Compare mole ratios",
                    "description": "Determine limiting reagent",
                    "inputs": [
                        {"id": "moles_a", "label": "Moles of A", "unit": "mol", "type": "number"},
                        {"id": "coeff_a", "label": "Coefficient of A", "unit": "", "type": "number"},
                        {"id": "moles_b", "label": "Moles of B", "unit": "mol", "type": "number"},
                        {"id": "coeff_b", "label": "Coefficient of B", "unit": "", "type": "number"}
                    ]
                },
                {
                    "id": "empirical-formula",
                    "title": "Empirical Formula",
                    "formula": "Simplest ratio of elements",
                    "description": "Calculate empirical formula",
                    "inputs": [
                        {"id": "elements", "label": "Element percentages", "unit": "%", "type": "text", "placeholder": "C:40.0,H:6.7,O:53.3"}
                    ]
                },
                {
                    "id": "molecular-formula",
                    "title": "Molecular Formula",
                    "formula": "n × Empirical Formula",
                    "description": "Find molecular formula",
                    "inputs": [
                        {"id": "empirical_mass", "label": "Empirical Mass", "unit": "g/mol", "type": "number"},
                        {"id": "molecular_mass", "label": "Molecular Mass", "unit": "g/mol", "type": "number"}
                    ]
                },
                {
                    "id": "relative-atomic-mass",
                    "title": "Relative Atomic Mass",
                    "formula": "Σ(isotope mass × abundance)",
                    "description": "Calculate RAM from isotopes",
                    "inputs": [
                        {"id": "isotopes", "label": "Isotope data", "unit": "", "type": "text", "placeholder": "mass1:abundance1,mass2:abundance2"}
                    ]
                }
            ],
            "solutions": [
                {
                    "id": "dilution",
                    "title": "Dilution",
                    "formula": "C₁V₁ = C₂V₂",
                    "description": "Calculate dilution parameters",
                    "inputs": [
                        {"id": "c1", "label": "Initial Conc (C₁)", "unit": "M", "type": "number"},
                        {"id": "v1", "label": "Initial Vol (V₁)", "unit": "mL", "type": "number"},
                        {"id": "c2", "label": "Final Conc (C₂)", "unit": "M", "type": "number"}
                    ]
                },
                {
                    "id": "percent-ww",
                    "title": "Percent w/w",
                    "formula": "% = (mass solute/mass solution) × 100",
                    "description": "Weight/weight percentage",
                    "inputs": [
                        {"id": "mass_solute", "label": "Mass Solute", "unit": "g", "type": "number"},
                        {"id": "mass_solution", "label": "Mass Solution", "unit": "g", "type": "number"}
                    ]
                },
                {
                    "id": "percent-wv",
                    "title": "Percent w/v",
                    "formula": "% = (mass solute/volume solution) × 100",
                    "description": "Weight/volume percentage",
                    "inputs": [
                        {"id": "mass_solute", "label": "Mass Solute", "unit": "g", "type": "number"},
                        {"id": "volume_solution", "label": "Volume Solution", "unit": "mL", "type": "number"}
                    ]
                },
                {
                    "id": "ppm",
                    "title": "Parts Per Million",
                    "formula": "ppm = (mass solute/mass solution) × 10⁶",
                    "description": "Calculate ppm concentration",
                    "inputs": [
                        {"id": "mass_solute", "label": "Mass Solute", "unit": "mg", "type": "number"},
                        {"id": "mass_solution", "label": "Mass Solution", "unit": "kg", "type": "number"}
                    ]
                },
                {
                    "id": "molality",
                    "title": "Molality",
                    "formula": "m = moles solute/kg solvent",
                    "description": "Calculate molality",
                    "inputs": [
                        {"id": "moles_solute", "label": "Moles Solute", "unit": "mol", "type": "number"},
                        {"id": "kg_solvent", "label": "Mass Solvent", "unit": "kg", "type": "number"}
                    ]
                },
                {
                    "id": "solubility-product",
                    "title": "Solubility Product",
                    "formula": "Ksp = [A⁺]ᵐ[B⁻]ⁿ",
                    "description": "Calculate Ksp",
                    "inputs": [
                        {"id": "ion_conc", "label": "Ion concentrations", "unit": "M", "type": "text", "placeholder": "Ca2+:0.01,CO3:0.01"}
                    ]
                }
            ],
            "acids-bases": [
                {
                    "id": "ph-calculation",
                    "title": "pH from [H⁺]",
                    "formula": "pH = -log₁₀[H⁺]",
                    "description": "Calculate pH",
                    "inputs": [
                        {"id": "h_concentration", "label": "[H⁺] Concentration", "unit": "M", "type": "number"}
                    ]
                },
                {
                    "id": "h-from-ph",
                    "title": "[H⁺] from pH",
                    "formula": "[H⁺] = 10⁻ᵖᴴ",
                    "description": "Calculate H⁺ concentration",
                    "inputs": [
                        {"id": "ph", "label": "pH Value", "unit": "", "type": "number"}
                    ]
                },
                {
                    "id": "poh-calculation",
                    "title": "pOH Calculation",
                    "formula": "pH + pOH = 14",
                    "description": "Calculate pOH",
                    "inputs": [
                        {"id": "ph", "label": "pH Value", "unit": "", "type": "number"}
                    ]
                },
                {
                    "id": "titration",
                    "title": "Acid-Base Titration",
                    "formula": "n(acid) = n(base)",
                    "description": "Titration calculations",
                    "inputs": [
                        {"id": "c_acid", "label": "Acid Conc", "unit": "M", "type": "number"},
                        {"id": "v_acid", "label": "Acid Volume", "unit": "mL", "type": "number"},
                        {"id": "v_base", "label": "Base Volume", "unit": "mL", "type": "number"}
                    ]
                }
            ],
            "redox": [
                {
                    "id": "cell-potential",
                    "title": "Cell Potential",
                    "formula": "E°cell = E°cathode - E°anode",
                    "description": "Calculate cell potential",
                    "inputs": [
                        {"id": "cathode_potential", "label": "E° Cathode", "unit": "V", "type": "number"},
                        {"id": "anode_potential", "label": "E° Anode", "unit": "V", "type": "number"}
                    ]
                },
                {
                    "id": "faraday-law",
                    "title": "Faraday's Law",
                    "formula": "Q = It = nF",
                    "description": "Charge and electron moles",
                    "inputs": [
                        {"id": "current", "label": "Current (I)", "unit": "A", "type": "number"},
                        {"id": "time", "label": "Time (t)", "unit": "s", "type": "number"}
                    ]
                },
                {
                    "id": "nernst-equation",
                    "title": "Nernst Equation",
                    "formula": "E = E° - (0.0592/n)log(Q)",
                    "description": "Non-standard conditions",
                    "inputs": [
                        {"id": "standard_potential", "label": "E° Standard", "unit": "V", "type": "number"},
                        {"id": "electrons", "label": "Electrons (n)", "unit": "", "type": "number"},
                        {"id": "reaction_quotient", "label": "Q", "unit": "", "type": "number"}
                    ]
                }
            ],
            "thermochemistry": [
                {
                    "id": "heat-capacity",
                    "title": "Heat Capacity",
                    "formula": "q = mcΔT",
                    "description": "Calculate heat transfer",
                    "inputs": [
                        {"id": "mass", "label": "Mass (m)", "unit": "g", "type": "number"},
                        {"id": "specific_heat", "label": "Specific Heat (c)", "unit": "J/g°C", "type": "number"},
                        {"id": "temp_change", "label": "ΔT", "unit": "°C", "type": "number"}
                    ]
                },
                {
                    "id": "enthalpy-formation",
                    "title": "Enthalpy of Formation",
                    "formula": "ΔH°rxn = Σ ΔH°f(products) - Σ ΔH°f(reactants)",
                    "description": "Reaction enthalpy",
                    "inputs": [
                        {"id": "products_enthalpy", "label": "Σ Products ΔH°f", "unit": "kJ/mol", "type": "number"},
                        {"id": "reactants_enthalpy", "label": "Σ Reactants ΔH°f", "unit": "kJ/mol", "type": "number"}
                    ]
                },
                {
                    "id": "bond-energy",
                    "title": "Bond Energy",
                    "formula": "ΔH = Bonds broken - Bonds formed",
                    "description": "Calculate from bond energies",
                    "inputs": [
                        {"id": "bonds_broken", "label": "Energy Broken", "unit": "kJ/mol", "type": "number"},
                        {"id": "bonds_formed", "label": "Energy Formed", "unit": "kJ/mol", "type": "number"}
                    ]
                }
            ],
            "analytical": [
                {
                    "id": "beer-lambert",
                    "title": "Beer-Lambert Law",
                    "formula": "A = εcl",
                    "description": "Calculate absorbance",
                    "inputs": [
                        {"id": "molar_absorptivity", "label": "ε", "unit": "L/mol·cm", "type": "number"},
                        {"id": "concentration", "label": "Concentration", "unit": "M", "type": "number"},
                        {"id": "path_length", "label": "Path Length", "unit": "cm", "type": "number"}
                    ]
                },
                {
                    "id": "calibration-curve",
                    "title": "Calibration Curve",
                    "formula": "y = mx + b",
                    "description": "Linear calibration",
                    "inputs": [
                        {"id": "slope", "label": "Slope (m)", "unit": "", "type": "number"},
                        {"id": "x_value", "label": "x-value", "unit": "", "type": "number"},
                        {"id": "y_intercept", "label": "Intercept (b)", "unit": "", "type": "number"}
                    ]
                }
            ],
            "organic": [
                {
                    "id": "percent-composition",
                    "title": "Percent Composition",
                    "formula": "% = (mass element/total mass) × 100",
                    "description": "Element percentage",
                    "inputs": [
                        {"id": "element_mass", "label": "Element Mass", "unit": "g/mol", "type": "number"},
                        {"id": "total_mass", "label": "Total Mass", "unit": "g/mol", "type": "number"}
                    ]
                },
                {
                    "id": "degree-unsaturation",
                    "title": "Degree of Unsaturation",
                    "formula": "DU = (2C + 2 - H + N)/2",
                    "description": "Calculate unsaturation",
                    "inputs": [
                        {"id": "formula", "label": "Molecular Formula", "unit": "", "type": "text", "placeholder": "C6H12O"}
                    ]
                }
            ],
            "toolkit": [
                {
                    "id": "ion-charge",
                    "title": "Ion Charge Lookup",
                    "formula": "Common ion charges",
                    "description": "Find charge of ions",
                    "inputs": [
                        {"id": "ion", "label": "Ion Symbol", "unit": "", "type": "text", "placeholder": "Na, SO4, NH4"}
                    ]
                },
                {
                    "id": "compound-solubility",
                    "title": "Solubility Check",
                    "formula": "Solubility rules",
                    "description": "Check if compound is soluble",
                    "inputs": [
                        {"id": "compound", "label": "Compound Formula", "unit": "", "type": "text", "placeholder": "NaCl, AgCl, CaCO3"}
                    ]
                },
                {
                    "id": "equation-balancer",
                    "title": "Equation Balancer",
                    "formula": "Balance chemical equations",
                    "description": "Balance unbalanced equations",
                    "inputs": [
                        {"id": "equation", "label": "Unbalanced Equation", "unit": "", "type": "text", "placeholder": "H2 + O2 → H2O"}
                    ]
                },
                {
                    "id": "molar-mass-calc",
                    "title": "Molar Mass Calculator",
                    "formula": "Sum of atomic masses",
                    "description": "Calculate molar mass",
                    "inputs": [
                        {"id": "formula", "label": "Chemical Formula", "unit": "", "type": "text", "placeholder": "H2SO4, Ca(OH)2"}
                    ]
                }
            ]
        };

        // Comprehensive lookup data for VCE Chemistry
        this.lookupData = [
            // Constants
            {"term": "Avogadro's Number", "formula": "6.022 × 10²³ mol⁻¹", "description": "Number of particles in one mole", "category": "Constants"},
            {"term": "Ideal Gas Constant", "formula": "R = 8.314 J mol⁻¹ K⁻¹", "description": "Universal gas constant", "category": "Constants"},
            {"term": "Faraday Constant", "formula": "F = 96485 C mol⁻¹", "description": "Charge of one mole of electrons", "category": "Constants"},
            {"term": "Planck's Constant", "formula": "h = 6.626 × 10⁻³⁴ J s", "description": "Quantum of action", "category": "Constants"},
            {"term": "Speed of Light", "formula": "c = 3.00 × 10⁸ m s⁻¹", "description": "Speed of light in vacuum", "category": "Constants"},
            {"term": "STP Conditions", "formula": "0°C (273.15 K), 100 kPa", "description": "Standard Temperature and Pressure", "category": "Constants"},
            {"term": "Molar Volume at STP", "formula": "22.71 L mol⁻¹", "description": "Volume of 1 mole of gas at STP", "category": "Constants"},
            {"term": "Water Ion Product", "formula": "Kw = 1.0 × 10⁻¹⁴ at 25°C", "description": "Ion product of water", "category": "Constants"},
            
            // Formulas
            {"term": "Ideal Gas Law", "formula": "PV = nRT", "description": "Relationship between P, V, n, T", "category": "Gas Laws"},
            {"term": "Combined Gas Law", "formula": "P₁V₁/T₁ = P₂V₂/T₂", "description": "For fixed amount of gas", "category": "Gas Laws"},
            {"term": "Henderson-Hasselbalch", "formula": "pH = pKa + log([A⁻]/[HA])", "description": "Buffer pH calculation", "category": "Acids & Bases"},
            {"term": "Arrhenius Equation", "formula": "k = Ae⁻ᴱᵃ/ᴿᵀ", "description": "Temperature dependence of rate", "category": "Kinetics"},
            {"term": "Rate Law", "formula": "Rate = k[A]ᵐ[B]ⁿ", "description": "Reaction rate equation", "category": "Kinetics"},
            {"term": "Gibbs Free Energy", "formula": "ΔG = ΔH - TΔS", "description": "Spontaneity of reactions", "category": "Thermodynamics"},
            {"term": "Nernst Equation", "formula": "E = E° - (RT/nF)lnQ", "description": "Cell potential", "category": "Redox"},
            {"term": "Beer-Lambert Law", "formula": "A = εcl", "description": "Absorbance relationship", "category": "Analytical"},
            
            // Definitions
            {"term": "Molarity", "formula": "C = n/V", "description": "Moles per liter of solution", "category": "Solutions"},
            {"term": "Molality", "formula": "m = n(solute)/kg(solvent)", "description": "Moles per kg of solvent", "category": "Solutions"},
            {"term": "Mole Fraction", "formula": "χᵢ = nᵢ/Σn", "description": "Fraction of moles", "category": "Solutions"},
            {"term": "Limiting Reagent", "formula": "Reactant consumed first", "description": "Determines product amount", "category": "Stoichiometry"},
            {"term": "Percent Yield", "formula": "% = (Actual/Theoretical) × 100", "description": "Reaction efficiency", "category": "Stoichiometry"},
            {"term": "Empirical Formula", "formula": "Simplest whole number ratio", "description": "Simplest formula", "category": "Stoichiometry"},
            {"term": "Oxidation", "formula": "Loss of electrons", "description": "Increase in oxidation number", "category": "Redox"},
            {"term": "Reduction", "formula": "Gain of electrons", "description": "Decrease in oxidation number", "category": "Redox"},
            {"term": "Catalyst", "formula": "Lowers Ea", "description": "Speeds reaction without being consumed", "category": "Kinetics"},
            {"term": "Le Chatelier's Principle", "formula": "System opposes change", "description": "Equilibrium response to stress", "category": "Equilibrium"},
            {"term": "Common Ion Effect", "formula": "Decreases solubility", "description": "Effect of shared ion", "category": "Equilibrium"},
            
            // Solubility Rules
            {"term": "Group 1 Salts", "formula": "Always soluble", "description": "Li⁺, Na⁺, K⁺, Rb⁺, Cs⁺", "category": "Solubility"},
            {"term": "Nitrate Salts", "formula": "Always soluble", "description": "All NO₃⁻ compounds", "category": "Solubility"},
            {"term": "Ammonium Salts", "formula": "Always soluble", "description": "All NH₄⁺ compounds", "category": "Solubility"},
            {"term": "Halides", "formula": "Mostly soluble", "description": "Except Ag⁺, Pb²⁺, Hg₂²⁺", "category": "Solubility"},
            {"term": "Sulfates", "formula": "Mostly soluble", "description": "Except Ba²⁺, Sr²⁺, Pb²⁺, Ca²⁺", "category": "Solubility"},
            {"term": "Carbonates", "formula": "Mostly insoluble", "description": "Except Group 1 and NH₄⁺", "category": "Solubility"},
            {"term": "Hydroxides", "formula": "Mostly insoluble", "description": "Except Group 1, Ba²⁺, Sr²⁺", "category": "Solubility"},
            {"term": "Phosphates", "formula": "Mostly insoluble", "description": "Except Group 1 and NH₄⁺", "category": "Solubility"},
            
            // Common Ions
            {"term": "Hydronium", "formula": "H₃O⁺", "description": "Protonated water", "category": "Ions"},
            {"term": "Hydroxide", "formula": "OH⁻", "description": "Base ion", "category": "Ions"},
            {"term": "Sulfate", "formula": "SO₄²⁻", "description": "Common polyatomic ion", "category": "Ions"},
            {"term": "Nitrate", "formula": "NO₃⁻", "description": "Common polyatomic ion", "category": "Ions"},
            {"term": "Carbonate", "formula": "CO₃²⁻", "description": "Common polyatomic ion", "category": "Ions"},
            {"term": "Phosphate", "formula": "PO₄³⁻", "description": "Common polyatomic ion", "category": "Ions"},
            {"term": "Ammonium", "formula": "NH₄⁺", "description": "Common polyatomic cation", "category": "Ions"}
        ];

        // Setup calculation methods
        this.setupCalculationMethods();
    }

    setupCalculationMethods() {
        // Element data for molar mass calculations
        const elements = {
            'H': 1.008, 'He': 4.003, 'Li': 6.941, 'Be': 9.012, 'B': 10.81, 'C': 12.01,
            'N': 14.01, 'O': 16.00, 'F': 19.00, 'Ne': 20.18, 'Na': 22.99, 'Mg': 24.31,
            'Al': 26.98, 'Si': 28.09, 'P': 30.97, 'S': 32.07, 'Cl': 35.45, 'Ar': 39.95,
            'K': 39.10, 'Ca': 40.08, 'Sc': 44.96, 'Ti': 47.87, 'V': 50.94, 'Cr': 52.00,
            'Mn': 54.94, 'Fe': 55.85, 'Co': 58.93, 'Ni': 58.69, 'Cu': 63.55, 'Zn': 65.38,
            'Ga': 69.72, 'Ge': 72.64, 'As': 74.92, 'Se': 78.96, 'Br': 79.90, 'Kr': 83.80,
            'Rb': 85.47, 'Sr': 87.62, 'Y': 88.91, 'Zr': 91.22, 'Nb': 92.91, 'Mo': 95.96,
            'Tc': 98, 'Ru': 101.07, 'Rh': 102.91, 'Pd': 106.42, 'Ag': 107.87, 'Cd': 112.41,
            'In': 114.82, 'Sn': 118.71, 'Sb': 121.76, 'Te': 127.60, 'I': 126.90, 'Xe': 131.29,
            'Cs': 132.91, 'Ba': 137.33, 'La': 138.91, 'Ce': 140.12, 'Pr': 140.91, 'Nd': 144.24,
            'Pm': 145, 'Sm': 150.36, 'Eu': 151.96, 'Gd': 157.25, 'Tb': 158.93, 'Dy': 162.50,
            'Ho': 164.93, 'Er': 167.26, 'Tm': 168.93, 'Yb': 173.05, 'Lu': 174.97, 'Hf': 178.49,
            'Ta': 180.95, 'W': 183.84, 'Re': 186.21, 'Os': 190.23, 'Ir': 192.22, 'Pt': 195.08,
            'Au': 196.97, 'Hg': 200.59, 'Tl': 204.38, 'Pb': 207.2, 'Bi': 208.98, 'Po': 209,
            'At': 210, 'Rn': 222, 'Fr': 223, 'Ra': 226, 'Ac': 227, 'Th': 232.04, 'Pa': 231.04,
            'U': 238.03, 'Np': 237, 'Pu': 244, 'Am': 243, 'Cm': 247, 'Bk': 247, 'Cf': 251,
            'Es': 252, 'Fm': 257, 'Md': 258, 'No': 259, 'Lr': 262
        };

        // Helper function to calculate molar mass from formula
        const calculateMolarMass = (formula) => {
            // Check if it's a number
            if (!isNaN(formula)) {
                return parseFloat(formula);
            }
            
            // Parse chemical formula
            let mass = 0;
            const regex = /([A-Z][a-z]?)(\d*)/g;
            let match;
            
            while ((match = regex.exec(formula)) !== null) {
                const element = match[1];
                const count = match[2] ? parseInt(match[2]) : 1;
                
                if (elements[element]) {
                    mass += elements[element] * count;
                }
            }
            
            return mass || parseFloat(formula) || 0;
        };

        // Ion charges database
        const ionCharges = {
            'H': '+1', 'Li': '+1', 'Na': '+1', 'K': '+1', 'Rb': '+1', 'Cs': '+1',
            'Mg': '+2', 'Ca': '+2', 'Sr': '+2', 'Ba': '+2',
            'Al': '+3', 'Ga': '+3', 'In': '+3',
            'F': '-1', 'Cl': '-1', 'Br': '-1', 'I': '-1',
            'O': '-2', 'S': '-2', 'Se': '-2',
            'N': '-3', 'P': '-3',
            'NH4': '+1', 'NH3': '0', 'H3O': '+1', 'OH': '-1',
            'NO3': '-1', 'NO2': '-1', 'SO4': '-2', 'SO3': '-2',
            'CO3': '-2', 'HCO3': '-1', 'PO4': '-3', 'HPO4': '-2', 'H2PO4': '-1',
            'ClO4': '-1', 'ClO3': '-1', 'ClO2': '-1', 'ClO': '-1',
            'MnO4': '-1', 'CrO4': '-2', 'Cr2O7': '-2'
        };

        // Solubility rules
        const solubilityRules = (compound) => {
            const comp = compound.toUpperCase();
            
            // Always soluble
            if (comp.includes('NA') || comp.includes('K') || comp.includes('LI') || 
                comp.includes('RB') || comp.includes('CS') || comp.includes('NH4')) {
                return 'Soluble (Group 1 or NH₄⁺ compound)';
            }
            if (comp.includes('NO3')) return 'Soluble (Nitrate)';
            if (comp.includes('C2H3O2') || comp.includes('CH3COO')) return 'Soluble (Acetate)';
            
            // Halides
            if (comp.includes('CL') || comp.includes('BR') || comp.includes('I')) {
                if (comp.includes('AG') || comp.includes('PB') || comp.includes('HG')) {
                    return 'Insoluble (Ag⁺, Pb²⁺, or Hg₂²⁺ halide)';
                }
                return 'Soluble (Halide)';
            }
            
            // Sulfates
            if (comp.includes('SO4')) {
                if (comp.includes('BA') || comp.includes('SR') || comp.includes('PB') || comp.includes('CA')) {
                    return 'Insoluble (Ba²⁺, Sr²⁺, Pb²⁺, or Ca²⁺ sulfate)';
                }
                return 'Soluble (Sulfate)';
            }
            
            // Carbonates, Phosphates, Hydroxides
            if (comp.includes('CO3')) return 'Insoluble (Carbonate - except Group 1/NH₄⁺)';
            if (comp.includes('PO4')) return 'Insoluble (Phosphate - except Group 1/NH₄⁺)';
            if (comp.includes('OH')) {
                if (comp.includes('BA') || comp.includes('SR')) {
                    return 'Soluble (Ba²⁺ or Sr²⁺ hydroxide)';
                }
                return 'Insoluble (Hydroxide - except Group 1/Ba²⁺/Sr²⁺)';
            }
            
            // Sulfides
            if (comp.includes('S') && !comp.includes('SO')) {
                return 'Insoluble (Sulfide - except Group 1/2/NH₄⁺)';
            }
            
            return 'Check solubility table for specific compound';
        };

        // Calculation methods for each calculator
        const calculations = {
            "moles-mass": (inputs) => {
                const molarMass = calculateMolarMass(inputs.molar_mass);
                const mass = inputs.moles * molarMass;
                return {
                    result: `${mass.toFixed(3)} g`,
                    working: `m = n × M\nm = ${inputs.moles} mol × ${molarMass.toFixed(2)} g/mol\nm = ${mass.toFixed(3)} g`
                };
            },
            
            "mass-moles": (inputs) => {
                const molarMass = calculateMolarMass(inputs.molar_mass);
                const moles = inputs.mass / molarMass;
                return {
                    result: `${moles.toFixed(3)} mol`,
                    working: `n = m / M\nn = ${inputs.mass} g / ${molarMass.toFixed(2)} g/mol\nn = ${moles.toFixed(3)} mol`
                };
            },
            
            "molarity": (inputs) => {
                const molarity = inputs.moles / inputs.volume;
                return {
                    result: `${molarity.toFixed(3)} M`,
                    working: `C = n / V\nC = ${inputs.moles} mol / ${inputs.volume} L\nC = ${molarity.toFixed(3)} M`
                };
            },
            
            "ideal-gas": (inputs) => {
                const R = 0.08206; // L·atm/(mol·K)
                let result, working;
                
                // Find which variable to solve for
                if (!inputs.pressure || inputs.pressure === '') {
                    const P = (inputs.moles * R * inputs.temperature) / inputs.volume;
                    result = `P = ${P.toFixed(3)} atm`;
                    working = `PV = nRT\nP = nRT/V\nP = (${inputs.moles} × ${R} × ${inputs.temperature}) / ${inputs.volume}\nP = ${P.toFixed(3)} atm`;
                } else if (!inputs.volume || inputs.volume === '') {
                    const V = (inputs.moles * R * inputs.temperature) / inputs.pressure;
                    result = `V = ${V.toFixed(3)} L`;
                    working = `PV = nRT\nV = nRT/P\nV = (${inputs.moles} × ${R} × ${inputs.temperature}) / ${inputs.pressure}\nV = ${V.toFixed(3)} L`;
                } else if (!inputs.moles || inputs.moles === '') {
                    const n = (inputs.pressure * inputs.volume) / (R * inputs.temperature);
                    result = `n = ${n.toFixed(3)} mol`;
                    working = `PV = nRT\nn = PV/RT\nn = (${inputs.pressure} × ${inputs.volume}) / (${R} × ${inputs.temperature})\nn = ${n.toFixed(3)} mol`;
                } else if (!inputs.temperature || inputs.temperature === '') {
                    const T = (inputs.pressure * inputs.volume) / (inputs.moles * R);
                    result = `T = ${T.toFixed(1)} K`;
                    working = `PV = nRT\nT = PV/nR\nT = (${inputs.pressure} × ${inputs.volume}) / (${inputs.moles} × ${R})\nT = ${T.toFixed(1)} K`;
                }
                
                return { result, working };
            },
            
            "percent-yield": (inputs) => {
                const percent = (inputs.actual / inputs.theoretical) * 100;
                return {
                    result: `${percent.toFixed(2)}%`,
                    working: `% Yield = (Actual / Theoretical) × 100\n% = (${inputs.actual} g / ${inputs.theoretical} g) × 100\n% = ${percent.toFixed(2)}%`
                };
            },
            
            "limiting-reagent": (inputs) => {
                const ratio_a = inputs.moles_a / inputs.coeff_a;
                const ratio_b = inputs.moles_b / inputs.coeff_b;
                const limiting = ratio_a < ratio_b ? "Reactant A" : "Reactant B";
                return {
                    result: `${limiting} is limiting`,
                    working: `Mole ratio A = ${inputs.moles_a} / ${inputs.coeff_a} = ${ratio_a.toFixed(3)}\nMole ratio B = ${inputs.moles_b} / ${inputs.coeff_b} = ${ratio_b.toFixed(3)}\n${limiting} has smaller ratio, so it's limiting`
                };
            },
            
            "dilution": (inputs) => {
                const v2 = (inputs.c1 * inputs.v1) / inputs.c2;
                return {
                    result: `V₂ = ${v2.toFixed(2)} mL`,
                    working: `C₁V₁ = C₂V₂\nV₂ = C₁V₁/C₂\nV₂ = (${inputs.c1} M × ${inputs.v1} mL) / ${inputs.c2} M\nV₂ = ${v2.toFixed(2)} mL`
                };
            },
            
            "ph-calculation": (inputs) => {
                const ph = -Math.log10(inputs.h_concentration);
                return {
                    result: `pH = ${ph.toFixed(2)}`,
                    working: `pH = -log₁₀[H⁺]\npH = -log₁₀(${inputs.h_concentration})\npH = ${ph.toFixed(2)}`
                };
            },
            
            "h-from-ph": (inputs) => {
                const h_conc = Math.pow(10, -inputs.ph);
                return {
                    result: `[H⁺] = ${h_conc.toExponential(2)} M`,
                    working: `[H⁺] = 10⁻ᵖᴴ\n[H⁺] = 10⁻${inputs.ph}\n[H⁺] = ${h_conc.toExponential(2)} M`
                };
            },
            
            "poh-calculation": (inputs) => {
                const poh = 14 - inputs.ph;
                return {
                    result: `pOH = ${poh.toFixed(2)}`,
                    working: `pH + pOH = 14\npOH = 14 - pH\npOH = 14 - ${inputs.ph}\npOH = ${poh.toFixed(2)}`
                };
            },
            
            "titration": (inputs) => {
                const c_base = (inputs.c_acid * inputs.v_acid) / inputs.v_base;
                return {
                    result: `C(base) = ${c_base.toFixed(3)} M`,
                    working: `n(acid) = n(base)\nC₁V₁ = C₂V₂\nC(base) = C(acid) × V(acid) / V(base)\nC(base) = ${inputs.c_acid} M × ${inputs.v_acid} mL / ${inputs.v_base} mL\nC(base) = ${c_base.toFixed(3)} M`
                };
            },
            
            "cell-potential": (inputs) => {
                const cell_potential = inputs.cathode_potential - inputs.anode_potential;
                return {
                    result: `E°cell = ${cell_potential.toFixed(3)} V`,
                    working: `E°cell = E°cathode - E°anode\nE°cell = ${inputs.cathode_potential} V - ${inputs.anode_potential} V\nE°cell = ${cell_potential.toFixed(3)} V`
                };
            },
            
            "heat-capacity": (inputs) => {
                const heat = inputs.mass * inputs.specific_heat * inputs.temp_change;
                return {
                    result: `q = ${heat.toFixed(2)} J`,
                    working: `q = mcΔT\nq = ${inputs.mass} g × ${inputs.specific_heat} J/g°C × ${inputs.temp_change} °C\nq = ${heat.toFixed(2)} J`
                };
            },
            
            "beer-lambert": (inputs) => {
                const absorbance = inputs.molar_absorptivity * inputs.concentration * inputs.path_length;
                return {
                    result: `A = ${absorbance.toFixed(3)}`,
                    working: `A = εcl\nA = ${inputs.molar_absorptivity} × ${inputs.concentration} × ${inputs.path_length}\nA = ${absorbance.toFixed(3)}`
                };
            },
            
            "percent-composition": (inputs) => {
                const percent = (inputs.element_mass / inputs.total_mass) * 100;
                return {
                    result: `${percent.toFixed(2)}%`,
                    working: `% = (mass element / total mass) × 100\n% = (${inputs.element_mass} / ${inputs.total_mass}) × 100\n% = ${percent.toFixed(2)}%`
                };
            },
            
            // Toolkit calculations
            "ion-charge": (inputs) => {
                const ion = inputs.ion.toUpperCase();
                const charge = ionCharges[ion] || 'Unknown ion';
                return {
                    result: `${inputs.ion}: ${charge}`,
                    working: `Ion: ${inputs.ion}\nCharge: ${charge}\n${charge === 'Unknown ion' ? 'Ion not found in database' : 'Common oxidation state'}`
                };
            },
            
            "compound-solubility": (inputs) => {
                const result = solubilityRules(inputs.compound);
                return {
                    result: result,
                    working: `Compound: ${inputs.compound}\nSolubility: ${result}\n\nBased on general solubility rules`
                };
            },
            
            "equation-balancer": (inputs) => {
                // Simple equation balancer (basic implementation)
                const equation = inputs.equation;
                // This would need a more complex algorithm for real balancing
                return {
                    result: `Balanced: ${equation}`,
                    working: `Original: ${equation}\n\nNote: Full equation balancing requires complex algorithm.\nPlease verify coefficients manually.`
                };
            },
            
            "molar-mass-calc": (inputs) => {
                const mass = calculateMolarMass(inputs.formula);
                return {
                    result: `${mass.toFixed(2)} g/mol`,
                    working: `Formula: ${inputs.formula}\nMolar Mass: ${mass.toFixed(2)} g/mol\n\nSum of atomic masses`
                };
            },
            
            // Add remaining calculations with similar pattern...
            "percent-ww": (inputs) => {
                const percent = (inputs.mass_solute / inputs.mass_solution) * 100;
                return {
                    result: `${percent.toFixed(2)}% w/w`,
                    working: `% w/w = (mass solute / mass solution) × 100\n% = (${inputs.mass_solute} g / ${inputs.mass_solution} g) × 100\n% = ${percent.toFixed(2)}%`
                };
            }
        };
        
        // Attach calculation methods to data
        Object.values(this.calculationsData).forEach(categoryCalcs => {
            categoryCalcs.forEach(calc => {
                if (calculations[calc.id]) {
                    calc.calculate = calculations[calc.id];
                }
            });
        });
    }

    setupEventListeners() {
        // Sidebar collapse
        document.getElementById('collapseBtn').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });
        
        // Category toggles
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = item.dataset.category;
                const list = document.getElementById(`${category}List`);
                
                // Toggle active state
                item.classList.toggle('active');
                
                // Toggle list visibility
                if (list) {
                    list.style.display = list.style.display === 'block' ? 'none' : 'block';
                }
                
                // Populate list if needed
                if (list && list.style.display === 'block' && !list.hasChildNodes()) {
                    this.populateCategoryList(category, list);
                }
            });
        });
        
        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            if (confirm('Clear all calculations from workspace?')) {
                this.clearWorkspace();
            }
        });
        
        // Update favorites count
        this.updateFavoritesCount();
    }

    setupLookupSystem() {
        const lookupInput = document.getElementById('lookupInput');
        const lookupResults = document.getElementById('lookupResults');
        
        lookupInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                lookupResults.style.display = 'none';
                return;
            }
            
            // Search in lookup data
            const dataResults = this.lookupData.filter(item => 
                item.term.toLowerCase().includes(query) ||
                item.formula.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
            
            // Search in calculations
            const calcResults = [];
            Object.entries(this.calculationsData).forEach(([category, calcs]) => {
                calcs.forEach(calc => {
                    if (calc.title.toLowerCase().includes(query) ||
                        calc.formula.toLowerCase().includes(query) ||
                        calc.description.toLowerCase().includes(query)) {
                        calcResults.push({...calc, category});
                    }
                });
            });
            
            // Display results
            if (dataResults.length > 0 || calcResults.length > 0) {
                let html = '';
                
                // Data results
                dataResults.forEach(item => {
                    html += `
                        <div class="lookup-result-item">
                            <div class="lookup-title">${item.term}</div>
                            <div class="lookup-formula">${item.formula}</div>
                            <div class="lookup-category">${item.category || 'Reference'}</div>
                        </div>
                    `;
                });
                
                // Calculation results
                calcResults.forEach(calc => {
                    html += `
                        <div class="lookup-result-item" onclick="chemiApp.addCalculatorToWorkspace('${calc.id}', '${calc.category}')">
                            <div class="lookup-title">${calc.title}</div>
                            <div class="lookup-formula">${calc.formula}</div>
                            <div class="lookup-category">${calc.category} - Click to add</div>
                        </div>
                    `;
                });
                
                lookupResults.innerHTML = html;
                lookupResults.style.display = 'block';
            } else {
                lookupResults.style.display = 'none';
            }
        });
        
        // Hide on click outside
        document.addEventListener('click', (e) => {
            if (!lookupInput.contains(e.target) && !lookupResults.contains(e.target)) {
                lookupResults.style.display = 'none';
            }
        });
    }

    renderCategoryLists() {
        // This will be called when categories are expanded
    }

    populateCategoryList(category, listElement) {
        const calculations = this.calculationsData[category] || [];
        
        if (category === 'favorites') {
            // Show favorite calculations
            const favCalcs = [];
            Object.entries(this.calculationsData).forEach(([cat, calcs]) => {
                calcs.forEach(calc => {
                    if (this.favorites.includes(calc.id)) {
                        favCalcs.push({...calc, category: cat});
                    }
                });
            });
            
            listElement.innerHTML = favCalcs.map(calc => `
                <div class="calculation-list-item" onclick="chemiApp.addCalculatorToWorkspace('${calc.id}', '${calc.category}')">
                    ${calc.title}
                </div>
            `).join('') || '<div class="calculation-list-item">No favorites yet</div>';
        } else {
            listElement.innerHTML = calculations.map(calc => `
                <div class="calculation-list-item" onclick="chemiApp.addCalculatorToWorkspace('${calc.id}', '${category}')">
                    ${calc.title}
                </div>
            `).join('');
        }
    }

    addCalculatorToWorkspace(calcId, category) {
        const calc = this.calculationsData[category]?.find(c => c.id === calcId);
        if (!calc) return;
        
        const workspace = document.getElementById('workspace');
        const emptyState = document.getElementById('emptyWorkspace');
        
        // Hide empty state
        emptyState.style.display = 'none';
        
        // Create unique instance ID
        const instanceId = `calc-${this.calculatorIdCounter++}`;
        
        // Create calculator box
        const calcBox = document.createElement('div');
        calcBox.className = 'calculator-box';
        calcBox.id = instanceId;
        
        const inputsHtml = calc.inputs.map(input => `
            <div class="input-group">
                <label class="input-label">${input.label}${input.unit ? ` (${input.unit})` : ''}</label>
                <input type="${input.type === 'text' ? 'text' : 'number'}" 
                       class="input-field" 
                       id="${instanceId}-${input.id}"
                       placeholder="${input.placeholder || ''}"
                       ${input.type === 'number' ? 'step="any"' : ''}>
            </div>
        `).join('');
        
        calcBox.innerHTML = `
            <div class="calc-header">
                <h3 class="calc-title">${calc.title}</h3>
                <div class="calc-actions">
                    <button class="calc-btn favorite-btn ${this.favorites.includes(calc.id) ? 'active' : ''}" 
                            onclick="chemiApp.toggleFavorite('${calc.id}', this)">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="calc-btn delete-btn" onclick="chemiApp.removeCalculator('${instanceId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="calc-formula">${calc.formula}</div>
            <div class="calc-inputs">
                ${inputsHtml}
            </div>
            <button class="calculate-btn" onclick="chemiApp.performCalculation('${instanceId}', '${calc.id}', '${category}')">
                Calculate
            </button>
            <div class="calc-result" id="${instanceId}-result">
                <div class="result-label">Result</div>
                <div class="result-value" id="${instanceId}-value"></div>
                <div class="working-toggle" onclick="chemiApp.toggleWorking('${instanceId}')">
                    Show working ▼
                </div>
                <div class="result-working" id="${instanceId}-working">
                    <div class="working-text" id="${instanceId}-working-text"></div>
                </div>
            </div>
        `;
        
        workspace.appendChild(calcBox);
        
        // Add enter key listener to inputs
        calcBox.querySelectorAll('.input-field').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performCalculation(instanceId, calc.id, category);
                }
            });
        });
    }

    performCalculation(instanceId, calcId, category) {
        const calc = this.calculationsData[category]?.find(c => c.id === calcId);
        if (!calc || !calc.calculate) return;
        
        // Collect inputs
        const inputs = {};
        let hasError = false;
        
        calc.inputs.forEach(input => {
            const element = document.getElementById(`${instanceId}-${input.id}`);
            const value = element.value.trim();
            
            if (!input.optional && !value) {
                element.style.borderColor = 'var(--danger)';
                hasError = true;
            } else {
                element.style.borderColor = '';
                if (input.type === 'number' && value) {
                    inputs[input.id] = parseFloat(value);
                } else {
                    inputs[input.id] = value;
                }
            }
        });
        
        if (hasError) return;
        
        try {
            const result = calc.calculate(inputs);
            
            // Display result
            const resultDiv = document.getElementById(`${instanceId}-result`);
            const valueDiv = document.getElementById(`${instanceId}-value`);
            const workingDiv = document.getElementById(`${instanceId}-working-text`);
            
            valueDiv.textContent = result.result;
            workingDiv.textContent = result.working;
            resultDiv.classList.add('show');
            
            // Auto-show working on Enter
            const workingContainer = document.getElementById(`${instanceId}-working`);
            workingContainer.classList.add('show');
            
        } catch (error) {
            console.error('Calculation error:', error);
        }
    }

    toggleWorking(instanceId) {
        const working = document.getElementById(`${instanceId}-working`);
        const toggle = working.previousElementSibling;
        
        working.classList.toggle('show');
        toggle.textContent = working.classList.contains('show') ? 'Hide working ▲' : 'Show working ▼';
    }

    toggleFavorite(calcId, button) {
        const index = this.favorites.indexOf(calcId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            button.classList.remove('active');
        } else {
            this.favorites.push(calcId);
            button.classList.add('active');
        }
        
        localStorage.setItem('chemi-favorites', JSON.stringify(this.favorites));
        this.updateFavoritesCount();
    }

    updateFavoritesCount() {
        const count = document.getElementById('favCount');
        if (count) count.textContent = this.favorites.length;
    }

    removeCalculator(instanceId) {
        const calc = document.getElementById(instanceId);
        if (calc) {
            calc.remove();
            this.updateEmptyState();
        }
    }

    clearWorkspace() {
        document.getElementById('workspace').innerHTML = '';
        this.updateEmptyState();
    }

    updateEmptyState() {
        const workspace = document.getElementById('workspace');
        const emptyState = document.getElementById('emptyWorkspace');
        
        if (workspace.children.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    }
}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chemiApp = new ChemiCalculator();
});
