/**
 * @author : andy
 * @description : 轨迹图层
 */
import { ComponentOptions, Fragment, SetupContext , h, watchEffect , ref , watch, inject, renderSlot } from "vue";
import { PathLayer } from '../pathLayer';
import { Layer } from '../layer';
import { Source } from '../source';
import { LineString , Point } from "geojson";
import { omit } from 'lodash-es';
import { rhumbBearing , rhumbDestination , distance , point } from '@turf/turf';
import TrackPanel from './TrackPanel.vue';
import MapVue from "../../core/map";
export interface TrackLayerProps {
  id?: string;
  geojson?: GeoJSON.FeatureCollection<LineString>;
  lineWidth?: number;
  lineColor?: string;
  arrow?: boolean;
  speed?: number;
  icon?: {name: string; url: any; size: number;}
  panel?: boolean;
}
const trackLayerPropsValidators = {
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
  speed : {
    type : Number,
    default : 10
  },
  icon : Object,
  panel : Boolean
}
export const TrackLayer: ComponentOptions = {
  name : 'TrackLayer',
  props : trackLayerPropsValidators,
  emits : ['play'],
  setup (props: TrackLayerProps , {slots , emit}: SetupContext) {
    const { geojson , icon } = props;
    const mapContext = ref(inject<MapVue>('mapContext'));
    const lineGeojson = ref<GeoJSON.Feature<LineString>>({
      type : 'Feature',
      properties : {},
      geometry : {
        type : 'LineString',
        coordinates : []
      }
    });
    // 是否展示轨迹图层
    const showTrack = ref(false);
    const trackGeojson = ref<GeoJSON.Feature<LineString>>({
      type : 'Feature',
      properties : {},
      geometry : {
        type : 'LineString',
        coordinates : []
      }
    });
    // 加载图标
    const showIcon = ref(false);
    const progress = ref(0);
    const iconGeojson = ref<GeoJSON.Feature<Point>>({
      type : 'Feature',
      properties : {
        bearing : 0
      },
      geometry : {
        type : 'Point',
        coordinates : []
      }
    })
    const loadIcon = async (icon: {name: string; url: any}) => {
      const result = await mapContext.value?.addImage(icon!.name , icon!.url);
      return result as boolean;
    }
    if (icon) {
      loadIcon(icon!).then(res => {
        if (res === true) {
          showIcon.value = true;
        }
      });
    }

    watchEffect(() => {
      // 当geojson发生变化时，就需要更新lineGeojson数据
      if (geojson!.features.length > 0) {
        // 每次变化时，就先重置lineGeojson
        lineGeojson.value.geometry.coordinates = [];
        // 遍历geojson中的每一个坐标点，通过两两坐标点计算坐标点之间的角度
        // 通过两个坐标点的角度和距离，生成两个坐标点之间的坐标点，目的是为了拿到更多的坐标，方便我们执行轨迹动画效果
        const len = geojson?.features[0].geometry.coordinates.length!;
        for (let i = 0 ; i < len - 1 ; i++) {
          let start = geojson?.features[0].geometry.coordinates[i];
          let end = geojson?.features[0].geometry.coordinates[i + 1];
          const bearing = rhumbBearing(start , end);
          let dist = distance(point(start!) , point(end!));
          lineGeojson.value.geometry.coordinates.push(rhumbDestination(start , 0 , bearing).geometry.coordinates);
          const moveDist = 0.001 * props.speed!;
          while (dist >= moveDist) {
            // 动画的速度
            dist -= moveDist;
            const point: GeoJSON.Feature<Point> = rhumbDestination(start , moveDist , bearing);
            lineGeojson.value.geometry.coordinates.push(point.geometry.coordinates);
            start = point.geometry.coordinates;
          }
          lineGeojson.value.geometry.coordinates.push(rhumbDestination(end , 0 , bearing).geometry.coordinates);
        };
      };
    });

    // 监听lineGeojson数据的变化，如果变化了，那么就需要清空原来的轨迹，重新计算轨迹
    // 计数器
    let count = 0;
    let requestId: number;
    watch(lineGeojson , () => {
      cancelAnimationFrame(requestId);
      showTrack.value = true;
      trackGeojson.value.geometry.coordinates = [];
      iconGeojson.value.geometry.coordinates = [];
      count = 0;
      const update = () => {
        if (count >= lineGeojson.value.geometry.coordinates.length) {
          count = 0;
          cancelAnimationFrame(requestId);
          return;
        }
        if (props.icon) {
          // 计算图标的角度
          const start = lineGeojson.value.geometry.coordinates[count-1 >= 0 ? count - 1 : 0];
          const end = lineGeojson.value.geometry.coordinates[count];
          const bearing = rhumbBearing(start , end);
          iconGeojson.value.properties!.bearing = bearing;
          iconGeojson.value.geometry.coordinates = lineGeojson.value.geometry.coordinates[count];
        } else {
          trackGeojson.value.geometry.coordinates.push(lineGeojson.value.geometry.coordinates[count]);
        }
        count += 1;
        progress.value = Math.floor((count / lineGeojson.value.geometry.coordinates.length) * 100);
        requestId = requestAnimationFrame(update);
      }
      update();
    } , {deep : true , flush : 'post'});
    return () => {
      console.log(props.panel , 'asd')
      return h(Fragment , [
        h(PathLayer , omit(props , ['speed' , 'icon' , 'panel'])),
        showTrack.value && h(
          PathLayer,
          {
            id : 'track_' + props.id,
            geojson : {
              type : 'FeatureCollection',
              features : [trackGeojson.value]
            },
            lineColor : '#007aff',
            lineWidth : 2,
            arrow : false
          }
        ),
        // 如果存在icon的话，那么表示通过一个图标来展示轨迹效果
        showIcon.value && iconGeojson.value.geometry.coordinates.length > 0 && h(
          Source,
          {
            type : 'geojson',
            data : {
              type : "FeatureCollection",
              features : [iconGeojson.value]
            }
          },
          () => h(Layer , {
            id : 'track_icon_' + props.id,
            type : 'symbol',
            layout : {
              "icon-image" : props.icon!.name,
              "icon-size" : props.icon?.size || 0.3,
              'icon-rotate' : ['get' , 'bearing'],
              'icon-allow-overlap' : true
            }
          })
        ),
        props.panel && h(
          TrackPanel,
          {
            onClick () {
              emit('play');
            },
            onProgress (value: number) {
              const len = lineGeojson.value.geometry.coordinates.length;
              if (len > 0) {
                let index = Math.floor(len * (value / 100));
                index = index >= len ? len - 1 : index;
                const coord = lineGeojson.value.geometry.coordinates[index];
                if (index > 1) {
                  const preCoord = lineGeojson.value.geometry.coordinates[index- 1];
                  const bearing = rhumbBearing(preCoord , coord);
                  iconGeojson.value.properties!.bearing = bearing;
                }
                iconGeojson.value.geometry.coordinates = coord;
              } 
            },
            progress : progress.value,
            
          },
          () => slots.default && slots.default()
        )
      ])
    }
  }
};