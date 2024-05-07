import { kebabCase } from "lodash"

export const styleOperate = (dom, style) => {
  for(let styleName in style){
      dom.style[kebabCase(styleName)] = style[styleName]
    }
}