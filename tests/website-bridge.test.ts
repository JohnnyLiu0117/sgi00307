import assert from 'node:assert/strict';
import test from 'node:test';
import { allowedWebsiteRequest, isSameOriginMutation, websiteRequest, WebsiteBridgeError } from '../src/lib/website-bridge';

test('management proxy only accepts supported resources, methods and positive IDs',()=>{
  assert.equal(allowedWebsiteRequest(['qa'],'GET'),true);
  assert.equal(allowedWebsiteRequest(['qa','12'],'PATCH'),true);
  assert.equal(allowedWebsiteRequest(['upload'],'POST'),true);
  for(const [path,method] of [[['qa'],'POST'],[['qa','0'],'PATCH'],[['articles','../../settings'],'PUT'],[['content','1','extra'],'GET'],[['auth'],'GET'],[['profile'],'DELETE'],[['events'],'POST']] as const)
    assert.equal(allowedWebsiteRequest([...path],method),false);
});

test('cookie-authenticated mutations reject foreign and missing origins',()=>{
  const previous=process.env.NEXTAUTH_URL;delete process.env.NEXTAUTH_URL;
  try{
    assert.equal(isSameOriginMutation(new Request('https://studio.example/api/admin/website/qa/1',{headers:{origin:'https://studio.example'}})),true);
    assert.equal(isSameOriginMutation(new Request('https://studio.example/api/admin/website/qa/1',{headers:{origin:'https://other.example'}})),false);
    assert.equal(isSameOriginMutation(new Request('https://studio.example/api/admin/website/qa/1')),false);
    assert.equal(isSameOriginMutation(new Request('https://studio.example/api/admin/website/qa/1',{headers:{origin:'https://studio.example','sec-fetch-site':'cross-site'}})),false);
  }finally{if(previous===undefined)delete process.env.NEXTAUTH_URL;else process.env.NEXTAUTH_URL=previous;}
});

test('website management credentials stay in server requests and redirects are refused',async()=>{
  const previousSecret=process.env.QA_BRIDGE_SECRET,previousBase=process.env.WEBSITE_BASE_URL,previousFetch=globalThis.fetch;
  process.env.QA_BRIDGE_SECRET='test-only-bridge-secret';delete process.env.WEBSITE_BASE_URL;
  try{
    let called=false;
    globalThis.fetch=async(input,init)=>{called=true;assert.equal(String(input),'https://john-liu-edu.sgi00307.chatgpt.site/api/integrations/speaking-hub/qa');assert.equal(new Headers(init?.headers).get('authorization'),'Bearer test-only-bridge-secret');assert.equal(init?.cache,'no-store');assert.equal(init?.redirect,'error');return Response.json({items:[]});};
    assert.deepEqual(await (await websiteRequest(['qa'])).json(),{items:[]});assert.equal(called,true);
    globalThis.fetch=async()=>Response.json({error:'not allowed'},{status:401});
    await assert.rejects(websiteRequest(['qa']),e=>e instanceof WebsiteBridgeError&&e.status===503&&!e.message.includes('test-only-bridge-secret'));
    globalThis.fetch=async()=>new Response('<html>login</html>',{headers:{'content-type':'text/html'}});
    await assert.rejects(websiteRequest(['qa']),WebsiteBridgeError);
    process.env.WEBSITE_BASE_URL='https://attacker.example';called=false;
    globalThis.fetch=async()=>{called=true;return Response.json({});};
    await assert.rejects(websiteRequest(['qa']),WebsiteBridgeError);assert.equal(called,false);
    delete process.env.QA_BRIDGE_SECRET;await assert.rejects(websiteRequest(['qa']),WebsiteBridgeError);
  }finally{globalThis.fetch=previousFetch;if(previousSecret===undefined)delete process.env.QA_BRIDGE_SECRET;else process.env.QA_BRIDGE_SECRET=previousSecret;if(previousBase===undefined)delete process.env.WEBSITE_BASE_URL;else process.env.WEBSITE_BASE_URL=previousBase;}
});


test('existing production variable names work with a full Q&A API URL',async()=>{
  const keys=['QA_BRIDGE_SECRET','WEBSITE_BASE_URL','SITES_QA_BRIDGE_SECRET','SITES_QA_API_BASE'] as const;
  const previous=Object.fromEntries(keys.map(key=>[key,process.env[key]]));const previousFetch=globalThis.fetch;
  delete process.env.QA_BRIDGE_SECRET;delete process.env.WEBSITE_BASE_URL;
  process.env.SITES_QA_BRIDGE_SECRET='test-only-existing-secret';
  process.env.SITES_QA_API_BASE='https://john-liu-edu.sgi00307.chatgpt.site/api/integrations/speaking-hub/qa';
  try{
    globalThis.fetch=async(input,init)=>{assert.equal(String(input),'https://john-liu-edu.sgi00307.chatgpt.site/api/studio/articles');assert.equal(new Headers(init?.headers).get('authorization'),'Bearer test-only-existing-secret');return Response.json([]);};
    assert.deepEqual(await (await websiteRequest(['articles'])).json(),[]);
  }finally{globalThis.fetch=previousFetch;for(const key of keys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}}
});
