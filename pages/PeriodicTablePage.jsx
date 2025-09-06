import React from 'react';

const elements = [
    { number: 1, symbol: 'H', name: 'hydrogen', atomicMass: '1.0', row: 1, col: 1 },
    { number: 2, symbol: 'He', name: 'helium', atomicMass: '4.0', row: 1, col: 18 },
    { number: 3, symbol: 'Li', name: 'lithium', atomicMass: '6.9', row: 2, col: 1 },
    { number: 4, symbol: 'Be', name: 'beryllium', atomicMass: '9.0', row: 2, col: 2 },
    { number: 5, symbol: 'B', name: 'boron', atomicMass: '10.8', row: 2, col: 13 },
    { number: 6, symbol: 'C', name: 'carbon', atomicMass: '12.0', row: 2, col: 14 },
    { number: 7, symbol: 'N', name: 'nitrogen', atomicMass: '14.0', row: 2, col: 15 },
    { number: 8, symbol: 'O', name: 'oxygen', atomicMass: '16.0', row: 2, col: 16 },
    { number: 9, symbol: 'F', name: 'fluorine', atomicMass: '19.0', row: 2, col: 17 },
    { number: 10, symbol: 'Ne', name: 'neon', atomicMass: '20.2', row: 2, col: 18 },
    { number: 11, symbol: 'Na', name: 'sodium', atomicMass: '23.0', row: 3, col: 1 },
    { number: 12, symbol: 'Mg', name: 'magnesium', atomicMass: '24.3', row: 3, col: 2 },
    { number: 13, symbol: 'Al', name: 'aluminium', atomicMass: '27.0', row: 3, col: 13 },
    { number: 14, symbol: 'Si', name: 'silicon', atomicMass: '28.1', row: 3, col: 14 },
    { number: 15, symbol: 'P', name: 'phosphorus', atomicMass: '31.0', row: 3, col: 15 },
    { number: 16, symbol: 'S', name: 'sulfur', atomicMass: '32.1', row: 3, col: 16 },
    { number: 17, symbol: 'Cl', name: 'chlorine', atomicMass: '35.5', row: 3, col: 17 },
    { number: 18, symbol: 'Ar', name: 'argon', atomicMass: '39.9', row: 3, col: 18 },
    { number: 19, symbol: 'K', name: 'potassium', atomicMass: '39.1', row: 4, col: 1 },
    { number: 20, symbol: 'Ca', name: 'calcium', atomicMass: '40.1', row: 4, col: 2 },
    { number: 21, symbol: 'Sc', name: 'scandium', atomicMass: '45.0', row: 4, col: 3 },
    { number: 22, symbol: 'Ti', name: 'titanium', atomicMass: '47.9', row: 4, col: 4 },
    { number: 23, symbol: 'V', name: 'vanadium', atomicMass: '50.9', row: 4, col: 5 },
    { number: 24, symbol: 'Cr', name: 'chromium', atomicMass: '52.0', row: 4, col: 6 },
    { number: 25, symbol: 'Mn', name: 'manganese', atomicMass: '54.9', row: 4, col: 7 },
    { number: 26, symbol: 'Fe', name: 'iron', atomicMass: '55.8', row: 4, col: 8 },
    { number: 27, symbol: 'Co', name: 'cobalt', atomicMass: '58.9', row: 4, col: 9 },
    { number: 28, symbol: 'Ni', name: 'nickel', atomicMass: '58.7', row: 4, col: 10 },
    { number: 29, symbol: 'Cu', name: 'copper', atomicMass: '63.5', row: 4, col: 11 },
    { number: 30, symbol: 'Zn', name: 'zinc', atomicMass: '65.4', row: 4, col: 12 },
    { number: 31, symbol: 'Ga', name: 'gallium', atomicMass: '69.7', row: 4, col: 13 },
    { number: 32, symbol: 'Ge', name: 'germanium', atomicMass: '72.6', row: 4, col: 14 },
    { number: 33, symbol: 'As', name: 'arsenic', atomicMass: '74.9', row: 4, col: 15 },
    { number: 34, symbol: 'Se', name: 'selenium', atomicMass: '79.0', row: 4, col: 16 },
    { number: 35, symbol: 'Br', name: 'bromine', atomicMass: '79.9', row: 4, col: 17 },
    { number: 36, symbol: 'Kr', name: 'krypton', atomicMass: '83.8', row: 4, col: 18 },
    { number: 37, symbol: 'Rb', name: 'rubidium', atomicMass: '85.5', row: 5, col: 1 },
    { number: 38, symbol: 'Sr', name: 'strontium', atomicMass: '87.6', row: 5, col: 2 },
    { number: 39, symbol: 'Y', name: 'yttrium', atomicMass: '88.9', row: 5, col: 3 },
    { number: 40, symbol: 'Zr', name: 'zirconium', atomicMass: '91.2', row: 5, col: 4 },
    { number: 41, symbol: 'Nb', name: 'niobium', atomicMass: '92.9', row: 5, col: 5 },
    { number: 42, symbol: 'Mo', name: 'molybdenum', atomicMass: '95.9', row: 5, col: 6 },
    { number: 43, symbol: 'Tc', name: 'technetium', atomicMass: '-', row: 5, col: 7 },
    { number: 44, symbol: 'Ru', name: 'ruthenium', atomicMass: '101.1', row: 5, col: 8 },
    { number: 45, symbol: 'Rh', name: 'rhodium', atomicMass: '102.9', row: 5, col: 9 },
    { number: 46, symbol: 'Pd', name: 'palladium', atomicMass: '106.4', row: 5, col: 10 },
    { number: 47, symbol: 'Ag', name: 'silver', atomicMass: '107.9', row: 5, col: 11 },
    { number: 48, symbol: 'Cd', name: 'cadmium', atomicMass: '112.4', row: 5, col: 12 },
    { number: 49, symbol: 'In', name: 'indium', atomicMass: '114.8', row: 5, col: 13 },
    { number: 50, symbol: 'Sn', name: 'tin', atomicMass: '118.7', row: 5, col: 14 },
    { number: 51, symbol: 'Sb', name: 'antimony', atomicMass: '121.8', row: 5, col: 15 },
    { number: 52, symbol: 'Te', name: 'tellurium', atomicMass: '127.6', row: 5, col: 16 },
    { number: 53, symbol: 'I', name: 'iodine', atomicMass: '126.9', row: 5, col: 17 },
    { number: 54, symbol: 'Xe', name: 'xenon', atomicMass: '131.3', row: 5, col: 18 },
    { number: 55, symbol: 'Cs', name: 'caesium', atomicMass: '132.9', row: 6, col: 1 },
    { number: 56, symbol: 'Ba', name: 'barium', atomicMass: '137.3', row: 6, col: 2 },
    { number: 57, isLanthanidePlaceholder: true, row: 6, col: 3, text: '57-71' },
    { number: 72, symbol: 'Hf', name: 'hafnium', atomicMass: '178.5', row: 6, col: 4 },
    { number: 73, symbol: 'Ta', name: 'tantalum', atomicMass: '180.9', row: 6, col: 5 },
    { number: 74, symbol: 'W', name: 'tungsten', atomicMass: '183.8', row: 6, col: 6 },
    { number: 75, symbol: 'Re', name: 'rhenium', atomicMass: '186.2', row: 6, col: 7 },
    { number: 76, symbol: 'Os', name: 'osmium', atomicMass: '190.2', row: 6, col: 8 },
    { number: 77, symbol: 'Ir', name: 'iridium', atomicMass: '192.2', row: 6, col: 9 },
    { number: 78, symbol: 'Pt', name: 'platinum', atomicMass: '195.1', row: 6, col: 10 },
    { number: 79, symbol: 'Au', name: 'gold', atomicMass: '197.0', row: 6, col: 11 },
    { number: 80, symbol: 'Hg', name: 'mercury', atomicMass: '200.6', row: 6, col: 12 },
    { number: 81, symbol: 'Tl', name: 'thallium', atomicMass: '204.4', row: 6, col: 13 },
    { number: 82, symbol: 'Pb', name: 'lead', atomicMass: '207.2', row: 6, col: 14 },
    { number: 83, symbol: 'Bi', name: 'bismuth', atomicMass: '209.0', row: 6, col: 15 },
    { number: 84, symbol: 'Po', name: 'polonium', atomicMass: '-', row: 6, col: 16 },
    { number: 85, symbol: 'At', name: 'astatine', atomicMass: '-', row: 6, col: 17 },
    { number: 86, symbol: 'Rn', name: 'radon', atomicMass: '-', row: 6, col: 18 },
    { number: 87, symbol: 'Fr', name: 'francium', atomicMass: '-', row: 7, col: 1 },
    { number: 88, symbol: 'Ra', name: 'radium', atomicMass: '-', row: 7, col: 2 },
    { number: 89, isActinidePlaceholder: true, row: 7, col: 3, text: '89-103' },
    { number: 104, symbol: 'Rf', name: 'rutherfordium', atomicMass: '-', row: 7, col: 4 },
    { number: 105, symbol: 'Db', name: 'dubnium', atomicMass: '-', row: 7, col: 5 },
    { number: 106, symbol: 'Sg', name: 'seaborgium', atomicMass: '-', row: 7, col: 6 },
    { number: 107, symbol: 'Bh', name: 'bohrium', atomicMass: '-', row: 7, col: 7 },
    { number: 108, symbol: 'Hs', name: 'hassium', atomicMass: '-', row: 7, col: 8 },
    { number: 109, symbol: 'Mt', name: 'meitnerium', atomicMass: '-', row: 7, col: 9 },
    { number: 110, symbol: 'Ds', name: 'darmstadtium', atomicMass: '-', row: 7, col: 10 },
    { number: 111, symbol: 'Rg', name: 'roentgenium', atomicMass: '-', row: 7, col: 11 },
    { number: 112, symbol: 'Cn', name: 'copernicium', atomicMass: '-', row: 7, col: 12 },
    { number: 113, symbol: 'Nh', name: 'nihonium', atomicMass: '-', row: 7, col: 13 },
    { number: 114, symbol: 'Fl', name: 'flerovium', atomicMass: '-', row: 7, col: 14 },
    { number: 115, symbol: 'Mc', name: 'moscovium', atomicMass: '-', row: 7, col: 15 },
    { number: 116, symbol: 'Lv', name: 'livermorium', atomicMass: '-', row: 7, col: 16 },
    { number: 117, symbol: 'Ts', name: 'tennessine', atomicMass: '-', row: 7, col: 17 },
    { number: 118, symbol: 'Og', name: 'oganesson', atomicMass: '-', row: 7, col: 18 },
];

