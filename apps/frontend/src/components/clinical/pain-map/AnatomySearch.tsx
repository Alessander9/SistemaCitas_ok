import React, { useState, useEffect, useRef } from 'react';
import { MaterialIcon } from '../../ui/MaterialIcon';
import {
  searchAnatomy,
  AnatomySearchResult,
} from '@citassistema/shared-types';

interface AnatomySearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStructure: (code: string) => void;
}

export const AnatomySearch: React.FC<AnatomySearchProps> = ({
  isOpen,
  onClose,
  onSelectStructure,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results: AnatomySearchResult[] = query.trim()
    ? searchAnatomy(query, 12)
    : [];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectStructure(results[selectedIndex].node.code);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pain-search-modal-backdrop" onClick={onClose}>
      <div
        className="pain-search-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar estructura anatómica"
      >
        <div className="pain-search-header">
          <MaterialIcon name="search" size={20} color="#0284c7" />
          <input
            ref={inputRef}
            type="text"
            className="pain-search-input"
            placeholder="Buscar músculo, tendón, vértebra o articulación... (ej. supraespinoso, L4-L5, menisco)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="pain-search-close-btn"
            onClick={onClose}
            title="Cerrar (Esc)"
          >
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <div className="pain-search-body">
          {query.trim().length === 0 ? (
            <div className="pain-search-empty-hints">
              <p className="pain-search-hint-title">Búsquedas clínicas frecuentes:</p>
              <div className="pain-search-chips">
                {['Supraespinoso', 'L4-L5', 'Fascia plantar', 'Epicóndilo', 'Menisco medial', 'Trapecio superior', 'Piramidal', 'ATM'].map(
                  (hint) => (
                    <button
                      key={hint}
                      type="button"
                      className="pain-search-chip"
                      onClick={() => setQuery(hint)}
                    >
                      {hint}
                    </button>
                  ),
                )}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="pain-search-no-results">
              <MaterialIcon name="search_off" size={32} color="#94a3b8" />
              <p>No se encontraron estructuras para "{query}"</p>
              <span>Intenta con términos más generales o sin abreviaturas</span>
            </div>
          ) : (
            <ul className="pain-search-results-list" role="listbox">
              {results.map((res, index) => {
                const isSelected = index === selectedIndex;
                const pathString = res.path.map((p) => p.label).join(' → ');

                return (
                  <li
                    key={res.node.code}
                    role="option"
                    aria-selected={isSelected}
                    className={`pain-search-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onSelectStructure(res.node.code);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="pain-search-item-info">
                      <div className="pain-search-item-title-row">
                        <strong className="pain-search-item-name">
                          {res.node.label}
                        </strong>
                        {res.node.kind && (
                          <span className={`pain-kind-badge kind-${res.node.kind}`}>
                            {res.node.kind}
                          </span>
                        )}
                        {res.node.lateral && (
                          <span className="pain-lateral-pill">D/I</span>
                        )}
                      </div>
                      <div className="pain-search-item-path">{pathString}</div>
                    </div>

                    {res.node.icd10Hints && res.node.icd10Hints.length > 0 && (
                      <span className="pain-icd10-hint">
                        CIE-10: {res.node.icd10Hints[0]}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="pain-search-footer">
          <span><kbd>↑</kbd> <kbd>↓</kbd> para navegar</span>
          <span><kbd>Enter</kbd> para seleccionar</span>
          <span><kbd>Esc</kbd> para cerrar</span>
        </div>
      </div>
    </div>
  );
};
