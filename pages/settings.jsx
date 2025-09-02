import React, { useState } from "react";
import { User, Palette, Globe, Type, Download, BarChart3 } from "lucide-react";
import LoginSection from "../components/settings/LoginSection";
import ThemeSettings from "../components/settings/ThemeSettings";
import LanguageSettings from "../components/settings/LanguageSettings";
import TextSizeSettings from "../components/settings/TextSizeSettings";
import HistoryAnalysis from "../components/settings/HistoryAnalysis";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");

  const sections = [
    { id: "account", name: "Account", icon: User },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "history", name: "History & Analysis", icon: BarChart3 }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="space-y-8">
            <LoginSection />
            <LanguageSettings />
          </div>
        );
      case "appearance":
        return (
          <div className="space-y-8">
            <ThemeSettings />
            <TextSizeSettings />
          </div>
        );
      case "history":
        return <HistoryAnalysis />;
      default:
        return <LoginSection />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        
        <div className="flex gap-8">
          {/* Settings Navigation */}
          <div className="w-64">
            <nav className="space-y-2">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeSection === section.id
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    {section.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-gray-50 rounded-lg p-6">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
