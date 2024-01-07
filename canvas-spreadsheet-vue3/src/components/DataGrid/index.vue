<template>
  <div :class="CSS_PREFIX" v-clickoutside="handleclickoutside" @paste="doPaste">
    <div :class="`${CSS_PREFIX}-main`">
      <canvas :id="`${CSS_PREFIX}-target`" :class="`${CSS_PREFIX}-table`">
      </canvas>
      <div
        :class="`${CSS_PREFIX}-overlayer`"
        :style="{ top: `${tableHeaderHeight + 1}px` }"
      >
        <div :class="`${CSS_PREFIX}-editor`" ref="editor" :style="editorSty">
          <div
            ref="text"
            contenteditable="true"
            v-show="isSimple"
            @input="inputHandler"
            @keydown.tab.prevent
            @keydown.enter="handleEnter"
            @keydown.esc.prevent
          ></div>
          <el-date-picker
            ref="month"
            v-if="dataType === 'month'"
            :class="`${CSS_PREFIX}-popup`"
            :style="popupSty"
            v-model="value"
            :editable="false"
            type="month"
            size="small"
            placeholder="选择月份"
            format="yyyy-MM"
            value-format="yyyy-MM"
            @change="selectChange"
          >
          </el-date-picker>
          <el-date-picker
            ref="date"
            v-else-if="dataType === 'date'"
            :class="`${CSS_PREFIX}-popup`"
            :style="popupSty"
            v-model="value"
            :editable="false"
            type="date"
            size="small"
            placeholder="选择日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            @change="selectChange"
          >
          </el-date-picker>
          <el-date-picker
            ref="datetime"
            v-else-if="dataType === 'datetime'"
            :class="`${CSS_PREFIX}-popup`"
            :style="popupSty"
            v-model="value"
            :editable="false"
            type="datetime"
            size="small"
            placeholder="选择日期时间"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            @change="selectChange"
          >
          </el-date-picker>
          <el-select
            ref="select"
            v-else-if="dataType === 'select'"
            :class="`${CSS_PREFIX}-popup`"
            :style="popupSty"
            v-model="value"
            clearable
            filterable
            size="small"
            :automatic-dropdown="true"
            @change="selectChange"
          >
            <el-option
              v-for="item in selectOptions"
              :value="item.value"
              :label="item.label"
              :key="item.value"
            ></el-option>
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  ref,
  computed,
  nextTick,
  watch,
  onUnmounted,
  getCurrentInstance,
  ComponentInternalInstance,
} from "vue";
import {
  CSS_PREFIX as cssPrefix,
  HEADER_HEIGHT,
} from "../../core/constants.js";
import { getMaxRow } from "../../core/util.js";
import DataGrid from "../../core/DataGrid";
import { Clickoutside as vClickoutside } from "./clickoutside";
import { onMounted, toRaw } from 'vue';
const SIMPLE_DATE_TYPES = ["text", "number", "phone", "email"];
const COMPLEX_DATE_TYPES = ["month", "date", "datetime", "select"];
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const props = defineProps({
  rowKey: {
    type: String,
    default: "id",
  },
  fixedLeft: {
    type: Number,
    default: 0,
  },
  fixedRight: {
    type: Number,
    default: 0,
  },
  width: Number,
  height: Number,
  columns: {
    type: Array,
    default() {
      return [];
    },
  },
  data: {
    type: Array,
    default() {
      return [];
    },
  },
});

const emit = defineEmits([
  "after-edit-cell",
  "after-autofill",
  "after-paste",
  "after-clear",
  "on-load",
]);

const CSS_PREFIX = ref(cssPrefix);
const loading = ref(false);
const show = ref(false);
const dataType = ref("text");
const popWidth = ref("auto");
const isEditing = ref(false);
const isPaste = ref(false);
const value = ref("");
const editorSty = ref({ borderColor: "rgb(82,146,247)" });
const focusCell = ref();
const selectOptions = ref<Array<{ value: any; label: any }>>([]);

const editor = ref();
const text = ref();
const month = ref();
const date = ref();
const datetime = ref();
const select = ref();
const grid = ref();
watch(props.columns, (newValue: Array<any>) => {
  grid.value.loadColumns(newValue);
  grid.value.loadData(toRaw(props.data));
});
watch(props.data, (newValue: Array<any>) => {
  grid.value.loadColumns(props.columns);
  grid.value.loadData(newValue);
  loading.value = false;
});
const tableHeaderHeight = computed(() => {
  const maxHeaderRow = getMaxRow(props.columns);
  return HEADER_HEIGHT * maxHeaderRow;
});

const popupSty = computed(() => {
  return {
    width: popWidth.value,
    top: "-1px",
  };
});

const isSimple = computed(() => {
  return SIMPLE_DATE_TYPES.includes(dataType.value);
});

