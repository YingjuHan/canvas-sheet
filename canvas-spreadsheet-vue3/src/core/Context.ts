import { ROW_INDEX_WIDTH } from "./constants";
import DataGrid from "./DataGrid";
class Context {
  grid: any;
  x: number;
  y: number;
  width: number;
  height: number;
  fixed: string;
  constructor(
    grid: any,
    x: number,
    y: number,
    width: number = 0,
    height: number = 0,
    fixed: string = "",
  ) {
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fixed = fixed;
  }
  isHorizontalVisibleOnBody() {
    return !(
      this.x + this.width - this.grid.fixedLeftWidth + this.grid.scrollX <= 0 ||
      this.x + this.grid.scrollX >= this.grid.width - this.grid.fixedRightWidth
    );
  }
  isVerticalVisibleOnBody() {
    return !(
      this.y + this.height - this.grid.tableHeaderHeight + this.grid.scrollY <=
        0 ||
      this.y + this.grid.scrollY >=
        this.grid.height - this.grid.horizontalScrollerSize
    );
  }
  // 鼠标坐标是否在body内
  isInsideHorizontalBodyBoundary(mouseX: number, mouseY: number) {
    return (
      mouseX > this.x + this.grid?.scrollX &&
      mouseX < this.x + this.grid?.scrollX + this.width &&
      mouseX > this.grid?.fixedLeftWidth && // 避免冻结列点击穿透了
      mouseX < this.grid?.width - this.grid?.fixedRightWidth
    ); // 避免冻结列点击穿透了
  }
  isInsideHorizontalTableBoundary(mouseX: number, mouseY: number) {
    return (
      mouseX > this.x + this.grid.scrollX &&
      mouseX < this.x + this.grid.scrollX + this.width &&
      mouseX > this.grid.fixedLeftWidth
    );
  }
  isInsideFixedHorizontalBodyBoundary(mouseX: number, mouseY: number) {
    const x =
      this.grid.width -
      (this.grid.tableWidth - this.x - this.width) -
      this.width -
      this.grid.verticalScrollerSize;
    return (
      (mouseX >= x && mouseX < x + this.width && this.fixed === "right") ||
      (mouseX > this.x && mouseX < this.x + this.width && this.fixed === "left")
    );
  }
  // 鼠标纵坐标在视窗body区域内(不包括横坐标滚动条)
  isInsideVerticaBodyBoundary(mouseX: number, mouseY: number) {
    return (
      mouseY > this.y + this.grid.scrollY &&
      mouseY < this.y + this.height + this.grid.scrollY &&
      mouseY > this.grid.tableHeaderHeight &&
      mouseY < this.grid.height - this.grid.horizontalScrollerSize
    );
  }
  // 鼠标纵坐标在视窗body区域内
  isInsideVerticaTableBoundary(mouseX: number, mouseY: number) {
    return (
      mouseY > this.y + this.grid.scrollY &&
      mouseY < this.y + this.height + this.grid.scrollY &&
      mouseY > this.grid.tableHeaderHeight
    );
  }
  // 鼠标坐标是否在单元格后缀图标区域内
  isInsideAffixIcon(mouseX: number, mouseY: number) {
    return (
      mouseX > this.x + this.width + this.grid.scrollX - 25 &&
      mouseX < this.x + this.width + this.grid.scrollX &&
      mouseY > this.y + this.grid.scrollY + 10 &&
      mouseY < this.y + this.height + this.grid.scrollY - 10
    );
  }
  // 鼠标坐标是否在表头范围内
  isInsideHeader(mouseX: number, mouseY: number) {
    return mouseY > this.y && mouseY < this.y + this.grid.tableHeaderHeight;
  }
  // 鼠标坐标是否在checkbox部分内
  isInsideCheckboxBoundary(mouseX: number, mouseY: number) {
    return (
      mouseX > this.x + ROW_INDEX_WIDTH &&
      mouseX < this.x + this.grid.originFixedWidth
    );
  }
  // 鼠标坐标位于勾选框区域内
  isInsideHeaderCheckboxBoundary(mouseX: number, mouseY: number) {
    return (
      this.isInsideHeader(mouseX, mouseY) &&
      this.isInsideCheckboxBoundary(mouseX, mouseY)
    );
  }
  // 鼠标坐标位于索引框区域内
  isInsideIndexBoundary(mouseX: number, mouseY: number) {
    return mouseX > this.x && mouseX < this.x + ROW_INDEX_WIDTH;
  }
}

export default Context;
