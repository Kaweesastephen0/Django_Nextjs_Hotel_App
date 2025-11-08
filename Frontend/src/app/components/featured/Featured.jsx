import useFetch from "../hooks/useFetch";
import "./featured.css";
import Skeleton from "../CardSkeleton/homeSkeleton";
import { useRouter } from "next/navigation";

const Featured = () => {
  const router = useRouter()

  const { data, loading, error } = useFetch(
    "/hotels/hotellocationcount?cities=Mukono,jinja,Kampala"
  );


  const cities = [
    {name: "Kampala", total: data[0]?.total || 0 , image: "https://images.pexels.com/photos/302769/pexels-photo-302769.jpeg"},
    {name: "Mukono", total: data[1]?.total || 0, image: "https://cf.bstatic.com/xdata/images/city/max500/690334.webp?k=b99df435f06a15a1568ddd5f55d239507c0156985577681ab91274f917af6dbb&o"},
    {name: "Jinja",total: data[2]?.total || 0, image: "https://images.pexels.com/photos/89485/pexels-photo-89485.jpeg"},
  ]

  const handleClick = (region) => {
    router.push(`/hotel?destination=${encodeURIComponent(region)}`);
  }

  return (
    <div className="featured">
      {loading ? (
        <Skeleton cards={3} />
      ) : error ? (
        "Error loading data. Please try again later."
      ) : (
        <>
        {cities.map((region) => (
          <div 
          key={region.name}
          onClick={() => handleClick(region.name)}
          className="featuredItem">

            <img
            
              src={region.image}
              alt={region.name}
              className="featuredImg cursor-pointer"
            />
            <div className="featuredTitles bg-[#000000a9] w-20 p-2 rounded-2xl">
              <h1>{region.name}</h1>
              <h2>{ region.total || 0} Hotels</h2>
            </div>
          </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Featured;
