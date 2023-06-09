// pages/print/index.js
const { connection, CPCL } = require('../../cpcl_print/bluetooth-v2/index')
const { SF } = require('../../cpcl_print/template/shunfeng')

Page({
  behaviors: [connection],
  data: {
    printList: [
      // {
      //   RSSI: -42,
      //   address: "0000C47F0E301D33",
      //   connectable: true,
      //   deviceId: "828B78AB-57B8-72EE-F428-B74BBD7A11B2",
      //   localName: "HM-A300-1d33",
      //   name: "HM-A300-1d33",
      // },
    ],

    canvasWidth: 0,
    canvasHeight: 0,
  },

  onLoad() {
    this.start()
    this.loadCanvasImage()
  },

  onClickConnectDevice(event) {
    console.log(event.mark.deviceId);
    this.printTemplate(event.mark.deviceId)
  },
  
  printTemplate(deviceId) {
    const command = SF()

    this.printCommand({
      deviceId: deviceId,
      data: command.getData()
    })
  },

  loadCanvasImage() {
    const ctx = wx.createCanvasContext('secondCanvas');
    const that = this
    let tempFilePath = '/images/shunfeng.png'
    wx.getImageInfo({
      src: tempFilePath,
      success (res) {
        console.log(res);
        let paperWidth = 240;
        // 打印宽度须是8的整数倍，这里处理掉多余的，使得宽度合适，不然有可能乱码
        const mw = paperWidth % 8;
        const w = mw === 0 ? paperWidth : paperWidth - mw;
        // 等比算出图片的高度∂
        const h = Math.floor((res.height * w) / res.width);
        // 设置canvas宽高
        that.setData({
          img: tempFilePath,
          canvasHeight: h,
          canvasWidth: w,
        });
        // 在canvas 画一张图片
        ctx.fillStyle = 'rgba(255,255,255,1)';
        ctx.clearRect(0, 0, w, h);
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(tempFilePath, 0, 0, w, h);
        ctx.draw(false, () => {
          wx.hideLoading();
        });
      },
      fail: (res) => {
        console.log('get info fail', res);
      },
    })
  },

  getCanvasImage(event) {
    const { canvasWidth, canvasHeight } = this.data
    wx.canvasGetImageData({
      canvasId: 'secondCanvas',
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      success: (res) => {
        const command = new CPCL()
        command.init()
        command.addCommand(`! 5 200 200 500 1`)
        command.addCommand(`PAGE - WIDTH 630`)
        command.addCommand(`T 6 4 3 100 =======图片打印示例=======`)
        command.setBitmap(15, 205, res)
        command.setPagePrint()

        this.printCommand({
          deviceId: event.mark.deviceId,
          data: command.getData()
        })
      },
      fail(err) {
        console.log(err);
      }
    });
  },


  printCacheImage(event) {
    // yzdImage的数据可参考setBitmap的console.log
    const yzdImage = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,255,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,255,255,252,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,63,255,255,255,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,240,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,3,255,255,255,255,252,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,15,248,15,255,255,254,0,1,128,0,0,0,60,97,143,224,252,3,193,248,63,128,31,128,31,7,255,255,0,6,0,0,0,0,252,115,143,241,255,15,199,252,255,128,62,0,60,1,255,255,128,12,0,0,0,1,128,119,28,49,135,24,14,0,192,0,248,0,120,0,127,255,192,56,0,0,0,3,0,62,24,51,135,48,12,1,192,1,224,0,32,0,31,255,224,112,0,0,0,7,248,60,24,115,142,127,143,225,254,3,128,0,0,0,15,255,225,192,0,0,0,7,252,56,31,227,252,127,199,248,255,7,0,0,0,0,3,255,195,128,0,0,0,7,0,124,63,195,28,112,0,56,7,14,0,0,0,0,1,255,143,0,0,0,0,7,0,236,48,7,12,112,0,56,7,24,0,0,0,0,0,254,30,0,0,0,0,7,249,206,48,6,12,127,31,241,254,16,0,0,0,0,0,124,124,0,0,0,0,3,251,134,48,6,12,63,31,227,252,32,0,0,0,0,0,48,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,35,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,255,0,0,0,0,0,0,0,0,0,0,48,16,0,15,128,15,128,0,0,0,127,255,0,0,0,0,15,255,255,255,128,0,60,120,0,15,128,15,128,0,0,0,255,255,0,0,0,0,15,255,255,255,128,192,120,120,0,15,128,31,128,0,0,3,255,255,128,0,0,0,15,255,255,255,129,224,120,124,0,15,128,31,128,0,0,7,231,255,128,0,0,0,31,0,0,15,131,224,248,124,0,31,128,31,128,0,0,31,199,255,128,0,0,0,30,31,255,15,3,224,255,255,224,31,128,31,0,0,0,63,131,255,128,0,0,0,30,63,255,143,3,193,255,255,224,0,31,255,255,0,0,254,3,255,128,0,0,0,30,63,255,143,0,3,255,255,224,60,63,255,255,128,1,252,3,255,128,0,0,0,30,60,7,143,0,3,255,255,224,126,63,255,255,0,7,248,3,255,128,0,0,0,30,60,7,143,0,7,224,240,0,127,0,63,0,0,31,240,3,255,128,0,0,0,62,127,255,159,0,15,224,240,0,63,0,63,0,0,63,192,3,255,128,0,0,0,62,127,255,30,3,223,224,240,0,63,0,31,128,0,255,128,3,255,128,0,0,0,60,0,0,30,3,255,255,255,192,62,0,15,192,1,255,0,3,255,128,0,0,0,60,127,255,30,7,223,255,255,192,62,0,239,192,7,252,24,3,255,128,0,0,0,60,255,255,158,7,223,255,255,192,62,0,231,224,15,248,30,3,255,128,0,0,0,60,255,255,190,7,139,255,255,128,62,1,243,240,63,240,31,135,255,0,0,0,0,61,224,7,188,7,131,193,224,0,62,3,241,248,127,224,7,199,255,0,0,0,0,121,227,199,60,7,131,193,224,0,126,7,225,253,255,128,3,247,255,0,0,0,0,121,227,143,60,7,131,193,224,0,126,15,192,255,255,0,0,255,254,0,0,0,0,121,231,143,60,7,131,255,255,128,124,31,192,127,254,0,0,127,254,0,0,0,0,120,15,240,60,15,7,255,255,128,124,63,128,63,252,0,0,31,254,0,0,0,0,120,63,252,60,15,7,255,255,128,124,63,0,63,240,0,0,31,252,0,0,0,0,251,255,255,124,15,7,129,224,0,252,126,0,31,224,0,0,63,252,0,0,0,0,251,248,63,120,15,7,129,224,0,252,252,0,15,192,0,0,63,248,0,0,0,0,243,224,14,120,15,7,131,192,1,253,252,0,7,128,0,0,127,240,0,0,0,0,240,0,0,120,15,7,255,255,129,255,248,0,6,0,0,0,255,240,0,0,0,0,255,255,255,248,30,15,255,255,131,254,0,0,0,0,0,0,255,224,0,0,0,0,255,255,255,248,30,15,255,255,131,207,255,255,248,0,0,1,255,192,0,0,0,0,255,255,255,240,30,15,255,255,131,135,255,255,252,0,0,3,255,128,0,0,0,1,240,0,0,240,30,15,0,0,3,7,255,255,248,0,0,7,255,128,0,0,0,1,224,0,0,240,0,0,0,0,0,0,0,0,0,0,0,15,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,127,252,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,112,0,3,255,224,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,112,0,15,255,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,112,0,63,255,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,224,112,0,255,254,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,124,48,15,255,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,255,255,255,240,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,255,255,255,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,252,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,255,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    const command = new CPCL()
    command.init()
    command.addCommand(`! 5 200 200 500 1`)
    command.addCommand('CG 22 69 5 35')
    command.pushCode(yzdImage)
    //  command.addCommand('FORM')
    command.setPagePrint()
    this.printCommand({
      deviceId: event.mark.deviceId,
      data: command.getData()
    })
  }

})
