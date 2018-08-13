import * as d3base from 'd3';
import * as d3gp from 'd3-geo-projection';
import * as topojson from 'topojson'
import world from 'world-atlas/world/110m.json'
import Awesomplete from './awesomplete.js'
import * as d3Beeswarm from 'd3-beeswarm'
// import cities from '../assets/cleanCitySubset.json'
// import us from '../assets/us-map.json'
// import us from '../assets/us-geo.json'
import mustache from 'mustache'
// import cities from '../data/joinedNew.json'
// import cities from '../data/joinedPatched.json'
import cities from '../data/finalLooseJson.json'
import tabletemplate from '!raw-loader!./../templates/table.html'
import namelookup from '../data/country_codes.json'

cities.map(c => {
  c.purename = c.cityName.split(",")[0];
  var code = c.cityName.split(",")[1].replace(/ /g,"");
  // Catch for US city names which include state codes
  if (code.length > 2) {
    c.displayname = c.cityName
  } else {
    var matchingrecord = namelookup.find(n => code == n.GEC);
    if (matchingrecord)
  {  c.country = matchingrecord.name;}
    c.displayname = `${c.purename}, ${c.country}`
  
  }
})

// const needAC = d.tAvgHot > 26.5;
// const noNeedAC = d.tAvgHot <= 26.5 && d.tMax <= 28;
// const needHeat = d.tAvgCold <= 13 && d.tMin <= 7;
// const noNeedHeat = d.tAvgCold > 13 && d.tMin > 7;

cities.map(d => {
  // c.displayname = c.cityName.split(",")[0]
  d.needAC = d.tAvgHot > 26.5 || d.tMax > 28;
  d.noNeedAC = d.tAvgHot <= 26.5 && d.tMax <= 28;
  d.needHeat = d.tAvgCold <= 13 || d.tMin <= 7;
  d.noNeedHeat = d.tAvgCold > 13 && d.tMin > 7;
})


// const needAC = d.tAvgHot > 26.5 || d.tMax > 28;
// const noNeedAC = d.tAvgHot <= 26.5 && d.tMax <= 28;
// const needHeat = d.tAvgCold <= 13 || d.tMin <= 7;
// const noNeedHeat = d.tAvgCold > 13 && d.tMin > 7;



const isMobile = window.innerWidth < 600;
const standardRadius = isMobile ? 1 : 2;
const largeRadius = 6;

var searchEl = document.getElementById("gv-search-field");
var tablediv = document.querySelector(".gv-table");
const mapSvgEl = document.querySelector(".world-map")

const d3 = Object.assign({}, d3base, d3gp);

/* Map */
const mapWidth = mapSvgEl.getBoundingClientRect().width
// const mapHeight = 0.43 * mapWidth
const mapHeight = isMobile ? 0.6 * mapWidth : 0.43 * mapWidth;


const svg = d3.select(mapSvgEl).append('svg')
  .attr('width', mapWidth)
  .attr('height', mapHeight)

const fc = topojson.feature(world, world.objects.countries)

const proj = d3.geoRobinson()
  .fitSize([mapWidth, mapHeight], fc)
  // .rotate([-18, 0, 0])