const lanthanides = [
    { number: 57, symbol: 'La', name: 'lanthanum', atomicMass: '138.9' },
    { number: 58, symbol: 'Ce', name: 'cerium', atomicMass: '140.1' },
    { number: 59, symbol: 'Pr', name: 'praseodymium', atomicMass: '140.9' },
    { number: 60, symbol: 'Nd', name: 'neodymium', atomicMass: '144.2' },
    { number: 61, symbol: 'Pm', name: 'promethium', atomicMass: '-' },
    { number: 62, symbol: 'Sm', name: 'samarium', atomicMass: '150.4' },
    { number: 63, symbol: 'Eu', name: 'europium', atomicMass: '152.0' },
    { number: 64, symbol: 'Gd', name: 'gadolinium', atomicMass: '157.3' },
    { number: 65, symbol: 'Tb', name: 'terbium', atomicMass: '158.9' },
    { number: 66, symbol: 'Dy', name: 'dysprosium', atomicMass: '162.5' },
    { number: 67, symbol: 'Ho', name: 'holmium', atomicMass: '164.9' },
    { number: 68, symbol: 'Er', name: 'erbium', atomicMass: '167.3' },
    { number: 69, symbol: 'Tm', name: 'thulium', atomicMass: '168.9' },
    { number: 70, symbol: 'Yb', name: 'ytterbium', atomicMass: '173.0' },
    { number: 71, symbol: 'Lu', name: 'lutetium', atomicMass: '175.0' },
];

