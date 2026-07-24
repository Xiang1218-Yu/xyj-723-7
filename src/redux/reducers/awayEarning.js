import { SET_AWAY_EARNING } from "../actionTypes";

const initialState = {
  amount: 0,
  awayDuration: ''
};

export default function awayEarning(state = initialState, action) {
  switch (action.type) {
    // Populated by the calculateOfflineEarnings thunk so the welcome-back
    // modal can show how much was earned while away.
    case SET_AWAY_EARNING:
      return {
        amount: action.payload.amount,
        awayDuration: action.payload.awayDuration
      };
    default:
      return state;
  }
}
