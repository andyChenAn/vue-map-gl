/**
 * @author : andy
 * @description : 聚合图层组件
 */
import { ref , ComponentOptions, SetupContext, h, Fragment, mergeProps } from 'vue';
import { Layer } from './layer';
import filter from '../utils/filter';
export interface ClusterLayerProps {
  id?: string;
  // 聚合图层的文本样式，可以填写当图层类型为symbol时，layout或者paint中的text-前缀开头的字段
  text?: {
    layout?: Record<string , any>;
    paint?: Record<string , any>;
  };
  // 聚合图层的圈样式，可以填写图层类型为circle时的layout或者paint中的字段
  circle?: {
    layout?: Record<string , any>;
    paint?: Record<string , any>;
  };
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
}
const ClusterLayerPropsValidators = {
  id: String,
  text : {
    type : Object,
    default () {
      return {
        layout : {},
        paint : {}
      }
    }
  },
  circle : {
    type : Object,
    default () {
      return {
        layout : {},
        paint : {}
      }
    }
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
export const ClusterLayer: ComponentOptions = {
  name : 'ClusterLayer',
  props : ClusterLayerPropsValidators,
  setup (props: ClusterLayerProps , { slots }: SetupContext) {
    return () => {
      const { id , circle , text } = filter(props);
      return h(Fragment , [
        h(Layer , mergeProps(props as any , {
          id : id + '1',
          type : 'circle',
          filter : ['has' , 'point_count'],
          paint : Object.assign({
            'circle-radius' : [
              'step',
              ['get' , 'point_count'],
              20,
              100,
              30,
              750,
              40
            ],
            'circle-color' : [
              'step',
              ['get' , 'point_count'],
              '#51bbd6',
              100,
              '#f1f075',
              750,
              '#f28cb1'
            ]
          } , circle?.paint),
          layout : Object.assign({} , circle?.layout)
        })),
        h(Layer , mergeProps({
          id : id + '2',
          type : 'symbol',
          filter : ['has' , 'point_count'],
          layout : Object.assign({
            'text-field' : ['get' , 'point_count'],
            'text-size': 12
          } , text.layout),
          paint : Object.assign({} , text.paint)
        }))
      ]);
    }
  }
}
