function DemoChart(options) {
  var innerWidth = options.width - options.margin.left - options.margin.right,
    innerHeight = options.height - options.margin.top - options.margin.bottom,

    x = d3.time.scale()
      .range([0, innerWidth]),
    y = d3.scale.linear()
      .range([innerHeight, 0]),
    xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom"),
    yAxis = d3.svg.axis()
      .scale(y)
      .orient("left"),

    line = d3.svg.line()
      .x(function(d) {
        return x(new Date(parseInt(d._id)));
      })
      .y(function(d) {
        return y(d[options.field]);
      }).interpolate("basis"),
    line2 = d3.svg.line()
      .x(function(d) {
        return x(new Date(parseInt(d._id)));
      })
      .y(function(d) {
        return y(d[options.field]);
      }),
    mediumLine = d3.svg.line()
      .x(function(d) {
        return x(new Date(parseInt(d._id)));
      })
      .y(function(d) {
        return y(d[options.field]);
      }),

    svg = d3.select("body").append("svg")
      .attr("width", innerWidth + options.margin.left + options.margin.right)
      .attr("height", innerHeight + options.margin.top + options.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")"),

    db = new options.adapter(options.url, {
      loc: 1
    }),

    $xAxis = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + innerHeight + ")"),
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
      return data.results.map(function(d) {
        return d.doc
      })
    },
    setSince = function(res) {
      since = res.last_seq
      return res
    };

  svg
    .append("text")
    .text(options.title)
    .attr("transform", "translate(50,0)");

  $yAxis.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text(options.label)

  function changes(_since) {
    return db.changes({
      include_docs: true,
      since: _since,
      limit: options.size
    }).then(function(res) {
      since = res.last_seq
      return res
    })
  }

  db.info()
    .then(function(info) {
      console.log(options.field, info)
      return info.update_seq
    }).then(changes)
    .then(transform)
    .then(function(startingData) {
      var buffer = startingData.slice(),
        chartData = [];

      function loadData() {
        if (buffer.length < 2 * options.size) {
          changes(since)
            .then(transform)
            .then(function(data) {
              buffer.push.apply(buffer, data)
            })
        }
      }

      setTimeout(loadData, options.delay || 0)
      setInterval(loadData, options.interval)

      setInterval(function() {
        if (buffer.length > 0) {
          chartData.push(buffer.shift())
        }
        updateChart(chartData)
      }, 1000)
    })

  function updateChart(data) {
    if (data.length > options.size) {
      data.shift()
    }
    if (data.length < 2) {
      return
    }

    var xDomain = d3.extent(data, function(d) {
      return new Date(parseInt(d._id));
    })

    y.domain(d3.extent(data, function(d) {
      return d[options.field];
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
      return d[options.field]
    })

    $mediumLine
      .datum(xDomain.map(function(_id) {
        var obj = {
          _id: _id.getTime().toString(),
        }
        obj[options.field] = mean
        return obj
      }))
      .attr("d", mediumLine)

    return data
  }

}
