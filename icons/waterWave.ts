/**
 * @author : andy
 * @description : 水波纹
 */
import { Map } from 'mapbox-gl';
const waterWave = (map: Map) => {
  const size = 100;
  const icon: any = {
    name : 'water-wave',
    width : size,
    height : size,
    data : new Uint8Array(size * size * 4),
    onAdd () {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d" , {willReadFrequently : true});
      this.size = size;
      this.radius1 = 0;
      this.radius2 = -16.7;
      this.radius3 = -33.3;
    },
    render () {
      // @ts-ignore
      const context = this.context;
      if (this.radius1 > this.size / 2) {
        this.radius1 = 0;
      }
      if (this.radius2 > this.size / 2) {
        this.radius2 = 0;
      }
      if (this.radius3 > this.size / 2) {
        this.radius3 = 0;
      }
      this.radius1 += 0.5;
      this.radius2 += 0.5;
      this.radius3 += 0.5;
      context.clearRect(0, 0, this.width, this.height);
      context.beginPath();
      context.arc(
        this.width / 2,
        this.height / 2,
        this.radius1,
        0,
        Math.PI * 2
      );
      context.lineWidth = 3;
      context.strokeStyle =
        "rgba(255, 0, 0 , " + (1 - this.radius1 / (this.size / 2)) + ")";
      context.stroke();

      context.beginPath();
      context.arc(
        this.width / 2,
        this.height / 2,
        this.radius2 < 0 ? 0 : this.radius2,
        0,
        Math.PI * 2
      );
      context.lineWidth = 3;
      context.strokeStyle =
        "rgba(255, 0, 0 , " + (1 - this.radius2 / (this.size / 2)) + ")";
      context.stroke();

      context.beginPath();
      context.arc(
        this.width / 2,
        this.height / 2,
        this.radius3 < 0 ? 0 : this.radius3,
        0,
        Math.PI * 2
      );
      context.lineWidth = 3;
      context.strokeStyle =
        "rgba(255, 0, 0 , " + (1 - this.radius3 / (this.size / 2)) + ")";
      context.stroke();
      this.data = context.getImageData(0, 0, this.width, this.height).data;
      map?.triggerRepaint();
      return true;
    }
  }
  return icon;
};
export default waterWave;