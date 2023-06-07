/**
 * @author : andy
 * @description : 简单选中模式，也就是鼠标在feature中点击一次的状态
 */
import MapboxDraw , { modes , DrawFeature , constants } from '@mapbox/mapbox-gl-draw';
import { createCircleVertex , createRectVertex } from './utils/createVertex';
import isRanging from './utils/isRanging';
const displayVertex = (geojson: any) => {
  if (geojson.properties?.user_isCircle) {
    // 如果是圆形
    return createCircleVertex(geojson);
  } else if (geojson.properties?.user_isRect) {
    // 如果是矩形
    return createRectVertex(geojson);
  } else {
    // 其他图形
    return MapboxDraw.lib.createSupplementaryPoints(geojson);
  }
};
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
    // 判断当前feature是否为测距，如果是，那就让feature不能拖动
    if (isRanging(this.getSelected())) {
      return;
    }
    // 移动feature
    MapboxDraw.lib.moveFeatures(this.getSelected() , delta);
    // 过滤选中的feature，如果feature为圆形，重新计算圆形的中心点
    this.getSelected().filter((item: DrawFeature) => item.properties?.isCircle)
    .map((item: DrawFeature) => item.properties?.center)
    .map((center: number[]) => {
      center[0] += delta.lng;
      center[1] += delta.lat;
      return center;
    });

    // 过滤选中的feature，如果feature是矩形
    this.getSelected().filter((feature: DrawFeature) => feature.properties?.isRect)
    .map((feature: DrawFeature) => {
      let point = feature.properties?.point;
      let endPoint = feature.properties?.endPoint;
      point[0] += delta.lng;
      point[1] += delta.lat;
      endPoint[0] += delta.lng;
      endPoint[1] += delta.lat;
      return feature;
    });

    // 箭头
    this.getSelected().filter((feature: DrawFeature) => feature.properties?.isArrow)
    .map((feature: DrawFeature) => {
      let start = feature.properties?.start;
      start[0] += delta.lng;
      start[1] += delta.lat;
      return feature;
    });

    // 更新位置
    state.dragMoveLocation = evt.lngLat;
  },
  toDisplayFeatures (state:{[key: string]: any;} = {} , geojson: GeoJSON.Feature , display: (geojson: GeoJSON.Feature) => void) {
    if (geojson.properties) {
      // 设置feature的状态，active属性表示feature是否激活的状态，active表示激活状态，inactive表示非激活状态
      geojson.properties.active = this.isSelected(geojson.properties.id) ? constants.activeStates.ACTIVE : constants.activeStates.INACTIVE;
      // 绘制
      display(geojson);
      this.fireActionable();
      // 如果feature是非激活的状态，或者feature是一个点，那么就不需要绘制顶点
      if (geojson.properties.active !== constants.activeStates.ACTIVE || geojson.geometry.type === constants.geojsonTypes.POINT) {
        return;
      }
      // 判断feature的形状，根据不同形状，创建不同的顶点，并展示
      const points = displayVertex(geojson);
      points?.forEach(display);
    }
  }
};
export default SimpleSelectMode;