import MapboxDraw , { DrawCustomMode , modes } from '@mapbox/mapbox-gl-draw';
const SimpleSelectMode: any = {
  ...modes.simple_select,
  /**
   * 当拖动draw时触发
   * @param state 可变状态的对象
   * @param evt 事件对象
   */
  dragMove (state: any , evt: any) {
    // 计算差值
    const delta = {
      lng : evt.lngLat.lng - state.dragMoveLocation.lng,
      lat : evt.lngLat.lat - state.dragMoveLocation.lat
    };
    MapboxDraw.lib.moveFeatures(this.getSelected() , delta);
    
  },
};
export default SimpleSelectMode;