// Minimal thunk middleware (redux-thunk is not a dependency, so we ship our
// own tiny version). If an action is a function, invoke it with dispatch and
// getState so async / multi-step flows like calculateOfflineEarnings and
// applyTick can run through the standard Redux pipeline.
const thunk = ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }
  return next(action);
};

export default thunk;
