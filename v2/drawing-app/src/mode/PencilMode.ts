import type { Point } from "../canvas/CanvasItem";
import { dispatch } from "../stores/dispatcher";
import { useToolStore } from "../stores/useToolStore";
import type { Mode } from "./Mode";

/**
 * Mode to draw free-hand paths (Pencil tool).
 *
 * Pressing the mouse starts a path at the cursor, dragging adds a point at
 * each mouse move, and releasing ends the stroke.
 * The new path uses the style of new shapes from the tool store and becomes
 * the selected shape. The mode only sends actions: the item store creates
 * and updates the path.
 */
export class PencilMode implements Mode {
    /** Whether a path is being drawn (mouse pressed on the canvas). */
    public isDrawing: boolean;

    constructor(){
        this.isDrawing = false;
    }

    /**
     * Starts a path at the cursor with the style of new shapes.
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseDown(point: Point){
        const { fillColor, strokeColor, lineWidth } = useToolStore.getState();
        dispatch({ type: 'add', kind: 'path', point, style: { fillColor, strokeColor, lineWidth } });
        this.isDrawing = true;
    }

    /**
     * Adds the cursor position as a new point of the path being drawn.
     * Does nothing if no path is being drawn.
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseMove(point: Point){
        if (!this.isDrawing) return;
        dispatch({ type: 'update', point });
    }

    /**
     * Ends the drawing, with a last update at the cursor position.
     * Does nothing if no path is being drawn.
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseUp(point: Point){
        if (!this.isDrawing) return;
        dispatch({ type: 'update', point });
        this.isDrawing = false;
    }
}
