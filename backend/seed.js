const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const User = require('./models/User');
const RawMaterial = require('./models/RawMaterial');
const Product = require('./models/Product');
const Batch = require('./models/Batch');
const Order = require('./models/Order');

dotenv.config();

// ============ USERS ============
const users = [
    {
        name: 'Admin',
        email: 'admin@pharmalink.com',
        password: 'Admin@123',
        role: 'admin'
    },
    {
        name: 'Distributor',
        email: 'distributor@pharmalink.com',
        password: 'Distributor@123',
        role: 'distributor',
        companyName: 'PharmaLink Distributors',
        gstNumber: '29ABCDE1234F1Z5'
    }
];

// ============ RAW MATERIALS ============
const rawMaterials = [
    { name: 'Paracetamol Powder', unit: 'kg', currentStock: 250, minimumThreshold: 50, supplier: 'ChemSource India' },
    { name: 'Ibuprofen Powder', unit: 'kg', currentStock: 180, minimumThreshold: 40, supplier: 'PharmaChem Ltd.' },
    { name: 'Amoxicillin Trihydrate', unit: 'kg', currentStock: 120, minimumThreshold: 30, supplier: 'BioActive Labs' },
    { name: 'Cetirizine HCl', unit: 'kg', currentStock: 90, minimumThreshold: 20, supplier: 'MediRaw Supplies' },
    { name: 'Omeprazole Pellets', unit: 'kg', currentStock: 75, minimumThreshold: 15, supplier: 'GastroPharm Co.' },
    { name: 'Microcrystalline Cellulose', unit: 'kg', currentStock: 500, minimumThreshold: 100, supplier: 'ExcipientWorld' },
    { name: 'Starch Powder', unit: 'kg', currentStock: 400, minimumThreshold: 80, supplier: 'ExcipientWorld' },
    { name: 'Magnesium Stearate', unit: 'kg', currentStock: 150, minimumThreshold: 30, supplier: 'ChemSource India' },
    { name: 'Purified Water', unit: 'liters', currentStock: 2000, minimumThreshold: 500, supplier: 'AquaPure Systems' },
    { name: 'Sucrose Syrup Base', unit: 'liters', currentStock: 300, minimumThreshold: 60, supplier: 'SweetChem Corp.' },
    { name: 'Gelatin Capsule Shells', unit: 'kg', currentStock: 200, minimumThreshold: 50, supplier: 'CapsuTech Ltd.' },
    { name: 'Sodium Chloride (Saline)', unit: 'kg', currentStock: 8, minimumThreshold: 10, supplier: 'MediRaw Supplies' },  // Low stock!
];

