export function isValidLinkedinSearchUsersArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (obj.count !== undefined && typeof obj.count !== "number") {
        return false;
    }
    if (obj.timeout !== undefined && typeof obj.timeout !== "number") {
        return false;
    }
    const hasAnySearchField = obj.keywords ||
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
    if (!hasAnySearchField)
        return false;
    return true;
}
export function isValidLinkedinUserProfileArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.user !== "string" || !obj.user.trim())
        return false;
    return true;
}
export function isValidLinkedinEmailUserArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.email !== "string" || !obj.email.trim())
        return false;
    if (obj.count !== undefined && typeof obj.count !== "number")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidLinkedinUserPostsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.urn !== "string" || !obj.urn.trim())
        return false;
    if (obj.count !== undefined && typeof obj.count !== "number")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidLinkedinUserReactionsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.urn !== "string" || !obj.urn.trim())
        return false;
    if (obj.count !== undefined && typeof obj.count !== "number")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidLinkedinUserCommentsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.urn !== "string" || !obj.urn.trim())
        return false;
    if (obj.count !== undefined && typeof obj.count !== "number")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    if (obj.commented_after !== undefined && typeof obj.commented_after !== "number")
        return false;
    return true;
}
export function isValidLinkedinChatMessagesArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.user !== "string" || !obj.user.trim())
        return false;
    if (obj.company !== undefined && typeof obj.company !== "string")
        return false;
    if (obj.count !== undefined && typeof obj.count !== "number")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidSendLinkedinChatMessageArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.user !== "string" || !obj.user.trim())
        return false;
    if (obj.company !== undefined && typeof obj.company !== "string")
        return false;
    if (typeof obj.text !== "string" || !obj.text.trim())
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidSendLinkedinConnectionArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.user !== "string" || !obj.user.trim())
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidSendLinkedinPostCommentArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.text !== "string" || !obj.text.trim())
        return false;
    if (typeof obj.urn !== "string" || !obj.urn.trim())
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidGetLinkedinUserConnectionsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (obj.connected_after !== undefined && typeof obj.connected_after !== "number")
        return false;
    if (obj.count !== undefined && typeof obj.count !== "number")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidGetLinkedinPostRepostsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.urn !== "string" || !obj.urn.includes("activity:"))
        return false;
    if (obj.count !== undefined && typeof obj.count !== "number")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidGetLinkedinPostCommentsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.urn !== "string" || !obj.urn.includes("activity:"))
        return false;
    if (obj.sort !== undefined && obj.sort !== "relevance" && obj.sort !== "recent")
        return false;
    if (obj.count !== undefined && typeof obj.count !== "number")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidGetLinkedinPostReactionsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.urn !== "string" || !obj.urn.includes("activity:"))
        return false;
    if (obj.count !== undefined && typeof obj.count !== "number")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidGetLinkedinGoogleCompanyArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (!Array.isArray(obj.keywords) || obj.keywords.length === 0)
        return false;
    if (obj.with_urn !== undefined && typeof obj.with_urn !== "boolean")
        return false;
    if (obj.count_per_keyword !== undefined &&
        (typeof obj.count_per_keyword !== "number" ||
            obj.count_per_keyword < 1 ||
            obj.count_per_keyword > 10)) {
        return false;
    }
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidGetLinkedinCompanyArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.company !== "string" || !obj.company.trim())
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidGetLinkedinCompanyEmployeesArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    // companies (обязательный массив строк)
    if (!Array.isArray(obj.companies) || obj.companies.length === 0)
        return false;
    for (const c of obj.companies) {
        if (typeof c !== "string")
            return false;
    }
    if (obj.keywords !== undefined && typeof obj.keywords !== "string")
        return false;
    if (obj.first_name !== undefined && typeof obj.first_name !== "string")
        return false;
    if (obj.last_name !== undefined && typeof obj.last_name !== "string")
        return false;
    if (obj.count !== undefined && typeof obj.count !== "number")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidSendLinkedinPostArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.text !== "string" || !obj.text.trim())
        return false;
    if (obj.visibility !== undefined &&
        obj.visibility !== "ANYONE" &&
        obj.visibility !== "CONNECTIONS_ONLY")
        return false;
    if (obj.comment_scope !== undefined &&
        obj.comment_scope !== "ALL" &&
        obj.comment_scope !== "CONNECTIONS_ONLY" &&
        obj.comment_scope !== "NONE")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidLinkedinSalesNavigatorSearchUsersArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.count !== "number" || obj.count <= 0 || obj.count > 2500)
        return false;
    if (obj.keywords !== undefined && typeof obj.keywords !== "string")
        return false;
    if (obj.first_names !== undefined) {
        if (!Array.isArray(obj.first_names))
            return false;
        for (const name of obj.first_names) {
            if (typeof name !== "string")
                return false;
        }
    }
    if (obj.last_names !== undefined) {
        if (!Array.isArray(obj.last_names))
            return false;
        for (const name of obj.last_names) {
            if (typeof name !== "string")
                return false;
        }
    }
    if (obj.current_titles !== undefined) {
        if (!Array.isArray(obj.current_titles))
            return false;
        for (const title of obj.current_titles) {
            if (typeof title !== "string")
                return false;
        }
    }
    if (obj.location !== undefined) {
        if (typeof obj.location !== "string" && !Array.isArray(obj.location))
            return false;
        if (Array.isArray(obj.location)) {
            for (const loc of obj.location) {
                if (typeof loc !== "string")
                    return false;
            }
        }
    }
    if (obj.education !== undefined) {
        if (typeof obj.education !== "string" && !Array.isArray(obj.education))
            return false;
        if (Array.isArray(obj.education)) {
            for (const edu of obj.education) {
                if (typeof edu !== "string")
                    return false;
            }
        }
    }
    if (obj.languages !== undefined) {
        if (!Array.isArray(obj.languages))
            return false;
        for (const lang of obj.languages) {
            if (typeof lang !== "string")
                return false;
        }
    }
    if (obj.past_titles !== undefined) {
        if (!Array.isArray(obj.past_titles))
            return false;
        for (const title of obj.past_titles) {
            if (typeof title !== "string")
                return false;
        }
    }
    if (obj.functions !== undefined) {
        if (!Array.isArray(obj.functions))
            return false;
        for (const func of obj.functions) {
            if (typeof func !== "string")
                return false;
        }
    }
    if (obj.levels !== undefined) {
        if (!Array.isArray(obj.levels))
            return false;
        for (const level of obj.levels) {
            if (typeof level !== "string")
                return false;
        }
    }
    if (obj.years_in_the_current_company !== undefined) {
        if (!Array.isArray(obj.years_in_the_current_company))
            return false;
        for (const years of obj.years_in_the_current_company) {
            if (typeof years !== "string")
                return false;
        }
    }
    if (obj.years_in_the_current_position !== undefined) {
        if (!Array.isArray(obj.years_in_the_current_position))
            return false;
        for (const years of obj.years_in_the_current_position) {
            if (typeof years !== "string")
                return false;
        }
    }
    if (obj.company_sizes !== undefined) {
        if (!Array.isArray(obj.company_sizes))
            return false;
        for (const size of obj.company_sizes) {
            if (typeof size !== "string")
                return false;
        }
    }
    if (obj.company_types !== undefined) {
        if (!Array.isArray(obj.company_types))
            return false;
        for (const type of obj.company_types) {
            if (typeof type !== "string")
                return false;
        }
    }
    if (obj.company_locations !== undefined) {
        if (typeof obj.company_locations !== "string" && !Array.isArray(obj.company_locations))
            return false;
        if (Array.isArray(obj.company_locations)) {
            for (const loc of obj.company_locations) {
                if (typeof loc !== "string")
                    return false;
            }
        }
    }
    if (obj.current_companies !== undefined) {
        if (typeof obj.current_companies !== "string" && !Array.isArray(obj.current_companies))
            return false;
        if (Array.isArray(obj.current_companies)) {
            for (const company of obj.current_companies) {
                if (typeof company !== "string")
                    return false;
            }
        }
    }
    if (obj.past_companies !== undefined) {
        if (typeof obj.past_companies !== "string" && !Array.isArray(obj.past_companies))
            return false;
        if (Array.isArray(obj.past_companies)) {
            for (const company of obj.past_companies) {
                if (typeof company !== "string")
                    return false;
            }
        }
    }
    if (obj.industry !== undefined) {
        if (typeof obj.industry !== "string" && !Array.isArray(obj.industry))
            return false;
        if (Array.isArray(obj.industry)) {
            for (const ind of obj.industry) {
                if (typeof ind !== "string")
                    return false;
            }
        }
    }
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidLinkedinManagementConversationsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (obj.connected_after !== undefined && typeof obj.connected_after !== "number")
        return false;
    if (obj.count !== undefined && typeof obj.count !== "number")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
