import Mascot from './Mascot';
export default function OptionArt({side,image,label}:{side:'A'|'B';image?:string|null;label:string}){
 return image?<img className="opt-art-image" src={image} alt={label}/>:<Mascot side={side} className="opt-art"/>;
}
