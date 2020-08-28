import _ from "lodash";
import uuid from "uuid/v4";

const distance = (point1, point2) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2))
}

export default class Terrain {
  constructor({ width, height }) {
    const grid = [];
    this.seaLevelPct = .6;
    this.evaporationRate = .1;

    for (let ch = 0; ch < height; ch += 1) {
      grid.push({ cells: [] });
      for (let cw = 0; cw < width; cw += 1) {
        grid[ch].cells.push({ elevation: 0, hardness: 0, wetness: .5, x: cw, y: ch, water: 0 })
      }
    }

    this.width = width;
    this.height = height;
    this.grid = grid;
  }


  harden = (changeAmount) => {

    this.fullScan(pt => {
      const hardnessOpportunity = 1 - pt.hardness;
      pt.hardness = pt.hardness + hardnessOpportunity * changeAmount;
    });

    console.log(this.findMinMax("hardness"));
  }

  soften = (changeAmount) => {

    this.fullScan(pt => {
      pt.hardness = pt.hardness - pt.hardness * changeAmount;
    });

    console.log(this.findMinMax("hardness"));
  }

  getIsland = ({ maxChange, edge, direction = 1, centered = true }) => {
    const change = (Math.random() / 10 + .9) * maxChange * direction;

    if (centered) {
      return {
        x: Math.round(Math.random() * ((this.width - 1) - edge * 2)) + edge,
        y: Math.round(Math.random() * ((this.height - 1) - edge * 2)) + edge,
        change,
      }
    } else {
      const xEdge = Math.round(Math.random() * edge * 2);
      const yEdge = Math.round(Math.random() * edge * 2);
      const x = xEdge < edge / 2 ? xEdge : this.width - xEdge;
      const y = yEdge < edge / 2 ? yEdge : this.width - yEdge;
      return {
        x,
        y,
        change
      }
    }
  }

  calculateSmoothing({ radius, x, y, property = "elevation" }) {
    let sum = 0;
    let count = 0;
    const calculation = point => {
      sum += point[property];
      count++
    }
    this.scan({ point: { x, y }, radius, fn: calculation });
    this.grid[y].cells[x].smoothed = sum / count;
  }

