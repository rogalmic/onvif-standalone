window.$ = window.jQuery = require('./jquery-3.4.1.min.js');

var { ipcRenderer, remote, session } = require('electron');

var main = remote.require('./main.js');
var timerId = -1;


$(document).ready(function () {    

    // User interface handlers

    $('div#device-info-box a').click(function () {
        ipcRenderer.send('device_disconnect');
        return false;
    });

    $('#ptz-left').click(function () {
        ipcRenderer.send('device_execute', 'left');
        return false;
    });

    $('#ptz-right').click(function () {
        ipcRenderer.send('device_execute', 'right');
        return false;
    });

    $('#ptz-up').click(function () {
        ipcRenderer.send('device_execute', 'up');
        return false;
    });

    $('#ptz-down').click(function () {
        ipcRenderer.send('device_execute', 'down');
        return false;
    });

    $('#ptz-zoom-in').click(function () {
        ipcRenderer.send('device_execute', 'ptz-zoom-in');
        return false;
    });

    $('#ptz-zoom-out').click(function () {
        ipcRenderer.send('device_execute', 'ptz-zoom-out');
        return false;
    });

    $('#extra-command').click(function () {
        $('div#dialog').css('display', 'block');
        $('div#dialog').css('opacity', '1.0');
    }); 

    $('#connect-form button#connect').click(function () {
        $('div#connect-form').css('opacity', '0.0');
        $('div#connect-form').css('display', 'none');

        var obj = { url:'http://dummy.org/', user: $('input#user').val(), pass: $('input#pass').val() }
        ipcRenderer.send('device_connect', obj);
    });

    $('button#execute-ui-code').click(function () {
        var code = $('textarea#code-to-execute').val();
        jQuery.globalEval(code);
    });
    
    $('button#close-dialog').click(function () {
        $('div#dialog').css('opacity', '0.0');
        $('div#dialog').css('display', 'none');
    });    

    // Backend callback handlers

    ipcRenderer.on('device_discovered', (event, arg) => {
        $('select#device_selection').empty();

        for (var key in arg) {
            var device = devices[key];
            var option_el = $('<option></option>');
            option_el.val(device.address);
            option_el.text(device.name + ' (' + device.address + ')');
            $('select#device_selection').append(option_el);
        }

        $('div#connect-form').css('opacity', '1.0');
        ipcRenderer.send('cookies_acquire');
    });

    ipcRenderer.on('snapshot_updated', (event, arg) => {
        $('img#snapshot').attr('src', arg);
    });

    ipcRenderer.on('device_connected', (event, arg) => {

        $('div#device-info-box span#device-name').html("Foscam C1 lite");
        $('div#device-info-box span#device-address').html("192.168.1.91");

        ipcRenderer.send('snapshot_update');

        if (timerId >= 0) {
            clearInterval(timerId);
            timerId = -1;
        }

        timerId = setInterval(function () {
            ipcRenderer.send('snapshot_update');
        }, 5000)

        $('div#connected-device').css('display', 'block');
        $('div#connected-device').css('opacity', '1.0');
        $('img#snapshot').css('opacity', '1.0');
    });

    ipcRenderer.on('cookies_acquired', (event, arg) => {
        $('div#connect-form > *').prop('disabled', false);
        var userCookie = arg.find(function (cookie) { return cookie.name == 'user'; })
        var passCookie = arg.find(function (cookie) { return cookie.name == 'pass'; })

        if (userCookie != undefined && passCookie != undefined) {
            $('input#user').val(userCookie.value);
            $('input#pass').val(passCookie.value);
        }

        var codeCookie = arg.find(function (cookie) { return cookie.name == 'initial-code'; });
        if (codeCookie != undefined) {
            $('textarea#code-to-execute').val(codeCookie.value);
        }
        else {
            var code = `var { ipcRenderer } = require('electron');\n`
            +`$('img#snapshot').css('filter', 'blur(4px) sepia(50%)');\n`
            +`$('img#snapshot').css('transition', 'filter 10s');\n`
            +`$('img#snapshot').css('object-fit', 'contain');\n`
            +`ipcRenderer.send('device_execute', 'console.log("aaa")');\n`;
            $('textarea#code-to-execute').val(code);
        }        
    });

    ipcRenderer.on('device_executed', (event, arg) => {
        if (arg) {
            console.log(arg);
        }
    });

    // Initial tasks

    $('div.fade-animated').css('opacity', '0.0');
    $('div.fade-animated').css('transition', 'opacity 0.8s');
    $('div.fade-animated').css('display', 'none');

    $('img#snapshot').css('opacity', '0.0')
    $('img#snapshot').css('transition', 'opacity 0.8s');

    $('div#connect-form > *').prop('disabled', true);
    $('div#connect-form').css('display', 'block');
    $('div#connect-form').css('opacity', '0.5');

    ipcRenderer.send('device_discover');
});