const actinides = [
    { number: 89, symbol: 'Ac', name: 'actinium', atomicMass: '-' },
    { number: 90, symbol: 'Th', name: 'thorium', atomicMass: '232.0' },
    { number: 91, symbol: 'Pa', name: 'protactinium', atomicMass: '231.0' },
    { number: 92, symbol: 'U', name: 'uranium', atomicMass: '238.0' },
    { number: 93, symbol: 'Np', name: 'neptunium', atomicMass: '-' },
    { number: 94, symbol: 'Pu', name: 'plutonium', atomicMass: '-' },
    { number: 95, symbol: 'Am', name: 'americium', atomicMass: '-' },
    { number: 96, symbol: 'Cm', name: 'curium', atomicMass: '-' },
    { number: 97, symbol: 'Bk', name: 'berkelium', atomicMass: '-' },
    { number: 98, symbol: 'Cf', name: 'californium', atomicMass: '-' },
    { number: 99, symbol: 'Es', name: 'einsteinium', atomicMass: '-' },
    { number: 100, symbol: 'Fm', name: 'fermium', atomicMass: '-' },
    { number: 101, symbol: 'Md', name: 'mendelevium', atomicMass: '-' },
    { number: 102, symbol: 'No', name: 'nobelium', atomicMass: '-' },
    { number: 103, symbol: 'Lr', name: 'lawrencium', atomicMass: '-' },
];

