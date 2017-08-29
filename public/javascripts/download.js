var peer = new Peer({
    key: 'asvjxc0rszudte29',
    debug: 3
});

var info = {};
var chunk = 0;
var downloadObject = [];

var connect = function(conn) {
    conn.on('data', function(data) {
        if (data.type == "INFO") {
            info.name = data.name;
            info.size = data.size;
            info.chunks = data.chunks;
            $('#fileName').text(data.name);
            $('#download').on('click', function() {
                $("#speedDownload").show();
                var msg = {
                    msg: "DOWNLOAD"
                }
                conn.send(msg);
            });
        } else if (data.type == "DATA") {
            if (data.chunk == chunk) {
                downloadObject.push(new Uint8Array(data.data));
                var msg = {
                    msg: "ACK",
                    received: chunk
                }
                if (chunk == info.chunks - 1) {
                    msg.msg = "DONE";
                    var dataBlob = new Blob(downloadObject);
                    saveAs(dataBlob, info.name);
                } else {
                    chunk++;
                }
                conn.send(msg);
                $("#speed").text(parseFloat((chunk+1)/info.chunks*100).toFixed(2));
            }
        }
    });
}

peer.on('error', function(err) {
    console.log(err);
});

$(document).ready(function() {
    var senderId = $('#senderId').val();
    var f = peer.connect(senderId, {
        reliable: true
    });
    f.on('open', function() {
        connect(f);
    });
});

window.onunload = window.onbeforeunload = function (e) {
    if (!!peer && !peer.destroyed) {
        peer.destroy();
    }
};