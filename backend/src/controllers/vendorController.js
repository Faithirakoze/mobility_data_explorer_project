const prisma = require('../config/database');

// Mock vendors data for testing
const getMockVendors = () => {
  return [
    { vendor_id: 1, name: 'Green Taxi', trip_count: '2' },
    { vendor_id: 2, name: 'Yellow Taxi', trip_count: '2' },
    { vendor_id: 3, name: 'Blue Taxi', trip_count: '1' }
  ];
};

exports.getAllVendors = async (req, res) => {
  try {
    let vendors;
    try {
      vendors = await prisma.$queryRaw`
        SELECT v.vendor_id, v.name, CAST(COUNT(t.id) AS CHAR) as trip_count
        FROM vendors v
        LEFT JOIN trips t ON v.vendor_id = t.vendor_id
        GROUP BY v.vendor_id, v.name
        ORDER BY v.vendor_id
      `;
    } catch (dbError) {
      console.log('Database not available, using mock vendor data');
      vendors = getMockVendors();
    }

    // Return simple array format that frontend expects
    const transformedVendors = vendors.map(vendor => ({
      vendorId: vendor.vendor_id,
      name: vendor.name || `Vendor ${vendor.vendor_id}`,
      tripCount: parseInt(vendor.trip_count)
    }));

    res.json(transformedVendors);
  } catch (error) {
    console.error('Error in getAllVendors:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendorId = parseInt(req.params.id);

    const vendor = await prisma.vendor.findUnique({
      where: { vendorId },
      include: {
        _count: {
          select: { trips: true }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({
      vendorId: vendor.vendorId,
      name: vendor.name,
      tripCount: vendor._count.trips
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

