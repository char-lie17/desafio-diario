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
    { label: 'log', text: 'log()', title: 'Logaritmo decimal' },
    { label: 'ln', text: 'ln()', title: 'Logaritmo natural' },
    { label: 'sen', text: 'sen()', title: 'Seno' },
    { label: 'cos', text: 'cos()', title: 'Coseno' },
    { label: 'tan', text: 'tan()', title: 'Tangente' },
    { label: 'π', text: 'pi', title: 'Número Pi' },
    { label: '±', text: '+-', title: 'Más o menos' },
    { label: '∪', text: ' U ', title: 'Unión (Intervalos)' },
    { label: '∞', text: 'inf', title: 'Infinito' },
    { label: '≤', text: '<=', title: 'Menor o igual' },
    { label: '≥', text: '>=', title: 'Mayor o igual' },
  ];

  return (
    <div role="group" aria-label="Teclado matemático" className="card-inset p-2.5">
      <p className="eyebrow mb-2 px-0.5">Teclado matemático</p>
      <div className="flex flex-wrap gap-1.5">
        {tools.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onInsert(item.text)}
            title={item.title}
            aria-label={item.title}
            className="min-w-11 h-11 sm:min-w-10 sm:h-10 px-2 text-sm font-mono font-bold bg-[var(--surface-2)] hover:bg-[var(--accent-soft)] text-slate-200 hover:text-[var(--accent)] border border-[var(--line)] hover:border-[var(--accent-line)] rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
