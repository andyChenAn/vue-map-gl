import { Map } from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import theme from './theme';
import CircleMode from './modes/CircleMode';
import SimpleSelectMode from './modes/SimpleSelectMode';
import DirectSelectMode from './modes/DirectSelectMode';
import RectMode from './modes/RectMode';
import ArrowMode from './modes/ArrowMode';
import LineStringMode from './modes/LineStringMode';
interface DrawOptions {
  create?: (evt: any) => void;
  update?: (evt: any) => void;
  delete?: (evt: any) => void;
  selectionchange?: (evt: any) => void;
  style?: DrawStyle;
  ranging?: boolean;
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
  selectionchange: (evt: any) => void = noopEventHander;
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
        simple_select : SimpleSelectMode,
        direct_select : DirectSelectMode,
        draw_circle : CircleMode,
        draw_rect : RectMode,
        draw_arrow : ArrowMode,
        draw_line_string : LineStringMode
      },
    });
    this.bindDrawEvents();
    this.map.addControl(this.draw);
  }
  bindDrawEvents () {
    this.map.on('draw.create' , (evt: any) => {
      console.log('create')
      if (this.create && typeof this.create === 'function') {
        this.create(evt);
      }
    });
    this.map.on('draw.update' , (evt: any) => {
      console.log('update')
      if (this.update && typeof this.update === 'function') {
        this.update(evt);
      }
    });
    this.map.on('draw.delete' , (evt: any) => {
      console.log('delete')
      if (this.delete && typeof this.delete === 'function') {
        this.delete(evt);
      }
    });
    this.map.on('draw.selectionchange' , (evt: any) => {
      this.selectionchange(evt);
    });
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
      if (options.ranging) {
        setTimeout(() => {
          this.draw?.changeMode('simple_select');
        }, 0);
      }
    };
    this.update = options.update || noopEventHander;
    this.delete = (evt: any) => {
      if (options.ranging) {
        // 如果是测距，当删除的时候，需要清除dom
        const ranges = document.querySelectorAll(".range-text");
        if (ranges && ranges.length > 0) {
          ranges.forEach(dom => {
            dom.parentNode?.removeChild(dom);
          })
        }
      };
      options.delete = options.delete || noopEventHander;
      options.delete!(evt);
    };
    this.selectionchange = (evt: any) => {
      // 如果是测距，那么就不让它选中
      if (options.ranging) {
        this.draw?.changeMode('simple_select');
      }
    };
  }
  /**
   * 画线
   * @param options 选项
   */
  drawLine (options: DrawOptions = {}) {
    this.setDrawhandlers(options);
    this.draw?.changeMode('draw_line_string' , options as any);
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
  drawRect (options: DrawOptions = {}) {
    this.setDrawhandlers(options);
    this.draw?.changeMode('draw_rect');
  }
  drawArrow (options: DrawOptions = {}) {
    this.setDrawhandlers(options);
    this.draw?.changeMode('draw_arrow');
  }
  /**
   * 测距
   */
  ranging (options: any = {}) {
    this.drawLine({...options , ranging : true});
  }
  /**
   * 删除选中的feature
   */
  deleteDraw () {
    const selectedIds = this.draw?.getSelected().features.reduce((list , item) => {
      list.push(item.id as string);
      return list;
    } , [] as string[]);
    if (selectedIds!.length > 0) {
      this.draw?.delete(selectedIds!);
      this.map.fire("draw.delete");
    }
  }
  /**
   * 删除所有的feature
   */
  deleteAllDraw () {
    this.draw?.deleteAll();
    this.map.fire("draw.delete");
  }
};