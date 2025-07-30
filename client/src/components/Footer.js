import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white text-center text-muted py-3 border-top">
      <div className="container">
        <small>
          © {new Date().getFullYear()} Landycodes. All rights reserved.
        </small>
      </div>
    </footer>
  );
}
