import {api} from './api.js';
import {preferences} from './ui.js';

// Optional browser API: the same catalogue endpoint also serves the visible filters.
export function registerCatalogueTool() {
  const context=document.modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  const tool={
    name:'search_projects',
    title:'Поиск строительных объектов',
    description:'Read the project catalogue using a search phrase, sector, sort order and page. Does not change saved projects or submit requests.',
    inputSchema:{type:'object',properties:{q:{type:'string',maxLength:200},category:{type:'string',enum:['','oil','power','civil','industry']},sort:{type:'string',enum:['newest','oldest','title']},page:{type:'integer',minimum:1}},additionalProperties:false},
    annotations:{readOnlyHint:true,untrustedContentHint:true},
    async execute(input={}) {
      if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['q','category','sort','page'].includes(k)))throw new Error('Invalid search parameters.');
      const {q='',category='',sort='newest',page=1}=input;
      if(typeof q!=='string'||q.length>200||!['','oil','power','civil','industry'].includes(category)||!['newest','oldest','title'].includes(sort)||!Number.isInteger(page)||page<1)throw new Error('Invalid search parameters.');
      const result=await api(`/projects?${new URLSearchParams({q,category,sort,page:String(page),lang:preferences.language})}`);
      return {total:result.total,page:result.page,pages:result.pages,items:result.items.map(p=>({id:p.id,title:preferences.language==='en'?p.titleEn:p.title,category:p.category,url:`#/project/${encodeURIComponent(p.id)}`}))};
    }
  };
  try {Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
  if(import.meta.hot)import.meta.hot.dispose(()=>lifecycle.abort());
}
