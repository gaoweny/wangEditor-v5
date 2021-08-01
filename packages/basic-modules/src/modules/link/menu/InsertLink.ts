/**
 * @description insert link menu
 * @author wangfupeng
 */

import { Editor, Range, Node } from 'slate'
import { IModalMenu, IDomEditor, genModalInputElems, genModalButtonElems } from 'wangeditor-core'
import $, { Dom7Array } from '../../../utils/dom'
import { genRandomStr } from '../../../utils/util'
import { LINK_SVG } from '../../../constants/icon-svg'
import { isMenuDisabled, insertLink } from '../helper'

/**
 * 生成唯一的 DOM ID
 */
function genDomID(): string {
  return genRandomStr('w-e-insert-link')
}

class InsertLinkMenu implements IModalMenu {
  readonly title = '插入链接'
  readonly iconSvg = LINK_SVG
  readonly tag = 'button'
  readonly showModal = true // 点击 button 时显示 modal
  readonly modalWidth = 300
  private $content: Dom7Array | null = null
  private readonly textInputId = genDomID()
  private readonly urlInputId = genDomID()
  private readonly buttonId = genDomID()

  getValue(editor: IDomEditor): string | boolean {
    // 插入菜单，不需要 value
    return ''
  }

  isActive(editor: IDomEditor): boolean {
    // 任何时候，都不用激活 menu
    return false
  }

  exec(editor: IDomEditor, value: string | boolean) {
    // 点击菜单时，弹出 modal 之前，不需要执行其他代码
    // 此处空着即可
  }

  isDisabled(editor: IDomEditor): boolean {
    return isMenuDisabled(editor)
  }

  getModalPositionNode(editor: IDomEditor): Node | null {
    return null // modal 依据选区定位
  }

  getModalContentElem(editor: IDomEditor): Dom7Array {
    const { selection } = editor
    const { textInputId, urlInputId, buttonId } = this

    // 获取 input button elem
    const [$textContainer, $inputText] = genModalInputElems('链接文本', textInputId)
    const [$urlContainer, $inputUrl] = genModalInputElems('链接网址', urlInputId)
    const [$buttonContainer] = genModalButtonElems(buttonId, '确定')

    if (this.$content == null) {
      // 第一次渲染
      const $content = $('<div></div>')

      // 绑定事件（第一次渲染时绑定，不要重复绑定）
      $content.on('click', `#${buttonId}`, e => {
        e.preventDefault()
        const text = $(`#${textInputId}`).val()
        const url = $(`#${urlInputId}`).val()
        insertLink(editor, text, url) // 插入链接
        editor.hidePanelOrModal() // 隐藏 modal
      })

      // 记录属性，重要
      this.$content = $content
    }

    const $content = this.$content
    $content.html('') // 先清空内容

    // append inputs and button
    $content.append($textContainer)
    $content.append($urlContainer)
    $content.append($buttonContainer)

    // 设置 input val
    if (selection == null || Range.isCollapsed(selection)) {
      // 选区无内容
      $inputText.val('')
    } else {
      // 选区有内容
      const selectionText = Editor.string(editor, selection)
      $inputText.val(selectionText)
    }
    $inputUrl.val('')

    // focus 一个 input（异步，此时 DOM 尚未渲染）
    setTimeout(() => {
      $(`#${textInputId}`).focus()
    })

    return $content
  }
}

export default InsertLinkMenu
