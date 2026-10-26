import type { PersistentElements } from "../PersistentElement";
import type { CanvasItem } from "../canvas/CanvasItem";
import { PathItem } from "../canvas/PathItem";
import type { Mode } from "./Mode";

/**
 * Mode to draw free-hand paths (Pencil tool).
 *
 * Pressing the mouse starts a path at the cursor, dragging adds a point at
 * each mouse move, and releasing ends the stroke. The new path uses the
 * current default style of the drawing model and becomes the selected shape.
 */
export class PencilMode implements Mode {
    /** Drawing model the paths are added to. */
    public persistentElements: PersistentElements;
    /** Path being drawn, or null when no drawing is in progress. */
    public item: CanvasItem | null;

    /**
     * @param persistentElements - Drawing model the paths are added to
     */
    constructor(persistentElements: PersistentElements){
        this.persistentElements = persistentElements;
        this.item = null;
    }

    /**
     * Starts a path at the cursor with the default style,
     * adds it to the drawing model (which selects it) and redraws.
     * @param event - Mouse event on the canvas
     */
    onMouseDown(event: React.MouseEvent){
        const {x, y} = this.persistentElements.getMousePos(event.clientX, event.clientY);
        this.item = new PathItem(
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
     * Adds the cursor position as a new point of the path being drawn,
     * then redraws.
     * Does nothing if no path is being drawn.
     * @param event - Mouse event on the canvas
     */
    onMouseMove(event: React.MouseEvent){
        if (!this.item) return;

        const {x, y} = this.persistentElements.getMousePos(event.clientX, event.clientY);
        this.item.update(x, y);
        this.persistentElements.redraw();
    }

    /**
     * Ends the drawing: adds the last point at the cursor, redraws,
     * and clears the path being drawn.
     * Does nothing if no path is being drawn.
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