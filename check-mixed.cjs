const assert=require('node:assert/strict');
const fs=require('node:fs');
const b=require('./dist/bank.js');
for(let level=1;level<=5;level++){
 let previous=[];
 for(let round=0;round<20;round++){
  const exam=b.createMixedExam(level,previous);
  assert.equal(exam.length,20);
  assert.equal(new Set(exam.map(q=>q.id)).size,20);
  assert.equal(exam.filter(q=>q.photo).length,4);
  assert.equal(exam.filter(q=>!q.photo&&q.type==='short').length,6);
  assert.equal(exam.filter(q=>!q.photo&&q.type==='choice').length,10);
  for(let t=0;t<4;t++)assert.equal(exam.filter(q=>q.topic===t).length,5);
  assert.equal(exam.filter(q=>previous.includes(q.id)).length,0);
  for(const q of exam){if(q.type==='choice'){assert(q.options.includes(q.a));assert.equal(new Set(q.options).size,q.options.length);}if(q.image)assert(fs.existsSync('dist/'+q.image));}
  const answers=Object.fromEntries(exam.map(q=>[q.id,q.type==='short'?q.a.replaceAll(' ','')+'입니다.':q.a]));
  assert.equal(b.gradeExam(exam,answers).score,100);
  const short=exam.find(q=>q.type==='short');answers[short.id]='   ';
  assert.equal(b.gradeExam(exam,answers).score,95);
  assert.equal(b.gradeExam(exam,{}).score,0);
  previous=exam.map(q=>q.id);
 }
 console.log(`Level ${level}: mixed exam, photos, repeat avoidance and grading passed`);
}
assert(b.isCorrect({type:'short',a:'경주 첨성대'},'첨 성 대'));
assert(b.isCorrect({type:'short',a:'광개토 대왕'},'광개토왕'));
assert(!b.isCorrect({type:'short',a:'진대법'},'진대법이 아니다'));
assert(!b.isCorrect({type:'short',a:'진대법'},'진대'));
console.log('Whitespace, aliases, blanks and incorrect answers verified.');
