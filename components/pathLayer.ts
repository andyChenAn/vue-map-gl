/**
 * @author : andy
 * @description : 路径图层
 */
import { ComponentOptions, Fragment, SetupContext , h } from "vue";
import { Layer } from './layer';
import { Source } from './source';
import { LineString } from "geojson";
export interface PathLayerProps {
  // geojson数据
  geojson?: GeoJSON.FeatureCollection<LineString>,
  // 图层id
  id?: string;
  // 路径的颜色
  lineColor?: string;
  // 路径的线宽
  lineWidth?: number;
  // 路径是否需要箭头
  arrow?: boolean;
  onClick?: (evt: any) => void;
  onMouseDown?: (evt: any) => void;
  onMouseUp?: (evt: any) => void;
  onDblClick?: (evt: any) => void;
  onMouseMove?: (evt: any) => void;
  onMouseEnter?: (evt: any) => void;
  onMouseLeave?: (evt: any) => void;
  onMouseOver?: (evt: any) => void;
  onMouseOut?: (evt: any) => void;
  onContextMenu?: (evt: any) => void;
};
const pathLayerPropsValidators = {
  id : String,
  geojson : {
    type : Object,
    default () {
      return {
        type : 'FeatureCollection',
        features : []
      }
    }
  },
  lineColor : {
    type : String,
    default : '#000'
  },
  lineWidth : {
    type : Number,
    default : 4
  },
  arrow : {
    type : Boolean,
    default : true
  },
  onClick: Function,
  onMouseDown: Function,
  onMouseUp: Function,
  onDblClick: Function,
  onMouseMove: Function,
  onMouseEnter: Function,
  onMouseLeave: Function,
  onMouseOver: Function,
  onMouseOut: Function,
  onContextMenu: Function
}
export const PathLayer: ComponentOptions = {
  name : 'PathLayer',
  props : pathLayerPropsValidators,
  setup (props: PathLayerProps , context: SetupContext) {
    return () => {
      const { geojson , id , lineColor , lineWidth , arrow } = props;
      const handlerProps: Record<string , (evt: any) => void> = {};
      for (const key in props) {
        if (typeof (props as any)[key] === 'function') {
          handlerProps[key] = (props as any)[key];
        }
      };
      return geojson!.features.length > 0 && h(
        Fragment,
        [
          h(
            Source , 
            {
              type : 'geojson' , 
              data : geojson
            } , 
            () => h(
              Layer , 
              {
                id : 'path_' + id , 
                type : 'line' , 
                paint : {
                  'line-width' : lineWidth , 
                  'line-color' : lineColor
                },
                layout : {
                  'line-join' : 'round',
                  'line-cap' : 'round'
                },
                ...handlerProps
              })
            ),
          arrow && h(
            Source , 
            {
              type : 'geojson' , 
              data : geojson
            } , 
            () => h(
              Layer , 
              {
                id : 'arrow_' + id , 
                type : 'symbol' , 
                layout : {
                  'symbol-placement' : 'line',
                  'symbol-spacing' : 20,
                  'icon-image' : 'arrow',
                  'icon-size' : 0.5,
                  'icon-allow-overlap' : true
                }
              }
            )
          )
        ]
      );
    }
  }
};