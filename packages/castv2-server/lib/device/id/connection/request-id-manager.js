class RequestIdManager {
    static set(startRequestId = 1) {
        RequestIdManager._requestId = startRequestId;
    }

    static get() {
        if (RequestIdManager._requestId > 999 || RequestIdManager._requestId == null) {
            RequestIdManager.set();
        }
        return RequestIdManager._requestId++;
    }
}

module.exports = RequestIdManager;