const encode = require("./encoding/encoding");
const { splitTextByWidth } = require("../utils/index");

class CPCL {
  constructor({ mode = 'CPCL', maxWidth = 540, size = 24 } = {}) {
    this.commandMode = mode
    this.position = 0
    this.maxWidth = maxWidth
    this.size = size
  }

  init() {
    this.data = ''
    this.command = []

    return this
  }

  addCommand(content) {
    const code = new encode.TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(content + '\r\n')
    for (let i = 0; i < code.length; ++i) {
      this.command.push(code[i])
    }

    return this
  }

  setBitmap (x, y, res) {
    const w = res.width
    const width = parseInt((res.width + 7) / 8 * 8 / 8)
    const height = res.height;

    const data = `CG ${width} ${height} ${x} ${y}\r\n`
    this.addCommand(data)
    const r = []
    const bits = new Uint8Array(height * width);
    for (y = 0; y < height; y++) {
      for (x = 0; x < w; x++) {
        const color = res.data[(y * w + x) * 4 + 1];
        if (color > 128) {
          bits[parseInt(y * width + x / 8)] |= (0x80 >> (x % 8));
        }
      }
    }
    for (let i = 0; i < bits.length; i++) {
      this.command.push((~bits[i]) & 0xFF);
      r.push((~bits[i]) & 0xFF);
    }
  }

  pushCode(content) {
    content.forEach((el)=>{
      this.command.push(el)
    })
  }

  setPagePrint() {
    this.addCommand("PRINT")

    return this
  }

  getData() {
    return this.command
  }

  batchAddCommand(content, position, maxWidth) {
    const maxW = maxWidth || this.maxWidth
    const maps = splitTextByWidth(content, maxW, this.size)
    this.position = position
    maps.forEach((item, index) => {
      this.position = position + index * 30
      this.addCommand(`T 6 0 20 ${this.position} ${item}`)
    })

    return this
  }
}

module.exports = {
  CPCL
}
