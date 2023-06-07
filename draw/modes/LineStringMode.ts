import MapboxDraw , {  modes , constants , lib } from "@mapbox/mapbox-gl-draw";
import { Marker } from 'mapbox-gl';
import { distance } from '@turf/turf';
import { createRangingPoint , createRangingText , createRangingDeletePoint } from './utils/createNode';
const LineStringMode: any = {
  ...modes.draw_line_string,
  onSetup (opts: any) {
    opts = opts || {};
    const featureId = opts.featureId;
    let line, currentVertexPosition;
    let direction = 'forward';
    if (featureId) {
      line = this.getFeature(featureId);
      if (!line) {
        throw new Error('Could not find a feature with the provided featureId');
      }
      let from = opts.from;
      if (from && from.type === 'Feature' && from.geometry && from.geometry.type === 'Point') {
        from = from.geometry;
      }
      if (from && from.type === 'Point' && from.coordinates && from.coordinates.length === 2) {
        from = from.coordinates;
      }
      if (!from || !Array.isArray(from)) {
        throw new Error('Please use the `from` property to indicate which point to continue the line from');
      }
      const lastCoord = line.coordinates.length - 1;
      if (line.coordinates[lastCoord][0] === from[0] && line.coordinates[lastCoord][1] === from[1]) {
        currentVertexPosition = lastCoord + 1;
        line.addCoordinate(currentVertexPosition, ...line.coordinates[lastCoord]);
      } else if (line.coordinates[0][0] === from[0] && line.coordinates[0][1] === from[1]) {
        direction = 'backwards';
        currentVertexPosition = 0;
        line.addCoordinate(currentVertexPosition, ...line.coordinates[0]);
      } else {
        throw new Error('`from` should match the point at either the start or the end of the provided LineString');
      }
    } else {
      line = this.newFeature({
        type: constants.geojsonTypes.FEATURE,
        properties: {
          ...opts,
          markerList : [],
          dist : 0
        },
        geometry: {
          type: constants.geojsonTypes.LINE_STRING,
          coordinates: []
        }
      });
      currentVertexPosition = 0;
      this.addFeature(line);
    }

    this.clearSelectedFeatures();
    lib.doubleClickZoom.disable(this);
    this.updateUIClasses({ mouse: constants.cursors.ADD });
    this.activateUIButton(constants.types.LINE);
    this.setActionableState({
      trash: true
    });

    return {
      line,
      currentVertexPosition,
      direction,
      ranging : opts.ranging,
      markerList : [],
      dist : 0
    };
  },
  onClick (state: any , e: any) {
    if (MapboxDraw.lib.CommonSelectors.isVertex(e)) return this.clickOnVertex(state, e);
    this.clickAnywhere(state, e);
    if (state.ranging) {
      const markerList = state.markerList;
      // 测距
      const elPoint = createRangingPoint();
      const pointMarker = new Marker(elPoint).setLngLat([e.lngLat.lng , e.lngLat.lat]).addTo(this.map);
      markerList.push(pointMarker);
      const coordinates = state.line.coordinates.slice(0 , -1);
      if (coordinates.length > 1) {
        const diff = distance(coordinates[coordinates.length - 2] , [e.lngLat.lng , e.lngLat.lat] as any);
        state.dist += diff;
        state.dist = Number(state.dist.toFixed(2));
        const el = createRangingText(state.dist < 1 ? ((state.dist * 1000) + '米') : (state.dist + '千米'));
        const marker = new Marker(el , {offset : [20 , 20]}).setLngLat([e.lngLat.lng , e.lngLat.lat]).addTo(this.map);
        markerList.push(marker);
      } else {
        const el = createRangingText('起点');
        const marker = new Marker(el , {offset : [20 , 20]}).setLngLat([e.lngLat.lng , e.lngLat.lat]).addTo(this.map);
        markerList.push(marker);
      }
    }
  },
  handleDeleteDraw (state: any , el: HTMLElement) {
    this.deleteFeature([state.line.id] , {silent : true});
    state.markerList.map((marker: any) => {
      marker.remove();
    });
    el.removeEventListener('click' , this.handleDeleteDraw);
    el.parentNode?.removeChild(el);
  },
  onStop (state: any) {
    lib.doubleClickZoom.enable(this);
    this.activateUIButton();

    if (this.getFeature(state.line.id) === undefined) return;

    state.line.removeCoordinate(`${state.currentVertexPosition}`);
    if (state.line.isValid()) {
      this.map.fire(constants.events.CREATE, {
        features: [state.line.toGeoJSON()]
      });
    } else {
      this.deleteFeature([state.line.id], { silent: true });
      this.changeMode(constants.modes.SIMPLE_SELECT, {}, { silent: true });
    }
    // 绘制终点
    if (state.ranging) {
      const dist = state.dist;
      const el = createRangingText(dist < 1 ? ('总长：' + (dist * 1000) + '米') : '总长：' + (dist + '千米'));
      const coordinates = state.line.coordinates[state.line.coordinates.length - 1];
      const marker = new Marker(el , {offset : [20 , 20]}).setLngLat(coordinates).addTo(this.map);
      state.markerList.push(marker);
      const deleteEl = createRangingDeletePoint();
      this.handleDeleteDraw = this.handleDeleteDraw.bind(this , state , deleteEl)
      deleteEl.addEventListener('click' , this.handleDeleteDraw);
      new Marker(deleteEl , {offset : [-26 , 0]}).setLngLat(coordinates).addTo(this.map);
    }
  }
}
export default LineStringMode;