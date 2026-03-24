import { Outlet } from "react-router-dom";

export default function ClientBookingLayout() {
  return (
    <div className="layout layout--minimal">
      <div className="layout-header">
        <div className="header-container">
          <div className="header-brand">
            <span className="brand-mark">🐾</span>
            <span className="brand-name">Book Your Appointment</span>
          </div>
        </div>
      </div>

      <div className="layout-body">
        <main className="main">
          <Outlet />
        </main>
      </div>

      <footer className="layout-footer">
        <p className="footer-text">
          Your booking information is secure and private.
        </p>
      </footer>
    </div>
  );
}
