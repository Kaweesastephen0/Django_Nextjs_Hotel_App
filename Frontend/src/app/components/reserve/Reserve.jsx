
"use client";

import CloseIcon from '@mui/icons-material/Close';
import "./reserve.css";
import { Suspense, useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import api from "../../services/axios";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { getUserFromStorage, getValidatedToken } from "../../../../utils/auth";
import Swal from "sweetalert2";

const MILLISECONDS_PER_NIGHT = 24 * 60 * 60 * 1000;

const ReserveContent = ({ setOpen, roomId = null, hotelId = null }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = getValidatedToken();
  const user = getUserFromStorage();
  const userProfile = user?.user ?? user ?? {};

  // Redirect to login if not authenticated
  if (!user) {
    const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
    router.push(`/login?redirect=${currentPath}`);
    return null;
  }

  // Dates from query params or default to today
  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate"))
    : new Date();
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate"))
    : new Date(Date.now() + 86400000);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkInDate] = useState(() => startDate);
  const [selectedNights, setSelectedNights] = useState(() => {
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffMs / MILLISECONDS_PER_NIGHT);
    return diffDays > 0 ? diffDays : 1;
  });

  
  const { data, loading: fetchLoading } = useFetch(
    roomId ? `/rooms/${roomId}/` : `/hotel/${hotelId}/`
  );

  // popup success message
  useEffect(() => {
    if (success) {
      Swal.fire({
        title: "Booking Successful!",
        text: "Thank you for booking with us.",
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
      }).then(() => {
      
        setOpen(false);
      });
    }
  }, [success, setOpen]);

  const checkoutDate = new Date(checkInDate.getTime() + selectedNights * MILLISECONDS_PER_NIGHT);

  const handleAdjustNights = (delta) => {
    setSelectedNights((prev) => Math.max(1, prev + delta));
  };

  const handleReserve = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!roomId && !hotelId) {
        alert("Room information is missing.");
        setLoading(false);
        return;
      }

      const userId = userProfile?.id;
      const userEmail = userProfile?.email ?? user?.email;
      const userIdentifier = userId ?? userEmail;

      if (!userIdentifier) {
        alert("User not found. Please log in again.");
        setLoading(false);
        return;
      }

      const payload = {
        start_date: format(checkInDate, "yyyy-MM-dd"),
        end_date: format(checkoutDate, "yyyy-MM-dd"),
        nights: selectedNights,
        user: userIdentifier,
        ...(roomId ? { room: roomId } : {}),
      };

      const endpoint = roomId ? `/bookings/` : `/hotels/${hotelId}/book/`;

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      await api.post(endpoint, payload, { headers });
      setSuccess(true);
    } catch (err) {
      Swal.fire({
        title: "Booking Failed",
        text: "You can only book once",
        icon: "error",
        confirmButtonText: "Try again",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="reserve">
        <div className="rContainer">Loading booking details...</div>
      </div>
    );
  }

  return (
    <div className="reserve">
      <div className="rContainer">
        <button className="rClose" onClick={() => setOpen(false)}>
          <CloseIcon />
        </button>
        {success ? (
          <div className="rSuccess">
            <h3> Booking Successful!</h3>
          </div>
        ) : (
          <>
            <h2>Book {data?.room_type || data?.name}</h2>

            <form className="rForm" onSubmit={handleReserve}>
              <div className="rDetails">
                {roomId && (
                  <p>
                    <strong>Type:</strong> {data?.room_type}
                  </p>
                )}
                <p>
                  <strong>Price:</strong> ${data?.price || data?.cheapestPrice} / night
                </p>
                <p>
                  <strong>Check-in:</strong> {format(checkInDate, "MMM dd, yyyy")}
                </p>
                <p>
                  <strong>Check-out:</strong> {format(checkoutDate, "MMM dd, yyyy")}
                </p>
                <p>
                  <strong>Nights:</strong> {selectedNights}
                </p>
              </div>

              <div className="rFormGroup">
                <label htmlFor="rName">Full name</label>
                <input
                  id="rName"
                  type="text"
                  value={userProfile?.full_name ?? userProfile?.username ?? userProfile?.name ?? ""}
                  disabled
                />
              </div>

              <div className="rFormGroup">
                <label htmlFor="rEmail">Email</label>
                <input
                  id="rEmail"
                  type="email"
                  value={userProfile?.email ?? user?.email ?? ""}
                  disabled
                />
              </div>

              {/* <div className="rFormGroup">
                <label htmlFor="rPhone">Phone</label>
                <input
                  id="rPhone"
                  type="text"
                  value={userProfile?.phone ?? userProfile?.phone_number ?? user?.phone ?? ""}
                  disabled
                />
              </div> */}

              <div className="rFormGroup">
                <label htmlFor="rNights">Nights</label>
                <div className="rStepper" id="rNights">
                  <button
                    type="button"
                    className="rStepperButton"
                    onClick={() => handleAdjustNights(-1)}
                    aria-label="Decrease nights"
                  >
                    −
                  </button>
                  <span className="rStepperValue" aria-live="polite">
                    {selectedNights}
                  </span>
                  <button
                    type="button"
                    className="rStepperButton"
                    onClick={() => handleAdjustNights(1)}
                    aria-label="Increase nights"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !data?.is_available}
                className={`rButton ${
                  !data?.is_available ? "rDisabled" : ""
                }`}
              >
                {loading
                  ? "Processing..."
                  : data?.is_available
                  ? "Confirm Booking"
                  : "Unavailable"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const Reserve = (props) => (
  <Suspense
    fallback={
      <div className="reserve">
        <div className="rContainer">Loading booking details...</div>
      </div>
    }
  >
    <ReserveContent {...props} />
  </Suspense>
);

export default Reserve;
