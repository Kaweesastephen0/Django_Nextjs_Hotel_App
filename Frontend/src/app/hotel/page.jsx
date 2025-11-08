"use client"

import "./list.css";
import Header from "../components/header/Header";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import useFetch from "../components/hooks/useFetch"
import SearchItem from "../components/searchItem/SearchItem";
import Skeleton from "../components/CardSkeleton/CardSkeleton"

const ListContent = () => {
  // Read destination from query string  or use lastSearch in localStorage
  const searchParams = useSearchParams();
  const paramDestination = searchParams?.get("destination") || "";

  const getLastSearch = () => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("lastSearch"));
    } catch (e) {
      return null;
    }
  };

  const lastSearch = typeof window !== "undefined" ? getLastSearch() : null;

  const [destination, setDestination] = useState(
    paramDestination || (lastSearch?.destination ?? "")
  );

  const [dates, setDates] = useState(() => {
    if (lastSearch?.dates) return lastSearch.dates;
    return [
      {
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        key: "selection",
      },
    ];
  });

  const [openDate, setOpenDate] = useState(false);

  const [options, setOptions] = useState(() => lastSearch?.options ?? { adult: 1, children: 0, room: 1 });
  const [min, setMin] = useState(undefined);
  const [max, setMax] = useState(undefined);

  const { data, loading, error, reFetch } = useFetch(`/hotels?city=${destination}&min=${min || 0}&max=${max || 999}`);

  const handleClick = () => {

    reFetch();

  }
  return (
    <div>
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          <div className="listSearch">
            <h1 className="lsTitle">Search</h1>
            <div className="lsItem">
              <label>Destination</label>
              <input
              placeholder="Enter destination"
              className="border-none focus:outline-none focus:ring-0 focus:border-none"
             type="text"
             value={destination}
             onChange={(e) => setDestination(e.target.value)}
             />
            </div>
            <div className="lsItem ">
              <label className="text-white">Check-in Date</label>
              <span className="text-gray-600" onClick={() => setOpenDate(!openDate)}>{`${format(
                dates[0].startDate,
                "MM/dd/yyyy"
              )} to ${format(dates[0].endDate, "MM/dd/yyyy")}`}</span>
              {openDate && (
                <DateRange
                  onChange={(item) => setDates([item.selection])}
                  minDate={new Date()}
                  ranges={dates}
                />
              )}
            </div>
            <div className="lsItem">
              <label>Options</label>
              <div className="lsOptions">
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Min price <small>per night</small>
                  </span>
                  <input type="number" onChange={e => setMin(e.target.value)} className="lsOptionInput" value={min} />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Max price <small>per night</small>
                  </span>
                  <input type="number" className="lsOptionInput" value={max} onChange={(e) => setMax(e.target.value)} />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Adult</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    value={options.adult}
                    onChange={(e) => setOptions({...options, adult: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Children</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    value={options.children}
                    onChange={(e) => setOptions({...options, children: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Room</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    value={options.room}
                    onChange={(e) => setOptions({...options, room: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
            </div>
            <button onClick={handleClick}>Search</button>
          </div>
          <div className="listResult">
            {loading ? <Skeleton cards={10} /> : <>
              {Array.isArray(data) && data.map((item) => (
                <SearchItem item={item} key={item.id} />
              ))}
            </>}
          </div>
        </div>
      </div>
    </div>
  );
};

const List = () => (
  <Suspense
    fallback={
      <div className="listSuspenseFallback">
        <Header type="list" />
        <div className="listContainer">
          <div className="listWrapper">
            <div className="listResult">
              <Skeleton cards={10} />
            </div>
          </div>
        </div>
      </div>
    }
  >
    <ListContent />
  </Suspense>
);

export default List;
