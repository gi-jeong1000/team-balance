import type {CSSProperties} from 'react';
export default function Celebration(){return <div className="celebration" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i} style={{'--x':`${5+(i*37)%91}%`,'--delay':`${(i%6)*.12}s`,'--hue':`${[331,211,44,267][i%4]}`,'--turn':`${i%2?240:-240}deg`} as CSSProperties}/>)}</div>}
