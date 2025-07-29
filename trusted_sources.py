# trusted_sources.py

def get_microsoft_learn_link(query: str) -> str:
    # Enhanced Business Central resources
    resources = {
        # Core BC topics
        "inventory": "https://learn.microsoft.com/en-us/dynamics365/business-central/inventory-how-manage",
        "setup": "https://learn.microsoft.com/en-us/dynamics365/business-central/setup",
        "finance": "https://learn.microsoft.com/en-us/dynamics365/business-central/finance",
        "sales": "https://learn.microsoft.com/en-us/dynamics365/business-central/sales-manage-sales",
        "purchasing": "https://learn.microsoft.com/en-us/dynamics365/business-central/purchasing-manage-purchasing",
        "warehouse": "https://learn.microsoft.com/en-us/dynamics365/business-central/warehouse-manage-warehouse",
        "manufacturing": "https://learn.microsoft.com/en-us/dynamics365/business-central/production-manage-manufacturing",
        "project": "https://learn.microsoft.com/en-us/dynamics365/business-central/project-management",
        "service": "https://learn.microsoft.com/en-us/dynamics365/business-central/service-manage-service",
        
        # Development topics
        "api": "https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/",
        "development": "https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/",
        "extensions": "https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-dev-overview",
        "permissions": "https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/permissions-overview",
        "web services": "https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/webservices/web-services",
        
        # Business processes
        "reporting": "https://learn.microsoft.com/en-us/dynamics365/business-central/reporting",
        "analytics": "https://learn.microsoft.com/en-us/dynamics365/business-central/analytics",
        "workflow": "https://learn.microsoft.com/en-us/dynamics365/business-central/across-workflow",
        "approval": "https://learn.microsoft.com/en-us/dynamics365/business-central/across-approval-processes",
        
        # Integration topics
        "office": "https://learn.microsoft.com/en-us/dynamics365/business-central/across-working-with-office",
        "power bi": "https://learn.microsoft.com/en-us/dynamics365/business-central/across-working-with-powerbi",
        "teams": "https://learn.microsoft.com/en-us/dynamics365/business-central/across-working-with-teams",
        "outlook": "https://learn.microsoft.com/en-us/dynamics365/business-central/across-working-with-outlook",
        
        # Administration
        "administration": "https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/",
        "security": "https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/security/",
        "licensing": "https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/deployment/licensing",
    }

    query_lower = query.lower()
    
    # Check for specific keywords first
    for keyword, link in resources.items():
        if keyword.lower() in query_lower:
            return link
    
    # Check for general BC terms
    bc_terms = ["business central", "bc", "dynamics", "microsoft"]
    if any(term in query_lower for term in bc_terms):
        return "https://learn.microsoft.com/en-us/dynamics365/business-central/"
    
    # Default to general BC overview
    return "https://learn.microsoft.com/en-us/dynamics365/business-central/"

def suggest_resources(query: str) -> str:
    """
    Suggest relevant Microsoft Learn resources based on the query.
    """
    link = get_microsoft_learn_link(query)
    return f"Here's a relevant Microsoft Learn resource: {link}"

# Optional alias
suggest_resources = get_microsoft_learn_link
