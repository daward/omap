
const views = (
  state = {
    showDeltaSilt: false,
    showRivers: true,
    autoAge: false
  },
  action
) => {
  switch (action.type) {
    case "VIEW_CHANGE": {
      return Object.assign({}, state, action.data);
    }

    default:
      return state;
  }
};

export default views;
