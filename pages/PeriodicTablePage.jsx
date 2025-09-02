import React, { useState } from "react";
import ElementDetails from "../components/periodic-table/ElementDetails";

const elements = [
    { number: 1, symbol: 'H', name: 'Hydrogen', atomicMass: 1.008, category: 'nonmetal', electronConfig: '1s¹', row: 1, col: 1, state: 'Gas', meltingPoint: -259.1, boilingPoint: -252.9, density: 0.00008988, discovery: 1766, uses: 'Fuel cells, ammonia production' },
    { number: 2, symbol: 'He', name: 'Helium', atomicMass: 4.0026, category: 'noble gas', electronConfig: '1s²', row: 1, col: 18, state: 'Gas', meltingPoint: -272.2, boilingPoint: -268.9, density: 0.0001785, discovery: 1868, uses: 'Balloons, cryogenics' },
    { number: 3, symbol: 'Li', name: 'Lithium', atomicMass: 6.94, category: 'alkali metal', electronConfig: '[He] 2s¹', row: 2, col: 1, state: 'Solid', meltingPoint: 180.5, boilingPoint: 1342, density: 0.534, discovery: 1817, uses: 'Batteries, ceramics' },
    { number: 4, symbol: 'Be', name: 'Beryllium', atomicMass: 9.0122, category: 'alkaline earth metal', electronConfig: '[He] 2s²', row: 2, col: 2, state: 'Solid', meltingPoint: 1287, boilingPoint: 2470, density: 1.85, discovery: 1798, uses: 'Aerospace, X-ray windows' },
    { number: 5, symbol: 'B', name: 'Boron', atomicMass: 10.81, category: 'metalloid', electronConfig: '[He] 2s² 2p¹', row: 2, col: 13, state: 'Solid', meltingPoint: 2077, boilingPoint: 4000, density: 2.34, discovery: 1808, uses: 'Glass, semiconductors' },
    { number: 6, symbol: 'C', name: 'Carbon', atomicMass: 12.011, category: 'nonmetal', electronConfig: '[He] 2s² 2p²', row: 2, col: 14, state: 'Solid', meltingPoint: 3550, boilingPoint: 4827, density: 2.267, discovery: 'Ancient', uses: 'Steel, diamonds, life' },
    { number: 7, symbol: 'N', name: 'Nitrogen', atomicMass: 14.007, category: 'nonmetal', electronConfig: '[He] 2s² 2p³', row: 2, col: 15, state: 'Gas', meltingPoint: -210.0, boilingPoint: -195.8, density: 0.0012506, discovery: 1772, uses: 'Fertilizers, explosives' },
    { number: 8, symbol: 'O', name: 'Oxygen', atomicMass: 15.999, category: 'nonmetal', electronConfig: '[He] 2s² 2p⁴', row: 2, col: 16, state: 'Gas', meltingPoint: -218.3, boilingPoint: -182.9, density: 0.001429, discovery: 1774, uses: 'Respiration, combustion' },
    { number: 9, symbol: 'F', name: 'Fluorine', atomicMass: 18.998, category: 'halogen', electronConfig: '[He] 2s² 2p⁵', row: 2, col: 17, state: 'Gas', meltingPoint: -219.6, boilingPoint: -188.1, density: 0.001696, discovery: 1670, uses: 'Toothpaste, refrigerants' },
    { number: 10, symbol: 'Ne', name: 'Neon', atomicMass: 20.180, category: 'noble gas', electronConfig: '[He] 2s² 2p⁶', row: 2, col: 18, state: 'Gas', meltingPoint: -248.6, boilingPoint: -246.1, density: 0.0008999, discovery: 1898, uses: 'Signs, lasers, cryogenics' },
    { number: 11, symbol: 'Na', name: 'Sodium', atomicMass: 22.990, category: 'alkali metal', electronConfig: '[Ne] 3s¹', row: 3, col: 1, state: 'Solid', meltingPoint: 97.8, boilingPoint: 883, density: 0.968, discovery: 1807, uses: 'Table salt, streetlights' },
    { number: 12, symbol: 'Mg', name: 'Magnesium', atomicMass: 24.305, category: 'alkaline earth metal', electronConfig: '[Ne] 3s²', row: 3, col: 2, state: 'Solid', meltingPoint: 650, boilingPoint: 1090, density: 1.738, discovery: 1808, uses: 'Alloys, fireworks' },
    { number: 13, symbol: 'Al', name: 'Aluminium', atomicMass: 26.982, category: 'post-transition metal', electronConfig: '[Ne] 3s² 3p¹', row: 3, col: 13, state: 'Solid', meltingPoint: 660.3, boilingPoint: 2519, density: 2.70, discovery: 1825, uses: 'Packaging, transportation' },
    { number: 14, symbol: 'Si', name: 'Silicon', atomicMass: 28.085, category: 'metalloid', electronConfig: '[Ne] 3s² 3p²', row: 3, col: 14, state: 'Solid', meltingPoint: 1414, boilingPoint: 3265, density: 2.3296, discovery: 1824, uses: 'Computer chips, solar cells' },
    { number: 15, symbol: 'P', name: 'Phosphorus', atomicMass: 30.974, category: 'nonmetal', electronConfig: '[Ne] 3s² 3p³', row: 3, col: 15, state: 'Solid', meltingPoint: 44.2, boilingPoint: 280.5, density: 1.823, discovery: 1669, uses: 'Fertilizers, matches, DNA' },
    { number: 16, symbol: 'S', name: 'Sulfur', atomicMass: 32.06, category: 'nonmetal', electronConfig: '[Ne] 3s² 3p⁴', row: 3, col: 16, state: 'Solid', meltingPoint: 115.2, boilingPoint: 444.6, density: 1.96, discovery: 'Ancient', uses: 'Gunpowder, sulfuric acid' },
    { number: 17, symbol: 'Cl', name: 'Chlorine', atomicMass: 35.45, category: 'halogen', electronConfig: '[Ne] 3s² 3p⁵', row: 3, col: 17, state: 'Gas', meltingPoint: -101.5, boilingPoint: -34.0, density: 0.003214, discovery: 1774, uses: 'Water purification, bleach' },
    { number: 18, symbol: 'Ar', name: 'Argon', atomicMass: 39.948, category: 'noble gas', electronConfig: '[Ne] 3s² 3p⁶', row: 3, col: 18, state: 'Gas', meltingPoint: -189.3, boilingPoint: -185.8, density: 0.001784, discovery: 1894, uses: 'Welding, light bulbs' },
    { number: 19, symbol: 'K', name: 'Potassium', atomicMass: 39.098, category: 'alkali metal', electronConfig: '[Ar] 4s¹', row: 4, col: 1, state: 'Solid', meltingPoint: 63.5, boilingPoint: 759, density: 0.856, discovery: 1807, uses: 'Fertilizers, soap' },
    { number: 20, symbol: 'Ca', name: 'Calcium', atomicMass: 40.078, category: 'alkaline earth metal', electronConfig: '[Ar] 4s²', row: 4, col: 2, state: 'Solid', meltingPoint: 842, boilingPoint: 1484, density: 1.55, discovery: 1808, uses: 'Bones, cement, plaster' },
    { number: 21, symbol: 'Sc', name: 'Scandium', atomicMass: 44.956, category: 'transition metal', electronConfig: '[Ar] 3d¹ 4s²', row: 4, col: 3, state: 'Solid', meltingPoint: 1541, boilingPoint: 2836, density: 2.985, discovery: 1879, uses: 'Aerospace alloys, stadium lighting' },
    { number: 22, symbol: 'Ti', name: 'Titanium', atomicMass: 47.867, category: 'transition metal', electronConfig: '[Ar] 3d² 4s²', row: 4, col: 4, state: 'Solid', meltingPoint: 1668, boilingPoint: 3287, density: 4.507, discovery: 1791, uses: 'Medical implants, aircraft' },
    { number: 23, symbol: 'V', name: 'Vanadium', atomicMass: 50.942, category: 'transition metal', electronConfig: '[Ar] 3d³ 4s²', row: 4, col: 5, state: 'Solid', meltingPoint: 1910, boilingPoint: 3407, density: 6.11, discovery: 1801, uses: 'Steel alloys, nuclear reactors' },
    { number: 24, symbol: 'Cr', name: 'Chromium', atomicMass: 51.996, category: 'transition metal', electronConfig: '[Ar] 3d⁵ 4s¹', row: 4, col: 6, state: 'Solid', meltingPoint: 1907, boilingPoint: 2671, density: 7.14, discovery: 1797, uses: 'Stainless steel, chrome plating' },
    { number: 25, symbol: 'Mn', name: 'Manganese', atomicMass: 54.938, category: 'transition metal', electronConfig: '[Ar] 3d⁵ 4s²', row: 4, col: 7, state: 'Solid', meltingPoint: 1246, boilingPoint: 2061, density: 7.47, discovery: 1774, uses: 'Steel production, batteries' },
    { number: 26, symbol: 'Fe', name: 'Iron', atomicMass: 55.845, category: 'transition metal', electronConfig: '[Ar] 3d⁶ 4s²', row: 4, col: 8, state: 'Solid', meltingPoint: 1538, boilingPoint: 2861, density: 7.874, discovery: 'Ancient', uses: 'Steel, construction, blood' },
    { number: 27, symbol: 'Co', name: 'Cobalt', atomicMass: 58.933, category: 'transition metal', electronConfig: '[Ar] 3d⁷ 4s²', row: 4, col: 9, state: 'Solid', meltingPoint: 1495, boilingPoint: 2927, density: 8.90, discovery: 1735, uses: 'Magnets, batteries, pigments' },
    { number: 28, symbol: 'Ni', name: 'Nickel', atomicMass: 58.693, category: 'transition metal', electronConfig: '[Ar] 3d⁸ 4s²', row: 4, col: 10, state: 'Solid', meltingPoint: 1455, boilingPoint: 2913, density: 8.908, discovery: 1751, uses: 'Alloys, coins, batteries' },
    { number: 29, symbol: 'Cu', name: 'Copper', atomicMass: 63.546, category: 'transition metal', electronConfig: '[Ar] 3d¹⁰ 4s¹', row: 4, col: 11, state: 'Solid', meltingPoint: 1084.6, boilingPoint: 2562, density: 8.92, discovery: 'Ancient', uses: 'Electrical wiring, plumbing' },
    { number: 30, symbol: 'Zn', name: 'Zinc', atomicMass: 65.38, category: 'transition metal', electronConfig: '[Ar] 3d¹⁰ 4s²', row: 4, col: 12, state: 'Solid', meltingPoint: 419.5, boilingPoint: 907, density: 7.14, discovery: 1746, uses: 'Galvanizing steel, batteries' },
    { number: 31, symbol: 'Ga', name: 'Gallium', atomicMass: 69.723, category: 'post-transition metal', electronConfig: '[Ar] 3d¹⁰ 4s² 4p¹', row: 4, col: 13, state: 'Solid', meltingPoint: 29.8, boilingPoint: 2204, density: 5.904, discovery: 1875, uses: 'Semiconductors, LEDs' },
    { number: 32, symbol: 'Ge', name: 'Germanium', atomicMass: 72.630, category: 'metalloid', electronConfig: '[Ar] 3d¹⁰ 4s² 4p²', row: 4, col: 14, state: 'Solid', meltingPoint: 938.3, boilingPoint: 2833, density: 5.323, discovery: 1886, uses: 'Fiber optics, infrared optics' },
    { number: 33, symbol: 'As', name: 'Arsenic', atomicMass: 74.922, category: 'metalloid', electronConfig: '[Ar] 3d¹⁰ 4s² 4p³', row: 4, col: 15, state: 'Solid', meltingPoint: 817, boilingPoint: 614, density: 5.727, discovery: 'Ancient', uses: 'Pesticides, semiconductors' },
    { number: 34, symbol: 'Se', name: 'Selenium', atomicMass: 78.971, category: 'nonmetal', electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁴', row: 4, col: 16, state: 'Solid', meltingPoint: 221, boilingPoint: 685, density: 4.81, discovery: 1817, uses: 'Photocopiers, glass manufacturing' },
    { number: 35, symbol: 'Br', name: 'Bromine', atomicMass: 79.904, category: 'halogen', electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁵', row: 4, col: 17, state: 'Liquid', meltingPoint: -7.2, boilingPoint: 58.8, density: 3.12, discovery: 1826, uses: 'Flame retardants, pharmaceuticals' },
    { number: 36, symbol: 'Kr', name: 'Krypton', atomicMass: 83.798, category: 'noble gas', electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁶', row: 4, col: 18, state: 'Gas', meltingPoint: -157.4, boilingPoint: -153.2, density: 0.00375, discovery: 1898, uses: 'Lighting, lasers' },
    { number: 37, symbol: 'Rb', name: 'Rubidium', atomicMass: 85.468, category: 'alkali metal', electronConfig: '[Kr] 5s¹', row: 5, col: 1, state: 'Solid', meltingPoint: 39.3, boilingPoint: 688, density: 1.532, discovery: 1861, uses: 'Atomic clocks, photocells' },
    { number: 38, symbol: 'Sr', name: 'Strontium', atomicMass: 87.62, category: 'alkaline earth metal', electronConfig: '[Kr] 5s²', row: 5, col: 2, state: 'Solid', meltingPoint: 777, boilingPoint: 1382, density: 2.63, discovery: 1790, uses: 'Fireworks (red color), TV screens' },
    { number: 39, symbol: 'Y', name: 'Yttrium', atomicMass: 88.906, category: 'transition metal', electronConfig: '[Kr] 4d¹ 5s²', row: 5, col: 3, state: 'Solid', meltingPoint: 1526, boilingPoint: 3338, density: 4.472, discovery: 1794, uses: 'Lasers, superconductors, phosphors' },
    { number: 40, symbol: 'Zr', name: 'Zirconium', atomicMass: 91.224, category: 'transition metal', electronConfig: '[Kr] 4d² 5s²', row: 5, col: 4, state: 'Solid', meltingPoint: 1855, boilingPoint: 4409, density: 6.52, discovery: 1789, uses: 'Nuclear reactors, ceramics' },
    { number: 41, symbol: 'Nb', name: 'Niobium', atomicMass: 92.906, category: 'transition metal', electronConfig: '[Kr] 4d⁴ 5s¹', row: 5, col: 5, state: 'Solid', meltingPoint: 2477, boilingPoint: 4744, density: 8.57, discovery: 1801, uses: 'Superconducting magnets, steel alloys' },
    { number: 42, symbol: 'Mo', name: 'Molybdenum', atomicMass: 95.95, category: 'transition metal', electronConfig: '[Kr] 4d⁵ 5s¹', row: 5, col: 6, state: 'Solid', meltingPoint: 2623, boilingPoint: 4639, density: 10.28, discovery: 1778, uses: 'High-strength alloys, catalysts' },
    { number: 43, symbol: 'Tc', name: 'Technetium', atomicMass: '(98)', category: 'transition metal', electronConfig: '[Kr] 4d⁵ 5s²', row: 5, col: 7, state: 'Solid', meltingPoint: 2157, boilingPoint: 4265, density: 11.5, discovery: 1937, uses: 'Medical imaging (radiotracer)' },
    { number: 44, symbol: 'Ru', name: 'Ruthenium', atomicMass: 101.07, category: 'transition metal', electronConfig: '[Kr] 4d⁷ 5s¹', row: 5, col: 8, state: 'Solid', meltingPoint: 2334, boilingPoint: 4150, density: 12.37, discovery: 1844, uses: 'Electrical contacts, catalysts' },
    { number: 45, symbol: 'Rh', name: 'Rhodium', atomicMass: 102.906, category: 'transition metal', electronConfig: '[Kr] 4d⁸ 5s¹', row: 5, col: 9, state: 'Solid', meltingPoint: 1964, boilingPoint: 3695, density: 12.45, discovery: 1803, uses: 'Catalytic converters, jewelry plating' },
    { number: 46, symbol: 'Pd', name: 'Palladium', atomicMass: 106.42, category: 'transition metal', electronConfig: '[Kr] 4d¹⁰', row: 5, col: 10, state: 'Solid', meltingPoint: 1555, boilingPoint: 2963, density: 12.023, discovery: 1803, uses: 'Catalytic converters, dentistry' },
    { number: 47, symbol: 'Ag', name: 'Silver', atomicMass: 107.868, category: 'transition metal', electronConfig: '[Kr] 4d¹⁰ 5s¹', row: 5, col: 11, state: 'Solid', meltingPoint: 961.8, boilingPoint: 2162, density: 10.49, discovery: 'Ancient', uses: 'Jewelry, photography, coins' },
    { number: 48, symbol: 'Cd', name: 'Cadmium', atomicMass: 112.414, category: 'transition metal', electronConfig: '[Kr] 4d¹⁰ 5s²', row: 5, col: 12, state: 'Solid', meltingPoint: 321.1, boilingPoint: 767, density: 8.65, discovery: 1817, uses: 'Batteries, pigments' },
    { number: 49, symbol: 'In', name: 'Indium', atomicMass: 114.818, category: 'post-transition metal', electronConfig: '[Kr] 4d¹⁰ 5s² 5p¹', row: 5, col: 13, state: 'Solid', meltingPoint: 156.6, boilingPoint: 2072, density: 7.31, discovery: 1863, uses: 'LCD screens, solder' },
    { number: 50, symbol: 'Sn', name: 'Tin', atomicMass: 118.71, category: 'post-transition metal', electronConfig: '[Kr] 4d¹⁰ 5s² 5p²', row: 5, col: 14, state: 'Solid', meltingPoint: 232.0, boilingPoint: 2602, density: 7.31, discovery: 'Ancient', uses: 'Solder, tin plating, bronze' },
    { number: 51, symbol: 'Sb', name: 'Antimony', atomicMass: 121.76, category: 'metalloid', electronConfig: '[Kr] 4d¹⁰ 5s² 5p³', row: 5, col: 15, state: 'Solid', meltingPoint: 630.6, boilingPoint: 1587, density: 6.697, discovery: 'Ancient', uses: 'Flame retardants, batteries' },
    { number: 52, symbol: 'Te', name: 'Tellurium', atomicMass: 127.60, category: 'metalloid', electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁴', row: 5, col: 16, state: 'Solid', meltingPoint: 449.5, boilingPoint: 988, density: 6.24, discovery: 1782, uses: 'Alloys, semiconductors' },
    { number: 53, symbol: 'I', name: 'Iodine', atomicMass: 126.90, category: 'halogen', electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁵', row: 5, col: 17, state: 'Solid', meltingPoint: 113.7, boilingPoint: 184.3, density: 4.933, discovery: 1811, uses: 'Antiseptics, photography' },
    { number: 54, symbol: 'Xe', name: 'Xenon', atomicMass: 131.29, category: 'noble gas', electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁶', row: 5, col: 18, state: 'Gas', meltingPoint: -111.8, boilingPoint: -108.0, density: 0.0059, discovery: 1898, uses: 'Headlights, lasers, anaesthetic' },
    { number: 55, symbol: 'Cs', name: 'Caesium', atomicMass: 132.91, category: 'alkali metal', electronConfig: '[Xe] 6s¹', row: 6, col: 1, state: 'Solid', meltingPoint: 28.5, boilingPoint: 671, density: 1.93, discovery: 1860, uses: 'Atomic clocks, drilling fluids' },
    { number: 56, symbol: 'Ba', name: 'Barium', atomicMass: 137.33, category: 'alkaline earth metal', electronConfig: '[Xe] 6s²', row: 6, col: 2, state: 'Solid', meltingPoint: 727, boilingPoint: 1897, density: 3.51, discovery: 1808, uses: 'X-ray imaging, fireworks (green)' },
    { number: 57, symbol: 'La', name: 'Lanthanum', atomicMass: 138.91, category: 'lanthanide', electronConfig: '[Xe] 5d¹ 6s²', row: 8, col: 3, state: 'Solid', meltingPoint: 920, boilingPoint: 3464, density: 6.146, discovery: 1839, uses: 'Camera lenses, battery electrodes' },
    { number: 58, symbol: 'Ce', name: 'Cerium', atomicMass: 140.12, category: 'lanthanide', electronConfig: '[Xe] 4f¹ 5d¹ 6s²', row: 8, col: 4, state: 'Solid', meltingPoint: 795, boilingPoint: 3443, density: 6.770, discovery: 1803, uses: 'Flints, catalytic converters' },
    { number: 59, symbol: 'Pr', name: 'Praseodymium', atomicMass: 140.91, category: 'lanthanide', electronConfig: '[Xe] 4f³ 6s²', row: 8, col: 5, state: 'Solid', meltingPoint: 935, boilingPoint: 3520, density: 6.77, discovery: 1885, uses: 'Magnets, aircraft engines' },
    { number: 60, symbol: 'Nd', name: 'Neodymium', atomicMass: 144.24, category: 'lanthanide', electronConfig: '[Xe] 4f⁴ 6s²', row: 8, col: 6, state: 'Solid', meltingPoint: 1024, boilingPoint: 3074, density: 7.01, discovery: 1885, uses: 'Powerful magnets, lasers' },
    { number: 61, symbol: 'Pm', name: 'Promethium', atomicMass: '(145)', category: 'lanthanide', electronConfig: '[Xe] 4f⁵ 6s²', row: 8, col: 7, state: 'Solid', meltingPoint: 1042, boilingPoint: 3000, density: 7.26, discovery: 1945, uses: 'Luminous paint, atomic batteries' },
    { number: 62, symbol: 'Sm', name: 'Samarium', atomicMass: 150.36, category: 'lanthanide', electronConfig: '[Xe] 4f⁶ 6s²', row: 8, col: 8, state: 'Solid', meltingPoint: 1072, boilingPoint: 1794, density: 7.52, discovery: 1879, uses: 'Magnets, nuclear reactors' },
    { number: 63, symbol: 'Eu', name: 'Europium', atomicMass: 151.96, category: 'lanthanide', electronConfig: '[Xe] 4f⁷ 6s²', row: 8, col: 9, state: 'Solid', meltingPoint: 826, boilingPoint: 1529, density: 5.244, discovery: 1901, uses: 'TV phosphors (red), lasers' },
    { number: 64, symbol: 'Gd', name: 'Gadolinium', atomicMass: 157.25, category: 'lanthanide', electronConfig: '[Xe] 4f⁷ 5d¹ 6s²', row: 8, col: 10, state: 'Solid', meltingPoint: 1312, boilingPoint: 3273, density: 7.90, discovery: 1880, uses: 'MRI contrast agent, nuclear reactors' },
    { number: 65, symbol: 'Tb', name: 'Terbium', atomicMass: 158.93, category: 'lanthanide', electronConfig: '[Xe] 4f⁹ 6s²', row: 8, col: 11, state: 'Solid', meltingPoint: 1356, boilingPoint: 3230, density: 8.23, discovery: 1843, uses: 'Phosphors (green), sonar systems' },
    { number: 66, symbol: 'Dy', name: 'Dysprosium', atomicMass: 162.50, category: 'lanthanide', electronConfig: '[Xe] 4f¹⁰ 6s²', row: 8, col: 12, state: 'Solid', meltingPoint: 1412, boilingPoint: 2567, density: 8.551, discovery: 1886, uses: 'Magnets in hybrid cars, lasers' },
    { number: 67, symbol: 'Ho', name: 'Holmium', atomicMass: 164.93, category: 'lanthanide', electronConfig: '[Xe] 4f¹¹ 6s²', row: 8, col: 13, state: 'Solid', meltingPoint: 1474, boilingPoint: 2700, density: 8.79, discovery: 1878, uses: 'Magnetic flux concentrators, lasers' },
    { number: 68, symbol: 'Er', name: 'Erbium', atomicMass: 167.26, category: 'lanthanide', electronConfig: '[Xe] 4f¹² 6s²', row: 8, col: 14, state: 'Solid', meltingPoint: 1529, boilingPoint: 2868, density: 9.066, discovery: 1843, uses: 'Fiber optics, lasers (pink)' },
    { number: 69, symbol: 'Tm', name: 'Thulium', atomicMass: 168.93, category: 'lanthanide', electronConfig: '[Xe] 4f¹³ 6s²', row: 8, col: 15, state: 'Solid', meltingPoint: 1545, boilingPoint: 1950, density: 9.32, discovery: 1879, uses: 'Portable X-ray machines' },
    { number: 70, symbol: 'Yb', name: 'Ytterbium', atomicMass: 173.04, category: 'lanthanide', electronConfig: '[Xe] 4f¹⁴ 6s²', row: 8, col: 16, state: 'Solid', meltingPoint: 824, boilingPoint: 1196, density: 6.90, discovery: 1878, uses: 'Fiber optic amplifiers, lasers' },
    { number: 71, symbol: 'Lu', name: 'Lutetium', atomicMass: 174.97, category: 'lanthanide', electronConfig: '[Xe] 4f¹⁴ 5d¹ 6s²', row: 8, col: 17, state: 'Solid', meltingPoint: 1663, boilingPoint: 3402, density: 9.841, discovery: 1907, uses: 'Catalysts in petroleum refining' },
    { number: 72, symbol: 'Hf', name: 'Hafnium', atomicMass: 178.49, category: 'transition metal', electronConfig: '[Xe] 4f¹⁴ 5d² 6s²', row: 6, col: 4, state: 'Solid', meltingPoint: 2233, boilingPoint: 4603, density: 13.31, discovery: 1923, uses: 'Nuclear control rods, microchips' },
    { number: 73, symbol: 'Ta', name: 'Tantalum', atomicMass: 180.95, category: 'transition metal', electronConfig: '[Xe] 4f¹⁴ 5d³ 6s²', row: 6, col: 5, state: 'Solid', meltingPoint: 3017, boilingPoint: 5458, density: 16.69, discovery: 1802, uses: 'Electronic capacitors (phones)' },
    { number: 74, symbol: 'W', name: 'Tungsten', atomicMass: 183.84, category: 'transition metal', electronConfig: '[Xe] 4f¹⁴ 5d⁴ 6s²', row: 6, col: 6, state: 'Solid', meltingPoint: 3422, boilingPoint: 5555, density: 19.25, discovery: 1783, uses: 'Light bulb filaments, cutting tools' },
    { number: 75, symbol: 'Re', name: 'Rhenium', atomicMass: 186.21, category: 'transition metal', electronConfig: '[Xe] 4f¹⁴ 5d⁵ 6s²', row: 6, col: 7, state: 'Solid', meltingPoint: 3186, boilingPoint: 5596, density: 21.02, discovery: 1925, uses: 'Jet engines, rocket components' },
    { number: 76, symbol: 'Os', name: 'Osmium', atomicMass: 190.23, category: 'transition metal', electronConfig: '[Xe] 4f¹⁴ 5d⁶ 6s²', row: 6, col: 8, state: 'Solid', meltingPoint: 3033, boilingPoint: 5012, density: 22.59, discovery: 1803, uses: 'Fountain pen tips, electrical contacts' },
    { number: 77, symbol: 'Ir', name: 'Iridium', atomicMass: 192.22, category: 'transition metal', electronConfig: '[Xe] 4f¹⁴ 5d⁷ 6s²', row: 6, col: 9, state: 'Solid', meltingPoint: 2466, boilingPoint: 4428, density: 22.56, discovery: 1803, uses: 'Spark plugs, crucibles' },
    { number: 78, symbol: 'Pt', name: 'Platinum', atomicMass: 195.08, category: 'transition metal', electronConfig: '[Xe] 4f¹⁴ 5d⁹ 6s¹', row: 6, col: 10, state: 'Solid', meltingPoint: 1768, boilingPoint: 3825, density: 21.45, discovery: 1735, uses: 'Catalytic converters, jewelry' },
    { number: 79, symbol: 'Au', name: 'Gold', atomicMass: 196.97, category: 'transition metal', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', row: 6, col: 11, state: 'Solid', meltingPoint: 1064, boilingPoint: 2856, density: 19.30, discovery: 'Ancient', uses: 'Jewelry, currency, electronics' },
    { number: 80, symbol: 'Hg', name: 'Mercury', atomicMass: 200.59, category: 'post-transition metal', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', row: 6, col: 12, state: 'Liquid', meltingPoint: -38.8, boilingPoint: 356.7, density: 13.534, discovery: 'Ancient', uses: 'Thermometers, switches' },
    { number: 81, symbol: 'Tl', name: 'Thallium', atomicMass: 204.38, category: 'post-transition metal', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', row: 6, col: 13, state: 'Solid', meltingPoint: 304, boilingPoint: 1473, density: 11.85, discovery: 1861, uses: 'Fiber optics, rat poison (historical)' },
    { number: 82, symbol: 'Pb', name: 'Lead', atomicMass: 207.2, category: 'post-transition metal', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', row: 6, col: 14, state: 'Solid', meltingPoint: 327.5, boilingPoint: 1749, density: 11.34, discovery: 'Ancient', uses: 'Batteries, radiation shielding' },
    { number: 83, symbol: 'Bi', name: 'Bismuth', atomicMass: 208.98, category: 'post-transition metal', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', row: 6, col: 15, state: 'Solid', meltingPoint: 271.4, boilingPoint: 1564, density: 9.78, discovery: 'Ancient', uses: 'Fire sprinklers, medicine' },
    { number: 84, symbol: 'Po', name: 'Polonium', atomicMass: '(209)', category: 'post-transition metal', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', row: 6, col: 16, state: 'Solid', meltingPoint: 254, boilingPoint: 962, density: 9.20, discovery: 1898, uses: 'Anti-static devices, nuclear science' },
    { number: 85, symbol: 'At', name: 'Astatine', atomicMass: '(210)', category: 'halogen', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', row: 6, col: 17, state: 'Solid', meltingPoint: 302, boilingPoint: 337, density: 6.35, discovery: 1940, uses: 'Cancer therapy research' },
    { number: 86, symbol: 'Rn', name: 'Radon', atomicMass: '(222)', category: 'noble gas', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', row: 6, col: 18, state: 'Gas', meltingPoint: -71, boilingPoint: -61.7, density: 0.00973, discovery: 1900, uses: 'Radiation therapy (historical)' },
    { number: 87, symbol: 'Fr', name: 'Francium', atomicMass: '(223)', category: 'alkali metal', electronConfig: '[Rn] 7s¹', row: 7, col: 1, state: 'Solid', meltingPoint: 27, boilingPoint: 677, density: 1.87, discovery: 1939, uses: 'Scientific research only' },
    { number: 88, symbol: 'Ra', name: 'Radium', atomicMass: '(226)', category: 'alkaline earth metal', electronConfig: '[Rn] 7s²', row: 7, col: 2, state: 'Solid', meltingPoint: 700, boilingPoint: 1737, density: 5.5, discovery: 1898, uses: 'Luminous paint (historical)' },
    { number: 89, symbol: 'Ac', name: 'Actinium', atomicMass: '(227)', category: 'actinide', electronConfig: '[Rn] 6d¹ 7s²', row: 9, col: 3, state: 'Solid', meltingPoint: 1050, boilingPoint: 3200, density: 10.07, discovery: 1899, uses: 'Neutron source' },
    { number: 90, symbol: 'Th', name: 'Thorium', atomicMass: 232.04, category: 'actinide', electronConfig: '[Rn] 6d² 7s²', row: 9, col: 4, state: 'Solid', meltingPoint: 1750, boilingPoint: 4788, density: 11.72, discovery: 1829, uses: 'Gas mantles, nuclear fuel research' },
    { number: 91, symbol: 'Pa', name: 'Protactinium', atomicMass: 231.04, category: 'actinide', electronConfig: '[Rn] 5f² 6d¹ 7s²', row: 9, col: 5, state: 'Solid', meltingPoint: 1572, boilingPoint: 4027, density: 15.37, discovery: 1913, uses: 'Scientific research only' },
    { number: 92, symbol: 'U', name: 'Uranium', atomicMass: 238.03, category: 'actinide', electronConfig: '[Rn] 5f³ 6d¹ 7s²', row: 9, col: 6, state: 'Solid', meltingPoint: 1135, boilingPoint: 4131, density: 19.1, discovery: 1789, uses: 'Nuclear fuel, weapons' },
    { number: 93, symbol: 'Np', name: 'Neptunium', atomicMass: '(237)', category: 'actinide', electronConfig: '[Rn] 5f⁴ 6d¹ 7s²', row: 9, col: 7, state: 'Solid', meltingPoint: 644, boilingPoint: 3902, density: 20.45, discovery: 1940, uses: 'Scientific research, neutron detection' },
    { number: 94, symbol: 'Pu', name: 'Plutonium', atomicMass: '(244)', category: 'actinide', electronConfig: '[Rn] 5f⁶ 7s²', row: 9, col: 8, state: 'Solid', meltingPoint: 640, boilingPoint: 3228, density: 19.816, discovery: 1940, uses: 'Nuclear weapons, spacecraft power' },
    { number: 95, symbol: 'Am', name: 'Americium', atomicMass: '(243)', category: 'actinide', electronConfig: '[Rn] 5f⁷ 7s²', row: 9, col: 9, state: 'Solid', meltingPoint: 1176, boilingPoint: 2011, density: 12, discovery: 1944, uses: 'Smoke detectors' },
    { number: 96, symbol: 'Cm', name: 'Curium', atomicMass: '(247)', category: 'actinide', electronConfig: '[Rn] 5f⁷ 6d¹ 7s²', row: 9, col: 10, state: 'Solid', meltingPoint: 1345, boilingPoint: 3110, density: 13.51, discovery: 1944, uses: 'Scientific research' },
    { number: 97, symbol: 'Bk', name: 'Berkelium', atomicMass: '(247)', category: 'actinide', electronConfig: '[Rn] 5f⁹ 7s²', row: 9, col: 11, state: 'Solid', meltingPoint: 986, boilingPoint: 2627, density: 14.78, discovery: 1949, uses: 'Scientific research only' },
    { number: 98, symbol: 'Cf', name: 'Californium', atomicMass: '(251)', category: 'actinide', electronConfig: '[Rn] 5f¹⁰ 7s²', row: 9, col: 12, state: 'Solid', meltingPoint: 900, boilingPoint: 1470, density: 15.1, discovery: 1950, uses: 'Neutron source, cancer treatment' },
    { number: 99, symbol: 'Es', name: 'Einsteinium', atomicMass: '(252)', category: 'actinide', electronConfig: '[Rn] 5f¹¹ 7s²', row: 9, col: 13, state: 'Solid', meltingPoint: 860, boilingPoint: 996, density: 8.84, discovery: 1952, uses: 'Scientific research only' },
    { number: 100, symbol: 'Fm', name: 'Fermium', atomicMass: '(257)', category: 'actinide', electronConfig: '[Rn] 5f¹² 7s²', row: 9, col: 14, state: 'Solid', meltingPoint: 1527, boilingPoint: null, density: null, discovery: 1952, uses: 'Scientific research only' },
    { number: 101, symbol: 'Md', name: 'Mendelevium', atomicMass: '(258)', category: 'actinide', electronConfig: '[Rn] 5f¹³ 7s²', row: 9, col: 15, state: 'Solid', meltingPoint: 827, boilingPoint: null, density: null, discovery: 1955, uses: 'Scientific research only' },
    { number: 102, symbol: 'No', name: 'Nobelium', atomicMass: '(259)', category: 'actinide', electronConfig: '[Rn] 5f¹⁴ 7s²', row: 9, col: 16, state: 'Solid', meltingPoint: 827, boilingPoint: null, density: null, discovery: 1958, uses: 'Scientific research only' },
    { number: 103, symbol: 'Lr', name: 'Lawrencium', atomicMass: '(262)', category: 'actinide', electronConfig: '[Rn] 5f¹⁴ 7s² 7p¹', row: 9, col: 17, state: 'Solid', meltingPoint: 1627, boilingPoint: null, density: null, discovery: 1961, uses: 'Scientific research only' },
    { number: 104, symbol: 'Rf', name: 'Rutherfordium', atomicMass: '(267)', category: 'transition metal', electronConfig: '[Rn] 5f¹⁴ 6d² 7s²', row: 7, col: 4, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 1964, uses: 'Scientific research only' },
    { number: 105, symbol: 'Db', name: 'Dubnium', atomicMass: '(268)', category: 'transition metal', electronConfig: '[Rn] 5f¹⁴ 6d³ 7s²', row: 7, col: 5, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 1968, uses: 'Scientific research only' },
    { number: 106, symbol: 'Sg', name: 'Seaborgium', atomicMass: '(269)', category: 'transition metal', electronConfig: '[Rn] 5f¹⁴ 6d⁴ 7s²', row: 7, col: 6, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 1974, uses: 'Scientific research only' },
    { number: 107, symbol: 'Bh', name: 'Bohrium', atomicMass: '(270)', category: 'transition metal', electronConfig: '[Rn] 5f¹⁴ 6d⁵ 7s²', row: 7, col: 7, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 1976, uses: 'Scientific research only' },
    { number: 108, symbol: 'Hs', name: 'Hassium', atomicMass: '(277)', category: 'transition metal', electronConfig: '[Rn] 5f¹⁴ 6d⁶ 7s²', row: 7, col: 8, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 1984, uses: 'Scientific research only' },
    { number: 109, symbol: 'Mt', name: 'Meitnerium', atomicMass: '(278)', category: 'transition metal', electronConfig: '[Rn] 5f¹⁴ 6d⁷ 7s²', row: 7, col: 9, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 1982, uses: 'Scientific research only' },
    { number: 110, symbol: 'Ds', name: 'Darmstadtium', atomicMass: '(281)', category: 'transition metal', electronConfig: '[Rn] 5f¹⁴ 6d⁹ 7s¹', row: 7, col: 10, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 1994, uses: 'Scientific research only' },
    { number: 111, symbol: 'Rg', name: 'Roentgenium', atomicMass: '(282)', category: 'transition metal', electronConfig: '[Rn] 5f¹⁴ 6d⁹ 7s²', row: 7, col: 11, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 1994, uses: 'Scientific research only' },
    { number: 112, symbol: 'Cn', name: 'Copernicium', atomicMass: '(285)', category: 'transition metal', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', row: 7, col: 12, state: 'Gas', meltingPoint: null, boilingPoint: null, density: null, discovery: 1996, uses: 'Scientific research only' },
    { number: 113, symbol: 'Nh', name: 'Nihonium', atomicMass: '(286)', category: 'post-transition metal', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', row: 7, col: 13, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 2003, uses: 'Scientific research only' },
    { number: 114, symbol: 'Fl', name: 'Flerovium', atomicMass: '(289)', category: 'post-transition metal', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', row: 7, col: 14, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 1998, uses: 'Scientific research only' },
    { number: 115, symbol: 'Mc', name: 'Moscovium', atomicMass: '(290)', category: 'post-transition metal', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', row: 7, col: 15, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 2003, uses: 'Scientific research only' },
    { number: 116, symbol: 'Lv', name: 'Livermorium', atomicMass: '(293)', category: 'post-transition metal', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', row: 7, col: 16, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 2000, uses: 'Scientific research only' },
    { number: 117, symbol: 'Ts', name: 'Tennessine', atomicMass: '(294)', category: 'halogen', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', row: 7, col: 17, state: 'Solid', meltingPoint: null, boilingPoint: null, density: null, discovery: 2010, uses: 'Scientific research only' },
    { number: 118, symbol: 'Og', name: 'Oganesson', atomicMass: '(294)', category: 'noble gas', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', row: 7, col: 18, state: 'Gas', meltingPoint: null, boilingPoint: null, density: null, discovery: 2002, uses: 'Scientific research only' },
];

export default function PeriodicTablePage() {
  const [selectedElement, setSelectedElement] = useState(elements.find(e => e.number === 1));

  const getElementColor = (category) => {
    const colors = {
      "alkali metal": "bg-red-200 hover:bg-red-300 border-red-300",
      "alkaline earth metal": "bg-orange-200 hover:bg-orange-300 border-orange-300",
      "transition metal": "bg-yellow-200 hover:bg-yellow-300 border-yellow-300",
      "post-transition metal": "bg-green-200 hover:bg-green-300 border-green-300",
      "metalloid": "bg-blue-200 hover:bg-blue-300 border-blue-300",
      "nonmetal": "bg-purple-200 hover:bg-purple-300 border-purple-300",
      "halogen": "bg-pink-200 hover:bg-pink-300 border-pink-300",
      "noble gas": "bg-indigo-200 hover:bg-indigo-300 border-indigo-300",
      "lanthanide": "bg-teal-200 hover:bg-teal-300 border-teal-300",
      "actinide": "bg-cyan-200 hover:bg-cyan-300 border-cyan-300",
    };
    return colors[category] || "bg-gray-200 hover:bg-gray-300 border-gray-300";
  };

  const ElementTile = ({ element }) => (
    <div
      style={{ gridRow: element.row, gridColumn: element.col }}
      className={`p-1 border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-xs font-medium ${getElementColor(element.category)} ${
        selectedElement?.number === element.number ? "ring-2 ring-gray-900 ring-offset-1 scale-105 z-10" : ""
      }`}
      onClick={() => setSelectedElement(element)}
    >
      <div className="text-xs font-bold self-start pl-0.5">{element.number}</div>
      <div className="text-lg font-bold">{element.symbol}</div>
      <div className="text-[10px] truncate w-full text-center leading-tight">{element.name}</div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Periodic Table</h1>
          <p className="text-gray-600">Click on any element to explore its properties</p>
        </div>

        <div className="grid grid-cols-18 grid-rows-9 gap-1 max-w-7xl mx-auto">
          {elements.map(el => <ElementTile key={el.number} element={el} />)}
        </div>

        <div className="max-w-7xl mx-auto mt-8">
            <ElementDetails element={selectedElement} isSelected={!!selectedElement} />
        </div>

        {/* Legend */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs max-w-3xl mx-auto">
          {[
            { category: "alkali metal", name: "Alkali Metal" }, { category: "alkaline earth metal", name: "Alkaline Earth" },
            { category: "lanthanide", name: "Lanthanide" }, { category: "actinide", name: "Actinide" },
            { category: "transition metal", name: "Transition Metal" }, { category: "post-transition metal", name: "Post-transition" },
            { category: "metalloid", name: "Metalloid" }, { category: "halogen", name: "Halogen" },
            { category: "nonmetal", name: "Other Nonmetal" }, { category: "noble gas", name: "Noble Gas" },
          ].map(({ category, name }) => (
            <div key={category} className="flex items-center gap-2">
              <div className={`w-4 h-4 border-2 ${getElementColor(category)}`}></div>
              <span>{name}</span>
            </div>
          ))}
        </div>
    </div>
  );
}
