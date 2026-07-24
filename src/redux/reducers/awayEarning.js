import { SET_AWAY_EARNINGS, CLEAR_AWAY_EARNINGS } from '../actionTypes';

const initialState = {
  amount: 0,
  awayDuration: '',
};

function awayEarningReducer(state = initialState, action) {
  switch (action.type) {
    case SET_AWAY_EARNINGS:
      return {
        amount: action.payload.amount,
        awayDuration: action.payload.awayDuration,
      };
    case CLEAR_AWAY_EARNINGS:
      return {
        amount: 0,
        awayDuration: '',
      };
    default:
      return state;
  }
}

export default awayEarningReducer;
