var peer = new Peer({
    key: 'asvjxc0rszudte29',
    debug: 3
});

var connect = function(conn) {
    conn.on('data', function(data) {
        console.log(data);
        if (data.file.constructor === ArrayBuffer) {
            $('#fileName').text(data.name);
            var dataView = new Uint8Array(data.file);
            var dataBlob = new Blob([dataView]);
            $('#download').on('click', function() {
                saveAs(dataBlob, data.name);
            });
        }
    });
}

// peer.on('connection', connect);

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