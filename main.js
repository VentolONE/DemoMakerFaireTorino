(function() {
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

  var mediumLine = d3.svg.line()
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

  var size = 150,
    db = new VouchDB('http://jsbin.com/dukom/1.json', {
      loc: 1
    }),
    $xAxis = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")"),
    $yAxis = svg.append("g")
      .attr("class", "y axis"),
    $line = svg.append("path")
      .attr("class", "line"),
    $line2 = svg.append("path")
      .attr("class", "line2"),
    $mediumLine = svg.append("path")
      .attr("class", "mediumLine"),
    since,
    transform = function(data) {
      console.log('transform')
      return data.results.map(function(d) {
        return d.doc
      })
    },
    setSince = function(res) {
      since = res.last_seq
      return res
    },

    $yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value")

    function changes(_since) {
      console.log('changes')
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
      console.log('info')
      return info.update_seq
    }).then(changes)
    .then(transform)
    .then(function(startingData) {
      var buffer = startingData.slice(),
        chartData = [];

      function loadData() {
        if (buffer.length < 2 * size) {
          changes(since)
            .then(transform)
            .then(function(data) {
              buffer.push.apply(buffer, data)
            })
        }
      }

      setInterval(loadData, 5000)

      setInterval(function() {
        if (buffer.length > 0) {
          chartData.push(buffer.shift())
        }
        console.log(buffer.length)
        updateChart(chartData)
      }, 1000)
    })

  function updateChart(data) {
    if (data.length > size) {
      data.shift()
    }
    if (data.length < 2) {
      return
    }

    var xDomain = d3.extent(data, function(d) {
      return new Date(parseInt(d._id));
    })

    y.domain(d3.extent(data, function(d) {
      return d.value;
    }));

    x.domain(xDomain);

    $xAxis.call(xAxis);
    $yAxis.call(yAxis);

    $line
      .datum(data)
      .attr("d", line);

    $line2
      .datum(data)
      .attr("d", line2);

    var mean = d3.mean(data, function(d) {
      return d.value
    })

    $mediumLine
      .datum(xDomain.map(function(_id) {
        return {
          _id: _id.getTime().toString(),
          value: mean
        }
      }))
      .attr("d", mediumLine)

    return data
  }

})();
