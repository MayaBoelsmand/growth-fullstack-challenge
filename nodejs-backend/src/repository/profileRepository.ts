import { db, query } from "../db/database";
import mysql from "mysql2/promise";
import { Invoice, ParentProfile, PaymentMethod } from "../parentProfileBackend";

export class ProfileRepository {
  async insertPaymentMethodVersion(
    paymentMethod: PaymentMethod
  ): Promise<PaymentMethod> {
    const sql = `
    INSERT INTO payment_methods (object_id, parent_id, method, is_active, created_at, version_id, audit_status, created_by, deleted_at)
    VALUES (?, ?, ?, ?, ?, ?, "current", ?, ?)
  `;

    const [result] = await db.execute<mysql.ResultSetHeader>(sql, [
      paymentMethod.objectId,
      paymentMethod.parentId,
      paymentMethod.method,
      paymentMethod.isActive,
      paymentMethod.createdAt,
      paymentMethod.versionId,
      paymentMethod.createdBy,
      paymentMethod.deletedAt
    ]);

    const insertId = result.insertId;
    return { ...paymentMethod, objectId: insertId };
  }

  async archivePaymentMethodVersion(objectId: number): Promise<void> {
    const archiveSql = `
      UPDATE payment_methods
      SET audit_status = 'archived'
      WHERE object_id = ? AND audit_status = 'current';
    `;
    await db.execute<mysql.ResultSetHeader>(archiveSql, [objectId]);
  }

  async retrieveCurrentPaymentMethods(
    parentId: number
  ): Promise<PaymentMethod[]> {
    var options = { year: "numeric", month: "long", day: "numeric" };

    const sql = `
    SELECT * FROM payment_methods 
    WHERE parent_id = ? AND audit_status = 'current' AND deleted_at IS NULL
  `;
    const results = await query(sql, [parentId]);
    return results.map((r) => ({
      objectId: r.object_id,
      versionId: r.version_id,
      parentId: r.parent_id,
      method: r.method,
      isActive: r.is_active,
      createdAt: r.created_at.toLocaleString("en-US", options),
      createdBy: r.created_by,
      auditStatus: r.audit_status,
      deletedAt: r.deleted_at,
    }));
  }

  async retrieveInvoices(parentId: number): Promise<Invoice[]> {
    const sql = "SELECT * FROM invoices WHERE parent_id = ?";
    const results = await query(sql, [parentId]);
    return results.map((r) => ({
      id: r.id,
      parentId: r.parent_id,
      amount: r.amount,
      date: r.date.toLocaleString(),
    }));
  }

  async retrieveParentProfiles(parentId: number): Promise<ParentProfile[]> {
    const sql = "SELECT * FROM parents WHERE id = ?";
    const results = await query(sql, [parentId]);
    return results.map((r) => ({
      id: r.id,
      name: r.name,
      child: r.child,
    }));
  }
}
