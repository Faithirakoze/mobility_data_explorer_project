const prisma = require('../config/database');

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await prisma.$queryRaw`
      SELECT v.vendor_id, v.name, CAST(COUNT(t.id) AS CHAR) as trip_count
      FROM vendors v
      LEFT JOIN trips t ON v.vendor_id = t.vendor_id
      GROUP BY v.vendor_id, v.name
      ORDER BY v.vendor_id
    `;

    res.json({
      vendors: vendors.map(vendor => ({
        vendorId: vendor.vendor_id,
        name: vendor.name,
        tripCount: parseInt(vendor.trip_count)
      }))
    });
  } catch (error) {
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

