import React, { useState, useCallback } from "react";
import { Rnd } from "react-rnd";
import Toolbar from "./Toolbar";
import FontSettings from "./FontSettings";

function TextItem({
  id,
  data,
  selected,
  editing,
  onUpdate,
  onSelect,
  onEditToggle,
}) {
  const handleKeyDown = (e) => {
    if (!editing && (e.key === "Enter" || e.key === "F2")) {
      e.preventDefault();
      onEditToggle(id, true);
    }
    if (editing && e.key === "Escape") {
      e.preventDefault();
      onEditToggle(id, false);
    }
  };

  return (
    <Rnd
      size={{ width: data.width, height: data.height }}
      position={{ x: data.x, y: data.y }}
      onDragStop={(e, d) => onUpdate(id, { x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, position) =>
        onUpdate(id, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          ...position,
        })
      }
      bounds="parent"
      disableDragging={editing}
      onClick={(e) => {
        e.stopPropagation();
        if (!editing) onSelect(id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEditToggle(id, true);
        onSelect(id);
      }}
      style={{
        border: selected ? "1px dashed black" : "none",
        backgroundColor: "white",
        padding: 4,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        cursor: editing ? "text" : "move",
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {editing ? (
        <textarea
          autoFocus
          value={data.content}
          onChange={(e) => onUpdate(id, { content: e.target.value })}
          onBlur={() => onEditToggle(id, false)}
          style={{
            fontSize: data.fontSize,
            color: data.color,
            fontFamily: data.fontFamily,
            width: "100%",
            height: "100%",
            resize: "none",
            border: "none",
            outline: "none",
            background: "transparent",
            padding: 0,
            margin: 0,
            overflow: "auto",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div
          style={{
            fontSize: data.fontSize,
            color: data.color,
            fontFamily: data.fontFamily,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            width: "100%",
            height: "100%",
            userSelect: "none",
          }}
        >
          {data.content}
        </div>
      )}
    </Rnd>
  );
}

function EditableText() {
  const [texts, setTexts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const addText = useCallback(() => {
    const id = Date.now();
    setTexts((prev) => [
      ...prev,
      {
        id,
        content: "Edit me",
        x: 100,
        y: 100,
        width: 200,
        height: 50,
        fontSize: 16,
        color: "#000000",
        fontFamily: "Arial",
      },
    ]);
    setSelectedId(id);
    setEditingId(id);
  }, []);

  const updateText = useCallback((id, updates) => {
    setTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const toggleEditing = useCallback((id, isEditing) => {
    setEditingId(isEditing ? id : null);
    if (isEditing) setSelectedId(id);
  }, []);

  const selectedText = texts.find((t) => t.id === selectedId);

  return (
    <div
      style={{
        height: "100vh",
        position: "relative",
        padding: 10,
        userSelect: editingId ? "text" : "none",
      }}
      onClick={() => {
        setSelectedId(null);
        setEditingId(null);
      }}
    >
      <Toolbar onAddText={addText} />

      <FontSettings
        text={selectedText}
        onChange={(updates) => updateText(selectedId, updates)}
      />

      {texts.map(({ id, ...data }) => (
        <TextItem
          key={id}
          id={id}
          data={data}
          selected={id === selectedId}
          editing={id === editingId}
          onUpdate={updateText}
          onSelect={setSelectedId}
          onEditToggle={toggleEditing}
        />
      ))}
    </div>
  );
}

export default EditableText;
