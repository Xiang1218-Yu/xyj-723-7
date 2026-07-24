import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CountDown } from '../CountDown';
import { Progress } from '../Progress';
import { buyBusiness, decreaseBalance, setLastRun } from '../../redux/actions';
import './Business.css';

// A single business row. Production (cycle completion + payout) is handled
// centrally by the BusinessSystem game loop, so this component no longer owns
// timers, uuids or an onComplete callback — it just reads `lastRun` from the
// store and renders. Clicking an idle, unmanaged business starts a cycle by
// stamping its lastRun; the loop credits the profit when the cycle finishes.
export function Business({ id, name, price, lastRun, timeTaken, hasManager, quantityPurchased, icon, profit }) {
  const dispatch = useDispatch();
  const balance = useSelector(state => state.balance);

  const isRunning = !!lastRun;

  const runBusinessManually = (e) => {
    e.preventDefault();
    // Only manual (unmanaged) businesses need a click, and only when idle.
    if (!hasManager && !isRunning) {
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
      {!!quantityPurchased &&
        <>
        <div className="business-icon" onClick={runBusinessManually}>
          <img src={process.env.PUBLIC_URL + '/images/' + icon} alt="icon" width="60"/>
          <div className="business-quantity">{quantityPurchased}</div>
        </div>
        <div className="business-content">
          <div className="business-progress" onClick={runBusinessManually}>
            <Progress timeTaken={timeTaken} lastRun={lastRun}/>
            <span className="business-profit">${profit.toLocaleString()}</span>
          </div>
          <div className="business-buy-and-timer">
            <div className={'business-buy' + (balance.amount >= price ? ' active' : '')}
              onClick={buy}>
              <span>Buy</span><span>${price.toLocaleString()}</span>
            </div>
            <div className="business-timer">
              <CountDown timeTaken={timeTaken} lastRun={lastRun}/>
            </div>
          </div>
        </div>
        </>
      }
      {!quantityPurchased &&
        <div className={'business-unpurchased' + (balance.amount >= price ? ' active' : '')}
          onClick={buy}
          style={{backgroundImage: `url(${process.env.PUBLIC_URL}/images/lock.png)`}}>
          <span>{name}</span><br/>
          <span className="price">${price.toLocaleString()}</span>
        </div>
      }
    </div>
  );
}
