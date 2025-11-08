"use client";
import Header from "../components/header/Header";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}rooms/`, {
          credentials: "include",
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch rooms: ${res.status}`);
        }
        
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, []);

  if (loading) return <p className="p-4">Loading rooms...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <>
      <Header type="list" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
        {rooms.length > 0 ? (
          rooms.map((room) => {
            const primaryImage =
              room.images && room.images.length > 0
                ? `${room.images[0].image_url}`
                : "/no-image.jpg"; // fallback image
            
            return (
              <Link
                href={`/room/${room.id}`}
                key={room.id}
                className="border rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition duration-200 block"
              >
                <div className="relative">
                  <img
                    src={primaryImage}
                    alt={room.room_type || "Room image"}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = "/no-image.jpg";
                    }}
                  />
                  {!room.is_available && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      Booked
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{room.room_type}</h3>
                  <p className="text-sm text-gray-500">Room #{room.room_number}</p>
                  <p className="text-green-600 font-bold mt-2">${room.price}</p>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No rooms available</p>
          </div>
        )}
      </div>
    </>
  );
}