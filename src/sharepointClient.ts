import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import dotenv from 'dotenv';
dotenv.config();

const tenantId = process.env.SHAREPOINT_TENANT_ID || "";
const clientId = process.env.SHAREPOINT_CLIENT_ID || "";
const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET || "";
const siteId = process.env.SHAREPOINT_SITE_ID || "";
const listId = process.env.SHAREPOINT_LIST_ID || "";

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

const graphClient = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
      const token = await credential.getToken("https://graph.microsoft.com/.default");
      return token?.token || "";
    }
  }
});

export async function getHabits() {
  try {
    const result = await graphClient
      .api(`/sites/${siteId}/lists/${listId}/items?expand=fields`)
      .get();
    return result.value.map((item: any) => ({
      ...item.fields,
      id: item.id
    }));
  } catch (error: any) {
    console.error('Error fetching habits:', error);
    throw new Error(`Failed to fetch habits: ${error.message}`);
  }
}

export async function createHabit(name: string, completedDate?: string) {
  const item = {
    fields: {
      Title: name,
      Name: name,
      ...(completedDate && { CompletedDates: completedDate })
    }
  };
  const result = await graphClient
    .api(`/sites/${siteId}/lists/${listId}/items`)
    .post(item);
  return result;
}

export async function updateHabit(itemId: string, name?: string, completedDate?: string) {
  try {
    if (!itemId) {
      throw new Error('Item ID is required for updating a habit');
    }
    try {
      const listDefinition = await graphClient
        .api(`/sites/${siteId}/lists/${listId}/columns`)
        .get();
      const existingItem = await graphClient
        .api(`/sites/${siteId}/lists/${listId}/items/${itemId}?expand=fields`)
        .get();
      const fields: any = {};
      if (name) {
        fields.Title = name;
        if (existingItem.fields.hasOwnProperty('Name')) {
          fields.Name = name;
        }
      }
      if (completedDate !== undefined) {
        if (existingItem.fields.hasOwnProperty('CompletedDates')) {
          fields.CompletedDates = completedDate;
        }
      }
      if (Object.keys(fields).length === 0) {
        return existingItem;
      }
      const item = { fields };
      const result = await graphClient
        .api(`/sites/${siteId}/lists/${listId}/items/${itemId}`)
        .patch(item);
      return result;
    } catch (error: any) {
      console.error(`Error with item ID ${itemId}:`, error);
      if (error.statusCode === 404) {
        throw new Error(`Item with ID ${itemId} not found`);
      }
      try {
        const simpleItem = {
          fields: {
            Title: name || 'Updated Habit'
          }
        };
        const result = await graphClient
          .api(`/sites/${siteId}/lists/${listId}/items/${itemId}`)
          .patch(simpleItem);
        return result;
      } catch (altError: any) {
        console.error('Alternative update also failed:', altError);
        throw altError;
      }
    }
  } catch (error: any) {
    console.error(`Error updating habit with ID ${itemId}:`, error);
    throw new Error(`Failed to update habit: ${error.message}`);
  }
}

export async function deleteHabit(itemId: string) {
  try {
    await graphClient
      .api(`/sites/${siteId}/lists/${listId}/items/${itemId}`)
      .delete();
    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting habit with ID ${itemId}:`, error);
    if (itemId.includes('/')) {
      const simpleId = itemId.split('/').pop();
      return await deleteHabit(simpleId!);
    }
    throw new Error(`Failed to delete habit: ${error.message}`);
  }
}