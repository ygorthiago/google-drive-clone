import Busboy from 'busboy'
import { pipeline } from 'stream/promises'
import fs from 'fs'
import { logger } from './logger.js'

export default class UploadHandler {
  constructor({ io, socketId, downloadsFolder, messageTimerDelay = 200 }) {
    this.io = io,
    this.socketId = socketId,
    this.downloadsFolder = downloadsFolder,
    this.messageTimerDelay = messageTimerDelay,
    this.ON_UPLOAD_EVENT = 'file-upload'
  }

  canExecute(lastExecution) {
    return (Date.now() - lastExecution) >= this.messageTimerDelay
  }

  handleFileBytes(filename) {
    this.lastMessageSent = Date.now()
    
    async function* handleData(source) {
      let processedAlready = 0

      for await (const chunk of source) {
        yield chunk

        processedAlready += chunk.length

        if (!this.canExecute(this.lastMessageSent)) {
          continue;
        }

        this.lastMessageSent = Date.now()

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
      this.handleFileBytes.apply(this, [filename]),
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