import { GraphQLLong } from "graphql-scalars";
import { ProfileRepository } from "../repository/profileRepository";
import { ParentProfileBackend, PaymentMethod } from "../parentProfileBackend";
import sqlFormattedDate from "../utils/dates/SQLFormattedDate";

const profileRepository = new ProfileRepository();

export const resolvers = {
  Long: GraphQLLong,
  Query: {
    parentProfile: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend(
        await profileRepository.retrieveParentProfiles(parentId),
        [],
        []
      ).parentProfile(parentId);
    },
    paymentMethods: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend(
        [],
        [],
        await profileRepository.retrieveCurrentPaymentMethods(parentId)
      ).paymentMethods(parentId);
    },
    invoices: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend(
        [],
        await profileRepository.retrieveInvoices(parentId),
        []
      ).invoices(parentId);
    },
  },
  Mutation: {
    addPaymentMethod: async (
      _: any,
      { parentId, method }: { parentId: number; method: string }
    ) => {
      const createdAt = sqlFormattedDate(new Date());

      const paymentMethodInput: PaymentMethod = {
        objectId: 0,
        versionId: generateNewVersionId(),
        parentId,
        method,
        isActive: false,
        createdAt: createdAt,
        createdBy: parentId,
        deletedAt: null,
      };

      const paymentMethod = await profileRepository.insertPaymentMethodVersion(
        paymentMethodInput
      );

      
      return new ParentProfileBackend([], [], [paymentMethod]).paymentMethod(
        paymentMethod.objectId
      );
    },
    setActivePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number }
    ) => {
      const currentPaymentMethods =
        await profileRepository.retrieveCurrentPaymentMethods(parentId);

      const currentActiveMethod = currentPaymentMethods.find(
        (method) => method.isActive
      );

      if (currentActiveMethod) {
        await insertUpdatedVersion(currentActiveMethod, false, false);
      }

      const targetMethod = currentPaymentMethods.find(
        (method) => method.objectId === methodId
      );

      if (!targetMethod) {
        throw new Error("Target payment method not found.");
      }

      await insertUpdatedVersion(targetMethod, false, true);

      return targetMethod;
    },
    deletePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number }
    ) => {
      const currentMethods =
        await profileRepository.retrieveCurrentPaymentMethods(parentId);

      const targetMethod = currentMethods.find(
        (method) => method.objectId === methodId
      );

      if (!targetMethod) {
        throw new Error("Payment method not found.");
      }

      await insertUpdatedVersion(targetMethod, true);

      return true;
    },
  },
};

// MARK: - Helper functions
async function insertUpdatedVersion(
  paymentMethod: PaymentMethod,
  shouldBeDeleted: boolean,
  isActive?: boolean
) {
  const now = sqlFormattedDate(new Date());

  const updatedPaymentMethod: PaymentMethod = {
    ...paymentMethod,
    versionId: generateNewVersionId(),
    isActive: isActive ?? paymentMethod.isActive,
    createdAt: now,
    deletedAt: shouldBeDeleted ? now : null,
  };

  await profileRepository.insertPaymentMethodVersion(updatedPaymentMethod);
}

function generateNewVersionId() {
  return Math.floor(Math.random() * 1000000000);
}