  fullScan(fn) {
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        const point = this.grid[y].cells[x];
        fn(point)
      }
    }
  }

  applySmoothing({ intensity, property = "elevation" }) {
    const smoothPoint = point => {
      if (point.smoothed !== undefined) {
        const difference = point.smoothed - point[property];
        // the bigger the difference, the more effected it should be by the average
        const erosion = ({ point, intensity }) => {
          const erosionCoefficient = intensity * .7 + (1 - point.hardness) * .3
          return point.elevation + difference * erosionCoefficient;
        }

        const other = ({ point, intensity }) => {
          return point[property] + (difference * intensity);
        }

        const func = property === "elevation" ? erosion : other

        point[property] = func({ point, intensity });
        delete point.smoothed;
      }
    }
    this.fullScan(smoothPoint);
  }

  smooth({ radius = 1, intensity = 1, property = "elevation" }) {
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        this.calculateSmoothing({ radius, x, y, property })
      }
    }
    this.applySmoothing({ intensity, property })
  }

  setDistances(islands) {
    // calculate distances
    let minDist = undefined;
    let maxDist = undefined;
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        const nearest = _.minBy(islands, island => distance(island, { x, y }));
        const dist = distance(nearest, { x, y });
        const point = this.grid[y].cells[x];
        point.distance = dist;
        point.nearestPeak = nearest.change;
        if (maxDist === undefined || maxDist < dist) {
          maxDist = dist
        }
        if (minDist === undefined || minDist > dist) {
          minDist = dist
        }
      }
    }
    return {
      minDist, maxDist
    }
  }

  generateEdge(edge) {
    return Math.round(Math.random() * edge + edge / 2);
  }

  alter({ property = "elevation", direction, edge, numIslands, maxChange, distanceJitter, centered = true, domed = false }) {

    const islands = _.times(numIslands, () => this.getIsland({
      maxChange,
      edge: this.generateEdge(edge),
      direction,
      centered
    }));

    islands.forEach(peak => {
      const point = this.grid[peak.y].cells[peak.x];
      point[property] = (point[property] || 0) + peak.change;
    });

    const { minDist, maxDist } = this.setDistances(islands);

    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        const point = this.grid[y].cells[x];
        if (point.distance) {
          const normalDist = (point.distance - minDist) / (maxDist - minDist);
          const distanceChange = point.nearestPeak * (domed ? Math.sqrt(1 - normalDist) : Math.pow(1 - normalDist, 2));
          const randomChange = point.nearestPeak * Math.random();
          const change = distanceChange * (1 - distanceJitter) + randomChange * distanceJitter;
          point[property] += (point[property] || 0) + change;
        }
      }
    }
  }

  dry() {
    const dryPoint = point => {
      delete point.river;
      delete point.rivers;
      delete point.lake;
      delete point.end;
      delete point.lakeBottom;
      delete point.flow;
      point.water = Math.max(point.water - this.evaporationRate, 0);
    }
    this.fullScan(dryPoint);
  }

  findMinMax(property = "elevation") {
    let max = undefined;
    let min = undefined;
    // find the lowest and highest points
    for (let i = 0; i < this.grid.length; i += 1) {
      for (let j = 0; j < this.grid[i].cells.length; j += 1) {
        if (max === undefined || this.grid[i].cells[j][property] > max) {
          max = this.grid[i].cells[j][property];
        }
        if (min === undefined || this.grid[i].cells[j][property] < min) {
          min = this.grid[i].cells[j][property];
        }
      }
    }
    return { min, max }
  }

  scan({ point, radius, fn }) {
    for (let x = Math.max(point.x - radius, 0); x <= Math.min(point.x + radius, this.width - 1); x += 1) {
      for (let y = Math.max(point.y - radius, 0); y <= Math.min(point.y + radius, this.height - 1); y += 1) {
        fn(this.grid[y].cells[x]);
      }
    }
  }

  setSeaLevel(pct) {
    const { min, max } = this.findMinMax();
    this.seaLevel = Math.round((max - min) * (pct || this.seaLevelPct) + min);
  }

  adjacents({ points }) {
    const adjacents = [];
    const adjacentFinder = candidate => {
      if (!_.find(points, point => candidate.x === point.x && candidate.y === point.y)) {
        adjacents.push(candidate)
      }
    }
    points.forEach(point => this.scan({ point, radius: 1, fn: adjacentFinder }));

    return adjacents;
  }

  flood({ peak, violence = 1, silt = 0, riverId = uuid(), speed = 0, first = true, water = 0 }) {
    peak.rivers = peak.rivers || [];
    peak.river = true;
    peak.rivers.push(riverId);
    peak.seaLevel = this.seaLevel;
    peak.first = first;
    peak.speed = speed;
    water += peak.water || 0;

    const dropSiltDelta = (point) => {
      let radius = 0;

      const siltPoint = point => {
        if (point.elevation <= this.seaLevel) {
          // we'll give it however much silt it can take
          const deposit = Math.min(silt, this.seaLevel - point.elevation + Math.round(Math.random() * 10));
          point.elevation = point.elevation + deposit;
          silt -= deposit;
          point.hardness = .2;
          point.siltDelta = true;
          point.lastDeposit = deposit;
        }
      };

      while (silt > 0 && radius < 4) {
        radius++;
        this.scan({
          point, radius, fn: siltPoint
        })
      }
    }

    const dropSiltBanks = ({ newSpeed, speed }) => {
      // if the river is speeding up, we won't drop any silt
      if (newSpeed > speed) {
        return;
      }
      // otherwise, we'll drop at most 10 silt units, or something as a function of how much the river has slowed
      const siltBankSize = Math.min(10, Math.log((speed - newSpeed) + 2.5));

      // then figure out where to drop it
      const siltSites = _.shuffle(_.filter(candidates, candidate => !candidate.river && candidate.elevation < peak.elevation + siltBankSize));
      siltSites.forEach(site => {
        const deposit = Math.min((Math.random() * siltBankSize - 1), silt / candidates.length);
        silt -= deposit;
        if (silt < 0) {
          console.log("ruh roh")
        }
        site.elevation += deposit;
        site.silted = true;
      })
    }

    const dropBroadRiverSilt = () => {
      let lakeCandidates = [peak];
      let currentLake = [];
      // will determine if the given point is a lake-bottom point
      const testLakeBottomCandidate = (candidate) => {
        let isBottom = true;
        const candidates = []
        this.scan({
          point: candidate, radius: 1, fn: point => {
            isBottom = isBottom && point.river;
            if (point.lake === undefined && point.river) {
              candidates.push(point)
            }
          }
        })
        // if everything around it is a river, then its the bottom of a lake
        return {
          // if everything around it is a river, then its the bottom of a lake
          isBottom,
          // since we have the adjacents already, we might as well return the things we dont already know about
          candidates: isBottom ? candidates : []
        }
      }

      // we'll look through all the candidates breadth first
      while (lakeCandidates.length) {
        // pull off the front of the array to check
        const candidate = lakeCandidates.shift();
        if (!candidate.lakeBottom) {
          // if its a river adjacent to a lake bottom (which any candidate should be)
          // then its part of the current lake
          if (candidate.river) {
            currentLake.push(candidate);
          }
          candidate.lake = candidate.river;

          // then look to see if its a lake bottom, which would mean every adjacent
          // cell is a river
          const { isBottom, candidates } = testLakeBottomCandidate(candidate);
          candidate.lakeBottom = isBottom
          lakeCandidates = lakeCandidates.concat(candidates)
        }

      }

      currentLake.sort((a, b) => (a.elevation > b.elevation) ? 1 : ((b.elevation > a.elevation) ? -1 : 0))
      // we've established a basin, now lets start to silt it in
      let j = currentLake.length - 1
      while (silt > 0 && j > 1) {
        for (let i = 0; i < j; i++) {
          if (silt <= 0) {
            break;
          }
          const possibleDeposit = Math.random() * (currentLake[j].elevation - currentLake[i].elevation);
          const deposit = Math.min(possibleDeposit, silt);
          silt -= deposit;
          currentLake[i].elevation += deposit;
          currentLake[i].siltDelta = true;
        }
        j--;
      }
    }

    const getRiverCandidates = () => {
      let candidates = [];
      const selectCandidate = candidate => {
        // make sure we dont double back on ourself
        if (!candidate.rivers || !candidate.rivers.includes(riverId)) {
          candidates.push(candidate);
        }
      }
      this.scan({ point: peak, radius: 1, fn: selectCandidate });

      // if we've merged with another river, stay merged
      if (peak.rivers.length > 1) {
        const basin = peak.rivers.filter(river => river != riverId);
        candidates = candidates.filter(candidate => _.difference(basin, candidate.rivers).length === 0)
      }
      return candidates;
    }

    let candidates = _.shuffle(getRiverCandidates());

    const localMin = _.minBy(candidates, candidate => candidate.elevation);

    // if we have nowehre to go, its because we've looped around on ourselves
    // so we're actually part of a lake now. 
    if (!candidates.length) {
      dropBroadRiverSilt();
    }

    // TODO: now the silt has been dropped, the elevations have been changed... could we continue on?

    // we have a local minimum that works for us
    if (localMin) {

      peak.localMin = localMin.elevation;
      peak.pElev = peak.elevation;
      // if local min was already a river, it will have a flow
      // we should get to count it towards ours
      water += localMin.flow || 0;

      // we're going to go uphill or perhaps get stuck
      if (localMin.elevation > peak.elevation) {
        const deposit = Math.min(silt, localMin.elevation - peak.elevation);
        peak.elevation += deposit;
        silt -= deposit;
      }


      // if we're still too low, then I guess we're stuck
      if ((localMin.elevation > peak.elevation + water)) {
        // drop as much silt as we need to fill up the canyon enough to move on
        peak.water = water;
        peak.lake = true;
        // otherwise we can continue our flow normally
      } else {

        // we've met the ocean! lets start dropping a lot of silt
        if (localMin.elevation < this.seaLevel) {
          dropSiltDelta(localMin);
        } else {

          // make sure the elevation drops
          // TODO: the violence should be a function of river speed and volume
          let newElevation = Math.min(peak.elevation - violence, localMin.elevation);
          newElevation = Math.max(newElevation, this.seaLevel);

          // calculate how fast the river is moving using the elevation change
          const newSpeed = (peak.elevation - newElevation) + speed / 2;
          peak.flow = Math.min(water * (1 - this.evaporationRate), 1000);
          peak.erosiveForce = Math.sqrt(peak.flow * newSpeed);
          peak.speed = newSpeed;

          // drop silt if we need to along the river banks
          dropSiltBanks({ newSpeed, speed });

          if (newSpeed > 10) {
            const canyonDepth = Math.min(newElevation - (this.seaLevel + .5), (1 - localMin.hardness))
            newElevation -= canyonDepth;
          }

          silt += Math.max(localMin.elevation - newElevation, 0);

          localMin.elevation = newElevation;
          // water is how much wetness there is minus the evaporation rate
          water += Math.max(peak.wetness - this.evaporationRate, 0)
          // the excess water has now moved past
          peak.water = 0;


          this.flood({ peak: localMin, violence, silt, riverId, speed: newSpeed, first: false, water });
        }
      }
    } else {
      peak.end = true;
      // nowhere to go, but the water can stay
      peak.water = water;

      this.scan({
        point: peak, radius: 5, fn: point => {
          this.calculateSmoothing({ radius: 5, x: point.x, y: point.y })
        }
      })
    }
  }

  age({ years, peakNum = 20, maxPeaks = 50 }) {
    let peaks = this.findPeaks(Math.ceil(Math.random() * peakNum + 5));
    let water = 0;
    for (let x = 0; x < years; x += 1) {
      this.dry();
      water += Math.round(Math.random() * 3)
      const violence = 1;
      peaks.sort((a, b) => (a.elevation > b.elevation) ? -1 : ((b.elevation > a.elevation) ? 1 : 0));
      peaks = peaks.slice(0, Math.floor(25 + Math.random() * 50));
      peaks.forEach(peak => this.flood({ peak, violence, water }));
    }
    this.applySmoothing({ intensity: .7 });
  }

  findPeaks(radius) {

    const examine = (candidate, x, y) => {
      // now look to find the highest in its area
      for (let sx = Math.max(x - radius, 0); sx <= Math.min(x + radius, this.width - 1); sx += 1) {
        for (let sy = Math.max(y - radius, 0); sy <= Math.min(y + radius, this.height - 1); sy += 1) {
          const candidate = this.grid[y].cells[x];
          const compared = this.grid[sy].cells[sx];
          if (compared.elevation > candidate.elevation) {
            return undefined;
          }
        }
      }
      candidate.x = x;
      candidate.y = y;
      return candidate;
    }

    let peaks = [];

    // scan through the whole grid
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        if (this.grid[y].cells[x].elevation > this.seaLevel + 10) {
          const peak = examine(this.grid[y].cells[x], x, y);
          if (peak) {
            peaks.push(peak);
          }
        }
      }
    }
    return peaks;
  }

  buildNormalized({ xCenter, yCenter, radius, property = "elevation" }) {
    const normal = [];
    // build normalized color grid
    const { max } = this.findMinMax(property);
    const min = this.seaLevel;
    if (!radius) {
      radius = this.width;
    }

    for (let y = Math.max(0, yCenter - radius); y <= Math.min(yCenter + radius, this.grid.length - 1); y += 1) {
      normal.push({ cells: [] })
      for (let x = Math.max(0, xCenter - radius); x <= Math.min(xCenter + radius, this.grid[y].cells.length - 1); x += 1) {
        const normalized = (this.grid[y].cells[x][property] - min) / (max - min);
        normal[normal.length - 1].cells.push({ normalized, y, x });
      }
    }

    return normal;
  }
}
