// types.ts
export interface LinkedinSearchUsersArgs {
  keywords?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company_keywords?: string;
  school_keywords?: string;
  current_company?: string;
  past_company?: string;
  location?: string;
  industry?: string;
  education?: string;
  count?: number;
  timeout?: number;
}

export interface LinkedinUserProfileArgs {
  user: string;
  with_experience?: boolean;
  with_education?: boolean;
  with_skills?: boolean;
}

export interface LinkedinEmailUserArgs {
  email: string;
  count?: number;
  timeout?: number;
}

export interface LinkedinUserPostsArgs {
  urn: string;
  count?: number;
  timeout?: number;
}

export interface LinkedinUserReactionsArgs {
  urn: string;
  count?: number;
  timeout?: number;
}

export interface LinkedinChatMessagesArgs {
  user: string;
  count?: number;
  timeout?: number;
}

export interface SendLinkedinChatMessageArgs {
  user: string;
  text: string;
  timeout?: number;
}

export interface SendLinkedinConnectionArgs {
  user: string;
  timeout?: number;
}

export interface SendLinkedinPostCommentArgs {
  text: string;
  urn: string;
  timeout?: number;
}

export interface GetLinkedinUserConnectionsArgs {
  connected_after?: number;
  count?: number;
  timeout?: number;
}

export interface GetLinkedinPostRepostsArgs {
  urn: string;
  count?: number;
  timeout?: number;
}

export interface GetLinkedinPostCommentsArgs {
  urn: string;
  sort?: "relevance" | "recent";
  count?: number;
  timeout?: number;
}

export interface GetLinkedinGoogleCompanyArgs {
  keywords: string[];
  with_urn?: boolean;
  count_per_keyword?: number;
  timeout?: number;
}

export interface GetLinkedinCompanyArgs {
  company: string;
  timeout?: number;
}

export interface GetLinkedinCompanyEmployeesArgs {
  companies: string[];
  keywords?: string;
  first_name?: string;
  last_name?: string;
  count?: number;
  timeout?: number;
}

export interface SendLinkedinPostArgs {
  text: string;
  visibility?: "ANYONE" | "CONNECTIONS_ONLY";
  comment_scope?: "ALL" | "CONNECTIONS_ONLY" | "NONE";
  timeout?: number;
}


export function isValidLinkedinSearchUsersArgs(
  args: unknown
): args is LinkedinSearchUsersArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  if (obj.count !== undefined && typeof obj.count !== "number") {
    return false;
  }

  if (obj.timeout !== undefined && typeof obj.timeout !== "number") {
    return false;
  }

  const hasAnySearchField =
    obj.keywords ||
    obj.first_name ||
    obj.last_name ||
    obj.title ||
    obj.company_keywords ||
    obj.school_keywords ||
    obj.current_company ||
    obj.past_company ||
    obj.location ||
    obj.industry ||
    obj.education;

  if (!hasAnySearchField) return false;

  return true;
}

export function isValidLinkedinUserProfileArgs(
  args: unknown
): args is LinkedinUserProfileArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.user !== "string" || !obj.user.trim()) return false;

  return true;
}

export function isValidLinkedinEmailUserArgs(
  args: unknown
): args is LinkedinEmailUserArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.email !== "string" || !obj.email.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidLinkedinUserPostsArgs(
  args: unknown
): args is LinkedinUserPostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidLinkedinUserReactionsArgs(
  args: unknown
): args is LinkedinUserReactionsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidLinkedinChatMessagesArgs(
  args: unknown
): args is LinkedinChatMessagesArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.user !== "string" || !obj.user.trim()) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidSendLinkedinChatMessageArgs(
  args: unknown
): args is SendLinkedinChatMessageArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.user !== "string" || !obj.user.trim()) return false;
  if (typeof obj.text !== "string" || !obj.text.trim()) return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidSendLinkedinConnectionArgs(
  args: unknown
): args is SendLinkedinConnectionArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.user !== "string" || !obj.user.trim()) return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidSendLinkedinPostCommentArgs(
  args: unknown
): args is SendLinkedinPostCommentArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.text !== "string" || !obj.text.trim()) return false;
  if (typeof obj.urn !== "string" || !obj.urn.trim()) return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinUserConnectionsArgs(
  args: unknown
): args is GetLinkedinUserConnectionsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (obj.connected_after !== undefined && typeof obj.connected_after !== "number") return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinPostRepostsArgs(
  args: unknown
): args is GetLinkedinPostRepostsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.includes("activity:")) return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinPostCommentsArgs(
  args: unknown
): args is GetLinkedinPostCommentsArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.urn !== "string" || !obj.urn.includes("activity:")) return false;
  if (obj.sort !== undefined && obj.sort !== "relevance" && obj.sort !== "recent") return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinGoogleCompanyArgs(
  args: unknown
): args is GetLinkedinGoogleCompanyArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (!Array.isArray(obj.keywords) || obj.keywords.length === 0) return false;
  if (obj.with_urn !== undefined && typeof obj.with_urn !== "boolean") return false;
  if (
    obj.count_per_keyword !== undefined &&
    (typeof obj.count_per_keyword !== "number" ||
      obj.count_per_keyword < 1 ||
      obj.count_per_keyword > 10)
  ) {
    return false;
  }
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinCompanyArgs(
  args: unknown
): args is GetLinkedinCompanyArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;
  if (typeof obj.company !== "string" || !obj.company.trim()) return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;
  return true;
}

export function isValidGetLinkedinCompanyEmployeesArgs(
  args: unknown
): args is GetLinkedinCompanyEmployeesArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  // companies (обязательный массив строк)
  if (!Array.isArray(obj.companies) || obj.companies.length === 0) return false;
  for (const c of obj.companies) {
    if (typeof c !== "string") return false;
  }

  if (obj.keywords !== undefined && typeof obj.keywords !== "string") return false;
  if (obj.first_name !== undefined && typeof obj.first_name !== "string") return false;
  if (obj.last_name !== undefined && typeof obj.last_name !== "string") return false;
  if (obj.count !== undefined && typeof obj.count !== "number") return false;
  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;

  return true;
}

export function isValidSendLinkedinPostArgs(
  args: unknown
): args is SendLinkedinPostArgs {
  if (typeof args !== "object" || args === null) return false;
  const obj = args as Record<string, unknown>;

  // Проверка обязательного поля text
  if (typeof obj.text !== "string" || !obj.text.trim()) return false;

  // Проверка опциональных полей
  if (obj.visibility !== undefined &&
      obj.visibility !== "ANYONE" &&
      obj.visibility !== "CONNECTIONS_ONLY") return false;

  if (obj.comment_scope !== undefined &&
      obj.comment_scope !== "ALL" &&
      obj.comment_scope !== "CONNECTIONS_ONLY" &&
      obj.comment_scope !== "NONE") return false;

  if (obj.timeout !== undefined && typeof obj.timeout !== "number") return false;

  return true;
}
