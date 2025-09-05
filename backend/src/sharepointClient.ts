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

let credential: ClientSecretCredential | null = null;
let graphClient: Client | null = null;
let userColumnsCache: Set<string> | null = null;
let habitsColumnsCache: Set<string> | null = null;

// Guard / validation helpers
function ensureUsersListConfigured() {
  if (!usersListId) {
    throw new Error("Users list not configured: set SHAREPOINT_USERS_LIST_ID to the separate Users list ID.");
  }
  if (usersListId === listId) {
    throw new Error("Users list ID matches habits list ID. Create a separate 'Users' list and set SHAREPOINT_USERS_LIST_ID to its ID.");
  }
}

function initializeClient() {
  if (!credential) {
    if (!tenantId || !clientId || !clientSecret) {
      throw new Error('SharePoint credentials not configured. Required: SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET');
    }
    
    credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    
    graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential!.getToken("https://graph.microsoft.com/.default");
          return token?.token || "";
        }
      }
    });
  }
  return graphClient!;
}

async function ensureUserColumnsLoaded() {
  ensureUsersListConfigured();
  if (userColumnsCache) return;
  const client = initializeClient();
  try {
    const cols = await client
      .api(`/sites/${siteId}/lists/${usersListId}/columns`)
      .get();
    userColumnsCache = new Set(cols.value.map((c: any) => c.name));
  } catch (e) {
    console.warn("Warning: unable to load Users list columns – proceeding with minimal fields.", e);
    userColumnsCache = new Set(["Title"]);
  }
}

async function ensureHabitsColumnsLoaded() {
  if (habitsColumnsCache) return;
  const client = initializeClient();
  try {
    const cols = await client
      .api(`/sites/${siteId}/lists/${listId}/columns`)
      .get();
    habitsColumnsCache = new Set(cols.value.map((c: any) => c.name));
  } catch (e) {
    console.warn("Warning: unable to load Habits list columns – proceeding with minimal fields.", e);
    habitsColumnsCache = new Set(["Title"]);
  }
}

function userFieldExists(name: string) {
  if (!userColumnsCache) return false;
  return userColumnsCache.has(name);
}

function habitsFieldExists(name: string) {
  if (!habitsColumnsCache) return false;
  return habitsColumnsCache.has(name);
}

export async function getHabits(userId?: string) {
  try {
    await ensureHabitsColumnsLoaded();
    const client = initializeClient();
    let apiUrl = `/sites/${siteId}/lists/${listId}/items?expand=fields`;
    
    // Only add UserId filter if the field exists and userId is provided
    if (userId && habitsFieldExists('UserId')) {
      apiUrl += `&$filter=fields/UserId eq '${userId}'`;
    } else if (userId && !habitsFieldExists('UserId')) {
      console.log("⚠️ UserId field not found in habits list - returning all habits");
    }
    
    const result = await client
      .api(apiUrl)
      .header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly')
      .get();
      
    const habits = result.value.map((item: any) => ({
      ...item.fields,
      id: item.id
    }));
    
    // Client-side filtering if UserId field doesn't exist but userId was requested
    if (userId && !habitsFieldExists('UserId')) {
      return habits.filter((habit: any) => habit.UserId === userId || habit.userId === userId);
    }
    
    return habits;
  } catch (error: any) {
    console.error('Error fetching habits:', error);
    throw new Error(`Failed to fetch habits: ${error.message}`);
  }
}

export async function createHabit(name: string, completedDate?: string, completedDatesStr?: string, tagsStr?: string, notesStr?: string, expectedFrequency?: string, userId?: string) {
  await ensureHabitsColumnsLoaded();
  const client = initializeClient();
  
  // Build fields object with only available columns
  const fields: Record<string, string> = {};
  
  // Title is mandatory in SharePoint
  fields.Title = name || "";
  
  // Add other fields only if they exist in the list
  if (habitsFieldExists('Name')) fields.Name = name || "";
  if (habitsFieldExists('CompletedDates')) fields.CompletedDates = completedDate || completedDatesStr || "";
  if (habitsFieldExists('ExpectedFrequency')) fields.ExpectedFrequency = expectedFrequency || "";
  if (habitsFieldExists('Tags')) fields.Tags = tagsStr && tagsStr.length ? tagsStr : "";
  if (habitsFieldExists('Notes')) fields.Notes = notesStr && notesStr.length ? notesStr : "[]";
  if (habitsFieldExists('UserId') && userId) fields.UserId = userId;
  
  const item = { fields };
  const result = await client
    .api(`/sites/${siteId}/lists/${listId}/items`)
    .header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly')
    .post(item);
  return result;
}

