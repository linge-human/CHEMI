import React, { useContext } from "react";
import { Sun, Moon, Eye } from "lucide-react";
import { ThemeContext } from "../../layout";

export default function ThemeSettings() {
  const { theme: selectedTheme, setTheme } = useContext(ThemeContext);

  const themes = [
    { id: "light", name: "Light", icon: Sun, preview: "bg-white border-gray-300" },
    { id: "dark", name: "Dark", icon: Moon, preview: "bg-gray-900 border-gray-700" },
    { id: "high-contrast", name: "High Contrast", icon: Eye, preview: "bg-black border-white" }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-foreground">Theme</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes.map((theme) => {
          const IconComponent = theme.icon;
          return (
            <div
              key={theme.id}
              className={`rounded-lg p-4 border-2 cursor-pointer transition-all ${
                selectedTheme === theme.id ? "border-primary scale-105" : "border-border hover:border-muted-foreground"
              }`}
              onClick={() => setTheme(theme.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border-2 ${theme.preview} flex-shrink-0`}></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-foreground" />
                    <h4 className="font-semibold text-foreground">{theme.name}</h4>
                  </div>
                </div>
                {selectedTheme === theme.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 bg-background rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
