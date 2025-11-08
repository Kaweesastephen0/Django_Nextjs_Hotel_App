import Skeleton from 'react-loading-skeleton'
import "./skeleton.css"

const CardSkeleton = ({cards}) => {
  return ( Array(cards).fill(0).map((item, i) => (
    <div className="card-skeleton" key={i}>
        <Skeleton />
      <div className='left-box' >
        <Skeleton  width={200} height={200}/>
      </div>
      <div className='right-box'>
        <Skeleton count={5} width={500} height={38}/>
      </div>
    </div>
  )));
  
}

export default CardSkeleton
