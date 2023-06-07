import { DrawCustomMode , constants } from "@mapbox/mapbox-gl-draw";
import { disable , enable } from "../dragPan";
import createArrow from "./utils/createArrow";
/**
 * @author : andy
 * @description : 画箭头
 */

const ArrowMode: DrawCustomMode = {
  onSetup (options) {
    const arrow = this.newFeature({
      type : constants.geojsonTypes.FEATURE,
      properties : {
        isArrow : true,
        start : [],
        end : [],
      },
      geometry : {
        type : constants.geojsonTypes.MULTI_LINE_STRING,
        coordinates : [[]]
      }
    });
    this.clearSelectedFeatures();
    disable(this);
    this.addFeature(arrow);
    this.updateUIClasses({
      mouse : constants.cursors.ADD
    });
    this.setActionableState({
      trash: true,
      combineFeatures: false,
      uncombineFeatures: false
    });
    return {
      arrow
    }
  },
  onMouseDown (state: any , evt: any) {
    state.arrow.properties.start = [evt.lngLat.lng , evt.lngLat.lat];
  },
  onDrag (state: any , evt: any) {
    const endPoint = [evt.lngLat.lng , evt.lngLat.lat];
    state.arrow.properties.end = endPoint;
    state.arrow.incomingCoords([[state.arrow.properties.start , endPoint]]);
  },
  onMouseUp (state: any , evt: any) {
    enable(this);
    const end = [evt.lngLat.lng , evt.lngLat.lat];
    state.arrow.properties.end = end;
    // 绘制箭头
    createArrow(state.arrow , evt);
    return this.changeMode('simple_select' , {
      featureIds : [state.arrow.id]
    });
  },
  onStop (state: any) {
    // 触发draw.create事件
    this.map.fire('draw.create' , {
      features : [state.arrow.toGeoJSON()]
    });
  },
  toDisplayFeatures (state: any , geojson: any , display: any) {
    display(geojson)
  }
};
export default ArrowMode;