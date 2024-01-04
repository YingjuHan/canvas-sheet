const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; //0 = A, 25 = Z

const iToA = (i: number) => {
  let current = i;

  let a = "";

  while (current > -1) {
    let digit = current % 26;
    a = alpha[digit] + "" + a;

    //This is not a straight number base conversion, we need to
    //treat A as
    current = Math.floor(current / 26) - 1;
  }

  return a;
};

const aToI = (a: string[]) => {
  let index = (alpha.indexOf(a[0]) + 1) * Math.pow(26, a.length - 1) - 1;

  for (let i = a.length - 1; i > 0; i--) {
    index += (alpha.indexOf(a[i]) + 1) * Math.pow(26, a.length - i - 1);
  }

  return index;
};

/*
 ** 获取叶子节点数组
 */
const toLeaf = (arr:Array<any> = []) => {
  let tmp: Array<any> = []
  arr.forEach(item => {
      if (item.children) {
          tmp = tmp.concat(toLeaf(item.children))
      } else {
          tmp.push(item)
      }
  })
  return tmp
}
/*
 ** 获取最大深度
 */
const getMaxRow = (config: any) => {
  if (config) {
      return config.map((item: any) => {
          return getMaxRow(item.children) + 1
      }).sort((a: number, b: number) => b - a)[0]
  } else {
      return 0
  }
}
/*
 ** 根据数据结结构层级关系计算复合表头的跨行、跨列数
 */
const calCrossSpan = (arr: Array<any> = [], maxRow: number, level = 0) => {
  if (maxRow === undefined) {
    maxRow = getMaxRow(arr)
  }

  if (arr) {
    return arr.map((config: any) => {
      if (config.children) {
        let colspan = 0
        const children = calCrossSpan(config.children, maxRow - 1, level + 1) as Array<any>;

        children.forEach((item: any) => {
          colspan += item.colspan
        })

        return {
          level,
          rowspan: 1,
          colspan,
          ...config,
          children
        }
      } else {
        return {
          level,
          rowspan: maxRow,
          colspan: 1,
          ...config
        }
      }
    })
  }
}


const getAssetUrl = (path: string) => {
  return new URL(`${path}`, import.meta.url).href
}
export {
  toLeaf,
  getMaxRow,
  calCrossSpan,
  getAssetUrl
}