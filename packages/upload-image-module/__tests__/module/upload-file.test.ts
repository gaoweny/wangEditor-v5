import createEditor from '../../../../tests/utils/create-editor'
import UploadImage from '../../src/module/menu/UploadImageMenu'
import { IEditorConfig } from '@wangeditor/editor'
import uploadFiles from '../../src/module/upload-files'
import mockXHR from '../../../../tests/utils/mock-xhr'

const uploadImgServer = 'http://106.12.198.214:3000/api/upload-img'
const defaultRes = {
  status: 200,
  res: JSON.stringify({ data: ['url1'], errno: 0 }),
}
const mockXHRHttpRequest = (res: any = defaultRes) => {
  const mockXHRObject = mockXHR(res)

  const mockObject = jest.fn().mockImplementation(() => mockXHRObject)

  // @ts-ignore
  window.XMLHttpRequest = mockObject

  return mockXHRObject
}
// mockFile
function mockFile(option: any) {
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

const defaultFiles = [
  { name: 'test.png', size: 512, mimeType: 'image/png' },
  { name: 'test2.png', size: 2048, mimeType: 'image/png' },
  { name: 'test3.png', size: 3062, mimeType: 'image/png' },
]

const createMockFiles = (files: any[] = defaultFiles) => {
  const fileList = {
    length: files.length,
    item(index: number): File {
      return fileList[index]
    },
  } as FileList
  files.forEach((file, index) => (fileList[index] = mockFile(file)))
  return fileList
}
const uploadImageConfig = { server: uploadImgServer }
const editorConfig: Partial<IEditorConfig> = {
  MENU_CONF: { uploadImage: uploadImageConfig },
}
describe('module upload-files', () => {
  let editor
  let uploadImageMenu
  beforeEach(() => {
    uploadImageMenu = new UploadImage()
  })
  test('insert base64 image and invoke insertBase64 function through the base64LimitKB config', () => {
    uploadImageConfig['base64LimitKB'] = 1
    editor = createEditor({
      config: editorConfig,
    })
    uploadFiles(editor, createMockFiles())
    // todo :如何拿到insertBase64方法的result，去mock insertImageNode方法
    delete uploadImageConfig['base64LimitKB']
  })
  test('customUpload method is invoked by the customUpload config', () => {
    const customUploadMock = jest.fn()
    uploadImageConfig['customUpload'] = customUploadMock
    editor = createEditor({
      config: editorConfig,
    })
    uploadFiles(editor, createMockFiles())
    // todo: toBeCalled 需要正确的入参
    expect(customUploadMock).toBeCalled()
    delete uploadImageConfig['customUpload']
  })
  test('uploadFiles onSuccess hook function', () => {
    editor = createEditor({
      config: editorConfig,
    })
    const files = createMockFiles()
    const mockXHRObject = mockXHRHttpRequest({
      status: 200,
      res: `
      {
        errno: 0,
        data: [{ url: 'xxx', alt: 'xxx', href: 'xxx' }]
      }`,
    })
    uploadFiles(editor, files)
    mockXHRObject.onreadystatechange()
    // todo :mock了xhr为何uppy没用调用success回掉
  })
})
