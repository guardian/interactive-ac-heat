import * as d3 from 'd3';
import * as topojson from 'topojson'
import * as d3Beeswarm from 'd3-beeswarm'
// import us from '../assets/us-map.json'
import us from '../assets/us-geo.json'
import temps from '../assets/us-climate.json'


/* Map */
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

/* Beeswarm */
const plotWidth = 1000;
const plotHeight = 600;
const mobile = window.matchMedia('(max-width: 739px)').matches
const padding = mobile ?
  {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }

  : {
    top: 100,
    right: 0,
    bottom: 40,
    left: 20
  }

const totalCities = 50;
const totalDays = 150;

const xAxisPadding = 150;

const bSvg = d3.select('.beeswarm').append('svg')
  .attr('width', plotWidth)
  .attr('height', plotHeight)

const xScale = d3.scaleLinear()
  .domain([0, totalDays])
  .range([padding.left, plotWidth - padding.right])

const yScale = d3.scaleLinear()
  .domain([0, totalCities])
  .range([padding.top, plotHeight - padding.bottom])

const swarm = d3Beeswarm.beeswarm()
  .data(temps)
  .distributeOn(d => xScale(Math.round(Number(d['1981-2010']))))
  .radius(3)
  .orientation('horizontal')
  .side('negative')
  .arrange()


// var cell = bSvg.append("g")
//   .attr("class", "cells")
//   .selectAll("g").data(d3.voronoi()
//     .extent([[-padding.left, -padding.top], [plotWidth + padding.right, plotHeight + padding.top]])
//     .x(function (d) { return d.x; })
//     .y(function (d) { return d.y; })
//     .polygons(swarm)).enter().append("g");



bSvg.selectAll('circle')
  .data(swarm)
  .enter()

  .append('circle')
  .attr('id', b => b.datum['State'])
  .attr('cx', b => b.x)
  .attr('cy', b => b.y + xAxisPadding)
  .attr('r', 2.5)
  .style('fill', function (bee) {
    // return fillScale(bee.datum.bar);
    return 'blue'
  })
  .style('stroke', 'white')
  .style('stroke-width', 0.5)

