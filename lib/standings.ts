export type ScoreEvent={team_id:string;points:number;reason:string};
export type TeamInfo={id:string;name:string};
export type Standing={teamId:string;name:string;points:number;reversalPoints:number;rank:number;isWinner:boolean};
export function calculateStandings(teams:TeamInfo[],events:ScoreEvent[]):Standing[]{
 const totals=new Map(teams.map(t=>[t.id,{points:0,reversalPoints:0}]));
 for(const e of events){const total=totals.get(e.team_id);if(!total)continue;total.points+=e.points;if(e.reason==="reversal")total.reversalPoints+=e.points}
 const sorted=teams.map(t=>({teamId:t.id,name:t.name,...totals.get(t.id)!})).sort((a,b)=>b.points-a.points||b.reversalPoints-a.reversalPoints||a.name.localeCompare(b.name,"ko"));
 return sorted.map((s,i)=>{const better=sorted.filter(t=>t.points>s.points||(t.points===s.points&&t.reversalPoints>s.reversalPoints)).length;return {...s,rank:better+1,isWinner:better===0}});
}
