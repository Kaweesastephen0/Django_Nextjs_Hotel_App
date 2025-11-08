"use client";

import "./hotel.css";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Footer from "../../components/footer/Footer";
import useFetch from "../../components/hooks/useFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faLocationDot} from "@fortawesome/free-solid-svg-icons";
import {  useContext } from "react";
import { usePathname } from "next/navigation";
import { SearchContext } from "../../context/searchContext";
import Link from "next/link";



const Hotel = () => {
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const { data, loading } = useFetch(`/hotels/${id}`);

  const { dates } = useContext(SearchContext);

  const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
  function dayDifference(date1, date2) {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / MILLISECONDS_PER_DAY);
  }

  const days =
    dates?.[0]?.endDate && dates?.[0]?.startDate
      ? dayDifference(dates[0].endDate, dates[0].startDate)
      : 1;



  return (
    <div>
      <Header type="list" />

      {loading ? (
        "Loading..."
      ) : (
        <div className="hotelContainer">
        

          <div className="hotelWrapper">
       

            <h1 className="hotelTitle">{data.name}</h1>
            <div className="hotelAddress">
              <FontAwesomeIcon icon={faLocationDot} />
              <span>{data.address}</span>
            </div>

            <span className="hotelDistance">
              Excellent location – {data.distance} from center
            </span>

            <span className="hotelPriceHighlight">
              Book a stay over ${data.price} and get a free airport taxi
            </span>

            <div className="hotelImages">
              {data?.image && (
                <div className="hotelImgWrapper">
                  <img
                    onClick={() => handleOpen(0)}
                    src={data.image}
                    alt=""
                    className="hotelImg"
                  />
                </div>
              )}
            </div>

            <div className="hotelDetails">
              <div className="hotelDetailsTexts">
                <h1 className="hotelTitle">{data.title}</h1>
                <p className="hotelDesc">{data.desc}</p>
      

                {/*  ROOMS SECTION */}
                <div className="hotelRooms">
                  <h2 className="text-3xl mb-5">Available Rooms</h2>
                  {loading ? (
                    <p>Loading rooms...</p>
                  ) : data?.rooms?.length > 0 ? (
                    <div className="roomsGrid flex overflow-x-auto space-x-4 pb-4">
                      {data.rooms.map((room) => (
                        <div key={room.id} className="roomCard rounded-2xl flex-shrink-0 w-80 bg-white shadow-lg">
                          <img
                            src={room.images?.find(img => img.is_primary)?.image_url || room.images?.[0]?.image_url || "/no-image.jpg"}
                            alt={room.room_type}
                            className="roomImage w-full h-48 object-cover rounded-t-2xl"
                          />
                          <div className="roomInfo p-4">
                            <h3>{room.room_type}</h3>
                            <p>Room Number: {room.room_number}</p>
                            <p>Capacity: {room.capacity} guests</p>
                            <p>Price: ${room.price}</p>
                            <p>
                              Status:{" "}
                              <span
                                className={
                                  room.is_available ? "text-green-600" : "text-red-600"
                                }
                              >
                                {room.is_available ? "Available" : "Booked"}
                              </span>
                            </p>

                            <div className="roomActions">
                              <Link href={`/room/${room.id}`}>
                                <button className="viewBtn mr-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">View Details</button>
                              </Link>
                             
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No rooms available for this hotel.</p>
                  )}
                </div>
              </div>

              
            </div>
          </div>

          <MailList />
          <Footer />
        </div>
      )}

      
    </div>
  );
};

export default Hotel;
