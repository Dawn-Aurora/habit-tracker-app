import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import * as dotenv from 'dotenv';
dotenv.config();

const tenantId = process.env.SHAREPOINT_TENANT_ID || "";
const clientId = process.env.SHAREPOINT_CLIENT_ID || "";
const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET || "";
const siteId = process.env.SHAREPOINT_SITE_ID || "";
const listId = process.env.SHAREPOINT_LIST_ID || "";
const usersListId = process.env.SHAREPOINT_USERS_LIST_ID || "";

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

const graphClient = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
      const token = await credential.getToken("https://graph.microsoft.com/.default");
      return token?.token || "";
    }
  }
});

export async function getHabits(userId?: string) {
  try {
    let apiUrl = `/sites/${siteId}/lists/${listId}/items?expand=fields`;
    
    // Filter by user if userId is provided
    if (userId) {
      apiUrl += `&$filter=fields/UserId eq '${userId}'`;
    }
    
    const result = await graphClient
      .api(apiUrl)
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

export async function createHabit(name: string, completedDate?: string, completedDatesStr?: string, tagsStr?: string, notesStr?: string, expectedFrequency?: string, userId?: string) {
  const item = {
    fields: {
      Title: name || "",
      Name: name || "",
      CompletedDates: completedDate || "",
      ExpectedFrequency: expectedFrequency || "",
      Tags: tagsStr && tagsStr.length ? tagsStr : "",
      Notes: notesStr && notesStr.length ? notesStr : "[]",
      UserId: userId || ""
    }
  };
  const result = await graphClient
    .api(`/sites/${siteId}/lists/${listId}/items`)
    .post(item);
  return result;
}

export async function updateHabit(itemId: string, name?: string, completedDatesStr?: string, tagsStr?: string, notesStr?: string, expectedFrequency?: string) {
  try {
    if (!itemId) {
      throw new Error('Item ID is required for updating a habit');
    }
    const existingItem = await graphClient
      .api(`/sites/${siteId}/lists/${listId}/items/${itemId}?expand=fields`)
      .get();
    const fields: any = {};
    fields.Title = name !== undefined ? name : (existingItem.fields.Title || "");
    fields.Name = name !== undefined ? name : (existingItem.fields.Name || "");
    fields.CompletedDates = completedDatesStr !== undefined ? completedDatesStr : (existingItem.fields.CompletedDates || "");
    fields.ExpectedFrequency = expectedFrequency !== undefined ? expectedFrequency : (existingItem.fields.ExpectedFrequency || "");
    fields.Tags = tagsStr !== undefined ? tagsStr : (existingItem.fields.Tags || "");
    fields.Notes = notesStr !== undefined ? notesStr : (existingItem.fields.Notes || "[]");
    const item = { fields };
    // Debug: Log what is being sent to SharePoint
    console.log('Updating SharePoint item:', JSON.stringify({ itemId, fields }, null, 2));
    const result = await graphClient
      .api(`/sites/${siteId}/lists/${listId}/items/${itemId}`)
      .patch(item);
    return result;
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

// User Management Functions for SharePoint
export async function createUser(email: string, firstName: string, lastName: string, hashedPassword: string) {
  try {
    const item = {
      fields: {
        Title: email,
        Email: email,
        FirstName: firstName,
        LastName: lastName,
        HashedPassword: hashedPassword,
        CreatedDate: new Date().toISOString()
      }
    };
    
    const result = await graphClient
      .api(`/sites/${siteId}/lists/${usersListId}/items`)
      .post(item);
    
    return {
      id: result.id,
      email: email,
      firstName: firstName,
      lastName: lastName
    };
  } catch (error: any) {
    console.error('Error creating user in SharePoint:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await graphClient
      .api(`/sites/${siteId}/lists/${usersListId}/items?expand=fields&$filter=fields/Email eq '${email}'`)
      .get();
    
    if (result.value && result.value.length > 0) {
      const user = result.value[0];
      return {
        id: user.id,
        email: user.fields.Email,
        firstName: user.fields.FirstName,
        lastName: user.fields.LastName,
        hashedPassword: user.fields.HashedPassword
      };
    }
    
    return null;
  } catch (error: any) {
    console.error('Error getting user by email:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  }
}

export async function getUserById(userId: string) {
  try {
    const result = await graphClient
      .api(`/sites/${siteId}/lists/${usersListId}/items/${userId}?expand=fields`)
      .get();
    
    return {
      id: result.id,
      email: result.fields.Email,
      firstName: result.fields.FirstName,
      lastName: result.fields.LastName
    };
  } catch (error: any) {
    console.error('Error getting user by ID:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  }
}