import sqlFormattedDate from "./utils/dates/SQLFormattedDate";

export interface ParentProfile {
    id: number;
    name: string;
    child: string;
}
  
export interface PaymentMethod {
  objectId: number;
  versionId: number;
  parentId: number;
  method: string;
  isActive: boolean;
  createdAt: string;
  createdBy: number;
  deletedAt?: string | null;
}
  
export  interface Invoice {
    id: number;
    parentId: number;
    amount: number;
    date: string;
}

export class ParentProfileBackend {
    private readonly allParentProfiles: ParentProfile[];
    private readonly allInvoices: Invoice[];
    private readonly allPaymentMethods: PaymentMethod[];

    constructor(parentProfiles: ParentProfile[], invoices: Invoice[], paymentMethods: PaymentMethod[]) {
        this.allParentProfiles = parentProfiles;
        this.allInvoices = invoices;
        this.allPaymentMethods = paymentMethods;
    }

    parentProfile(parentId: number) {
        return this.allParentProfiles.find(parentProfile => parentProfile.id === parentId) ?? null;
    }

    createParentProfile(parent: string, child: string) {
        return new ParentProfileBackend([...this.allParentProfiles, { id: this.allParentProfiles.length + 1, name: parent, child }], this.allInvoices, this.allPaymentMethods);
    }

    invoices(parentId: number) { 
        return this.allInvoices.filter(invoice => invoice.parentId === parentId);
    }

    createInvoice(parentId: number, amount: number, date: string) {
        return new ParentProfileBackend(this.allParentProfiles, [...this.allInvoices, { id: this.allInvoices.length + 1, parentId, amount, date }], this.allPaymentMethods);
    }

    paymentMethods(parentId: number) {
        return this.allPaymentMethods.filter(paymentMethod => paymentMethod.parentId === parentId);
    }

    paymentMethod(paymentMethodId: number) {
        return this.allPaymentMethods.find(paymentMethod => paymentMethod.objectId === paymentMethodId);
    }

    createPaymentMethod(
        parentId: number,
        method: string,
        isActive: boolean,
        createdAt: string,
        versionId: number
      ) {
        const paymentMethod: PaymentMethod = {
          objectId: this.allPaymentMethods.length + 1,
          versionId,
          parentId,
          method,
          isActive,
          createdAt,
          createdBy: parentId,
          deletedAt: null,
        };
      
        return new ParentProfileBackend(
          this.allParentProfiles,
          this.allInvoices,
          [...this.allPaymentMethods, paymentMethod]
        );
      }

      deletePaymentMethod(parentId: number, paymentMethodId: number) {
        return new ParentProfileBackend(
          this.allParentProfiles,
          this.allInvoices,
          this.allPaymentMethods.map((paymentMethod) => {
            if (
              paymentMethod.parentId === parentId &&
              paymentMethod.objectId === paymentMethodId
            ) {
              return {
                ...paymentMethod,
                deletedAt: sqlFormattedDate(new Date()), 
              };
            }
            return paymentMethod;
          })
        );
      }
      

    setActivePaymentMethod(parentId: number, paymentMethodId: number, versionId: number) {
        return new ParentProfileBackend(this.allParentProfiles, this.allInvoices, this.allPaymentMethods.map(paymentMethod => ({...paymentMethod, isActive: (paymentMethod.parentId === parentId && paymentMethod.objectId === paymentMethodId), versionId: versionId }) ));
    }
}
