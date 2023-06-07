/**
 * @author : andy
 * @description : 绘制箭头
 */
import { rhumbBearing , rhumbDestination } from '@turf/turf';
const createArrow = (feature: any , evt: any) => {
  // 获取起点和终点坐标
  const end = [evt.lngLat.lng , evt.lngLat.lat];
  const start = feature.properties.start;
  // 计算起点和终点的夹角
  const angle = rhumbBearing(end , start);
  // 计算箭头坐标
  const arrowStart = rhumbDestination(end , 0.02 , angle + 30 , {units : 'miles'});
  const arrowEnd = rhumbDestination(end , 0.02 , angle - 30 , {units : 'miles'});
  feature.incomingCoords([[start , end] , [arrowStart.geometry.coordinates , end , arrowEnd.geometry.coordinates]]);
};
export default createArrow;