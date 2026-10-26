import { useEffect, useRef, useState } from 'react';

import Canvas from './canvas/Canvas';
import type { Mode } from './mode/Mode';
import { SelectMoveMode } from './mode/SelectMoveMode';
import { PersistentElements, type ShapeStyle } from './PersistentElement';
import Toolbar from './Toolbar';

import './App.css';

/** Style of new shapes when the application starts. */
const DEFAULT_STYLE: ShapeStyle = { fillColor: '#0d00ff', strokeColor: '#000000', lineWidth: 2 };

/** Resizes the canvas so its drawing buffer matches its displayed size. */
  function resizeCanvas(canvas: HTMLCanvasElement) {
    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

/** Root component: toolbar on the left, drawing canvas on the right. */
function App() {
  // --- State ---
  const [persistentElements, setPersistentElements] = useState<PersistentElements | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [currentStyle, setCurrentStyle] = useState<ShapeStyle>(DEFAULT_STYLE);

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Effects ---
  // Once the canvas is created: create the drawing model and the initial mode,
  // and keep the canvas sized to its parent when the window is resized
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("2D context not available");
        return;
      }

      const tempPersistentElements = new PersistentElements(
        canvas, ctx, DEFAULT_STYLE.lineWidth, DEFAULT_STYLE.fillColor, DEFAULT_STYLE.strokeColor
      );
      // Keep the toolbar inputs in sync with the selection and the style changes
      tempPersistentElements.onStyleChange = () => setCurrentStyle(tempPersistentElements.getCurrentStyle());
      setPersistentElements(tempPersistentElements);
      setMode(new SelectMoveMode(tempPersistentElements));

      resizeCanvas(canvas);
      window.addEventListener('resize', () => {
        resizeCanvas(canvas);
        tempPersistentElements.redraw();
      });
    } else {
      console.error("Canvas not found");
    }
  }, []);

  // --- Render ---
  return (
    <>
      <div id="main-div">
          <Toolbar persistentElements={persistentElements} currentStyle={currentStyle} onModeChange={setMode}/>
          <Canvas canvasRef={canvasRef} persistentElements={persistentElements} mode={mode}/>
      </div>
    </>
  )
}

export default App
