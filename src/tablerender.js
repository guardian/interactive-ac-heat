import tabletemplate from './src/templates/table.html!text'
import cities from './data/cleanCitySubset.json'
import mustache from 'mustache'


export default async function tablerender(criterion) {
    var cityselection = cities.filter(c => {return c.cityName.indexOf(criterion) > 0 });
    console.log(cityselection);
    var tablehtml = mustache.render(tabletemplate,cityselection);
    return (tablehtml);
}