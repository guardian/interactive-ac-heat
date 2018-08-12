import templateHTML from "./src/templates/main.html!text"
import headerHTML from "./src/templates/header.html!text"
import climateImpactHTML from "./src/templates/climateImpactSummer.html!text"
import keyHTML from "./src/templates/key.html!text"
import fs from 'fs'
import csvParse from 'csv-parse/lib/sync';
import tablerender from './tablerender'
import mustache from 'mustache'

const copyurl = "https://interactive.guim.co.uk/docsdata/1YbrR24d2o6cPtuWZKXdBKn_pMbptGQ3wwEvva7WS4nw.json"

// import usData from '../assets/us-climate.csv';
import axios from 'axios'

// const csv = fs.readFileSync('src/assets/us-climate.csv', 'utf8')

// const parsed = csvParse(csv, { columns: true })



// fs.writeFileSync('src/assets/us-climate.json', JSON.stringify(parsed));

export async function render() {
    var copytext = (await axios.get(copyurl)).data;
    // var tablehtml = await tablerender('rra');
    // console.log(tablehtml);
    var header = mustache.render(headerHTML,copytext);
    var main = mustache.render(templateHTML,copytext)
    return (header + keyHTML + main + climateImpactHTML);
}