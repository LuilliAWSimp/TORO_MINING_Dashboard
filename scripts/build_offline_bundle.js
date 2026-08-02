#!/usr/bin/env node
/*
 * Offline validation bundle.
 * Uses the exact React/TypeScript application source without reaching npm.
 * The normal production build remains `npm run build` (Vite + Recharts + Lucide).
 */
const fs = require('fs');
const path = require('path');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');

const projectRoot = path.resolve(__dirname, '..');
const frontendRoot = path.join(projectRoot, 'frontend');
const srcRoot = path.join(frontendRoot, 'src');
const distRoot = path.join(frontendRoot, 'dist');
const assetsRoot = path.join(distRoot, 'assets');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function readSourceFromMap(file, includes) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const index = data.sources.findIndex((source) => source.includes(includes));
  if (index < 0) throw new Error(`No se encontró ${includes} en ${file}`);
  return data.sourcesContent[index];
}

function moduleFunction(source) {
  return `function(require,module,exports){\n${source}\n}`;
}

const notebookStatic = '/opt/pyvenv/lib/python3.13/site-packages/notebook/static';
const runtimeSources = {
  react: readSourceFromMap(path.join(notebookStatic, '7378.df12091e8f42a5da0429.js.map'), 'react/cjs/react.production.min.js'),
  jsx: readSourceFromMap(path.join(notebookStatic, '7811.fa11577c84ea92d4102c.js.map'), 'react/cjs/react-jsx-runtime.production.min.js'),
  scheduler: readSourceFromMap(path.join(notebookStatic, '1542.8f0b79431f7af2f43f1e.js.map'), 'scheduler/cjs/scheduler.production.min.js'),
  reactDom: readSourceFromMap(path.join(notebookStatic, '1542.8f0b79431f7af2f43f1e.js.map'), 'react-dom/cjs/react-dom.production.min.js'),
  reactDomClient: readSourceFromMap(path.join(notebookStatic, '1871.c375ee093b7e51966390.js.map'), 'react-dom/client.js'),
};

const routerSource = String.raw`
'use strict';
const React = require('react');
const RouterContext = React.createContext({ path: '/', navigate: function(){} });
const OutletContext = React.createContext(null);
function normalize(value) {
  if (!value) return '/';
  const clean = String(value).split('?')[0].split('#')[0];
  return clean === '/' ? '/' : '/' + clean.replace(/^\/+|\/+$/g, '');
}
function BrowserRouter(props) {
  const [current, setCurrent] = React.useState((window.location.protocol === 'file:' || window.location.protocol === 'about:') ? '/' : normalize(window.location.pathname));
  React.useEffect(function(){
    function onPop(){ setCurrent(normalize(window.location.pathname)); }
    window.addEventListener('popstate', onPop);
    return function(){ window.removeEventListener('popstate', onPop); };
  }, []);
  const navigate = React.useCallback(function(to, options){
    const next = normalize(to);
    if (window.location.protocol !== 'file:' && window.location.protocol !== 'about:') { if (options && options.replace) history.replaceState({}, '', next); else history.pushState({}, '', next); }
    setCurrent(next);
  }, []);
  return React.createElement(RouterContext.Provider, { value: { path: current, navigate: navigate } }, props.children);
}
function Route(){ return null; }
function Routes(props){
  const router = React.useContext(RouterContext);
  const roots = React.Children.toArray(props.children);
  let shell = null;
  let children = roots;
  const root = roots.find(function(item){ return item && item.props && item.props.children; });
  if (root) { shell = root.props.element; children = React.Children.toArray(root.props.children); }
  let selected = children.find(function(item){
    if (!item || !item.props) return false;
    if (item.props.index) return router.path === '/';
    if (item.props.path === '*') return false;
    return normalize(item.props.path) === router.path;
  });
  if (!selected) selected = children.find(function(item){ return item && item.props && item.props.path === '*'; });
  const outlet = selected && selected.props ? selected.props.element : null;
  if (!shell) return outlet;
  return React.createElement(OutletContext.Provider, { value: outlet }, shell);
}
function Outlet(){ return React.useContext(OutletContext); }
function Navigate(props){
  const router = React.useContext(RouterContext);
  React.useEffect(function(){ router.navigate(props.to, {replace: props.replace}); }, [props.to]);
  return null;
}
function NavLink(props){
  const router = React.useContext(RouterContext);
  const target = normalize(props.to);
  const active = props.end ? router.path === target : (target === '/' ? router.path === '/' : router.path.indexOf(target) === 0);
  const className = typeof props.className === 'function' ? props.className({isActive: active}) : props.className;
  const other = Object.assign({}, props);
  delete other.to; delete other.end; delete other.children;
  other.href = target; other.className = className;
  other.onClick = function(event){
    if (props.onClick) props.onClick(event);
    if (!event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
      event.preventDefault(); router.navigate(target);
    }
  };
  return React.createElement('a', other, props.children);
}
exports.BrowserRouter=BrowserRouter; exports.Route=Route; exports.Routes=Routes;
exports.Outlet=Outlet; exports.Navigate=Navigate; exports.NavLink=NavLink;
`;

