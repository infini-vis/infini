import {makeSetting} from '../../utils/Setting';
import {orFilterGetter} from '../../utils/Filters';
import {CONFIG, COLUMN_TYPE, RequiredType} from '../../utils/Consts';
import {cloneObj} from '../../utils/Helpers';
import {getColType} from '../../utils/ColTypes';
import {queryDistinctValues, MeasureParams, parseTocolorItems} from '../Utils/settingHelper';
import {DEFAULT_MAX_POINTS_NUM, KEY} from '../Utils/Map';
import {measureGetter} from '../../utils/WidgetHelpers';
import {cleanLastSelfFilter, addSelfFilter} from '../../widgets/Utils/settingHelper';
import {MapMeasure} from '../common/MapChart.type';

// PointMap
const _onAddTextColor = async ({measure, config, setConfig, reqContext}: MeasureParams) => {
  const res = await queryDistinctValues({
    dimension: measure,
    config,
    reqContext,
  });
  const colorItems = parseTocolorItems(res);
  setConfig({payload: {colorItems}});
  addSelfFilter({dimension: measure, setConfig, res});
};

const _onAddNumColor = async ({measure, config, setConfig, reqContext}: any) => {
  const {filter = {}} = config;
  Object.keys(filter).forEach((filterKey: string) => {
    if (!filter[filterKey].expr.geoJson) {
      setConfig({type: CONFIG.DEL_FILTER, payload: [filterKey]});
    }
  });
  reqContext.numMinMaxValRequest(measure.value, config.source).then((res: any) => {
    const ruler = res;
    setConfig({type: CONFIG.ADD_RULER, payload: ruler});
    setConfig({type: CONFIG.ADD_RULERBASE, payload: ruler});
  });
};
const onAddColor = async ({measure, config, setConfig, reqContext}: any) => {
  cleanLastSelfFilter({dimension: measure, setConfig, config});
  setConfig({type: CONFIG.DEL_ATTR, payload: ['colorItems']});

  const dataType = getColType(measure.type);
  switch (dataType) {
    case 'text':
      setConfig({type: CONFIG.DEL_ATTR, payload: ['colorKey']});
      await _onAddTextColor({measure, config, setConfig, reqContext});
      break;
    case 'number':
      await _onAddNumColor({measure, config, setConfig, reqContext});
      break;
    default:
      break;
  }
  setConfig({type: CONFIG.ADD_MEASURE, payload: measure});
};

const onDeletePointMapColor = ({setConfig}: any) => {
  setConfig({type: CONFIG.DEL_ATTR, payload: ['colorItems']});
};

const pointMapConfigHandler = (config: any) => {
  let newConfig = cloneObj(config);
  if (!newConfig.bounds) {
    newConfig.bounds = {
      _sw: {
        lng: -73.5,
        lat: 40.1,
      },
      _ne: {
        lng: -70.5,
        lat: 41.1,
      },
    };
    // return newConfig;
  }
  let lon = measureGetter(newConfig, KEY.LONGTITUDE) as MapMeasure;
  let lat = measureGetter(newConfig, KEY.LATITUDE) as MapMeasure;
  if (!lon || !lat) {
    return newConfig;
  }

  const {_sw, _ne} = newConfig.bounds;

  let colorMeasure = measureGetter(newConfig, 'color');
  const pointMeasure = {
    expression: 'project',
    value: `ST_Point (${lon.value}, ${lat.value})`,
    as: 'point',
  };
  newConfig.measures = [pointMeasure];
  if (colorMeasure) {
    newConfig.measures.push(colorMeasure);
  }
  newConfig.limit = newConfig.points || DEFAULT_MAX_POINTS_NUM;

  newConfig.selfFilter.bounds = {
    type: 'filter',
    expr: {
      type: 'st_within',
      x: lon.value,
      y: lat.value,
      px: [_sw.lng, _sw.lng, _ne.lng, _ne.lng, _sw.lng],
      py: [_sw.lat, _ne.lat, _ne.lat, _sw.lat, _sw.lat],
    },
  };
  newConfig.filter = orFilterGetter(newConfig.filter);
  return newConfig;
};

