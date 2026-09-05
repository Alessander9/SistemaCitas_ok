import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { DatabaseService } from '../../database/database.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let db: { query: jest.Mock; transaction: jest.Mock };

  const CLINIC_ID = 'a0000000-0000-0000-0000-000000000001';
  const USER_ID = 'f0000000-0000-0000-0000-000000000001';
  const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000001';

  const productRow = (overrides: Record<string, unknown> = {}) => ({
    id: PRODUCT_ID,
    clinic_id: CLINIC_ID,
    name: 'Alcohol Isopropílico',
    description: 'Antiséptico 70%',
    sku: 'ALC-70',
    category: 'Insumos',
    unit: 'ml',
    current_stock: 500,
    min_stock: 100,
    cost_price: '5.00',
    sell_price: '8.00',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(async () => {
    db = { query: jest.fn(), transaction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  // ===========================================================================
  // CREATE PRODUCT
  // ===========================================================================

  describe('create', () => {
    it('should throw ConflictException when SKU already exists in clinic', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 'existing' }] }); // SKU check

      await expect(
        service.create(CLINIC_ID, {
          name: 'Gel Antiséptico',
          sku: 'ALC-70',
          unit: 'ml',
          currentStock: 100,
          minStock: 20,
          costPrice: 4,
          sellPrice: 7,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a product when SKU is unique', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] }) // no existing SKU
        .mockResolvedValueOnce({ rows: [productRow()] }); // INSERT

      const result = await service.create(CLINIC_ID, {
        name: 'Alcohol Isopropílico',
        sku: 'ALC-70',
        unit: 'ml',
        currentStock: 500,
        minStock: 100,
        costPrice: 5,
        sellPrice: 8,
      });

      expect(result.name).toBe('Alcohol Isopropílico');
      expect(result.isLowStock).toBe(false); // 500 > 100
    });

    it('should create a product without SKU (SKU is optional)', async () => {
      db.query.mockResolvedValueOnce({ rows: [productRow({ sku: null })] }); // INSERT, no SKU check

      const result = await service.create(CLINIC_ID, {
        name: 'Guantes Nitrilo',
        unit: 'par',
        currentStock: 200,
        minStock: 50,
        costPrice: 0.5,
        sellPrice: 1.0,
      });

      expect(result.sku).toBeUndefined();
    });
  });

  // ===========================================================================
  // SOFT DELETE
  // ===========================================================================

  describe('softDelete', () => {
    it('should throw NotFoundException when product does not exist', async () => {
      db.query.mockResolvedValueOnce({ rowCount: 0 });

      await expect(service.softDelete(CLINIC_ID, 'nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should succeed when product exists', async () => {
      db.query.mockResolvedValueOnce({ rowCount: 1 });

      await expect(service.softDelete(CLINIC_ID, PRODUCT_ID)).resolves.toBeUndefined();
    });
  });

  // ===========================================================================
  // ADD MOVEMENT (KARDEX)
  // ===========================================================================

  describe('addMovement', () => {
    it('should throw BadRequestException when outbound exceeds current stock', async () => {
      db.query.mockResolvedValueOnce({ rows: [productRow({ current_stock: 10 })] }); // findOne

      await expect(
        service.addMovement(CLINIC_ID, { productId: PRODUCT_ID, type: 'sale', quantity: 50 }, USER_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('should increment stock for a purchase movement', async () => {
      db.query.mockResolvedValueOnce({ rows: [productRow({ current_stock: 500 })] }); // findOne

      const updatedRow = { id: 'mov-1', clinic_id: CLINIC_ID, product_id: PRODUCT_ID, type: 'purchase', quantity: 200, unit_cost: null, reference: null, notes: null, treatment_session_id: null, created_by: USER_ID, created_by_name: null, created_at: new Date().toISOString() };

      db.transaction.mockImplementation(async (cb: (client: unknown) => Promise<unknown>) => {
        const client = {
          query: jest.fn()
            .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE stock
            .mockResolvedValueOnce({ rows: [updatedRow] }), // INSERT movement
        };
        return cb(client);
      });

      const result = await service.addMovement(
        CLINIC_ID,
        { productId: PRODUCT_ID, type: 'purchase', quantity: 200 },
        USER_ID,
      );

      expect(result.type).toBe('purchase');
      expect(result.quantity).toBe(200);
    });

    it('should decrement stock for a waste movement', async () => {
      db.query.mockResolvedValueOnce({ rows: [productRow({ current_stock: 500 })] }); // findOne

      const updatedRow = { id: 'mov-2', clinic_id: CLINIC_ID, product_id: PRODUCT_ID, type: 'waste', quantity: 30, unit_cost: null, reference: null, notes: null, treatment_session_id: null, created_by: USER_ID, created_by_name: null, created_at: new Date().toISOString() };

      db.transaction.mockImplementation(async (cb: (client: unknown) => Promise<unknown>) => {
        const client = {
          query: jest.fn()
            .mockResolvedValueOnce({ rowCount: 1 })
            .mockResolvedValueOnce({ rows: [updatedRow] }),
        };
        return cb(client);
      });

      const result = await service.addMovement(
        CLINIC_ID,
        { productId: PRODUCT_ID, type: 'waste', quantity: 30 },
        USER_ID,
      );

      expect(result.type).toBe('waste');
    });
  });

  // ===========================================================================
  // LOW STOCK ALERTS
  // ===========================================================================

  describe('getLowStockAlerts', () => {
    it('should return only products with stock <= minStock', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          { id: 'p1', name: 'Algodón', current_stock: 5, min_stock: 20, unit: 'gr' },
          { id: 'p2', name: 'Guantes', current_stock: 10, min_stock: 10, unit: 'par' },
        ],
      });

      const alerts = await service.getLowStockAlerts(CLINIC_ID);

      expect(alerts).toHaveLength(2);
      expect(alerts[0].productName).toBe('Algodón');
      expect(alerts[0].currentStock).toBe(5);
    });

    it('should return empty array when all products have sufficient stock', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const alerts = await service.getLowStockAlerts(CLINIC_ID);
      expect(alerts).toEqual([]);
    });
  });

  // ===========================================================================
  // isLowStock computed field
  // ===========================================================================

  describe('findOne (isLowStock)', () => {
    it('should compute isLowStock = true when currentStock <= minStock', async () => {
      db.query.mockResolvedValueOnce({ rows: [productRow({ current_stock: 50, min_stock: 100 })] });

      const product = await service.findOne(CLINIC_ID, PRODUCT_ID);
      expect(product.isLowStock).toBe(true);
    });

    it('should compute isLowStock = false when currentStock > minStock', async () => {
      db.query.mockResolvedValueOnce({ rows: [productRow({ current_stock: 200, min_stock: 100 })] });

      const product = await service.findOne(CLINIC_ID, PRODUCT_ID);
      expect(product.isLowStock).toBe(false);
    });
  });
});
