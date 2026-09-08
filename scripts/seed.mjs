import {writeFile} from 'node:fs/promises';
import {homeProjects,categories} from '../src/content.js';
import {hashPassword} from '../server/security.js';

const users=[];
for(let i=0;i<10;i++) users.push({id:`demo-${i}`,firstName:i===0?'Администратор':'Тестовый',lastName:i===0?'Проекта':`Пользователь ${i}`,patronymic:'',phone:`+37529100000${i}`,email:i===0?'admin@example.test':`user${i}@example.test`,nickname:i===0?'administrator':`user${i}`,birthDate:'2000-01-01',role:i===0?'admin':'user',passwordHash:await hashPassword(i===0?'RoofAdmin!2025':'RoofUser!2025'),createdAt:'2025-01-01T12:00:00.000Z',agreementAt:'2025-01-01T12:00:00.000Z'});
const projects=homeProjects.map(p=>({...p,description:'Учебное описание объекта из макета. Состав и этапы работ показаны для демонстрации каталога; это не подтверждённая производственная документация.',descriptionEn:'Coursework description of a project from the design. Work stages illustrate the catalogue and are not verified project documentation.'}));
const ru=['Модернизация инженерных сетей','Строительство производственного корпуса','Реконструкция площадки','Монтаж технологического оборудования','Обновление инфраструктуры','Строительство распределительного узла'];
const en=['Utility network modernisation','Production building construction','Site refurbishment','Process equipment installation','Infrastructure renewal','Distribution hub construction'];
for(let i=6;i<30;i++) {
  const base=homeProjects[i%6], category=categories[(i-6)%4];
  projects.push({...base,id:String(i+1),category:category.id,title:`${ru[i%6]} — учебный объект ${i+1}`,titleEn:`${en[i%6]} — sample project ${i+1}`,client:'Учебная организация',clientEn:'Sample organisation',dateFrom:`${2020+i%5}-03-10`,dateTo:`${2020+i%5}-10-20`,description:'Демонстрационная запись для проверки поиска, фильтрации, сортировки и избранного. Фотография используется как иллюстрация из исходного макета.',descriptionEn:'Sample record for testing search, filters, sorting and favourites. The photograph is an illustration from the original design.',demo:true});
}
const favorites=[1,2,3].flatMap(u=>Array.from({length:5},(_,i)=>({id:`demo-${u}:${i+1}`,userId:`demo-${u}`,projectId:String(i+1)})));
const requests=[1,2,3].map((u,i)=>({id:`sample-request-${u}`,userId:`demo-${u}`,name:`Тестовый пользователь ${u}`,email:`user${u}@example.test`,phone:'',company:'',type:'question',message:'Учебное обращение: прошу уточнить состав работ и возможные сроки проекта.',status:['new','processing','done'][i],createdAt:'2025-01-01T12:00:00.000Z'}));
await writeFile(new URL('../data/seed.json',import.meta.url),JSON.stringify({users,projects,favorites,requests,sessions:[]},null,2)+'\n');
console.log('Seed: 10 users, 30 projects, 15 favourites, 3 requests. Runtime data was not changed.');
