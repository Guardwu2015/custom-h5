<template>
  <div class="home">
    <header class='header'>
        <el-button @click="undo">撤消</el-button>
        <el-button @click="redo">重做</el-button>
        <label for="input" class="insert">插入图片</label>
        <input type="file" @change="handleFileChange" id="input" hidden />
        <el-button @click="preview" style="margin-left: 10px;">预览</el-button>
        <el-button @click="save">保存</el-button>
        <el-button @click="clearCanvas">清空画布</el-button>
        <div class="canvas-config">
            <span>画布大小</span>
            <input v-model="canvasStyleData.width">
            <span>*</span>
            <input v-model="canvasStyleData.height">
        </div>
    </header>
    <main>
      <!-- 左侧组件列表 -->
      <section class="left">
        <component-list />
      </section>
      <!-- 中间画布 -->
      <section class="center">
        <div
          class='content'
          @drop="handleDrop"
          @dragover="handleDragOver"
          @click="deselectCurComponent"
        >
          <editor />
        </div>
      </section>
      <!-- 右侧属性列表 -->
      <section class="right">
        <el-tabs v-model="activeName">
          <el-tab-pane label="属性" name="attr">
              <attr-list v-if="curComponent" />
              <p v-else class="placeholder">请选择组件</p>
          </el-tab-pane>
          <el-tab-pane label="动画" name="animation">
              <div v-if="curComponent" class="div-animation">
                  <el-button @click="isShowAnimation = true">添加动画</el-button>
                  <el-button @click="previewAnimate">预览动画</el-button>
                  <div>
                      <el-tag
                          v-for="(tag, index) in curComponent.animations"
                          :key="index"
                          closable
                          @close="removeAnimation(index)"
                      >
                          {{ tag.label }}
                      </el-tag>
                  </div>
              </div>
              <p v-else class="placeholder">请选择组件</p>
          </el-tab-pane>
          <el-tab-pane label="事件" name="events">
              <div v-if="curComponent" class="div-events">
                  <el-button @click="isShowEvent = true">添加事件</el-button>
                  <div>
                      <el-tag
                          v-for="event in Object.keys(curComponent.events)"
                          :key="event"
                          closable
                          @close="removeEvent(event)"
                      >
                        {{ event }}
                      </el-tag>
                  </div>
              </div>
              <p v-else class="placeholder">请选择组件</p>
          </el-tab-pane>
        </el-tabs>
      </section>
    </main>

    <!-- 预览 -->
    <preview v-model="isPreViewShow" @change="handlePreviewChange" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ComponentList from '@/components/ComponentList' // 左侧列表组件
import AttrList from '@/components/AttrList' // 右侧属性列表
import Editor from '@/components/editor'
import Preview from '@/components/editor/Preview'
import componentListData from '@/custom-component/component-list'
import { deepCopy } from '@/utils/utils'
import generateID from '@/utils/generateID'

export default {
  name: 'home',
  components: {
    ComponentList,
    Editor,
    Preview,
    AttrList,
  },
  data () {
    return {
      activeName: 'attr',
      isPreViewShow: false
    }
  },
  computed: mapState([
    'componentData',
    'curComponent',
    'canvasStyleData',
  ]),
  methods: {
    undo() {
    },
    redo() {
    },
    handleFileChange() {
    },
    handleDrop(e) {
      e.preventDefault()
      e.stopPropagation()

      const component = deepCopy(componentListData[e.dataTransfer.getData('index')])
      component.style.top = e.offsetY
      component.style.left = e.offsetX
      component.id = generateID()
      this.$store.commit('addComponent', component)
      this.$store.commit('recordSnapshot')
    },
    handleDragOver(e) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
    },
    deselectCurComponent() {
        this.$store.commit('setCurComponent', { component: null, zIndex: null })
        this.$store.commit('hideContexeMenu')
    },
    preview() {
      this.isPreViewShow = true
      this.$store.commit('setEditMode', 'read')
    },
    handlePreviewChange() {
    },
    previewAnimate() {
        eventBus.$emit('runAnimation')
    },
    save() {
      // TODO localstorage可以做一些优化
      localStorage.setItem('canvasData', JSON.stringify(this.componentData))
      localStorage.setItem('canvasStyle', JSON.stringify(this.canvasStyleData))
      this.$message.success('保存成功')
    },
    clearCanvas() {
      this.$store.commit('setComponentData', [])
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  height: 100vh;
  background: #fff;
}

.header {
  height: 64px;
  line-height: 64px;
  background: #fff;
  border-bottom: 1px solid #ddd;
}

main {
  position: relative;
  height: calc(100% - 64px);

  .left {
      position: absolute;
      height: 100%;
      width: 200px;
      left: 0;
      top: 0;
      padding-top: 10px;
  }

  .right {
      position: absolute;
      height: 100%;
      width: 262px;
      right: 0;
      top: 0;
  }

  .center {
      margin-left: 200px;
      margin-right: 262px;
      background: #f5f5f5;
      height: 100%;
      overflow: auto;
      padding: 20px;

      .content {
          height: 100%;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
      }
  }
}

.placeholder {
    text-align: center;
    color: #333;
}

.el-scrollbar__view {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding-left: 14px;

    .animate > div {
        width: 100px;
        height: 60px;
        background: #f5f8fb;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 12px;
        margin-bottom: 10px;
        font-size: 12px;
        color: #333;
        border-radius: 3px;
        user-select: none;
        cursor: pointer;
    }
}

.el-tag {
    display: block;
    width: 50%;
    margin: auto;
    margin-bottom: 10px;
}

.div-animation {
    text-align: center;

    & > div {
        margin-top: 20px;
    }
}

.insert {
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    background: #FFF;
    border: 1px solid #DCDFE6;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: 0;
    margin: 0;
    transition: .1s;
    font-weight: 500;
    padding: 9px 15px;
    font-size: 12px;
    border-radius: 3px;
    margin-left: 10px;

    &:active {
        color: #3a8ee6;
        border-color: #3a8ee6;
        outline: 0;
    }

    &:hover {
        background-color: #ecf5ff;
        color: #3a8ee6;
    }
}

.canvas-config {
    display: inline-block;
    margin-left: 10px;
    font-size: 14px;
    color: #606266;

    input {
        width: 50px;
        margin-left: 10px;
        outline: none;
        padding: 0 5px;
        border: 1px solid #ddd;
        color: #606266;
    }

    span {
        margin-left: 10px;
    }
}

.div-events {
    text-align: center;
    padding: 0 20px;
    
    .el-button {
        display: inline-block;
        margin-bottom: 10px;
    }
}
</style>
