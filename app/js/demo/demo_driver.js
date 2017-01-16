(function () {
    function DataFetcher(serverID, delay) {
        var self = this;

        self.delay = delay;
        self.serverID = serverID;
        self.timer = null;
        self.requestObj = null;

        function getNext() {
            var startTime = new Date(),
                endTime = new Date(startTime.getTime() + 1000),
                queryParam = ["from=", startTime.getTime(), "&to=", endTime.getTime()].join("");

            self.requestObj = $.ajax({
                    url: ["/server_stat/", self.serverID, "?" + queryParam].join("")
                }).done(function(response) {
                    $(document).trigger("stateFetchingSuccess", {
                        from: startTime,
                        to: endTime,
                        result: response
                    });
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    $(document).trigger("stateFetchingFailure", {
                        from: startTime,
                        to: endTime,
                        error: textStatus
                    });
                }).always(function() {
                    self.timer = setTimeout(getNext, self.delay);
                });
        }

        self.start = function() {
            getNext();
        };

        self.setDelay = function(newDelay) {
            this.delay = newDelay;
        };

        self.setServerID = function(newServerID) {
            this.serverID = newServerID;
        };
    }
    
    var $responseList = $("#mockAPIResponse"),
        counter = 0,
        limit = 10;

    $(document).on({
        "stateFetchingSuccess": function(event, data) {
            data.result.data.forEach(function(dataEntry) {
                controler.update(dataEntry);
            });

        },
        "stateFetchingFailure": function(event, data) {
            controler.alertError();
        }
    });

    var df = new DataFetcher("server1", 500);
    df.start();
})();
