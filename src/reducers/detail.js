const details = (
  state = {
    master: { x: 100, y: 100 },
    zoom: { x: 100, y: 100 }
  },
  action
) => {
  switch (action.type) {
    case "DETAIL_CHANGE": {
      return Object.assign({}, state, action.data);
    }

    default:
      return state;
  }
};

export default details;
