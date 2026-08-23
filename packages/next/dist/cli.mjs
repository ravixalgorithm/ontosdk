#!/usr/bin/env node
import{glob as j}from"glob";import s from"fs";import r from"path";import o from"picocolors";import{extractContent as E}from"@ontosdk/core/clean";import{extractContent as C}from"@ontosdk/core/clean";function v(n){let t=[];if(t.push(`# ${n.name}`),t.push(""),t.push(`> ${n.summary}`),t.push(""),n.routes&&n.routes.length>0){t.push("## Key Routes"),t.push("");for(let e of n.routes){let i=`${n.baseUrl}${e.path}`;t.push(`- [${e.path}](${i}): ${e.description}`)}t.push("")}if(n.externalLinks&&n.externalLinks.length>0){t.push("## Resources"),t.push("");for(let e of n.externalLinks)e.description?t.push(`- [${e.title}](${e.url}): ${e.description}`):t.push(`- [${e.title}](${e.url})`);t.push("")}if(n.sections&&n.sections.length>0)for(let e of n.sections)t.push(`## ${e.heading}`),t.push(""),t.push(e.content),t.push("");return t.join(`
`).trim()+`
`}var T="1.6.7";import{pathToFileURL as F}from"url";async function R(){let n=process.cwd(),t=r.resolve(n,"onto.config.ts"),e=r.resolve(n,"onto.config.js"),i=async c=>{try{let l=await import(F(c).href);return l.default||l}catch{return null}},m=await i(t)||await i(e);if(m)return m;try{let c=s.existsSync(t)?t:s.existsSync(e)?e:null;if(!c)return null;let l=s.readFileSync(c,"utf8"),h=l.match(/name\s*:\s*['"`](.*)['"`]/),f=l.match(/summary\s*:\s*['"`](.*)['"`]/),y=l.match(/baseUrl\s*:\s*['"`](.*)['"`]/),x=[],O=/path\s*:\s*['"`](.*?)['"`]\s*,\s*description\s*:\s*['"`](.*?)['"`]/g,a;for(;(a=O.exec(l))!==null;)x.push({path:a[1],description:a[2]});if(h)return{name:h[1],summary:f?f[1]:"",baseUrl:y?y[1]:"",routes:x}}catch{}return null}function N(){let n=r.join(process.cwd(),".env.local");s.existsSync(n)&&s.readFileSync(n,"utf8").split(/\r?\n/).forEach(e=>{let i=e.trim();if(!i||i.startsWith("#"))return;let[m,...c]=i.split("=");m&&c.length>0&&(process.env[m.trim()]=c.join("=").trim().replace(/^["']|["']$/g,""))})}async function _(){let n=process.cwd(),t=r.join(n,"onto.config.ts"),e=r.join(n,"middleware.ts");console.log(o.cyan(`
[Onto] Initializing project...`)),s.existsSync(t)?console.log(o.yellow("\u2139 onto.config.ts already exists, skipping.")):(s.writeFileSync(t,`import { OntoConfig } from '@ontosdk/next';

const config: OntoConfig = {
  name: 'My Project',
  summary: 'A short description of my project for AI agents.',
  baseUrl: 'https://example.com',
  routes: [
    { 
      path: '/', 
      description: 'The homepage of my application.',
      pageType: 'about'
    }
  ]
};

export default config;
`,"utf8"),console.log(o.green("\u2713 Created")+" onto.config.ts")),s.existsSync(e)?console.log(o.yellow("\u2139 middleware.ts already exists, skipping.")):(s.writeFileSync(e,`import { NextRequest } from 'next/server';
import { ontoMiddleware } from '@ontosdk/next/middleware';
import ontoConfig from './onto.config';

export const middleware = (req: NextRequest) => ontoMiddleware(req, ontoConfig);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
`,"utf8"),console.log(o.green("\u2713 Created")+" middleware.ts")),console.log(o.magenta(`
Initialization complete! \u{1F680}`)),console.log(o.dim("Next steps:")),console.log(o.dim("1. Update your routes in onto.config.ts")),console.log(o.dim(`2. Run "npm run build" to generate manifests
`))}async function L(){if(process.argv.slice(2)[0]==="init"){await _();return}N(),console.log(o.cyan(`
[Onto] Starting Semantic Output Generation...`));let e=process.cwd(),i=r.join(e,".next/server/app"),m=r.join(e,"public/.onto");if(!s.existsSync(i)){console.log(o.yellow(`[Onto] Could not find Next.js app output at ${i}`)),console.log(o.yellow('[Onto] Ensure this is run after "next build" and you are using the App Router.'));return}let c=await j("**/*.html",{cwd:i});if(c.length===0){console.log(o.yellow("[Onto] No static HTML files found to process."));return}s.existsSync(m)||s.mkdirSync(m,{recursive:!0});let l=0,h=0,f=0;for(let a of c){let u=r.join(i,a),p=a.split(r.sep).join("/"),b=a.replace(/\.html$/,".md"),g=r.join(m,b);try{let w=s.readFileSync(u,"utf8"),d=C(w,`/${p.replace(/\.html$/,"")}`),P=r.dirname(g);s.existsSync(P)||s.mkdirSync(P,{recursive:!0}),s.writeFileSync(g,d.markdown,"utf8"),l+=d.stats.originalHtmlSize,h+=d.stats.markdownSize,f++;let k=(d.stats.originalHtmlSize/1024).toFixed(1),S=(d.stats.markdownSize/1024).toFixed(1),$=p.replace(/\.html$/,"");$==="index"?$="/":$=`/${$}`,console.log(o.green("\u2713 Optimized")+o.dim(` ${$} `)+o.blue(`[${k}KB -> ${S}KB]`))}catch(w){console.error(o.red(`\u2717 Failed to process ${a}: ${w.message}`))}}console.log(o.bold(o.magenta(`Processed ${f} pages. Total Size: ${(l/1024).toFixed(1)}KB -> ${(h/1024).toFixed(1)}KB`)));let y=process.env.ONTO_API_KEY,x=process.env.ONTO_API_URL||process.env.ONTO_DASHBOARD_URL||"https://api.buildonto.dev";if(y&&f>0){console.log(o.cyan(`[Onto] Syncing manifest with Control Plane [${x}]...`));try{let a=c.map(p=>{let g=p.split(r.sep).join("/").replace(/\.html$/,""),w=g==="index"?"/":`/${g}`,d=r.join(m,p.replace(/\.html$/,".md")),P=r.join(i,p),k=s.readFileSync(d,"utf8"),S;try{S=s.statSync(P).size}catch{S=void 0}return{route:w,filename:`${g}.md`,content:k,htmlBytes:S,markdownBytes:Buffer.byteLength(k,"utf8"),sdkVersion:T}}),u=await fetch(`${x}/api/files`,{method:"POST",headers:{"x-onto-key":y,"Content-Type":"application/json"},body:JSON.stringify({files:a})});if(u.ok)console.log(o.green(`\u2713 Control Plane sync successful (${a.length} files)`));else{let p=await u.json().catch(()=>({}));console.log(o.yellow(`\u26A0 Control Plane sync skipped: ${p.error||u.statusText}`))}}catch(a){console.log(o.yellow(`\u26A0 Control Plane sync failed: ${a.message}`))}}let O=await R();if(O){let a=v(O),u=r.join(e,"public/llms.txt"),p=r.join(e,"public");s.existsSync(p)||s.mkdirSync(p,{recursive:!0}),s.writeFileSync(u,a,"utf8"),console.log(o.green("\u2713 Generated")+o.dim(" /llms.txt"))}console.log(o.dim(`Edge payloads are ready at /public/.onto/*
`))}L().catch(n=>{console.error(o.red(`[Onto] Fatal Error: ${n.message}`)),process.exit(1)});
//# sourceMappingURL=cli.mjs.map