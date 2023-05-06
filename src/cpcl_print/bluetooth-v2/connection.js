module.exports = Behavior({
  data: {
    printList: [],
  },
  methods: {
    // 1.查找蓝牙设备 S
    start: function () {
      if (!wx.openBluetoothAdapter) {
        this.showTip("当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。")
        return;
      }
      var _this = this;
      wx.openBluetoothAdapter({
        success(res) {
          _this.getBluetoothAdapterState();
        },

        fail(err) {
          console.log(err);
          _this.showTip('蓝牙初始化失败，请确保已开启手机蓝牙，且已开启小程序使用权限')
        },
      })
    },

    getBluetoothAdapterState: function () {
      var _this = this;
      wx.getBluetoothAdapterState({
        complete: function (res) {
          if (!!res && res.available) {
            _this.startSearch();
          } else {
            _this.showTip("蓝牙初始化失败，请确保已开启手机蓝牙，且已开启小程序使用权限")
          }
        }
      })
    },

    research: function () {
      var _this = this;
      wx.removeStorageSync('bluetoothPrintList')
      wx.closeBluetoothAdapter({
        complete: function (res) {
          _this.start();
        }
      })
    },

    startSearch: function () {
      var _this = this;

      let printList = wx.getStorageSync('bluetoothPrintList')
      if (printList && printList.length > 0) {
        _this.setData({
          printList
        });
        return
      }
      wx.showLoading({
        title: '搜索中',
        mask: true
      })

      wx.startBluetoothDevicesDiscovery({
        services: [],
        complete: function (res) {
          setTimeout(function () {
            wx.getBluetoothDevices({
              complete: function (res) {
                wx.hideLoading();
                var list = _this.filterPrint(res.devices);
                _this.setData({
                  printList: list
                });
                wx.setStorageSync('bluetoothPrintList', list)
                if (list.length == 0) {
                  _this.showTip('没有发现新的设备哦');
                }
              }
            });
            wx.stopBluetoothDevicesDiscovery({
              success: function (res) { },
            })
          }, 3000)
        }
      })
    },

    filterPrint: function (list) {
      var _this = this;
      let printList = [];
      let storageList = _this.data.storageList || [];
      for (let i = 0; i < list.length; i++) {
        let base64 = wx.arrayBufferToBase64(list[i].advertisData);
        let str = Array.prototype.map.call(new Uint8Array(list[i].advertisData), x => ('00' + x.toString(16)).slice(-2)).join('');
        if (str.length == 16) {
          let has = false;
          for (let j = 0; j < storageList.length; j++) {
            if (storageList[j].deviceId == list[i].deviceId) {
              has = true; break;
            }
          }
          if (!has) {
            list[i].address = str.toUpperCase()
            printList.push(list[i]);
          }
        }
      }
      return printList;
    }, // 1.查找蓝牙设备 E

    // 2.连接蓝牙设备并打印 S
    connectDevice: function (deviceId) {
      var _this = this;
      // var item = event.mark.item;
      // if (!this.data.sendData64.length) {
      //   _this.showTip('没有打印数据');
      //   return
      // }
      wx.showLoading({
        title: '连接中...',
        mask: true
      })
      wx.createBLEConnection({
        deviceId,
        success(res) {
          wx.showLoading({
            title: '正在传输...',
            mask: true
          });
          _this.getDeviceService(deviceId);
        },
        fail(res) {
          wx.hideLoading();
          console.log('createBLEConnection', res);
          _this.showTip('连接失败');
        }
      })
    },

    closeBLEConnection: function (deviceId) {
      wx.closeBLEConnection({
        deviceId: deviceId,
        success: function (res) {}
      })
    },

    filterService: function (services) {
      const services_uuid1 = "0000EEE0-0000-1000-8000-00805F9B34FB";
      const services_uuid2 = "0000FF00-0000-1000-8000-00805F9B34FB";
      const services_uuid3 = "49535343-FE7D-4AE5-8FA9-9FAFD205E455";
      let serviceId = "";
      for (let i = 0; i < services.length; i++) {
        let serverid = services[i].uuid.toUpperCase();
        if (serverid.indexOf(services_uuid1) != -1 ||
          serverid.indexOf(services_uuid2) != -1 ||
          serverid.indexOf(services_uuid3) != -1
        ) {
          serviceId = services[i].uuid;
          break;
        }
      }
      return serviceId;
    },

    getDeviceService: function (deviceId) {
      var _this = this;
      wx.getBLEDeviceServices({
        deviceId: deviceId,
        success: function (res) {
          var serviceId = _this.filterService(res.services);
          if (serviceId != "") {
            _this.getDeviceCharacter(deviceId, serviceId);
          } else {
            _this.showTip('没有找到主服务');
            _this.closeBLEConnection(deviceId);
          }
        },
        fail: function (res) {
          _this.showTip('搜索设备服务失败');
          _this.closeBLEConnection(deviceId);
        }
      })
    },

    getDeviceCharacter: function (deviceId, serviceId) {
      var _this = this;
      wx.getBLEDeviceCharacteristics({
        deviceId: deviceId,
        serviceId: serviceId,
        success: function (res) {
          let writeId = _this.filterCharacter(res.characteristics);
          if (writeId != '') {
            _this.writeBLECharacteristicValue(deviceId, serviceId, writeId, 1);
          } else {
            _this.showTip('获取特征值失败');
            _this.closeBLEConnection(deviceId);
          }
        },
        fail: function (res) {
          _this.showTip('获取特征值失败');
          _this.closeBLEConnection(deviceId);
        }
      })
    },

    writeBLECharacteristicValue: function (deviceId, serviceId, writeId, times) {
      var _this = this;
      var sendData64 = _this.data.sendData64;
      if (sendData64.length >= times) {
        wx.writeBLECharacteristicValue({
          deviceId: deviceId,
          serviceId: serviceId,
          characteristicId: writeId,
          value: sendData64[times - 1],
          // value: wx.base64ToArrayBuffer(sendData64[times - 1]),
          success: function (res) {
            _this.writeBLECharacteristicValue(deviceId, serviceId, writeId, ++times);
          },
          fail: function (res) {
            console.log('打印失败', res);
            _this.showTip('打印失败');
            _this.closeBLEConnection(deviceId);
          }
        })
      } else {
        wx.hideLoading();
        _this.showTip('传输完成');
        _this.triggerEvent('printSuccess')
        _this.closeBLEConnection(deviceId);
      }
    },

    filterCharacter: function (characteristics) {
      let writeId = '';
      for (let i = 0; i < characteristics.length; i++) {
        let charc = characteristics[i];
        if (charc.properties.write) {
          writeId = charc.uuid;
          break;
        }
      }
      return writeId;
    }, 

    // 打印命令
    printCommand: function ({ deviceId, data }) {
      var uint8Buf = Array.from(data);
      let sendData64 = [];
      function splitArray(data, size) {
        var result = {};
        var j = 0
        for (var i = 0; i < data.length; i += size) {
          result[j] = data.slice(i, i + size)
          let resultMap = [...result[j]]

          let buffer = new ArrayBuffer(result[j].length)
          let dataView = new DataView(buffer)
          for (let k = 0; k < resultMap.length; k++) {
            dataView.setUint8(k, resultMap[k]);
          }
          sendData64[j] = buffer
          j++
        }
        return result
      }
      splitArray(uint8Buf, 20)
      this.setData({
        sendData64: sendData64
      })
      this.connectDevice(deviceId)
    }, // 2.连接蓝牙设备 E

    showTip: function (data) {
      wx.hideLoading();
      wx.showModal({
        content: data,
        showCancel: false
      })
    },
  }
})
