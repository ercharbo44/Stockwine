//-----------------------------------------------------------------------
// Références des artefacts Fabric du workspace DemoBigData et construction
// des URLs d'intégration (rapport Power BI, data agent Sommelier).
//
// Les identifiants sont résolus depuis les variables VITE_* injectées par
// `rayfin up`, avec repli sur les valeurs connues du workspace DemoBigData.
//-----------------------------------------------------------------------

import { fabricConfig } from "@/fabric.generated";

const env = import.meta.env;

/** Workspace Fabric hébergeant tous les artefacts (DemoBigData). */
export const WORKSPACE_ID: string =
    env.VITE_FABRIC_WORKSPACE_ID ??
    fabricConfig.semanticModels.vinsurvin.workspaceId ??
    "d7abeb59-0499-45ad-bee7-31cbccd6ebec";

/** Tenant (ctid) requis par l'embed sécurisé Power BI. */
export const TENANT_ID: string =
    env.VITE_FABRIC_TENANT_ID ?? "c7135f65-dcd3-49f9-8dde-f128ddc1aca5";

/** Rapport Power BI « suivistock ». */
export const REPORT_ID = "6fd29955-cab8-4e65-912b-7486396914f5";

/** Data agent Fabric « Sommelier ». */
export const DATA_AGENT_ID = "378fa80d-795d-41e4-8a51-76c1715b3809";

/**
 * URL d'intégration sécurisée du rapport Power BI. L'utilisateur étant déjà
 * authentifié dans la même session (SSO Fabric), l'iframe se charge sans
 * nouvelle connexion.
 */
export function reportEmbedUrl(): string {
    const params = new URLSearchParams({
        reportId: REPORT_ID,
        groupId: WORKSPACE_ID,
        autoAuth: "true",
        ctid: TENANT_ID,
    });
    return `https://app.powerbi.com/reportEmbed?${params.toString()}`;
}

/**
 * URL de la surface publiée du data agent Fabric (Sommelier).
 * Format « aiskills » exposé par Fabric pour un data agent publié.
 */
export function dataAgentEmbedUrl(): string {
    return `https://fabric.microsoft.com/groups/${WORKSPACE_ID}/aiskills/${DATA_AGENT_ID}`;
}

/** Endpoint MCP du data agent (surface de consommation programmatique). */
export function dataAgentMcpUrl(): string {
    return `https://api.fabric.microsoft.com/v1/mcp/workspaces/${WORKSPACE_ID}/dataagents/${DATA_AGENT_ID}/agent`;
}
