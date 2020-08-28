
const elevations = (
  state = {},
  action
) => {
  switch (action.type) {
    case "ELEVATION_CHANGE": {
      return Object.assign({}, state, {
        terrain: action.terrain
      });
    }

    default:
      return state;
  }
};

export default elevations;
