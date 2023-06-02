import { ComponentOptions , Fragment, SetupContext, nextTick, onBeforeUnmount } from 'vue';
import mapboxgl from 'mapbox-gl';
import { h , ref , provide , onMounted } from 'vue';
import MapVue , { MapProps } from '../core/map';
import './map.less';
import filter from '../utils/filter';
const MapPropsValidators = {
  accessToken : String,
  mapStyle : [String , Object],
  antialias : Boolean,
  attributionControl : Boolean,
  bearing : Number,
  bearingSnap : Number,
  bounds : mapboxgl.LngLatBounds,
  boxZoom : {
    type : Boolean,
    default : true
  },
  center : Array<Number>,
  clickTolerance : Number,
  collectResourceTiming : Boolean,
  crossSourceCollisions : {
    type : Boolean,
    default : true
  },
  container : [String , HTMLElement],
  cooperativeGestures : Boolean,
  customAttribution : [String , Array<String>],
  dragPan : {
    type : [Boolean , Object],
    default : true
  },
  dragRotate : {
    type : Boolean,
    default : true
  },
  doubleClickZoom : {
    type : Boolean,
    default : true
  },
  hash : [String , Boolean],
  fadeDuration : Number,
  failIfMajorPerformanceCaveat : Boolean,
  fitBoundsOptions : Object,
  interactive : {
    type : Boolean,
    default : true
  },
  keyboard : {
    type : Boolean,
    default : true
  },
  locale : Object,
  localFontFamily : String,
  localIdeographFontFamily : String,
  logoPosition : String,
  maxBounds : mapboxgl.LngLatBounds,
  maxPitch : Number,
  maxZoom : Number,
  minPitch : Number,
  minZoom : Number,
  optimizeForTerrain : {
    type : Boolean,
    default : true
  },
  preserveDrawingBuffer : Boolean,
  pitch : Number,
  projection : String,
  pitchWithRotate : {
    type : Boolean,
    default : true
  },
  refreshExpiredTiles : {
    type : Boolean,
    default : true
  },
  renderWorldCopies : {
    type : Boolean,
    default : true
  },
  scrollZoom : {
    type : Boolean,
    default : true
  },
  trackResize : {
    type : Boolean,
    default : true
  },
  transformRequest : Function,
  touchZoomRotate : {
    type : [Boolean , Object],
    default : true
  },
  touchPitch : {
    type : [Boolean , Object],
    default : true
  },
  zoom : Number,
  maxTileCacheSize : Number,
  testMode : Boolean,
  worldview : String,
  reuse : [Boolean , String],
  canuse : [Boolean , String],
  cursor : String,
  fog : Object,
  terrain : Object,
  light : Object,
  diff : {
    type : Boolean,
    default : true
  },
  onMoveStart : Function,
  onMove : Function,
  onMoveEnd : Function,
  onDragStart : Function,
  onDrag : Function,
  onDragEnd : Function,
  onZoomStart : Function,
  onZoom : Function,
  onZoomEnd : Function,
  onRotateStart : Function,
  onRotate : Function,
  onRotateEnd : Function,
  onPitchStart : Function,
  onPitch : Function,
  onPitchEnd : Function,
  onWheel : Function,
  onBoxZoomStart : Function,
  onBoxZoomCancel : Function,
  onBoxZoomEnd : Function,
  onResize : Function,
  onLoad : Function,
  onIdle : Function,
  onRemove : Function,
  onRender : Function,
  onStyleData : Function,
  onSourceData : Function,
  onError : Function,
  onDataLoading : Function,
  onStyleDataLoading : Function,
  onSourceDataLoading : Function,
  onStyleImageMissing : Function
}
export const Map: ComponentOptions = {
  name : 'Map',
  props : MapPropsValidators,
  setup (props: MapProps , { slots , expose }: SetupContext) {
    // 是否复用
    const reuse = props.reuse || props.reuse === '';
    // 是否可以使用，表示地图已经加载了，我们只需要使用这个地图实例
    const canuse = props.canuse || props.canuse === '';
    // map上下文对象
    const mapContext = ref<MapVue>();
    const containerRef = ref();
    provide('mapContext' , mapContext);
    expose({
      mapContext
    })
    onMounted(() => {
      if (!mapboxgl.supported()) {
        alert("该浏览器不支持mapbox，请升级浏览器版本！");
      } else {
        if (canuse) {
          mapContext.value = MapVue._mapCache.pop() || MapVue.currentMap!;
          return;
        }
        // 复用
        if (reuse) {
          mapContext.value = MapVue.reuse(containerRef.value , filter(props));
        }
        // 创建
        if (!mapContext.value) {
          mapContext.value = new MapVue(mapboxgl.Map , filter(props) , containerRef.value)
        };
        if (!props.canuse) {
          if (props.reuse) {
            // 复用
            mapContext.value.recycle();
          }
        };
        nextTick(() => {
          if (mapContext.value) {
            mapContext.value.map?.resize();
          }
        })
      }
    });
    onBeforeUnmount(() => {
      const { canuse , reuse } = props;
      if (!canuse && !reuse) {
        mapContext.value?.destroy();
      }
    })
    return () => {
      const children = slots.default && slots.default();
      return h(Fragment , [
        !canuse && h('div' , {
          class : 'map',
          ref : containerRef
        }),
        mapContext.value && children
      ])
    }
  }
};