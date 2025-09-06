import React from "react";
import { Palette } from "lucide-react";
import ThemeSettings from "../components/settings/ThemeSettings";
import TextSizeSettings from "../components/settings/TextSizeSettings";

export default function SettingsPage() {
  return (
    <div className="min-h-[calc(100vh-88px)] bg-background flex justify-center items-start pt-16">
      <div className="w-full max-w-2xl mx-auto p-8 space-y-12">
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Settings</h1>
        
        <div>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Palette className="w-6 h-6" />
                Appearance
            </h2>
            <div className="space-y-8 bg-card rounded-lg p-6 border border-border">
                <ThemeSettings />
                <hr className="border-border" />
                <TextSizeSettings />
            </div>
        </div>
      </div>
    </div>
  );
}
