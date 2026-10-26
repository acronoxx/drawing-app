import Canvas from './canvas/Canvas';
import Toolbar from './Toolbar';

import './App.css';

/**
 * Root component: toolbar on the left, drawing canvas on the right.
 *
 * Holds no state: the toolbar and the canvas read the stores they need
 * and send their actions to the dispatcher.
 */
function App() {
  // --- Render ---
  return (
    <>
      <div id="main-div">
          <Toolbar/>
          <Canvas/>
      </div>
    </>
  )
}

export default App
