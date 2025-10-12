const prisma = require('../config/database');
const { rankTrips } = require('../algorithms/quicksort');

exports.getAllTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};

    if (req.query.vendor_id) {
      where.vendorId = parseInt(req.query.vendor_id);
    }

    if (req.query.start_date && req.query.end_date) {
      where.pickupDatetime = {
        gte: new Date(req.query.start_date),
        lte: new Date(req.query.end_date)
      };
    }

    if (req.query.min_distance) {
      where.analytics = {
        tripDistanceKm: {
          gte: parseFloat(req.query.min_distance)
        }
      };
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
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
      }),
      prisma.trip.count({ where })
    ]);

    res.json({
      trips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
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

