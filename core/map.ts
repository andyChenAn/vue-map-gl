/**
 * @auhtor : andy
 * @description : 地图类
 */
import { Map , Style , LngLatBoundsLike, LngLatLike, DragPanOptions, FitBoundsOptions, Projection, TransformRequestFunction, InteractiveOptions , Fog , TerrainSpecification, Light } from 'mapbox-gl';
import equals from '../utils/equals';
import Draw from '../draw';
import 'mapbox-gl/dist/mapbox-gl.css';
export interface MapProps {
  // mapbox所需的token
  accessToken?: string | undefined;
  // 底图样式
  mapStyle?: string | Style | undefined;
  antialias?: boolean | undefined;
  attributionControl?: boolean | undefined;
  bearing?: number | undefined;
  bearingSnap?: number | undefined;
  bounds?: LngLatBoundsLike | undefined,
  boxZoom?: boolean | undefined
  center?: LngLatLike | undefined;
  clickTolerance?: number | undefined;
  collectResourceTiming?: boolean | undefined;
  crossSourceCollisions?: boolean | undefined;
  container?: string | HTMLElement | undefined;
  cooperativeGestures?: boolean | undefined;
  customAttribution?: string | string[] | undefined;
  dragPan?: boolean | DragPanOptions | undefined;
  dragRotate?: boolean | undefined;
  doubleClickZoom?: boolean | undefined;
  hash?: boolean | string | undefined;
  fadeDuration?: number | undefined;
  failIfMajorPerformanceCaveat?: boolean | undefined;
  fitBoundsOptions?: FitBoundsOptions | undefined;
  interactive?: boolean | undefined;
  keyboard?: boolean | undefined;
  locale?: {[key: string]: string} | undefined;
  localFontFamily?: string | undefined;
  localIdeographFontFamily?: string | undefined;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  maxBounds?: LngLatBoundsLike | undefined;
  maxPitch?: number | undefined;
  maxZoom?: number | undefined;
  minPitch?: number | undefined;
  minZoom?: number | undefined;
  optimizeForTerrain?: boolean | undefined;
  preserveDrawingBuffer?: boolean | undefined;
  pitch?: number | undefined;
  projection?: Projection | undefined;
  pitchWithRotate?: boolean | undefined;
  refreshExpiredTiles?: boolean | undefined;
  renderWorldCopies?: boolean | undefined;
  scrollZoom?: boolean | undefined;
  trackResize?: boolean | undefined;
  transformRequest?: TransformRequestFunction | undefined;
  touchZoomRotate?: boolean | InteractiveOptions | undefined;
  touchPitch?: boolean | InteractiveOptions | undefined;
  zoom?: number | undefined;
  maxTileCacheSize?: number | undefined;
  testMode?: boolean | undefined;
  worldview?: string | undefined;
  reuse?: boolean | string | undefined;
  canuse?: boolean | string | undefined;
  cursor?: string | undefined;
  fog?: Fog;
  terrain?: TerrainSpecification;
  light?: Light;
  diff?: boolean | undefined;
  onMoveStart?:(evt: any) => void;
  onMove?:(evt: any) => void;
  onMoveEnd?:(evt: any) => void;
  onDragStart?:(evt: any) => void;
  onDrag?:(evt: any) => void;
  onDragEnd?:(evt: any) => void;
  onZoomStart?:(evt: any) => void;
  onZoom?:(evt: any) => void;
  onZoomEnd?:(evt: any) => void;
  onRotateStart?:(evt: any) => void;
  onRotate?:(evt: any) => void;
  onRotateEnd?:(evt: any) => void;
  onPitchStart?:(evt: any) => void;
  onPitch?:(evt: any) => void;
  onPitchEnd?:(evt: any) => void;
  onWheel?:(evt: any) => void;
  onBoxZoomStart?:(evt: any) => void;
  onBoxZoomCancel?:(evt: any) => void;
  onBoxZoomEnd?:(evt: any) => void;
  onResize?:(evt: any) => void;
  onLoad?:(evt: any) => void;
  onIdle?:(evt: any) => void;
  onRemove?:(evt: any) => void;
  onRender?:(evt: any) => void;
  onStyleData?:(evt: any) => void;
  onSourceData?:(evt: any) => void;
  onError?:(evt: any) => void;
  onDataLoading?:(evt: any) => void;
  onStyleDataLoading?:(evt: any) => void;
  onSourceDataLoading?:(evt: any) => void;
  onStyleImageMissing?:(evt: any) => void;
};
// 相机事件
const cameraEvents = {
  movestart : 'onMoveStart',
  move : 'onMove',
  moveend : 'onMoveEnd',
  dragstart : 'onDragStart',
  drag : 'onDrag',
  dragend : 'onDragEnd',
  zoomstart : 'onZoomStart',
  zoom : 'onZoom',
  zoomend : 'onZoomEnd',
  rotatestart : 'onRotateStart',
  rotate : 'onRotate',
  rotateend : 'onRotateEnd',
  pitchstart : 'onPitchStart',
  pitch : 'onPitch',
  pitchend : 'onPitchEnd'
};

