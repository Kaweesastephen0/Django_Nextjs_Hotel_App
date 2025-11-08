import "./featuredProperties.css";
import useFetch from "../hooks/useFetch";
import Skeleton from "../CardSkeleton/homeSkeleton"

const FeaturedProperties = () => {
    const {data, loading, error} = useFetch("/hotels/featured/?limit=4")
  return (
    <div className="fp">
      { loading ? (
        <Skeleton cards={3} />
      ) : (

        <>
      {data.map((item) => (
 
      <div className="fpItem" key={item.id}>
        <img
          src={ item.image}
          alt=""
          className="fpImg"
        />
        <span className="fpName">{item.name}</span>
        <span className="fpCity">{item.city}</span>
        <span className="fpPrice">Starting from ${item.price}</span>
       {item.rating &&  <div className="fpRating">
          <button>{item.rating}</button>
          <span>Excellent</span>
        </div>}
      </div>
     
         ))}
      </>
      )}
    </div>
  );
};

export default FeaturedProperties;
