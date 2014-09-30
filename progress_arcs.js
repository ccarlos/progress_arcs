var appModule = angular.module('app_progress_arcs', []);

appModule.directive('progressArcs', function ($parse) {
    return {
        restrict: 'E',
        replace: false,
        // TODO: Directive input thru form? ng-x ? Range: (0.0 - 1.0)
        scope: {'actual': '=actual',
                'expected': '=expected'},
        link: function (scope, element, attrs, ctrl) {
            var width = 960;
            var height = 500;
            τ = 2 * Math.PI;

            var actual_input = scope.actual;
            var expected_input = scope.expected;
            // Choose the starting point to be on (0, y)
            var start_angle = 0;

            // Actual is the outermost arc
            var actual_outer_radius = 230;
            var actual_inner_radius = 220;

            // Expected is the inner (thinner) arc
            var expected_outer_radius = 215;
            var expected_inner_radius = 210;

            // An arc function with all values bound except the endAngle. So, to compute an
            // SVG path string for a given angle, we pass an object with an endAngle
            // property to the `arc` function, and it will return the corresponding string.
            var outer_arc_factory = d3.svg.arc()
                .innerRadius(actual_inner_radius)
                .outerRadius(actual_outer_radius)
                .startAngle(start_angle);

            var inner_arc_factory = d3.svg.arc()
                .innerRadius(expected_inner_radius)
                .outerRadius(expected_outer_radius)
                .startAngle(start_angle);

            // Start Drawing ;D

            // Create the SVG container, and apply a transform such that the origin is the
            // center of the canvas. This way, we don't need to position arcs individually.
            var svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            // Add the background arc, from 0 to 100% (τ).
            var actual_arc = svg.append("path")
                .datum({endAngle: actual_input * τ}) // input 0.0 - 1.0
                .style("fill", "#437C17")
                .attr("d", outer_arc_factory);

            // This will make the edges round at the beginning of the outer_arc
            svg.append("circle")
                .attr('id','circleOne')
                .attr("r", (actual_outer_radius - actual_inner_radius) / 2)
                .attr('fill',"#437C17")
                .attr("cx", outer_arc_factory.centroid({startAngle: 0, endAngle: 0})[0])
                .attr("cy", outer_arc_factory.centroid({startAngle: 0, endAngle: 0})[1]);

            // This will make the edges round at the end of the outer_arc
            svg.append("circle")
                .attr('id','circleTwo')
                .attr("r", (actual_outer_radius - actual_inner_radius) / 2)
                .attr('fill',"#437C17")
                .attr("cx", outer_arc_factory.centroid({startAngle: 0, endAngle: actual_input * τ * 2})[0])
                .attr("cy", outer_arc_factory.centroid({startAngle: 0, endAngle: actual_input * τ * 2})[1]);

            // Add the expected foreground arc in light green
            var expected_arc = svg.append("path")
                .datum({endAngle: expected_input * τ})// input 0.0 - 1.0
                .style("fill", "#B5EAAA")
                .attr("d", inner_arc_factory);

            // Add the inner circle inside the arc's
            svg.append("circle")
                .attr('id', 'progressCircle')
                .attr('r', expected_inner_radius - 10)
                .attr('fill', '#F8F8F8')
                .attr('cx', 0)
                .attr('cy', 0);

            // Append text to the inside of the circle
            // TODO: Align Text inside circle, when resizing occurs
            svg.append("text")
                .attr("dx", 0)
                .attr("dy", 0)
                .attr("font-size", "120px")
                .attr("text-anchor", "middle")
                .attr("font-family", "Helvetica")
                .text(actual_input * 100 + "%");

            svg.append("text")
                .attr("dx", 0)
                .attr("dy", 40)
                .attr("font-family", "Helvetica")
                .attr("text-anchor", "middle")
                .attr("font-size", "30px")
                .text("Progress")
        }
    }
});

function Ctrl($scope) {
    $scope.actual = 0.2;
    $scope.expected = 0.7;
}
