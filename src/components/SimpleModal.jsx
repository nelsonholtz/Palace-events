import React from "react";
import "../css/SimpleModal.css";

const SimpleModal = ({
  isOpen,
  onClose,
  title,
  message,
  buttons = [],
  onButtonClick,
}) => {
  if (!isOpen) return null;

  const handleButtonClick = (buttonAction) => {
    if (onButtonClick) {
      onButtonClick(buttonAction);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>

        <div className="modal-body">
          <p>{message}</p>

          {buttons.length > 0 && (
            <div
              className={`modal-actions ${
                buttons.length === 1 ? "single" : "double"
              }`}
            >
              {buttons.map((button, index) => (
                <button
                  key={index}
                  className={`modal-btn modal-btn-${button.type || "primary"}`}
                  onClick={() => handleButtonClick(button.action)}
                >
                  {button.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;
