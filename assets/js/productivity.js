/********************************************************** PRODUCTIVITY PAGE **********************************************************/

"use strict";

// graph element variables
var no_of_cycles_element = document.getElementById('no_of_cycles');
var avg_cycle_time_element = document.getElementById('avg_cycle_time');
var cycle_time_breakdown_element = document.getElementById('cycle_time_breakdown');
var sub_activity_element = document.getElementById('sub_activity');

// graph settings
var config = {responsive: true};

// initialize graphs
let primemover_id = document.getElementById('unit_id').value;
let cycle_time_analysis_primemover_id = document.getElementById('cycle_time_analysis_unit_id').value;
initialize_graphs(primemover_id, cycle_time_analysis_primemover_id);

// function to initialize graphs
async function initialize_graphs(primemover_id, cycle_time_analysis_primemover_id) {
  // get current date
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let currentDate = `${year}-${month}-${day}`;

  // data trace for bar charts
  var xValue = [currentDate];
  var yValue = [0];
  var trace1 = {
    x: xValue,
    y: yValue,
    type: 'bar',
    text: yValue.map(String),
    textposition: 'auto',
    hoverinfo: 'none',
    opacity: 0.8,
    marker: {
      color: 'rgb(57,27,102)',
      line: {
        color: 'rgb(57,27,102)',
        width: 1.5
      }
    }
  };
  var data = [trace1];

  // initialize no of cycles graph
  var layout = {
    title: {
      text: '<b>Loading Data...</b><br>' +
            "()",
    },
    yaxis: {
      title: {
        text: '<b>No. of Cycles</b>',
      }
    },
    plot_bgcolor: 'rgba(229,236,246,255)',
    shapes: [
      {
          type: 'line',
          xref: 'paper',
          x0: 0,
          y0: 10.0,
          x1: 1,
          y1: 10.0,
          line:{
              color: 'rgb(0, 0, 0)',
              width: 2,
              dash:'dash'
          }
      }
    ]
  };
  Plotly.newPlot(no_of_cycles_element, data, layout, config);

  // initialize avg cycle time graph
  var layout = {
    title: {
      text: '<b>Loading Data...</b><br>' +
            "()",
    },
    yaxis: {
      title: {
        text: '<b>Minutes</b>',
      }
    },
    plot_bgcolor: 'rgba(229,236,246,255)',
    shapes: [
      {
          type: 'line',
          xref: 'paper',
          x0: 0,
          y0: 60.0,
          x1: 1,
          y1: 60.0,
          line:{
              color: 'rgb(0, 0, 0)',
              width: 2,
              dash:'dash'
          }
      }
    ]
  };
  Plotly.newPlot(avg_cycle_time_element, data, layout, config);

  // initialize sub-activity graph
  var layout = {
    title: {
      text: '<b>Loading Data...</b><br>' +
            "()",
    },
    xaxis: {
      title: {
        text: '<b>Time</b>',
      }
    },
    yaxis: {
      title: {
        text: '<b>Minutes</b>',
      }
    },
    plot_bgcolor: 'rgba(229,236,246,255)',
    shapes: [
      {
          type: 'line',
          xref: 'paper',
          x0: 0,
          y0: 60.0,
          x1: 1,
          y1: 60.0,
          line:{
              color: 'rgb(0, 0, 0)',
              width: 2,
              dash:'dash'
          }
      }
    ]
  };
  Plotly.newPlot(sub_activity_element, data, layout, config);

  // data trace for waterfall chart
  var trace1 = {
    name: "Average Cycle Time Breakdown",
    type: "waterfall",
    orientation: "v",
    measure: [
        "relative",
        "relative",
        "total",
        "relative",
        "relative",
        "relative",
        "total"
    ],
    x: [
        "Travel Empty",
        "Stopped Empty",
        "Loading",
        "Travel Loaded",
        "Stopped Loaded",
        "Dumping",
        "Nett Cycle Time"
    ],
    textposition: "outside",
    text: [
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "Total"
    ],
    y: [
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ],
    connector: {
      line: {
        color: "rgb(63, 63, 63)"
      }
    },
  };
  var data = [trace1];

  // initialize cycle time breakdown graph
  var layout = {
    title: {
      text: '<b>Loading Data...</b><br>' +
            "()",
    },
    yaxis: {
      title: {
        text: '<b>Minutes</b>',
      }
    },
    plot_bgcolor: 'rgba(229,236,246,255)'
  };
  Plotly.newPlot(cycle_time_breakdown_element, data, layout, config);

  // fetch latest 7 available dates for daily summary graphs
  let unit_id = String(primemover_id);
  let url = "https://d7jzoht5xl.execute-api.ap-southeast-1.amazonaws.com/doubleSDT/productivity/get-dates?primemover_id=" + unit_id;
  const response = await fetch(url);
  var data = await response.json();
  var last_seven_dates = data.date.slice(-7);
  var date_from = last_seven_dates[0];
  var date_to = last_seven_dates[last_seven_dates.length-1];

  // set date selection based on latest 7 available dates
  document.getElementById('date_from').value = date_from;
  document.getElementById('date_to').value = date_to;

  // fetch latest available data for cycle time analysis graphs
  let cycle_time_analysis_unit_id = String(cycle_time_analysis_primemover_id);
  let url2 = "https://d7jzoht5xl.execute-api.ap-southeast-1.amazonaws.com/doubleSDT/productivity/get-dates?primemover_id=" + cycle_time_analysis_unit_id;
  const response2 = await fetch(url2);
  var data2 = await response2.json();
  var cycle_time_analysis_date = data2.date[data2.date.length-1];

  // set date selection based on latest available date
  document.getElementById('cycle_time_analysis_date').value = cycle_time_analysis_date;
  var sub_activity = document.getElementById('cycle_time_analysis_sub_activity').value;

  update_daily_summary(primemover_id, date_from, date_to);
  update_cycle_time_analysis(cycle_time_analysis_primemover_id, cycle_time_analysis_date, sub_activity);
}

