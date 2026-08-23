#!/usr/bin/env node
"use strict";var _=Object.create;var T=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var z=Object.getOwnPropertyNames;var E=Object.getPrototypeOf,U=Object.prototype.hasOwnProperty;var K=(e,t,o,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of z(t))!U.call(e,a)&&a!==o&&T(e,a,{get:()=>t[a],enumerable:!(i=L(t,a))||i.enumerable});return e};var b=(e,t,o)=>(o=e!=null?_(E(e)):{},K(t||!e||!e.__esModule?T(o,"default",{value:e,enumerable:!0}):o,e));var R=require("glob"),s=b(require("fs")),r=b(require("path")),n=b(require("picocolors"));var I=require("@ontosdk/core/clean"),C=require("@ontosdk/core/clean");function j(e){let t=[];if(t.push(`# ${e.name}`),t.push(""),t.push(`> ${e.summary}`),t.push(""),e.routes&&e.routes.length>0){t.push("## Key Routes"),t.push("");for(let o of e.routes){let i=`${e.baseUrl}${o.path}`;t.push(`- [${o.path}](${i}): ${o.description}`)}t.push("")}if(e.externalLinks&&e.externalLinks.length>0){t.push("## Resources"),t.push("");for(let o of e.externalLinks)o.description?t.push(`- [${o.title}](${o.url}): ${o.description}`):t.push(`- [${o.title}](${o.url})`);t.push("")}if(e.sections&&e.sections.length>0)for(let o of e.sections)t.push(`## ${o.heading}`),t.push(""),t.push(o.content),t.push("");return t.join(`
`).trim()+`
`}var F="1.6.7";var N=require("url");async function A(){let e=process.cwd(),t=r.default.resolve(e,"onto.config.ts"),o=r.default.resolve(e,"onto.config.js"),i=async l=>{try{let p=await import((0,N.pathToFileURL)(l).href);return p.default||p}catch{return null}},a=await i(t)||await i(o);if(a)return a;try{let l=s.default.existsSync(t)?t:s.default.existsSync(o)?o:null;if(!l)return null;let p=s.default.readFileSync(l,"utf8"),h=p.match(/name\s*:\s*['"`](.*)['"`]/),f=p.match(/summary\s*:\s*['"`](.*)['"`]/),y=p.match(/baseUrl\s*:\s*['"`](.*)['"`]/),x=[],O=/path\s*:\s*['"`](.*?)['"`]\s*,\s*description\s*:\s*['"`](.*?)['"`]/g,c;for(;(c=O.exec(p))!==null;)x.push({path:c[1],description:c[2]});if(h)return{name:h[1],summary:f?f[1]:"",baseUrl:y?y[1]:"",routes:x}}catch{}return null}function M(){let e=r.default.join(process.cwd(),".env.local");s.default.existsSync(e)&&s.default.readFileSync(e,"utf8").split(/\r?\n/).forEach(o=>{let i=o.trim();if(!i||i.startsWith("#"))return;let[a,...l]=i.split("=");a&&l.length>0&&(process.env[a.trim()]=l.join("=").trim().replace(/^["']|["']$/g,""))})}async function B(){let e=process.cwd(),t=r.default.join(e,"onto.config.ts"),o=r.default.join(e,"middleware.ts");console.log(n.default.cyan(`
[Onto] Initializing project...`)),s.default.existsSync(t)?console.log(n.default.yellow("\u2139 onto.config.ts already exists, skipping.")):(s.default.writeFileSync(t,`import { OntoConfig } from '@ontosdk/next';

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
`,"utf8"),console.log(n.default.green("\u2713 Created")+" onto.config.ts")),s.default.existsSync(o)?console.log(n.default.yellow("\u2139 middleware.ts already exists, skipping.")):(s.default.writeFileSync(o,`import { NextRequest } from 'next/server';
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
`,"utf8"),console.log(n.default.green("\u2713 Created")+" middleware.ts")),console.log(n.default.magenta(`
Initialization complete! \u{1F680}`)),console.log(n.default.dim("Next steps:")),console.log(n.default.dim("1. Update your routes in onto.config.ts")),console.log(n.default.dim(`2. Run "npm run build" to generate manifests
`))}async function D(){if(process.argv.slice(2)[0]==="init"){await B();return}M(),console.log(n.default.cyan(`
[Onto] Starting Semantic Output Generation...`));let o=process.cwd(),i=r.default.join(o,".next/server/app"),a=r.default.join(o,"public/.onto");if(!s.default.existsSync(i)){console.log(n.default.yellow(`[Onto] Could not find Next.js app output at ${i}`)),console.log(n.default.yellow('[Onto] Ensure this is run after "next build" and you are using the App Router.'));return}let l=await(0,R.glob)("**/*.html",{cwd:i});if(l.length===0){console.log(n.default.yellow("[Onto] No static HTML files found to process."));return}s.default.existsSync(a)||s.default.mkdirSync(a,{recursive:!0});let p=0,h=0,f=0;for(let c of l){let u=r.default.join(i,c),m=c.split(r.default.sep).join("/"),v=c.replace(/\.html$/,".md"),g=r.default.join(a,v);try{let w=s.default.readFileSync(u,"utf8"),d=(0,C.extractContent)(w,`/${m.replace(/\.html$/,"")}`),P=r.default.dirname(g);s.default.existsSync(P)||s.default.mkdirSync(P,{recursive:!0}),s.default.writeFileSync(g,d.markdown,"utf8"),p+=d.stats.originalHtmlSize,h+=d.stats.markdownSize,f++;let k=(d.stats.originalHtmlSize/1024).toFixed(1),S=(d.stats.markdownSize/1024).toFixed(1),$=m.replace(/\.html$/,"");$==="index"?$="/":$=`/${$}`,console.log(n.default.green("\u2713 Optimized")+n.default.dim(` ${$} `)+n.default.blue(`[${k}KB -> ${S}KB]`))}catch(w){console.error(n.default.red(`\u2717 Failed to process ${c}: ${w.message}`))}}console.log(n.default.bold(n.default.magenta(`Processed ${f} pages. Total Size: ${(p/1024).toFixed(1)}KB -> ${(h/1024).toFixed(1)}KB`)));let y=process.env.ONTO_API_KEY,x=process.env.ONTO_API_URL||process.env.ONTO_DASHBOARD_URL||"https://api.buildonto.dev";if(y&&f>0){console.log(n.default.cyan(`[Onto] Syncing manifest with Control Plane [${x}]...`));try{let c=l.map(m=>{let g=m.split(r.default.sep).join("/").replace(/\.html$/,""),w=g==="index"?"/":`/${g}`,d=r.default.join(a,m.replace(/\.html$/,".md")),P=r.default.join(i,m),k=s.default.readFileSync(d,"utf8"),S;try{S=s.default.statSync(P).size}catch{S=void 0}return{route:w,filename:`${g}.md`,content:k,htmlBytes:S,markdownBytes:Buffer.byteLength(k,"utf8"),sdkVersion:F}}),u=await fetch(`${x}/api/files`,{method:"POST",headers:{"x-onto-key":y,"Content-Type":"application/json"},body:JSON.stringify({files:c})});if(u.ok)console.log(n.default.green(`\u2713 Control Plane sync successful (${c.length} files)`));else{let m=await u.json().catch(()=>({}));console.log(n.default.yellow(`\u26A0 Control Plane sync skipped: ${m.error||u.statusText}`))}}catch(c){console.log(n.default.yellow(`\u26A0 Control Plane sync failed: ${c.message}`))}}let O=await A();if(O){let c=j(O),u=r.default.join(o,"public/llms.txt"),m=r.default.join(o,"public");s.default.existsSync(m)||s.default.mkdirSync(m,{recursive:!0}),s.default.writeFileSync(u,c,"utf8"),console.log(n.default.green("\u2713 Generated")+n.default.dim(" /llms.txt"))}console.log(n.default.dim(`Edge payloads are ready at /public/.onto/*
`))}D().catch(e=>{console.error(n.default.red(`[Onto] Fatal Error: ${e.message}`)),process.exit(1)});
//# sourceMappingURL=cli.js.map