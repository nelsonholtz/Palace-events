import React, { useRef, useState } from "react";
import { Stage, Layer, Circle, Rect } from "react-konva";
import Toolbar from "./Toolbar";

function Bluecircle() {
  const stageRef = useRef(null);
  const [shapes, setShapes] = useState([]);

  const handleDrawCircle = () => {
    const newCircle = {
      id: shapes.length + 1,
      x: Math.random() * 600 + 150,
      y: Math.random() * 400,
      radius: 25,
      fill: "blue",
      draggable: true,
    };
    setShapes([...shapes, newCircle]);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Toolbar onDrawCircle={handleDrawCircle} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Stage
          width={window.innerWidth - 150}
          height={window.innerHeight}
          ref={stageRef}
          style={{ background: "#fff" }}
        >
          <Layer>
            {shapes.map((shape) => (
              <Circle
                key={shape.id}
                x={shape.x}
                y={shape.y}
                radius={shape.radius}
                fill={shape.fill}
                draggable={shape.draggable}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default Bluecircle;
