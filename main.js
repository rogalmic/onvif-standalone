const electron = require('electron')
const onvif = require('node-onvif')

const app = electron.app
const BrowserWindow = electron.BrowserWindow
const ipcMain = electron.ipcMain

const path = require('path')
const url = require('url')

var devices = {};

ipcMain.on('async', (event, arg) => {  
  console.log(arg);
  event.sender.send('async-reply', 2);
});

ipcMain.on('sync', (event, arg) => {  
  console.log(arg);
  event.returnValue = 4;
  mainWindow.webContents.send('ping', 5);
});

exports.pong = arg => {  
  console.log(arg);
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})
  mainWindow.setMenu(null);
  
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  

  onvif.startProbe().then(
    (device_list) => {
		device_list.forEach((device) => {

			let odevice = new onvif.OnvifDevice({
				xaddr: device.xaddrs[0]
			});
			let addr = odevice.address;
			devices[addr] = odevice;
			names[addr] = device.name;
		});
		var devs = {};
		for(var addr in devices) {
			devs[addr] = {
				name: names[addr],
				address: addr
			}
		}
    let res = {'id': 'startDiscovery', 'result': devs};
    console.log(res)
    mainWindow.webContents.send('onvif_loaded', devices);
	}).catch((error) => {
    let res = {'id': 'connect', 'error': error.message};
    console.log(res)
    var devs = {};
    mainWindow.webContents.send('onvif_loaded', devs);
  });
  
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
