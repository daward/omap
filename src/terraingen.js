import Terrain from "./terrain";

export default function () {
  const terrain = new Terrain({
    width: 300,
    height: 300
  });

  terrain.alter({ property: "hardness", numIslands: 100, direction: 1, edge: 30, maxChange: .9, distanceJitter: .3 });
  terrain.smooth({ radius: 7, intensity: .7, property: "hardness" });
  // sorta raise up everything
  terrain.alter({ direction: 1, edge: 5, numIslands: 20, maxChange: 20, distanceJitter: .7 });
  terrain.smooth({ radius: 6, intensity: .7 });
  // higher things closer to the middle
  terrain.alter({ direction: 1, edge: 30, numIslands: 70, maxChange: 100, distanceJitter: .2 });
  // much higher further in the middle
  // terrain.smooth({ radius: 10, intensity: .5 });
  // terrain.alter({ direction: 1, edge: 50, numIslands: 30, maxChange: 100, distanceJitter: .5 });
  // push the oceans down at the edges
  terrain.alter({ direction: -1, edge: 50, numIslands: 50, maxChange: 100, distanceJitter: .3, centered: false, domed: false })
  terrain.smooth({ radius: 7, intensity: .9 });
  
  terrain.setSeaLevel();
  terrain.age({ years: 1, peakNum: 5 });
  // terrain.smooth({ radius: 7, intensity: .7 });
  // terrain.age({ years: 500, peakNum: 3 });
  // terrain.smooth({ radius: 7, intensity: .7 });
  // terrain.dry();
  // terrain.smooth({ radius: 3, intensity: .3 });
  // terrain.age({ years: 30, peakNum: 10 });
  // terrain.smooth({ radius: 3, intensity: .5 });
  // terrain.alter({ direction: 1, edge: 20, numIslands: 10, maxChange: 200, distanceJitter: .5 });
  // terrain.age({ years: 10, peakNum: 20 });
  // terrain.smooth({ radius: 3, intensity: .6 });
  // terrain.age({ years: 40, peakNum: 6 });
  // terrain.alter({ direction: 1, edge: 20, numIslands: 20, maxChange: 500, distanceJitter: .5, domed: true });
  // terrain.age({ years: 20, peakNum: 5 });
  // terrain.smooth({ radius: 10, intensity: .7 });
  // terrain.alter({ direction: 1, edge: 20, numIslands: 10, maxChange: 100, distanceJitter: .9 });
  // terrain.age({ years: 60, peakNum: 10 });
  // terrain.smooth({ radius: 10, intensity: .8 });
  // terrain.age({ years: 20, peakNum: 5 });
  // // terrain.smooth({ radius: 5, intensity: .2 });
  // terrain.age({ years: 20, peakNum: 5 });
  // terrain.alter({ direction: 1, edge: 20, numIslands: 10, maxChange: 100, distanceJitter: .9 });
  // terrain.smooth({ radius: 3, intensity: .6 });
  // terrain.age({ years: 60, peakNum: 4 });
  // // terrain.smooth({ radius: 3, intensity: .4 });
  // terrain.age({ years: 100, peakNum: 5 });

  return terrain;
}