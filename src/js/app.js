import * as d3 from 'd3';
import * as topojson from 'topojson'
import us from '../assets/us-map.json'

const mapWidth = 1200;
const mapHeight = 800;

const svg = d3.select('.us-map').append('svg')
  .attr('width', mapWidth)
  .attr('height', mapHeight)

const path = d3.geoPath();

  svg.append("path")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 0.5)
    .attr("d", path(topojson.mesh(us, us.objects.counties, function (a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); })));

  svg.append("path")
    .attr("stroke-width", 0.5)
    .attr("d", path(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; })));

  svg.append("path")
    .attr("d", path(topojson.feature(us, us.objects.nation)));