/**
 * @author : andy
 * @description : 绘制feature的顶点
 */
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import equals from '../../../utils/equals';
/**
 * 绘制圆形的顶点
 * @param geojson feature数据
 */
export function createCircleVertex (geojson: any) {
  const { properties , geometry } = geojson;
  const points: any[] = [];
  if (properties) {
    if (!properties.user_isCircle) {
      return [];
    };
    const vertexs = (geometry as any).coordinates[0].slice(0);
    for (let i = 0 ; i < vertexs.length ; i += Math.floor(vertexs.length / 4)) {
      points.push(MapboxDraw.lib.createVertex(properties.id , vertexs[i] , `0.${i}` , false));
    }
  }
  return points.slice(0 , -1);
};

/**
 * 绘制矩形的顶点
 * @param geojson feature数据
 */
export function createRectVertex (geojson: any) {
  const { geometry , properties } = geojson;
  const points = [];
  // @ts-ignore
  const vertexs = geometry.coordinates[0].slice();
  for (let i = 0 ; i < vertexs.length ; i++) {
    if (equals(properties?.user_point , vertexs[i]) || equals(properties?.user_endPoint , vertexs[i])) {
      points.push(MapboxDraw.lib.createVertex(properties?.id , vertexs[i] , `0.${i}` , false));
    }
  };
  return points.slice(0 , 2);
}