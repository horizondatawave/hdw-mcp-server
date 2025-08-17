[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/horizondatawave-hdw-mcp-server-badge.png)](https://mseep.ai/app/horizondatawave-hdw-mcp-server)

# HDW MCP Server
[![smithery badge](https://smithery.ai/badge/@horizondatawave/hdw-mcp-server)](https://smithery.ai/server/@horizondatawave/hdw-mcp-server)

A Model Context Protocol (MCP) server that provides comprehensive access to LinkedIn and Instagram data and functionalities using the HorizonDataWave API, enabling not only data retrieval but also robust management of user accounts.
---

## Features

- **LinkedIn Users Search:** Filter and search for LinkedIn users by keywords, name, title, company, location, industry, and education.
- **Profile Lookup:** Retrieve detailed profile information for a LinkedIn user.
- **Email Lookup:** Find LinkedIn user details by email address.
- **Posts & Reactions:** Retrieve a user's posts and associated reactions.
- **Post Reposts, Comments & Reactions:** Retrieve reposts, comments, and reactions for a specific LinkedIn post.
- **Account Management:**
  - **Chat Functionality:** Retrieve and send chat messages via the LinkedIn management API.
  - **Connection Management:** Send connection invitations to LinkedIn users.
  - **Post Commenting:** Create comments on LinkedIn posts or replies.
  - **User Connections:** Retrieve a list of a user's LinkedIn connections.
- **Company Search & Details:**  
  - **Google Company Search:** Find LinkedIn companies using Google search – the first result is typically the best match.  
  - **Company Lookup:** Retrieve detailed information about a LinkedIn company.  
  - **Company Employees:** Retrieve employees for a given LinkedIn company.
  
- **Google Search**
- **Reddit Search:** Search for Reddit posts with various filters including query, sort options, time filters, and result count.
- **Instagram Data Access:**
  - **User Profiles:** Get detailed Instagram user information by URL, alias, or ID.
  - **User Posts:** Retrieve posts from Instagram users.
  - **Post Comments:** Get comments for specific Instagram posts.

---

## Tools

HDW MCP Server exposes several tools through the MCP protocol. Each tool is defined with its name, description, and input parameters:

1. **Search LinkedIn Users**  
   **Name:** `search_linkedin_users`  
   **Description:** Search for LinkedIn users with various filters.  
   **Parameters:**  
   - `keywords` (optional): Any keyword for search.  
   - `first_name`, `last_name`, `title`, `company_keywords`, `school_keywords` (optional).  
   - `current_company`, `past_company`, `location`, `industry`, `education` (optional).  
   - `count` (optional, default: 10): Maximum number of results (max 1000).  
   - `timeout` (optional, default: 300): Timeout in seconds (20–1500).

2. **Get LinkedIn Profile**  
   **Name:** `get_linkedin_profile`  
   **Description:** Retrieve detailed profile information about a LinkedIn user.  
   **Parameters:**  
   - `user` (required): User alias, URL, or URN.  
   - `with_experience`, `with_education`, `with_skills` (optional, default: true).

3. **Get LinkedIn Email User**  
   **Name:** `get_linkedin_email_user`  
   **Description:** Look up LinkedIn user details by email.  
   **Parameters:**  
   - `email` (required): Email address.  
   - `count` (optional, default: 5).  
   - `timeout` (optional, default: 300).

4. **Get LinkedIn User Posts**  
   **Name:** `get_linkedin_user_posts`  
   **Description:** Retrieve posts for a LinkedIn user by URN.  
   **Parameters:**  
   - `urn` (required): User URN (must include prefix, e.g. `fsd_profile:...`).  
   - `count` (optional, default: 10).  
   - `timeout` (optional, default: 300).

5. **Get LinkedIn User Reactions**  
   **Name:** `get_linkedin_user_reactions`  
   **Description:** Retrieve reactions for a LinkedIn user by URN.  
   **Parameters:**  
   - `urn` (required).  
   - `count` (optional, default: 10).  
   - `timeout` (optional, default: 300).

6. **Get LinkedIn User Comments**  
   **Name:** `get_linkedin_user_comments`  
   **Description:** Retrieve comments for a LinkedIn user by URN.  
   **Parameters:**  
   - `urn` (required): User URN (with prefix).  
   - `count` (optional, default: 10).  
   - `timeout` (optional, default: 300).  
   - `commented_after` (optional): Filter comments created after the specified timestamp.

7. **Get LinkedIn Chat Messages**  
   **Name:** `get_linkedin_chat_messages`  
   **Description:** Retrieve top chat messages from the LinkedIn management API.  
   **Parameters:**  
   - `user` (required): User URN (with prefix).  
   - `count` (optional, default: 20).  
   - `timeout` (optional, default: 300).

8. **Send LinkedIn Chat Message**  
   **Name:** `send_linkedin_chat_message`  
   **Description:** Send a chat message using the LinkedIn management API.  
   **Parameters:**  
   - `user` (required): Recipient user URN (with prefix).  
   - `text` (required): Message text.  
   - `timeout` (optional, default: 300).

9. **Send LinkedIn Connection Request**  
   **Name:** `send_linkedin_connection`  
   **Description:** Send a connection invitation to a LinkedIn user.  
   **Parameters:**  
   - `user` (required).  
   - `timeout` (optional, default: 300).

10. **Send LinkedIn Post Comment**  
   **Name:** `send_linkedin_post_comment`  
   **Description:** Create a comment on a LinkedIn post or reply.  
   **Parameters:**  
   - `text` (required): Comment text.  
   - `urn` (required): Activity or comment URN.  
   - `timeout` (optional, default: 300).

11. **Get LinkedIn User Connections**  
    **Name:** `get_linkedin_user_connections`  
    **Description:** Retrieve a list of LinkedIn user connections.  
    **Parameters:**  
    - `connected_after` (optional): Timestamp filter.  
    - `count` (optional, default: 20).  
    - `timeout` (optional, default: 300).

12. **Get LinkedIn Post Reposts**  
    **Name:** `get_linkedin_post_reposts`  
    **Description:** Retrieve reposts for a LinkedIn post.  
    **Parameters:**  
    - `urn` (required): Post URN (must start with `activity:`).  
    - `count` (optional, default: 10).  
    - `timeout` (optional, default: 300).

13. **Get LinkedIn Post Comments**  
    **Name:** `get_linkedin_post_comments`  
    **Description:** Retrieve comments for a LinkedIn post.  
    **Parameters:**  
    - `urn` (required).  
    - `sort` (optional, default: `"relevance"`; allowed values: `"relevance"`, `"recent"`).  
    - `count` (optional, default: 10).  
    - `timeout` (optional, default: 300).

14. **Get LinkedIn Post Reactions**  
    **Name:** `get_linkedin_post_reactions`  
    **Description:** Retrieve reactions for a LinkedIn post.  
    **Parameters:**  
    - `urn` (required): Post URN (must start with `activity:`).  
    - `count` (optional, default: 50).  
    - `timeout` (optional, default: 300).

15. **Get LinkedIn Google Company**  
    **Name:** `get_linkedin_google_company`  
    **Description:** Search for LinkedIn companies via Google – the first result is typically the best match.  
    **Parameters:**  
    - `keywords` (required): Array of company keywords.  
    - `with_urn` (optional, default: false).  
    - `count_per_keyword` (optional, default: 1; range 1–10).  
    - `timeout` (optional, default: 300).

16. **Get LinkedIn Company**  
    **Name:** `get_linkedin_company`  
    **Description:** Retrieve detailed information about a LinkedIn company.  
    **Parameters:**  
    - `company` (required): Company alias, URL, or URN.  
    - `timeout` (optional, default: 300).

17. **Get LinkedIn Company Employees**  
    **Name:** `get_linkedin_company_employees`  
    **Description:** Retrieve employees of a LinkedIn company.  
    **Parameters:**  
    - `companies` (required): Array of company URNs.  
    - `keywords`, `first_name`, `last_name` (optional).  
    - `count` (optional, default: 10).  
    - `timeout` (optional, default: 300).

18. **Search Reddit Posts**  
    **Name:** `search_reddit_posts`  
    **Description:** Search for Reddit posts with various filters.  
    **Parameters:**  
    - `query` (required): Main search query.  
    - `sort` (optional, default: `"relevance"`; allowed values: `"relevance"`, `"hot"`, `"top"`, `"new"`, `"comments"`).  
    - `time_filter` (optional, default: `"all"`; allowed values: `"all"`, `"year"`, `"month"`, `"week"`, `"day"`, `"hour"`).  
    - `count` (required): Max result count.  
    - `timeout` (optional, default: 300).

19. **Get Instagram User**  
    **Name:** `get_instagram_user`  
    **Description:** Get Instagram user information by URL, alias or ID.  
    **Parameters:**  
    - `user` (required): User ID, alias or URL.  
    - `timeout` (optional, default: 300): Timeout in seconds (20-1500).

20. **Get Instagram User Posts**  
    **Name:** `get_instagram_user_posts`  
    **Description:** Get Instagram user posts.  
    **Parameters:**  
    - `user` (required): User ID, alias or URL.  
    - `count` (required): Max result count.  
    - `timeout` (optional, default: 300): Timeout in seconds (20-1500).

21. **Get Instagram Post Comments**  
    **Name:** `get_instagram_post_comments`  
    **Description:** Get Instagram post comments.  
    **Parameters:**  
    - `post` (required): Post ID.  
    - `count` (required): Max result count.  
    - `timeout` (optional, default: 300): Timeout in seconds (20-1500).

---

## Setup Guide

### Installing via Smithery

To install HDW MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@horizondatawave/hdw-mcp-server):

```bash
npx -y @smithery/cli install @horizondatawave/hdw-mcp-server --client claude
```

### 1. Clone the Repository (macOS)

Open your terminal and run the following commands:

```bash
# Clone the repository
git clone https://github.com/horizondatawave/hdw-mcp-server.git

# Change directory to the project folder
cd hdw-mcp-server

# Install dependencies
npm install
```
### 2. Obtain Your API Credentials

Register at [app.horizondatawave.ai](https://app.horizondatawave.ai) to get your API key and 100 free credits. You will receive your **HDW_ACCESS_TOKEN** and **HDW_ACCOUNT_ID**.

---

### 3. Configure the Environment

Create a `.env` file in the root of your project with the following content:

```env
HDW_ACCESS_TOKEN=YOUR_HD_W_ACCESS_TOKEN
HDW_ACCOUNT_ID=YOUR_HD_W_ACCOUNT_ID
```
### 4. Client Configuration

#### 4.1 Claude Desktop

Update your Claude configuration file (`claude_desktop_config.json`) with the following content:

```json
{
  "mcpServers": {
    "hdw": {
      "command": "npx",
      "args": ["-y","@horizondatawave/mcp"],
      "env": {
        "HDW_ACCESS_TOKEN": "YOUR_HD_W_ACCESS_TOKEN",
        "HDW_ACCOUNT_ID": "YOUR_HD_W_ACCOUNT_ID"
      }
    }
  }
}
```
*Configuration file location:*

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

---

#### 4.2 Cursor

**Easy way:**  
Open Cursor Settings and add a new MCP server with the command:

```bash
env HDW_ACCESS_TOKEN=your-access-token HDW_ACCOUNT_ID=your-account-id node /path/to/your/build/index.js
```
**Safe way:**  
Copy the provided template `run.template.sh` to a new file (e.g. `run.sh`), update it with your credentials, and configure Cursor to run:

```bash
sh /path/to/your/run.sh
```
#### 4.3 Windsurf

Update your Windsurf configuration file (`mcp_config.json`) with the following content:

```json
{
  "mcpServers": {
    "hdw": {
      "command": "npx",
      "args": ["-y","@horizondatawave/mcp"],
      "env": {
        "HDW_ACCESS_TOKEN": "YOUR_HD_W_ACCESS_TOKEN",
        "HDW_ACCOUNT_ID": "YOUR_HD_W_ACCOUNT_ID"
      }
    }
  }
}
```
**Note:** After configuration, you can disable official web tools to conserve your API credits.

---

### MCP Client Example Configuration

Below is an example configuration for an MCP client (e.g., a custom integration):

```json
{
  "mcpServers": {
    "hdw": {
      "command": "npx",
      "args": ["-y","@horizondatawave/mcp"],
      "env": {
        "HDW_ACCESS_TOKEN": "YOUR_HD_W_ACCESS_TOKEN",
        "HDW_ACCOUNT_ID": "YOUR_HD_W_ACCOUNT_ID"
      }
    }
  }
}
```
Replace the paths and credentials with your own values.
## License

This project is licensed under the [MIT License](LICENSE.md).
