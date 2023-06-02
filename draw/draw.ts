import { Map } from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import theme from './theme';
interface DrawOptions {
  create?: (evt: any) => void;
  update?: (evt: any) => void;
  delete?: (evt: any) => void;
  style?: DrawStyle;
}

interface DrawStyle {
  polygonFillInactiveColor?: string;
  polygonFillInactiveOutLineColor?: string;
  polygonFillInactiveOpacity?: number;

  polygonFillActiveColor?: string;
  polygonFillActiveOutLineColor?: string;
  polygonFillActiveOpacity?: number;

  polygonMidpointCircleColor?: string;
  polygonMidpointCircleRadius?: number;

  polygonStrokeInactiveLineColor?: string;
  polygonStrokeInactiveLineWidth?: number;

  polygonStrokeActiveLineColor?: string;
  polygonStrokeActiveLineWidth?: number;

  lineInactiveLineColor?: string;
  lineInactiveLineWidth?: number;
  lineActiveLineColor?: string;
  lineActiveLineWidth?: number;

  polygonAndLineVertexStrokeInactiveCircleRadius?: number;
  polygonAndLineVertexStrokeInactiveCircleColor?: string;
  polygonAndLineVertexInactiveCircleRadius?: number;
  polygonAndLineVertexInactiveCircleColor?: string;

  pointStrokeInactiveCircleRadius?: number;
  pointStrokeInactiveCircleOpacity?: number;
  opacityStrokeInactiveCircleColor?: string;

  pointInactiveCircleRadius?: number;
  pointInactiveCircleColor?: string;

  pointStrokeActiveCircleRadius?: number;
  pointStrokeActiveCircleColor?: string;

  pointActiveCircleRadius?: number;
  pointActiveCircleColor?: string;

  polygonFillStaticFillColor?: string;
  polygonFillStaticFillOutlineColor?: string;
  polygonFillStaticFillOpacity?: number;

  polygonStrokeStaticLineColor?: string;
  polygonStrokeStaticLineWidth?: number;

  lineStaticLineColor?: string;
  lineStaticLineWidth?: number;

  pointStaticCircleRadius?: number;
  pointStaticCircleColor?: string;
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
      ...MapboxDraw.modes
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

  drawLine (options: DrawOptions = {}) {
    this.create = (evt: any) => {
      if (evt.features.length > 0) {
        this.draw?.setFeatureProperty(evt.features[0].id , 'custom' , true);
        // 更新样式
        this.updateLineStyle(evt.features[0].id , options.style!);
      }
      options.create!(evt);      
    };
    this.update = options.update || noopEventHander;
    this.delete = options.delete || noopEventHander;
    this.draw?.changeMode('draw_line_string');
  }
  /**
   * 更新线的样式
   * @param featureId featureId
   * @param style 样式
   */
  updateLineStyle (featureId: string , style: DrawStyle) {
    this.draw?.setFeatureProperty(featureId , 'lineActiveLineColor' , style.lineActiveLineColor);
    this.draw?.setFeatureProperty(featureId , 'lineInactiveLineColor' , style.lineInactiveLineColor);
  }
};