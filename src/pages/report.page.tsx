//-----------------------------------------------------------------------
// Page Rapport : intègre le rapport Power BI « suivistock » directement
// dans l'application (embed sécurisé, sans navigation externe).
//-----------------------------------------------------------------------

import { FileChartColumn } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Badge } from "@/components/ui/primitives";
import { EmbedFrame } from "@/components/ui/embed-frame";
import { reportEmbedUrl } from "@/lib/fabric-embeds";

export function ReportPage() {
    return (
        <PageContainer className="flex h-full flex-col">
            <PageHeader
                title="Rapport Power BI"
                subtitle="Rapport « suivistock » intégré à l'application."
                icon={<FileChartColumn className="icon-size-300" />}
                actions={<Badge tone="primary">Fabric · Power BI</Badge>}
            />
            <EmbedFrame
                src={reportEmbedUrl()}
                title="suivistock"
                className="min-h-[70vh] flex-1"
                fallback={
                    <p className="text-100 text-muted-foreground">
                        Si le rapport reste en chargement, autorisez les fenêtres contextuelles
                        (pop-ups) pour app.powerbi.com et vérifiez que le rapport « suivistock » est
                        partagé avec vous. Une première connexion Power BI peut être demandée.
                    </p>
                }
            />
        </PageContainer>
    );
}
