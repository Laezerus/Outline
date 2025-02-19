import { Op } from "sequelize";
import Logger from "@server/logging/logger";
import mailer from "@server/mailer";
import {
  View,
  Document,
  Team,
  Collection,
  User,
  NotificationSetting,
} from "@server/models";
import {
  DocumentEvent,
  CollectionEvent,
  RevisionEvent,
  Event,
} from "@server/types";

export default class NotificationsProcessor {
  async on(event: Event) {
    switch (event.name) {
      case "documents.publish":
      case "revisions.create":
        return this.documentUpdated(event);

      case "collections.create":
        return this.collectionCreated(event);

      default:
    }
  }

  async documentUpdated(event: DocumentEvent | RevisionEvent) {
    // never send notifications when batch importing documents
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type 'DocumentEv... Remove this comment to see the full error message
    if (event.data?.source === "import") {
      return;
    }
    const [document, team] = await Promise.all([
      Document.findByPk(event.documentId),
      Team.findByPk(event.teamId),
    ]);
    if (!document || !team || !document.collection) {
      return;
    }
    const { collection } = document;
    const notificationSettings = await NotificationSetting.findAll({
      where: {
        userId: {
          [Op.ne]: document.lastModifiedById,
        },
        teamId: document.teamId,
        event:
          event.name === "documents.publish"
            ? "documents.publish"
            : "documents.update",
      },
      include: [
        {
          model: User,
          required: true,
          as: "user",
        },
      ],
    });
    const eventName =
      event.name === "documents.publish" ? "published" : "updated";

    for (const setting of notificationSettings) {
      // Suppress notifications for suspended users
      if (setting.user.isSuspended) {
        continue;
      }

      // For document updates we only want to send notifications if
      // the document has been edited by the user with this notification setting
      // This could be replaced with ability to "follow" in the future
      if (
        eventName === "updated" &&
        !document.collaboratorIds.includes(setting.userId)
      ) {
        continue;
      }

      // Check the user has access to the collection this document is in. Just
      // because they were a collaborator once doesn't mean they still are.
      const collectionIds = await setting.user.collectionIds();

      if (!collectionIds.includes(document.collectionId)) {
        continue;
      }

      // If this user has viewed the document since the last update was made
      // then we can avoid sending them a useless notification, yay.
      const view = await View.findOne({
        where: {
          userId: setting.userId,
          documentId: event.documentId,
          updatedAt: {
            [Op.gt]: document.updatedAt,
          },
        },
      });

      if (view) {
        Logger.info(
          "processor",
          `suppressing notification to ${setting.userId} because update viewed`
        );
        continue;
      }

      if (!setting.user.email) {
        continue;
      }

      mailer.documentNotification({
        to: setting.user.email,
        eventName,
        document,
        team,
        collection,
        actor: document.updatedBy,
        unsubscribeUrl: setting.unsubscribeUrl,
      });
    }
  }

  async collectionCreated(event: CollectionEvent) {
    const collection = await Collection.findByPk(event.collectionId, {
      include: [
        {
          model: User,
          required: true,
          as: "user",
        },
      ],
    });
    if (!collection) {
      return;
    }
    if (!collection.permission) {
      return;
    }
    const notificationSettings = await NotificationSetting.findAll({
      where: {
        userId: {
          [Op.ne]: collection.createdById,
        },
        teamId: collection.teamId,
        event: event.name,
      },
      include: [
        {
          model: User,
          required: true,
          as: "user",
        },
      ],
    });

    for (const setting of notificationSettings) {
      // Suppress notifications for suspended users
      if (setting.user.isSuspended || !setting.user.email) {
        continue;
      }

      mailer.collectionNotification({
        to: setting.user.email,
        eventName: "created",
        collection,
        actor: collection.user,
        unsubscribeUrl: setting.unsubscribeUrl,
      });
    }
  }
}
