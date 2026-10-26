import type { ShapeStyle } from './canvas/CanvasItem';
import { dispatch } from './stores/dispatcher';
import { useItemStore } from './stores/useItemStore';
import { useToolStore } from './stores/useToolStore';

import './Toolbar.css';

/**
 * Side panel to pick the drawing mode, set the style of shapes,
 * and delete or clone the selected shape.
 *
 * The style inputs edit the selected shape if there is one, otherwise the
 * style of new shapes: the toolbar picks the action to send, so neither
 * store has to read the other.
 */
function Toolbar() {
  // --- Stores ---
  const selectedItem = useItemStore((s) => s.selectedItem);
  const fillColor = useToolStore((s) => s.fillColor);
  const strokeColor = useToolStore((s) => s.strokeColor);
  const lineWidth = useToolStore((s) => s.lineWidth);

  // Style shown in the inputs: the selected shape's, or the style of new shapes.
  // Computed at each render rather than stored, so it is always in sync.
  const shownStyle: ShapeStyle = selectedItem ?? { fillColor, strokeColor, lineWidth };

  return (
    <div id="toolbar">
      <fieldset>
            <legend>Tools</legend>
            <div>
              <input type="radio" id="move" name="tool" value="move" defaultChecked
                onChange = {() => dispatch({ type: 'changeMode', mode: 'selectMove' })}
              />
              <label htmlFor="move">Select&Move</label>
            </div>
            <div>
              <input type="radio" id="pencil" name="tool" value="pencil"
                onChange = {() => dispatch({ type: 'changeMode', mode: 'pencil' })}
              />
              <label htmlFor="pencil">Pencil</label>
            </div>
            <div>
              <input type="radio" id="line" name="tool" value="line"
                onChange = {() => dispatch({ type: 'changeMode', mode: 'line' })}
              />
              <label htmlFor="line">Line</label>
            </div>
            <div>
              <input type="radio" id="rectangle" name="tool" value="rectangle"
                onChange = {() => dispatch({ type: 'changeMode', mode: 'rectangle' })}
              />
              <label htmlFor="rectangle">Rectangle</label>
            </div>
            <div>
              <input type="radio" id="ellipse" name="tool" value="ellipse"
                onChange = {() => dispatch({ type: 'changeMode', mode: 'ellipse' })}
              />
              <label htmlFor="ellipse">Ellipse</label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Style</legend>
            <table>
              <tbody>
                <tr>
                  <td>
                    <label htmlFor="background-color">Fill color:</label>
                  </td>
                  <td>
                    <input className='input-color' type="color" id="background-color" value={shownStyle.fillColor}
                      onChange = {(e) => dispatch(selectedItem
                        ? { type: 'changeSelectedFillColor', color: e.target.value }
                        : { type: 'changeToolFillColor', color: e.target.value })}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="foreground-color">Outline:</label>
                  </td>
                  <td>
                    <input className='input-color' type="color" id="foreground-color" value={shownStyle.strokeColor}
                      onChange = {(e) => dispatch(selectedItem
                        ? { type: 'changeSelectedStrokeColor', color: e.target.value }
                        : { type: 'changeToolStrokeColor', color: e.target.value })}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="line-width">Line width:</label>
                  </td>
                  <td>
                    <input className='input-width' type="number" id="line-width" min="0" max="10" value={shownStyle.lineWidth}
                      onChange = {(e) => dispatch(selectedItem
                        ? { type: 'changeSelectedLineWidth', lineWidth: Number(e.target.value) }
                        : { type: 'changeToolLineWidth', lineWidth: Number(e.target.value) })}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </fieldset>
          <fieldset className='actions-fieldset'>
            <legend>Actions</legend>
            <button id="delete-button" onClick={() => dispatch({ type: 'delete' })}>Delete</button>
            <button id="clone-button" onClick={() => dispatch({ type: 'clone' })}>Clone</button>
          </fieldset>
    </div>
  );
}

export default Toolbar;
