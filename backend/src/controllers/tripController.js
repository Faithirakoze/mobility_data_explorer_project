const prisma = require('../config/database');
const { rankTrips } = require('../algorithms/quicksort');

// Mock data for testing when database is not available
const getMockTrips = () => {
  return [
    {
      id: 'trip_1',
      vendorId: 1,
      pickupDatetime: new Date('2023-12-01T08:30:00'),
      dropoffDatetime: new Date('2023-12-01T08:45:00'),
      passengerCount: 2,
      tripDuration: 900, // 15 minutes in seconds
      vendor: { vendorId: 1, name: 'Green Taxi' },
      analytics: { tripDistanceKm: 5.2, tripSpeedKmh: 20.8, pickupHour: '8' }
    },
    {
      id: 'trip_2',
      vendorId: 2,
      pickupDatetime: new Date('2023-12-01T09:15:00'),
      dropoffDatetime: new Date('2023-12-01T09:35:00'),
      passengerCount: 1,
      tripDuration: 1200, // 20 minutes in seconds
      vendor: { vendorId: 2, name: 'Yellow Taxi' },
      analytics: { tripDistanceKm: 8.1, tripSpeedKmh: 24.3, pickupHour: '9' }
    },
    {
      id: 'trip_3',
      vendorId: 1,
      pickupDatetime: new Date('2023-12-01T10:00:00'),
      dropoffDatetime: new Date('2023-12-01T10:25:00'),
      passengerCount: 3,
      tripDuration: 1500, // 25 minutes in seconds
      vendor: { vendorId: 1, name: 'Green Taxi' },
      analytics: { tripDistanceKm: 12.5, tripSpeedKmh: 30.0, pickupHour: '10' }
    },
    {
      id: 'trip_4',
      vendorId: 3,
      pickupDatetime: new Date('2023-12-01T11:30:00'),
      dropoffDatetime: new Date('2023-12-01T11:50:00'),
      passengerCount: 1,
      tripDuration: 1200, // 20 minutes in seconds
      vendor: { vendorId: 3, name: 'Blue Taxi' },
      analytics: { tripDistanceKm: 6.8, tripSpeedKmh: 20.4, pickupHour: '11' }
    },
    {
      id: 'trip_5',
      vendorId: 2,
      pickupDatetime: new Date('2023-12-01T14:15:00'),
      dropoffDatetime: new Date('2023-12-01T14:40:00'),
      passengerCount: 2,
      tripDuration: 1500, // 25 minutes in seconds
      vendor: { vendorId: 2, name: 'Yellow Taxi' },
      analytics: { tripDistanceKm: 9.3, tripSpeedKmh: 22.3, pickupHour: '14' }
    }
  ];
};

