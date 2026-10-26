import type { Mode } from '../mode/Mode';
import type { PersistentElements } from '../PersistentElement';

import './Canvas.css'

/** Props of the Canvas component. */
interface CanvasProps{
    /** Ref attached to the canvas element, so App can initialize and resize it. */
    canvasRef: React.RefObject<HTMLCanvasElement|null>;
    /** Drawing model, or null until the canvas is initialized. */
    persistentElements: PersistentElements|null;
    /**
     * Current interaction mode, which receives the mouse events of the canvas,
     * or null until the canvas is initialized.
     */
    mode: Mode | null;
}

/**
 * Drawing area: forwards the mouse events to the current mode
 * and uses the mouse wheel to change the depth of the selected shape.
 */
function Canvas({ canvasRef, persistentElements, mode}: CanvasProps) {
    // --- Handlers ---
    /** Changes the depth of the selected shape with the mouse wheel. */
    function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
        if (e.deltaY < 0) persistentElements?.bringSelectedItemForward();
        else if (e.deltaY > 0) persistentElements?.sendSelectedItemBackward();
    }

    // --- Render ---
    return (
        <div id="div-canvas">
            <canvas
                id="canvas"
                ref={canvasRef}
                onMouseDown={(event) => mode?.onMouseDown(event)}
                onMouseMove={(event) => mode?.onMouseMove(event)}
                onMouseUp={(event) => mode?.onMouseUp(event)}
                onWheel={(event) => handleWheel(event)}
            />
        </div>
    )
}

export default Canvas;
