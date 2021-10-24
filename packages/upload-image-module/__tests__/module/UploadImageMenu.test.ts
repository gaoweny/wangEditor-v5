import createEditor from '../../../../tests/utils/create-editor'
import UploadImage from '../../src/module/menu/UploadImageMenu'
import { IEditorConfig } from '@wangeditor/editor'
import { Editor, Transforms, Range } from 'slate'
import { insertImageNode } from '@wangeditor/basic-modules'
import $ from '../../src/utils/dom'

jest.mock('@wangeditor/basic-modules')

const disableTypeArr = [{ type: 'list-item' }, { type: 'header1' }, { type: 'blockquote' }]
const preNode = {
  type: 'pre',
  children: [
    {
      type: 'code',
      language: 'javascript',
      children: [{ text: 'var' }],
    },
  ],
}

const LinkNode = {
  type: 'link',
  url: 'https://wangeditor.com/v5',
  children: [{ text: 'wangeditor' }],
}

const imgObj = { url: 'xxx.png', alt: 'xxx', href: 'https://xxx.com' }

const editorConfig: Partial<IEditorConfig> = { MENU_CONF: {} }

type InsertFnType = (url: string, alt: string, href: string) => void

editorConfig.MENU_CONF!['uploadImage'] = {
  customBrowseAndUpload(insertFn: InsertFnType) {
    insertFn(imgObj.url, imgObj.alt, imgObj.href)
  },
}

// mockFile
const mockFile = (option: any) => {
  const name = option.name ?? 'mock.txt'
  const size = option.size ?? 1024
  const mimeType = option.mimeType || 'plain/txt'

  function range(count: number) {
    let output = ''
    for (var i = 0; i < count; i++) {
      output += 'a'
    }
    return output
  }

  const blob = new Blob([range(size)], { type: mimeType })

  return new File([blob], name)
}

const defaultFiles = [{ name: 'test.png', size: 512, mimeType: 'image/png' }]

const createMockFiles = (fileList: any[] = defaultFiles) => {
  const files = fileList.map(file => mockFile(file))
  return files.filter(Boolean)
}

describe('UploadImageMenu', () => {
  let editor
  let uploadImageMenu
  beforeEach(() => {
    uploadImageMenu = new UploadImage()
  })
  test('isActive', () => {
    editor = createEditor()
    expect(uploadImageMenu.isActive(editor)).toBeFalsy
  })

  test('is disabled', () => {
    editor = createEditor()
    editor.selection = null
    expect(uploadImageMenu.isDisabled(editor)).toBeTruthy

    // 编辑器初始化默认有个p节点，选择它，并后续修改type属性
    editor.select(Editor.start(editor, [0, 0]))
    jest.spyOn(Range, 'isCollapsed').mockReturnValue(false)
    expect(uploadImageMenu.isDisabled(editor)).toBeTruthy

    jest.spyOn(Range, 'isCollapsed').mockReturnValue(true)
    disableTypeArr.forEach(itemPropsObj => {
      Transforms.setNodes(editor, itemPropsObj)
      expect(uploadImageMenu.isDisabled(editor)).toBeTruthy
    })

    editor.clear()
    Transforms.insertNodes(editor, preNode)
    expect(uploadImageMenu.isDisabled(editor)).toBeTruthy

    editor.clear()
    Transforms.insertNodes(editor, LinkNode)
    expect(uploadImageMenu.isDisabled(editor)).toBeTruthy

    editor.clear()
    jest.spyOn(Editor, 'isVoid').mockReturnValue(true)
    expect(uploadImageMenu.isDisabled(editor)).toBeTruthy

    jest.spyOn(Editor, 'isVoid').mockReturnValue(false)
    Transforms.setNodes(editor, { type: 'paragraph' })
    expect(uploadImageMenu.isDisabled(editor)).toBeFalsy
  })

  test('exec', () => {
    editor = createEditor({ config: editorConfig })
    uploadImageMenu.exec(editor)
    expect(insertImageNode).toBeCalledWith(editor, imgObj.url, imgObj.alt, imgObj.href)

    delete editorConfig.MENU_CONF!['uploadImage']
    editor = createEditor({ config: editorConfig })
    uploadImageMenu.exec(editor)
    const $body = $('body')
    const $inputFile = $body.find('input[multiple][accept^=image]')
    expect($inputFile).not.toBeNull()
    expect($inputFile.css('display')).toBe('none')
    // todo: 交互upload事件
  })
})