const path = d3.geoPath()
  .projection(proj)


  svg.append("path")
    .attr("stroke", "#b3b3b4")
    .attr("stroke-width", 0.5)
    .attr('fill', 'none')
    // .attr("d", path(topojson.mesh(us, us.objects.counties, function (a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); })));
    
  svg.selectAll('countries')
    .data(fc.features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('fill', '#dcdcdc')
    .style('opacity', 0.4)
    .style('stroke', '#b3b3b4')
    .attr("stroke-width", 0.5)

const cityCircles = svg
  .selectAll('circle')
  .data(cities)
  .enter()
  .append('circle')
  .attr('id', d => d.cityName.replace(/[ ,]+/g, ""))
  .attr('cx', d => proj([d.lon, d.lat])[0])
  .attr('cy', d => proj([d.lon, d.lat])[1])
  .attr('r', standardRadius)
  .attr('class', d => {
    if (d.noNeedHeat && d.noNeedAC) {
      return 'need-none'
    } else

    if (d.needAC && d.needHeat) {
      return 'need-both'
    } else

    if (d.needAC && d.noNeedHeat) {
      return 'need-ac'
    } else

    if (d.needHeat && d.noNeedAC) {
      return 'need-heat'
    } else { 
      console.log(d)
    }
  })




// searchEl.addEventListener("focus", function () {
//   searchEl.value = "";
// })

// searchEl && searchEl.addEventListener("keyup", function () {
//   var criterion = searchEl.value;
//   if (criterion.length > 2) {
//     var tablehtml = mustache.render(tabletemplate, cities.filter(c => c.cityName.toLowerCase().indexOf(criterion.toLowerCase()) > -1));
//     console.log(tablehtml)
//     tablediv.innerHTML = tablehtml;
//   }

// })



// tavg in hottest > 26.5 => NEED AC

// tavg in hott < 26.5 && tmax hott < 28 => NO NEED AC

// tavg in coldest < 13 || tmin in coldest < 7 => NEED HEAT

// tavg in coldest > 13 && tmin in coldest > 7  => NO NEED HEAT




//searchbox

const parent = d3.select(".gv-city-search");

const searchBox = parent.insert("div", ":first-child").classed("search-container", true);
const input = searchBox.append("input").classed("city-result", true);

input.attr("placeholder", "Find a city …");

// const buttonsWrapper = searchBox.append("div").classed("buttons", true);

// const companiesToButton = ["Schoolsworks Academy Trust", "Sussex Learning Trust", 'Asos.com Limited', 'Credit Suisse (UK) Limited'];

const awesome = new Awesomplete(input.node(), {
  list: cities.map(d => [d.displayname,d.cityName]),
//list: cities.map(d => d.cityName)
  replace: function(text) {
    this.input.value = text.label;
  }
});

const close = d3.select('.awesomplete').append("div").style("display", "none").classed("search", true);

close.html(`<svg class="icon-cancel" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 30 30">
        <path d="m 8.2646211,7.64 -0.985372,0.992 6.8996289,7.5523 7.720992,6.739 0.821373,-0.8267 -6.899628,-7.5524 -7.5569939,-6.9042" fill="#000"></path>
        <path d="m 7.2792491,21.64 0.985372,0.9854 7.5569939,-6.8977 6.899628,-7.5523 -0.985381,-0.992 -7.556984,6.9042 -6.8996289,7.5524" fill="#000"></path>
        </svg>`);

close.on("click", function (e) {
  close.style("display", "none");
  input.node().value = "";
  d3.select(".label-g").remove();

  d3.select(".search-box-date").html(``);

  d3.select(".search-box-gap").html(``);

  resetCircles()
});

input.on("keyup", function (e) {

  if (input.node().value.length > 0) {
    close.style("display", "inline-block");
  } else {
    close.style("display", "none");
  }

  if (input.node().value.length === 0) {
    resetCircles()
  }

});

// let dayArray = new Array(totalWeekDays).fill(null);
// var counter = 0;
// for (var day = 1; day < 365 + 1; day++) {
//     var curday = new Date(2018, 0, day);

//     if (curday.getDay() !== 6 && curday.getDay() !== 0) {
//         dayArray[counter] = curday;
//         counter++;
//     }
// }

// const monthNames = ["January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
// ];

function selectedCity(city) {
  const textBox = d3.select(".search-box-result");

  const cityId = city.replace(/[ ,]+/g, "")
  const cityCircle =  svg.select(`#${cityId}`);

  cityCircles.transition()
    .ease(d3.easeCubicOut)
    .duration(2000)
    .style('opacity', 0)

  cityCircle.transition()
    .ease(d3.easeCubicOut)
    .duration(1000)
    .attr('r', largeRadius)




  const c = cities.find(d => d.cityName === city)
  let message = '';

  for (var prop in c) {
    console.log(prop)
    if (c[prop] == NaN) {
      delete c[prop]
    }
  }

  console.log(c)

  if (c.tAvgHot && c.tAvgCold && c.tMax && c.tMin) {
    const firstLine = c.needAC ? 'Residents will be happier with air conditioning. ' : 'Residents have no real need of air conditioning. ';
    const secondLine = c.needHeat ? `In winter they'll need heat ${c.needAC ? 'too. ' : 'though. '}` : `In winter they won't need heat ${c.needAC ? 'though. ' : 'either. '}`;
    const thirdLine = `In the hottest month the daily average is ${Math.round(c.tAvgHot * 10) / 10}C, and average highs are ${Math.round(c.tMax * 10) / 10}C. `;
    const fourthLine = `Days in the coldest month usually settle around ${Math.round(c.tAvgCold * 10) / 10}C `;
    const fifthLine = c.needHeat ?  `but can get as cold as ${Math.round(c.tMin * 10) / 10}C.` : `and seldom get colder than ${Math.round(c.tMin * 10) / 10}C.`;
    console.log(firstLine + secondLine + thirdLine + fourthLine + fifthLine);
    message = firstLine + secondLine + thirdLine + fourthLine + fifthLine;
  } else   {
      // message if any of the values are missing
    const firstLine = c.needAC ? 'Residents will be happier with air conditioning. ' : 'Residents have no real need of air conditioning. ';
    const secondLine = c.needHeat ? `In winter they'll need heat ${c.needAC ? 'too. ' : 'though. '}` : `In winter they won't need heat ${c.needAC ? 'though. ' : 'either. '}`;
    const thirdLine = c.tMax ? `The hottest days reach ${Math.round(c.tMax * 10) / 10}C or so. ` : ``;
    const fourthLine = c.tAvgHot ? `In the warmest month the daily average is ${Math.round(c.tAvgHot * 10) / 10}C. ` : '';
    const fifthLine = c.tAvgCold ? `Days in the coldest month are around ${Math.round(c.tAvgCold * 10) / 10}C. ` : '';
    const sixthLine = c.tMin ? `A bad winter day would see temperatures of ${Math.round(c.tMin * 10) / 10}C.` : '';
    message = firstLine + secondLine + thirdLine + fourthLine + fifthLine + sixthLine;
  }
  
  d3.select('.explanation').remove()
  searchBox.append("div").classed("explanation", true).html(message);

  // input.attr('class', 'need-ac')
  


  let color;


  if (c.noNeedHeat && c.noNeedAC) {
      color = 'need-none'
  } else if (c.needAC && c.needHeat) {
      color = 'need-both'
  } else if (c.needAC && c.noNeedHeat) {
      color = 'need-ac'
  } else if (c.needHeat && c.noNeedAC) {
      color = 'need-heat'
  } 
  input.classed(color, true)

}

const resetCircles = () => {
  cityCircles.transition()
    .duration(1000)
    .style('opacity', 1)
    .attr('r', standardRadius)

  d3.select('.explanation').remove()
  input.attr('class', 'city-result')
  // searchBox.remove("div").classed("explanation", true
}

document.addEventListener("awesomplete-selectcomplete", function (e) {
  const city = e.text.value;
  selectedCity(city);
});

let rotating = false;
const impactContainer = document.querySelector('.impact-container');
const titleSummer = document.querySelector('.title-summer');
const titleWinter = document.querySelector('.title-winter');

const rotatePics = () => {
    let i = 1;
    let len = 3;
    console.log(i)
  setInterval(function () {
    if (i === 1) {
      const allPics = document.querySelectorAll(`.impact`);
      allPics.forEach(el => el.style.zIndex = i)
      titleSummer.innerHTML = `Northern Hemisphere summer averages 1986 - 2005 `
      titleWinter.innerHTML = `Southern Hemisphere summer averages 1986 - 2005 `
    } else {
      const picsToShow = document.querySelectorAll(`.impact-${i}`);
      picsToShow.forEach(el => el.style.zIndex = i)
      titleWinter.innerHTML = i === 2 ? `Southern Hemisphere summer averages 2020 - 2039` : `Southern Hemisphere summer averages 2040 - 2059`;
      titleSummer.innerHTML = i === 2 ? `Northern Hemisphere summer averages 2020 - 2039` : `Northern Hemisphere summer averages 2040 - 2059`;
    }
    i = (i === len) ? 1 : ++i;
  }, 1500);
};


function isElementInView(el) {
  var rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

window.addEventListener('scroll', function (e) {
  if (!rotating) {
    window.requestAnimationFrame(function () {
      if (isElementInView(impactContainer)) {
        rotatePics();
        rotating = true;;
      }
    });
  }
});
