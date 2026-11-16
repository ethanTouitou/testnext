## Data management and CRUD operations

Implement complete data management for all resources supported by the API.

For each resource, inspect the API documentation and implement the available operations:

- **List:** Retrieve and display existing resources.
- **Filter:** Filter results using available API parameters.
- **Search:** Search for specific resources when supported.
- **Create:** Create new resources using the expected API payload.
- **Read:** Retrieve and display resource details.
- **Update:** Modify existing resources.
- **Delete:** Delete resources when authorized.

### Drops management

- List Drops from the API.
- Filter Drops using supported filters, especially geographical location when available.
- Retrieve individual Drop details.
- Create new Drops with their geographical coordinates and content.
- Update existing Drops when supported.
- Delete personal Drops when authorized.
- Refresh displayed data after successful operations.

### Users management

- List users when supported.
- Search or filter users using available API parameters.
- Retrieve user profiles.
- Update the authenticated user's profile when supported.
- Respect user permissions and authentication requirements.

### Likes and interactions

- Retrieve likes and like counts.
- Like and unlike Drops.
- Update the interface after successful interactions.
- Avoid duplicate requests and inconsistent states.

### Implementation rules

- Use API-side filtering and pagination whenever available.
- Do not retrieve all records if the API provides efficient filtering.
- Keep filters synchronized with displayed results.
- Handle empty results and API errors.
- Ask for confirmation before destructive actions such as deleting a Drop.
- Update the interface after creating, modifying or deleting data.
- Never assume that an operation exists: verify its availability in the API documentation first.