import React from "react";

function FontSettings({ text, onChange }) {
  if (!text) return null;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label>
        Font Size:{" "}
        <input
          type="number"
          value={text.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          style={{ width: 50 }}
        />
      </label>

      <label>
        Color:{" "}
        <input
          type="color"
          value={text.color}
          onChange={(e) => onChange({ color: e.target.value })}
        />
      </label>

      <label>
        Font Family:{" "}
        <select
          value={text.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
        >
          <option value="Arial">Arial</option>
          <option value="Courier New">Courier New</option>
        </select>
      </label>
    </div>
  );
}

export default FontSettings;
