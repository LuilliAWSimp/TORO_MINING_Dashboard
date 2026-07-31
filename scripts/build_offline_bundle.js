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
  'Activity','AlertCircle','AlertTriangle','BarChart3','Boxes','CircleOff','CirclePause','CirclePlay','ArrowDownRight','ArrowUpRight','BatteryCharging','BellRing','Box','CalendarDays','ChevronRight','CircleDot','Clock3','Database','Download','Droplets','Factory','FileText','Filter','Flag','FlaskConical','Gauge','GitBranch','Info','LayoutDashboard','LoaderCircle','Minus','Moon','PackageCheck','Power','Radio','RadioTower','RefreshCw','Scale','ShieldCheck','Sun','TriangleAlert','Waves','X','Zap'
];
const lucideSource = String.raw`
'use strict';
const React = require('react');
function makeIcon(name){
  return function Icon(props){
    const size = props.size || 24; const strokeWidth = props.strokeWidth || 1.8;
    const clean = Object.assign({}, props); delete clean.size; delete clean.strokeWidth;
    const children = [
      React.createElement('circle',{key:'c',cx:12,cy:12,r:8}),
      React.createElement('path',{key:'p',d:'M8 12h8M12 8v8'})
    ];
    if (name.indexOf('Arrow')>=0 || name==='ChevronRight') children[1]=React.createElement('path',{key:'p',d:'M8 6l6 6-6 6'});
    if (name==='Minus') children[1]=React.createElement('path',{key:'p',d:'M7 12h10'});
    if (name==='X') children[1]=React.createElement('path',{key:'p',d:'M8 8l8 8M16 8l-8 8'});
    if (name==='Moon') children[0]=React.createElement('path',{key:'c',d:'M19 15a7 7 0 0 1-10-10 8 8 0 1 0 10 10z'});
    if (name==='Sun') children.splice(0,2,React.createElement('circle',{key:'c',cx:12,cy:12,r:4}),React.createElement('path',{key:'p',d:'M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19'}));
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
function ResponsiveContainer(props){ return React.createElement('div',{style:{width:'100%',height:'100%',minHeight:0}},props.children); }
function chartFactory(){
  return function SimpleChart(props){
    const data = Array.isArray(props.data) ? props.data : [];
    if (!data.length) return React.createElement('div',{className:'drawer-loading'},'Sin tendencia disponible');
    const children = React.Children.toArray(props.children);
    const series = children.filter(function(c){return c && c.type && (c.type.__chartKind==='line'||c.type.__chartKind==='area');}).map(function(c){return c.props;});
    const xAxis = children.find(function(c){return c && c.type && c.type.__chartKind==='xaxis';});
    const values=[]; data.forEach(function(row){ series.forEach(function(s){ const v=Number(row[s.dataKey]); if(Number.isFinite(v)) values.push(v); }); });
    let min=values.length?Math.min.apply(null,values):0, max=values.length?Math.max.apply(null,values):1;
    if(min===max){min-=1;max+=1;} const pad=(max-min)*0.12; min-=pad; max+=pad;
    const W=800,H=230,L=48,R=14,T=16,B=32;
    function x(i){return L+(W-L-R)*(data.length<=1?0:i/(data.length-1));}
    function y(v){return T+(H-T-B)*(1-(v-min)/(max-min));}
    const elements=[];
    for(let i=0;i<5;i++){const yy=T+(H-T-B)*i/4; const value=max-(max-min)*i/4; elements.push(React.createElement('line',{key:'g'+i,x1:L,x2:W-R,y1:yy,y2:yy,stroke:'var(--chart-grid)',strokeWidth:1})); elements.push(React.createElement('text',{key:'gy'+i,x:L-7,y:yy+4,textAnchor:'end',fill:'var(--text-muted)',fontSize:10},value.toFixed(Math.abs(value)<10?1:0)));}
    const labelIndexes=[0,Math.floor((data.length-1)/4),Math.floor((data.length-1)/2),Math.floor((data.length-1)*3/4),data.length-1].filter(function(v,i,a){return v>=0&&a.indexOf(v)===i;});
    labelIndexes.forEach(function(i){const row=data[i]||{}; let label=row.timestamp||''; if(xAxis&&typeof xAxis.props.tickFormatter==='function') label=xAxis.props.tickFormatter(label); elements.push(React.createElement('text',{key:'x'+i,x:x(i),y:H-8,textAnchor:i===0?'start':i===data.length-1?'end':'middle',fill:'var(--text-muted)',fontSize:10},label));});
    series.forEach(function(s,si){
      const points=data.map(function(row,i){const v=Number(row[s.dataKey]); return Number.isFinite(v)?[x(i),y(v),v]:null;}).filter(Boolean);
      if(!points.length)return;
      const d=points.map(function(p,i){return (i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1);}).join(' ');
      if(s.fillOpacity){ const ad=d+' L '+points[points.length-1][0].toFixed(1)+' '+(H-B)+' L '+points[0][0].toFixed(1)+' '+(H-B)+' Z'; elements.push(React.createElement('path',{key:'a'+si,d:ad,fill:s.fill||s.stroke,fillOpacity:s.fillOpacity,stroke:'none'})); }
      elements.push(React.createElement('path',{key:'s'+si,d:d,fill:'none',stroke:s.stroke||'currentColor',strokeWidth:s.strokeWidth||2,strokeLinejoin:'round',strokeLinecap:'round'}));
      points.forEach(function(p,i){ if(i%Math.max(1,Math.floor(points.length/8))===0){ elements.push(React.createElement('circle',{key:'p'+si+'-'+i,cx:p[0],cy:p[1],r:7,fill:'transparent'},React.createElement('title',null,(s.name||s.dataKey)+': '+p[2]))); }});
    });
    return React.createElement('svg',{className:'offline-chart',viewBox:'0 0 '+W+' '+H,preserveAspectRatio:'none',role:'img','aria-label':'Gráfica de tendencia'},elements);
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
css += '\n.offline-chart{width:100%;height:100%;display:block;overflow:visible}.chart-wrap>div:last-child{min-height:0}\n';
fs.writeFileSync(path.join(assetsRoot, 'app.css'), css);
for (const name of ['toro-mining-logo.png','toro-mining-mark.png']) fs.copyFileSync(path.join(frontendRoot,'public',name), path.join(distRoot,name));
fs.writeFileSync(path.join(distRoot,'index.html'), `<!doctype html><html lang="es" data-theme="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#111311"><meta name="description" content="Dashboard industrial local TORO MINING - Mina San Bernardo"><link rel="icon" href="/toro-mining-mark.png"><link rel="stylesheet" href="/assets/app.css"><title>TORO MINING | Mina San Bernardo</title></head><body><div id="root"></div><script defer src="/assets/app.js"></script></body></html>`);
console.log(`Bundle offline generado: ${path.relative(projectRoot, distRoot)}`);
console.log(`Módulos compilados: ${Object.keys(modules).length}`);
