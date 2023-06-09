<!-- 
  @author : andy
  @description : 轨迹面板组件
 -->
<template>
  <Teleport to="body">
    <div class="track-panel">
      <div class="inner">
        <slot>
          <div class="slider-box">
            <div class="slider">
              <div ref="rail" class="slider-rail"></div>
              <div :style="{width : progress + '%'}" class="slider-track"></div>
              <div :style="{left : progress + '%'}" @mousedown="onMouseDown" class="slider-handle"></div>
            </div>
            <div class="slider-btn">
              <span @click="onPlay" class="btn">开始播放</span>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </Teleport>
</template>

<script lang='ts' setup>
import { onMounted, ref, watchEffect } from 'vue';
const props = defineProps({
  progress : {
    type : Number,
    default : 0
  },
});
const isDrag = ref(false);
const rail = ref();
let distance = 0;
let startX = 0;
let width = 0;
let left = 0;
const progress = ref(0);
watchEffect(() => {
  progress.value = props.progress;
  startX = left;
})
const emits = defineEmits(['click' , 'progress']);
onMounted(() => {
  const rect = rail.value.getBoundingClientRect();
  width = rect.width;
  left = rect.left;
});

const onMouseDown = (evt: any) => {
  startX = startX || evt.pageX;
  isDrag.value = true;
  window.addEventListener('mousemove' , onMouseMove);
  window.addEventListener('mouseup' , onMouseUp);
};
const onMouseMove = (evt: any) => {
  if (isDrag.value) {
    distance = evt.pageX - startX;
    progress.value = Math.floor((distance / width) * 100);
    if (progress.value >= 100) {
      progress.value = 100;
    } else if (progress.value <= 0) {
      progress.value = 0;
    } 
    emits('progress' , progress.value);
  };
};
const onMouseUp = (evt: any) => {
  isDrag.value = false;
};
const onPlay = () => {
  emits('click');
}
</script>

<style lang='less' scoped>
.track-panel {
  position: fixed;
  z-index: 100;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  .inner {
    width: 600px;
    background-color: rgba(0,0,0,0.6);
    min-height: 40px;
    border-radius: 4px;
    display: flex;
    .slider-box {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 0 16px;
      .slider {
        flex: 1;
        margin-right: 16px;
        position: relative;
        .slider-rail {
          position: absolute;
          width: 100%;
          height: 4px;
          background-color: #f5f5f5;
          border-radius: 2px;
        }
        .slider-track {
          position: absolute;
          width: 20%;
          height: 4px;
          background-color: #007aff;
          border-radius: 2px;
        }
        .slider-handle {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          transform: translateX(-50%);
          border: 2px solid #007aff;
          background-color: #fff;
          margin-top: 2px;
          cursor: pointer;
          left: 0%;
          margin-top: -7px;
        }
      }
      .slider-btn {
        .btn {
          font-size: 14px;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          background-color: #007aff;
          height: 28px;
          padding: 0 6px;
          border-radius: 4px;
          user-select: none;
        }
      }
    }
  }
}
</style>