const lucideNames = [
  'Activity','AlertCircle','AlertTriangle','BarChart3','Boxes','CircleOff','CirclePause','CirclePlay','CircleCheck','CircleInfo','OctagonAlert','WifiOff','ArrowDownRight','ArrowUpRight','BatteryCharging','BellRing','Box','CalendarDays','ChevronRight','CircleDot','Clock3','Database','Download','Droplets','Factory','FileText','Filter','Flag','FlaskConical','Gauge','GitBranch','Info','LayoutDashboard','LineChart','LoaderCircle','Minus','Moon','PackageCheck','Power','Radio','RadioTower','RefreshCw','Scale','ShieldCheck','Sun','TriangleAlert','Waves','X','Zap'
];
const lucideSource = String.raw`
'use strict';
const React = require('react');
function makeIcon(name){
  return function Icon(props){
    const size = props.size || 24; const strokeWidth = props.strokeWidth || 1.8;
    const clean = Object.assign({}, props); delete clean.size; delete clean.strokeWidth;
    let children = [
      React.createElement('circle',{key:'c',cx:12,cy:12,r:8}),
      React.createElement('path',{key:'p',d:'M8 12h8M12 8v8'})
    ];
    if (name==='CircleCheck' || name==='ShieldCheck') children=[React.createElement('circle',{key:'c',cx:12,cy:12,r:9}),React.createElement('path',{key:'p',d:'m8 12 2.5 2.5L16 9'})];
    else if (name==='TriangleAlert' || name==='AlertTriangle') children=[React.createElement('path',{key:'t',d:'M10.3 3.4 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0Z'}),React.createElement('path',{key:'p',d:'M12 9v4M12 17h.01'})];
    else if (name==='BellRing' || name==='AlertCircle') children=[React.createElement('path',{key:'b',d:'M10.3 5.2A4.5 4.5 0 0 1 16.5 9v3.2c0 1.2.5 2.4 1.4 3.2l.6.6H5.5l.6-.6a4.5 4.5 0 0 0 1.4-3.2V9a4.5 4.5 0 0 1 2.8-3.8ZM10 20h4'}),React.createElement('path',{key:'r',d:'M5 5 3.5 3.5M19 5l1.5-1.5'})];
    else if (name==='OctagonAlert') children=[React.createElement('path',{key:'o',d:'m7.9 2 8.2 0L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9Z'}),React.createElement('path',{key:'p',d:'M12 8v5M12 17h.01'})];
    else if (name==='CirclePlay') children=[React.createElement('circle',{key:'c',cx:12,cy:12,r:9}),React.createElement('path',{key:'p',d:'m10 8 6 4-6 4Z'})];
    else if (name==='CirclePause') children=[React.createElement('circle',{key:'c',cx:12,cy:12,r:9}),React.createElement('path',{key:'p',d:'M9.5 9v6M14.5 9v6'})];
    else if (name==='WifiOff' || name==='CircleOff') children=[React.createElement('path',{key:'w',d:'M2 8.5a15 15 0 0 1 3.2-1.8M8.5 5.2A15 15 0 0 1 22 8.5M5 12a10 10 0 0 1 3-1.8M11.5 9.1A10 10 0 0 1 19 12M8.5 15.5a5 5 0 0 1 6.2-.7M12 19h.01M3 3l18 18'})];
    else if (name==='CircleInfo' || name==='Info') children=[React.createElement('circle',{key:'c',cx:12,cy:12,r:9}),React.createElement('path',{key:'p',d:'M12 11v5M12 8h.01'})];
    else if (name==='Database') children=[React.createElement('ellipse',{key:'e',cx:12,cy:5,rx:8,ry:3}),React.createElement('path',{key:'p',d:'M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6'})];
    else if (name==='RefreshCw') children=[React.createElement('path',{key:'p1',d:'M20 6v5h-5'}),React.createElement('path',{key:'p2',d:'M4 18v-5h5'}),React.createElement('path',{key:'p3',d:'M6.1 9a7 7 0 0 1 11.7-2.6L20 11M4 13l2.2 4.6A7 7 0 0 0 17.9 15'})];
    else if (name.indexOf('Arrow')>=0 || name==='ChevronRight') children=[React.createElement('path',{key:'p',d:'M8 6l6 6-6 6'})];
    else if (name==='Minus') children=[React.createElement('path',{key:'p',d:'M7 12h10'})];
    else if (name==='X') children=[React.createElement('path',{key:'p',d:'M8 8l8 8M16 8l-8 8'})];
    else if (name==='Moon') children=[React.createElement('path',{key:'c',d:'M19 15a7 7 0 0 1-10-10 8 8 0 1 0 10 10z'})];
    else if (name==='Sun') children=[React.createElement('circle',{key:'c',cx:12,cy:12,r:4}),React.createElement('path',{key:'p',d:'M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19'})];
    return React.createElement('svg',Object.assign({width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:strokeWidth,strokeLinecap:'round',strokeLinejoin:'round','data-icon':name},clean),children);
  }
}
const names = ${JSON.stringify(lucideNames)};
names.forEach(function(name){ exports[name]=makeIcon(name); });
`;

