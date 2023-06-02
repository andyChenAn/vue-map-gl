/**
 * @author: andy
 * @description : 地图标记marker组件
 */
import { ref , ComponentOptions, SetupContext, h, renderSlot, inject, watchEffect, onMounted, nextTick, onBeforeUnmount , watch } from 'vue';
import { MarkerOptions , Marker as MapMarker } from 'mapbox-gl';
import MapVue from '../core/map';
import filter from '../utils/filter';
import equals from '../utils/equals';
export interface MarkerProps extends MarkerOptions {
  longitude?: number;
  latitude?: number;
  onClick?: (evt: any) => void;
};
const markerPropsValidators = {
  anchor : {
    type : String,
    default : 'center'
  },
  clickTolerance : {
    type : Number,
    default : 0
  },
  color : {
    type : String,
    default : '#3FB1CE'
  },
  draggable : {
    type : Boolean,
    default : true
  },
  element : HTMLElement,
  occludedOpacity : {
    type : Number,
    default : 0.2
  },
  offset : Object,
  pitchAlignment : {
    type : String,
    default : 'auto'
  },
  rotation : {
    type : Number,
    default : 0
  },
  rotationAlignment : {
    type : String,
    default : 'auto'
  },
  scale : {
    type : Number,
    default : 1
  },
  longitude : Number,
  latitude : Number,
  onClick : Function
};
const events = {
  click : 'onClick'
};
const handlers: Record<string , (evt: any) => void> = {};
export const Marker: ComponentOptions = {
  name : 'Marker',
  props : markerPropsValidators,
  setup (props: MarkerProps , {slots}: SetupContext) {
    // mapvue实例
    const mapContext = ref(inject<MapVue>('mapContext'));
    const markerRef = ref();
    const marker = ref<MapMarker>();

    // 新的props
    const newProps = ref<MarkerProps>({...filter(props)});
    // 旧的props
    const oldProps = ref<MarkerProps>({...filter(props)});

    let el: HTMLElement;

    const bindEvents = (el: HTMLElement) => {
      for (const eventName in events) {
        const handler = wrapEvent.bind(null , eventName);
        handlers[eventName] = handler;
        el.addEventListener(eventName , handler);
      }
    };

    const unbindEvents = (el: HTMLElement) => {
      for (const eventName in handlers) {
        el.removeEventListener(eventName , handlers[eventName])
      }
    };

    const wrapEvent = (eventName: string , evt: any) => {
      const handler = (newProps.value as any)[(events as any)[eventName]];
      if (handler) {
        handler(evt);
      }
    };

    // 创建marker
    const createMarker = (newProps: MarkerProps) => {
      const { longitude , latitude } = newProps;
      const map = mapContext.value?.map;
      el = markerRef.value.children[0];
      nextTick(() => {
        marker.value = new MapMarker(el , newProps).setLngLat([longitude! , latitude!]).addTo(map!);
      });
      bindEvents(el);
    };

    // 更新marker
    const updateMarker = (newProps: MarkerProps , oldProps: MarkerProps) => {
      const { 
        longitude , 
        latitude , 
        offset , 
        rotationAlignment , 
        rotation , 
        pitchAlignment ,
        draggable ,
      } = newProps;
      if (marker.value) {
        if (!equals(longitude , oldProps.longitude) || !equals(latitude , oldProps.latitude)) {
          marker.value.setLngLat([longitude! , latitude!]);
        };
        if (!equals(offset , oldProps.offset)) {
          marker.value.setOffset(offset!);
        };
        if (!equals(rotationAlignment , oldProps.rotationAlignment)) {
          marker.value.setRotationAlignment(rotationAlignment!);
        };
        if (!equals(rotation , oldProps.rotation)) {
          marker.value.setRotation(rotation!);
        };
        if (!equals(pitchAlignment , oldProps.pitchAlignment)) {
          marker.value.setPitchAlignment(pitchAlignment!);
        };
        if (!equals(draggable , oldProps.draggable)) {
          marker.value.setDraggable(draggable!);
        }
      }
    };

    watchEffect(() => {
      newProps.value = filter(props);
      updateMarker(newProps.value , oldProps.value);
      oldProps.value = Object.assign(oldProps.value , newProps.value);
    })

    onMounted(() => {
      createMarker(newProps.value);
    });

    onBeforeUnmount(() => {
      marker.value && marker.value.remove();
      el && unbindEvents(el);
    });

    return () => {
      return h('div' , {
        ref : markerRef
      } , renderSlot(slots , 'default'));
    }
  }
};