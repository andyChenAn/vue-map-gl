import { Map } from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import theme from './theme';
import CircleMode from './modes/CircleMode';
import SimpleSelectMode from './modes/SimpleSelectMode';
interface DrawOptions {
  create?: (evt: any) => void;
  update?: (evt: any) => void;
  delete?: (evt: any) => void;
  style?: DrawStyle;
}

interface DrawStyle {
  // 面的填充色
  fillColor?: string;
  // 面的外面的那条线的颜色
  fillOutlineColor?: string;
  // 面的透明度
  fillOpacity?: number;
  // 线宽
  lineWidth?: number;
  // 线的填充色
  lineColor?: string;
  // 线的透明度
  lineOpacity?: number;
  // 顶点的填充色
  vertexColor?: string;
  // 顶点的半径
  vertexRadius?: number;
  // 圆圈(点)的颜色
  circleColor?: string;
  // 圆圈(点)的半径
  circleRadius?: number;
  // 圆圈(点)的透明度
  circleOpacity?: number;
}

const noopEventHander = () => {}
export default class Draw {
  private map: Map;
  private draw: MapboxDraw | null = null;
  create: (evt: any) => void = noopEventHander;
  update: (evt: any) => void = noopEventHander;
  delete: (evt: any) => void = noopEventHander;
  callback: () => void = () => {};
  constructor (map: Map) {
    this.map = map;
    this.initDraw();
  }
  initDraw () {
    this.draw = new MapboxDraw({
      displayControlsDefault : false,
      defaultMode : "simple_select",
      userProperties : true,
      styles : theme,
      modes : {
        ...MapboxDraw.modes,
        draw_circle : CircleMode,
        simple_select : SimpleSelectMode
      },
    });
    this.bindDrawEvents();
    this.map.addControl(this.draw);
  }
  bindDrawEvents () {
    this.map.on('draw.create' , (evt: any) => {
      if (this.create && typeof this.create === 'function') {
        this.create(evt);
      }
    });
    this.map.on('draw.update' , (evt: any) => {
      if (this.update && typeof this.update === 'function') {
        this.update(evt);
      }
    });
    this.map.on('draw.delete' , (evt: any) => {
      if (this.delete && typeof this.delete === 'function') {
        this.delete(evt);
      }
    })
  }
  /**
   * 设置标绘事件监听器
   * @param options 选项
   */
  setDrawhandlers (options: DrawOptions = {}) {
    this.create = (evt: any) => {
      // 当创建成功的时候更新样式
      if (evt.features.length > 0) {
        this.draw?.setFeatureProperty(evt.features[0].id , 'custom' , true);
        // 更新样式
        this.updateStyle(evt.features[0].id , options.style as DrawStyle);
      }
      options.create = options.create || noopEventHander;
      options.create!(evt);      
    };
    this.update = options.update || noopEventHander;
    this.delete = options.delete || noopEventHander;
  }
  /**
   * 画线
   * @param options 选项
   */
  drawLine (options: DrawOptions = {}) {
    this.setDrawhandlers(options);
    this.draw?.changeMode('draw_line_string');
  }
  /**
   * 更新标绘样式
   * @param featureId featureId
   * @param style 样式
   */
  updateStyle (featureId: string , style: DrawStyle) {
    for (const name in style) {
      this.draw?.setFeatureProperty(featureId , name , (style as any)[name]);
    }
  }
  drawPolygon (options: DrawOptions = {}) {
    this.setDrawhandlers(options);
    this.draw?.changeMode('draw_polygon');
  }
  drawPoint (options: DrawOptions = {}) {
    this.setDrawhandlers(options);
    this.draw?.changeMode('draw_point');
  }
  drawCircle (options: DrawOptions = {}) {
    this.setDrawhandlers(options);
    this.draw?.changeMode('draw_circle');
  }
};