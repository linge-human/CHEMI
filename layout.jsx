import React, { useState, createContext, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings } from "lucide-react";

export const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className={theme}>
        <style jsx global>{`
          :root {
            --background: hsl(0 0% 100%);
            --foreground: hsl(0 0% 3.9%);
            --card: hsl(0 0% 100%);
            --card-foreground: hsl(0 0% 3.9%);
            --popover: hsl(0 0% 100%);
            --popover-foreground: hsl(0 0% 3.9%);
            --primary: hsl(0 0% 9%);
            --primary-foreground: hsl(0 0% 98%);
            --secondary: hsl(0 0% 96.1%);
            --secondary-foreground: hsl(0 0% 9%);
            --muted: hsl(0 0% 96.1%);
            --muted-foreground: hsl(0 0% 45.1%);
            --accent: hsl(0 0% 96.1%);
            --accent-foreground: hsl(0 0% 9%);
            --destructive: hsl(0 84.2% 60.2%);
            --destructive-foreground: hsl(0 0% 98%);
            --border: hsl(0 0% 89.8%);
            --input: hsl(0 0% 89.8%);
            --ring: hsl(0 0% 3.9%);
          }

          .dark {
            --background: hsl(0 0% 3.9%);
            --foreground: hsl(0 0% 98%);
            --card: hsl(0 0% 3.9%);
            --card-foreground: hsl(0 0% 98%);
            --popover: hsl(0 0% 3.9%);
            --popover-foreground: hsl(0 0% 98%);
            --primary: hsl(0 0% 98%);
            --primary-foreground: hsl(0 0% 9%);
            --secondary: hsl(0 0% 14.9%);
            --secondary-foreground: hsl(0 0% 98%);
            --muted: hsl(0 0% 14.9%);
            --muted-foreground: hsl(0 0% 63.9%);
            --accent: hsl(0 0% 14.9%);
            --accent-foreground: hsl(0 0% 98%);
            --destructive: hsl(0 62.8% 30.6%);
            --destructive-foreground: hsl(0 0% 98%);
            --border: hsl(0 0% 14.9%);
            --input: hsl(0 0% 14.9%);
            --ring: hsl(0 0% 83.1%);
          }
          
          .high-contrast {
            --background: hsl(0, 0%, 0%);
            --foreground: hsl(0, 0%, 100%);
            --card: hsl(0, 0%, 0%);
            --card-foreground: hsl(0, 0%, 100%);
            --popover: hsl(0, 0%, 0%);
            --popover-foreground: hsl(0, 0%, 100%);
            --primary: hsl(0, 0%, 100%);
            --primary-foreground: hsl(0, 0%, 0%);
            --secondary: hsl(0, 0%, 10%);
            --secondary-foreground: hsl(0, 0%, 100%);
            --muted: hsl(0, 0%, 10%);
            --muted-foreground: hsl(0, 0%, 70%);
            --accent: hsl(0, 0%, 10%);
            --accent-foreground: hsl(0, 0%, 100%);
            --destructive: hsl(0, 100%, 50%);
            --destructive-foreground: hsl(0, 0%, 100%);
            --border: hsl(0, 0%, 40%);
            --input: hsl(0, 0%, 10%);
            --ring: hsl(0, 0%, 90%);
          }
          
          body {
            background-color: var(--background);
            color: var(--foreground);
          }
        `}</style>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground font-sans">
        {/* Header */}
        <header className="w-full bg-primary text-primary-foreground flex justify-between items-center px-4 sm:px-10 py-4 border-b-2 border-border">
          <div className="flex gap-4 sm:gap-8 items-center">
            <Link to={createPageUrl("Calculator")} className="text-xl sm:text-2xl font-bold">CHEMI</Link>
            <nav className="flex gap-4 sm:gap-8">
              <Link 
                to={createPageUrl("Calculator")} 
                className={`text-sm sm:text-base font-semibold pb-1 transition-colors ${
                  location.pathname === createPageUrl("Calculator") ? "text-primary-foreground border-b-2 border-primary-foreground" : "text-muted-foreground hover:text-primary-foreground"
                }`}
              >
                Calculations
              </Link>
              <Link 
                to={createPageUrl("PeriodicTable")} 
                className={`text-sm sm:text-base font-semibold pb-1 transition-colors ${
                  location.pathname === createPageUrl("PeriodicTable") ? "text-primary-foreground border-b-2 border-primary-foreground" : "text-muted-foreground hover:text-primary-foreground"
                }`}
              >
                Periodic Table
              </Link>
              <Link 
                to={createPageUrl("FormulaSheet")} 
                className={`text-sm sm:text-base font-semibold pb-1 transition-colors ${
                  location.pathname === createPageUrl("FormulaSheet") ? "text-primary-foreground border-b-2 border-primary-foreground" : "text-muted-foreground hover:text-primary-foreground"
                }`}
              >
                Formula Sheet
              </Link>
            </nav>
          </div>
          <Link to={createPageUrl("Settings")}>
            <button className="bg-secondary text-secondary-foreground font-bold text-sm sm:text-base rounded-md px-3 py-2 sm:px-4 hover:bg-secondary/80 transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
