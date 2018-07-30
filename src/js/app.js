import * as d3 from 'd3';
import * as topojson from 'topojson'
import * as d3Beeswarm from 'd3-beeswarm'
// import us from '../assets/us-map.json'
import us from '../assets/us-geo.json'
import temps from '../assets/us-climate.json'

/* Map */
const mapWidth = 1200;
const mapHeight = 600;

let period = '1981-2010';

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
      const historical = Number(state[period])
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
const plotWidth = 600;
const plotHeight = 400;
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
    right: 20,
    bottom: 40,
    left: 20
  }

const totalCities = 50;

//needs to be the highest value for the selected time period
const totalDays = 150;

const buildSwarm = yearRange =>
  d3Beeswarm.beeswarm()
    .data(temps)
    .distributeOn(d => xScale(Math.round(Number(d[yearRange]))))
    .radius(4)
    .orientation('horizontal')
    .side('negative')
    .arrange()


const xAxisPadding = 200;

const bSvg = d3.select('.beeswarm').append('svg')
  .attr('width', plotWidth)
  .attr('height', plotHeight)

const containerG = bSvg.append('g').attr('class', 'containerG')
  .attr('transform', `translate(${padding.left}, ${xAxisPadding})`)

const xScale = d3.scaleLinear()
  .domain([0, totalDays])
  .range([padding.left, plotWidth - padding.right -padding.left])

const yScale = d3.scaleLinear()
  .domain([0, totalCities])
  .range([padding.top, plotHeight - padding.bottom])

const swarm = buildSwarm(period)

const axisLayer = containerG.append('g')
  .attr('transform', `translate(${0}, ${5})`)
  .attr('class', 'xAxis')

axisLayer.append('rect')
  .attr('x', xScale(20))
  .attr('y', yScale(- totalDays))
  .attr('width', xScale(40) - xScale(20))
  .attr('height', - yScale(- totalDays))
  .attr('class', 'temp-area')

axisLayer.append('rect')
  .attr('x', xScale(40))
  .attr('y', yScale(- totalDays))
  .attr('width', xScale(totalDays) - xScale(20))
  .attr('height', - yScale(- totalDays))
  .attr('class', 'temp-area-hot')

axisLayer.append('rect')
  .attr('x', xScale(0))
  .attr('y', yScale(- totalDays))
  .attr('width', xScale(20) - xScale(0))
  .attr('height', - yScale(- totalDays))
  .attr('class', 'temp-area-cold')

axisLayer.append('text')
  .text('Days per year above 25°C ')
  .attr('x', plotWidth - padding.right -100)
  .attr('dy', 40)

axisLayer.append('text')
  .text(period)
  .attr('class', 'period')
  .attr('x', plotWidth / 2)
  .attr('dy', 60)

axisLayer.append('text')
  .text('Warmer cities →')
  .attr('x', plotWidth - padding.right - 100)
  // .attr('dy', -totalDays+ 20)
  .attr('dy', -xAxisPadding + 20)

axisLayer.call(d3.axisBottom(xScale))

// xstops
axisLayer.append('line')
  .attr('x1', xScale(20))
  .attr('x2', xScale(20))
  .attr('y1', yScale(- totalDays))
  .attr('class', 'xStop')

axisLayer.append('line')
  .attr('x1', xScale(40))
  .attr('x2', xScale(40))
  .attr('y1', yScale(- totalDays))
  .attr('class', 'xStop')

const voronoi = d3.voronoi()
  .extent([[-padding.left, -padding.top], [plotWidth + padding.right, plotHeight + padding.top]])
  .x(function (d) { return d.x; })
  .y(function (d) { return d.y; })
  .polygons(swarm)

const cells = containerG.append("g")
  .attr("class", "cells")
  .selectAll("g")
  .data(voronoi)

const circles = cells.enter()
  // .append('g')
  .append('circle')
  .attr('id', d => `circle-${d.data.datum['State']}`)
  .attr('class', 'circle')
  .attr('cx', b => b.data.x)
  .attr('cy', b => b.data.y)
  .attr('r', d => Math.floor(d.data.datum['State'].length/3))

const paths = cells.enter().append("path")
  .attr("d", function (d) { return "M" + d.join("L") + "Z"; })
  .attr("id", d => d.data.datum['State'])
  .attr("class", 'voronoi')
  .on('mouseover', d => {

    const circle = d3.select(`#circle-${d.data.datum['State']}`)

    circle.classed('highlight', true)
    containerG.append('text')
      .text(() => d.data.datum['State'])
        .attr('class', 'circle-label')
        .attr('x', () => circle.attr('cx'))
        .attr('y', () => circle.attr('cy'))
        .attr('dy', -10)
  })
  .on('mouseout', d => {
    d3.select(`#circle-${d.data.datum['State']}`)
      .classed('highlight', false)
    containerG.select('.circle-label').remove()
  })


// transitions

const transitionSwarm = (period) => {
  const newSwarm = buildSwarm(period)

  const newSwarmData = d3.voronoi()
    .extent([[-padding.left, -padding.top], [plotWidth + padding.right, plotHeight + padding.top]])
    .x(function (d) { return d.x; })
    .y(function (d) { return d.y; })
    .polygons(newSwarm);

  circles.data(newSwarmData)
  paths.data(newSwarmData)

  circles
    .transition()
    .ease(d3.easeCubicOut)
    .duration(2000)
    .attr('cx', b => b.data.x)
    .attr('cy', b => b.data.y)
    // .attr('r', 2.5)

  paths
    .transition()
    .duration(2000)
    .attr("d", function (d) { return "M" + d.join("L") + "Z"; })
}

document.getElementById("future-one").addEventListener("click", () => { 
  transitionSwarm('2020-2039')
  d3.select('.period').text('2020-2039')
});
document.getElementById("future-two").addEventListener("click", () => {
  transitionSwarm('2040-2059')
  d3.select('.period').text('2040-2059')
});
document.getElementById("historical").addEventListener("click", () => {
  transitionSwarm('1981-2010')
  d3.select('.period').text('1981-2010')
});