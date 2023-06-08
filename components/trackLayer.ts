/**
 * @author : andy
 * @description : 轨迹图层
 */
import { ComponentOptions, Fragment, SetupContext , h, watchEffect , ref , watch } from "vue";
import { PathLayer } from './pathLayer';
import { LineString , Point } from "geojson";
import { rhumbBearing , rhumbDestination , distance , point } from '@turf/turf';
export interface TrackLayerProps {
  id?: string;
  geojson?: GeoJSON.FeatureCollection<LineString>;
  lineWidth?: string;
  lineColor?: string;
  arrow?: boolean;
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
}
export const TrackLayer: ComponentOptions = {
  name : 'TrackLayer',
  props : trackLayerPropsValidators,
  setup (props: TrackLayerProps , {slots}: SetupContext) {
    const { geojson } = props;
    const lineGeojson = ref<GeoJSON.Feature<LineString>>({
      type : 'Feature',
      properties : {},
      geometry : {
        type : 'LineString',
        coordinates : []
      }
    });
    const lineGeojson2 = ref<GeoJSON.Feature<LineString>>({
      type : 'Feature',
      properties : {},
      geometry : {
        type : 'LineString',
        coordinates : []
      }
    });
    watchEffect(() => {
      if (geojson!.features.length > 0) {
        const len = geojson?.features[0].geometry.coordinates.length!;
        for (let i = 0 ; i < len - 1 ; i++) {
          let start = geojson?.features[0].geometry.coordinates[i];
          let end = geojson?.features[0].geometry.coordinates[i + 1];
          const bearing = rhumbBearing(start , end);
          let dist = distance(point(start!) , point(end!));
          lineGeojson.value.geometry.coordinates.push(rhumbDestination(start , 0 , bearing).geometry.coordinates);
          while (dist >= 0.01) {
            dist -= 0.01;
            const point: GeoJSON.Feature<Point> = rhumbDestination(start , 0.01 , bearing);
            lineGeojson.value.geometry.coordinates.push(point.geometry.coordinates);
            start = point.geometry.coordinates;
          }
          lineGeojson.value.geometry.coordinates.push(rhumbDestination(end , 0 , bearing).geometry.coordinates);
        }
      };
    });
    let count = 0;
    let requestId: number;
    watch(lineGeojson , () => {
      lineGeojson2.value.geometry.coordinates = [];
      const update = () => {
        if (count >= lineGeojson.value.geometry.coordinates.length) {
          cancelAnimationFrame(requestId);
          return;
        }
        lineGeojson2.value.geometry.coordinates.push(lineGeojson.value.geometry.coordinates[count++]);
        requestId = requestAnimationFrame(update);
      }
      update();
    } , {deep : true , flush : 'post'})
    return () => {
      return h(Fragment , [
        h(PathLayer , props),
        lineGeojson2.value.geometry.coordinates.length > 0 && h(
          PathLayer,
          {
            id : 'track_' + props.id,
            geojson : {
              type : 'FeatureCollection',
              features : [lineGeojson2.value]
            },
            lineColor : '#007aff',
            lineWidth : 2,
            arrow : false
          }
        )
      ])
    }
  }
};