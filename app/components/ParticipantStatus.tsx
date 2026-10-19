import Mascot from './Mascot';

type Props={phase:string;round:number;selected?:number;choice?:string;question?:string;ineligible?:boolean};
const stages:Record<string,[string,string,string]>={
 lobby:['READY, TEAM?','우리 팀, 준비됐나요?','곧 시작해요. 잠시만 이곳에서 기다려 주세요.'],
 vote1_closed:['VOTE CLOSED','첫 번째 선택 마감!','이제 우리 팀을 대신해 이야기할 대표자를 만나요.'],
 draw:['WHO’S NEXT?','두구두구… 누구일까요?','대표자를 추첨하고 있어요. 스크린을 함께 봐 주세요.'],
 speech1:['LISTEN UP','첫 번째 이야기를 들어요','대표자의 이야기를 듣고, 나의 선택도 다시 생각해 보세요.'],
 speech2:['ONE MORE VOICE','두 번째 이야기를 들어요','다른 생각에도 귀 기울여 주세요. 곧 마지막 투표가 열려요.'],
 vote2_closed:['FINAL VOTE CLOSED','마지막 선택까지 완료!','모두의 선택을 모으고 있어요. 결과는 스크린에서 확인해 주세요.'],
 reveal:['THE BIG REVEAL','우리의 선택은…?','결과를 공개하고 있어요. 스크린을 함께 봐 주세요.'],
 round_complete:['NICE ROUND','한 라운드, 멋지게 완료!','진행자가 다음 단계를 준비하고 있어요. 잠시 쉬어 가요.'],
 finished:['WELL PLAYED','모두 수고했어요!','함께 만든 선택, 최종 순위에서 확인해 보세요.']
};
export default function ParticipantStatus({phase,round,selected,choice,question,ineligible}:Props){
 const saved=!!selected;
 const [eyebrow,title,description]=saved?['CHOICE SAVED',round===1?'첫 번째 선택, 저장 완료!':'마지막 선택, 저장 완료!',round===1?'다른 친구들의 선택을 기다려요. 곧 대표자를 만나요.':'이제 결과를 기다릴 시간! 스크린을 함께 봐 주세요.']:ineligible?['TAKE A BREATHER','이번에는 함께 지켜봐요','1차 투표에 참여하지 않아 이번 재투표에는 참여할 수 없어요. 결과를 기다려 주세요.']:stages[phase]??stages.lobby;
 const speaking=phase==='speech1'||phase==='speech2';
 return <div className={'participant-interlude '+(saved?'is-saved':'is-'+phase)} key={phase+':'+(selected??0)}>
  <div className="interlude-scene" aria-hidden="true"><span className="scene-orbit orbit-one"/><span className="scene-orbit orbit-two"/><span className="scene-spark spark-one">✦</span><span className="scene-spark spark-two">✦</span>
   {saved?<><div className="saved-halo"/><Mascot side={selected===1?'A':'B'} className="interlude-solo"/><span className="saved-seal">✓</span></>:<><Mascot side="A" className={'interlude-bunny'+(speaking&&phase==='speech1'?' is-speaking':'')}/><span className="interlude-bubble">{phase==='draw'?'?':speaking?'···':phase==='finished'||phase==='round_complete'?'★':'VS'}</span><Mascot side="B" className={'interlude-bear'+(speaking&&phase==='speech2'?' is-speaking':'')}/></>}
  </div>
  <div className="interlude-copy"><span className="interlude-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
  {saved?<div className="saved-choice"><span>나의 {round}차 선택 <b>{selected===1?'A':'B'}</b></span><strong>{choice}</strong>{question?<small>{question}</small>:null}<span className="saved-note">✓ 투표가 안전하게 저장됐어요</span></div>:null}
  {phase!=='finished'?<div className="waiting-cue"><span aria-hidden="true"><i/><i/><i/></span>{saved?'다른 참가자를 기다리는 중':speaking?'대표자 발언 진행 중':'다음 단계를 기다리는 중'}</div>:null}
 </div>;
}