// 地图事件
const mapEvents = {
  wheel : 'onWheel',
  boxzoomstart : 'onBoxZoomStart',
  boxzoomcancel : 'onBoxZoomCancel',
  boxzoomend : 'onBoxZoomEnd',
  resize : 'onResize',
  load : 'onLoad',
  idle : 'onIdle',
  remove : 'onRemove',
  render : 'onRender',
  styledata : 'onStyleData',
  sourcedata : 'onSourceData',
  error : 'onError',
  dataloading : 'onDataLoading',
  styledataloading : 'onStyleDataLoading',
  sourcedataloading : 'onSourceDataLoading',
  styleimagemissing : 'onStyleImageMissing'
};
// 保存事件回调函数
const handlers: Record<string , (evt: any) => void> = {};
export default class MapVue {
  // 用于自动生成数据源id
  static sourceId: number = 0;
  // 用于自动生成图层id
  static layerId: number = 0;
  private _MapClass: typeof Map;
  private props: MapProps;
  private _map: Map | null = null;
  // draw实例
  draw: Draw | null = null;
  // 缓存mapbox实例
  static _mapCache: MapVue[] = [];
  // 当前mapbox实例
  static currentMap: MapVue | null = null;
  constructor (MapClass: typeof Map , props: MapProps , container: HTMLElement) {
    this._MapClass = MapClass;
    this.props = props;
    this.init(container);
  }
  init (container: HTMLElement) {
    const { props } = this;
    // 创建mapbox实例
    const map: Map = new this._MapClass({...props , container , style : props.mapStyle});
    // 创建draw实例
    this.draw = new Draw(map);
    this._map = map;
    MapVue.currentMap = this;
    // 设置fog，light，terrain
    this.setFogAndLightAndTerrain(props);
    // 绑定地图事件
    this.bindMapEvents();
  }
  /**
   * 复用mapbox
   * @param container 容器
   * @param props mapbox参数
   */
  static reuse (container: HTMLElement , props: MapProps) {
    const instance = MapVue._mapCache.pop();
    if (!instance) {
      return;
    }
    const map = instance._map;
    MapVue.currentMap = instance;
    const oldContainer = map?.getContainer();
    container.className = oldContainer?.className!;
    while (oldContainer?.childNodes.length! > 0) {
      container.appendChild(oldContainer?.childNodes[0]!);
    }
    // @ts-ignore
    map._container = container;
    instance.updateProps({...props});
    return instance;
  }
  /**
   * 更新选项
   * @param props mapbox选项
   */
  updateProps (props: MapProps) {
    const oldProps: MapProps = this.props;
    // 更新相机属性
    this.updateCameraOptions(props);
    // 更新mapbox配置数据
    this.updateMapSettings(props , oldProps);
    // 更新地图样式
    this.updateMapStyle(props , oldProps);
    // 更新fog，light，terrain
    this.updateFog(props , oldProps);
    this.updateLight(props , oldProps);
    this.updateTerrain(props , oldProps);
  }
  /**
   * 更新地图样式
   * @param props 新值
   * @param oldProps 旧值
   */
  updateMapStyle (props: MapProps , oldProps: MapProps) {
    const map = this._map;
    if (props.cursor !== oldProps.cursor) {
      map && (map.getCanvas().style.cursor = props.cursor!);
    }
    if (props.mapStyle !== oldProps.mapStyle) {
      const options: any = {
        diff : props.diff
      };
      if ('localIdeographFontFamily' in props && props['localIdeographFontFamily']) {
        options.localIdeographFontFamily = props['localIdeographFontFamily'];
      }
      map?.setStyle(props.mapStyle! , options);
    }
  }
  /**
   * 
   * @param props 新值
   * @param oldProps 旧值
   */
  updateMapSettings (props: MapProps , oldProps: MapProps) {
    const attributes = ['minZoom' , 'maxZoom' , 'minPitch' , 'maxBounds' , 'renderWorldCopies'];
    const map = this._map;
    for (const key of attributes) {
      if (key in props && !equals((props as any)[key] , (oldProps as any)[key])) {
        (map as any)[`set${key[0].toUpperCase()}${key.slice(1)}`]((props as any)[key]);
      }
    }
  }
  updateCameraOptions (props: MapProps) {
    // 相机有关属性
    const attributes = ['zoom' , 'pitch' , 'bearing' , 'center'];
    const map = this._map;
    for (const key of attributes) {
      (map as any)[`set${key[0].toUpperCase()}${key.slice(1)}`]((props as any)[key]);
    }
  }
  /**
   * 回收mapbox实例，将实例保存在_mapCache中
   */
  recycle () {
    MapVue._mapCache.push(this);
  }
  /**
   * 销毁地图
   */
  destroy () {
    this.unbindMapEvents();
    this._map?.remove();
    MapVue._mapCache.pop();
  }
  /**
   * 解绑事件
   */
  unbindMapEvents () {
    const map = this._map;
    for (const eventName in handlers) {
      map?.off(eventName , handlers[eventName]);
    }
  }
  /**
   * 绑定map事件
   */
  bindMapEvents () {
    const map = this._map;
    // 绑定相机事件
    for (let eventName in cameraEvents) {
      handlers[eventName] = this.wrapperCameraEvent.bind(this);
      map?.on(eventName , handlers[eventName]);
    }
    // 绑定地图事件
    for (let eventName in mapEvents) {
      handlers[eventName] = this.wrapperMapEvent.bind(this);
      map?.on(eventName , handlers[eventName]);
    }
  }
  /**
   * 事件包装器
   * @param evt 事件对象
   */
  wrapperMapEvent (evt: any) {
    // @ts-ignore
    const handler = this.props[mapEvents[evt.type]];
    if (handler) {
      handler(evt);
    }
  }
  /**
   * 事件包装器
   * @param evt 事件对象
   */
  wrapperCameraEvent (evt: any) {
    // @ts-ignore
    const handler = this.props[cameraEvents[evt.type]];
    if (handler) {
      handler(evt);
    }
  }
  /**
   * 不断的调用requestAnmationFrame来判断地图样式是否加载完成，并设置fog，light，terrain
   * @param props mapbox参数
   */
  setFogAndLightAndTerrain (props: MapProps) {
    const map = this._map;
    let requestId: number;
    const update = () => {
      if (map?.isStyleLoaded()) {
        cancelAnimationFrame(requestId);
        this.updateFog(props, {});
        this.updateLight(props , {});
        this.updateTerrain(props , {});
        return;
      }
      requestId = requestAnimationFrame(update);
    }
    update();
  }
  /**
   * 更新terrain
   * @param newProps 新值
   * @param oldProps 旧值
   */
  updateTerrain (newProps: MapProps , oldProps: MapProps) {
    const map = this._map;
    if (map?.isStyleLoaded()) {
      if ("terrain" in newProps && !equals(newProps.terrain , oldProps.terrain)) {
        // 获取地形数据源，判断地形数据源是否已经加载
        const terrainSource = map.getSource(newProps.terrain?.source!);
        if (terrainSource) {
          // 已经加载，那么直接设置
          map.setTerrain(newProps.terrain);
        } else {
          // 如果还没有加载地形数据源，那么先等加载数据源之后，再设置
          let requestId: number;
          const wait = () => {
            const terrainSource = map.getSource(newProps.terrain?.source!);
            if (terrainSource) {
              cancelAnimationFrame(requestId);
              map.setTerrain(newProps.terrain);
              return;
            }
            requestId = requestAnimationFrame(wait);
          }
          wait();
        }
      }
    }
  }
  /**
   * 更新light
   * @param newProps 新值
   * @param oldProps 旧值
   */
  updateLight (newProps: MapProps , oldProps: MapProps) {
    const map = this._map;
    if (map?.isStyleLoaded()) {
      if ('light' in newProps && !equals(newProps.light , oldProps.light)) {
        map.setLight(newProps.light!);
      }
    }
  }
  /**
   * 更新fog，地图的雾
   * @param newProps 新值
   * @param oldProps 新值
   */
  updateFog (newProps: MapProps , oldProps: MapProps) {
    const map = this._map;
    if (map?.isStyleLoaded()) {
      if ('fog' in newProps && !equals(newProps.fog , oldProps.fog)) {
        map.setFog(newProps.fog!);
      }
    }
  }
  /**
   * 当用户没有设置数据源id时，内部会自动根据sourceCount创建一个id
   */
  static generateSourceId () {
    return 'source-' + (++this.sourceId)
  }
  /**
   * 当用户没有设置图层id，内部会根据layerCount自动创建一个图层id
   */
  static generateLayerId () {
    return 'layer-' + (++this.layerId);
  }

