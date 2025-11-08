"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import CancelScheduleSendRoundedIcon from "@mui/icons-material/CancelScheduleSendRounded";
import Swal from "sweetalert2";

import useFetch from "../components/hooks/useFetch";
import api from "../services/axios";
import {
  getUserFromStorage,
  getUserInfo,
  logoutUser,
  getValidatedToken,
} from "../../../utils/auth";

const ProfilePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
  const [userPayload, setUserPayload] = useState(() => getUserFromStorage());
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    username: "",
    phone: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  const storedUser = useMemo(() => getUserFromStorage(), []);

  const fetchFreshUser = useCallback(async () => {
    if (!storedUser) return;
    setLoadingUserInfo(true);
    try {
      const fresh = await getUserInfo();
      if (fresh) {
        setUserPayload(fresh);
      }
    } catch (error) {
      console.warn("Unable to refresh user profile information", error);
    } finally {
      setLoadingUserInfo(false);
    }
  }, [storedUser]);

  useEffect(() => {
    if (!storedUser) {
      router.push("/login?redirect=/profile");
      return;
    }
    fetchFreshUser();
  }, [router, storedUser, fetchFreshUser]);

  const effectiveUser = useMemo(() => {
    const payload = userPayload ?? storedUser ?? {};
    return payload?.user ?? payload ?? {};
  }, [storedUser, userPayload]);

  const userId = effectiveUser?.id;
  const userEmail = effectiveUser?.email;

  useEffect(() => {
    setProfileForm({
      full_name:
        effectiveUser?.full_name ??
        effectiveUser?.username ??
        effectiveUser?.name ??
        "",
      username: effectiveUser?.username ?? "",
      phone: effectiveUser?.phone ?? effectiveUser?.phone_number ?? "",
    });
  }, [effectiveUser]);

  const bookingsUrl = useMemo(
    () => (userId ? `/bookings/?user=${userId}` : null),
    [userId]
  );

  const {
    data: bookingsData = [],
    loading: bookingsLoading,
    reFetch: reFetchBookings,
  } = useFetch(bookingsUrl);

  const token = getValidatedToken();

  const bookings = useMemo(() => {
    if (Array.isArray(bookingsData)) return bookingsData;
    if (Array.isArray(bookingsData?.results)) return bookingsData.results;
    return [];
  }, [bookingsData]);

  const cancellableBookings = useMemo(
    () => bookings.filter((booking) => booking.status !== "cancelled"),
    [bookings]
  );

  const handleProfileFieldChange = (field, value) => {
    setProfileMessage(null);
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    if (!userId && !userEmail) return;

    const trimmedFullName = profileForm.full_name?.trim() ?? "";
    const trimmedUsername = profileForm.username?.trim() ?? "";
    const trimmedPhone = profileForm.phone?.trim() ?? "";

    const payload = {
      full_name: trimmedFullName || null,
      username: trimmedUsername || null,
      phone: trimmedPhone || null,
      phone_number: trimmedPhone || null,
    };

    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (userId) {
        await api.patch(`/users/${userId}/`, payload, { headers });
      } else if (userEmail) {
        await api.patch(`/users/?email=${encodeURIComponent(userEmail)}`, payload, {
          headers,
        });
      }

      if (typeof window !== "undefined") {
        const stored = getUserFromStorage();
        if (stored) {
          const nextStored = {
            ...stored,
            user: {
              ...(stored.user ?? {}),
              ...payload,
            },
          };
          localStorage.setItem("loginUser", JSON.stringify(nextStored));
        }
      }

      await fetchFreshUser();

      setProfileMessage({
        type: "success",
        text: "Profile updated successfully.",
      });
    } catch (error) {
      setProfileMessage({
        type: "error",
        text:
          error?.response?.data?.message ??
          "We couldn't update your profile right now. Please try again later.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!bookingId) return;

    const { isConfirmed } = await Swal.fire({
      title: "Cancel this booking?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "Keep booking",
      confirmButtonColor: "#dc2626",
    });

    if (!isConfirmed) return;

    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      await api.delete(`/bookings/${bookingId}/`, { headers });
      await Swal.fire({
        title: "Booking cancelled",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
      reFetchBookings();
    } catch (error) {
      Swal.fire({
        title: "Cancellation failed",
        text: error?.response?.data?.message ?? "Please try again later.",
        icon: "error",
      });
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (!userId && !userEmail) return;

    const { isConfirmed } = await Swal.fire({
      title: "Delete account permanently?",
      text: "All of your bookings and personal data will be removed.",
      icon: "error",
      confirmButtonText: "Delete account",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });

    if (!isConfirmed) return;

    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      await api.delete(userId ? `/users/${userId}/` : `/users/?email=${userEmail}`, {
        headers,
      });

      await Swal.fire({
        title: "Account deleted",
        text: "We're sorry to see you go.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      await logoutUser();
      router.push("/");
    } catch (error) {
      Swal.fire({
        title: "Deletion failed",
        text:
          error?.response?.data?.message ??
          "We couldn't delete your account right now. Please try again later.",
        icon: "error",
      });
    }
  };

  const tabs = [
    {
      id: "personal",
      label: "Personal Information",
      description: "Keep your contact details up to date",
      icon: <AccountCircleRoundedIcon fontSize="small" />,
    },
    {
      id: "bookings",
      label: "Manage Bookings",
      description: "Review, update or cancel upcoming stays",
      icon: <EventAvailableOutlinedIcon fontSize="small" />,
    },
    {
      id: "danger",
      label: "Danger Zone",
      description: "Manage account-level risky operations",
      icon: <WarningAmberRoundedIcon fontSize="small" />,
    },
  ];

  const renderPersonalTab = () => (
    <div className="rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">
        Profile settings
      </h3>
      <form onSubmit={handleUpdateProfile} className="space-y-8">
        {profileMessage && (
          <div
            className={`rounded-2xl border p-4 text-sm ${
              profileMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {profileMessage.text}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm uppercase tracking-wide text-slate-500">
              Full name
            </label>
            <input
              type="text"
              autoComplete="name"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={profileForm.full_name}
              disabled={profileSaving}
              onChange={(event) =>
                handleProfileFieldChange("full_name", event.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm uppercase tracking-wide text-slate-500">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={profileForm.username}
              disabled={profileSaving}
              onChange={(event) =>
                handleProfileFieldChange("username", event.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm uppercase tracking-wide text-slate-500">
              Phone number
            </label>
            <input
              type="tel"
              autoComplete="tel"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={profileForm.phone}
              disabled={profileSaving}
              onChange={(event) =>
                handleProfileFieldChange("phone", event.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm uppercase tracking-wide text-slate-500">
              Email (read only)
            </label>
            <input
              type="email"
              value={effectiveUser?.email ?? ""}
              disabled
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm uppercase tracking-wide text-slate-500">
              Member since
            </label>
            <input
              type="text"
              value={
                effectiveUser?.date_joined
                  ? new Date(effectiveUser.date_joined).toLocaleDateString()
                  : "—"
              }
              disabled
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={profileSaving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/60 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {profileSaving ? "Saving changes..." : "Save changes"}
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 transition-transform hover:-translate-y-0.5 hover:bg-white hover:text-indigo-600"
            onClick={() => setActiveTab("bookings")}
            disabled={profileSaving}
          >
            <AssignmentTurnedInOutlinedIcon fontSize="small" />
            Manage bookings
            <ArrowOutwardRoundedIcon fontSize="small" />
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-transform hover:-translate-y-0.5 hover:bg-slate-50"
            onClick={handleLogout}
            disabled={profileSaving}
          >
            <LogoutRoundedIcon fontSize="small" />
            Sign out
          </button>
        </div>
      </form>
    </div>
  );

  const renderBookingsTab = () => (
    <div className="rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Upcoming & recent bookings
          </h3>
          <p className="text-sm text-slate-500">
            Track every stay and make adjustments ahead of time.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-white"
          onClick={reFetchBookings}
        >
          Refresh list
        </button>
      </div>

      <div className="mt-6">
        {bookingsLoading ? (
          <div className="flex items-center justify-center rounded-2xl bg-slate-50 py-16 text-slate-500">
            Loading your bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-50 py-16 text-center text-slate-500">
            <EventAvailableOutlinedIcon fontSize="large" />
            <p>No bookings to show just yet.</p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              onClick={() => router.push("/hotel")}
            >
              Explore hotels
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Hotel / Room
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Check-in
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Check-out
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nights
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking.id ?? `${booking.room}-${booking.start_date}`}>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {booking.room_detail?.hotel ?? booking.hotel_name ?? "—"}
                      <span className="block text-xs font-normal text-slate-400">
                        Room {booking.room_detail?.room_number ?? booking.room}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {booking.start_date
                        ? new Date(booking.start_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {booking.end_date
                        ? new Date(booking.end_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-center text-sm font-semibold text-slate-700">
                      {booking.nights ??
                        (booking.start_date && booking.end_date
                          ? Math.max(
                              1,
                              Math.ceil(
                                (new Date(booking.end_date) -
                                  new Date(booking.start_date)) /
                                  (1000 * 60 * 60 * 24)
                              )
                            )
                          : "—")}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold">
                      <span
                        className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
                          booking.status === "cancelled"
                            ? "bg-rose-100 text-rose-600"
                            : booking.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {booking.status ?? "pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-white"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderDangerZoneTab = () => (
    <div className="rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur">
      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-rose-600">
          <WarningAmberRoundedIcon fontSize="small" />
          Proceed with caution
        </h3>
        <p className="text-sm text-slate-600">
          Advanced actions that may impact your account or bookings. Make sure you fully understand the consequences before proceeding.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6">
          <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-600">
            <WarningAmberRoundedIcon fontSize="small" />
            Booking safety
          </h4>
          <p className="mt-3 text-sm text-amber-700">
            Need to make a change to an existing stay? Use the bookings tab to adjust dates or cancel.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-white"
            onClick={() => setActiveTab("bookings")}
          >
            Go to bookings
            <ArrowOutwardRoundedIcon fontSize="small" />
          </button>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-6">
          <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-rose-600">
            <DeleteForeverRoundedIcon fontSize="small" />
            Account deletion
          </h4>
          <p className="mt-3 text-sm text-rose-700">
            This will permanently remove your account and cancel all future stays. Access cannot be restored afterwards.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-200/60 transition hover:bg-rose-600"
            onClick={handleDeleteAccount}
          >
            Delete my account
          </button>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-rose-100 bg-rose-50/70 p-6">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-rose-600">
              <CancelScheduleSendRoundedIcon fontSize="small" />
              Cancel a booking
            </h4>
            <p className="text-sm text-rose-700">
              Need to abort an upcoming stay immediately? Select it below to cancel on the spot.
            </p>
          </div>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-white md:mt-0"
            onClick={reFetchBookings}
          >
            Refresh list
            <ArrowOutwardRoundedIcon fontSize="small" />
          </button>
        </div>

        <div className="mt-6">
          {bookingsLoading ? (
            <div className="flex items-center justify-center rounded-xl bg-white/60 py-10 text-sm text-rose-600">
              Loading bookings...
            </div>
          ) : cancellableBookings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white/60 py-10 text-center text-rose-500">
              <p>No active bookings eligible for cancellation.</p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                onClick={() => setActiveTab("bookings")}
              >
                View booking history
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cancellableBookings.map((booking) => (
                <li
                  key={booking.id ?? `${booking.room}-${booking.start_date}`}
                  className="flex flex-col gap-3 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-rose-100 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {booking.room_detail?.hotel ?? booking.hotel_name ?? "Hotel booking"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {booking.start_date
                        ? new Date(booking.start_date).toLocaleDateString()
                        : "—"}
                      {" "}to{" "}
                      {booking.end_date
                        ? new Date(booking.end_date).toLocaleDateString()
                        : "—"}
                      {booking.nights ? ` • ${booking.nights} night(s)` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
                        booking.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-600"
                          : booking.status === "cancelled"
                          ? "bg-rose-100 text-rose-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {booking.status ?? "pending"}
                    </span>
                    <button
                      type="button"
                      className="rounded-xl border border-rose-200 bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel booking
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  const tabPanels = {
    personal: renderPersonalTab(),
    bookings: renderBookingsTab(),
    danger: renderDangerZoneTab(),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-white pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-24">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 p-10 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_45%)]" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold">
                {effectiveUser?.full_name?.[0]?.toUpperCase() ??
                  effectiveUser?.username?.[0]?.toUpperCase() ??
                  "U"}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/70">
                  Welcome back
                </p>
                <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
                  {effectiveUser?.full_name ??
                    effectiveUser?.username ??
                    "Your personal hub"}
                </h1>
                <p className="mt-3 max-w-xl text-base text-white/80">
                  Manage your stays, keep your profile fresh and stay in control of every booking—all in one elegant space.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 rounded-2xl bg-white/15 p-6">
              <span className="text-xs uppercase tracking-wide text-white/70">
                Loyalty status
              </span>
              <span className="text-2xl font-semibold">
                {bookings.length > 5 ? "Frequent Voyager" : "Trusted Guest"}
              </span>
              <span className="text-sm text-white/70">
                {bookings.length} completed bookings
              </span>
            </div>
          </div>
        </section>

        <div className="mt-10">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`group flex flex-1 min-w-[220px] max-w-sm flex-col gap-1 rounded-2xl border px-4 py-4 text-left transition hover:-translate-y-0.5 ${
                    isActive
                      ? "border-indigo-500 bg-white text-indigo-700 shadow-lg"
                      : "border-transparent bg-white/70 text-slate-600 hover:bg-white"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                    <span className={`${isActive ? "text-indigo-600" : "text-slate-400"}`}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </span>
                  <span className="text-xs text-slate-500">
                    {tab.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 space-y-10">
          {loadingUserInfo && (
            <div className="rounded-3xl border border-indigo-100 bg-white/80 p-6 text-sm text-indigo-600">
              Refreshing your profile details...
            </div>
          )}

          {tabPanels[activeTab]}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
