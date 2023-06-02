/**
 * @author : andy
 * @description : 地图弹框组件
 */
import { ComponentOptions, SetupContext, getCurrentInstance, h, inject, onBeforeUnmount, onMounted, ref, renderSlot, watchEffect } from 'vue';
import { PopupOptions , Popup as MapboxPopup } from 'mapbox-gl';
import MapVue from '../core/map';
import filter from '../utils/filter';
import equals from '../utils/equals';
export interface PopupProps extends PopupOptions {
  longitude?: number;
  latitude?: number;
  onClose?: (evt: any) => void;
  onOpen?: (evt: any) => void;
}
const popupPropsValidators = {
  anchor : String,
  className : String,
  closeButton : {
    type : Boolean,
    default : false
  },
  closeOnClick : {
    type : Boolean,
    default : true
  },
  closeOnMove : {
    type : Boolean,
    default : false
  },
  focusAfterOpen : {
    type : Boolean,
    default : true
  },
  maxWidth : {
    type : String,
    default : 'auto'
  },
  offset : [Number , Object],
  longitude : Number,
  latitude : Number,
  onClose : Function,
  onOpen : Function
};
const events = {
  open : 'onOpen',
  close : 'onClose'
};
const handlers: Record<string , (evt: any) => void> = {};
export const Popup: ComponentOptions = {
  name : 'Popup',
  props : popupPropsValidators,
  setup (props: PopupProps , {slots}: SetupContext) {
    const mapContext = ref(inject<MapVue>('mapContext'));
    // 新props
    const newProps = ref<PopupProps>({...filter(props)});
    // 旧props
    const oldProps = ref<PopupProps>({...filter(props)});
    // 获取当前组件实例
    const instance = getCurrentInstance();
    // 弹框内容
    let el: HTMLElement;
    const popup = ref();

    const bindEvents = () => {
      for (const eventName in events) {
        const handler = wrapEvent.bind(null , eventName);
        handlers[eventName] = handler;
        popup.value.on(eventName , handler);
      }
    };

    const wrapEvent = (eventName: string , evt: any) => {
      const handler = (newProps.value as any)[(events as any)[eventName]];
      if (handler) {
        handler(evt);
      }
    };

    const unbindEvents = () => {
      for (const eventName in handlers) {
        popup.value.off(eventName , handlers[eventName]);
      }
    }

    // 创建popup
    const createPopup = () => {
      el = instance?.vnode.el!.nextElementSibling;
      const map = mapContext.value?.map;
      const { longitude , latitude } = newProps.value;
      popup.value = new MapboxPopup(newProps.value)
        .setLngLat([longitude! , latitude!])
        .setDOMContent(el)
        .addTo(map!);
      bindEvents();
    };

    // 更新弹框
    const updatePopup = (newProps: PopupProps , oldProps: PopupProps) => {
      const { longitude , latitude } = newProps;
      if (!equals(longitude , oldProps.longitude) || !equals(latitude , oldProps.latitude)) {
        popup.value.setLngLat([longitude , latitude]);
      }
    };

    watchEffect(() => {
      newProps.value = filter(props);
      updatePopup(newProps.value , oldProps.value);
      oldProps.value = Object.assign(oldProps.value , newProps.value);
    });

    onMounted(() => {
      createPopup();
    });

    onBeforeUnmount(() => {
      unbindEvents();
      popup.value.remove();
    })

    return () => {
      return renderSlot(slots , 'default');
    }
  }
}