/********************************************************** daily summary graphs **********************************************************/

// function & event listener for daily summary filters
document.getElementById("apply_daily_summary").addEventListener("click", update_daily_summary_graphs);
function update_daily_summary_graphs() {
  let primemover_id = document.getElementById('unit_id').value;
  let date_from = document.getElementById('date_from').value;
  let date_to = document.getElementById('date_to').value;
  update_daily_summary(primemover_id, date_from, date_to);
}

// function to update daily summary graphs
function update_daily_summary(primemover_id, date_from, date_to) {
  update_no_of_cycles(primemover_id, date_from, date_to);
  update_avg_cycle_time(primemover_id, date_from, date_to);
}

// function to update no of cycles graph
async function update_no_of_cycles(primemover_id, date_from, date_to) {
  // fetch no of cycles data
  let url = "https://d7jzoht5xl.execute-api.ap-southeast-1.amazonaws.com/doubleSDT/productivity/get-cyclecount?" +
            "primemover_id=" + String(primemover_id) +
            "&start_date=" + String(date_from) +
            "&end_date=" + String(date_to);
  const response = await fetch(url);
  var data = await response.json();

  // update data trace
  var xValue = data.date;
  var yValue = data.cycle_count.map(function (x) {
    return parseInt(x, 10);
  });
  const colors = yValue.map(function(x) {
    if (x < 10) {
      return 'rgb(255,0,0)'
    } else {
      return 'rgb(0,128,0)'
    }
  });
  var trace1 = {
    x: xValue,
    y: yValue,
    type: 'bar',
    text: yValue.map(String),
    textposition: 'auto',
    opacity: 0.8,
    marker: {
      color: colors,
      line: {
        color: colors,
        width: 1.5
      }
    }
  };
  var data_update = [trace1];

  // update graph
  let unit_id = document.getElementById('unit_id').options[document.getElementById('unit_id').selectedIndex].text;
  var layout = {
    title: {
      text: '<b>Total No. of Cycles</b><br>' +
            "(" + unit_id + ', ' + date_from + " to " + date_to + ")",
    },
    yaxis: {
      title: {
        text: '<b>No. of Cycles</b>',
      }
    },
    plot_bgcolor: 'rgba(229,236,246,255)',
    shapes: [
      {
          type: 'line',
          xref: 'paper',
          x0: 0,
          y0: 10.0,
          x1: 1,
          y1: 10.0,
          line:{
              color: 'rgb(0, 0, 0)',
              width: 2,
              dash:'dash'
          }
      }
    ]
  };
  Plotly.react(no_of_cycles_element, data_update, layout);
}

