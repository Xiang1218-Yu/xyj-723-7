import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CountDown } from '../CountDown';
import { Progress } from '../Progress';
import { buyBusiness, decreaseBalance, setLastRun } from '../../redux/actions';
import './Business.css';

export function Business({ id, name, price, lastRun, timeTaken, hasManager, quantityPurchased, icon, profit }) {
  const dispatch = useDispatch();
  const balance = useSelector((state) => state.balance);
  const cycleMs = timeTaken * 1000;

  const runBusinessManually = (e) => {
    e.preventDefault();
    if (!lastRun) {
      dispatch(setLastRun(id));
    }
  };

  const buy = () => {
    if (balance.amount >= price) {
      dispatch(buyBusiness(id, 1));
      dispatch(decreaseBalance(price));
    }
  };

  return (
    <div className="business">
      {!!quantityPurchased && (
        <>
          <div className="business-icon" onClick={runBusinessManually}>
            <img src={process.env.PUBLIC_URL + '/images/' + icon} alt="icon" width="60" />
            <div className="business-quantity">{quantityPurchased}</div>
          </div>
          <div className="business-content">
            <div className="business-progress" onClick={runBusinessManually}>
              <Progress lastRun={lastRun} timeTaken={cycleMs} />
              <span className="business-profit">${profit.toLocaleString()}</span>
            </div>
            <div className="business-buy-and-timer">
              <div
                className={'business-buy' + (balance.amount >= price ? ' active' : '')}
                onClick={buy}
              >
                <span>Buy</span>
                <span>${price.toLocaleString()}</span>
              </div>
              <div className="business-timer">
                <CountDown lastRun={lastRun} timeTaken={cycleMs} />
              </div>
            </div>
          </div>
        </>
      )}
      {!quantityPurchased && (
        <div
          className={'business-unpurchased' + (balance.amount >= price ? ' active' : '')}
          onClick={buy}
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/lock.png)` }}
        >
          <span>{name}</span>
          <br />
          <span className="price">${price.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