const rechartsSource = String.raw`
'use strict';
const React = require('react');
function marker(kind){ function C(){return null;} C.__chartKind=kind; return C; }
const CartesianGrid=marker('grid'), XAxis=marker('xaxis'), YAxis=marker('yaxis'), Tooltip=marker('tooltip'), Line=marker('line'), Area=marker('area');
function ResponsiveContainer(props){ return React.createElement('div',{className:'recharts-responsive-container',style:{width:'100%',height:'100%',minHeight:0,position:'relative'}},props.children); }
function chartFactory(){
  return function SimpleChart(props){
    const data = Array.isArray(props.data) ? props.data : [];
    const [activeIndex,setActiveIndex] = React.useState(null);
    if (!data.length) return React.createElement('div',{className:'drawer-loading'},'Sin tendencia disponible');
    const children = React.Children.toArray(props.children);
    const series = children.filter(function(c){return c && c.type && (c.type.__chartKind==='line'||c.type.__chartKind==='area');}).map(function(c){return c.props;});
    const xAxis = children.find(function(c){return c && c.type && c.type.__chartKind==='xaxis';});
    const yAxis = children.find(function(c){return c && c.type && c.type.__chartKind==='yaxis';});
    const tooltip = children.find(function(c){return c && c.type && c.type.__chartKind==='tooltip';});
    const values=[]; data.forEach(function(row){ series.forEach(function(s){ const v=Number(row[s.dataKey]); if(Number.isFinite(v)) values.push(v); }); });
    let min=values.length?Math.min.apply(null,values):0, max=values.length?Math.max.apply(null,values):1;
    const domain=yAxis&&Array.isArray(yAxis.props.domain)?yAxis.props.domain:null;
    if(domain){ if(Number.isFinite(Number(domain[0]))) min=Number(domain[0]); if(Number.isFinite(Number(domain[1]))) max=Number(domain[1]); }
    if(min===max){min-=1;max+=1;} else if(!domain || domain[0]==='auto' || domain[1]==='auto'){const pad=(max-min)*0.12; min-=pad; max+=pad;}
    const W=800,H=230,L=48,R=14,T=16,B=32;
    function x(i){return L+(W-L-R)*(data.length<=1?0:i/(data.length-1));}
    function y(v){return T+(H-T-B)*(1-(v-min)/(max-min));}
    function setFromPointer(event){
      const rect=event.currentTarget.getBoundingClientRect();
      const px=(event.clientX-rect.left)/Math.max(rect.width,1)*W;
      const ratio=Math.max(0,Math.min(1,(px-L)/(W-L-R)));
      setActiveIndex(Math.round(ratio*(data.length-1)));
    }
    const elements=[];
    elements.push(React.createElement('rect',{key:'capture',x:0,y:0,width:W,height:H,fill:'transparent'}));
    for(let i=0;i<5;i++){const yy=T+(H-T-B)*i/4; const value=max-(max-min)*i/4; elements.push(React.createElement('line',{key:'g'+i,x1:L,x2:W-R,y1:yy,y2:yy,stroke:'var(--chart-grid)',strokeWidth:1})); elements.push(React.createElement('text',{key:'gy'+i,x:L-7,y:yy+4,textAnchor:'end',fill:'var(--chart-axis-text)',fontSize:10},value.toFixed(Math.abs(value)<10?1:0)));}
    const labelIndexes=[0,Math.floor((data.length-1)/4),Math.floor((data.length-1)/2),Math.floor((data.length-1)*3/4),data.length-1].filter(function(v,i,a){return v>=0&&a.indexOf(v)===i;});
    labelIndexes.forEach(function(i){const row=data[i]||{}; let label=row[(xAxis&&xAxis.props.dataKey)||'timestamp']||''; if(xAxis&&typeof xAxis.props.tickFormatter==='function') label=xAxis.props.tickFormatter(label); elements.push(React.createElement('text',{key:'x'+i,x:x(i),y:H-8,textAnchor:i===0?'start':i===data.length-1?'end':'middle',fill:'var(--chart-axis-text)',fontSize:10},label));});
    series.forEach(function(s,si){
      const points=data.map(function(row,i){const v=Number(row[s.dataKey]); return Number.isFinite(v)?[x(i),y(v),v,i]:null;}).filter(Boolean);
      if(!points.length)return;
      const d=points.map(function(p,i){return (i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1);}).join(' ');
      if(s.fillOpacity){ const ad=d+' L '+points[points.length-1][0].toFixed(1)+' '+(H-B)+' L '+points[0][0].toFixed(1)+' '+(H-B)+' Z'; elements.push(React.createElement('path',{key:'a'+si,d:ad,fill:s.fill||s.stroke,fillOpacity:s.fillOpacity,stroke:'none'})); }
      elements.push(React.createElement('path',{key:'s'+si,d:d,fill:'none',stroke:s.stroke||'currentColor',strokeWidth:s.strokeWidth||2,strokeLinejoin:'round',strokeLinecap:'round'}));
      if(activeIndex!==null){ const row=data[activeIndex]; const v=Number(row&&row[s.dataKey]); if(Number.isFinite(v)) elements.push(React.createElement('circle',{key:'active'+si,cx:x(activeIndex),cy:y(v),r:5,fill:'var(--surface)',stroke:s.stroke||'currentColor',strokeWidth:2})); }
    });
    if(activeIndex!==null) elements.push(React.createElement('line',{key:'cursor',x1:x(activeIndex),x2:x(activeIndex),y1:T,y2:H-B,stroke:'var(--chart-cursor)',strokeWidth:1.25,strokeDasharray:'4 4'}));
    const svg=React.createElement('svg',{className:'offline-chart recharts-surface',viewBox:'0 0 '+W+' '+H,preserveAspectRatio:'none',role:'img','aria-label':'Gráfica de tendencia interactiva',onPointerMove:setFromPointer,onPointerDown:setFromPointer,onPointerLeave:function(event){if(event.pointerType!=='touch')setActiveIndex(null);}},elements);
    let tooltipNode=null;
    if(activeIndex!==null && tooltip && tooltip.props.content){
      const row=data[activeIndex]||{}; const xKey=(xAxis&&xAxis.props.dataKey)||'timestamp';
      const payload=series.map(function(s){return {dataKey:s.dataKey,name:s.name,value:row[s.dataKey],color:s.stroke,stroke:s.stroke,payload:row};}).filter(function(item){return Number.isFinite(Number(item.value));});
      const content=React.cloneElement(tooltip.props.content,{active:true,payload:payload,label:row[xKey]});
      const right=activeIndex>data.length/2;
      tooltipNode=React.createElement('div',{className:'recharts-tooltip-wrapper offline-tooltip-wrapper',style:{position:'absolute',zIndex:40,pointerEvents:'none',top:'8px',left:(x(activeIndex)/W*100)+'%',transform:right?'translateX(-102%)':'translateX(10px)'}},content);
    }
    return React.createElement('div',{className:'offline-chart-host recharts-wrapper'},svg,tooltipNode);
  }
}
const LineChart=chartFactory(), AreaChart=chartFactory();
exports.ResponsiveContainer=ResponsiveContainer; exports.CartesianGrid=CartesianGrid; exports.XAxis=XAxis; exports.YAxis=YAxis; exports.Tooltip=Tooltip; exports.Line=Line; exports.Area=Area; exports.LineChart=LineChart; exports.AreaChart=AreaChart;
`;