// function to update avg cycle time graph
async function update_avg_cycle_time(primemover_id, date_from, date_to) {
  // fetch no of cycles data
  let url = "https://d7jzoht5xl.execute-api.ap-southeast-1.amazonaws.com/doubleSDT/productivity/get-cycletimes?" +
            "primemover_id=" + String(primemover_id) +
            "&start_date=" + String(date_from) +
            "&end_date=" + String(date_to);
  const response = await fetch(url);
  var data = await response.json();

  // update data trace
  var xValue = data.date;
  var yValue = data.nett_cycle_time_avg.map(function (x) {
    return parseFloat(x);
  });
  const colors = yValue.map(function(x) {
    if (x > 60) {
      return 'rgb(255,0,0)'
    } else {
      return 'rgb(0,128,0)'
    }
  });
  var trace1 = {
    x: xValue,
    y: yValue,
    type: 'bar',
    text: yValue.map(String),
    textposition: 'auto',
    opacity: 0.8,
    marker: {
      color: colors,
      line: {
        color: colors,
        width: 1.5
      }
    }
  };
  var data_update = [trace1];

  // update graph
  let unit_id = document.getElementById('unit_id').options[document.getElementById('unit_id').selectedIndex].text;
  var layout = {
    title: {
      text: '<b>Average Cycle Time</b><br>' +
            "(" + unit_id + ', ' + date_from + " to " + date_to + ")",
    },
    yaxis: {
      title: {
        text: '<b>Minutes</b>',
      }
    },
    plot_bgcolor: 'rgba(229,236,246,255)',
    shapes: [
      {
          type: 'line',
          xref: 'paper',
          x0: 0,
          y0: 60.0,
          x1: 1,
          y1: 60.0,
          line:{
              color: 'rgb(0, 0, 0)',
              width: 2,
              dash:'dash'
          }
      }
    ]
  };
  Plotly.react(avg_cycle_time_element, data_update, layout);
}

/********************************************************** cycle time analysis graphs **********************************************************/

// function & event listener for daily summary filters
document.getElementById("apply_cycle_time_analysis").addEventListener("click", update_cycle_time_analysis_graphs);
function update_cycle_time_analysis_graphs() {
  let primemover_id = document.getElementById('cycle_time_analysis_unit_id').value;
  let date = document.getElementById('cycle_time_analysis_date').value;
  let sub_activity = document.getElementById('cycle_time_analysis_sub_activity').value;
  update_cycle_time_analysis(primemover_id, date, sub_activity);
}

// function to update cycle time analysis graphs
function update_cycle_time_analysis(primemover_id, date, sub_activity) {
  update_cycle_time_breakdown(primemover_id, date);
  update_sub_activity(primemover_id, date, sub_activity);
}

