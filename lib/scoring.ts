export type Side = "A" | "B";
export type Ballot = { participantId: string; teamId: string; first: Side; second?: Side };
export type Representative = { participantId: string; teamId: string; side: Side };
export type TeamAward = { teamId: string; base: number; reversal: number; total: number };
export type RoundResult = { first: Record<Side,number>; second: Record<Side,number>; switches: {aToB:number;bToA:number}; winner:Side|null; reversal:boolean; awards:TeamAward[] };
/**
 * Pure scoring function. Call only after server validates ballot ownership,
 * first-round eligibility, phase, and one-vote-per-round constraints.
 * All counts use submitted ballots, never registered participant totals.
 */
export function scoreRound(ballots:Ballot[],representatives:Representative[],teamIds:string[]):RoundResult {
 const first={A:0,B:0},second={A:0,B:0},switches={aToB:0,bToA:0};
 const unique=new Set<string>();
 for(const b of ballots){
  if(unique.has(b.participantId))throw new Error("duplicate participant");
  unique.add(b.participantId);
  if(!["A","B"].includes(b.first))throw new Error("invalid first vote");
  first[b.first]++;
  if(b.second!==undefined){
   if(!["A","B"].includes(b.second))throw new Error("invalid second vote");
   second[b.second]++;
   if(b.first==="A"&&b.second==="B")switches.aToB++;
   if(b.first==="B"&&b.second==="A")switches.bToA++;
  }
 }
 let winner:Side|null=null;
 if(second.A>second.B)winner="A";
 else if(second.B>second.A)winner="B";
 else if(switches.aToB>switches.bToA)winner="B";
 else if(switches.bToA>switches.aToB)winner="A";
 const reversal=winner!==null && first[winner]<first[winner==="A"?"B":"A"] && second[winner]>second[winner==="A"?"B":"A"];
 const ratios=teamIds.map(teamId=>{
  const eligible=ballots.filter(b=>b.teamId===teamId&&b.second!==undefined);
  const correct=winner===null?0:eligible.filter(b=>b.second===winner).length;
  return {teamId,valid:eligible.length,ratio:eligible.length?correct/eligible.length:-1};
 });
 const max=winner===null?-1:Math.max(-1,...ratios.map(r=>r.ratio));
 const awardedRep=reversal?representatives.find(r=>r.side===winner):undefined;
 const awards=ratios.map(r=>{
  const base=winner!==null&&r.valid>0&&r.ratio===max?1:0;
  const bonus=awardedRep?.teamId===r.teamId?3:0;
  return {teamId:r.teamId,base,reversal:bonus,total:base+bonus};
 });
 return {first,second,switches,winner,reversal,awards};
}
export function rankTeams(rounds:RoundResult[]){
 const totals=new Map<string,{teamId:string;points:number;reversals:number}>();
 for(const round of rounds)for(const a of round.awards){
  const prev=totals.get(a.teamId)??{teamId:a.teamId,points:0,reversals:0};
  prev.points+=a.total;prev.reversals+=a.reversal?1:0;totals.set(a.teamId,prev);
 }
 return [...totals.values()].sort((a,b)=>b.points-a.points||b.reversals-a.reversals);
}
