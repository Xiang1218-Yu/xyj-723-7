import React from 'react';
import { useSelector } from 'react-redux';
import './EarningModal.css';

export function EarningModal({ onClose = () => {} }) {
  const { awayDuration, amount } = useSelector(state => state.awayEarning);
  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-close" onClick={() => onClose()}>
          <img src={process.env.PUBLIC_URL + '/images/close.png'} alt="Close" />
        </div>
        <h2>Welcome back!</h2>
        <div className="come-back-info">
          Hooray! While you were away for <span className="away-time">{awayDuration}</span>,
          your managers helped you earn <span className="earning-amount">{formattedAmount}</span>.<br/><br/>
          It's amazing!
        </div>
      </div>
    </div>
  );
}