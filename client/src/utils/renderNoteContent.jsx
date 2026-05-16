import React from 'react';

const renderInlineMarkdown = (text) => {
  const nodes = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|<u>(.*?)<\/u>|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      nodes.push(<strong key={nodes.length}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={nodes.length}>{match[3]}</em>);
    } else if (match[4]) {
      nodes.push(<u key={nodes.length}>{match[4]}</u>);
    } else if (match[5]) {
      nodes.push(<code key={nodes.length}>{match[5]}</code>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

export const renderNoteContent = (value) => {
  if (!value?.trim()) {
    return <p className="note-preview-placeholder">Nothing to preview yet.</p>;
  }

  return value.split('\n').map((line, index) => {
    if (!line.trim()) {
      return <div key={index} className="note-preview-spacer" />;
    }

    if (line.startsWith('### ')) {
      return <h3 key={index}>{renderInlineMarkdown(line.slice(4))}</h3>;
    }

    if (line.startsWith('## ')) {
      return <h2 key={index}>{renderInlineMarkdown(line.slice(3))}</h2>;
    }

    if (line.startsWith('# ')) {
      return <h1 key={index}>{renderInlineMarkdown(line.slice(2))}</h1>;
    }

    if (line.startsWith('- ')) {
      return <p key={index} className="note-preview-list-item">{renderInlineMarkdown(line.slice(2))}</p>;
    }

    return <p key={index}>{renderInlineMarkdown(line)}</p>;
  });
};
