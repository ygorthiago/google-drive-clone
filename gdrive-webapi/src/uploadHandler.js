import Busboy from 'busboy'
import { pipeline } from 'stream/promises'
import fs from 'fs'
import { logger } from './logger'

export default class Uploadhandler {
  constructor({ io, socketId, downloadsFolder }) {
    this.io = io,
    this.socketId = socketId,
    this.downloadsFolder = downloadsFolder
  }

  handleFileBytes() {
    
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