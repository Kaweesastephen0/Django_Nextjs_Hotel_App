"use client";

import { useState, useContext } from "react";
import { usePathname, useRouter, redirect } from "next/navigation";
import useFetch from "../../components/hooks/useFetch";
import Footer from "../../components/footer/Footer";
import MailList from "../../components/mailList/MailList";
import Reserve from "../../components/reserve/Reserve";
import "./roomDetails.css";
import { getUserFromStorage } from "../../../../utils/auth";

const RoomDetails = () => {
  const pathname = usePathname();
  const id = pathname.split("/")[2];
  const { data, loading, error } = useFetch(`/rooms/${id}/`);
  const [openModal, setOpenModal] = useState(false);
 
  const user = getUserFromStorage();
  const router = useRouter();
  const handleBookNow = () => {
    if (user) {
      setOpenModal(true);
    } else {
    const currentUrl = window.location.pathname + window.location.search;
    router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  };

  return (
    <div className="roomDetailsPage">
 

      {loading ? (
        <div className="loadingText">Loading room details...</div>
      ) : error ? (
        <div className="errorText">Failed to load room details</div>
      ) : (
        data && (
          <div className="roomDetailsContainer">
            <div className="roomHeader">
              <h1 className="roomTitle">{data.hotel}</h1>
              <p className="roomNumber">Room No: {data.room_number}</p>
            </div>

            <div className="roomImages">
              {data.images && data.images.length > 0 ? (
                data.images.map((img, i) => (
                  <img
                    key={i}
                    src={img.image_url}
                    alt="room image"
                    className="roomImage"
                  />
                ))
              ) : (
                <img src="/no-image.jpg" alt="No room" className="roomImage" />
              )}
            </div>

            <div className="roomInfoSection">
              <p>
                <strong>Type:</strong> {data.room_type}
              </p>
              <p>
                <strong>Capacity:</strong> {data.capacity} guest
                {data.capacity > 1 && "s"}
              </p>
              <p>
                <strong>Price:</strong> ${data.price} / night
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    data.is_available ? "statusAvailable" : "statusUnavailable"
                  }
                >
                  {data.is_available ? "Available" : "Booked"}
                </span>
              </p>
            </div>

            <div className="roomActions">
              {data.is_available ? (
                <button className="bookNowBtn" onClick={handleBookNow}>
                  Book Now
                </button>
              ) : (
                <button className="bookNowBtn disabled" disabled>
                  Not Available
                </button>
              )}
            </div>
          </div>
        )
      )}

      <MailList />
      <Footer />

      {openModal && <Reserve setOpen={setOpenModal} roomId={id} />}
    </div>
  );
};

export default RoomDetails;
