import React, { useState, useEffect } from 'react';
import { Download, Search, Plus, Trash2, Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserFormula } from '@/entities/UserFormula';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";


const FormulaSheet = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userFormulas, setUserFormulas] = useState([]);
  const [editingFormula, setEditingFormula] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadUserFormulas();
  }, []);

  const loadUserFormulas = async () => {
    try {
      const formulas = await UserFormula.list();
      setUserFormulas(formulas);
    } catch (error) {
      console.error("Could not load user formulas. Are you logged in?", error);
    }
  };

  const handlePrint = () => window.print();
  const formatHtml = (str) => str.replace(/(\d+)([+-]?)/g, (match, num, charge) => `<sub>${num}</sub>${charge ? `<sup>${charge}</sup>` : ''}`);

  const defaultFormulaCategories = [
    { category: 'Stoichiometry & Moles', items: [
        { formula: 'n = m / M', variables: 'n: moles, m: mass (g), M: molar mass (g/mol)' },
        { formula: 'n = N / N_A', variables: 'n: moles, N: number of particles, N_A: Avogadro\'s constant' },
    ]},
    // Add other default categories...
  ];

  const allCategories = [...defaultFormulaCategories];
  userFormulas.forEach(uf => {
    let category = allCategories.find(c => c.category === uf.category);
    if (!category) {
      category = { category: uf.category, items: [] };
      allCategories.push(category);
    }
    category.items.push({ id: uf.id, formula: uf.formula, variables: uf.variables, isUserDefined: true });
  });

  const handleSaveFormula = async (data) => {
    if (editingFormula && editingFormula.id) {
      await UserFormula.update(editingFormula.id, data);
    } else {
      await UserFormula.create(data);
    }
    await loadUserFormulas();
    setIsFormOpen(false);
    setEditingFormula(null);
  };
  
  const handleDeleteFormula = async (id) => {
    if(window.confirm("Are you sure you want to delete this formula?")) {
        await UserFormula.delete(id);
        await loadUserFormulas();
    }
  };

  const FormulaForm = ({ formula, onSave }) => {
    const [category, setCategory] = useState(formula?.category || '');
    const [formulaText, setFormulaText] = useState(formula?.formula || '');
    const [variables, setVariables] = useState(formula?.variables || '');

    const handleSubmit = () => {
      onSave({ category, formula: formulaText, variables });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{formula ? 'Edit' : 'Add'} Custom Formula</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <Input placeholder="Category (e.g., Organic Chemistry)" value={category} onChange={e => setCategory(e.target.value)} />
                <Input placeholder="Formula (e.g., R-OH)" value={formulaText} onChange={e => setFormulaText(e.target.value)} />
                <Textarea placeholder="Variables and notes" value={variables} onChange={e => setVariables(e.target.value)} />
            </div>
            <DialogFooter>
                <Button onClick={() => setIsFormOpen(false)} variant="outline">Cancel</Button>
                <Button onClick={handleSubmit}><Save className="w-4 h-4 mr-2" /> Save Formula</Button>
            </DialogFooter>
        </DialogContent>
    )
  };


  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 printable-area">
      <style>{`
        @media print { body * { visibility: hidden; } .printable-area, .printable-area * { visibility: visible; } .printable-area { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none; } }
        .formula-card { page-break-inside: avoid; }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 no-print gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Chemistry Reference Sheet</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input placeholder="Search formulas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-full" />
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setEditingFormula(null)} className="bg-gray-900 hover:bg-gray-800">
                    <Plus className="mr-2 h-4 w-4" /> Add Formula
                </Button>
            </DialogTrigger>
            <FormulaForm formula={editingFormula} onSave={handleSaveFormula} />
          </Dialog>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {allCategories
          .filter(cat => cat.items.some(item => item.formula.toLowerCase().includes(searchTerm.toLowerCase()) || item.variables.toLowerCase().includes(searchTerm.toLowerCase())))
          .map((cat) => (
          <section key={cat.category} className="formula-card bg-gray-50 p-6 rounded-lg border">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">{cat.category}</h2>
            <ul className="space-y-4">
              {cat.items
                .filter(item => item.formula.toLowerCase().includes(searchTerm.toLowerCase()) || item.variables.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item) => (
                <li key={item.formula} className="group flex justify-between items-start">
                  <div>
                    <p className="font-mono text-lg text-gray-900" dangerouslySetInnerHTML={{ __html: formatHtml(item.formula) }}></p>
                    <p className="text-sm text-gray-600 ml-2">{item.variables}</p>
                  </div>
                  {item.isUserDefined && (
                    <div className="no-print opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingFormula(item); setIsFormOpen(true); }}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteFormula(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default FormulaSheet;
