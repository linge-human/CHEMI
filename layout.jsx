import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Settings } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="w-full bg-gray-900 text-white flex justify-between items-center px-10 py-5 border-b-2 border-gray-800">
        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">CHEMI</div>
          </div>
          <nav className="flex gap-8">
            <Link 
              to={createPageUrl("Calculator")} 
              className={`text-gray-300 hover:text-white font-semibold text-base tracking-wide pb-1 transition-colors ${
                location.pathname === createPageUrl("Calculator") ? "border-b-2 border-white text-white" : "hover:border-b-2 hover:border-white"
              }`}
            >
              Calculations
            </Link>
            <Link 
              to={createPageUrl("PeriodicTable")} 
              className={`text-gray-300 hover:text-white font-semibold text-base tracking-wide pb-1 transition-colors ${
                location.pathname === createPageUrl("PeriodicTable") ? "border-b-2 border-white text-white" : "hover:border-b-2 hover:border-white"
              }`}
            >
              Periodic Table
            </Link>
            <Link 
              to={createPageUrl("FormulaSheet")} 
              className={`text-gray-300 hover:text-white font-semibold text-base tracking-wide pb-1 transition-colors ${
                location.pathname === createPageUrl("FormulaSheet") ? "border-b-2 border-white text-white" : "hover:border-b-2 hover:border-white"
              }`}
            >
              Formula Sheet
            </Link>
          </nav>
        </div>
        <Link to={createPageUrl("Settings")}>
          <button className="bg-gray-800 text-white font-bold text-base rounded-md px-4 py-2 hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
