import { connect } from "react-redux";
import _ from "lodash";
import TheComponent from "../components/canvas";
import gradient from "gradient-color";

const mapStateToProps = ({
  elevations: { terrain },
  detail: { master, zoom },
  views: { showDeltaSilt, showRivers, hardness } = {}
},
  { size, radius, type }) => {
  if (!terrain) {
    return { grid: [{ cells: [] }] }
  }

  const numBlue = (100 * terrain.seaLevelPct) / (1 - terrain.seaLevelPct);

  let elevationColors = [];

  elevationColors = elevationColors.concat(gradient(['green', 'yellow'], 40));
  elevationColors = elevationColors.concat(gradient(['yellow', 'brown'], 40));
  elevationColors = elevationColors.concat(gradient(['brown', 'white'], 20));

  const erosionColors = gradient(["rgb(0, 65, 176)", "rgb(217, 231, 255)"], 20);
  const riverColors = gradient(["rgb(79, 141, 255)", "rgb(1, 51, 143)"], 50);

  const xCenter = type === "zoom" ? master.x : 0;
  const yCenter = type === "zoom" ? master.y : 0;

  const property = hardness ? "hardness" : "elevation";
  const grid = terrain.buildNormalized({ xCenter, yCenter, radius, property });

  const colors = {};

  // build normalized color grid
  for (let i = 0; i < grid.length; i += 1) {
    for (let j = 0; j < grid[i].cells.length; j += 1) {
      const point = grid[i].cells[j];
      grid[i].cells[j] = elevationColors[Math.ceil((elevationColors.length - 1) * point.normalized)];
      if (showRivers && terrain.grid[point.y].cells[point.x].river) {
        grid[i].cells[j] = "#0142aa";

        const { rivers } = terrain.grid[point.y].cells[point.x];
        let color = _.compact(rivers.map(riverId => colors[riverId]))[0];
        if (!color) {
          color = riverColors.splice(Math.floor(Math.random() * riverColors.length), 1)[0];
        }
        rivers.forEach(riverId => colors[riverId] = color);

        grid[i].cells[j] = color;


        // const forceBucket = Math.min(20, Math.ceil(terrain.grid[point.y].cells[point.x].erosiveForce / 5));
        // grid[i].cells[j] = erosionColors[forceBucket];
      }

      if (terrain.grid[point.y].cells[point.x].elevation < terrain.seaLevel) {
        grid[i].cells[j] = "blue"
      }

      if (terrain.grid[point.y].cells[point.x].end) {
        grid[i].cells[j] = "red";
      }

      // if (showRivers && (terrain.grid[point.y].cells[point.x].lake || terrain.grid[point.y].cells[point.x].water)) {
      //   grid[i].cells[j] = "#4f91f9"
      // }

      if (showDeltaSilt && terrain.grid[point.y].cells[point.x].siltDelta) {
        grid[i].cells[j] = "grey";
      }

      if (type === "zoom" && point.x === zoom.x && point.y === zoom.y) {
        grid[i].cells[j] = "black";
      }
    }
  }


  return { grid, size, leftCorner: { x: Math.max((xCenter - radius) || 0, 0), y: Math.max((yCenter - radius) || 0, 0) } };
};

const mapDispatchToProps = (dispatch, { type, size }) => ({
  onSelected: ({ x, y }) => {
    const action = {
      type: "DETAIL_CHANGE",
      data: {}
    };
    action.data[type] = { x, y };
    dispatch(action);
  }
});

const retVal = connect(
  mapStateToProps,
  mapDispatchToProps
)(TheComponent);

export default retVal;
