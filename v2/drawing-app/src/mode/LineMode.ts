import type { Point } from "../canvas/CanvasItem";
import { dispatch } from "../stores/dispatcher";
import { useToolStore } from "../stores/useToolStore";
import type { Mode } from "./Mode";

/**
 * Mode to draw straight lines.
 *
 * Pressing the mouse starts a line at the cursor, dragging moves its end
 * point, and releasing fixes it.
 * The new line uses the style of new shapes from the tool store and becomes
 * the selected shape. The mode only sends actions: the item store creates
 * and updates the line.
 */
export class LineMode implements Mode {
    /** Whether a line is being drawn (mouse pressed on the canvas). */
    public isDrawing: boolean;

    constructor(){
        this.isDrawing = false;
    }

    /**
     * Starts a line at the cursor with the style of new shapes.
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseDown(point: Point){
        const { fillColor, strokeColor, lineWidth } = useToolStore.getState();
        dispatch({ type: 'add', kind: 'line', point, style: { fillColor, strokeColor, lineWidth } });
        this.isDrawing = true;
    }

    /**
     * Moves the end point of the line being drawn to the cursor.
     * Does nothing if no line is being drawn.
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseMove(point: Point){
        if (!this.isDrawing) return;
        dispatch({ type: 'update', point });
    }

    /**
     * Ends the drawing, with a last update at the cursor position.
     * Does nothing if no line is being drawn.
     * @param point - Cursor position, in canvas coordinates
     */
    onMouseUp(point: Point){
        if (!this.isDrawing) return;
        dispatch({ type: 'update', point });
        this.isDrawing = false;
    }
}
