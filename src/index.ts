import type { Core } from '@strapi/strapi';

/**
 * Guide step 3: Public role permissions for this classroom exercise.
 * Same as ticking these boxes in Settings → Users & Permissions Plugin → Roles → Public.
 * (A production store should protect write operations with authentication.)
 */
const PUBLIC_ACTIONS = [
  'api::product.product.find',
  'api::product.product.findOne',
  'api::product.product.create',
  'api::product.product.update',
  'api::product.product.delete',
  'plugin::upload.content-api.upload',
];

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    for (const action of PUBLIC_ACTIONS) {
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action, role: publicRole.id } });

      if (!existing) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action, role: publicRole.id } });
        strapi.log.info(`Granted Public permission: ${action}`);
      }
    }
  },
};
