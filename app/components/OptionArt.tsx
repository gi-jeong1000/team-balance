export default function OptionArt({side,image,label}:{side:'A'|'B';image?:string|null;label:string}){
 return image?<img className="opt-art-image" src={image} alt={label}/>:<span className="opt-art" aria-hidden="true">{side==='A'?'🐰':'🐻'}</span>;
}
