import Skeleton from 'react-loading-skeleton'
import "./skeleton.css"

const CardSkeleton = ({cards}) => {
  return ( Array(cards).fill(0).map((item, i) => (
    <div className="pcard-skeleton" key={i}>
        <Skeleton />
      <div className='pleft-box' >
        <Skeleton  width={180} height={185}/>
      </div>
    </div>
  )));
  
}

export default CardSkeleton
