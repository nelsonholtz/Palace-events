import React, { useRef, useState } from "react";
import { Stage, Layer, Circle, Rect } from "react-konva";
import Bluecircle from "./Bluecircle";
import { Routes, Route } from "react-router-dom";
import Text from "./Text";

function App() {
  return (
    <div>
      <main>
        <Routes>
          <Route path="/home" element={<Bluecircle />} />
          <Route path="/text" element={<Text />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
