var peer = new Peer({
    key: 'asvjxc0rszudte29',
    debug: 3
});

var data = {};

peer.on('connection', function (conn) {
    conn.on('open', function () {
        if (data.file) {
            conn.send(data);
        }
    });
});

peer.on('error', function (err) {
    console.log(err);
});

$(document).ready(function () {
    $('#file-1').change(function (e) {
        e.originalEvent.preventDefault();
        var file = $('#file-1')[0].files[0];
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