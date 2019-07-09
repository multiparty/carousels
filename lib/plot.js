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

var size = 100;

function linspace(start, end, step){
  var x = [];
  for(var j = start; j <= end; j+=step)
    x.push(j);
  return x;
}

function transpose(matrix){
  return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

function parse_values (bbl_result){

  var keys = Object.keys(bbl_result);
  var p =  [];
  var names = [];
  var num_terms = 0;

  for(var i =0; i < keys.length; i++){
    var temp = carousels.parsePoly(bbl_result[keys[i]]);
    p.push(temp);

    var len = (Object.keys(temp.terms)[0].replace(',','')).length;
    num_terms = (num_terms < len)? len: num_terms;
    names.push(keys[i]);
  }

  return [p , names, num_terms];
}


function compute_values(p, num_terms){
  var ran = linspace(1,size,1);
  var results = [];

  for(var j = 0; j < p.length; j++){
    var res = [];
    for(var i = 1; i <= size; i++){
        res[i-1] = ran.map(function (b){ return polynomium.evaluate(p[j], {"b": b, "n": i});}); // rows n columns b
      if(num_terms <=1){
        res = res[0];
        i = size+1;
      }
    }
    results.push(res);
  }
  return results;
}


function plot3d(op_name, names, results){
  var len = results.length;
  var traces = [];

  for(var i = 0; i < len; i++){
    var data = {
               z: results[i],
               colorscale: plotly_colorscale[i],
               name: names[i],
               type: 'surface'
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
        text: '# of bits exchanges',
        font: {
          family: 'Open Sans',
          size: 18,
          color: '#7f7f7f'
        }
      },
    },
    yaxis: {
      title: {
        text: '# of parties',
        font: {
          family: 'Open Sans',
          size: 18,
          color: '#7f7f7f'
        }
      },
    },
    zaxis: {
      title: {
        text:  op_name,
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





function plot2d(op_name, names, results){
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
        text: '# of bits exchanges',
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


function plotslider(op_name, names, results, fixed_param, var_param){

  var num_func = names.length;
  var matrix_len = results[0].length;

  var traces = [];
  for (i = 0; i < num_func; i++) {
    var data = results[i][0];
    traces.push({
      name: names[i],
      type: 'scatter',
      visible: true,
      y: data,
    });
  }

  for(var j = 1; j < matrix_len; j++){
    for(var i =0; i< num_func; i++ ){
      var data = results[i][j];

      traces.push({
        name: names[i],
        type: 'scatter',
        visible: false,
        y: data,
      });
    }
  }

  var sliderSteps = [];
  var visibility = [];
  for(var i = 0; i < matrix_len; i++){
    visibility[i] = Array(matrix_len*2).fill(false);
    var j = i *2;
    visibility[i][j] = true;
    visibility[i][j+1] = true;
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
      range: [0, 25],
      title: var_param,
    },
    yaxis: {
      range: [0, size*3],
      title: op_name,
    },
    sliders: [{
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
