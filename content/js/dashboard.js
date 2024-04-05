/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.925, "KoPercent": 0.075};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6865625, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.437, 500, 1500, "myABstream Performance"], "isController": false}, {"data": [0.2745, 500, 1500, "myABconnect Performance"], "isController": false}, {"data": [0.4725, 500, 1500, "myABconnect Performance-1"], "isController": false}, {"data": [0.9015, 500, 1500, "myABconnect Performance-0"], "isController": false}, {"data": [0.9105, 500, 1500, "myABstream Performance-1"], "isController": false}, {"data": [0.643, 500, 1500, "myABstream Performance-0"], "isController": false}, {"data": [0.9525, 500, 1500, "myABconnect Performance-2"], "isController": false}, {"data": [0.901, 500, 1500, "myMBS Performance"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8000, 6, 0.075, 773.99725, 3, 12329, 528.0, 1471.7000000000016, 1884.9499999999998, 3973.909999999998, 26.600785388188587, 103.28412153400079, 4.663196909404375], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["myABstream Performance", 1000, 0, 0.0, 1139.7770000000016, 509, 11307, 963.5, 1619.9, 2166.8999999999996, 4406.450000000002, 3.3254520120647397, 24.275150185726496, 0.8638381203215046], "isController": false}, {"data": ["myABconnect Performance", 1000, 3, 0.3, 1741.9849999999992, 913, 12329, 1410.0, 2555.0, 3328.6499999999996, 7060.390000000004, 3.325750621915366, 25.869507107129078, 1.2813915782432719], "isController": false}, {"data": ["myABconnect Performance-1", 1000, 0, 0.0, 933.634999999999, 400, 11787, 746.0, 1500.0, 1822.6499999999996, 4200.9400000000005, 3.3377948524527783, 2.1545726537805536, 0.4139647912709989], "isController": false}, {"data": ["myABconnect Performance-0", 1000, 0, 0.0, 450.2180000000002, 87, 7206, 314.0, 804.9, 1302.249999999999, 3314.94, 3.334444814938313, 1.494638837945982, 0.37447378292764255], "isController": false}, {"data": ["myABstream Performance-1", 1000, 0, 0.0, 470.69599999999986, 154, 10647, 432.0, 662.9, 866.8499999999998, 1354.5900000000013, 3.3397010299637975, 22.099427909213567, 0.4761683109128071], "isController": false}, {"data": ["myABstream Performance-0", 1000, 0, 0.0, 669.0860000000006, 209, 7490, 524.0, 1013.4999999999999, 1445.85, 3520.99, 3.330336030905518, 2.2733446148466383, 0.39027375362174044], "isController": false}, {"data": ["myABconnect Performance-2", 1000, 3, 0.3, 357.7189999999999, 3, 6027, 300.0, 465.4999999999999, 637.8999999999999, 1052.010000000001, 3.371612372468762, 22.538543851190518, 0.5022550028405834], "isController": false}, {"data": ["myMBS Performance", 1000, 0, 0.0, 428.86200000000025, 90, 7885, 282.0, 709.8, 1264.3999999999992, 3369.79, 3.3351899223901307, 3.0192588457574714, 0.3745574619871728], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: myabconnect.abnigeria.com:443 failed to respond", 6, 100.0, 0.075], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8000, 6, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: myabconnect.abnigeria.com:443 failed to respond", 6, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["myABconnect Performance", 1000, 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: myabconnect.abnigeria.com:443 failed to respond", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["myABconnect Performance-2", 1000, 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: myabconnect.abnigeria.com:443 failed to respond", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
