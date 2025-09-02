import React, { useState } from "react";
import { Sun, Moon, Eye } from "lucide-react";

export default function ThemeSettings() {
  const [selectedTheme, setSelectedTheme] = useState("light");

  const themes = [
    {
      id: "light",
      name: "Light",
      icon: Sun,
      description: "Clean and bright interface",
      preview: "bg-white border-gray-300"
    },
    {
      id: "dark",
      name: "Dark",
      icon: Moon,
      description: "Easy on the eyes in low light",
      preview: "bg-gray-900 border-gray-700"
    },
    {
      id: "high-contrast",
      name: "High Contrast",
      icon: Eye,
      description: "Maximum readability",
      preview: "bg-black border-white"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Theme Settings</h2>
      
      <div className="space-y-4">
        {themes.map((theme) => {
          const IconComponent = theme.icon;
          return (
            <div
              key={theme.id}
              className={`bg-white rounded-lg p-6 border-2 cursor-pointer transition-colors ${
                selectedTheme === theme.id ? "border-gray-900" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedTheme(theme.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-12 rounded border-2 ${theme.preview}`}></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="w-5 h-5" />
                    <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                  </div>
                  <p className="text-gray-600">{theme.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedTheme === theme.id ? "bg-gray-900 border-gray-900" : "border-gray-300"
                }`}>
                  {selectedTheme === theme.id && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> Theme changes will apply immediately and be saved to your account.
        </p>
      </div>
    </div>
  );
}
