function submitData(data)
{
    form.disableSubmitButton();
    $.ajax({
        url: "/server_stat",
        data: data,
        type: "POST"
    }).done(function(response){
        showSuccess("Submitted Successfully");
    }).fail(function(jqXHR, textStatus, errorThrown) {
        showError("Server Error");
    }).always(function() {
        form.enableSubmitButton();
    });
}

function unfinish()
{
    showError("Please fill in every input");
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

class dynamicForm
{
    constructor(config, selectionFormID, mainFormID, submitCallback, unfinishCallback)
    {
        var criteria = config["properties"];
        Object.keys(criteria).forEach(function(key){
            var clabel = d3.select("#"+selectionFormID)
                .append("div").attr("class","checkbox").append("label").attr("class","checkbox-inline");
            var cbox = clabel.append("input")
                .attr("type","checkbox")
                .attr("class", "criteriaCheckbox")
                .attr("value",key)
                .attr("checked","true");
            clabel.append("span").html(key);
    
            if(criteria[key].required)
                cbox.attr("disabled","true")
        });
    
        var btnGenerateID = "btnGenerate-"+selectionFormID;
        var btnSubmitID = "btnGenerate-"+mainFormID;

        this.btnSubmitID = btnSubmitID;

        d3.select("#"+selectionFormID).append("button")
            .attr("class","btn btn-default")
            .attr("id",btnGenerateID)
            .attr("role","button")
            .attr("type","button")
            .html("Generate Form")
            .on("click",function(e){
                
                d3.select("#"+mainFormID).html("");
                $(".alert").hide();
                d3.select("#"+mainFormID)
                    .append("h2").attr("class","formHeader").html('Dynamic Form');
                var table = d3.select("#"+mainFormID)
                    .append("table").attr("class","ctable");
                d3.selectAll(".criteriaCheckbox").each(function(){
                    if(d3.select(this).node().checked)
                    {
                        var tr = table.append("tr");
                        var key = d3.select(this).attr("value");
                        if(criteria[key]["properties"])
                        {
                            var outer = tr.append("td").append("div").attr("class","tdLabel");
                            outer.append("label").attr("class","clabel").html(key);
                            var form = tr.append("td").append("form").attr("class","cform");
                            Object.keys(criteria[key]["properties"]).forEach(function(c){
                                var group = form.append("div").attr("class","form-group");
                                group.append("span").html(c);
                                group.append("input")
                                    .attr("targ",key+","+c)
                                    .attr("placeholder",criteria[key]["properties"][c]["type"])
                                    .attr("class","form-control cinput");
                            });
                        }
                        else
                        {
                            var outer = tr.append("td").append("div").attr("class","tdLabel");
                            outer.append("label").attr("class","clabel").html(key);
                            
                            var form = tr.append("td").append("form").attr("class","cform");
                            var group = form.append("div");
                            group.append("input")
                                .attr("targ",key)
                                .attr("placeholder",criteria[key]["type"])
                                .attr("class","form-control cinput");
                        }
                    }
                });
    
                d3.select("#"+mainFormID).append("button")
                    .attr("class","btn btn-default")
                    .attr("id",btnSubmitID)
                    .attr("type","button")
                    .attr("role","button")
                    .html("Submit")
                    .on("click",function(){
                        $(".alert").hide();
                        var flag = true;
                        var data = {};
                        d3.selectAll(".cinput").each(function(){
                            var input = d3.select(this);
                            var value = input.node().value;
                            if(value=="") 
                            {
                                flag = false;
                                input.style("background-color","rgb(247, 212, 222)");
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
                            unfinishCallback();
                            return;
                        }

                        submitCallback(data);
                    });
        });
    }

    disableSubmitButton()
    {
        $("#"+this.btnSubmitID).attr("disabled",true);    
    }

    enableSubmitButton()
    {
        $("#"+this.btnSubmitID).attr("disabled",false);    
    }

}

function initComponent()
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


    $(".alert").click(function(){
        $(this).hide(); 
    })
}

initComponent();

var form = new dynamicForm(dataConfig,"selectionForm","mainForm", submitData, unfinish);

//d3.selectAll(".mainContainer").classed("hidden",true);
//d3.select("#formContainer").classed("hidden",false);
