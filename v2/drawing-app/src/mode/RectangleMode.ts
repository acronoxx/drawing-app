import type { Point } from "../canvas/CanvasItem";
import { dispatch } from "../stores/dispatcher";
import { useToolStore } from "../stores/useToolStore";
import type { Mode } from "./Mode";

/**
 * Mode to draw rectangles.
 *
 * Pressing the mouse creates a rectangle at the cursor, dragging resizes it,
 * and releasing fixes its size.
 * The new rectangle uses the style of new shapes from the tool store and becomes
 * the selected shape. The mode only sends actions: the item store creates
 * and updates the rectangle.
 */
export class RectangleMode implements Mode {
    /** Whether a rectangle is being drawn (mouse pressed on the canvas). */
    public isDrawing: boolean;

    constructor(){
        this.isDrawing = false;
    }

    /**
     * Starts a rectangle at the cursor with the style of new shapes.
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseDown(point: Point){
        const { fillColor, strokeColor, lineWidth } = useToolStore.getState();
        dispatch({ type: 'add', kind: 'rectangle', point, style: { fillColor, strokeColor, lineWidth } });
        this.isDrawing = true;
    }

    /**
     * Resizes the rectangle being drawn so its opposite corner follows the cursor.
     * Does nothing if no rectangle is being drawn.
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseMove(point: Point){
        if (!this.isDrawing) return;
        dispatch({ type: 'update', point });
    }

    /**
     * Ends the drawing, with a last update at the cursor position.
     * Does nothing if no rectangle is being drawn.
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseUp(point: Point){
        if (!this.isDrawing) return;
        dispatch({ type: 'update', point });
        this.isDrawing = false;
    }
}
