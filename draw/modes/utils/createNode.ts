/**
 * @author : andy
 * @description : 创建dom标签，用于测距功能
 */
export function createRangingText (value: string) {
  const el = document.createElement("span");
  el.style.border = '1px solid #7a7a7a';
  el.style.fontSize = '12px';
  el.style.color = '#333';
  el.style.backgroundColor = '#fff';
  el.style.borderRadius = '4px';
  el.style.padding = '0 4px';
  el.style.lineHeight = '17px';
  el.innerHTML = value;
  return el;
};
export function createRangingPoint () {
  const el = document.createElement("span");
  el.style.width = '8px';
  el.style.height = '8px';
  el.style.borderRadius = '50%';
  el.style.borderColor = '#f00';
  el.style.borderWidth = '2px';
  el.style.borderStyle = 'solid';
  el.style.backgroundColor='#fff';
  return el;
};
export function createRangingDeletePoint () {
  const el = document.createElement("span");
  el.style.height = '17px';
  el.style.fontSize = '12px';
  el.style.borderRadius = '4px';
  el.style.transform = 'rotate(45deg)';
  el.style.color = '#f60';
  el.style.border = '1px solid #f60';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.padding = '0 4px';
  el.style.backgroundColor = '#fff';
  el.style.cursor = 'pointer';
  el.innerHTML = '删除';
  return el;
}