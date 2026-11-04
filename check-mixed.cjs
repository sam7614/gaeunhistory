const assert=require('node:assert/strict');
const fs=require('node:fs');
const core=require('./dist/bank.js');
const goryeo=require('./dist/goryeo.js');
for(const [chapter,b] of [['three',core],['goryeo',goryeo]]){
for(let level=1;level<=5;level++){
 let previous=[];
 for(let round=0;round<20;round++){
  const exam=b.createMixedExam(level,previous);
  assert.equal(exam.length,30);
  assert.equal(new Set(exam.map(q=>q.id)).size,30);
  assert.equal(exam.filter(q=>q.photo).length,4);
  assert.equal(exam.filter(q=>!q.photo&&q.type==='short').length,12);
  assert.equal(exam.filter(q=>!q.photo&&q.type==='choice').length,14);
  for(let t=0;t<4;t++)assert.equal(exam.filter(q=>q.topic===t).length,[8,8,7,7][t]);
  assert.equal(exam.filter(q=>previous.includes(q.id)).length,0);
  for(const q of exam){if(q.type==='short'&&!q.photo){assert(q.cloze);assert.equal(q.cloze.split('{{blank}}').length,2);assert(!q.cloze.includes(q.a));}if(q.type==='choice'){assert(q.options.includes(q.a));assert.equal(new Set(q.options).size,q.options.length);}if(q.image)assert(fs.existsSync('dist/'+q.image));}
  const answers=Object.fromEntries(exam.map(q=>[q.id,q.type==='short'?q.a.replaceAll(' ','')+'입니다.':q.a]));
  const grade=(answers)=>core.gradeExam(exam,answers,b.topics??b.TOPICS);
  assert.equal(grade(answers).score,100);
  assert.deepEqual(grade(answers).topics.map(t=>t.name),b.topics??b.TOPICS);
  if(chapter==='goryeo')assert(exam.every(q=>q.id.startsWith('g-')&&q.chapter==='goryeo'));
  const short=exam.find(q=>q.type==='short');answers[short.id]='   ';
  assert.equal(grade(answers).score,97);
  assert.equal(grade({}).score,0);
  previous=exam.map(q=>q.id);
 }
 console.log(`${chapter} level ${level}: mixed exam, photos, repeat avoidance and grading passed`);
}
}
const b=core;
assert(b.isCorrect({type:'short',a:'경주 첨성대'},'첨 성 대'));
assert(b.isCorrect({type:'short',a:'광개토 대왕'},'광개토왕'));
assert(!b.isCorrect({type:'short',a:'진대법'},'진대법이 아니다'));
assert(!b.isCorrect({type:'short',a:'진대법'},'진대'));
console.log('Whitespace, aliases, blanks and incorrect answers verified.');
const king=goryeo.shortBank(2).find(q=>q.a==='왕건');
assert(core.isCorrect(king,'태조 왕건입니다.'));
assert(!core.isCorrect(king,'왕건이 아니다'));
assert.throws(()=>goryeo.createMixedExam(0));
assert.throws(()=>goryeo.createMixedExam(6));
assert.throws(()=>goryeo.createMixedExam(1.5));
const fullNames={
 'g-pillow':'청자 상감 모란 구름 학 무늬 베개',
 'g-stool':'청자 투각 의자',
 'g-vase':'청자 상감 운학문 매병',
 'g-incense':'청자 투각 칠보문 뚜껑 향로',
 'g-teapot':'청자 어룡형 주전자'
};
for(const level of [2,3,4]){
 assert(core.photoBank(level).every(q=>q.type==='short'));
 assert(goryeo.photoBank(level).every(q=>q.type==='short'&&q.exactName));
 for(const [key,name] of Object.entries(fullNames)){
  const q=goryeo.photoBank(level).find(q=>q.id.endsWith(key));
  assert.equal(q.a,name);
  assert(core.isCorrect(q,name.replaceAll(' ','')));
  assert(core.isCorrect(q,name.replaceAll(' ','  ')));
  for(const vague of ['청자','고려청자','상감 기법','투각','주전자','어룡형 주전자'])assert(!core.isCorrect(q,vague));
  assert(!core.isCorrect(q,'청자 어룡형 주전자 아닌 것'));
 }
}
console.log('Exact photo names: all three stages, full names, spacing tolerance and rejection of partial names passed.');
