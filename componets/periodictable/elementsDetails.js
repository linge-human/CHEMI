import React from 'react';

export default function ElementDetails({ element }) {
  if (!element) {
    return (
      <div className="p-6 rounded-lg bg-card border border-border mt-4 text-center text-muted-foreground">
        Select an element to see its details.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-card border border-border mt-4">
      <div className="flex items-center gap-6">
        <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-md flex flex-col items-center justify-center bg-muted`}>
          <div className="text-3xl sm:text-5xl font-extrabold">{element.symbol}</div>
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">{element.name} ({element.symbol})</h2>
          <p className="text-lg text-muted-foreground">Atomic Number: {element.number}</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
        <div className="space-y-2">
          <h3 className="font-bold text-lg border-b border-border pb-1 mb-2">Properties</h3>
          <div className="flex justify-between"><span>Atomic Mass:</span> <span className="font-mono">{element.atomicMass}</span></div>
          <div className="flex justify-between"><span>Category:</span> <span className="font-mono capitalize">{element.category}</span></div>
          <div className="flex justify-between"><span>Electron Config:</span> <span className="font-mono">{element.electronConfig || 'N/A'}</span></div>
        </div>
         <div className="space-y-2">
           <h3 className="font-bold text-lg border-b border-border pb-1 mb-2">Identifiers</h3>
           <div className="flex justify-between"><span>CAS Number:</span><span className="font-mono">7440-59-7</span></div>
           <div className="flex justify-between"><span>ChemSpider ID:</span><span className="font-mono">22423</span></div>
           <div className="flex justify-between"><span>EC Number:</span><span className="font-mono">231-168-5</span></div>
         </div>
         <div className="space-y-2">
           <h3 className="font-bold text-lg border-b border-border pb-1 mb-2">History</h3>
           <p className="text-muted-foreground">Discovered by Pierre Janssen and Norman Lockyer in 1868. Named after the Greek word for the sun, 'helios'.</p>
         </div>
      </div>
    </div>
  );
}
