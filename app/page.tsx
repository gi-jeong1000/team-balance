"use client";
import {useState} from "react";
import Link from "next/link";
import "./play/play.css";
export default function Home(){
 const [code,setCode]=useState("");
 const clean=code.trim().toUpperCase();
 return <main className="shell"><header><div className="brand"><span className="brand-mark">⚡</span><span>TEAM <b>BALANCE</b><small>우리 팀의 선택이 승부를 바꾼다!</small></span></div><Link className="quiet" href="/admin">관리자 ↗</Link></header>
 <section className="stage"><div className="stage-pill">🐰 TEAM BALANCE 🐻</div><h1>오늘, 우리 팀의 밸런스는?</h1><p>참가 코드를 입력하고 실시간 밸런스 게임에 참여하세요.</p></section>
 <section className="join-card" style={{maxWidth:580}}><div className="join-emoji">🐰 <span>VS</span> 🐻</div><h2>게임 참가하기</h2><input className="play-input" aria-label="참가 코드" placeholder="진행자가 알려준 참가 코드" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} maxLength={12}/><Link className="primary" style={{display:"block",textAlign:"center",textDecoration:"none",marginTop:16}} href={clean?"/play?code="+encodeURIComponent(clean):"/play"}>참가하기 →</Link><p style={{marginTop:20}}>게임을 운영하시나요? <Link href="/admin">관리자 화면 열기 ↗</Link></p></section>
 <footer>TEAM BALANCE · 실시간 팀 밸런스 게임</footer></main>
}
