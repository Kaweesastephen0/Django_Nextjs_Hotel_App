import Skeleton from 'react-loading-skeleton'
import "./skeleton.css"

const CardSkeleton = ({cards}) => {
  return ( Array(cards).fill(0).map((item, i) => (
    <div className="hcard-skeleton" key={i}>
        <Skeleton />
      <div className='hleft-box' >
        <Skeleton  width={320} height={270}/>
      </div>
    </div>
  )));
  
}

export default CardSkeleton
