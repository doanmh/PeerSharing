var peer = new Peer({
    key: 'asvjxc0rszudte29',
    debug: 3
});

var connectedPeers = {};

var connect = function(conn) {
    if (conn.label === 'chat') {
        var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', conn.peer);
        var header = $('<h1></h1>').html('Chat with <strong>' + conn.peer + '</strong>');
        var messages = $('<div><em>Peer connected.</em></div>').addClass('messages');
        chatbox.append(header);
        chatbox.append(messages);

        chatbox.on('click', function() {
            if($(this).attr('class').indexOf('active') === -1) {
                $(this).addClass('active');
            } else {
                $(this).removeClass('active');
            }
        });
        $('.filler').hide();
        $('#connections').append(chatbox);

        conn.on('data', function(data) {
            messages.append('<div><span class="peer">' + conn.peer + '</span>: ' + data + '</div>');
        });
        conn.on('close', function() {
            alert(conn.peer + ' has left the chat.');
            chatbox.remove();
            if ($('.connection').length === 0) {
                $('.filler').show();
            }
            delete connectedPeers[conn.peer];
        });
    } else if (conn.label === 'file') {
        conn.on('data', function(data) {
            if (data.file.constructor === ArrayBuffer) {
                var dataView = new Uint8Array(data.file);
                var dataBlob = new Blob([dataView]);
                var url = window.URL.createObjectURL(dataBlob);
                $('#' + conn.peer).find('.messages').append('<div><span class="file">' +
                conn.peer + ' has sent you a <a href="#" class="downloadFile">' + data.name  +'</a>.</span></div>');
                $(".downloadFile").on('click', function() {
                    saveAs(dataBlob, data.name);
                });
            }
        });
    }
    connectedPeers[conn.peer] = 1;
}

peer.on('open', function(id) {
    $('#pid').text(id);
});

peer.on('connection', connect);

peer.on('error', function(err) {
    console.log(err);
});

$(document).ready(function() {
    var doNothing = function(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    var eachActiveConnection = function(callback) {
        var actives = $('.active');
        var checkIds = {};
        actives.each(function() {
            var peerId = $(this).attr('id');

            if (!checkIds[peerId]) {
                var conns = peer.connections[peerId];
                for (var i = 0, ii = conns.length; i < ii; i++) {
                    var conn = conns[i];
                    callback(conn, $(this));
                }
            }
            checkIds[peerId] = 1;
        });
    }

    var box = $('#box');
    box.on('dragenter', doNothing);
    box.on('dragover', doNothing);
    box.on('drop', function(e) {
        e.originalEvent.preventDefault();
        var file = e.originalEvent.dataTransfer.files[0];
        var data = {
            name: file.name,
            file: file
        }
        eachActiveConnection(function(conn, $conn) {
            if(conn.label === 'file') {
                conn.send(data);
                $conn.find('.messages').append('<div><span class="file">You sent a '+ file.name +'.</span></div>');
            }
        });
    });

    $('#connect').click(function() {
        var requestedPeer = $('#rid').val();
        if (!connectedPeers[requestedPeer]) {
            var c = peer.connect(requestedPeer, {
                label: 'chat',
                serialization: 'none',
                metadata: {message: 'Hi, I want to chat with you!'}
            });
            c.on('open', function() {
                connect(c);
            });
            c.on('error', function(err) {
                alert(err);
            });
            var f = peer.connect(requestedPeer, {label: 'file', reliable: true});
            f.on('open', function() {
                connect(f);
            });
            f.on('error', function(err) {
                alert(err);
            });
        }
        connectedPeers[requestedPeer] = 1;
    });

    $('#close').click(function() {
        eachActiveConnection(function(conn) {
            conn.close();
        });
    });

    $('#send').submit(function(e) {
        e.preventDefault();
        var msg = $('#text').val();
        eachActiveConnection(function(conn, $conn) {
            if (conn.label === 'chat') {
                conn.send(msg);
                $conn.find('.messages').append('<div><span class="you">You: </span>' + msg + '</div>');
            }
        });
        $('#text').val('');
        $('#text').focus();
    });
});

window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
        peer.destroy();
    }
};