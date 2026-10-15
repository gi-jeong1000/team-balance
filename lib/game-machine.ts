export const PHASES=["lobby","vote1","vote1_closed","draw","speech1","speech2","vote2","vote2_closed","reveal","round_complete","finished"] as const;
export type GamePhase=typeof PHASES[number];
export type PhaseState={phase:GamePhase;version:number;deadline:string|null;pausedRemainingMs:number|null};
const NEXT:Partial<Record<GamePhase,GamePhase>>={lobby:"vote1",vote1:"vote1_closed",vote1_closed:"draw",draw:"speech1",speech1:"speech2",speech2:"vote2",vote2:"vote2_closed",vote2_closed:"reveal",reveal:"round_complete"};
export function transition(state:PhaseState,expectedVersion:number,requested:GamePhase,now=new Date()):PhaseState {
 if(state.version!==expectedVersion)throw new Error("stale phase version");
 if(NEXT[state.phase]!==requested)throw new Error("invalid forward-only transition");
 return {phase:requested,version:state.version+1,deadline:null,pausedRemainingMs:null};
}
export function startTimer(state:PhaseState,durationSeconds:number,now=new Date()):PhaseState{
 if(!Number.isInteger(durationSeconds)||durationSeconds<1||durationSeconds>3600)throw new Error("invalid duration");
 return {...state,deadline:new Date(now.getTime()+durationSeconds*1000).toISOString(),pausedRemainingMs:null};
}
export function pauseTimer(state:PhaseState,now=new Date()):PhaseState{
 if(!state.deadline)throw new Error("no running timer");
 return {...state,deadline:null,pausedRemainingMs:Math.max(0,Date.parse(state.deadline)-now.getTime())};
}
export function resumeTimer(state:PhaseState,now=new Date()):PhaseState{
 if(state.pausedRemainingMs===null)throw new Error("timer not paused");
 return {...state,deadline:new Date(now.getTime()+state.pausedRemainingMs).toISOString(),pausedRemainingMs:null};
}
