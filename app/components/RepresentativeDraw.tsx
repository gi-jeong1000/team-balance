'use client';
import {useEffect,useState} from 'react';
import Mascot from './Mascot';
export type DrawData={names:string[];representatives:{option:number;speech_order:number;nickname:string;fallback:boolean}[]};
export default function RepresentativeDraw({draw}:{draw:DrawData}){
 const [elapsed,setElapsed]=useState(0);
 const signature=draw.representatives.map(r=>`${r.option}:${r.nickname}:${r.speech_order}`).join('|');
 useEffect(()=>{setElapsed(0);if(!signature)return;const start=Date.now();const timer=setInterval(()=>{const ms=Date.now()-start;setElapsed(ms);if(ms>=8200)clearInterval(timer)},80);return()=>clearInterval(timer)},[signature]);
 return <section className="pachinko-stage" aria-label="대표자 추첨"><div className="draw-intro"><span className="tag">LUCKY SPEAKER</span><h2>두근두근, 우리 대표자는?</h2><p>이름이 돌아가고 있어요. 행운의 주인공을 만나 보세요!</p></div><div className="option-grid">{([1,2] as const).map(option=>{
 const rep=draw.representatives.find(r=>r.option===option);const stopAt=option===1?5600:8000;const done=!!rep&&elapsed>=stopAt;const spinning=!!rep&&!done;
 const names=draw.names.length?draw.names:['참가자를 기다려요'];
 const tick=Math.floor(elapsed/(elapsed>stopAt-1400?260:elapsed>stopAt-2600?150:80));
 const index=(tick+option*3)%names.length;
 return <article className={'pachinko-machine '+(option===1?'machine-a':'machine-b')+(done?' has-winner':'')} key={option}>
  <div className="machine-top"><span>OPTION {option===1?'A':'B'}</span><Mascot side={option===1?'A':'B'}/></div>
  <div className="pachinko-pins" aria-hidden="true">{Array.from({length:21},(_,i)=><i key={i}/>)}</div>
  {rep?.fallback?<p className="fallback-message">해당 선택에 투표한 대표자가 없어<br/><strong>무작위 추첨이 진행돼요</strong></p>:<p className="draw-pool-label">{rep?'선택한 참가자 중 대표자를 추첨해요':'진행자의 추첨 시작을 기다려요'}</p>}
  <div className={'name-reel '+(spinning?'is-rolling':'')} aria-hidden="true"><span>{done?'★ SELECTED ★':names[(index+names.length-1)%names.length]}</span><strong key={done?'winner':index}>{done?rep?.nickname:names[index]}</strong><span>{done?`${rep?.speech_order}번째 발언`:names[(index+1)%names.length]}</span></div>
  <div className="machine-lights" aria-hidden="true">{Array.from({length:7},(_,i)=><i key={i}/>)}</div>
  <p className="draw-announcement" role="status">{done?`${rep?.nickname} 님이 선정됐어요!`:spinning?'두구두구… 추첨 중!':draw.names.length<2?'대표자 추첨에는 참가자 2명 이상이 필요해요':'추첨 준비 완료'}</p>
 </article>
 })}</div></section>
}
