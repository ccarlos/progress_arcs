var appModule = angular.module('app_progress_arcs', []);

appModule.controller("AppCtrl", function ($scope) {
    // Init values
    $scope.expected = .02;
    $scope.actual = .03;

    $scope.render_drawing = function () {
        // Utiliz this function to trigger $scope.watch
        $scope.expected = $scope.expected;
        $scope.actual = $scope.actual;
    };
});

appModule.directive('progressArcs', function ($parse) {
    return {
        restrict: 'AE',
        scope: {'expected': '@',
                'actual': '@'},
        link: function (scope, element, attrs, ctrl) {
            scope.svg = null;
            scope.outer_arc_factory = null;
            scope.inner_arc_factory = null;

            scope.getOptions = function() {
                return {
                    width: 960,
                    height: 500,
                    // Choose the starting point to be on (0, y)
                    start_angle: 0,
                    // Actual is the outermost arc
                    actual_outer_radius: 230,
                    actual_inner_radius: 220,
                    // Expected is the inner (thinner) arc
                    expected_outer_radius: 215,
                    expected_inner_radius: 210,
                    τ: 2 * Math.PI
                }
            };

            scope.setUp = function(){
                //sets up svg objects and factories

                var options = scope.getOptions();

                // An arc function with all values bound except the endAngle. So, to compute an
                // SVG path string for a given angle, we pass an object with an endAngle
                // property to the `arc` function, and it will return the corresponding string.
                scope.outer_arc_factory = d3.svg.arc()
                    .innerRadius(options.actual_inner_radius)
                    .outerRadius(options.actual_outer_radius)
                    .startAngle(options.start_angle);

                scope.inner_arc_factory = d3.svg.arc()
                    .innerRadius(options.expected_inner_radius)
                    .outerRadius(options.expected_outer_radius)
                    .startAngle(options.start_angle);

                // Start Drawing ;D

                // Create the SVG container, and apply a transform such that the origin is the
                // center of the canvas. This way, we don't need to position arcs individually.
                scope.svg = d3.select("body").append("svg")
                    .attr("width", options.width)
                    .attr("height", options.height)
                    .append("g")
                    .attr("transform", "translate(" + options.width / 2 + "," + options.height / 2 + ")");

                scope.reDraw();
            };

            scope.reDraw = function(){
                // TODO: Extract values from scope, when input changes.
                var expected = 0.5;  //scope.expected;
                var actual = 0.3;    //scope.actual;
                var options = scope.getOptions();

                if (actual && expected){
                    var actual_input = actual;
                    var expected_input = expected;
                    // Add the background arc, from 0 to 100% (τ).
                    var actual_arc = scope.svg.append("path")
                        .datum({endAngle: actual_input * options.τ}) // input 0.0 - 1.0
                        .style("fill", "#437C17")
                        .attr("d", scope.outer_arc_factory);

                    // This will make the edges round at the beginning of the outer_arc
                    scope.svg.append("circle")
                        .attr('id','circleOne')
                        .attr("r", (options.actual_outer_radius - options.actual_inner_radius) / 2)
                        .attr('fill',"#437C17")
                        .attr("cx", scope.outer_arc_factory.centroid({startAngle: 0, endAngle: 0})[0])
                        .attr("cy", scope.outer_arc_factory.centroid({startAngle: 0, endAngle: 0})[1]);

                    // This will make the edges round at the end of the outer_arc
                    scope.svg.append("circle")
                        .attr('id','circleTwo')
                        .attr("r", (options.actual_outer_radius - options.actual_inner_radius) / 2)
                        .attr('fill',"#437C17")
                        .attr("cx", scope.outer_arc_factory.centroid({startAngle: 0, endAngle: actual_input * options.τ * 2})[0])
                        .attr("cy", scope.outer_arc_factory.centroid({startAngle: 0, endAngle: actual_input * options.τ * 2})[1]);

                    // Add the expected foreground arc in light green
                    var expected_arc = scope.svg.append("path")
                        .datum({endAngle: expected_input * options.τ})// input 0.0 - 1.0
                        .style("fill", "#B5EAAA")
                        .attr("d", scope.inner_arc_factory);

                    // Add the inner circle inside the arc's
                    scope.svg.append("circle")
                        .attr('id', 'progressCircle')
                        .attr('r', options.expected_inner_radius - 10)
                        .attr('fill', '#F8F8F8')
                        .attr('cx', 0)
                        .attr('cy', 0);

                    // Append text to the inside of the circle
                    // TODO: Align Text inside circle, when resizing occurs
                    scope.svg.append("text")
                        .attr("dx", 0)
                        .attr("dy", 0)
                        .attr("font-size", "120px")
                        .attr("text-anchor", "middle")
                        .attr("font-family", "Helvetica")
                        .text(actual_input * 100 + "%");

                    scope.svg.append("text")
                        .attr("dx", 0)
                        .attr("dy", 40)
                        .attr("font-family", "Helvetica")
                        .attr("text-anchor", "middle")
                        .attr("font-size", "30px")
                        .text("Progress")
                }
            };
            // Todo: watch is not being executed when input changes
            // Watch scope changes and trigger reDraw on change
            //scope.$watch('actual', scope.reDraw);
            scope.$watch('expected', scope.reDraw);
            scope.$watch('actual', function(oldVal, newVal) {
                if(newVal) {
                    scope.reDraw();
                }
            });
            scope.setUp();
        }
    }
});