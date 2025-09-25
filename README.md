# CHEMI - VCE Chemistry Calculator

An advanced web-based calculator application designed specifically for Victorian Certificate of Education (VCE) Chemistry students. Provides comprehensive calculation tools, study guides, and practice questions aligned with the VCE Chemistry curriculum.

## Features

- **13 Chemistry Calculators**: Mass to moles, molarity, ideal gas law, pH calculations, and more
- **Three Learning Modes**:
  - Normal: Basic calculations only
  - Study: Calculations with detailed study guides
  - Practice: Interactive questions with instant feedback
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **VCE Curriculum Aligned**: Content organized by Units 1-4 with Areas of Study
- **Educational Content**: Study tips, common errors, VCE connections, and practice problems

## Quick Start

1. Open `index.html` in a web browser
2. Select calculators from the left sidebar by VCE unit
3. Switch between Normal/Study/Practice modes using top menu
4. Add calculators to workspace and start calculating

---

## 🚧 Current Development Status & Next Steps

### **What We've Accomplished**
✅ **Core Application Structure**: Fully functional VCE Chemistry calculator with 13 different calculation types
✅ **Responsive Design**: Bootstrap-style percentage layouts working across all screen sizes
✅ **Study Guide System**: 3-column layout (Concept/Key Points/Errors | Examples/Practice | Extensions/VCE)
✅ **Mode Switching**: Normal, Study, and Practice mode infrastructure in place
✅ **Sticky Header**: Top menu stays visible when scrolling with transparent background
✅ **Copyright System**: Modal popup with comprehensive legal information
✅ **Unit Badge Alignment**: Clean, consistent sidebar navigation

### **🔧 Issues Currently Being Investigated**

#### **1. Practice Mode Functionality - NOT WORKING**
**Status**: ❌ **BROKEN** - Mode switching works, but interactive questions aren't loading properly
**Console Evidence**: Mode switches correctly (`practice` saved to localStorage), but questions don't appear
**Root Cause**: Layout update function may not be regenerating calculator HTML for practice mode
**Next Steps**: Debug `updateAllCalculatorsLayout()` function to ensure calculator HTML is rebuilt with practice mode questions

**Debug Output Analysis**:
```
🔄 Practice Mode - switchMode called with: practice
💾 Practice Mode - Mode saved to localStorage: practice
📋 Practice Mode - Found calculator cards: 1
```
✅ Mode switching works
❌ Questions not appearing in UI - HTML regeneration issue

#### **2. Sticky Header Behavior**
**Status**: CSS is correct but functionality may not be working consistently
**Next Steps**: Test scroll behavior and verify sticky positioning works across browsers

#### **3. Calculator Content Gaps**
**Current State**:
- ✅ **Complete Study/Practice Content** (5): mass-moles, ph-calculation, percent-yield, temperature-converter, h-concentration
- ⚠️ **Missing Study Tips/Practice Questions** (8): molar-mass, molarity, ideal-gas, limiting-reagent, dilution, heat-capacity, ion-charge, moles-mass

### **🎯 Priority Fixes Needed**

1. **HIGH PRIORITY**: 🚨 **Fix Practice Mode question loading**
   - Debug why calculator HTML isn't regenerating in practice mode
   - Ensure `isPracticeMode` conditional properly shows questions in columns 1 & 2
   - Investigate `updateAllCalculatorsLayout()` function

2. **MEDIUM PRIORITY**: Complete educational content for remaining 8 calculators
   - Add study tips with VCE connections
   - Create 2 practice questions each (16 total needed)

3. **LOW PRIORITY**: Verify sticky header works across all browsers/devices

### **🧪 Testing Practice Mode (Currently Broken)**
To debug Practice Mode issues:
1. Open browser console (F12)
2. Add Mass to Moles calculator (has complete content)
3. Switch to Practice mode - debug logs show mode switch works
4. ❌ **Issue**: "Switch to Practice Mode" button should appear but doesn't
5. ❌ **Issue**: Questions should appear in columns 1 & 2 but don't

### **📋 Development Notes**
- All calculator data is modular (JSON files in `/data/calculators/`)
- Practice mode uses 3-column grid: Q1 | Q2 | Return Button
- Study mode uses: Concept/Points/Errors | Examples/Switch Button | Extensions/VCE
- Console logging added throughout practice mode functions for debugging
- **CRITICAL**: Practice mode layout switching needs investigation

---

## Technology Stack

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Icons**: Font Awesome 6.0
- **Fonts**: Inter font family
- **Data**: JSON-based modular calculator definitions
- **Styling**: CSS Grid, Flexbox, CSS custom properties

## File Structure

```
CHEMI-main/
├── index.html              # Main application entry point
├── script.js               # Core application logic
├── style.css               # Application styling
├── data/
│   ├── calculator-index.json
│   ├── chemi.json          # Legacy calculator data
│   ├── ion_lookup.json     # Ion charge reference
│   └── calculators/        # Individual calculator definitions
│       ├── mass-moles.json
│       ├── ph-calculation.json
│       └── ...
└── README.md
```

## Contributing

This is a proprietary educational application. For licensing inquiries or support, please contact Linge.

## License

© 2025 Linge. All rights reserved.

**Version**: 1.0.0 (2025)