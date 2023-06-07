/**
 * @author : andy
 * @description : 直接选中的模式，就是鼠标在feature中点击两次的状态，用户对feature直接进行操作
 */
import MapboxDraw , { modes , constants, DrawFeature } from "@mapbox/mapbox-gl-draw";
import { createCircleVertex , createRectVertex } from "./utils/createVertex";
import { distance , circle , point , featureCollection , envelope } from '@turf/turf';
import equals from '../../utils/equals';
import createArrow from './utils/createArrow';
const { moveFeatures } = MapboxDraw.lib;
const DirectSelectMode: any = {
  ...modes.direct_select,
  dragFeature (state: any , evt: any , delta: any) {
    moveFeatures(this.getSelected() , delta);
    state.dragMoveLocation = evt.lngLat;

    // 圆形
    this.getSelected().filter((feature: DrawFeature) => feature.properties?.isCircle)
    .map((feature: DrawFeature) => feature.properties?.center)
    .map((center: number[]) => {
      center[0] += delta.lng;
      center[1] += delta.lat;
      return center;
    });

    // 矩形
    this.getSelected().filter((feature: DrawFeature) => feature.properties?.isRect)
    .map((feature: DrawFeature) => {
      let point = feature.properties?.point;
      let endPoint = feature.properties?.endPoint;
      point[0] += delta.lng;
      point[1] += delta.lat;
      endPoint[0] += delta.lng;
      endPoint[1] += delta.lat;
      return feature;
    });

    // 箭头
    this.getSelected().filter((feature: DrawFeature) => feature.properties?.isArrow)
    .map((feature: DrawFeature) => {
      let start = feature.properties?.start;
      start[0] += delta.lng;
      start[1] += delta.lat;
      return feature;
    });
  },
  dragVertex (state: any , evt: any , delta: any) {
    if (state.feature.properties.isCircle) {
      // 需要重新计算圆的半径，并绘制圆
      const center = state.feature.properties.center;
      const move = [evt.lngLat.lng , evt.lngLat.lat];
      const radius = distance(point(center) , point(move));
      const circleGeojson = circle(center , radius);
      state.feature.incomingCoords(circleGeojson.geometry.coordinates);
      state.feature.properties.radius = radius;
    } else if (state.feature.properties.isRect) {
      // 矩形
      const pathIndex = state.selectedCoordPaths[0].split('.')[1];
      const firstPoint = state.feature.properties.point;
      if (equals(state.feature.coordinates[0][pathIndex] , firstPoint)) {
        return;
      };
      const rectFeatures = featureCollection([point(firstPoint) , point([evt.lngLat.lng , evt.lngLat.lat])]);
      const feature = envelope(rectFeatures);
      state.feature.incomingCoords(feature.geometry.coordinates);
      state.feature.properties.endPoint = [evt.lngLat.lng , evt.lngLat.lat];
    } else if (state.feature.properties.isArrow) {
      // 箭头
      createArrow(state.feature , evt);
    } else {
      const selectedCoords = state.selectedCoordPaths.map((coord_path: string) => state.feature.getCoordinate(coord_path));
      const selectedCoordPoints = selectedCoords.map((coords: any) => ({
        type: constants.geojsonTypes.FEATURE,
        properties: {},
        geometry: {
          type: constants.geojsonTypes.POINT,
          coordinates: coords
        }
      }));
      const constrainedDelta = MapboxDraw.lib.constrainFeatureMovement(selectedCoordPoints, delta);
      for (let i = 0; i < selectedCoords.length; i++) {
        const coord = selectedCoords[i];
        state.feature.updateCoordinate(state.selectedCoordPaths[i], coord[0] + (constrainedDelta as any).lng, coord[1] + (constrainedDelta as any).lat);
      }
    }
  },
  toDisplayFeatures (state: any , geojson: any , display: any) {
    if (geojson.properties) {
      if (state.featureId === geojson.properties.id) {
        geojson.properties.active = constants.activeStates.ACTIVE;
        let points: any[] = [];
        if (geojson.properties.user_isCircle) {
          // 圆形
          points = createCircleVertex(geojson);
        } else if (geojson.properties.user_isRect) {
          // 矩形
          points = createRectVertex(geojson);
        } else {
          points = MapboxDraw.lib.createSupplementaryPoints(geojson , {
            // @ts-ignore
            map : this.map,
            midpoints : true,
            selectedPaths : state.selectedCoordPaths
          })
        }
        points.forEach(display);
      } else {
        geojson.properties.active = constants.activeStates.INACTIVE;
      }
      display(geojson);
    }
  }
};
export default DirectSelectMode;