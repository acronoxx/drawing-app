/**
 * Interaction mode of the canvas (State design pattern).
 *
 * Each tool of the toolbar (select/move, rectangle, ellipse, line, pencil)
 * is a class implementing this interface.
 */
export interface Mode {
    /**
     * Handles a mouse button press on the canvas.
     * @param event - Mouse event on the canvas
     */
    onMouseDown(event: React.MouseEvent): void;

    /**
     * Handles a mouse move over the canvas.
     * @param event - Mouse event on the canvas
     */
    onMouseMove(event: React.MouseEvent): void;

    /**
     * Handles a mouse button release on the canvas.
     * @param event - Mouse event on the canvas
     */
    onMouseUp(event: React.MouseEvent): void;
}