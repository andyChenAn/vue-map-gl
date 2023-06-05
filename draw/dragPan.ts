/**
 * @author : andy
 * @description : 允许地图拖动和不拖动工具方法
 */
import { DrawCustomModeThis } from '@mapbox/mapbox-gl-draw'
export function disable (draw: DrawCustomModeThis) {
  if (draw.map) {
    draw.map.dragPan.disable();
  }
}
export function enable (draw: DrawCustomModeThis) {
  if (draw.map) {
    draw.map.dragPan.enable();
  }
};