import createEditor from '../../../../tests/utils/create-editor'
import UploadImage from '../../src/module/menu/UploadImageMenu'
import { IEditorConfig } from '@wangeditor/editor'
import { Editor, Transforms, Range } from 'slate'

// 模拟 DataTransfer
class MyDataTransfer {
  private values: object = {}
  setData(type: string, value: string) {
    this.values[type] = value
  }
  getData(type: string): string {
    return this.values[type]
  }
}
describe('module plugin', () => {
  let editor = createEditor()
  let uploadImageMenu = new UploadImage()
  const startLocation = Editor.start(editor, [])
  test('', () => {
    const data = new MyDataTransfer()
    data.setData('text/plain', ' hello')
    // Todo: 模拟DataTransfer
    // editor.insertData(data)
  })
})
