import React from 'react';

export default function MathToolbar({ onInsert }) {
  const tools = [
    { label: 'a/b', text: '()/()', title: 'Fracción' },
    { label: 'x²', text: '^2', title: 'Cuadrado' },
    { label: 'xⁿ', text: '^()', title: 'Exponente' },
    { label: '√x', text: 'sqrt()', title: 'Raíz cuadrada' },
    { label: '( )', text: '()', title: 'Paréntesis' },
    { label: 'x', text: 'x', title: 'Variable x' },
    { label: 'y', text: 'y', title: 'Variable y' },
    { label: '±', text: '+-', title: 'Más o menos' },
    { label: '∪', text: ' U ', title: 'Unión (Intervalos)' },
    { label: '∞', text: 'inf', title: 'Infinito' },
    { label: '≤', text: '<=', title: 'Menor o igual' },
    { label: '≥', text: '>=', title: 'Mayor o igual' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/90 border border-slate-800 rounded-xl mb-3">
      <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 px-1">Teclado Matemático:</span>
      {tools.map((item, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onInsert(item.text)}
          title={item.title}
          className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-800 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 rounded-lg transition-all active:scale-95"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
