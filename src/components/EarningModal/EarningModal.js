import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAwayEarning } from '../../redux/actions';
import './EarningModal.css';

export function EarningModal({ onClose }) {
  const dispatch = useDispatch();
  const { awayDuration, amount } = useSelector((state) => state.awayEarning);
  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const handleClose = () => {
    dispatch(clearAwayEarning());
    if (onClose) onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-close" onClick={handleClose}>
          <img src={process.env.PUBLIC_URL + '/images/close.png'} alt="Close" />
        </div>
        <h2>Welcome back!</h2>
        <div className="come-back-info">
          Hooray! While you were away for <span className="away-time">{awayDuration}</span>,
          your managers helped you earn <span className="earning-amount">{formattedAmount}</span>.<br /><br />
          It's amazing!
        </div>
      </div>
    </div>
  );
}
