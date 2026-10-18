import type { PersistentElements } from "../PersistentElement";
import type { CanvasItem } from "../canvas/CanvasItem";
import { LineItem } from "../canvas/LineItem";
import type { Mode } from "./Mode";

/**
 * Mode to draw straight lines.
 *
 * Pressing the mouse starts a line at the cursor, dragging moves its end
 * point, and releasing fixes it. The new line uses the current default
 * style of the drawing model and becomes the selected shape.
 */
export class LineMode implements Mode {
    /** Drawing model the lines are added to. */
    public persistentElements: PersistentElements;
    /** Line being drawn, or null when no drawing is in progress. */
    public item: CanvasItem | null;

    /**
     * @param persistentElements - Drawing model the lines are added to
     */
    constructor(persistentElements: PersistentElements){
        this.persistentElements = persistentElements;
        this.item = null;
    }

    /**
     * Starts a line of length 0 at the cursor with the default style,
     * adds it to the drawing model (which selects it) and redraws.
     * @param event - Mouse event on the canvas
     */
    onMouseDown(event: React.MouseEvent){
        const {x, y} = this.persistentElements.getMousePos(event.clientX, event.clientY);
        this.item = new LineItem(
            this.persistentElements.ctx,
            {x, y},
            this.persistentElements.fillColor,
            this.persistentElements.strokeColor,
            this.persistentElements.lineWidth
        );
        this.persistentElements.addItem(this.item);
        this.persistentElements.redraw();
    }

    /**
     * Moves the end point of the line being drawn to the cursor, then redraws.
     * Does nothing if no line is being drawn.
     * @param event - Mouse event on the canvas
     */
    onMouseMove(event: React.MouseEvent){
        if (!this.item) return;

        const {x, y} = this.persistentElements.getMousePos(event.clientX, event.clientY);
        this.item.update(x, y);
        this.persistentElements.redraw();
    }

    /**
     * Ends the drawing: sets the final end point of the line at the cursor,
     * redraws, and clears the line being drawn.
     * Does nothing if no line is being drawn.
     * @param event - Mouse event on the canvas
     */
    onMouseUp(event: React.MouseEvent){
        if (!this.item) return;

        const {x, y} = this.persistentElements.getMousePos(event.clientX, event.clientY);
        this.item.update(x, y);
        this.persistentElements.redraw();
        this.item = null;
    }
}