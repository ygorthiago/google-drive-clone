import { describe, test, jest, expect } from '@jest/globals'
import fs from 'fs'
import FileHelper from '../../src/fileHelper'

describe('#FileHelper', () => {

  describe('#getFileStatus', () => {

    test('it should return files statuses in correct format', async () => {
      const statMock = {
        dev: 2064,
        mode: 33188,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 44046,
        size: 80435,
        blocks: 160,
        atimeMs: 1631030046311.233,
        mtimeMs: 1631026357352.5122,
        ctimeMs: 1631030046321.233,
        birthtimeMs: 1631030046311.233,
        atime: '2021-09-07T15:54:06.311Z',
        mtime: '2021-09-07T14:52:37.353Z',
        ctime: '2021-09-07T15:54:06.321Z',
        birthtime: '2021-09-07T15:54:06.311Z'
      }

      const mockUser = 'ygorthiago'
      process.env.USER = mockUser
      const fileName = 'file.png'

      jest.spyOn(fs.promises, fs.promises.readdir.name)
      .mockResolvedValue([fileName])

      jest.spyOn(fs.promises, fs.promises.stat.name)
        .mockResolvedValue(statMock)

      const result = await FileHelper.getFileStatus("/mockedDownloadsFolder")

      const expectedResult = [
        {
          size: '80.4 kB',
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: fileName
        }
      ]

      expect(fs.promises.stat).toHaveBeenCalledWith(`/mockedDownloadsFolder/${fileName}`)
      expect(result).toMatchObject(expectedResult)
    })
  })
})