import React, { useState } from 'react';
import { X } from 'lucide-react';

export function TagInput({ tags = [], onTagsChange, maxTags = 10 }) {
  const [input, setInput] = useState('');

  const handleAddTag = () => {
    const trimmed = input.toLowerCase().trim();
    // Extract tag names if they're objects
    const tagStrings = tags.map(t => typeof t === 'string' ? t : t.name || t);
    if (trimmed && trimmed.length <= 20 && !tagStrings.includes(trimmed) && tags.length < maxTags) {
      onTagsChange([...tags, trimmed]);
      setInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const tagName = typeof tagToRemove === 'string' ? tagToRemove : tagToRemove.name || tagToRemove;
    const tagStrings = tags.map(t => typeof t === 'string' ? t : t.name || t);
    const indexToRemove = tagStrings.indexOf(tagName);
    if (indexToRemove > -1) {
      onTagsChange(tags.filter((_, i) => i !== indexToRemove));
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {tags.map((tag, idx) => {
          const tagName = typeof tag === 'string' ? tag : tag.name || tag;
          return (
            <div
              key={idx}
              className="tag-chip"
            >
              {tagName}
              <button
                onClick={() => handleRemoveTag(tag)}
                style={{ backgroundColor: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={tags.length >= maxTags}
          className="form-input"
          style={{ flex: 1, fontSize: '13px' }}
          placeholder={tags.length >= maxTags ? `Max ${maxTags} tags reached` : 'Add tag (press Enter)'}
        />
        {tags.length < maxTags && (
          <button
            onClick={handleAddTag}
            disabled={!input.trim()}
            className="btn btn-primary btn-sm"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