  /**
   * 添加图片
   * @param name 图片id
   * @param url 图片地址，可以url也可以是require('xxx')解析的图片
   * @param options 调用mapbox对象的addImage方法传入的options，可选
   * @returns Promise对象
   */
  addImage (name: string , url: any, options: object = {}) {
    const map = this._map;
    return new Promise((resolve , reject) => {
      if (!map) {
        throw new Error('地图还没有初始化完成');
      }
      if (!map.hasImage(name)) {
        map.loadImage(url , (err , image) => {
          if (err) {
            reject(err);
          } else {
            map.addImage(name , image! , options);
            resolve(true);
          }
        })
      }
    })
  }
  /**
    * mapbox所有的图片
   */
  listImages () {
    const map = this._map;
    return map?.listImages();
  }
  /**
   * 删除指定的图片
   * @param name 图片id
   */
  removeImage (name: string) {
    const map = this._map;
    if (map?.hasImage(name)) {
      map?.removeImage(name);
    }
  }
  /**
   * 更新图片
   * @param name 图片id
   * @param url 图片地址，可以url也可以是require('xxx')解析的图片
   * @returns Promise对象
   */
  updateImage (name: string , url: string) {
    const map = this._map;
    return new Promise((resolve , reject) => {
      map?.loadImage(url , (err , image) => {
        if (err) {
          reject(false);
        } else {
          if (map?.hasImage(name)) {
            map?.updateImage(name , image!);
            resolve(true)
          }
        }
      })
    })
  }
  
  get map() {
    return this._map;
  }
};
