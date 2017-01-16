var dataConfig = {"properties":{
    "timestamp":{
      "type":"string",
      "required":true,
      "description":"ISO8601 timestamp of data point"

    },
    "memory_usage":{
      "type":"integer",
      "minimum":"0",
      "default_upperbound":40000,
      "description":"Used memory in KB"
    },
    "memory_available":{
      "type":"integer",
      "minimum":"0",
      "default_upperbound":40000,
      "description":"Available memory in KB"
    },
    "cpu_usage":{
      "type":"number",
      "maximum":1,
      "minimum":0,
      "default_upperbound":1,
      "description":"Percentage of used cpu in decimal number"
    },
    "network_throughput":{
      "type":"object",
      "description":"Network traffic of the queried server",
      "default_upperbound":20000,
      "properties":{
         "in":{
            "type":"integer",
            "minimum":"0",
            "description":"Network input in KB"
         },
         "out":{
            "type":"integer",
            "minimum":"0",
            "description":"Network output in KB"
         }
      }
    },
    "network_packet":{
      "type":"object",
      "description":"Network packet throughputs of the querired server",
      "default_upperbound":1000,
      "properties":{
         "in":{
            "type":"integer",
            "minimum":"0",
            "description":"Received network packet count, no unit"
         },
         "out":{
            "type":"integer",
            "minimum":"0",
            "description":"Sent network packet count, no unit"
         }
      }
    },
    "errors":{
      "type":"object",
      "description":"Various errors/warnings reported on the queried server",
      "default_upperbound":10,
      "properties":{
         "system":{
            "type":"integer",
            "minimum":"0",
            "description":"System error/warning count, no unit"
         },
         "sensor":{
            "type":"integer",
            "minimum":"0",
            "description":"Sensor error/warning count, no unit"
         },
         "component":{
            "type":"integer",
            "minimum":"0",
            "description":"Component error/warning count, no unit"
         }
      }
    }
}};