function handleEnter(e: KeyboardEvent) {
  // CTRL+ENTER换行
  if (e.metaKey || e.ctrlKey) {
    const createEl = (mark: any) => {
      return document.createElement(mark);
    };
    const el = (proxy as any).$refs.text;

    const selection = window.getSelection() as Selection;
    const range = selection.getRangeAt(0);
    const anchorNode = selection.anchorNode as Node;
    const anchorParentNode = anchorNode.parentNode;
    //获取当前光标位置
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    let find = false;
    let beforeNodes: Array<any> = [];
    let afterNodes: Array<any> = [];
    let insertNode = createEl("div");
    el.childNodes.forEach((node: any) => {
      // 文本节点
      if (node.nodeType === 3) {
        const startStr = node.textContent.slice(0, startOffset);
        const endStr = node.textContent.slice(endOffset);
        let befforeElBox = createEl("div");
        if (!startStr) {
          befforeElBox.appendChild(createEl("br"));
        } else {
          befforeElBox.appendChild(document.createTextNode(startStr));
        }
        beforeNodes.push(befforeElBox);
        if (!endStr) {
          insertNode.appendChild(createEl("br"));
        } else {
          insertNode.appendChild(document.createTextNode(endStr));
        }
      } else {
        if (!find) {
          if (node === anchorParentNode) {
            const startStr = node.textContent.slice(0, startOffset);
            const endStr = node.textContent.slice(endOffset);
            let befforeElBox = createEl("div");
            if (!startStr) {
              befforeElBox.appendChild(createEl("br"));
            } else {
              befforeElBox.appendChild(document.createTextNode(startStr));
            }
            beforeNodes.push(befforeElBox);
            if (!endStr) {
              insertNode.appendChild(document.createElement("br"));
            } else {
              insertNode.appendChild(document.createTextNode(endStr));
            }
            find = true;
          } else {
            beforeNodes.push(node);
          }
        } else {
          afterNodes.push(node);
        }
      }
    });
    el.innerHTML = "";
    beforeNodes.forEach((item) => {
      el.appendChild(item);
    });
    el.appendChild(insertNode);
    afterNodes.forEach((item) => {
      el.appendChild(item);
    });
    const newRange = document.createRange();
    // 光标对象的范围界定为新建的节点
    // newRange.selectNodeContents(insertNode)
    newRange.setStartBefore(insertNode);
    // newRange.setEndAfter(insertNode)
    // 使光标开始和光标结束重叠
    newRange.collapse(true);
    selection.removeAllRanges();
    // 插入新的光标对象
    selection.addRange(newRange);

    grid.value.setTempData(el.innerText); // 手动换行不会触发input事件，需要手动处理
    return;
  }
  e.preventDefault();
}
function reload() {
  return grid.value.resize();
}
function getData() {
  return grid.value.getData();
}
function getCheckedRows() {
  return grid.value.getCheckedRows();
}
function getChangedRows() {
  return grid.value.getChangedRows();
}
function validate(callback: any) {
  return grid.value.validate(callback);
}
function validateChanged(callback: any) {
  return grid.value.validateChanged(callback);
}
function validateField(ci: any, ri: any) {
  return grid.value.validateField(ci, ri);
}
function getValidations() {
  return grid.value.getValidations();
}
function setValidations(errors: any) {
  return grid.value.setValidations(errors);
}
function clearValidations() {
  return grid.value.clearValidations();
}
function updateData(data: any) {
  return grid.value.updateData(data);
}
function setFullScreen() {
  grid.value.resize();
}
function editCell() {
  const {
    dataType: focusDataType,
    options: focusOptions,
    value: focusValue,
  } = toRaw(focusCell.value);
  console.log(focusCell.value);
  
  show.value = true;
  dataType.value = focusDataType;

  if (![...SIMPLE_DATE_TYPES, ...COMPLEX_DATE_TYPES].includes(focusDataType)) {
    dataType.value = "text";
  }
  selectOptions.value = focusOptions;
  text.value.innerHTML = focusValue;
  grid.value.setTempData(value);
  if (
    focusDataType === "month" ||
    focusDataType === "date" ||
    focusDataType === "datetime"
  ) {
    if (isNaN(focusValue) && !isNaN(Date.parse(focusValue))) {
      value.value = focusValue;
    } else {
      value.value = "";
    }
  } else {
    value.value = focusValue;
  }
  showEditor();
  nextTick(() => {
    focus();
  });
}
function selectCell(cell: any) {
  focusCell.value = cell;
  clearEditor();
  hideEditor();
  nextTick(() => {
    focus("text");
  });
}
function showEditor() {
  const { x, y, width, height } = focusCell.value;
  isEditing.value = true;
  editor.value.style.left = `${x - 1}px`;
  editor.value.style.top = `${y - 2 - tableHeaderHeight.value}px`;
  text.value.style["min-width"] = `${width - 1}px`;
  text.value.style["min-height"] = `${height - 1}px`;
  popWidth.value = `${width - 1}px`;
  // if (COMPLEX_DATE_TYPES.includes(dataType)) {
  //   // 下拉，日期控件高度比输入框高
  //   $refs.editor.style.height = "38px";
  // }
}
function hideEditor() {
  isEditing.value = false;
  editor.value.style.left = "-10000px";
  editor.value.style.top = "-10000px";
  show.value = false;
  dataType.value = "text";
}
function clearEditor() {
  text.value.innerHTML = "";
}
function focus(type?: string) {
  let _type = type || dataType.value;
  if (isSimple.value) {
    _type = "text";
  }
  const el = (proxy as any).$refs[_type];

  if (typeof el.focus === "function") {
    if (COMPLEX_DATE_TYPES.includes(_type)) {
      el.focus();
    } else {
      if (window.getSelection) {
        // ie11 10 9 ff safari
        el.focus(); // 解决ff不获取焦点无法定位问题
        if (!el.childNodes.length) return;
        const selection = window.getSelection() as Selection; // 创建selection
        // selection.selectAllChildren(el); // 清除选区并选择指定节点的所有子节点
        // selection.collapseToEnd(); // 光标移至最后

        const newRange = document.createRange();
        // 光标对象的范围界定为新建的节点
        // newRange.selectNodeContents(el)
        newRange.setStart(
          el.childNodes[el.childNodes.length - 1],
          el.innerText.length
        );
        // newRange.setEndAfter(insertNode)
        // 使光标开始和光标结束重叠
        newRange.collapse(true);
        selection.removeAllRanges();
        // 插入新的光标对象
        selection.addRange(newRange);
      } else if ((document as any).selection) {
        // ie10以下
        const range = (document as any).selection.createRange(); // 创建选择对象
        // var range = document.body.createTextRange();
        range.moveToElementText(el); // range定位到obj
        range.collapse(false); // 光标移至最后
        range.select();
      }
    }
  }
}
function doPaste() {
  // 粘贴事件标识
  isPaste.value = true;
}
function inputHandler(e: any) {
  /**
   * 复制粘贴的基本原理：直接监听可编辑元素（这里是contenteditable=true的div）的
   * input事件，按下CTRL+V会先触发paste事件，接着会触发input事件，在paste事件中
   * 定义一个标识，这样在input事件就可以区分内容是通过粘贴来的还是手动输入的
   */
  const val = e.target.innerText;

  if (!isPaste) {
    showEditor();
    grid.value.setTempData(val);
  } else if (!isEditing) {
    isPaste.value = false;

    let textArr = [];
    let arr = val.split("\r");
    if (arr.length === 1) {
      let _arr = arr[0].split("\n");
      textArr = _arr.map((item: string) => item.split("\t"));
    } else {
      textArr = arr.map((item: string) => item.split("\t"));
    }

    grid.value.pasteData(textArr);
    clearEditor();
  } else {
    isPaste.value = false;
    grid.value.setTempData(val);
  }
}
function selectChange(val: any) {
  grid.value.setTempData(val);
}
function handleclickoutside() {
  grid.value.doneEdit();
}

