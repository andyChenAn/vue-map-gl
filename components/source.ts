import { 
  h , 
  onMounted , 
  onBeforeUpdate , 
  getCurrentInstance , 
  inject , 
  onBeforeUnmount , 
  ref , 
  ComponentOptions, 
  SetupContext,
  Fragment,
  provide,
  watch,
 } from 'vue';
import { Map ,  Source as SourceType , PromoteIdSpecification , SourceVectorLayer, AnySourceData, GeoJSONSource, ImageSource, VideoSource, VectorSourceImpl, Layer } from 'mapbox-gl';
import MapVue from '../core/map';
import filter from '../utils/filter';
import equals from '../utils/equals';
export interface GeoJSONSourceData {
  data?:  
      | GeoJSON.Feature<GeoJSON.Geometry>
      | GeoJSON.FeatureCollection<GeoJSON.Geometry>
      | GeoJSON.Geometry
      | string;
  maxzoom?: number | undefined;
  attribution?: string | undefined;
  buffer?: number | undefined;
  tolerance?: number | undefined;
  cluster?: number | boolean | undefined;
  clusterRadius?: number | undefined;
  clusterMaxZoom?: number | undefined;
  clusterMinPoints?: number | undefined;
  clusterProperties?: object | undefined;
  lineMetrics?: boolean | undefined;
  generateId?: boolean | undefined;
  promoteId?: PromoteIdSpecification | undefined;
  filter?: any;
};
export interface VideoSourceData {
  urls?: string[] | undefined;
  coordinates?: number[][] | undefined;
}
export interface ImageSourceData {
  url?: string | undefined;
  coordinates?: number[][] | undefined;
}
export interface CanvasSourceData {
  animate?: boolean | undefined;
  canvas?: string | HTMLCanvasElement;
  coordinates: number[][];
}
export interface VectorSourceData {
  format?: 'pbf';
  name?: string;
  url?: string | undefined;
  tiles?: string[] | undefined;
  bounds?: number[] | undefined;
  scheme?: 'xyz' | 'tms' | undefined;
  minzoom?: number | undefined;
  maxzoom?: number | undefined;
  attribution?: string | undefined;
  promoteId?: PromoteIdSpecification | undefined;
  vector_layers?: SourceVectorLayer[];
}
export interface RasterSourceData {
  name?: string;
  format?: 'webp' | string;
  url?: string | undefined;
  tiles?: string[] | undefined;
  bounds?: number[] | undefined;
  minzoom?: number | undefined;
  maxzoom?: number | undefined;
  tileSize?: number | undefined;
  scheme?: 'xyz' | 'tms' | undefined;
  attribution?: string | undefined;
}
export interface RasterDemSourceData {
  name?: string;
  url?: string | undefined;
  tiles?: string[] | undefined;
  bounds?: number[] | undefined;
  minzoom?: number | undefined;
  maxzoom?: number | undefined;
  tileSize?: number | undefined;
  attribution?: string | undefined;
  encoding?: 'terrarium' | 'mapbox' | undefined;
}
export interface CustomSourceInterfaceData<T> {
  dataType: 'raster';
  minzoom?: number;
  maxzoom?: number;
  scheme?: string;
  tileSize?: number;
  attribution?: string;
  bounds?: [number, number, number, number];
  hasTile?: (tileID: { z: number; x: number; y: number }) => boolean;
  loadTile: (tileID: { z: number; x: number; y: number }, options: { signal: AbortSignal }) => Promise<T>;
  prepareTile?: (tileID: { z: number; x: number; y: number }) => T | undefined;
  unloadTile?: (tileID: { z: number; x: number; y: number }) => void;
  onAdd?: (map: Map) => void;
  onRemove?: (map: Map) => void;
}
export type SourceProps = {
  type?: SourceType['type'];
  id?: string;
  // 当前数据源对应的图层配置
  layerConfig?: Record<string , any>
} & (GeoJSONSourceData | VideoSourceData | ImageSourceData | CanvasSourceData | VectorSourceData | RasterSourceData | RasterDemSourceData | CustomSourceInterfaceData<HTMLImageElement | ImageData | ImageBitmap>)
const SourcePropsValidators = {
  id : String,
  type : String,
  data : [String , Object],
  maxzoom : Number,
  attribution : String,
  buffer : Number,
  tolerance : Number,
  cluster : [Number , Boolean],
  clusterRadius : Number,
  clusterMaxZoom : Number,
  clusterMinPoints : Number,
  clusterProperties : Object,
  lineMetrics : Boolean,
  generateId : Boolean,
  promoteId : Object,
  filter : [String , Array<String>],
  urls : Array<String>,
  coordinates : Array<Number>,
  url : String,
  format : String,
  name : String,
  tiles : Array<String>,
  bounds : Array<Number>,
  scheme : String,
  minzoom : Number,
  vector_layers : Array<Object>,
  tileSize : Number,
  encoding : String,
  dataType : String,
  hasTile : Function,
  loadTile : Function,
  prepareTile : Function,
  unloadTile : Function,
  onAdd : Function,
  onRemove : Function
}
export const Source: ComponentOptions = {
  name : 'Source',
  props : SourcePropsValidators,
  setup (props: SourceProps , { slots }: SetupContext) {
    const mapContext = ref(inject<MapVue>('mapContext'));
    const instance = getCurrentInstance();
    // 数据源id
    const sourceId = ref();
    // 数据源
    const source = ref();
    // 上一次的props
    let oldProps = Object.assign({} , filter(props));
    let newProps = Object.assign({} , filter(props));
    provide('sourceId' , sourceId);
    // 强制组件更新
    const forceUpdate = () => {
      let requestId: number;
      const update = () => {
        if (mapContext.value) {
          const map = mapContext.value!.map;
          // 如果地图已经加载完了，那么就更新数据源
          if ((map as any).style && (map as any).style._loaded) {
            instance?.update();
            cancelAnimationFrame(requestId);
            return;
          }
        }
        requestId = requestAnimationFrame(update);
      }
      update();
    };

    // 创建数据源
    const createSource = (map: Map , id: string , props: SourceProps) => {
      // 判断地图是否加载完成
      if ((map as any).style && (map as any).style._loaded) {
        // 拷贝一个props的副本，主要目的是为了删除props传递的id和layerConfig，这两个属性是不需要的
        const sourceProps = {...props};
        delete sourceProps.id;
        delete sourceProps.layerConfig;
        map.addSource(id , sourceProps as AnySourceData);
        return map.getSource(id);
      }
    };

    // 更新数据源
    const updateSource = (source: any , newProps: SourceProps , oldProps: SourceProps) => {
      const { type } = newProps;
      console.log(23424)
      switch (type) {
        case 'geojson':
          (source as GeoJSONSource).setData((newProps as any).data);
          break;
        case 'image':
          (source as ImageSource).updateImage({
            url : (newProps as any).url,
            coordinates : (newProps as any).coordinates
          });
          break;
        case 'video':
        case 'canvas':
          if (!equals((newProps as any).coordinates , (oldProps as any).coordinates)) {
            (source as VideoSource).setCoordinates((newProps as any).coordinates);
          }
          break;
        case 'vector':
          if ((newProps as any).url !== (oldProps as any).url) {
            (source as VectorSourceImpl).setUrl((newProps as any).url);
          };
          if (equals((newProps as any).tiles , (oldProps as any).tiles)) {
            (source as VectorSourceImpl).setTiles((newProps as any).tiles)
          };
          break;
        case 'raster':
        case 'raster-dem':
          if ((newProps as any).url !== (oldProps as any).url) {
            (source as any).setUrl((newProps as any).url);
          };
          if (equals((newProps as any).tiles , (oldProps as any).tiles)) {
            (source as any).setTiles((newProps as any).tiles)
          };
          break;
        default:
          throw new Error("更新source失败！");
      }
    };

    // 删除地形
    const removeTerrain = () => {
      const map = mapContext.value?.map;
      const terrain = map?.getTerrain();
      terrain && map?.setTerrain();
    };

    const initSource = () => {
      newProps = Object.assign(newProps , filter(props));
      // 判断数据源是否存在id，如果不存在，那么就自动生成一个
      !newProps.id && (newProps.id = MapVue.generateSourceId());
      sourceId.value = newProps.id;
      if (mapContext.value) {
        const map = mapContext.value.map;
        // 获取数据源，如果存在，那么就更新数据源，否则就创建
        const layerSource = map && (map as any).style && map.getSource(sourceId.value);
        if (layerSource) {
          // 更新数据源
          updateSource(source.value , newProps , oldProps);
        } else {
          // 创建数据源
          source.value = createSource(map! , sourceId.value , newProps);
        }
        oldProps = Object.assign(oldProps , newProps);
      }
    }

    watch(props , () => {
      initSource();
    })
    
    onBeforeUpdate(() => {
      initSource();
    });

    onMounted(() => {
      forceUpdate();
    });

    onBeforeUnmount(() => {
      // 删除图层
      const map = mapContext.value?.map;
      if (map && map.isStyleLoaded() && map.getSource(sourceId.value)) {
        const allLayers = map.getStyle().layers;
        if (allLayers) {
          for (let layer of allLayers) {
            if ((layer as Layer).source === sourceId.value) {
              map.removeLayer(layer.id);
            }
          }
        }
        // 删除地形，这里需要先删除地形（如果有的话），因为删除source的时候，需要先删除地形，再删除source不然就会报错
        removeTerrain();
        map.removeSource(sourceId.value);
      }
    })
    return () => {
      const children = slots.default && slots.default();
      if (source.value) {
        return h(Fragment , children);
      } else {
        return null;
      }
    }
  }
};