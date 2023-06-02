/**
 * @author : andy
 * @description : 图层组件
 */
import { AnyLayout, AnyPaint, AnySourceData, Map, MapLayerEventType } from 'mapbox-gl';
import { ref , watch , ComponentOptions, SetupContext, onMounted, inject, Ref, unref, onBeforeUnmount, nextTick } from 'vue';
import MapVue from '../core/map';
import filter from '../utils/filter';
import equals from '../utils/equals';
export interface LayerProps {
  id?: string;
  type?: 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap' | 'fill-extrusion' | 'raster' | 'hillshade' | 'background' | 'sky';
  metadata?: any;
  ref?: string | undefined;
  source?: string | AnySourceData | undefined;
  'source-layer'?: string | undefined;
  minzoom?: number | undefined;
  maxzoom?: number | undefined;
  interactive?: boolean | undefined;
  filter?: any[] | undefined;
  layout?: AnyLayout | undefined;
  paint?: AnyPaint | undefined;
  beforeId?: string;
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
const layerValidators = {
  id : String,
  type : String,
  metadata : Object,
  ref : String,
  source : [String , Object],
  'source-layer' : String,
  minzoom : Number,
  maxzoom : Number,
  interactive : {
    type : Boolean,
    default : true
  },
  filter : Array,
  layout : {
    type : Object,
    default () {
      return {}
    }
  },
  paint : {
    type : Object,
    default () {
      return {}
    }
  },
  beforeId : String,
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
};
// 图层事件
const layerEvents = {
  mousedown : 'onMouseDown',
  mouseup : 'onMouseUp',
  click : 'onClick',
  dblclick : 'onDblClick',
  mousemove : 'onMouseMove',
  mouseenter : 'onMouseEnter',
  mouseleave : 'onMouseLeave',
  mouseover : 'onMouseOver',
  mouseout : 'onMouseOut',
  contextmenu : 'onContextMenu'
};
// 事件监听器，用于解绑事件
const handlers: Record<string , (evt: any) => void> = {};
export const Layer: ComponentOptions = {
  name : 'Layer',
  props : layerValidators,
  setup (props: LayerProps , { slots }: SetupContext) {
    const mapContext = ref(inject<MapVue>('mapContext'));
    // 该图层对应的数据源id
    const sourceId = ref(inject<Ref>('sourceId'));
    // 旧的props
    const oldProps = ref<LayerProps>({...filter(props)});
    // 新的props
    const newProps = ref<LayerProps>({...filter(props)});
    // 绑定图层事件
    const bindLayerEvents = (map: Map , id: string) => {
      for (const eventName in layerEvents) {
        const handler = wrapEvent.bind(null , map , id);
        handlers[eventName] = handler;
        map.on(eventName as keyof MapLayerEventType , id , handler);
      }
    };

    // 解绑事件
    const unbindLayerEvents = (map: Map , id: string) => {
      for (const eventName in layerEvents) {
        map.off(eventName as keyof MapLayerEventType , id , handlers[eventName]);
      }
    };

    // 事件包装器
    const wrapEvent = (map: Map , id: string , evt: any) => {
      let handler = (newProps.value as any)[(layerEvents as any)[evt.type]];
      // 默认进入图层和离开图层的鼠标手势，如果我们自己定义了相应的监听器，则不会触发
      if (evt.type === 'mouseenter' && !handler) {
        handler = (evt: any) => {
          map.getCanvas().style.cursor = 'pointer';
        }
      };
      if (evt.type === 'mouseleave' && !handler) {
        handler = (evt: any) => {
          map.getCanvas().style.cursor = 'grab';
        }
      }
      if (handler) {
        const features = map.queryRenderedFeatures(evt.point , {
          layers : [id]
        });
        evt.features = features;
        handler(evt);
        delete evt.features;
      }
    }
    
    // 创建图层
    const createLayer = (map: Map , props: LayerProps) => {
      // 判断数据源是否已经加载了
      if (map.getSource(sourceId.value)) {
        const layerProps = { ...props };
        layerProps.source = sourceId.value;
        delete layerProps.beforeId;
        map.addLayer(layerProps as any , props.beforeId);
        bindLayerEvents(map , layerProps.id!);
      }
    };

    // 更新图层
    const updateLayer = (map: Map , newProps: LayerProps , oldProps: LayerProps) => {
      const { id , filter , minzoom , maxzoom , beforeId , layout = {} , paint = {} } = newProps;
      // 如果beforeId不一样，那么移动图层的位置
      if (beforeId !== oldProps.beforeId) {
        map.moveLayer(id! , beforeId);
      }
      // 更新layout
      if (!equals(layout , oldProps.layout)) {
        for (const key in layout) {
          if (!equals((layout as any)[key] , (oldProps.layout as any)[key])) {
            map.setLayoutProperty(id! , key , (layout as any)[key]);
          }
        };
        // 删除
        for (const key in oldProps.layout) {
          if (!layout.hasOwnProperty(key)) {
            map.setLayoutProperty(id! , key , undefined);
          }
        }
      };

      // 更新paint
      if (!equals(paint , oldProps.paint)) {
        for (const key in paint) {
          if (!equals((paint as any)[key] , (oldProps.paint as any)[key])) {
            map.setPaintProperty(id! , key , (paint as any)[key]);
          }
        }
        // 删除
        for (const key in oldProps.paint) {
          if (!paint.hasOwnProperty(key)) {
            map.setPaintProperty(id! , key , undefined);
          }
        }
      };
      // 更新filter
      if (!equals(filter , oldProps.filter)) {
        map.setFilter(id! , filter);
      };
      // 更新zoom
      if (minzoom !== oldProps.minzoom || maxzoom !== oldProps.maxzoom) {
        map.setLayerZoomRange(id! , minzoom! , maxzoom!);
      }
    };
    
    // 初始化图层
    const initLayer = () => {
      const { id } = unref(newProps);
      if (mapContext.value) {
        const map = mapContext.value.map;
        const layer = map?.getLayer(id!);
        if (layer) {
          // 更新图层
          updateLayer(map! , newProps.value , oldProps.value);
        } else {
          // 创建图层
          createLayer(map! , newProps.value);
        }
      }
      oldProps.value = Object.assign(oldProps.value , newProps.value);
    };

    watch(props , () => {
      newProps.value = {...filter(props)};
      initLayer();
    });

    onMounted(() => {
      initLayer();
    });

    onBeforeUnmount(() => {
      if (mapContext.value) {
        const map = mapContext.value.map;
        nextTick(() => {
          unbindLayerEvents(map! , newProps.value.id!);
          const layer =  map?.getLayer(newProps.value.id!);
          if (layer) {
            map?.removeLayer(newProps.value.id!);
          }
        })
      };
    });
    
    return () => {
      return null;
    }
  }
};
