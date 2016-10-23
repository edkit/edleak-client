'use strict';

function WampSession() {
    this.session = null;
    this.uri = (document.location.protocol === "http:" ? "ws:" : "wss:") + "//" +
                            document.location.host + "/ws";
}

WampSession.prototype.isConnected = function () {
    if(this.session == null)
        return false;
    return true;
}

WampSession.prototype.start = function (slices) {
    var connection = new autobahn.Connection({
       url: this.uri,
       realm: "realm1"
    });

    var that = this;
    connection.onopen = function (session, details) {

       console.log("Connected");
       that.session = session;
    };

    connection.onclose = function (reason, details) {
       console.log("Connection lost: " + reason);
       that.session = null;
    }

    connection.open();
}

WampSession.prototype.classify_dataset = function (data) {
    return this.session.call('com.oakbits.edkit.edleak.classify_dataset', [data])
}
