var defaultColors = [
    "#4682B4",
    "#27C143",
    "#C15E3A",
    "#9105CB",
];

function createColorButton(parentNode, criterionName, bindID, colorIndex, styleName)
{
    var node = parentNode.append("div")
        .style("float","left")
        .style("width","180px")
        .style("margin-left","20px");

    node.append("button")
        .style("background",defaultColors[colorIndex])
        .attr("class","colorPie")
        .attr("targID",bindID)
        .attr("colorIndex",colorIndex)
        .on("click",function(){
            var targID = d3.select(this).attr("targID");
            var index = d3.select(this).attr("colorIndex");
            index = (+index+1)%defaultColors.length;
            d3.select(this).attr("colorIndex",index);
            d3.select("#"+targID)
                .style(styleName,defaultColors[index]);
            d3.select(this) 
                .style("background",defaultColors[index]);
        });

    node.append("div")
        .attr("class","criterionLabel")
        .attr("targ",criterionName)
        .html(criterionName);

    return defaultColors[colorIndex];

}

class KeyNameMap
{
    constructor()
    {
        this.map = []; 
    }

    set(key,name)
    {
        this.map[key] = name;
    }

    getNames(key)
    {
        var res = [];
        var map = this.map;
        key.forEach(function(k){
            res.push(map[k]);
        });

        return res;
    }
}


var keyNameMap = new KeyNameMap();

class CriteriaLine{

    constructor(name, criteria, upperBound)
    {
        var n = criteria.length;
        if(n==0)
            return;

        var svgClassName = "line-"+name;
        var divID = "lineDiv-"+name;

        var svgHeight = 250;
        var containerHeight = svgHeight+80;

        var div = d3.select("#lineContainer")
          .append("div")
            .attr("class", "panelContainer")
            .attr("id",divID)
            .style("height",containerHeight+"px");

        div.append("span")
            .attr("class","blockHeader")
            .html(name);

        var svg = div.append("svg")
            .attr("class","svg")
            .attr("width",700)
            .attr("height",svgHeight),
            margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        var x = d3.scaleLinear()
            .rangeRound([width, 0]);
        
        var y = d3.scaleLinear()
            .rangeRound([height, 0]);
        
        var line = d3.line()
            .x(function(d) { return x(d.step); })
            .y(function(d) { return y(d.value); });
        
        x.domain([10,0]);
        y.domain([0,upperBound]);

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
          .append("text")
            .attr("fill", "#000")
            .attr("y", 20)
            .attr("x", width+10)
            .attr("dy", "0.71em")
            .style("text-anchor", "end")
            .text("Second");

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y))
          .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .style("text-anchor", "end")
            .text(name);

        for(var i = 0; i<n; ++i)
            g.append("path")
                .datum([])
                .attr("id",this.getID(criteria[i]))
                .attr("class", "line "+svgClassName)
                .attr("d", line)
                .style("stroke",function(d){
                    var id = d3.select(this).attr("id");
                    createColorButton(div, criteria[i], id, i, "stroke");
                    return defaultColors[i]; 
                });
    

        this.dlist = new Array();
        for(var i = 0; i<n; ++i)
            this.dlist.push([{"step":0,"value":0}]);
            //this.dlist.push([]);
        this.g = g;
        this.svgClassName = svgClassName;
        this.criteria = criteria;
        this.line = line;
    }

    getID(c)
    {
        //convert hierachy to string
        var cs = c.split(",");
        var str = "";
        cs.forEach(function(x){
            str += "-"+x; 
        });
        return "line"+str; 
    }

    extractData(data)
    {
        var res = new Array();
        this.criteria.forEach(function(c){
            var cs = c.split(",");
            var expr = "data";
            cs.forEach(function(key){expr += '["'+key+'"]'});
            res.push(eval(expr)); 
        })
        return res;
    }

    update(meta)
    {
        var line = this.line;
        var data = this.extractData(meta);
        for(var i = 0; i<this.criteria.length; ++i)
        {
            if(this.dlist[i].length>10)
                 this.dlist[i].pop();

             this.dlist[i].forEach(function(d){
                 d.step += 1;
             });
             this.dlist[i].unshift({"step":0,"value":data[i]});
             this.g.select("#"+this.getID(this.criteria[i]))
                 .attr("d", line(this.dlist[i]));

        
        }
    }

    updateLabel()
    {
        //empty because nothing to do for line chart
    }

}

class CriteriaBar{

