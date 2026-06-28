import React from "react";
import { useState } from "react";

export default function Modal({ title, body, confirmAction, onClose }) {
  return (
    <div
      className="modal window-style-dark fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog mt-5" role="document">
        <div className="modal-content window-style">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">{body}</div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={confirmAction}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
