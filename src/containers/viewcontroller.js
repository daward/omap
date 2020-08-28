import { connect } from "react-redux";
import TheComponent from "../components/viewcontroller";
import { age, raise, harden, soften } from "../actions/terrainactions";

const mapStateToProps = ({ views }) => {
  return views;
};

const mapDispatchToProps = dispatch => ({
  onViewChange: (data) => dispatch({ type: "VIEW_CHANGE", data }),
  age: () => dispatch(age()),
  raise: () => dispatch(raise()),
  harden: () => dispatch(harden()),
  soften: () => dispatch(soften())
});

const retVal = connect(
  mapStateToProps,
  mapDispatchToProps
)(TheComponent);

export default retVal;
