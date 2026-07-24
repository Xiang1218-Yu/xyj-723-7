import { SET_AWAY_EARNING, CLEAR_AWAY_EARNING } from "../actionTypes";

const initialState = {
  amount: 0,
  awayDuration: '',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_AWAY_EARNING: {
      return {
        amount: action.payload.amount,
        awayDuration: action.payload.awayDuration,
      };
    }
    case CLEAR_AWAY_EARNING: {
      return initialState;
    }
    default:
      return state;
  }
}
