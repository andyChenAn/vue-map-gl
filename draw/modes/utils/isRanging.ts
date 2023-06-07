import { DrawFeature } from "@mapbox/mapbox-gl-draw";

/**
 * @author : andy
 * @description : 判断当前的feature是否为测距
 */
const isRanging = (features: DrawFeature[]) => {
  let flag = false;
  features.map(feature => {
    if (feature.properties?.ranging) {
      flag = true;
    }
  })
  return flag;
};
export default isRanging;