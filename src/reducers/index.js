import { combineReducers } from "redux";
import elevations from "./elevations";
import detail from "./detail";
import views from "./views";

const reducers = combineReducers({
  elevations,
  detail,
  views
});

export default reducers;
