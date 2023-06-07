/**
 * @author : andy
 * @description : 动态点
 */
import { Map } from "mapbox-gl";
const activeCircle = (map: Map) => {
  const size = 160;
  const icon: any = {
    name : 'active-circle',
    width : size,
    height : size,
    data : new Uint8Array(size * size * 4),
    onAdd () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      // @ts-ignore
      this.context = canvas.getContext('2d' , {willReadFrequently : true});
    },
    render () {
      const duration = 1000;
      const t = (performance.now() % duration) / duration;
      const radius = (size / 2) * 0.3;
      const outerRadius = (size / 2) * 0.5 * t + radius;
      // @ts-ignore
      const context = this.context;
      context.clearRect(0, 0, this.width, this.height);
      context.beginPath();
      context.arc(
        this.width / 2,
        this.height / 2,
        outerRadius,
        0,
        Math.PI * 2
      );
      context.fillStyle = "rgba(255, 200, 200," + (1 - t) + ")";
      context.fill();
  
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(255, 100, 100, 1)";
      context.strokeStyle = "white";
      context.lineWidth = 2 + 4 * (1 - t);
      context.fill();
      context.stroke();
      this.data = context.getImageData(0, 0, this.width, this.height).data;
      map?.triggerRepaint();
      return true;
    }
  };
  return icon;
}
export default activeCircle;
