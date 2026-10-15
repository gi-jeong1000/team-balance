"use client";
import { useEffect, useState } from "react";
type Side = "A" | "B";
type Phase = "join" | "vote1" | "closed" | "draw" | "speech" | "vote2" | "result";
const defaults = [{question:"평생 하나만 먹을 수 있다면?",a:"치킨",b:"피자"},{question:"휴가를 떠난다면?",a:"바다",b:"산"},{question:"회사에서 더 좋은 건?",a:"재택근무",b:"주 4일 출근"}];
export default function Home(){
 const [phase,setPhase]=useState<Phase>("join");
 const [nickname,setNickname]=useState("");
 const [team,setTeam]=useState("1팀");
 const [questionIndex,setQuestionIndex]=useState(0);
 const [questions,setQuestions]=useState(defaults);
 const [images,setImages]=useState<Record<string,string>>({});
 const [choice,setChoice]=useState<Side|null>(null);
 const [second,setSecond]=useState<Side|null>(null);
 const [showHost,setShowHost]=useState(false);
 const [showAdmin,setShowAdmin]=useState(false);
 const [winner,setWinner]=useState<Side>("A");
 const [count,setCount]=useState(3);
 const q=questions[questionIndex];
 useEffect(()=>{if(phase!=="draw")return;setCount(3);let n=3;const id=setInterval(()=>{n--;setCount(n);if(n===0){clearInterval(id);setPhase("speech")}},850);return()=>clearInterval(id)},[phase]);
 function advance(){const next:Record<Phase,Phase>={join:"vote1",vote1:"closed",closed:"draw",draw:"speech",speech:"vote2",vote2:"result",result:"vote1"};if(phase==="result"){setQuestionIndex(i=>(i+1)%questions.length);setChoice(null);setSecond(null)}setPhase(next[phase])}
 function update(field:"question"|"a"|"b",value:string){setQuestions(prev=>prev.map((x,i)=>i===questionIndex?{...x,[field]:value}:x))}
 function upload(side:Side,file?:File){if(!file)return;const reader=new FileReader();reader.onload=()=>setImages(v=>({...v,[questionIndex+side]:String(reader.result)}));reader.readAsDataURL(file)}
 const showChoice=(side:Side)=>{const title=side==="A"?q.a:q.b;const emoji=side==="A"?"🐰":"🐻";return <div className={"option option"+side} onClick={()=>{if(phase==="vote1"&&!choice)setChoice(side);if(phase==="vote2"&&!second&&choice)setSecond(side)}}><div className="option-top"><span className="option-tag">{side==="A"?"1번":"2번"} 선택지</span><span className="option-heart">{side==="A"?"💗":"💙"}</span></div><div className="mascot">{images[questionIndex+side]?<img src={images[questionIndex+side]} alt={title}/>:emoji}</div><h2>{title}</h2><div className="option-bottom">{(phase==="vote1"&&choice===side)||(phase==="vote2"&&second===side)?"선택 완료 ✓":phase==="vote1"||phase==="vote2"?"이걸로 선택! →":"TEAM "+side}</div></div>};
 return <main className="shell"><header><div className="brand"><span className="brand-mark">⚡</span><span>TEAM <b>BALANCE</b><small>우리 팀의 선택이 승부를 바꾼다!</small></span></div><div className="header-right"><span className="live-dot"/> WORKSHOP GAME <button className="quiet" onClick={()=>setShowHost(v=>!v)}>진행자</button></div></header>
 <section className="stage"><div className="stage-pill">✨ TEAM BALANCE GAME · ROUND {questionIndex+1}</div><h1>{phase==="join"?"오늘, 우리 팀의 밸런스는?":phase==="closed"?"⏰ 투표 종료!":phase==="draw"?"🥁 두구두구...":phase==="speech"?"🎤 대표 선수 등장!":phase==="result"?"🎉 승리 팀 공개!":phase==="vote2"?"마지막 선택의 시간!":q.question}</h1><p>{phase==="join"?"두 캐릭터의 귀여운 대결! 선택하고, 설득하고, 뒤집어봐!":phase==="vote1"?"내 마음이 가는 선택지를 골라봐! 한 번 선택하면 변경할 수 없어.":phase==="vote2"?"대표자의 이야기를 들었어? 최종 선택을 해줘!":phase==="result"?"승리 캐릭터를 축하해줘!":"모두의 선택이 만드는 두근두근 승부!"}</p></section>
 {phase==="join"?<section className="join-card"><div className="join-emoji">🐰 <span>VS</span> 🐻</div><h2>게임에 참여할 준비됐나요?</h2><div className="form-grid"><input placeholder="닉네임을 입력하세요" value={nickname} onChange={e=>setNickname(e.target.value)}/><select value={team} onChange={e=>setTeam(e.target.value)}><option>1팀</option><option>2팀</option><option>3팀</option><option>4팀</option></select></div><button className="primary" onClick={()=>nickname.trim()?setPhase("vote1"):alert("닉네임을 입력해 주세요")}>게임 참가하기 🚀</button><small>현재는 단일 브라우저 UI 데모입니다. 실제 실시간 멀티플레이는 개발 중입니다.</small></section>:<><div className="arena"><div className="versus-glow">VS</div>{showChoice("A")}{showChoice("B")}</div><div className="announcement">{phase==="draw"?<strong className="bounce">🥁 {count||"짜잔!"} 🥁</strong>:phase==="result"?<strong className="bounce">{winner==="A"?"🐰 분홍 토끼":"🐻 주황 곰"} 승리! 🏆 🎊</strong>:phase==="closed"?"🔒 투표가 마감되었습니다!":phase==="speech"?"🐰 VS 🐻 대표자들의 설득 타임!":phase==="vote2"?(second?"최종 투표를 완료했어요!":"🔁 생각이 바뀌었다면? 마지막 기회!"):(choice?"투표 완료! 진행자가 다음 단계로 넘어갈 때까지 기다려 주세요.":"👆 마음에 드는 선택지를 눌러주세요!")}</div></>}
 {showHost&&<aside className="host"><div className="host-head"><b>🎮 진행자 컨트롤</b><button className="quiet" onClick={()=>setShowHost(false)}>닫기</button></div><p>데모 진행용 제어 패널입니다. 실제 운영에서는 별도 인증과 서버 동기화가 필요합니다.</p><div className="host-buttons"><button onClick={advance}>다음 단계 →</button><button onClick={()=>setShowAdmin(v=>!v)}>질문 편집 ⚙️</button><button onClick={()=>setWinner(w=>w==="A"?"B":"A")}>승리 캐릭터 변경</button></div>{showAdmin&&<div className="editor"><label>질문<input value={q.question} onChange={e=>update("question",e.target.value)}/></label><label>1번 선택지<input value={q.a} onChange={e=>update("a",e.target.value)}/></label><label>2번 선택지<input value={q.b} onChange={e=>update("b",e.target.value)}/></label><label>1번 이미지<input type="file" accept="image/*" onChange={e=>upload("A",e.target.files?.[0])}/></label><label>2번 이미지<input type="file" accept="image/*" onChange={e=>upload("B",e.target.files?.[0])}/></label><button onClick={()=>{setQuestions(v=>[...v,{question:"새로운 질문",a:"선택지 1",b:"선택지 2"}]);setQuestionIndex(questions.length);setChoice(null);setSecond(null)}}>질문 추가 +</button></div>}</aside>}
 <footer>Made for team moments ✦ TEAM BALANCE <button onClick={()=>setShowHost(v=>!v)}>관리자 / 진행자</button></footer></main>
}