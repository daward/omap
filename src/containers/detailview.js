import { connect } from "react-redux";
import TheComponent from "../components/detailview";

const mapStateToProps = ({ elevations: { terrain }, detail: { zoom } }) => {
  if (!terrain) {
    return { point: {} }
  }

  return { point: terrain.grid[zoom.y].cells[zoom.x] };
};

const mapDispatchToProps = dispatch => ({
  onSelected: () => { }
});

const retVal = connect(
  mapStateToProps,
  mapDispatchToProps
)(TheComponent);

export default retVal;
