import React from "react";

export default function CategoryPanel({ 
  categories, 
  functions, 
  selectedCategory, 
  onSelectCategory, 
  onAddCalculation 
}) {
  const currentFunctions = functions.filter(fn => fn.category === selectedCategory);

  return (
    <div className="min-w-[260px] w-full md:w-[260px] bg-gray-50 border-r-2 border-gray-200 p-7">
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`w-full text-left px-3 py-2 rounded text-base font-semibold transition-colors ${
                  selectedCategory === category.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Functions */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Calculations</h3>
          <div className="space-y-1">
            {currentFunctions.map((fn) => (
              <button
                key={fn.id}
                onClick={() => onAddCalculation(fn.id)}
                className="w-full text-left px-3 py-2 rounded text-base font-normal text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {fn.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
