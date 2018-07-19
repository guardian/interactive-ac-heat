import * as d3 from 'd3';
import * as topojson from 'topojson'
// import us from '../assets/us-map.json'
import us from '../assets/us-geo.json'
import temps from '../assets/us-climate.json'

const mapWidth = 1200;
const mapHeight = 600;

const svg = d3.select('.us-map').append('svg')
  .attr('width', mapWidth)
  .attr('height', mapHeight)

const proj = d3.geoAlbers()
  .fitSize([mapWidth, mapHeight], us)

const path = d3.geoPath()
  .projection(proj)

  // svg.append("path")
  //   .attr("stroke", "#aaa")
  //   .attr("stroke-width", 0.5)
  //   .attr('fill', 'none')
  //   .attr("d", path(topojson.mesh(us, us.objects.counties, function (a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); })));

  // svg.append("path")
  //   .attr("stroke-width", 0.5)
  //   .attr('stroke', 'black')
  //   // .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)))
  //   .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)))
  //   .style('fill', 'yellow')

  svg.selectAll('state')
    // .data(topojson.feature(us, us.objects.states).features)
    .data(us.features)
    .enter()
    .append('path')
    .attr('d', path)
    // .style('fill', d => d.id === '06' ? 'yellow' : 'lightgrey')
    .style('fill', d => {
      const state = temps.find(s => d.properties.name === s['State'])
      const historical = Number(state['1981-2010'])
      if (historical > 70) {
        return '#ff0000'
      } else if (historical > 50) {
        return '#ff6d00'
      } else if (historical > 30) {
        return '#ffa200'
      } else if (historical > 10) {
        return '#fed033'
      }
      else {
        return '#fafa6e'
      }
    })
    .style('stroke', 'black')
    .attr("stroke-width", 0.5)

  // svg.append("path")
  //   .attr("d", path(topojson.feature(us, us.objects.nation)))
  //   .attr('fill', 'none')
  //   .attr('stroke', 'black')