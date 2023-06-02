/**
 * @author : andy
 * @description : 动态圆圈图标
 */
export interface ActiveCircleOptions {
  size?: number;
  color?: string;
}
/**
 * 动态圆圈图标
 * @param options 选项
 */
export default function activeCircle (options: ActiveCircleOptions) {
  const { size , color } = options;
  return {
    width : size as number,
    height : size as number,
    data : new Uint8Array((size as number) * (size as number) * 4),
    onAdd () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      // @ts-ignore
      this.context = canvas.getContext('2d');
    },
    render () {
      
    }
  }
};