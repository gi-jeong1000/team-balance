const mascots={A:{src:'/art/bunny.webp',alt:'파란 글러브를 낀 흰 토끼'},B:{src:'/art/bear.webp',alt:'빨간 글러브를 낀 주황 곰'},C:{src:'/art/fox.webp',alt:'하늘색 글러브를 낀 여우'},D:{src:'/art/panda.webp',alt:'분홍색 글러브를 낀 판다'}};
export default function Mascot({side,className='',priority=false}:{side:keyof typeof mascots;className?:string;priority?:boolean}){
 const mascot=mascots[side];
 return <img className={'game-mascot mascot-'+side+' '+className} src={mascot.src} alt={mascot.alt} width={512} height={512} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} draggable={false}/>;
}