const modules = {};
modules['react'] = moduleFunction(runtimeSources.react);
modules['react/jsx-runtime'] = moduleFunction(runtimeSources.jsx);
modules['scheduler'] = moduleFunction(runtimeSources.scheduler);
modules['react-dom'] = moduleFunction(runtimeSources.reactDom);
modules['react-dom/client'] = moduleFunction(runtimeSources.reactDomClient);
modules['react-router-dom'] = moduleFunction(routerSource);
modules['lucide-react'] = moduleFunction(lucideSource);
modules['recharts'] = moduleFunction(rechartsSource);

const diagnostics = [];
for (const file of walk(srcRoot)) {
  if (!/\.(ts|tsx)$/.test(file) || file.endsWith('.d.ts')) continue;
  const source = fs.readFileSync(file, 'utf8');
  const result = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      sourceMap: false,
    },
  });
  if (result.diagnostics) diagnostics.push(...result.diagnostics.map((item) => ({file, item})));
  const rel = path.relative(frontendRoot, file).replace(/\\/g, '/').replace(/\.(tsx|ts)$/, '.js');
  modules[rel] = moduleFunction(result.outputText);
}
if (diagnostics.length) {
  for (const {file,item} of diagnostics) console.error(file, ts.flattenDiagnosticMessageText(item.messageText, '\n'));
  process.exit(1);
}

