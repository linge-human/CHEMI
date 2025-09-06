import React, { useState } from "react";
import { Type } from "lucide-react";

export default function TextSizeSettings() {
  const [textSize, setTextSize] = useState(16);

  const handleSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setTextSize(size);
    document.documentElement.style.fontSize = `${size}px`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-foreground">Text Size</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Type className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="range"
            min="14"
            max="20"
            step="2"
            value={textSize}
            onChange={handleSizeChange}
            className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((textSize - 14) / 6) * 100}%, var(--secondary) ${((textSize - 14) / 6) * 100}%, var(--secondary) 100%)`
            }}
          />
        </div>
        
        <div className="text-center">
          <p style={{ fontSize: `${textSize}px` }} className="text-foreground transition-all">
            Sample text to preview size.
          </p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          margin-top: -8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
