class Element {
  el: HTMLElement;
  constructor(tag: any, className = '') {
    if (typeof tag === 'string') {
      this.el = document.createElement(tag);
      this.el.className = className;
    } else {
      this.el = tag;
    }
    this.data;
  }

  data(key: any, value?: any): any {
    if (value !== undefined) {
      this.data[key] = value;
      return this;
    }
    return this.data[key];
  }

  on(eventNames: string, handler: Function) {
    const [fen, ...oen] = eventNames.split('.');
    let eventName = fen;
    if (
      eventName === 'mousewheel' &&
      /Firefox/i.test(window.navigator.userAgent)
    ) {
      eventName = 'DOMMouseScroll';
    }
    this.el.addEventListener(eventName, (evt: any) => {
      handler(evt);
      for (let i = 0; i < oen.length; i += 1) {
        const k = oen[i];
        if (k === 'left' && evt.button !== 0) {
          return;
        }
        if (k === 'right' && evt.button !== 2) {
          return;
        }
        if (k === 'stop') {
          evt.stopPropagation();
        }
      }
    });
    return this;
  }

  offset(value: any) {
    if (value !== undefined) {
      Object.keys(value).forEach((k) => {
        this.css(k, `${value[k]}px`);
      });
      return this;
    }
    const { offsetTop, offsetLeft, offsetHeight, offsetWidth } = this.el;
    return {
      top: offsetTop,
      left: offsetLeft,
      height: offsetHeight,
      width: offsetWidth,
    };
  }

  scroll(v: any) {
    const { el } = this;
    if (v !== undefined) {
      if (v.left !== undefined) {
        el.scrollLeft = v.left;
      }
      if (v.top !== undefined) {
        el.scrollTop = v.top;
      }
    }
    return { left: el.scrollLeft, top: el.scrollTop };
  }

  box() {
    return this.el.getBoundingClientRect();
  }

  parent() {
    return new Element(this.el.parentNode);
  }

  children(...eles: any) {
    if (arguments.length === 0) {
      return this.el.childNodes;
    }
    eles.forEach((ele: any) => this.child(ele));
    return this;
  }

  removeChild(el: any) {
    this.el.removeChild(el);
  }

  child(arg: any) {
    let ele = arg;
    if (typeof arg === 'string') {
      ele = document.createTextNode(arg);
    } else if (arg instanceof Element) {
      ele = arg.el;
    }
    this.el.appendChild(ele);
    return this;
  }

  contains(ele: Node | null) {
    return this.el.contains(ele);
  }

  className(v?: string) {
    if (v !== undefined) {
      this.el.className = v;
      return this;
    }
    return this.el.className;
  }

  addClass(name: string) {
    this.el.classList.add(name);
    return this;
  }

  hasClass(name: string) {
    return this.el.classList.contains(name);
  }

  removeClass(name: string) {
    this.el.classList.remove(name);
    return this;
  }

  toggle(cls = 'active') {
    return this.toggleClass(cls);
  }

  toggleClass(name: string) {
    return this.el.classList.toggle(name);
  }

  active(flag = true, cls = 'active') {
    if (flag) this.addClass(cls);
    else this.removeClass(cls);
    return this;
  }

  checked(flag = true) {
    this.active(flag, 'checked');
    return this;
  }

  disabled(flag = true) {
    if (flag) this.addClass('disabled');
    else this.removeClass('disabled');
    return this;
  }

  // key, value
  // key
  // {k, v}...
  attr(key?: any, value?: string) {
    if (value !== undefined) {
      this.el.setAttribute(key, value);
    } else {
      if (typeof key === 'string') {
        return this.el.getAttribute(key);
      }
      Object.keys(key).forEach((k) => {
        this.el.setAttribute(k, key[k]);
      });
    }
    return this;
  }

  removeAttr(key: string) {
    this.el.removeAttribute(key);
    return this;
  }

  html(content?: string) {
    if (content !== undefined) {
      this.el.innerHTML = content;
      return this;
    }
    
    return this.el.innerHTML;
  }

  val(v?: any) {
    if (v !== undefined) {
      this.el.value = v;
      return this;
    }
    return this.el.value;
  }

  focus() {
    if (window.getSelection) {
      // ie11 10 9 ff safari
      this.el.focus(); // 解决ff不获取焦点无法定位问题
      const range = window.getSelection() as Selection; // 创建range
      range.selectAllChildren(this.el); // range 选择obj下所有子内容
      range.collapseToEnd(); // 光标移至最后
    } else if (document.selection) {
      // ie10以下
      const range = document.selection.createRange(); // 创建选择对象
      // var range = document.body.createTextRange();
      range.moveToElementText(this.el); // range定位到obj
      range.collapse(false); // 光标移至最后
      range.select();
    }
  }

  cssRemoveKeys(...keys: string[]) {
    keys.forEach((k: string) => this.el.style.removeProperty(k));
    return this;
  }

  // css( propertyName )
  // css( propertyName, value )
  // css( properties )
  css(name: any, value?: any) {
    if (value === undefined && typeof name !== 'string') {
      Object.keys(name).forEach((k: any) => {
        this.el.style[k] = name[k];
      });
      return this;
    }
    if (value !== undefined) {
      this.el.style[name] = value;
      return this;
    }
    return this.el.style[name];
  }

  computedStyle() {
    return window.getComputedStyle(this.el, null);
  }

  show() {
    this.css('display', 'block');
    return this;
  }

  hide() {
    this.css('display', 'none');
    return this;
  }
}

const h = (tag: string | HTMLElement, className = '') => new Element(tag, className);

export { Element, h };