loading.value = props.data.values.length > 0 ? false : true;

onMounted(() => {
  let el = document.getElementById(`${CSS_PREFIX.value}-target`) as HTMLElement;

  grid.value = new DataGrid(el, {
    columns: props.columns,
    data: toRaw(props.data),
    fixedLeft: props.fixedLeft,
    fixedRight: props.fixedRight,
    rowKey: props.rowKey,
    width: props.width,
    height: props.height,

    beforeSelectCell: () => {},
    afterSelectCell: (cell: any) => {
      selectCell(cell);
    },
    beforeMultiSelectCell: () => {},
    afterMultiSelectCell: () => {},
    beforeEditCell: () => {
      editCell();
    },
    afterEditCell: (data: any) => {
      emit("after-edit-cell", data);
    },
    afterAutofill: (data: any) => {
      emit("after-autofill", data);
    },
    afterPaste: (data: any) => {
      emit("after-paste", data);
    },
    afterClear: (data: any) => {
      emit("after-clear", data);
    },
    onLoad: () => {
      // 推入事件队列中延迟执行
      setTimeout(() => {
        emit("on-load");
      }, 0);
    },
  });
});
onUnmounted(() => {
  grid.value.events.destroy();
});

defineExpose({
  setFullScreen,
  getData,
  updateData,
  getCheckedRows,
  getChangedRows,
  getValidations,
  setValidations,
  clearValidations,
});
</script>
<style lang="css" src="./index.css"></style>