export function isValidGoogleSearchPayload(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.query !== "string" || !obj.query.trim())
        return false;
    if (obj.count !== undefined && (typeof obj.count !== "number" || obj.count <= 0 || obj.count > 20))
        return false;
    if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500))
        return false;
    return true;
}
export function isValidLinkedinSearchPostsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.count !== "number" || obj.count <= 0)
        return false;
    if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500))
        return false;
    if (obj.keywords !== undefined && typeof obj.keywords !== "string")
        return false;
    if (obj.sort !== undefined && obj.sort !== "relevance")
        return false;
    if (obj.date_posted !== undefined &&
        obj.date_posted !== "past-month" &&
        obj.date_posted !== "past-week" &&
        obj.date_posted !== "past-24h")
        return false;
    if (obj.content_type !== undefined && obj.content_type !== null &&
        obj.content_type !== "videos" &&
        obj.content_type !== "photos" &&
        obj.content_type !== "jobs" &&
        obj.content_type !== "live_videos" &&
        obj.content_type !== "documents")
        return false;
    if (obj.mentioned !== undefined && obj.mentioned !== null && !Array.isArray(obj.mentioned))
        return false;
    if (obj.authors !== undefined && obj.authors !== null && !Array.isArray(obj.authors))
        return false;
    if (obj.author_industries !== undefined && obj.author_industries !== null) {
        if (typeof obj.author_industries !== "string" && !Array.isArray(obj.author_industries))
            return false;
    }
    if (obj.author_title !== undefined && obj.author_title !== null && typeof obj.author_title !== "string")
        return false;
    return true;
}
export function isValidRedditSearchPostsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.query !== "string" || !obj.query.trim())
        return false;
    if (typeof obj.count !== "number" || obj.count <= 0)
        return false;
    if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500))
        return false;
    if (obj.sort !== undefined &&
        obj.sort !== "relevance" &&
        obj.sort !== "hot" &&
        obj.sort !== "top" &&
        obj.sort !== "new" &&
        obj.sort !== "comments")
        return false;
    if (obj.time_filter !== undefined &&
        obj.time_filter !== "all" &&
        obj.time_filter !== "year" &&
        obj.time_filter !== "month" &&
        obj.time_filter !== "week" &&
        obj.time_filter !== "day" &&
        obj.time_filter !== "hour")
        return false;
    return true;
}
// Instagram validation functions
export function isValidInstagramUserArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.user !== "string" || !obj.user.trim())
        return false;
    if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500))
        return false;
    return true;
}
export function isValidInstagramUserPostsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.user !== "string" || !obj.user.trim())
        return false;
    if (typeof obj.count !== "number" || obj.count <= 0)
        return false;
    if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500))
        return false;
    return true;
}
export function isValidInstagramPostCommentsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.post !== "string" || !obj.post.trim())
        return false;
    if (typeof obj.count !== "number" || obj.count <= 0)
        return false;
    if (obj.timeout !== undefined && (typeof obj.timeout !== "number" || obj.timeout < 20 || obj.timeout > 1500))
        return false;
    return true;
}
export function isValidLinkedinCompanyPostsArgs(args) {
    if (typeof args !== "object" || args === null)
        return false;
    const obj = args;
    if (typeof obj.urn !== "string" || !obj.urn.trim())
        return false;
    if (!obj.urn.includes("company:"))
        return false;
    if (obj.count !== undefined && typeof obj.count !== "number")
        return false;
    if (obj.timeout !== undefined && typeof obj.timeout !== "number")
        return false;
    return true;
}