    constructor(name, criteria, upperBound)
    {
        var n = criteria.length;
        if(n==0)
            return;

        criteria.forEach(function(c){
            keyNameMap.set(c,c);
        });
    
        var svgClassName = "barSvg-"+name;
        var divID = "barDiv-"+name;

        var svgHeight = 40*n+20;
        var containerHeight = svgHeight+80;

        var div = d3.select("#barContainer")
          .append("div")
            .attr("class", "panelContainer")
            .attr("id",divID)
            .style("height",containerHeight+"px");

        div.append("span")
            .attr("class","blockHeader")
            .html(name);

        var svg = div.append("svg")
            .attr("width",700)
            .attr("height",svgHeight)
            .attr("class","svg"),
            margin = {top: 0, right: 20, bottom: 20, left: 150},
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom;
    
        var y = d3.scaleBand().rangeRound([0, height]).padding(0.2);
        var x = d3.scaleLinear().rangeRound([0, width]);
        
        var g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        x.domain([0, upperBound]);
        y.domain(criteria);
        
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        
        g.append("g")
            .attr("class", "axis axis--y")
            .attr("transform", "translate(-1, 0)")
            .call(d3.axisLeft(y))
        

        var getID = this.getID;


        g.selectAll(".bar ."+svgClassName)
          .data(criteria)
          //.data(keyNameMap.getNames(criteria))
          .enter().append("rect")
            .attr("class", "bar "+svgClassName)
            .attr("x", function(d) {return 0;})
            .attr("y", function(d,i) {return y(d); })
            .attr("height", 25)
            .attr("width", function(d) { return  x(0); })
            .attr("id", function(d,i) {
                var id = getID(criteria[i]);
                return id;
            })
            .style("fill",function(d,i){
                var id = d3.select(this).attr("id");
                createColorButton(div, criteria[i], id, i, "fill");
                return defaultColors[i]; 
            });

        this.g = g;
        this.svgClassName = svgClassName;
        this.x = x;
        this.y = y;
        this.criteria = criteria;
    }

    updateLabel()
    {
        this.y.domain(keyNameMap.getNames(this.criteria));
        this.g.select(".axis--y")
            .call(d3.axisLeft(this.y))
    }

    extractData(data)
    {
        var res = new Array();
        this.criteria.forEach(function(c){
            var cs = c.split(",");
            var expr = "data";
            cs.forEach(function(key){expr += '["'+key+'"]'});
            res.push(eval(expr)); 
        })
        return res;
    }

    update(meta)
    {
        var x = this.x;
        var data = this.extractData(meta);
        //print(data);
        this.g.selectAll("."+this.svgClassName)
          .data(data) 
          .transition()
          .duration(300)
          .attr("width", function(d) { return x(d); });
    }

    getID(c)
    {
        var cs = c.split(",");
        var str = "";
        cs.forEach(function(x){
            str += "-"+x; 
        });
        return "bar"+str; 
    }

}

class Controler
{
    constructor()
    {
        this.list = new Array(); 
        this.auto = true;
    }

    add(handler)
    {
        this.list.push(handler); 
    }

    update(data)
    {
        this.unlightError();
        this.list.forEach(function(h){
            h.update(data); 
        }); 
    }

    updateLabel()
    {
        this.list.forEach(function(h){
            h.updateLabel(); 
        }); 
    }

    unlightError()
    {
        d3.select("#errorLight")
            .transition()
            .duration(200)
            .style("background-color","#4a0000");
    }

    lightError()
    {
        d3.select("#errorLight")
            .transition()
            .duration(200)
            .style("background-color","red");
    }

    alertError()
    {
        this.lightError();
    }

}

var controler = new Controler();

function init()
{
    controler.add(new CriteriaBar("CPU",["cpu_usage"],1));
    controler.add(new CriteriaBar("Memory",["memory_usage","memory_available"],40000));
    controler.add(new CriteriaBar("Network-Throughput",["network_throughput,in","network_throughput,out"],20000));
    controler.add(new CriteriaBar("Network-Packet",["network_packet,in","network_packet,out"],1000));
    
    controler.add(new CriteriaLine("CPU",["cpu_usage"],1));
    controler.add(new CriteriaLine("Memory",["memory_usage","memory_available"],40000));
    controler.add(new CriteriaLine("Network-Throughput",["network_throughput,in","network_throughput,out"],20000));
    controler.add(new CriteriaLine("Network-Packet",["network_packet,in","network_packet,out"],1000));
    
    
    d3.selectAll("span")
        .attr("contenteditable","true");
    d3.selectAll(".criterionLabel")
        .attr("contenteditable","true")
        .on("focusout",function(){
            var key = d3.select(this).attr("targ");
            var name = d3.select(this).html();
            keyNameMap.set(key,name);
            controler.updateLabel();
        });
}



