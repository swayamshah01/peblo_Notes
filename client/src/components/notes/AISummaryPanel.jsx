import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Spinner } from '../common/Spinner';

export function AISummaryPanel({
  aiResult,
  isLoading,
  onClose,
  onApplyTitle,
}) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleItem = (index) => {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div style={{ width: '384px', backgroundColor: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} />
          AI Summary
        </h2>
        <button
          onClick={onClose}
          style={{ color: 'var(--text-muted)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
        >
          <X size={20} />
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '32px', paddingBottom: '32px', gap: '12px' }}>
          <Spinner size="md" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Generating AI summary...</p>
        </div>
      ) : aiResult?.error ? (
        <div style={{ backgroundColor: 'color-mix(in srgb, var(--error) 18%, var(--surface-elevated))', border: '1px solid var(--error)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px' }}>
          <AlertCircle size={20} style={{ color: 'var(--error)', flexShrink: 0 }} />
          <p style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{aiResult.error}</p>
        </div>
      ) : aiResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary */}
          {(aiResult.summary || aiResult.summaryPoints?.length > 0) && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '10px' }}>Summary</h3>
              {aiResult.summaryPoints?.length > 0 ? (
                <div style={{ display: 'grid', gap: '14px' }}>
                  {aiResult.summary && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {aiResult.summary}
                    </p>
                  )}
                  <ul className="ai-point-list">
                    {aiResult.summaryPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
                  {aiResult.summary}
                </p>
              )}
            </div>
          )}

          {/* Action Items */}
          {aiResult.actionItems && aiResult.actionItems.length > 0 && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>Action Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {aiResult.actionItems.map((item, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <button
                      onClick={() => toggleItem(idx)}
                      style={{ marginTop: '2px', color: 'var(--text-muted)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      {checkedItems[idx] ? (
                        <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                      ) : (
                        <div style={{ width: '20px', height: '20px', border: '2px solid var(--text-muted)', borderRadius: '50%' }} />
                      )}
                    </button>
                    <span
                      style={{
                        fontSize: '13px',
                        color: checkedItems[idx] ? 'var(--text-muted)' : 'var(--text-secondary)',
                        textDecoration: checkedItems[idx] ? 'line-through' : 'none',
                      }}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Title */}
          {aiResult.suggestedTitle && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>Suggested Title</h3>
              <button
                onClick={() => onApplyTitle(aiResult.suggestedTitle)}
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--tag-bg)',
                  color: 'var(--tag-text)',
                  padding: '12px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-light)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--tag-bg)'}
              >
                {aiResult.suggestedTitle}
              </button>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Click to use as title</p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', paddingTop: '32px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Click the Generate Summary button to get started
          </p>
        </div>
      )}
    </div>
  );
}
