import { DrawCustomMode , constants } from "@mapbox/mapbox-gl-draw";
import { disable , enable } from "../dragPan";
import { featureCollection , point , envelope } from '@turf/turf';
const RectMode: DrawCustomMode = {
  onSetup (options) {
    const polygon = this.newFeature({
      type : constants.geojsonTypes.FEATURE,
      properties : {
        isRect : true,
        point : []
      },
      geometry : {
        type : constants.geojsonTypes.POLYGON,
        coordinates : [[]]
      }
    });
    disable(this);
    this.addFeature(polygon);
    this.clearSelectedFeatures();
    this.activateUIButton(constants.geojsonTypes.POLYGON);
    this.updateUIClasses({
      mouse : constants.cursors.ADD
    });
    this.setActionableState({
      trash : true,
      combineFeatures : false,
      uncombineFeatures : false
    });
    return {
      polygon
    }
  },
  onMouseDown (state , evt) {
    const point = state.polygon.properties.point;
    if (point.length === 0) {
      state.polygon.properties.point = [evt.lngLat.lng , evt.lngLat.lat];
    }
  },
  onMouseUp (state , evt) {
    enable(this);
    state.polygon.properties.endPoint = [evt.lngLat.lng , evt.lngLat.lat];
    return this.changeMode('simple_select' , {
      featureIds : [state.polygon.id]
    });
  },
  onDrag (state , evt) {
    const firstPoint = state.polygon.properties.point;
    if (firstPoint.length > 0) {
      const rectFeatures = featureCollection([point(firstPoint) , point([evt.lngLat.lng , evt.lngLat.lat])]);
      const feature = envelope(rectFeatures);
      state.polygon.incomingCoords(feature.geometry.coordinates);
    }
  },
  onStop (state: any) {
    // 触发draw.create事件
    this.map.fire('draw.create' , {
      features : [state.polygon.toGeoJSON()]
    });
  },
  toDisplayFeatures (state: any , geojson: any , display: any) {
    if (geojson.properties) {
      const isActive = state.polygon.id === geojson.properties?.id;
      geojson.properties.active = isActive ? constants.activeStates.ACTIVE : constants.activeStates.INACTIVE;
      if (geojson.properties.active === 'false') {
        return display(geojson);
      };
      // 渲染当前绘制的形状
      if (geojson.properties.active === 'true' && geojson.properties.user_point.length > 0) {
        return display(geojson);
      }
    }
  }
};
export default RectMode;