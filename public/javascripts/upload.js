var peer = new Peer({
    key: 'asvjxc0rszudte29',
    debug: 3
});

var data = {};
var chunkSize = 16300; 
var chunks;
var chunk = 0;

peer.on('connection', function (conn) {
    conn.on('open', function () {
        if (data.file) {
            var dataInfo = {
                type: "INFO",
                name: data.name,
                size: data.size,
                chunks: chunks
            }
            conn.send(dataInfo);
        }
    });
    conn.on('data', function(msg) {
        if (msg.msg === "DOWNLOAD") {
            if (data.file) {
                var offset = chunk*chunkSize;
                var dataInfo = {
                    type: "DATA",
                    chunk: 0,
                    data: data.file.slice(offset,offset+chunkSize)
                }
                conn.send(dataInfo);
            }
        } else if (msg.msg === "ACK") {
            if (msg.received == chunk) { //confirm that it received chunk, prepare to send next chunk
                chunk++;
                var offset = chunk*chunkSize;
                var dataInfo = {
                    type: "DATA",
                    chunk: chunk,
                    data: data.file.slice(offset,offset+chunkSize)
                }
                console.log(dataInfo.data);
                conn.send(dataInfo);
            }
        } 
    })
});

peer.on('error', function (err) {
    console.log(err);
});

$(document).ready(function () {
    $('#file-1').change(function (e) {
        e.originalEvent.preventDefault();
        var file = $('#file-1')[0].files[0];
        chunks = Math.ceil(file.size/chunkSize,chunkSize);
        data.size = file.size;
        data.name = file.name;
        data.file = file;
        $('#downloadLink').show();
        $('#chooseFile').hide();
        $('#fileInfo').show();
        $('#fileName').text(file.name);
        $('#link').text('http://localhost:3000/' + peer.id);
    })
});

window.onunload = window.onbeforeunload = function (e) {
    if (!!peer && !peer.destroyed) {
        peer.destroy();
    }
};