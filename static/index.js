// Reference to the dropdown select tag
function getOptions() {
    var selector = document.getElementById("selDataset");
    Plotly.d3.json("/names", function(error, sampleNames){
        for (var i=0; i < sampleNames.length; i++) {
            var currentOption = document.createElement("option");
            currentOption.text = sampleNames[i];
            currentOption.value = sampleNames[i];
            selector.appendChild(currentOption);
        }
        getData(sampleNames[0], buildCharts);
    })
}

// Get data from Flask routes
function getData(sample, callback) {
    Plotly.d3.json(`/samples/${sample}`, function(error, sampleData) {
        if (error) return console.warn(error);
        Plotly.d3.json("otu", function(error, otuData){
            if (error) return console.warn(error);
            callback(sampleData, otuData);
        })
    })
    Plotly.d3.json(`/metadata/${sample}`, function(error, metaData) {
        if (error) return console.warn(error);
        updateMetaData(metaData);
    }) 
}

// Create function to build visualization charts
function buildCharts(sampleData, otuData) {
    var labels = sampleData[0]["otu_ids"].map(function(item) {
        return otuData[item]
    });

    var trace1 = {
        x: sampleData[0]["otu_ids"],
        y: sampleData[0]["sample_values"],
        text: labels,
        mode: "markers",
        marker: {
            size: sampleData[0]["sample_values"],
            color: sampleData[0]["otu_ids"],
            colorscale: "Earth"
        }
    };

    var data = [trace1];

    var layout = {
        margin: {t: 0},
        hovermode: "closest",
        xaxis: {title: "OTU ID"}
    };

    var BUBBLE = document.getElementById("bubble");

    Plotly.plot(BUBBLE, data, layout);

    
    var trace2 = {
        labels: sampleData[0]["otu_ids"].slice(0, 10),
        values: sampleData[0]["sample_values"].slice(0, 10),
        hovermode: "closest",
        textinfo: "percent",
        text: labels.slice(0, 10),
        type: "pie"
    }

    var pieData = [trace2];

    var pieLayout = {
        margin: {t: 0, l: 0},
        height: 400,
        width: 500,
    }

    var PIE = document.getElementById("pie");

    Plotly.plot(PIE, pieData, pieLayout);
}


function optionsChanged(newSample) {
    getData(newSample, updateCharts);
}


function updateCharts(sampleData, otuData) {
    var sampleValues = sampleData[0]["sample_values"];
    var otuIDs = sampleData[0]["otu_ids"];
    var BUBBLE = document.getElementById("bubble");

    var labels = otuIDs.map(function(item) {
        return otuData[item]
    });

    Plotly.restyle(BUBBLE, "x", [otuIDs]);
    Plotly.restyle(BUBBLE, "y", [sampleValues]);
    Plotly.restyle(BUBBLE, "text", [labels]);
    Plotly.restyle(BUBBLE, "marker.size", [sampleValues]);
    Plotly.restyle(BUBBLE, "marker.color", [otuIDs]);

    var PIE = document.getElementById("pie");

    var pieUpdate = {
        values: [sampleValues.slice(0, 10)],
        labels: [otuIDs.slice(0, 10)],
        hovermode: "closest",
        textinfo: "percent",
        text: [labels.slice(0, 10)],
        type: "pie"
    };
    
    Plotly.restyle(PIE, pieUpdate);
}

// Build updateMetaData function

function updateMetaData(data) {
    var PANEL = document.getElementById("metadata");
    PANEL.innerHTML = "";
    for(var key in data) {
        panelTag = document.createElement("h6");
        panelText = document.createTextNode(`${key}: ${data[key]}`);
        panelTag.append(panelText);
        PANEL.appendChild(panelTag);       
    }
}

function init() {
    getOptions();
}

// Initializes functions
init();