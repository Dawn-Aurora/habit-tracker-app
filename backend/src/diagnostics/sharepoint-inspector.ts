import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const tenantId = process.env.SHAREPOINT_TENANT_ID || "";
const clientId = process.env.SHAREPOINT_CLIENT_ID || "";
const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET || "";
const siteId = process.env.SHAREPOINT_SITE_ID || "";
const listId = process.env.SHAREPOINT_LIST_ID || "";
const usersListId = process.env.SHAREPOINT_USERS_LIST_ID || "";

async function initializeGraphClient() {
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('SharePoint credentials not configured');
  }
  
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  
  const graphClient = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken("https://graph.microsoft.com/.default");
        return token?.token || "";
      }
    }
  });
  
  return graphClient;
}

async function inspectSharePointLists() {
  try {
    console.log("🔍 Starting SharePoint List Inspection...\n");
    console.log("📋 Configuration:");
    console.log(`Site ID: ${siteId}`);
    console.log(`Habits List ID: ${listId}`);
    console.log(`Users List ID: ${usersListId}`);
    console.log(`Same List?: ${listId === usersListId ? "YES" : "NO"}\n`);

    const client = await initializeGraphClient();

    // 1. Get all lists in the site
    console.log("📂 All Lists in Site:");
    console.log("=".repeat(50));
    try {
      const allLists = await client.api(`/sites/${siteId}/lists`).get();
      allLists.value.forEach((list: any) => {
        console.log(`📝 ${list.displayName} (ID: ${list.id})`);
        console.log(`   Template: ${list.list?.template || 'N/A'}`);
        console.log(`   Description: ${list.description || 'No description'}\n`);
      });
    } catch (error) {
      console.error("❌ Error getting lists:", error);
    }

    // 2. Inspect the main list (habits/users combined or habits only)
    console.log("\n📊 Main List Structure (ID: " + listId + "):");
    console.log("=".repeat(50));
    try {
      // Get list metadata
      const listInfo = await client.api(`/sites/${siteId}/lists/${listId}`).get();
      console.log(`📝 List Name: ${listInfo.displayName}`);
      console.log(`📝 List Description: ${listInfo.description || 'No description'}`);
      console.log(`📝 Template Type: ${listInfo.list?.template || 'N/A'}\n`);

      // Get list columns/fields
      const columns = await client.api(`/sites/${siteId}/lists/${listId}/columns`).get();
      console.log("📋 Available Columns:");
      columns.value.forEach((column: any) => {
        console.log(`   🔸 ${column.displayName} (Internal: ${column.name})`);
        console.log(`      Type: ${column.columnGroup || column.type || 'Unknown'}`);
        console.log(`      Required: ${column.required || false}`);
        console.log(`      Hidden: ${column.hidden || false}\n`);
      });

      // Get a few sample items to see the data structure
      console.log("📋 Sample Items (first 3):");
      const items = await client.api(`/sites/${siteId}/lists/${listId}/items?expand=fields&$top=3`).get();
      items.value.forEach((item: any, index: number) => {
        console.log(`   📄 Item ${index + 1} (ID: ${item.id}):`);
        console.log(`      Fields:`, JSON.stringify(item.fields, null, 6));
        console.log("");
      });

    } catch (error) {
      console.error("❌ Error inspecting main list:", error);
    }

    // 3. If users list is different, inspect it separately
    if (listId !== usersListId) {
      console.log("\n👥 Users List Structure (ID: " + usersListId + "):");
      console.log("=".repeat(50));
      try {
        // Get list metadata
        const userListInfo = await client.api(`/sites/${siteId}/lists/${usersListId}`).get();
        console.log(`📝 List Name: ${userListInfo.displayName}`);
        console.log(`📝 List Description: ${userListInfo.description || 'No description'}`);

        // Get list columns/fields
        const userColumns = await client.api(`/sites/${siteId}/lists/${usersListId}/columns`).get();
        console.log("📋 Available Columns:");
        userColumns.value.forEach((column: any) => {
          console.log(`   🔸 ${column.displayName} (Internal: ${column.name})`);
          console.log(`      Type: ${column.columnGroup || column.type || 'Unknown'}`);
          console.log(`      Required: ${column.required || false}`);
          console.log(`      Hidden: ${column.hidden || false}\n`);
        });

        // Get sample user items
        console.log("📋 Sample User Items (first 3):");
        const userItems = await client.api(`/sites/${siteId}/lists/${usersListId}/items?expand=fields&$top=3`).get();
        userItems.value.forEach((item: any, index: number) => {
          console.log(`   👤 User ${index + 1} (ID: ${item.id}):`);
          console.log(`      Fields:`, JSON.stringify(item.fields, null, 6));
          console.log("");
        });

      } catch (error) {
        console.error("❌ Error inspecting users list:", error);
      }
    }

    console.log("\n✅ SharePoint inspection completed!");
    console.log("\n💡 Next Steps:");
    console.log("1. Review the field names above");
    console.log("2. Update sharepointClient.ts with correct field names");
    console.log("3. Test the updated integration");

  } catch (error) {
    console.error("❌ Failed to inspect SharePoint:", error);
  }
}

// Run the inspection
if (require.main === module) {
  inspectSharePointLists();
}

export { inspectSharePointLists };
