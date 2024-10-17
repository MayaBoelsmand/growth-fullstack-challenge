import { ParentProfileBackend } from "../parentProfileBackend";
import sqlFormattedDate from "../utils/dates/SQLFormattedDate";

describe("Parent profile backend", () => {
  const parentProfileBackend = new ParentProfileBackend([], [], [])

  describe("Parent profile", () => {
    it("When no parent profile exists yet, there should be none", () => {
      expect(parentProfileBackend.parentProfile(1)).toBe(null);
    });

    it("When the first parent is created, it should be there with the id of 1, because the id's are incremented every time a parent is created", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .parentProfile(1))
      .toEqual({ id: 1, name: "Alice", child: "Bob" })
    });

    it("When a parent is created, and there is a parent already, the new one should have an id of 2", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .createParentProfile("Charlie", "David")
        .parentProfile(2))
      .toEqual({ id: 2, name: "Charlie", child: "David" })
    });
  });

  describe("Invoices", () => {
    it("When no invoices are created yet, there should be none", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .invoices(1)).toEqual([])
    });

    it("When the first invoice is created, it should be there with the id of 1, because the id's are incremented every time an invoice is created", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .createInvoice(1, 100.0, "2021-10-01")
        .invoices(1))
      .toContainEqual({ id: 1, parentId: 1, amount: 100.0, date: "2021-10-01" })
    });

    it("When an invoices is created, and there is an invoice already, the new one should have an id of 2", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .createInvoice(1, 100.0, "2021-10-01")
        .createInvoice(1, 200.0, "2021-11-01")
        .invoices(1))
      .toContainEqual({ id: 2, parentId: 1, amount: 200.0, date: "2021-11-01" })
    });
  });

  describe("Payment methods", () => {
    it("When no payment methods are created yet, there should be none", () => {
      expect(parentProfileBackend.paymentMethods(1)).toEqual([])
    });

    it("When the first payment method is created, it should be there with the objectId of 1, because the objectIds are incremented every time a payment method is created", () => {
      const createdAt =  sqlFormattedDate(new Date());
      const versionId = Math.floor(Math.random() * 1000000000);
  
      expect(
        parentProfileBackend
          .createParentProfile("Alice", "Bob")
          .createPaymentMethod(1, "Credit Card", true, createdAt, versionId)
          .paymentMethods(1)
      ).toContainEqual({
        objectId: 1,
        parentId: 1,
        method: "Credit Card",
        isActive: true,
        createdAt: createdAt,
        versionId: versionId,
        createdBy: 1,
        deletedAt: null,
      });
    });


    it("When a payment method is created, and there is already one, the new one should have an objectId of 2", () => {
      const createdAt = sqlFormattedDate(new Date());
      const versionIdOne = Math.floor(Math.random() * 1000000000);
      const versionIdTwo = Math.floor(Math.random() * 1000000000);
  
      expect(
        parentProfileBackend
          .createParentProfile("Alice", "Bob")
          .createPaymentMethod(1, "Credit Card", false, createdAt, versionIdOne)
          .createPaymentMethod(1, "Debit Card", true, createdAt, versionIdTwo)
          .paymentMethods(1)
      ).toContainEqual({
        objectId: 2,
        parentId: 1,
        method: "Debit Card",
        isActive: true,
        createdAt: createdAt,
        versionId: versionIdTwo,
        createdBy: 1,
        deletedAt: null,
      });
    });

    it("When a payment method is deleted, it should be archived (soft deleted), not permanently removed", () => {
      const createdAt = sqlFormattedDate(new Date());
      const versionId = Math.floor(Math.random() * 1000000000);
  
      expect(
        parentProfileBackend
          .createParentProfile("Alice", "Bob")
          .createPaymentMethod(1, "Credit Card", true, createdAt, versionId)
          .deletePaymentMethod(1, 1)
          .paymentMethods(1)
      ).toContainEqual({
        objectId: 1,
        parentId: 1,
        method: "Credit Card",
        isActive: true,
        createdAt: createdAt,
        versionId: versionId,
        createdBy: 1,
        deletedAt: createdAt, 
      });
    });

    it("When setting a payment method active, it should deactivate the current active one and activate the new one", () => {
      const createdAt = sqlFormattedDate(new Date());
      const versionIdOne = Math.floor(Math.random() * 1000000000);
      const versionIdTwo = Math.floor(Math.random() * 1000000000);
      const versionIdThree = Math.floor(Math.random() * 1000000000);
      expect(
        parentProfileBackend
          .createParentProfile("Alice", "Bob")
          .createPaymentMethod(1, "Credit Card", false, createdAt, versionIdOne) 
          .createPaymentMethod(1, "Debit Card", true, createdAt, versionIdTwo)   
          .setActivePaymentMethod(1, 1, versionIdThree)  
          .paymentMethods(1)
      ).toContainEqual({
        objectId: 1,
        parentId: 1,
        method: "Credit Card",
        isActive: true, 
        createdAt: createdAt,
        versionId: versionIdThree, 
        createdBy: 1,
        deletedAt: null,
      });
    });

    it("When a payment method is added, we should be able to get it by objectId, so what we can show the newly added payment method", () => {
      const createdAt =  sqlFormattedDate(new Date());
      const versionId = Math.floor(Math.random() * 1000000000);
  
      expect(
        parentProfileBackend
          .createParentProfile("Alice", "Bob")
          .createParentProfile("Charlie", "David")
          .createPaymentMethod(2, "Credit Card", true, createdAt, versionId)
          .paymentMethod(1)
      ).toEqual({
        objectId: 1,
        parentId: 2,
        method: "Credit Card",
        isActive: true,
        createdAt: createdAt,
        versionId: versionId,
        createdBy: 2,
        deletedAt: null,
      });
    });
  });
});