exports.getAllTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Increase default limit
    const skip = (page - 1) * limit;

    const where = {};

    // Handle vendor filter (from frontend it comes as 'vendor', backend expects vendor_id)
    if (req.query.vendor || req.query.vendor_id) {
      where.vendorId = parseInt(req.query.vendor || req.query.vendor_id);
    }

    // Handle date filters
    if (req.query.start_date && req.query.end_date) {
      where.pickupDatetime = {
        gte: new Date(req.query.start_date),
        lte: new Date(req.query.end_date)
      };
    }

    // Handle hour filter
    if (req.query.hour) {
      const hour = parseInt(req.query.hour);
      // We'll filter by hour using analytics table
      where.analytics = {
        ...(where.analytics || {}),
        pickupHour: hour.toString()
      };
    }

    // Handle distance filter
    if (req.query.min_distance) {
      where.analytics = {
        ...(where.analytics || {}),
        tripDistanceKm: {
          gte: parseFloat(req.query.min_distance)
        }
      };
    }

    let trips;
    try {
      trips = await prisma.trip.findMany({
        where,
        skip,
        take: limit,
        include: {
          vendor: true,
          analytics: true
        },
        orderBy: {
          pickupDatetime: 'desc'
        }
      });
    } catch (dbError) {
      console.log('Database not available, using mock data');
      // Use mock data when database is not available
      trips = getMockTrips();
      
      // Apply basic filtering to mock data
      if (req.query.vendor) {
        const vendorId = parseInt(req.query.vendor);
        trips = trips.filter(trip => trip.vendorId === vendorId);
      }
      
      if (req.query.hour) {
        const hour = req.query.hour.toString();
        trips = trips.filter(trip => trip.analytics?.pickupHour === hour);
      }
      
      // Apply pagination to mock data
      trips = trips.slice(skip, skip + limit);
    }

    // Transform data to match frontend expectations
    const transformedTrips = trips.map(trip => {
      // Calculate a mock fare based on distance and duration (since we don't have actual fare data)
      const baseFare = 2.50;
      const perKmRate = 1.80;
      const perMinuteRate = 0.35;
      
      const distance = trip.analytics?.tripDistanceKm ? parseFloat(trip.analytics.tripDistanceKm) : 0;
      const durationMinutes = trip.tripDuration ? trip.tripDuration / 60 : 0;
      const calculatedFare = baseFare + (distance * perKmRate) + (durationMinutes * perMinuteRate);
      
      return {
        id: trip.id,
        pickup_datetime: trip.pickupDatetime.toISOString(),
        dropoff_datetime: trip.dropoffDatetime.toISOString(),
        vendor_id: trip.vendorId,
        vendor_name: trip.vendor?.name || `Vendor ${trip.vendorId}`,
        fare_amount: parseFloat(calculatedFare.toFixed(2)),
        distance_km: trip.analytics?.tripDistanceKm ? parseFloat(trip.analytics.tripDistanceKm) : 0,
        avg_speed: trip.analytics?.tripSpeedKmh ? parseFloat(trip.analytics.tripSpeedKmh) : 0,
        passenger_count: trip.passengerCount,
        trip_duration: trip.tripDuration
      };
    });

    // Apply fare filters if specified
    let filteredTrips = transformedTrips;
    if (req.query.min_fare || req.query.max_fare) {
      filteredTrips = transformedTrips.filter(trip => {
        const fare = trip.fare_amount;
        const minFare = req.query.min_fare ? parseFloat(req.query.min_fare) : 0;
        const maxFare = req.query.max_fare ? parseFloat(req.query.max_fare) : Infinity;
        return fare >= minFare && fare <= maxFare;
      });
    }

    // Return simple array for frontend (not wrapped in object)
    res.json(filteredTrips);
  } catch (error) {
    console.error('Error in getAllTrips:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        vendor: true,
        analytics: true
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteTrip = async (req, res) => {
  try {
    await prisma.trip.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rankTrips = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'distance';
    const order = req.query.order || 'desc';
    const limit = parseInt(req.query.limit) || 100;

    const trips = await prisma.trip.findMany({
      take: 1000,
      include: {
        vendor: true,
        analytics: true
      }
    });

    const rankedResults = rankTrips(trips, sortBy, order, limit);

    res.json(rankedResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyzeTrips = async (req, res) => {
  try {
    const [hourlyStats, dailyStats, overallStats] = await Promise.all([
      prisma.$queryRaw`
        SELECT pickup_hour, 
               CAST(COUNT(*) AS CHAR) as trip_count,
               CAST(AVG(trip_speed_kmh) AS DECIMAL(10,2)) as avg_speed,
               CAST(AVG(trip_distance_km) AS DECIMAL(10,2)) as avg_distance
        FROM trip_analytics
        WHERE pickup_hour IS NOT NULL
        GROUP BY pickup_hour
        ORDER BY pickup_hour
        LIMIT 24
      `,
      
      prisma.$queryRaw`
        SELECT pickup_dayofweek,
               CAST(COUNT(*) AS CHAR) as trip_count,
               CAST(AVG(trip_speed_kmh) AS DECIMAL(10,2)) as avg_speed,
               CAST(AVG(trip_distance_km) AS DECIMAL(10,2)) as avg_distance
        FROM trip_analytics
        WHERE pickup_dayofweek IS NOT NULL
        GROUP BY pickup_dayofweek
        LIMIT 7
      `,
      
      prisma.$queryRaw`
        SELECT CAST(COUNT(*) AS CHAR) as total_trips,
               CAST(AVG(trip_duration) AS DECIMAL(10,2)) as avg_duration,
               CAST(AVG(passenger_count) AS DECIMAL(10,2)) as avg_passengers
        FROM trips
        LIMIT 1
      `
    ]);

    res.json({
      hourlyStats: hourlyStats.map(stat => ({
        pickupHour: stat.pickup_hour,
        tripCount: parseInt(stat.trip_count),
        avgSpeed: parseFloat(stat.avg_speed),
        avgDistance: parseFloat(stat.avg_distance)
      })),
      dailyStats: dailyStats.map(stat => ({
        pickupDayofweek: stat.pickup_dayofweek,
        tripCount: parseInt(stat.trip_count),
        avgSpeed: parseFloat(stat.avg_speed),
        avgDistance: parseFloat(stat.avg_distance)
      })),
      overallStats: {
        totalTrips: parseInt(overallStats[0].total_trips),
        avgDuration: parseFloat(overallStats[0].avg_duration),
        avgPassengers: parseFloat(overallStats[0].avg_passengers)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

