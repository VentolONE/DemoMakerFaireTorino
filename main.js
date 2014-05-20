var margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 50
},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;


var x = d3.time.scale()
  .range([0, width]);

var y = d3.scale.linear()
  .range([height, 0]);

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

var line = d3.svg.line()
  .x(function(d) {
    return x(new Date(parseInt(d._id)));
  })
  .y(function(d) {
    return y(d.value);
  }).interpolate("basis")

var line2 = d3.svg.line()
  .x(function(d) {
    return x(new Date(parseInt(d._id)));
  })
  .y(function(d) {
    return y(d.value);
  })

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

y.domain([0, 1000]);


var size = 50,
  db = new PouchDB("http://localhost:5984/makerfaire"),
  $xAxis = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")"),
  $yAxis = svg.append("g")
    .attr("class", "y axis"),
  $line = svg.append("path")
    .attr("class", "line"),
  $line2 = svg.append("path")
    .attr("class", "line2"),
  since,
  transform = function(data) {
    return data.results.map(function(d) {
      return d.doc
    })
  }


$yAxis.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Value")

function changes(_since) {
  return db.changes({
    include_docs: true,
    since: _since,
    limit: size
  }).then(function(res) {
    since = res.last_seq
    return res
  })
}

db.info()
  .then(function(info) {
    return Math.max(info.update_seq - size * 2, 0)
  }).then(changes)
  .then(transform)
  .then(updateChart)
  .then(function(startingData) {
    var buffer = startingData.slice();

    function loadData() {
      if (buffer.length < 2 * size) {
        changes(since)
          .then(transform)
          .then(function(data) {
            buffer.push.apply(buffer, data)
          })
      }
    }

    loadData()
    setInterval(loadData, 1000)

    setInterval(function() {
      if (buffer.length -1 > size) {
        buffer.shift()
        updateChart(buffer.slice(0, size))
      }
    }, 300)
  })



function updateChart(data) {
  x.domain(d3.extent(data, function(d) {
    return new Date(parseInt(d._id));
  }));

  $xAxis.call(xAxis);
  $yAxis.call(yAxis)

  $line
    .datum(data)
    .attr("d", line);

  $line2
    .datum(data)
    .attr("d", line2);
  return data
}

// setInterval(function() {
//   db.query('stats').then(function(data) {
//     return data.rows[0].value
//   }).then(function(data) {
//     console.log(data)
//   })
// }, 1000)
