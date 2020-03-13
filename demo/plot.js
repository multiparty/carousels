var plotly_colorscale = ['Blackbody',
'YlGnBu',
'Greys',
'Earth',
'Bluered',
'Electric',
'Blues',
'Hot',
'Jet',
'Rainbow',
'Picnic',
'Portland',
'RdBu',
'Greens',
'Reds',
'Viridis',
'YlOrRd'];

var size = 15; //actual number of points used for plotting (the range changer only magnifies the range)

function linspace(start, end, step){
  var x = [];
  for(var j = start; j <= end; j+=step)
    x.push(j);
  return x;
}

function compute_values(context, expressions){
  var ran = linspace(1,size,1);
  var results = [];

  for(var j = 0; j < p.length; j++) {
    var res = [];
    for(var i = 1; i <= size; i++) {
        // res[i-1] = ran.map(function (b){evaluate(p[j], {"b": b, param + "=" + i});}); // rows n columns b
      if(num_terms <=1){
        res = res[0];
        i = size+1;
      }
    }
    results.push(res);
  }
  return results;
}

function plot2d(op_name, names, results){
  // console.log(op_name, names, results);
  var len = results.length;
  var traces = [];

  for(var i = 0; i < len; i++){
    var data = {
               y: results[i],
               name: names[i],
               fill: 'tonexty',
               type: 'scatter'
            };
    traces.push(data);
  }

  var layout = {
    title: {
      text:'Cost Analysis',
      font: {
        family: 'Open Sans',
        size: 24
      },
      xref: 'paper',
      x: 0.05,
    },
    xaxis: {
      title: {
        text: '# of bits',
        font: {
          family: 'Open Sans',
          size: 18,
          color: '#7f7f7f'
        }
      },
    },
    yaxis: {
      title: {
        text: op_name,
        font: {
          family: 'Open Sans',
          size: 18,
          color: '#7f7f7f'
        }
      }
    }
  };

  Plotly.newPlot('myPlot', traces, layout);
}


function plotslider(op_name, names, var_param, fixed_param, results) {
  [_, names, _, fixed_param, results] = JSON.parse('["onlineMsg",["index_check_$answers","binary_check_$answers","row_col_check_$answers"],[[],[],[]],"# of bits: ","# of tiles (board width)"]');

  var num_func = names.length;
  var matrix_len = results[0].length;
  var traces = [];

  for (i = 0; i < num_func; i++) {
    var data = results[i][0];
    traces.push({
      name: names[i],
      fill: 'tonexty',
      type: 'scatter',
      visible: true,
      y: data,
    });
  }

  for(var i = 1; i < matrix_len; i++){
    for(var j =0; j< num_func; j++ ){
      var data = results[j][i];

      traces.push({
        name: names[j],
        fill: 'tonexty',
        type: 'scatter',
        visible: false,
        y: data,
      });
    }
  }

  var sliderSteps = [];
  var visibility = [];

  for(var i = 0; i < matrix_len; i ++){
    visibility[i] = Array(matrix_len*num_func).fill(false);
    for(var j = 0; j < num_func; j++){
      visibility[i][j+i*num_func] = true;
    }
  }

  for (var i = 0; i < matrix_len; i++) {
    sliderSteps.push({
      label: i.toString(),
      method: 'restyle',
      args: ['visible', visibility[i]]
    });
  }

  var layout = {
    xaxis: {
      title: var_param,
      font: {
        family: 'Open Sans',
        size: 18,
        color: '#7f7f7f'
      }
    },
    yaxis: {
      title: op_name,
      font: {
        family: 'Open Sans',
        size: 18,
        color: '#7f7f7f'
      }
    },
    sliders: [{
      pad: {t: 70},
      currentvalue: {
        visible: true,
        prefix: fixed_param,
        xanchor: 'right',
        font: {size: 20, color: '#666'}
      },
      steps: sliderSteps
    }],
  };

  // Create the plot:
  Plotly.plot('myPlot', {
    data: traces,
    layout: layout
  });
}