/**
 * @author : andy
 * @description : 画圈
 */
import { DrawCustomMode , constants } from '@mapbox/mapbox-gl-draw'
import { disable , enable } from '../dragPan';
import { distance , point , circle } from '@turf/turf';
let featureId: string;
const CircleMode: DrawCustomMode = {
  onSetup (options: any = {}) {
    // 画圈的时候，是否是重写模式，如果是true，只会在地图上画一个圈
    // 如果是false，就表示不是重写模式，就表示可以在地图上画多个圈
    if (options.override) {
      const feature = this.getFeature(featureId);
      if (feature && feature.properties?.center.length > 0) {
        this.deleteFeature(featureId);
      };
    }
    const polygon = this.newFeature({
      type : constants.geojsonTypes.FEATURE,
      properties : {
        center : [],
        isCircle : true
      },
      geometry : {
        type : constants.geojsonTypes.POLYGON,
        coordinates : [[]]
      }
    });
    // 清除所有选中的features
    this.clearSelectedFeatures();
    // 禁止地图拖动
    disable(this);
    // 将新建的feature添加到draw中
    this.addFeature(polygon);
    // 更新鼠标样式
    this.updateUIClasses({
      mouse : constants.cursors.ADD
    });
    this.setActionableState({
      trash: true,
      combineFeatures: false,
      uncombineFeatures: false
    });
    featureId = polygon.id as string;
    return {
      polygon
    }
  },
  /**
   * 鼠标按下时，保存圆的中心点坐标
   * @param state 可变状态的对象，在onSetup生命周期中创建的
   * @param evt 事件对象
   */
  onMouseDown (state: any , evt: any) {
    // 设置圆的中心点坐标
    const center = state.polygon.properties.center;
    if (center.length == 0) {
      state.polygon.properties.center = [evt.lngLat.lng , evt.lngLat.lat];
    }
  },
  /**
   * 鼠标在地图上拖拽时，保存圆的geojson数据和半径
   * @param state 可变状态的对象，在onSetup生命周期中创建的
   * @param evt 事件对象
   */
  onDrag (state: any , evt: any) {
    // 计算圆的半径
    const center = state.polygon.properties.center;
    if (center.length > 0) {
      const radius = distance(point(center) , point([evt.lngLat.lng , evt.lngLat.lat]));
      const circlePolygon = circle(center , radius);
      state.polygon.incomingCoords(circlePolygon.geometry.coordinates);
      state.polygon.properties.radius = radius;
    }
  },
  /**
   * 鼠标按键放开时，允许地图拖动，并且转换到simple_select模式
   * @param state 可变状态的对象，在onSetup生命周期中创建的
   * @param evt 事件对象
   */
  onMouseUp (state: any , evt: any) {
    // 允许地图拖动
    enable(this);
    return this.changeMode('simple_select' , {
      featureIds : [state.polygon.id]
    });
  },
  /**
   * 当模式正准备退出的时候触发，这个时候我们就触发draw.create事件，表示创建完成
   * @param state 可变状态的对象，在onSetup生命周期中创建的
   */
  onStop (state: any) {
    // 触发draw.create事件
    this.map.fire('draw.create' , {
      features : [state.polygon.toGeoJSON()]
    });
  },
  /**
   * 当鼠标点击时触发，如果多次点击，那么就应该重置圆的中心点坐标
   * @param state 可变状态的对象，在onSetup生命周期中创建的
   * @param evt 事件对象
   */
  onClick (state: any , evt: any) {
    state.polygon.properties.center = [];
  },
  toDisplayFeatures (state:{[key: string]: any;} = {} , geojson: GeoJSON.Feature , display: any) {
    if (geojson.properties) {
      // 哪个是当前正在绘制的圆圈
      const active = geojson.properties.id === state.polygon.id ? 'true' : 'false';
      geojson.properties.active = active;
      // 之前绘制的圆圈，那么就直接展示
      if (active === 'false') {
        display(geojson);
      };
      // 绘制当前的圆圈
      if (active === 'true' && geojson.properties.user_center.length > 0) {
        display(geojson);
      };
    }
  }
}
export default CircleMode;