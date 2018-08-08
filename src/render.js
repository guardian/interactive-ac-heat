import templateHTML from "./src/templates/main.html!text"
import headerHTML from "./src/templates/header.html!text"
import fs from 'fs'
import csvParse from 'csv-parse/lib/sync';
import tablerender from './tablerender'

// import usData from '../assets/us-climate.csv';
import axios from 'axios'

const csv = fs.readFileSync('src/assets/us-climate.csv', 'utf8')

const parsed = csvParse(csv, { columns: true })



// fs.writeFileSync('src/assets/us-climate.json', JSON.stringify(parsed));

export async function render() {
    // var tablehtml = await tablerender('rra');
    // console.log(tablehtml);
    return (headerHTML + templateHTML);
}