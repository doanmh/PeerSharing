var peer = new Peer({
    key: 'asvjxc0rszudte29',
    debug: 3
});

var totalPeers = 0;

var data = {};

peer.on('open', function(id) {
    totalPeers++;
});

peer.on('connection', function(conn) {
    conn.on('open', function() {
        if (data.file) {
            conn.send(data);
        }
    }); 
});

peer.on('error', function(err) {
    console.log(err);
});

$(document).ready(function() {
    var doNothing = function(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    var box = $('#box');
    box.on('dragenter', doNothing);
    box.on('dragover', doNothing);
    box.on('drop', function(e) {
        e.originalEvent.preventDefault();
        var file = e.originalEvent.dataTransfer.files[0];
        data.name = file.name;
        data.file = file;
        $('#link').text('http://localhost:3000/' + peer.id);
    });
});

window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
        peer.destroy();
    }
};