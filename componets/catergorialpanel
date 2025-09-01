import React from "react";

export default function CategoryPanel({ 
  categories, 
  functions, 
  selectedCategory, 
  selectedFunctions, 
  onSelectCategory, 
  onToggleFunction 
}) {
  const currentFunctions = functions.filter(fn => fn.category === selectedCategory);
  const allFunctions = functions; // Show all functions from all categories

  return (
    <div className="min-w-[260px] w-[260px] bg-gray-50 border-r-2 border-gray-200 p-7">
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`w-full text-left px-2 py-1.5 rounded text-base font-semibold transition-colors ${
                  selectedCategory === category.id
                    ? "bg-gray-300 text-gray-900"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Functions - show all functions, organized by category */}
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryFunctions = functions.filter(fn => fn.category === category.id);
            return (
              <div key={category.id} className={selectedCategory === category.id ? "block" : "hidden"}>
                <div className="space-y-1">
                  {categoryFunctions.map((fn) => (
                    <button
                      key={fn.id}
                      onClick={() => onToggleFunction(fn.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-base font-semibold transition-colors ${
                        selectedFunctions.includes(fn.id)
                          ? "bg-gray-300 text-gray-900"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {fn.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
