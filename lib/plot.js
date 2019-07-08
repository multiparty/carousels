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
