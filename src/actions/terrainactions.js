
export const age = () => {
  return (dispatch, getState) => {
    const runAge = () => {
      const { elevations, views: { autoAge } } = getState();
      elevations.terrain.age({ years: 1, peakNum: 5 });
      dispatch({ type: "ELEVATION_CHANGE", terrain: elevations.terrain });
      if (autoAge) {
        setTimeout(runAge, 2000);
      }
    }
    runAge();
  }
}

export const raise = () => {
  return (dispatch, getState) => {
    const { elevations } = getState();
    // raise up the middle a bit
    elevations.terrain.alter({ direction: 1, edge: 5, numIslands: 5, maxChange: 20, distanceJitter: .7 });
    // and offset with a drop in the oceans
    elevations.terrain.alter({ direction: -1, edge: 50, numIslands: 5, maxChange: 20, distanceJitter: .3, centered: false, domed: false })
    dispatch({ type: "ELEVATION_CHANGE", terrain: elevations.terrain });
  }
}

export const harden = () => {
  return (dispatch, getState) => {
    const { elevations } = getState();
    // raise up the middle a bit
    elevations.terrain.harden(.1);
    dispatch({ type: "ELEVATION_CHANGE", terrain: elevations.terrain });
  }
}

export const soften = () => {
  return (dispatch, getState) => {
    const { elevations } = getState();
    // raise up the middle a bit
    elevations.terrain.soften(.1);
    dispatch({ type: "ELEVATION_CHANGE", terrain: elevations.terrain });
  }
}