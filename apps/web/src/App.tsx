import { Route, Routes } from "react-router";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import BusinessPage from "./pages/BusinessPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import MyBusinessesPage from "./pages/MyBusinessesPage";
import CreateBusinessPage from "./pages/CreateBusinessPage";
import UpdateBusinessPage from "./pages/UpdateBusinessPage";
import CreateLocationPage from "./pages/CreateLocationPage";
import UpdateLocationPage from "./pages/UpdateLocationPage";
import CreateResourcePage from "./pages/CreateResourcePage";
import UpdateResourcePage from "./pages/UpdateResourcePage";
import BookingPage from "./pages/BookingPage";
import MyBookingPage from "./pages/MyBookingPage";
import BusinessBookingPage from "./pages/BusinessBookingPage";
import ViewBookingPage from "./pages/ViewBookinPage";
import AdminRoute from "./components/AdminRoute";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/businesses/:businessId" element={<BusinessPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/businesses/mine" element={<MyBusinessesPage />} />
          <Route path="/businesses/create" element={<CreateBusinessPage />} />
          <Route
            path="/businesses/:businessId/update"
            element={<UpdateBusinessPage />}
          />

          <Route
            path="/businesses/:businessId/locations/create"
            element={<CreateLocationPage />}
          />
          <Route
            path="/businesses/:businessId/locations/:locationId/update"
            element={<UpdateLocationPage />}
          />

          <Route
            path="/businesses/:businessId/locations/:locationId/resources/create"
            element={<CreateResourcePage />}
          />
          <Route
            path="/businesses/:businessId/locations/:locationId/resources/:resourceId/update"
            element={<UpdateResourcePage />}
          />

          <Route
            path="/businesses/:businessId/locations/:locationId/resources/:resourceId/book"
            element={<BookingPage />}
          />
          <Route path="/bookings/:bookingId" element={<ViewBookingPage />} />
          <Route path="/bookings/mine" element={<MyBookingPage />} />
          <Route
            path="/businesses/bookings/mine"
            element={<BusinessBookingPage />}
          />

          <Route element={<AdminRoute />}></Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
