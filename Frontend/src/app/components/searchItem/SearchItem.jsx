"use client"
import Link from "next/link";
import "./searchItem.css";
import FmdGoodIcon from '@mui/icons-material/FmdGood';
const SearchItem = ({item}) => {
  // Function to get primary image from hotel data
  const getPrimaryImage = () => {
    // First check if hotel has a direct image
    if (item?.image) {
      return item.image;
    }
    
    
    // Fallback image in case a hotel doesn't have an image
    return "https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg";
  };

  return (
    <div className="searchItem">
      <img
        src={getPrimaryImage()}
        alt={item?.name || "Hotel"}
        className="siImg"
      />
      <div className="siDesc">
        <h1 className="siTitle">{item.name}</h1>
        <span className="siDistance">{item.distance} from center</span>
        <span className="siTaxiOp">Free airport taxi</span>
        <span className="siSubtitle">
          {item.title}
        </span>
        <span className="siFeatures">
          <FmdGoodIcon className="text-gray-500 f"/>
          {item.city}
        </span>
        <span className="siCancelOp">Free cancellation </span>
        <span className="siCancelOpSubtitle">
          You can cancel later, so lock in this great price today!
        </span>
      </div>
      <div className="siDetails">
       {item.rating && 
       <div className="siRating">
          <span>Excellent Rating</span>
          <button>{item.rating}</button>
        </div>
        }
        <div className="siDetailTexts">
          <span className="siPrice">${item.price}</span>
          <span className="siTaxOp">Includes taxes and fees</span>
          <Link href={`/hotel/${item.id}`} >
          <button className="siCheckButton">See availability</button>
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default SearchItem;
