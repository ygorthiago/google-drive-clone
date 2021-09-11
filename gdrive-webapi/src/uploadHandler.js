import Busboy from 'busboy'
import { pipeline } from 'stream/promises'
import fs from 'fs'
import { logger } from './logger'

export default class Uploadhandler {
  constructor({ io, socketId, downloadsFolder }) {
    this.io = io,
    this.socketId = socketId,
    this.downloadsFolder = downloadsFolder,
    this.ON_UPLOAD_EVENT = 'file-upload'
  }

  handleFileBytes(filename) {
    let processedAlready = 0

    async function* handleData(source) {
      for await (const chunk of source) {
        yield chunk

        processedAlready += chunk.length

        this.io.to(this.socketId).emit(this.ON_UPLOAD_EVENT, { processedAlready, filename })
        logger.info(`File [${filename}] got ${processedAlready} bytes to ${this.socketId}`)
      }

    }

    return handleData.bind(this)
  }

  async onFile(fieldname, file, filename) {
    const saveTo = `${this.downloadsFolder}/${filename}`

    await pipeline(
      //get readable stream
      file,
      // filter, convert, transform data
      this.handleFileBytes.apply(this, [ filename ]),
      // proccess output, a writable stream
      fs.createWriteStream(saveTo)
    )

    logger.info(`file [${filename}] finished`)
  }

  registerEvents(headers, onFinish) {
    const busboy = new Busboy({ headers })

    busboy.on('file', this.onFile.bind(this))
    busboy.on('finish', onFinish)

    return busboy
  }
}