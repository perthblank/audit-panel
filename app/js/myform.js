var dataConfig = {"properties":{
    "timestamp":{
      "type":"string",
      "required":true,
      "description":"ISO8601 timestamp of data point"
    },
    "memory_usage":{
      "type":"integer",
      "minimum":"0",
      "description":"Used memory in KB"
    },
    "memory_available":{
      "type":"integer",
      "minimum":"0",
      "description":"Available memory in KB"
    },
    "cpu_usage":{
      "type":"number",
      "maximum":1,
      "minimum":0,
      "description":"Percentage of used cpu in decimal number"
    },
    "network_throughput":{
      "type":"object",
      "description":"Network traffic of the queried server",
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

function submitData(data)
{
    $.ajax({
        url: "/server_stat",
        data: data,
        type: "POST"
    }).done(function(response){
        showSuccess("Submitted Successfully");
    }).fail(function(jqXHR, textStatus, errorThrown) {
        showError("Server Error");
    }).always(function() {

        $("#btnSubmit").attr("disabled",false);
    });
}

function showError(msg)
{
    $("#errorAlert").html(msg);
    $("#errorAlert").fadeIn();
}

function showSuccess(msg)
{
    $("#successAlert").html(msg);
    $("#successAlert").fadeIn();
}

function initListeners()
{
    d3.selectAll(".navBtn")
        .on("click",function(){
            if(d3.select(this).classed("active")) 
                return;
            d3.selectAll(".navBtn").classed("active",false);
            d3.select(this).classed("active",true);
            d3.selectAll(".mainContainer").classed("hidden",true);
            d3.select("#"+d3.select(this).select("a").attr("targ")).classed("hidden",false);
        });


    var criteria = dataConfig["properties"];
    Object.keys(criteria).forEach(function(key){
        var clabel = d3.select("#selectionForm").select("div").append("label").attr("class","checkbox-inline");
        var cbox = clabel.append("input")
            .attr("type","checkbox")
            .attr("class", "criteriaCheckbox")
            .attr("value",key)
            .attr("checked","true");
        clabel.append("span").html(key);

        if(criteria[key].required)
            cbox.attr("disabled","true")
    });

    d3.select("#btnGenerate")
        .on("click",function(){
            
            d3.select("#mainForm").html("");
            d3.selectAll(".criteriaCheckbox").each(function(){
                if(d3.select(this).node().checked)
                {
                    var key = d3.select(this).attr("value");
                    if(criteria[key]["properties"])
                    {
                        var outer = d3.select("#mainForm").append("div").attr("class","cform");
                        outer.append("label").html(key);
                        var form = outer.append("form");
                        Object.keys(criteria[key]["properties"]).forEach(function(c){
                            var group = form.append("div").attr("class","form-group");
                            group.append("label").html(c);
                            group.append("input")
                                .attr("targ",key+","+c)
                                .attr("class","form-control cinput");
                        });
                    }
                    else
                    {
                        var form = d3.select("#mainForm").append("form").attr("class","cform");
                        var group = form.append("div").attr("class","form-group");
                        group.append("label").html(key);
                        group.append("input")
                            .attr("targ",key)
                            .attr("class","form-control cinput");
                    }
                }
            });

            d3.select("#btnSubmit").classed("hidden",false);
    
    });

    d3.select("#btnSubmit").on("click",function(){
        $(".alert").hide();
        var flag = true;
        var data = {};
        d3.selectAll(".cinput").each(function(){
            var input = d3.select(this);
            var value = input.node().value;
            if(value=="") 
            {
                flag = false;
                input.style("background-color","#D9849D");
                return;
            }

            var keys = input.attr("targ").split(",");
            if(keys.length==1)
            {
                data[keys[0]] = value;
            }
            else if(keys.length==2)
            {
                if(!data[keys[0]]) 
                    data[keys[0]] = {};
                data[keys[0]][keys[1]] = value;
            }

        });
        if(!flag)
        {
            showError("Please fill everything in form");
            return;
        }

        $("#btnSubmit").attr("disabled",true);
        submitData(data);
    
    });

    $(".alert").click(function(){
        $(this).hide(); 
    })
}


initListeners();

d3.selectAll(".mainContainer").classed("hidden",true);
d3.select("#formContainer").classed("hidden",false);