// ============ PRODUCTS (formulas added after materials are created) ============
const productTemplates = [
    {
        name: 'ParaCure 500mg',
        type: 'Tablet',
        pricePerUnit: 2.50,
        sku: 'PC-TAB-500',
        description: 'Paracetamol 500mg tablets for pain relief and fever reduction',
        formulaKeys: [
            { materialName: 'Paracetamol Powder', quantityRequired: 0.5 },
            { materialName: 'Microcrystalline Cellulose', quantityRequired: 0.15 },
            { materialName: 'Starch Powder', quantityRequired: 0.1 },
            { materialName: 'Magnesium Stearate', quantityRequired: 0.02 }
        ]
    },
    {
        name: 'IbuRelief 400mg',
        type: 'Tablet',
        pricePerUnit: 3.00,
        sku: 'IR-TAB-400',
        description: 'Ibuprofen 400mg tablets for anti-inflammatory and pain relief',
        formulaKeys: [
            { materialName: 'Ibuprofen Powder', quantityRequired: 0.4 },
            { materialName: 'Microcrystalline Cellulose', quantityRequired: 0.2 },
            { materialName: 'Starch Powder', quantityRequired: 0.1 },
            { materialName: 'Magnesium Stearate', quantityRequired: 0.02 }
        ]
    },
    {
        name: 'AmoxiShield 250mg',
        type: 'Tablet',
        pricePerUnit: 5.00,
        sku: 'AS-TAB-250',
        description: 'Amoxicillin 250mg antibiotic capsules',
        formulaKeys: [
            { materialName: 'Amoxicillin Trihydrate', quantityRequired: 0.25 },
            { materialName: 'Gelatin Capsule Shells', quantityRequired: 0.1 },
            { materialName: 'Magnesium Stearate', quantityRequired: 0.01 }
        ]
    },
    {
        name: 'AllerFree 10mg',
        type: 'Tablet',
        pricePerUnit: 1.80,
        sku: 'AF-TAB-010',
        description: 'Cetirizine 10mg antihistamine tablets for allergy relief',
        formulaKeys: [
            { materialName: 'Cetirizine HCl', quantityRequired: 0.01 },
            { materialName: 'Microcrystalline Cellulose', quantityRequired: 0.15 },
            { materialName: 'Starch Powder', quantityRequired: 0.08 },
            { materialName: 'Magnesium Stearate', quantityRequired: 0.01 }
        ]
    },
    {
        name: 'GastroEase 20mg',
        type: 'Tablet',
        pricePerUnit: 4.50,
        sku: 'GE-TAB-020',
        description: 'Omeprazole 20mg capsules for acid reflux and ulcer treatment',
        formulaKeys: [
            { materialName: 'Omeprazole Pellets', quantityRequired: 0.02 },
            { materialName: 'Gelatin Capsule Shells', quantityRequired: 0.12 },
            { materialName: 'Magnesium Stearate', quantityRequired: 0.01 }
        ]
    },
    {
        name: 'ParaCure Kids Syrup',
        type: 'Syrup',
        pricePerUnit: 45.00,
        sku: 'PC-SYR-120',
        description: 'Paracetamol 120mg/5ml syrup for children',
        formulaKeys: [
            { materialName: 'Paracetamol Powder', quantityRequired: 0.12 },
            { materialName: 'Sucrose Syrup Base', quantityRequired: 0.8 },
            { materialName: 'Purified Water', quantityRequired: 0.5 }
        ]
    },
    {
        name: 'SalineShot IV',
        type: 'Injection',
        pricePerUnit: 25.00,
        sku: 'SS-INJ-500',
        description: 'Normal Saline 0.9% injection for IV fluid therapy (500ml)',
        formulaKeys: [
            { materialName: 'Sodium Chloride (Saline)', quantityRequired: 0.0045 },
            { materialName: 'Purified Water', quantityRequired: 0.5 }
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected\n');

        // ---------- SEED USERS ----------
        console.log('👤 Seeding Users...');
        let distributorId;
        for (const u of users) {
            const exists = await User.findOne({ email: u.email });
            if (exists) {
                console.log(`   ⏭  ${u.email} already exists`);
                if (u.role === 'distributor') distributorId = exists._id;
                continue;
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(u.password, salt);
            const created = await User.create({
                name: u.name,
                email: u.email,
                password: hashedPassword,
                role: u.role,
                companyName: u.companyName,
                gstNumber: u.gstNumber
            });
            console.log(`   ✅ Created ${u.email} (${u.role})`);
            if (u.role === 'distributor') distributorId = created._id;
        }

        // ---------- SEED RAW MATERIALS ----------
        console.log('\n🧪 Seeding Raw Materials...');
        const materialMap = {};
        for (const rm of rawMaterials) {
            const exists = await RawMaterial.findOne({ name: rm.name });
            if (exists) {
                console.log(`   ⏭  ${rm.name} already exists`);
                materialMap[rm.name] = exists._id;
                continue;
            }
            const created = await RawMaterial.create(rm);
            console.log(`   ✅ ${rm.name} — ${rm.currentStock} ${rm.unit}`);
            materialMap[rm.name] = created._id;
        }

        // ---------- SEED PRODUCTS ----------
        console.log('\n💊 Seeding Products...');
        const productMap = {};
        for (const pt of productTemplates) {
            const exists = await Product.findOne({ sku: pt.sku });
            if (exists) {
                console.log(`   ⏭  ${pt.name} already exists`);
                productMap[pt.sku] = exists._id;
                continue;
            }
            const formula = pt.formulaKeys.map(f => ({
                materialId: materialMap[f.materialName],
                quantityRequired: f.quantityRequired
            }));
            const created = await Product.create({
                name: pt.name,
                type: pt.type,
                pricePerUnit: pt.pricePerUnit,
                sku: pt.sku,
                description: pt.description,
                formula
            });
            console.log(`   ✅ ${pt.name} (${pt.type}) — ₹${pt.pricePerUnit}/unit`);
            productMap[pt.sku] = created._id;
        }

        // ---------- SEED BATCHES ----------
        console.log('\n🏭 Seeding Batches...');
        const batches = [
            { batchId: 'PC-2026-001', sku: 'PC-TAB-500', quantityProduced: 10000, mfgDate: '2026-01-15', expDate: '2028-01-15', status: 'Released' },
            { batchId: 'PC-2026-002', sku: 'PC-TAB-500', quantityProduced: 5000, mfgDate: '2026-02-01', expDate: '2028-02-01', status: 'Quality Check' },
            { batchId: 'IR-2026-001', sku: 'IR-TAB-400', quantityProduced: 8000, mfgDate: '2026-01-20', expDate: '2028-01-20', status: 'Released' },
            { batchId: 'AS-2026-001', sku: 'AS-TAB-250', quantityProduced: 6000, mfgDate: '2026-02-05', expDate: '2027-08-05', status: 'Released' },
            { batchId: 'AF-2026-001', sku: 'AF-TAB-010', quantityProduced: 15000, mfgDate: '2026-01-10', expDate: '2028-07-10', status: 'Shipped' },
            { batchId: 'GE-2026-001', sku: 'GE-TAB-020', quantityProduced: 4000, mfgDate: '2026-02-10', expDate: '2027-08-10', status: 'In Production' },
            { batchId: 'PS-2026-001', sku: 'PC-SYR-120', quantityProduced: 2000, mfgDate: '2026-01-25', expDate: '2027-01-25', status: 'Released' },
            { batchId: 'SS-2026-001', sku: 'SS-INJ-500', quantityProduced: 3000, mfgDate: '2026-02-12', expDate: '2028-02-12', status: 'Quality Check' },
        ];

        const batchMap = {};
        for (const b of batches) {
            const exists = await Batch.findOne({ batchId: b.batchId });
            if (exists) {
                console.log(`   ⏭  ${b.batchId} already exists`);
                batchMap[b.batchId] = exists._id;
                continue;
            }
            const created = await Batch.create({
                batchId: b.batchId,
                productId: productMap[b.sku],
                quantityProduced: b.quantityProduced,
                mfgDate: new Date(b.mfgDate),
                expDate: new Date(b.expDate),
                status: b.status,
                qrCodeData: JSON.stringify({ batchId: b.batchId, product: b.sku, mfg: b.mfgDate, exp: b.expDate })
            });
            console.log(`   ✅ ${b.batchId} — ${b.quantityProduced} units (${b.status})`);
            batchMap[b.batchId] = created._id;
        }

        // ---------- SEED ORDERS ----------
        console.log('\n📦 Seeding Orders...');
        const orders = [
            {
                items: [
                    { sku: 'PC-TAB-500', quantity: 500, batchId: 'PC-2026-001' },
                    { sku: 'IR-TAB-400', quantity: 300, batchId: 'IR-2026-001' }
                ],
                totalAmount: 500 * 2.50 + 300 * 3.00,
                status: 'Delivered'
            },
            {
                items: [
                    { sku: 'AS-TAB-250', quantity: 200, batchId: 'AS-2026-001' },
                    { sku: 'AF-TAB-010', quantity: 1000, batchId: 'AF-2026-001' }
                ],
                totalAmount: 200 * 5.00 + 1000 * 1.80,
                status: 'Shipped'
            },
            {
                items: [
                    { sku: 'GE-TAB-020', quantity: 150 },
                    { sku: 'PC-SYR-120', quantity: 100 }
                ],
                totalAmount: 150 * 4.50 + 100 * 45.00,
                status: 'Approved'
            },
            {
                items: [
                    { sku: 'SS-INJ-500', quantity: 50 },
                    { sku: 'PC-TAB-500', quantity: 2000 }
                ],
                totalAmount: 50 * 25.00 + 2000 * 2.50,
                status: 'Pending'
            }
        ];

        const existingOrders = await Order.countDocuments();
        if (existingOrders > 0) {
            console.log(`   ⏭  ${existingOrders} orders already exist, skipping`);
        } else {
            for (let i = 0; i < orders.length; i++) {
                const o = orders[i];
                const items = o.items.map(item => ({
                    productId: productMap[item.sku],
                    quantity: item.quantity,
                    batchId: item.batchId || undefined
                }));
                await Order.create({
                    distributorId,
                    items,
                    totalAmount: o.totalAmount,
                    status: o.status,
                    orderDate: new Date(Date.now() - (orders.length - i) * 3 * 24 * 60 * 60 * 1000) // stagger dates
                });
                console.log(`   ✅ Order #${i + 1} — ₹${o.totalAmount.toFixed(2)} (${o.status})`);
            }
        }

        console.log('\n🎉 Seeding complete! Your database is ready.\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err.message);
        process.exit(1);
    }
}

seed();
