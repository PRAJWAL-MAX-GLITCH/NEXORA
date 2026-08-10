import { PrismaClient, CustomerType, CustomerStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@erp.com', password: passwordHash, role: 'ADMIN' },
  });
  const sales = await prisma.user.create({
    data: { name: 'Sales User', email: 'sales@erp.com', password: passwordHash, role: 'SALES' },
  });
  const warehouse = await prisma.user.create({
    data: { name: 'Warehouse User', email: 'warehouse@erp.com', password: passwordHash, role: 'WAREHOUSE' },
  });
  const accounts = await prisma.user.create({
    data: { name: 'Accounts User', email: 'accounts@erp.com', password: passwordHash, role: 'ACCOUNTS' },
  });

  // 2. Create Realistic Customers
  const customerData = [
    {
      name: 'Rohan Sharma',
      businessName: 'Arora Distributors',
      mobile: '9876543210',
      email: 'rohan@aroradist.com',
      customerType: CustomerType.DISTRIBUTOR,
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      notes: 'High volume electronics distributor in Delhi.'
    },
    {
      name: 'Amit Patel',
      businessName: 'Patel Wholesale',
      mobile: '9876543211',
      email: 'amit@patelwholesale.in',
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      notes: 'Regular buyer of peripherals.'
    },
    {
      name: 'Neha Gupta',
      businessName: 'Metro Retail',
      mobile: '9876543212',
      email: 'contact@metroretail.com',
      customerType: CustomerType.RETAIL,
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
      notes: 'Interested in bulk monitors. Follow up for quotation.'
    },
    {
      name: 'Vikram Singh',
      businessName: 'Shree Trading Co.',
      mobile: '9876543213',
      email: 'vikram@shreetrading.in',
      customerType: CustomerType.WHOLESALE,
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(), // today
      notes: 'Requires weekly shipments of cables.'
    },
    {
      name: 'Anjali Desai',
      businessName: 'Sunrise Enterprises',
      mobile: '9876543214',
      email: 'info@sunriseent.com',
      customerType: CustomerType.DISTRIBUTOR,
      status: CustomerStatus.INACTIVE,
      followUpDate: null,
      notes: 'Account paused until next quarter.'
    }
  ];

  const customers = [];
  for (const c of customerData) {
    const customer = await prisma.customer.create({ data: c });
    customers.push(customer);
  }

  // 3. Create Realistic Products
  const productData = [
    { name: 'Gamma Wireless Mouse', sku: 'GM-WM-001', category: 'Peripherals', unitPrice: 1200, currentStock: 150, minimumStock: 30, warehouseLocation: 'A-01' },
    { name: 'Alpha Mechanical Keyboard', sku: 'AM-KB-002', category: 'Peripherals', unitPrice: 4500, currentStock: 25, minimumStock: 20, warehouseLocation: 'A-02' },
    { name: 'USB-C Hub (7-in-1)', sku: 'UC-HB-003', category: 'Accessories', unitPrice: 2800, currentStock: 12, minimumStock: 15, warehouseLocation: 'B-01' }, // Low stock
    { name: 'HDMI Cable 2.1 (2m)', sku: 'HD-CB-004', category: 'Accessories', unitPrice: 450, currentStock: 500, minimumStock: 100, warehouseLocation: 'B-02' },
    { name: '24-inch IPS Monitor', sku: 'MN-24-005', category: 'Displays', unitPrice: 12500, currentStock: 4, minimumStock: 10, warehouseLocation: 'C-01' }, // Low stock
    { name: '1TB NVMe SSD', sku: 'ST-1T-006', category: 'Storage', unitPrice: 6200, currentStock: 0, minimumStock: 20, warehouseLocation: 'C-02' }, // Out of stock
    { name: 'Noise Cancelling Headphones', sku: 'AU-NC-007', category: 'Audio', unitPrice: 8900, currentStock: 45, minimumStock: 15, warehouseLocation: 'D-01' },
    { name: 'Ergonomic Office Chair', sku: 'OF-CH-008', category: 'Furniture', unitPrice: 15000, currentStock: 8, minimumStock: 10, warehouseLocation: 'E-01' }, // Low stock
  ];

  const products = [];
  for (const p of productData) {
    const product = await prisma.product.create({ data: p });
    products.push(product);
  }

  // 4. Initial Stock Movements
  for (const product of products) {
    if (product.currentStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: product.currentStock,
          type: 'IN',
          reason: 'Initial Warehouse Audit',
          createdBy: warehouse.id,
        },
      });
    }
  }

  // 5. Create some realistic Challans
  // A Draft Challan
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-2024-00001',
      customerId: customers[0].id,
      totalQuantity: 20,
      status: 'DRAFT',
      createdBy: sales.id,
      items: {
        create: [
          {
            productId: products[0].id,
            productNameSnapshot: products[0].name,
            skuSnapshot: products[0].sku,
            unitPriceSnapshot: products[0].unitPrice,
            quantity: 20
          }
        ]
      }
    }
  });

  // A Confirmed Challan
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-2024-00002',
      customerId: customers[1].id,
      totalQuantity: 10,
      status: 'CONFIRMED',
      createdBy: sales.id,
      items: {
        create: [
          {
            productId: products[3].id,
            productNameSnapshot: products[3].name,
            skuSnapshot: products[3].sku,
            unitPriceSnapshot: products[3].unitPrice,
            quantity: 10
          }
        ]
      }
    }
  });

  console.log('Database seeded successfully with realistic data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