const ElementCell = ({ el }) => (
    <div className="border border-foreground p-1 text-center leading-tight flex flex-col justify-center">
        <div className="text-xs text-right h-3">{el.number}</div>
        <div className="font-bold text-lg">{el.symbol}</div>
        <div className="text-[10px] capitalize h-3 truncate">{el.name}</div>
        <div className="text-xs h-3">{el.atomicMass}</div>
    </div>
);

const PlaceholderCell = ({ text }) => (
    <div className="border border-foreground p-1 text-center leading-tight flex items-center justify-center">
        <span className="text-xs">{text}</span>
    </div>
);

const Key = () => (
    <div className="border-2 border-foreground p-2 text-center h-full flex flex-col justify-center items-center col-span-10 row-span-2">
        <div className="font-bold">Key</div>
        <div className="text-xs mt-1">atomic number</div>
        <div className="text-sm font-bold">atomic symbol</div>
        <div className="text-xs">name</div>
        <div className="text-xs">relative atomic mass</div>
    </div>
);


export default function PeriodicTablePage() {
    return (
        <div className="p-4 sm:p-8 bg-background text-foreground font-serif">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-2 font-bold text-lg">Group</div>
                <div className="grid grid-cols-18 gap-0.5 text-center mb-4">
                    {[...Array(18)].map((_, i) => <div key={i} className="border border-foreground">{i + 1}</div>)}
                </div>

                <div className="grid grid-cols-18 gap-0.5">
                    {elements.map((el, index) => {
                        if (el.isLanthanidePlaceholder || el.isActinidePlaceholder) {
                            return <div key={index} style={{ gridRow: el.row, gridColumn: el.col }}><PlaceholderCell text={el.text} /></div>
                        }
                        return <div key={index} style={{ gridRow: el.row, gridColumn: el.col }}><ElementCell el={el} /></div>
                    })}
                     <div style={{ gridRow: 2, gridColumn: 3, gridColumnEnd: 13, gridRowEnd: 4 }}>
                        <Key />
                    </div>
                </div>

                <div className="mt-8">
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                        <div className="font-bold flex items-center justify-end">lanthanoids</div>
                        <div className="grid grid-cols-15 gap-0.5">
                            {lanthanides.map(el => <ElementCell key={el.number} el={el} />)}
                        </div>
                        <div className="font-bold flex items-center justify-end">actinoids</div>
                        <div className="grid grid-cols-15 gap-0.5">
                            {actinides.map(el => <ElementCell key={el.number} el={el} />)}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
