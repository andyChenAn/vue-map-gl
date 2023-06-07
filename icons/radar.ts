/**
 * @author : andy
 * @description : 雷达
 */
import { Map } from "mapbox-gl";
const radar = (map: Map) => {
  const size = 200;
  const drawSector = function (ctx: any , sAngle: any, eAngle: any , centerX: any , centerY: any) {
    let radius = centerX * 1
    let blob = 50;
    let increase = 0;

    if (sAngle < eAngle) {
      increase = (eAngle - sAngle) / blob;
    } else if (sAngle > eAngle) {
      increase = (Math.PI * 2 - sAngle + eAngle) / blob;
    } else {
      return;
    }

    let angle1 = sAngle;
    let angle2 = sAngle + increase;
    for (let i = 0; i < blob; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle1, angle2);
      ctx.fillStyle = "rgba(255,0,0," + i / blob + ")";
      ctx.fill();
      angle1 = angle2;
      angle2 = angle1 + increase;
      if (angle2 >= Math.PI * 2) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle1, Math.PI * 2);
        ctx.fillStyle = "rgba(255,0,0," + i / blob + ")";
        ctx.fill();
        angle1 = 0;
        angle2 = angle1 + increase;
      }
    }
  };
  const icon: any = {
    name : 'radar',
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),
    onAdd() {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d" , {willReadFrequently : true});
      this.angle = Math.PI;
      this.scanBegin = 0;
      this.scanEnd = this.angle;
    },
    render() {
      let context = this.context;
      context.clearRect(0, 0, this.width, this.height);
      drawSector(context , this.scanBegin , this.scanEnd , this.width / 2 , this.height / 2);
      this.scanBegin += this.angle/20;
      this.scanEnd = this.scanBegin + this.angle;
      if (this.scanBegin >= Math.PI * 2) {
        this.scanBegin = 0;
        this.scanEnd = this.scanBegin + this.angle;
      }
      this.data = context.getImageData(0, 0, this.width, this.height).data;
      map.triggerRepaint();
      return true;
    },
  }
  return icon;
}
export default radar;