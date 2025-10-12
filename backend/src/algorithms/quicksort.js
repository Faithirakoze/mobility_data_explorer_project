class TripRanker {
  constructor() {
    this.comparisons = 0;
    this.swaps = 0;
  }

  quickSort(trips, sortBy = 'distance', order = 'desc') {
    this.comparisons = 0;
    this.swaps = 0;
    
    if (trips.length <= 1) {
      return trips;
    }

    return this._quickSortRecursive(trips, 0, trips.length - 1, sortBy, order);
  }

  _quickSortRecursive(trips, low, high, sortBy, order) {
    if (low < high) {
      const pivotIndex = this._partition(trips, low, high, sortBy, order);
      
      this._quickSortRecursive(trips, low, pivotIndex - 1, sortBy, order);
      this._quickSortRecursive(trips, pivotIndex + 1, high, sortBy, order);
    }
    
    return trips;
  }

  _partition(trips, low, high, sortBy, order) {
    const pivot = this._getValue(trips[high], sortBy);
    let i = low - 1;

    for (let j = low; j < high; j++) {
      this.comparisons++;
      const currentValue = this._getValue(trips[j], sortBy);
      
      const shouldSwap = order === 'desc' 
        ? currentValue > pivot 
        : currentValue < pivot;

      if (shouldSwap) {
        i++;
        this._swap(trips, i, j);
      }
    }

    this._swap(trips, i + 1, high);
    return i + 1;
  }

  _swap(trips, i, j) {
    this.swaps++;
    const temp = trips[i];
    trips[i] = trips[j];
    trips[j] = temp;
  }

  _getValue(trip, sortBy) {
    switch (sortBy) {
      case 'distance':
        return parseFloat(trip.analytics?.tripDistanceKm || 0);
      case 'speed':
        return parseFloat(trip.analytics?.tripSpeedKmh || 0);
      case 'duration':
        return parseInt(trip.tripDuration || 0);
      case 'fare':
        return parseFloat(trip.fareAmount || 0);
      default:
        return parseFloat(trip.analytics?.tripDistanceKm || 0);
    }
  }

  getStats() {
    return {
      comparisons: this.comparisons,
      swaps: this.swaps
    };
  }
}

function rankTrips(trips, sortBy = 'distance', order = 'desc', limit = 100) {
  const ranker = new TripRanker();
  const sortedTrips = ranker.quickSort([...trips], sortBy, order);
  const stats = ranker.getStats();

  return {
    trips: sortedTrips.slice(0, limit),
    algorithm: 'QuickSort',
    sortBy,
    order,
    stats: {
      totalTrips: trips.length,
      comparisons: stats.comparisons,
      swaps: stats.swaps,
      complexity: `O(n log n) average, O(n²) worst`
    }
  };
}

module.exports = { TripRanker, rankTrips };

