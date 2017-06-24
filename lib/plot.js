function getProb(storyTags, regression, month) {
  var wordsFly = [];

  for (var word in storyTags) {
    var randomProb = d3.randomUniform(0, 1)();
    var tag = storyTags[word];
    if (randomProb < regression[tag][month - 16]["y"]) {
      if (!wordsFly.includes(word)) {
        wordsFly.push(word);
        delete storyTags[word];
      }
    }
  }

  return wordsFly;
}

function plotRegression(wordData) {
  wordData = d3.nest()
    .key(function(d) {
      return d.tag;
    })
    .entries(wordData);

  var width = 700,
    height = 500;
  var svg = d3.select("#plot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  var tags = ["Noun", "Predicates", "Function Words", "Others"];

  var xScale = d3.scaleLinear().domain([16, 30]).range([60, width - 60]),
    yScale = d3.scaleLinear().domain([0, 1]).range([height - 60, 60]),
    tagScale = d3.scaleOrdinal().domain(tags).range(['#d53e4f', '#f46d43', '#abdda4', '#66c2a5']),
    modScale = d3.scaleLinear().domain(function(d) {
      return d3.extent()
    }).range([0, 1]);

  // add the x Axis
  svg.append("g")
    .attr("transform", "translate(0, " + (height - 60) + ")")
    .call(d3.axisBottom(xScale));
  svg.append("text")
    .text("Month")
    .attr("class", "labelText")
    .attr("transform", "translate(" + (width - 60) + ", " + (height - 30) + ")")
    .attr("style", "font-weight:bold; font-size:15px");

  // add the y Axis
  svg.append("g")
    .attr("transform", "translate(60,0)")
    .call(d3.axisLeft(yScale));
  svg.append("text")
    .text("Learned Prob")
    .attr("class", "labelText")
    .attr("transform", "rotate(-90, 60, 30), translate(0, -10)")
    .attr("style", "font-weight:bold; font-size:15px");

  function plotWord(tempWord) {
    var word = 0;
    tempWord.values.forEach(function(d) {
      var len = tempWord.values.length;
      for (var i = 16; i < 31; i++) {
        var x = xScale(i);
        var y = yScale(d[i]);
      }
      word += 1;
    });

    var data = [];
    tempWord.values.forEach(function(d) {
      for (var i = 16; i < 31; i++) {
        data.push([i, d[i]]);
      }
    });
    var result = regression('polynomial', data, 3);

    // sample data points on regression model
    var sample = [];
    for (var i = 16; i < 31; i++) {
      sample.push({
        "x": i,
        "y": result.equation[0] +
          result.equation[1] * i +
          result.equation[2] * i * i +
          result.equation[3] * i * i * i
      })
    }
    var line = d3.line()
      .x(function(d) {
        return xScale(d.x)
      })
      .y(function(d) {
        return yScale(d.y)
      });
    // plot regression model
    var func = svg.append("path")
      .attr("id", tempWord.key)
      .attr("d", function() {
        return line(sample);
      })
      .attr("stroke", function(d) {
        return tagScale(tempWord.key);
      })
      .attr("stroke-width", "5px")
      .attr("stroke-opacity", .7)
      .attr("fill", "none")
      .on("mouseover", function() {
        svg.append("text")
          .attr("id", "tag")
          .text(tempWord.key)
          .attr("transform", "translate(100,100)")
      })
      .on("mouseout", function() {
        d3.select("#tag").remove();
      });
    return sample;
  }

  var pathArray = {};
  var tags = ["Noun", "Predicates", "Function Words", "Others"];
  for (var i = 0; i < wordData.length; i++) {
    pathArray[tags[i]] = plotWord(wordData[i]);
  }

  return pathArray;

}