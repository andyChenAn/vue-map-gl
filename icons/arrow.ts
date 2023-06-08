import { Map } from "mapbox-gl";

/**
 * @author : andy
 * @description : 箭头
 */
const arrow = (map: Map) => {
  const size = 24;
  const icon: any = {
    name : 'arrow',
    width : size,
    height : size,
    data : new Uint8Array(size * size * 4),
    onAdd () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d" , { willReadFrequently : true })
    },
    render () {
      const context = this.context;
      context.clearRect(0 , 0, this.width , this.height);
      context.beginPath();
      context.moveTo(0,0);
      context.lineTo(this.width / 2 , this.height / 2);
      context.lineTo(0 , this.height);
      context.lineWidth = 4;
      context.strokeStyle = "#fff";
      context.stroke();
      context.closePath();
      this.data = context.getImageData(0,0,this.width,this.height).data;
      map.triggerRepaint();
      return true;
    }
  };
  return icon;
}
export default arrow;