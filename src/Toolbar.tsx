import { EllipseMode } from './mode/EllipseMode';
import { LineMode } from './mode/LineMode';
import type { Mode } from './mode/Mode';
import { PencilMode } from './mode/PencilMode';
import { RectangleMode } from './mode/RectangleMode';
import { SelectMoveMode } from './mode/SelectMoveMode';
import { PersistentElements, type ShapeStyle } from './PersistentElement';

import './Toolbar.css';

/** Props of the Toolbar component. */
type ToolbarProps = {
  /** Drawing model, or null until the canvas is initialized. */
  persistentElements: PersistentElements | null;
  /** Style shown in the inputs: the selected shape's, or the defaults for new shapes. */
  currentStyle: ShapeStyle;
  /** Called with the chosen mode when the user picks another tool. */
  onModeChange: (mode: Mode) => void;
};

/**
 * Side panel to pick the drawing mode, set the style of shapes,
 * and delete or clone the selected shape.
 */
function Toolbar({ persistentElements, currentStyle, onModeChange }: ToolbarProps) {
  return (
    <div id="toolbar">
      <fieldset>
            <legend>Tools</legend>
            <div>
              <input type="radio" id="move" name="tool" value="move" defaultChecked
                onChange = {() => {if (persistentElements) onModeChange(new SelectMoveMode(persistentElements))}}
              />
              <label htmlFor="move">Select&Move</label>
            </div>
            <div>
              <input type="radio" id="pencil" name="tool" value="pencil"
                onChange = {() => {if (persistentElements) onModeChange(new PencilMode(persistentElements))}}
              />
              <label htmlFor="pencil">Pencil</label>
            </div>
            <div>
              <input type="radio" id="line" name="tool" value="line"
                onChange = {() => {if (persistentElements) onModeChange(new LineMode(persistentElements))}}
              />
              <label htmlFor="line">Line</label>
            </div>
            <div>
              <input type="radio" id="rectangle" name="tool" value="rectangle"
                onChange = {() => {if (persistentElements) onModeChange(new RectangleMode(persistentElements))}}
              />
              <label htmlFor="rectangle">Rectangle</label>
            </div>
            <div>
              <input type="radio" id="ellipse" name="tool" value="ellipse"
                onChange = {() => {if (persistentElements) onModeChange(new EllipseMode(persistentElements))}}
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
                    <input className='input-color' type="color" id="background-color" value={currentStyle.fillColor}
                      onChange = {(e) => {persistentElements?.applyFillColor(e.target.value)}}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="foreground-color">Outline:</label>
                  </td>
                  <td>
                    <input className='input-color' type="color" id="foreground-color" value={currentStyle.strokeColor}
                      onChange = {(e) => {persistentElements?.applyStrokeColor(e.target.value)}}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="line-width">Line width:</label>
                  </td>
                  <td>
                    <input className='input-width' type="number" id="line-width" min="0" max="10" value={currentStyle.lineWidth}
                      onChange = {(e) => {persistentElements?.applyLineWidth(Number(e.target.value))}}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </fieldset>
          <fieldset className='actions-fieldset'>
            <legend>Actions</legend>
            <button id="delete-button" onClick={() => persistentElements?.removeSelectedItem()}>Delete</button>
            <button id="clone-button" onClick={() => persistentElements?.duplicateSelectedItem()}>Clone</button>
          </fieldset>
    </div>
  );
}

export default Toolbar;