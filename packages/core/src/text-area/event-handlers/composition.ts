/**
 * @description 监听 composition 事件
 * @author wangfupeng
 */

import { Editor, Range } from 'slate'
import { IDomEditor } from '../../editor/interface'
import { DomEditor } from '../../editor/dom-editor'
import TextArea from '../TextArea'
import { hasEditableTarget } from '../helpers'
import { IS_SAFARI, IS_FIREFOX_LEGACY, IS_CHROME } from '../../utils/ua'
import { DOMNode } from '../../utils/dom'
import updateView from '../update-view'

const EDITOR_TO_TEXT: WeakMap<IDomEditor, string> = new WeakMap()
const EDITOR_TO_START_CONTAINER: WeakMap<IDomEditor, DOMNode> = new WeakMap()

/**
 * composition start 事件
 * @param e event
 * @param textarea textarea
 * @param editor editor
 */
export function handleCompositionStart(e: Event, textarea: TextArea, editor: IDomEditor) {
  const event = e as CompositionEvent

  if (!hasEditableTarget(editor, event.target)) return

  const { selection } = editor
  if (selection && Range.isExpanded(selection)) {
    Editor.deleteFragment(editor)
  }

  if (selection && Range.isCollapsed(selection)) {
    // 记录下 dom text ，以便触发 maxLength 时使用
    const domRange = DomEditor.toDOMRange(editor, selection)
    const startContainer = domRange.startContainer
    const curText = startContainer.textContent || ''
    EDITOR_TO_TEXT.set(editor, curText)

    // 记录下 dom range startContainer
    EDITOR_TO_START_CONTAINER.set(editor, startContainer)
  }
}

/**
 * composition update 事件
 * @param e event
 * @param textarea textarea
 * @param editor editor
 */
export function handleCompositionUpdate(event: Event, textarea: TextArea, editor: IDomEditor) {
  textarea.isComposing = true
  if (!hasEditableTarget(editor, event.target)) return

  console.log('handleCompositionUpdate')
  editor.emit('change')
}

/**
 * composition end 事件
 * @param e event
 * @param textarea textarea
 * @param editor editor
 */
export function handleCompositionEnd(e: Event, textarea: TextArea, editor: IDomEditor) {
  console.log('handleCompositionEnd1112')
  const event = e as CompositionEvent

  textarea.isComposing = false
  if (!hasEditableTarget(editor, event.target)) return

  const { selection } = editor
  if (selection == null) return

  const { data } = event

  // 检查 maxLength
  //【注意】这里只处理拼音输入的 maxLength 限制，英文、数组的限制，在 editor.insertText 中处理
  if (DomEditor.checkMaxLength(editor, data)) {
    const domRange = DomEditor.toDOMRange(editor, selection)
    domRange.startContainer.textContent = EDITOR_TO_TEXT.get(editor) || ''
    // TODO: check ?
    textarea.changeViewState() // 重新定位光标
    return
  }

  // COMPAT: In Chrome, `beforeinput` events for compositions
  // aren't correct and never fire the "insertFromComposition"
  // type that we need. So instead, insert whenever a composition
  // ends since it will already have been committed to the DOM.
  if (!IS_SAFARI && !IS_FIREFOX_LEGACY && data) {
    Editor.insertText(editor, data)
  }

  // insertText 之后，要清理可能暴露的 text 节点
  // 例如 chrome 在链接后面，输入拼音，就会出现有暴露出来的 text node
  if (IS_CHROME) {
    DomEditor.cleanExposedTexNodeInSelectionBlock(editor)
  }

  // 检查拼音输入是否夸 DOM 节点了，解决 we-2021/issues/47
  if (!IS_SAFARI) {
    setTimeout(() => {
      const { selection } = editor
      if (selection == null) return
      const oldStartContainer = EDITOR_TO_START_CONTAINER.get(editor) // 拼音输入开始时的 text node
      if (oldStartContainer == null) return
      const curStartContainer = DomEditor.toDOMRange(editor, selection).startContainer // 拼音输入结束时的 text node
      if (curStartContainer === oldStartContainer) {
        // 拼音输入的开始和结束，都在同一个 text node ，则不做处理
        return
      }
      // 否则，拼音输入的开始和结束，不是同一个 text node ，则将第一个 text node 重新设置 text
      oldStartContainer.textContent = EDITOR_TO_TEXT.get(editor) || ''
    })
  }
}
