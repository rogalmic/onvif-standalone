window.$ = window.jQuery = require('./jquery-3.3.1.min.js');

var {ipcRenderer, remote} = require('electron'); 

var main = remote.require("./main.js");

// Send async message to main process
ipcRenderer.send('async', 1);

// Listen for async-reply message from main process
ipcRenderer.on('async-reply', (event, arg) => {  
    // Print 2
    console.log(arg);
    // Send sync message to main process
    let mainValue = ipcRenderer.sendSync('sync', 3);
    // Print 4
    console.log(mainValue);
});

// Listen for main message
ipcRenderer.on('ping', (event, arg) => {  
    // Print 5
    console.log(arg);
    // Invoke method directly on main process
    main.pong(6);
});

$(document).ready(function() {

    $('#ptz-left').click(function() {alert('aaa');});

    $('div.fade-animated').css('opacity', '0.0');        
    $('div.fade-animated').css('transition', 'opacity 0.8s');
    $('div.fade-animated').css('display', 'none');

    ipcRenderer.on('onvif_loaded', (event, arg) => {        
        $('select#device_selection').empty();  

        for(var key in arg) {
            var device = devices[key];
            var option_el = $('<option></option>');
            option_el.val(device.address);
            option_el.text(device.name + ' (' + device.address + ')');
            $('select#device_selection').append(option_el);
        }

        $('div#connect-form').css('opacity', '1.0');
        $('div#connect-form > *').prop('disabled', false);
    });

    $('#connect-form button#connect').click(function() {
        $('div#connect-form').css('opacity', '0.0');
        $('div#connect-form').css('display', 'none');

        $('img#snapshot').attr('src', 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjQsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTYgMTYiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHBhdGggZD0iTTgsMEMzLjU4MiwwLDAsMy41ODIsMCw4czMuNTgyLDgsOCw4czgtMy41ODIsOC04UzEyLjQxOCwwLDgsMHogTTksMTJjMCwwLjU1Mi0wLjQ0OCwxLTEsMXMtMS0wLjQ0OC0xLTFWNw0KCWMwLTAuNTUyLDAuNDQ4LTEsMS0xczEsMC40NDgsMSwxVjEyeiBNOCw1LjAxNmMtMC41NTIsMC0xLTAuNDQ4LTEtMWMwLTAuNTUyLDAuNDQ4LTEsMS0xczEsMC40NDgsMSwxQzksNC41NjgsOC41NTIsNS4wMTYsOCw1LjAxNnoNCgkiLz4NCjwvc3ZnPg==');

        $('div#connected-device').css('display', 'block');
        $('div#connected-device').css('opacity', '1.0');        
    });

    $('div#connect-form > *').prop('disabled', true);
    $('div#connect-form').css('display', 'block');
    $('div#connect-form').css('opacity', '0.5');
});