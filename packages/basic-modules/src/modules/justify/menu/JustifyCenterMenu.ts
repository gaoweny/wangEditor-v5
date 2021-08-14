/**
 * @description justify center menu
 * @author wangfupeng
 */

import { Transforms, Element } from 'slate'
import { IDomEditor, handlePlaceholderStyle } from '@wangeditor/core'
import BaseMenu from './BaseMenu'
import { JUSTIFY_CENTER_SVG } from '../../../constants/icon-svg'

class JustifyCenterMenu extends BaseMenu {
  readonly title = '居中对齐'
  readonly iconSvg = JUSTIFY_CENTER_SVG

  exec(editor: IDomEditor, value: string | boolean): void {
    Transforms.setNodes(
      editor,
      {
        textAlign: 'center',
      },
      { match: n => Element.isElement(n) }
    )

    handlePlaceholderStyle(editor, 'textAlign', 'center')
  }
}

export default JustifyCenterMenu
