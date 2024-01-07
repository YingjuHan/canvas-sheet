const rules: { [key: string]: any } = {
  number: /^(-?\d{1,11}(\.\d*)?)$/,
  phone: /^[1-9]\d{10}$/,
  email: /w+([-+.]w+)*@w+([-.]w+)*.w+([-.]w+)*/,
};
// function parseValue(v) {
//   const { type } = this;
//   if (type === "date") {
//     return new Date(v);
//   }
//   if (type === "number") {
//     return Number(v);
//   }
//   return v;
// }
export default class Validator {
  validateKey: any;
  validateTitle: any;
  type: any;
  options: any;
  message?: string;
  required?: boolean;
  validator?: RegExp | Function;
  constructor(column: any) {
    /**
     * type: month|date|datetime|number|phone|email|select 数据格式类型
     * required 是否必填
     * validator: RegExp|Function 校验器
     * message 校验失败提示文案
     * validateKey 单元格key
     * validateTitle 单元格title
     * options 数据格式为type时的枚举数据
     */
    this.validateKey = column.key;
    this.validateTitle = column.title;
    this.type = column.type;
    this.options = column.options;
    Object.assign(this, column.rule);
  }
  async validate(v: any, row: any) {
    // 必填校验不通过，不再进行后续的校验
    let requiredValid =
      typeof v === "string" ? Boolean(v.trim()) : Boolean(v) || v === 0;
    if (this.required && !requiredValid) {
      return this.getValidation(false, "required");
    }
    // 空值不参与下面的校验
    if (!requiredValid) return { flag: true };

    if (rules[this.type] && !rules[this.type].test(v)) {
      return this.getValidation(false, "notMatch");
    }
    // 下拉校验值必须存在于枚举中
    if (this.type === "select") {
      const flag = this.options.map((item: any) => item.value).includes(v);
      if (!flag) {
        return this.getValidation(flag, "notMatch");
      }
    }
    if (
      this.type === "month" ||
      this.type === "date" ||
      this.type === "datetime"
    ) {
      const flag = isNaN(v) && !isNaN(Date.parse(v));
      if (!flag) {
        return this.getValidation(flag, "notMatch");
      }
    }

    if (this.validator instanceof RegExp) {
      const pattern = new RegExp(this.validator);
      return this.getValidation(pattern.test(v), "notIn");
    } else if (typeof this.validator === "function") {
      let flag = true;
      // 这里处理异步校验函数
      await this.validator(v, row, (res: string | boolean) => {
        if (typeof res === "string") {
          this.message = res;
          flag = !res;
        } else if (res === false) {
          flag = false;
        }
      });
      return this.getValidation(flag, "notIn");
    }
    return { flag: true };
  }

  getValidation(flag: boolean, key: string) {
    if (this.message) {
      return { flag, message: this.message };
    }
    let message = "";
    if (!flag) {
      switch (key) {
        case "required":
          message = `${this.validateTitle}字段必填哦！`;
          break;
        case "notMatch":
          message = `${this.validateTitle}字段不符合预期格式哦！`;
          break;
        case "notIn":
          message = `${this.validateTitle}字段是无效值哦！`;
          break;
        default:
          message = `${this.validateTitle}字段是无效值哦！`;
      }
    }
    return { flag, message };
  }
}
