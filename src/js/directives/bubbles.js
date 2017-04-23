angular
  .module('houseBubble')
  .directive('bubbles', bubbles);

bubbles.$inject = [];
function bubbles() {

  return {
    restrict: 'EA',
    scope: {
      nodes: '=',
      userdata: '=',
      addProperty: '&',
      removeProperty: '&'

    },
    link: function(scope, element, attrs) {




      const  w = window.innerWidth,
             h = window.innerHeight - 50,
             damper = 0.6;

      let center = { x: w / 2, y: h / 2 };
      let force = null;
      let userNodes = null;

      const svg = d3.select(element[0]).append('svg');

      svg
        .attr('width', w)
        .attr('height', h);



      scope.$watch('nodes', () => {
        if(scope.nodes.length > 0) {

          const total = scope.nodes.reduce((value, d) => {
            return value + parseFloat(d.price);
          }, 0);

          const scaling = d3.scale.linear()
            .domain([0, Math.pow((total / 3.14), 0.5) * 6])
            .range([0, w]);

          const nodes = scope.nodes.map(function (d) {
            return {
                value: d.price,
                r: scaling(Math.pow((d.price / 3.14), 0.5)),
                PropertyType: d.property_type,
                Bedrooms: d.num_bedrooms,
                Bathrooms: d.num_bathrooms,
                Id: d.listing_id,
                County: d.county,
                StreetName: d.street_name,
                Description: d.description,
                PriceChange: d.price_change,
                NodeType: "search",
                centerPoint: { x: w * 0.4, y: h / 2 }
            };
          });

          // force = d3.layout.force()
          //   .nodes(nodes)
          //   .size([w, h])
          //   .charge( d => (- d.r * d.r * 1.25))
          //   .gravity(0.01)
          //   .friction(0.55);

          generate(nodes, 'search');
        }
      }, true);

      scope.$watch('userdata', () => {
        if(scope.userdata) {
          userNodes = scope.userdata.map(function (d) {
            return {
                value: d.price,
                r: w * 0.012,
                PropertyType: d.property_type,
                Bedrooms: d.num_bedrooms,
                Bathrooms: d.num_bathrooms,
                Id: d.listing_id,
                County: d.county,
                StreetName: d.street_name,
                Description: d.description,
                PriceChange: d.price_change,
                NodeType: "user",
                centerPoint: { x: w * 0.75 , y: h * 0.5 }
            };
          });

          // force = d3.layout.force()
          //   .nodes(userNodes)
          //   .size([w, h])
          //   .charge( d => (- d.r * d.r * 1.25))
          //   .gravity(0.01)
          //   .friction(0.55);
          console.log('scope.userdata', scope.userdata);
          generate(userNodes, 'user');
        }
      }, true);










      function generate(nodes, type) {

        console.log('userNodes', userNodes);
        console.log('nodes', nodes);

        // svg.selectAll('circle')
        //   .filter(function(d) {
        //     return d.NodeType === "search"; })
        //   .remove();

        svg.selectAll('circle').remove();

        if(nodes[0].NodeType === "search" && userNodes ) {
          nodes = nodes.concat(userNodes);
        }

        force = d3.layout.force()
          .nodes(nodes)
          .size([w, h])
          .charge( d => (- d.r * d.r * 1.25))
          .gravity(0.01)
          .friction(0.55);

        var fillColor = d3.scale.linear()
          .domain([200000,2000000])
          .range(["#1ff2ee","#000080"]);

        const node = svg.selectAll('circle')
          .filter(function(d) { return d.NodeType === type; })
          .data(force.nodes())
          .enter()
          .append('circle')
          .attr('opacity', '0.7')
          .attr('fill', d => (fillColor(d.value)))
          .attr('r', d => (d.r))
          .on('click', function (d) {
            if ( d.NodeType === "search") {
              scope.addProperty({ item: d });
              d.centerPoint = { x: w * 0.75, y: h * 0.5};
              d.NodeType = "user";
            } else {
              scope.removeProperty({ item: d });
              d.centerPoint = { x: w * 0.75, y: h + 100 };
            }
            moveBubbles();
          });

        // svg.selectAll('circle')
        // d3.select('body')
        // svg.selectAll('circle')
        //   // .append('svg:div')
        //   .insert('div', '#circle + *')
        //   // .attr('id', 'second');
        //   .attr('class', 'tooltip')
        //   .text('hello');
          // .append("svg")
          // .attr("width", 200)
          // .attr("height", 200);

        // svg.selectAll('circle')
        // d3.selectAll('circle')
        //   .append("svg")
        //   .attr("width", 200)
        //   .attr("height", 200);

        userNodes.forEach((house) => {
          console.log(house);

          const g = svg.append('g')
            .attr("width", 150)
            .attr("height", 40);

          const rect = g.append('rect')
            .attr("width", 50)
            .attr("height", 10)
            .attr('fill', 'blue');

          const text = g.append('text')
            .text('hello');


          // .attr('fill', 'red')
          // .attr('class', 'tooltip')
          // .insert('div')
          // .text('hello');

          // const rect = svg.append('rect')
          // .attr('fill', 'red')
          // .attr("width", 150)
          // .attr("height", 40)
          // .attr('class', 'tooltip')
          // .insert('div')
          // .text('hello');
          // .append('rect:div');

        });

        // d3.selectAll('rect')
        //   .insert('div', '#circle + *')
        //   // .attr('id', 'second');
        //   .attr('class', 'tooltip')
        //   .text('hello');

        // nodes.forEach(function (n) {
        //   n.centerPoint = target;
        // });
        //
        // svg
        // // .append('svg:div')
        // .append('rect')
        // // .attr('r', 30)
        // .attr('fill', 'red')
        // .attr("width", 150)
        // .attr("height", 40);
        // .attr('class', 'tooltip')
        // .attr("width", 200)
        // .attr("height", 200);


        function moveBubbles() {
          force
            .on('tick', ((e) => { node.each(moveToTarget(e.alpha))
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; });
          })).start();
        }
        moveBubbles();

        function defineTarget(target) {
          nodes.forEach(function (n) {
            n.centerPoint = target;
          });
          moveBubbles();
        }

        function defineMultipleTargets(buttonId) {
          if(nodes[0].NodeType === "search") {
            let unique = nodes.map(n => eval('n.' + buttonId));
            unique = unique.filter((item, i, ar) => {
              return ar.indexOf(item) === i;
            });
            unique.sort(function(a,b){return a - b;});

            console.log(buttonId, unique, unique.length);

            if (unique.length <= 1) {
              nodes.forEach(function (n, i) {
                n.centerPoint = { x: w * 0.3, y: h * 0.5 };
              });
            }

            if (unique.length <= 6) {
              nodes.forEach(function (n, i) {
                // console.log(eval('n.' + buttonId));
                const num = unique.indexOf(eval('n.' + buttonId)) + 1;
                // console.log(num);
                if (num <= 3 ) n.centerPoint = { x: w * num * 0.2, y: h * 0.33 };
                if (num >= 4 ) n.centerPoint = { x: w * (num-3) * 0.2, y: h * 0.66 };
              });
            }

            moveBubbles();

          }
        }

        function moveToTarget(alpha) {
          return function (d) {
            d.x = d.x + (d.centerPoint.x - d.x) * alpha * damper;
            d.y = d.y + (d.centerPoint.y - d.y) * alpha * damper;
          };
        }

        d3.select('#toolbar')
          .selectAll('.button')
          .on('click', function () {
            d3.selectAll('.button').classed('active', false);

            var button = d3.select(this);
            button.classed('active', true);

            var buttonId = button.attr('id');
            if (buttonId === 'All') {
              const target = { x: w / 2, y: h / 2 };
              defineTarget(target);
            } else {
              defineMultipleTargets(buttonId);
            }


        });
      }
    }
  };
}