const settings = makeSetting({
  type: 'PointMap',
  dbTypes: ['arctern'],
  dimensions: [],
  measures: [
    {
      type: RequiredType.REQUIRED,
      key: KEY.LONGTITUDE,
      short: 'longtitude',
      expressions: ['gis_point_lon'],
      columnTypes: [COLUMN_TYPE.NUMBER],
    },
    {
      type: RequiredType.REQUIRED,
      key: KEY.LATITUDE,
      short: 'latitude',
      expressions: ['gis_point_lat'],
      columnTypes: [COLUMN_TYPE.NUMBER],
    },
    {
      type: RequiredType.OPTION,
      key: 'color',
      short: 'color',
      onAdd: onAddColor,
      expressions: ['project'],
      onDelete: onDeletePointMapColor,
      columnTypes: [COLUMN_TYPE.NUMBER],
    },
  ],
  icon: `<svg viewBox="0 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <g id="pointMap" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <path d="M36,75 C36.7091838,75 37.3321559,75.3691165 37.6872785,75.9257118 C36.6377193,75.8603494 35.6008424,75.7488868 34.5780752,75.5943936 C34.9405878,75.2270613 35.4437774,75 36,75 Z M44,75 C44.5562226,75 45.0594122,75.2270613 45.4219343,75.5935493 C44.3991576,75.7488868 43.3622807,75.8603494 42.3131972,75.9268781 C42.6678441,75.3691165 43.2908162,75 44,75 Z M28,67 C29.1045695,67 30,67.8954305 30,69 C30,70.1045695 29.1045695,71 28,71 C26.8954305,71 26,70.1045695 26,69 C26,67.8954305 26.8954305,67 28,67 Z M36,67 C37.1045695,67 38,67.8954305 38,69 C38,70.1045695 37.1045695,71 36,71 C34.8954305,71 34,70.1045695 34,69 C34,67.8954305 34.8954305,67 36,67 Z M44,67 C45.1045695,67 46,67.8954305 46,69 C46,70.1045695 45.1045695,71 44,71 C42.8954305,71 42,70.1045695 42,69 C42,67.8954305 42.8954305,67 44,67 Z M52,67 C53.1045695,67 54,67.8954305 54,69 C54,70.1045695 53.1045695,71 52,71 C50.8954305,71 50,70.1045695 50,69 C50,67.8954305 50.8954305,67 52,67 Z M20,67 C21.1045695,67 22,67.8954305 22,69 C22,69.6896953 21.6508916,70.297852 21.1197458,70.6573989 C20.0598527,70.0036214 19.0368594,69.2963867 18.0540601,68.5395226 C18.2620076,67.6562906 19.0543614,67 20,67 Z M60,67 C60.9456386,67 61.7379924,67.6562906 61.9464304,68.5382411 C60.9631406,69.2963867 59.9401473,70.0036214 58.8807112,70.6574755 C58.3491084,70.297852 58,69.6896953 58,69 C58,67.8954305 58.8954305,67 60,67 Z M20,59 C21.1045695,59 22,59.8954305 22,61 C22,62.1045695 21.1045695,63 20,63 C18.8954305,63 18,62.1045695 18,61 C18,59.8954305 18.8954305,59 20,59 Z M28,59 C29.1045695,59 30,59.8954305 30,61 C30,62.1045695 29.1045695,63 28,63 C26.8954305,63 26,62.1045695 26,61 C26,59.8954305 26.8954305,59 28,59 Z M36,59 C37.1045695,59 38,59.8954305 38,61 C38,62.1045695 37.1045695,63 36,63 C34.8954305,63 34,62.1045695 34,61 C34,59.8954305 34.8954305,59 36,59 Z M44,59 C45.1045695,59 46,59.8954305 46,61 C46,62.1045695 45.1045695,63 44,63 C42.8954305,63 42,62.1045695 42,61 C42,59.8954305 42.8954305,59 44,59 Z M52,59 C53.1045695,59 54,59.8954305 54,61 C54,62.1045695 53.1045695,63 52,63 C50.8954305,63 50,62.1045695 50,61 C50,59.8954305 50.8954305,59 52,59 Z M60,59 C61.1045695,59 62,59.8954305 62,61 C62,62.1045695 61.1045695,63 60,63 C58.8954305,63 58,62.1045695 58,61 C58,59.8954305 58.8954305,59 60,59 Z M12,59 C13.1045695,59 14,59.8954305 14,61 C14,62.0069052 13.2559143,62.8400199 12.2876135,62.9794735 C11.5401956,62.0799031 10.8359972,61.1428135 10.1779694,60.1718859 C10.4940634,59.4804192 11.1909278,59 12,59 Z M68,59 C68.8090722,59 69.5059366,59.4804192 69.8208865,60.1715513 C69.1640028,61.1428135 68.4598044,62.0799031 67.7125887,62.9800012 C66.7440857,62.8400199 66,62.0069052 66,61 C66,59.8954305 66.8954305,59 68,59 Z M20,51 C21.1045695,51 22,51.8954305 22,53 C22,54.1045695 21.1045695,55 20,55 C18.8954305,55 18,54.1045695 18,53 C18,51.8954305 18.8954305,51 20,51 Z M28,51 C29.1045695,51 30,51.8954305 30,53 C30,54.1045695 29.1045695,55 28,55 C26.8954305,55 26,54.1045695 26,53 C26,51.8954305 26.8954305,51 28,51 Z M36,51 C37.1045695,51 38,51.8954305 38,53 C38,54.1045695 37.1045695,55 36,55 C34.8954305,55 34,54.1045695 34,53 C34,51.8954305 34.8954305,51 36,51 Z M44,51 C45.1045695,51 46,51.8954305 46,53 C46,54.1045695 45.1045695,55 44,55 C42.8954305,55 42,54.1045695 42,53 C42,51.8954305 42.8954305,51 44,51 Z M52,51 C53.1045695,51 54,51.8954305 54,53 C54,54.1045695 53.1045695,55 52,55 C50.8954305,55 50,54.1045695 50,53 C50,51.8954305 50.8954305,51 52,51 Z M60,51 C61.1045695,51 62,51.8954305 62,53 C62,54.1045695 61.1045695,55 60,55 C58.8954305,55 58,54.1045695 58,53 C58,51.8954305 58.8954305,51 60,51 Z M68,51 C69.1045695,51 70,51.8954305 70,53 C70,54.1045695 69.1045695,55 68,55 C66.8954305,55 66,54.1045695 66,53 C66,51.8954305 66.8954305,51 68,51 Z M12,51 C13.1045695,51 14,51.8954305 14,53 C14,54.1045695 13.1045695,55 12,55 C10.8954305,55 10,54.1045695 10,53 C10,51.8954305 10.8954305,51 12,51 Z M12,43 C13.1045695,43 14,43.8954305 14,45 C14,46.1045695 13.1045695,47 12,47 C10.8954305,47 10,46.1045695 10,45 C10,43.8954305 10.8954305,43 12,43 Z M20,43 C21.1045695,43 22,43.8954305 22,45 C22,46.1045695 21.1045695,47 20,47 C18.8954305,47 18,46.1045695 18,45 C18,43.8954305 18.8954305,43 20,43 Z M28,43 C29.1045695,43 30,43.8954305 30,45 C30,46.1045695 29.1045695,47 28,47 C26.8954305,47 26,46.1045695 26,45 C26,43.8954305 26.8954305,43 28,43 Z M36,43 C37.1045695,43 38,43.8954305 38,45 C38,46.1045695 37.1045695,47 36,47 C34.8954305,47 34,46.1045695 34,45 C34,43.8954305 34.8954305,43 36,43 Z M44,43 C45.1045695,43 46,43.8954305 46,45 C46,46.1045695 45.1045695,47 44,47 C42.8954305,47 42,46.1045695 42,45 C42,43.8954305 42.8954305,43 44,43 Z M52,43 C53.1045695,43 54,43.8954305 54,45 C54,46.1045695 53.1045695,47 52,47 C50.8954305,47 50,46.1045695 50,45 C50,43.8954305 50.8954305,43 52,43 Z M60,43 C61.1045695,43 62,43.8954305 62,45 C62,46.1045695 61.1045695,47 60,47 C58.8954305,47 58,46.1045695 58,45 C58,43.8954305 58.8954305,43 60,43 Z M68,43 C69.1045695,43 70,43.8954305 70,45 C70,46.1045695 69.1045695,47 68,47 C66.8954305,47 66,46.1045695 66,45 C66,43.8954305 66.8954305,43 68,43 Z M4.12360612,43.0046605 L4,43 C5.1045695,43 6,43.8954305 6,45 C6,45.8736141 5.43987492,46.6164039 4.65916271,46.8888316 C4.41178631,45.6159962 4.23232028,44.3203621 4.12360612,43.0046605 Z M75.8763939,43.0046605 C75.7676797,44.3203621 75.5882137,45.6159962 75.3418095,46.8877492 C74.5601251,46.6164039 74,45.8736141 74,45 C74,43.9456382 74.8158778,43.0818349 75.8507377,43.0054857 Z M28,35 C29.1045695,35 30,35.8954305 30,37 C30,38.1045695 29.1045695,39 28,39 C26.8954305,39 26,38.1045695 26,37 C26,35.8954305 26.8954305,35 28,35 Z M12,35 C13.1045695,35 14,35.8954305 14,37 C14,38.1045695 13.1045695,39 12,39 C10.8954305,39 10,38.1045695 10,37 C10,35.8954305 10.8954305,35 12,35 Z M36,35 C37.1045695,35 38,35.8954305 38,37 C38,38.1045695 37.1045695,39 36,39 C34.8954305,39 34,38.1045695 34,37 C34,35.8954305 34.8954305,35 36,35 Z M44,35 C45.1045695,35 46,35.8954305 46,37 C46,38.1045695 45.1045695,39 44,39 C42.8954305,39 42,38.1045695 42,37 C42,35.8954305 42.8954305,35 44,35 Z M68,35 C69.1045695,35 70,35.8954305 70,37 C70,38.1045695 69.1045695,39 68,39 C66.8954305,39 66,38.1045695 66,37 C66,35.8954305 66.8954305,35 68,35 Z M52,35 C53.1045695,35 54,35.8954305 54,37 C54,38.1045695 53.1045695,39 52,39 C50.8954305,39 50,38.1045695 50,37 C50,35.8954305 50.8954305,35 52,35 Z M60,35 C61.1045695,35 62,35.8954305 62,37 C62,38.1045695 61.1045695,39 60,39 C58.8954305,39 58,38.1045695 58,37 C58,35.8954305 58.8954305,35 60,35 Z M20,35 C21.1045695,35 22,35.8954305 22,37 C22,38.1045695 21.1045695,39 20,39 C18.8954305,39 18,38.1045695 18,37 C18,35.8954305 18.8954305,35 20,35 Z M6,37 C6,38.099852 5.11220175,38.9923476 4.01414101,38.9999511 C4.05027807,37.6567041 4.16044057,36.3323433 4.34024347,35.0302199 C5.28358836,35.1913202 6,36.0119966 6,37 Z M75.6597565,35.0302199 C75.8395594,36.3323433 75.9497219,37.6567041 75.9863634,38.9994219 L76,39 C74.8954305,39 74,38.1045695 74,37 C74,36.0460536 74.6678727,35.2480973 75.5615377,35.0482115 Z M28,27 C29.1045695,27 30,27.8954305 30,29 C30,30.1045695 29.1045695,31 28,31 C26.8954305,31 26,30.1045695 26,29 C26,27.8954305 26.8954305,27 28,27 Z M12,27 C13.1045695,27 14,27.8954305 14,29 C14,30.1045695 13.1045695,31 12,31 C10.8954305,31 10,30.1045695 10,29 C10,27.8954305 10.8954305,27 12,27 Z M36,27 C37.1045695,27 38,27.8954305 38,29 C38,30.1045695 37.1045695,31 36,31 C34.8954305,31 34,30.1045695 34,29 C34,27.8954305 34.8954305,27 36,27 Z M44,27 C45.1045695,27 46,27.8954305 46,29 C46,30.1045695 45.1045695,31 44,31 C42.8954305,31 42,30.1045695 42,29 C42,27.8954305 42.8954305,27 44,27 Z M68,27 C69.1045695,27 70,27.8954305 70,29 C70,30.1045695 69.1045695,31 68,31 C66.8954305,31 66,30.1045695 66,29 C66,27.8954305 66.8954305,27 68,27 Z M52,27 C53.1045695,27 54,27.8954305 54,29 C54,30.1045695 53.1045695,31 52,31 C50.8954305,31 50,30.1045695 50,29 C50,27.8954305 50.8954305,27 52,27 Z M60,27 C61.1045695,27 62,27.8954305 62,29 C62,30.1045695 61.1045695,31 60,31 C58.8954305,31 58,30.1045695 58,29 C58,27.8954305 58.8954305,27 60,27 Z M20,27 C21.1045695,27 22,27.8954305 22,29 C22,30.1045695 21.1045695,31 20,31 C18.8954305,31 18,30.1045695 18,29 C18,27.8954305 18.8954305,27 20,27 Z M6,29 C6,29.6301297 5.70858915,30.1921968 5.2531821,30.5587866 C5.44817287,29.8304147 5.66756695,29.1122131 5.90841371,28.4039281 C5.9683927,28.5923319 6,28.7924748 6,29 Z M74.0915863,28.4039281 C74.3324331,29.1122131 74.5518271,29.8304147 74.7489944,30.5577588 C74.2914109,30.1921968 74,29.6301297 74,29 C74,28.7991692 74.029601,28.605252 74.0846781,28.4223736 Z M28,19 C29.1045695,19 30,19.8954305 30,21 C30,22.1045695 29.1045695,23 28,23 C26.8954305,23 26,22.1045695 26,21 C26,19.8954305 26.8954305,19 28,19 Z M12,19 C13.1045695,19 14,19.8954305 14,21 C14,22.1045695 13.1045695,23 12,23 C10.8954305,23 10,22.1045695 10,21 C10,19.8954305 10.8954305,19 12,19 Z M36,19 C37.1045695,19 38,19.8954305 38,21 C38,22.1045695 37.1045695,23 36,23 C34.8954305,23 34,22.1045695 34,21 C34,19.8954305 34.8954305,19 36,19 Z M44,19 C45.1045695,19 46,19.8954305 46,21 C46,22.1045695 45.1045695,23 44,23 C42.8954305,23 42,22.1045695 42,21 C42,19.8954305 42.8954305,19 44,19 Z M68,19 C69.1045695,19 70,19.8954305 70,21 C70,22.1045695 69.1045695,23 68,23 C66.8954305,23 66,22.1045695 66,21 C66,19.8954305 66.8954305,19 68,19 Z M60,19 C61.1045695,19 62,19.8954305 62,21 C62,22.1045695 61.1045695,23 60,23 C58.8954305,23 58,22.1045695 58,21 C58,19.8954305 58.8954305,19 60,19 Z M20,19 C21.1045695,19 22,19.8954305 22,21 C22,22.1045695 21.1045695,23 20,23 C18.8954305,23 18,22.1045695 18,21 C18,19.8954305 18.8954305,19 20,19 Z M52,19 C53.1045695,19 54,19.8954305 54,21 C54,22.1045695 53.1045695,23 52,23 C50.8954305,23 50,22.1045695 50,21 C50,19.8954305 50.8954305,19 52,19 Z M36,11 C37.1045695,11 38,11.8954305 38,13 C38,14.1045695 37.1045695,15 36,15 C34.8954305,15 34,14.1045695 34,13 C34,11.8954305 34.8954305,11 36,11 Z M52,11 C53.1045695,11 54,11.8954305 54,13 C54,14.1045695 53.1045695,15 52,15 C50.8954305,15 50,14.1045695 50,13 C50,11.8954305 50.8954305,11 52,11 Z M60,11 C61.1045695,11 62,11.8954305 62,13 C62,14.1045695 61.1045695,15 60,15 C58.8954305,15 58,14.1045695 58,13 C58,11.8954305 58.8954305,11 60,11 Z M28,11 C29.1045695,11 30,11.8954305 30,13 C30,14.1045695 29.1045695,15 28,15 C26.8954305,15 26,14.1045695 26,13 C26,11.8954305 26.8954305,11 28,11 Z M20,11 C21.1045695,11 22,11.8954305 22,13 C22,14.1045695 21.1045695,15 20,15 C18.8954305,15 18,14.1045695 18,13 C18,11.8954305 18.8954305,11 20,11 Z M44,11 C45.1045695,11 46,11.8954305 46,13 C46,14.1045695 45.1045695,15 44,15 C42.8954305,15 42,14.1045695 42,13 C42,11.8954305 42.8954305,11 44,11 Z M28,7 C27.5108203,7 27.0626598,6.82437653 26.7151303,6.53274171 C27.7709604,6.11110333 28.8515318,5.74010988 29.9539049,5.42040152 C29.7618821,6.32374348 28.9599151,7 28,7 Z M38,5 C38,6.1045695 37.1045695,7 36,7 C34.8954305,7 34,6.1045695 34,5 C34,4.8226476 34.0230845,4.65068688 34.0664126,4.48695862 C35.2820338,4.28511096 36.5171431,4.14452348 37.7695566,4.06796876 C37.9169107,4.34646135 38,4.6635274 38,5 Z M42.2304434,4.06796876 C43.4828569,4.14452348 44.7179662,4.28511096 45.9325388,4.48649888 C45.9769155,4.65068688 46,4.8226476 46,5 C46,6.1045695 45.1045695,7 44,7 C42.8954305,7 42,6.1045695 42,5 C42,4.69875377 42.0666023,4.41306334 42.185885,4.15685046 Z M50.0460951,5.42040152 C51.1484682,5.74010988 52.2290396,6.11110333 53.2850562,6.53062867 C52.9373402,6.82437653 52.4891797,7 52,7 C51.0460536,7 50.2480973,6.33212725 50.0482115,5.43846228 Z" id="Combined-Shape" fill="currentColor"></path>
  </g>
</svg>`,
  enable: true,
  isServerRender: true,
  configHandler: pointMapConfigHandler,
});

export default settings;