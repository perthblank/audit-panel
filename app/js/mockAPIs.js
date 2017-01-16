(function () {
    var uploaded = [];

    function generateResponse(startTime, endTime, serverID) {
        function getRandomNumber(upperBound) {
            return Math.floor(Math.random() * upperBound);
        }

        var records = [],
            memUpperBound = 40000,
            throughputUpperBound = 20000,
            packetUpperBound = 1000,
            errorUpperBound = 5;

        for (var ts = startTime; ts < endTime; ts += 1000) {
            records.push({
                timestamp: (new Date(ts)).toISOString(),
                memory_usage: getRandomNumber(memUpperBound),
                memory_available: getRandomNumber(memUpperBound),
                cpu_usage: Math.random().toFixed(2),
                network_throughput: {
                    "in": getRandomNumber(throughputUpperBound),
                    out: getRandomNumber(throughputUpperBound)
                },
                network_packet: {
                    "in": getRandomNumber(packetUpperBound),
                    out: getRandomNumber(packetUpperBound)
                },
                errors: {
                    system: getRandomNumber(errorUpperBound),
                    sensor: getRandomNumber(errorUpperBound),
                    component: getRandomNumber(errorUpperBound)
                }
            });
        }

        return {
            header: {
                target_name: serverID,
                time_range: {
                    start: new Date(startTime).toISOString(),
                    end: new Date(endTime).toISOString()
                },
                recordCount: records.length
            },
            data: records
        };
    }

    $.mockjax(function(requestSettings) {
        var service = requestSettings.url.match(/^\/server_stat\/(.*)\?from=(\d+)\&to=(\d+)$/);

        if (service) {
            var errorRate = 0.2,
                mockDefinition = {
                    type: "GET",
                    url: /^\/server_stat\/(.*)\?from=(\d+)\&to=(\d+)$/,
                    urlParams: ["serverID", "startTime", "endTime"],
                    contentType: "application/json",
                };

            if (Math.random() < errorRate) {
                mockDefinition = $.extend(mockDefinition, {
                    status: 500,
                    responseText: "An Internal Server Error!!!"
                });
            } else {
                mockDefinition = $.extend(mockDefinition, {
                    status: 200,
                    response: function(settings) {
                        var st = parseInt(settings.urlParams.startTime),
                            et = parseInt(settings.urlParams.endTime),
                            serverName = settings.urlParams.serverID;

                        this.responseText = generateResponse(st, et, serverName);
                    }
                });
            }

            return mockDefinition;
        }

        return;
    })

    $.mockjax({
            type: "POST",
            url: /^\/server_stat$/,
            contentType: "application/json",
            response: function(settings) {
                uploaded.push(settings.data);
                this.responseText = settings.data;
            }
        }
    );
})();
