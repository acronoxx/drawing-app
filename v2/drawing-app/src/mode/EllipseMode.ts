import type { Point } from "../canvas/CanvasItem";
import { dispatch } from "../stores/dispatcher";
import { useToolStore } from "../stores/useToolStore";
import type { Mode } from "./Mode";

/**
 * Mode to draw ellipses.
 *
 * Pressing the mouse creates an ellipse at the cursor, dragging resizes its
 * bounding box, and releasing fixes its size.
 * The new ellipse uses the style of new shapes from the tool store and becomes
 * the selected shape. The mode only sends actions: the item store creates
 * and updates the ellipse.
 */
export class EllipseMode implements Mode {
    /** Whether a ellipse is being drawn (mouse pressed on the canvas). */
    public isDrawing: boolean;

    constructor(){
        this.isDrawing = false;
    }

    /**
     * Starts a ellipse at the cursor with the style of new shapes.
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseDown(point: Point){
        const { fillColor, strokeColor, lineWidth } = useToolStore.getState();
        dispatch({ type: 'add', kind: 'ellipse', point, style: { fillColor, strokeColor, lineWidth } });
        this.isDrawing = true;
    }

    /**
     * Resizes the bounding box of the ellipse being drawn so its opposite corner follows the cursor.
     * Does nothing if no ellipse is being drawn.
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseMove(point: Point){
        if (!this.isDrawing) return;
        dispatch({ type: 'update', point });
    }

    /**
     * Ends the drawing, with a last update at the cursor position.
     * Does nothing if no ellipse is being drawn.
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseUp(point: Point){
        if (!this.isDrawing) return;
        dispatch({ type: 'update', point });
        this.isDrawing = false;
    }
}