// function to update cycle time breakdown graph
async function update_cycle_time_breakdown(primemover_id, date) {
  // fetch no of cycles data
  let url = "https://d7jzoht5xl.execute-api.ap-southeast-1.amazonaws.com/doubleSDT/productivity/get-breakdown?" +
            "primemover_id=" + String(primemover_id) +
            "&date=" + String(date);
  const response = await fetch(url);
  var data = await response.json();

  // update data trace
  var trace1 = {
    name: "Average Cycle Time Breakdown",
    type: "waterfall",
    orientation: "v",
    measure: [
        "relative",
        "relative",
        "relative",
        "relative",
        "relative",
        "relative",
        "total"
    ],
    x: [
        "Travel Empty",
        "Stopped Empty",
        "Loading",
        "Travel Loaded",
        "Stopped Loaded",
        "Dumping",
        "Nett Cycle Time"
    ],
    textposition: "auto",
    text: [
      data.travel_empty_avg,
      data.stopped_empty_avg,
      data.loading_avg,
      data.travel_loaded_avg,
      data.stopped_loaded_avg,
      data.dumping_avg,
      data.nett_cycle_time_avg
    ],
    y: [
        parseFloat(data.travel_empty_avg),
        parseFloat(data.stopped_empty_avg),
        parseFloat(data.loading_avg),
        parseFloat(data.travel_loaded_avg),
        parseFloat(data.stopped_loaded_avg),
        parseFloat(data.dumping_avg),
        parseFloat(data.nett_cycle_time_avg)
    ],
    connector: {
      line: {
        color: "rgb(63, 63, 63)"
      }
    },
  };
  var data_update = [trace1];

  // update graph
  let unit_id = document.getElementById('cycle_time_analysis_unit_id').options[document.getElementById('cycle_time_analysis_unit_id').selectedIndex].text;
  var layout = {
    title: {
      text: '<b>Average Time by Sub-activity</b><br>' +
            "(" + unit_id + ', ' + date + ")",
    },
    yaxis: {
      title: {
        text: '<b>Minutes</b>',
      }
    },
    plot_bgcolor: 'rgba(229,236,246,255)'
  };
  Plotly.react(cycle_time_breakdown_element, data_update, layout);
}

// function to update sub activity graph
async function update_sub_activity(primemover_id, date, sub_activity) {
  // fetch no of cycles data
  let url = "https://d7jzoht5xl.execute-api.ap-southeast-1.amazonaws.com/doubleSDT/productivity/get-subactivity?" +
            "primemover_id=" + String(primemover_id) +
            "&date=" + String(date) +
            "&sub_activity=" + String(sub_activity);
  const response = await fetch(url);
  var data = await response.json();

  // determine thresholds
  if (sub_activity == 'Nett Cycle Time') {
    var threshold = 60;
  } else if (sub_activity == 'Travel Empty') {
    var threshold = 20;
  } else if (sub_activity == 'Travel Loaded') {
    var threshold = 25;
  } else if (sub_activity == 'Loading') {
    var threshold = 10;
  } else if (sub_activity == 'Dumping') {
    var threshold = 5;
  } else {
    var threshold = 0;
  }

  // update data trace
  var xValue = data.time;
  var yValue = data.cycle_times.map(function (x) {
    return parseFloat(x);
  });
  const colors = yValue.map(function(x) {
    if (x > threshold) {
      return 'rgb(255,0,0)'
    } else {
      return 'rgb(0,128,0)'
    }
  });
  var trace1 = {
    x: xValue,
    y: yValue,
    type: 'bar',
    text: yValue.map(String),
    textposition: 'auto',
    opacity: 0.8,
    marker: {
      color: colors,
      line: {
        color: colors,
        width: 1.5
      }
    }
  };
  var data_update = [trace1];

  // update graph
  let unit_id = document.getElementById('cycle_time_analysis_unit_id').options[document.getElementById('cycle_time_analysis_unit_id').selectedIndex].text;
  var layout = {
    title: {
      text: '<b>' + sub_activity + '</b><br>' +
            "(" + unit_id + ', ' + date + ")",
    },
    xaxis: {
      title: {
        text: '<b>Time</b>',
      }
    },
    yaxis: {
      title: {
        text: '<b>Minutes</b>',
      }
    },
    plot_bgcolor: 'rgba(229,236,246,255)',
    shapes: [
      {
          type: 'line',
          xref: 'paper',
          x0: 0,
          y0: threshold,
          x1: 1,
          y1: threshold,
          line:{
              color: 'rgb(0, 0, 0)',
              width: 2,
              dash:'dash'
          }
      }
    ]
  };
  Plotly.react(sub_activity_element, data_update, layout);
}