export async function updateHabit(itemId: string, name?: string, completedDatesStr?: string, tagsStr?: string, notesStr?: string, expectedFrequency?: string) {
  try {
    await ensureHabitsColumnsLoaded();
    const client = initializeClient();
    if (!itemId) {
      throw new Error('Item ID is required for updating a habit');
    }
    const existingItem = await client
      .api(`/sites/${siteId}/lists/${listId}/items/${itemId}?expand=fields`)
      .get();
    
    // Build fields object with only available columns
    const fields: Record<string, string> = {};
    
    // Title is mandatory in SharePoint
    fields.Title = name !== undefined ? name : (existingItem.fields.Title || "");
    
    // Add other fields only if they exist in the list
    if (habitsFieldExists('Name')) {
      fields.Name = name !== undefined ? name : (existingItem.fields.Name || "");
    }
    if (habitsFieldExists('CompletedDates')) {
      fields.CompletedDates = completedDatesStr !== undefined ? completedDatesStr : (existingItem.fields.CompletedDates || "");
    }
    if (habitsFieldExists('ExpectedFrequency')) {
      fields.ExpectedFrequency = expectedFrequency !== undefined ? expectedFrequency : (existingItem.fields.ExpectedFrequency || "");
    }
    if (habitsFieldExists('Tags')) {
      fields.Tags = tagsStr !== undefined ? tagsStr : (existingItem.fields.Tags || "");
    }
    if (habitsFieldExists('Notes')) {
      fields.Notes = notesStr !== undefined ? notesStr : (existingItem.fields.Notes || "[]");
    }
    
    const item = { fields };
    const result = await client
      .api(`/sites/${siteId}/lists/${listId}/items/${itemId}`)
      .header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly')
      .patch(item);
    return result;
  } catch (error: any) {
    console.error(`Error updating habit with ID ${itemId}:`, error);
    throw new Error(`Failed to update habit: ${error.message}`);
  }
}

export async function deleteHabit(itemId: string) {
  try {
    const client = initializeClient();
    await client
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

export async function createUser(email: string, firstName: string, lastName: string, hashedPassword: string) {
  try {
  ensureUsersListConfigured();
  await ensureUserColumnsLoaded();
    const client = initializeClient();
  const fields: Record<string, string> = { Title: email };
  if (userFieldExists('Email')) fields.Email = email;
  if (userFieldExists('FirstName')) fields.FirstName = firstName;
  if (userFieldExists('LastName')) fields.LastName = lastName;
  if (userFieldExists('HashedPassword')) fields.HashedPassword = hashedPassword;
  if (userFieldExists('CreatedDate')) fields.CreatedDate = new Date().toISOString();
  const item = { fields };
    
    const result = await client
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
    ensureUsersListConfigured();
    await ensureUserColumnsLoaded();
    const client = initializeClient();
    let result;
    if (userFieldExists('Email')) {
      try {
        result = await client
          .api(`/sites/${siteId}/lists/${usersListId}/items?expand=fields&$filter=fields/Email eq '${email}'`)
          .header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly')
          .get();
      } catch (emailFilterError) {
        console.warn('Email field filter failed, falling back to Title search:', emailFilterError);
        result = await client
          .api(`/sites/${siteId}/lists/${usersListId}/items?expand=fields&$top=50`)
          .get();
        result.value = result.value.filter((v: any) => (v.fields.Title || '').toLowerCase() === email.toLowerCase());
      }
    } else {
      result = await client
        .api(`/sites/${siteId}/lists/${usersListId}/items?expand=fields&$top=50`)
        .get();
      result.value = result.value.filter((v: any) => (v.fields.Title || '').toLowerCase() === email.toLowerCase());
    }

    if (result.value && result.value.length > 0) {
      const user = result.value[0];
      return {
        id: user.id,
        email: user.fields.Email || user.fields.Title,
        firstName: user.fields.FirstName || '',
        lastName: user.fields.LastName || '',
        hashedPassword: user.fields.HashedPassword || ''
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
    ensureUsersListConfigured();
    await ensureUserColumnsLoaded();
    const client = initializeClient();
    const result = await client
      .api(`/sites/${siteId}/lists/${usersListId}/items/${userId}?expand=fields`)
      .get();
    
    return {
      id: result.id,
      email: result.fields.Email || result.fields.Title,
      firstName: result.fields.FirstName || '',
      lastName: result.fields.LastName || ''
    };
  } catch (error: any) {
    console.error('Error getting user by ID:', error);
    throw new Error(`Failed to get user: ${error.message}`);
  }
}