const serialized = Object.entries(modules).map(([id, fn]) => `${JSON.stringify(id)}:${fn}`).join(',\n');
const bundle = `(function(){\n'use strict';\nvar process={env:{NODE_ENV:'production'}};\nvar modules={${serialized}};\nvar cache={};\nfunction normalize(p){var parts=[];p.split('/').forEach(function(x){if(!x||x==='.')return;if(x==='..')parts.pop();else parts.push(x);});return parts.join('/');}\nfunction resolve(request,parent){if(request.endsWith('.css'))return '@css';if(request[0]!=='.')return request;var base=parent.split('/');base.pop();var id=normalize(base.join('/')+'/'+request);if(modules[id])return id;if(modules[id+'.js'])return id+'.js';if(modules[id+'/index.js'])return id+'/index.js';return id;}\nfunction req(request,parent){var id=resolve(request,parent||'');if(id==='@css')return {};if(cache[id])return cache[id].exports;if(!modules[id])throw new Error('Módulo no encontrado: '+request+' desde '+parent+' -> '+id);var module={exports:{}};cache[id]=module;modules[id](function(child){return req(child,id);},module,module.exports);return module.exports;}\nwindow.__TORO_OFFLINE_BUNDLE__=true;req('src/main.js','');\n})();`;

fs.rmSync(distRoot, {recursive:true, force:true});
fs.mkdirSync(assetsRoot, {recursive:true});
fs.writeFileSync(path.join(assetsRoot, 'app.js'), bundle);
let css = fs.readFileSync(path.join(srcRoot, 'styles', 'global.css'), 'utf8');
css += '\n.offline-chart-host{position:relative;width:100%;height:100%;overflow:visible}.offline-chart{width:100%;height:100%;display:block;overflow:visible}.chart-wrap>div:last-child{min-height:0}\n';
fs.writeFileSync(path.join(assetsRoot, 'app.css'), css);
for (const name of ['toro-mining-logo.png','toro-mining-mark.png']) fs.copyFileSync(path.join(frontendRoot,'public',name), path.join(distRoot,name));
fs.writeFileSync(path.join(distRoot,'index.html'), `<!doctype html><html lang="es" data-theme="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#111311"><meta name="description" content="Dashboard industrial local TORO MINING - Mina San Bernardo"><link rel="icon" href="/toro-mining-mark.png"><link rel="stylesheet" href="/assets/app.css"><title>TORO MINING | Mina San Bernardo</title></head><body><div id="root"></div><script defer src="/assets/app.js"></script></body></html>`);
console.log(`Bundle offline generado: ${path.relative(projectRoot, distRoot)}`);
console.log(`Módulos compilados: ${Object.keys(modules).length}`);
