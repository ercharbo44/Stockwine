//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { useState } from "react";
import { CellarProvider } from "@/store/cellar-store";
import { AppShell } from "@/components/layout/app-shell";
import type { PageKey } from "@/components/layout/navigation";
import { HomePage } from "@/pages/home.page";
import { CatalogPage } from "@/pages/catalog.page";
import { StockPage } from "@/pages/stock.page";
import { PromotionsPage } from "@/pages/promotions.page";
import { SalesPage } from "@/pages/sales.page";
import { AlertsPage } from "@/pages/alerts.page";
import { ReportPage } from "@/pages/report.page";
import { SommelierPage } from "@/pages/sommelier.page";

function App() {
    const [page, setPage] = useState<PageKey>("home");

    return (
        <CellarProvider>
            <AppShell current={page} onNavigate={setPage}>
                {page === "home" && <HomePage onNavigate={setPage} />}
                {page === "catalog" && <CatalogPage />}
                {page === "stock" && <StockPage />}
                {page === "promotions" && <PromotionsPage />}
                {page === "sales" && <SalesPage />}
                {page === "alerts" && <AlertsPage />}
                {page === "report" && <ReportPage />}
                {page === "sommelier" && <SommelierPage />}
            </AppShell>
        </CellarProvider>
    );
}

export default App;
