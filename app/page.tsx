"use client";
import {useState} from 'react';
import Link from 'next/link';
import Mascot from './components/Mascot';
export default function Home(){
 const [code,setCode]=useState('');const [joining,setJoining]=useState(false);const clean=code.trim().toUpperCase();
 return <main className="shell"><header><Link className="brand" href="/">TEAM<span className="brand-accent">.</span>BALANCE <b>↗</b></Link><div className="row"><span className="pill">● LIVE GAME</span><Link className="ghost small" href="/admin">관리자 ↗</Link></div></header><section className="prototype-hero"><div className="tag">2026 TEAM WORKSHOP · LET’S PLAY!</div><div className="hero-bubble">우리 팀의 선택은?</div><h1>팀 밸런스 <span>게임</span></h1><div className="mascotrow"><Mascot side="A" className="hero-mascot" priority/><span className="versus">VS</span><Mascot side="B" className="hero-mascot" priority/></div><p className="muted">선택하고, 설득하고, 뒤집어라.<br/>당신의 한 표가 팀의 운명을 바꾼다.</p><div className="row hero-actions"><button className="primary" onClick={()=>setJoining(v=>!v)}>참가하기 ✨</button><Link className="ghost" href="/screen">스크린 보기 ↗</Link></div>{joining?<form className="panel home-join" action="/play"><label>게임 참가 코드<input aria-label="참가 코드" name="code" placeholder="진행자가 알려준 참가 코드" maxLength={12} value={code} onChange={e=>setCode(e.target.value.toUpperCase())} required/></label><button className="primary" disabled={!clean}>입장하기 →</button></form>:null}</section><footer>Made for team moments ✦ TEAM BALANCE</footer></main>;
}
