import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CountDown } from '../CountDown';
import { Progress } from '../Progress';
import { startProduction, buyBusinessWithFunds } from '../../redux/actions';
import { useGameTick } from '../../hooks/useGameTick';
import './Business.css';

export function Business({ id, name, price, lastRun, timeTaken, hasManager, quantityPurchased, icon, profit, running }) {
  useGameTick();
  const dispatch = useDispatch();
  const balance = useSelector((state) => state.balance);

  const runBusinessManually = (e) => {
    e.preventDefault();
    if (!running) {
      dispatch(startProduction(id));
    }
  };

  const buy = () => {
    if (balance.amount >= price) {
      dispatch(buyBusinessWithFunds(id, 1));
    }
  };

  const cycleMs = timeTaken * 1000;
  const inProgress = running && lastRun;

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
              <Progress timeTaken={cycleMs} lastRun={lastRun} running={inProgress} />
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
                <CountDown timeTaken={cycleMs} lastRun={lastRun} running={inProgress} />
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
