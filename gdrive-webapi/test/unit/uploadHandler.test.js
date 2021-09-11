import { describe, test, jest, expect } from '@jest/globals'
import Uploadhandler from '../../src/uploadHandler.js'
import TestUtil from '../_util/testUtil.js'
import fs from 'fs'
import Routes from './../../src/routes.js'
import { resolve } from 'path'

describe('#Upload handler suite', () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {}
  }
  
  describe('#registerEvents', () => {
    test('should call onFile and onFinish on Busboy instance', () => {
      const uploadHandler = new Uploadhandler({
        io: ioObj,
        socketId: "01"
      })

      jest.spyOn(uploadHandler, uploadHandler.onFile.name)
        .mockResolvedValue()

      const headers = {
        'content-type': 'multipart/form-data; boundary='
      }
      const onFinish = jest.fn()
      const busboyInstance = uploadHandler.registerEvents(headers, onFinish)

      const fileStream = TestUtil.geneateReadableStream([ 'chunk', 'of', 'data' ])
      busboyInstance.emit('file', 'fieldName', fileStream, 'fileName.txt')

      busboyInstance.listeners('finish')[0].call()

      expect(uploadHandler.onFile).toHaveBeenCalled()
      expect(onFinish).toHaveBeenCalled()
    })
  })

  describe('#onFile', () => {
    test('given a stream file, it should save it on disk', async () => {
      const chunks = [ 'chunk', 'of', 'data' ]
      const downloadsFolder = '/tmp'
      const handler = new Uploadhandler({
        io: ioObj,
        socketId: "01",
        downloadsFolder
      })

      const onData = jest.fn()
      const onTransform = jest.fn()
      
      jest.spyOn(fs, fs.createWriteStream.name)
        .mockImplementation(() => TestUtil.generateWritableStream(onData))

      jest.spyOn(handler, handler.handleFileBytes.name)
        .mockImplementation(() => TestUtil.generateTransformStream(onTransform))

        const params = {
          fieldName: 'video',
          file: TestUtil.geneateReadableStream(chunks),
          fileName: 'mockFile.mov'
        }

        await handler.onFile(...Object.values(params))

        expect(onData.mock.calls.join()).toEqual(chunks.join())
        expect(onTransform.mock.calls.join()).toEqual(chunks.join())

        const expectedFileName = resolve(handler.downloadsFolder, params.fileName)
        expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFileName)
    })
  })
})