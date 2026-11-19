import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import { SalesRegionMap } from "./sales-region-map";

vi.mock("@/hooks/use-semantic-model-query", () => ({
    useSemanticModelQuery: vi.fn(),
}));

vi.mock("@microsoft/fabric-visuals", () => ({
    useCssTheme: () => ({}),
    VegaVisual: () => <div data-testid="region-chart" />,
}));

const queryHook = vi.mocked(useSemanticModelQuery);
const queryState = { isLoading: false, error: undefined, refetch: vi.fn() };
const resultMetadata = { requestId: "8152f8bf-68fd-4270-962e-32832cb1ca25", fromCache: false };
const columns = [
    { name: "Vin[Région]", dataType: "unknown" },
    { name: "[CA net]", dataType: "unknown" },
    { name: "[Bouteilles]", dataType: "unknown" },
];

afterEach(cleanup);

describe("SalesRegionMap", () => {
    it("renders a chart and an accessible detail table using the query measures", () => {
        queryHook.mockReturnValue({
            ...queryState,
            data: {
                ...resultMetadata,
                status: "success",
                table: { columns, rows: [["Alsace", 60660.015999999996, 814]] },
            },
        });
        render(<SalesRegionMap />);
        expect(screen.getByTestId("region-chart")).toBeInTheDocument();
        const row = screen.getByRole("rowheader", { name: "Alsace", hidden: true }).closest("tr")!;
        expect(within(row).getByText(/60.*660/)).toBeInTheDocument();
        expect(within(row).getByText("814")).toBeInTheDocument();
    });

    it("keeps unlocated sales visible, opens the detail and does not render an empty chart", () => {
        queryHook.mockReturnValue({
            ...queryState,
            data: {
                ...resultMetadata,
                status: "success",
                table: { columns, rows: [[null, 60660.015999999996, 814]] },
            },
        });
        render(<SalesRegionMap />);
        expect(screen.queryByTestId("region-chart")).not.toBeInTheDocument();
        expect(screen.getByText(/Origines non localisées : Non renseignée/)).toBeVisible();
        expect(screen.getByRole("rowheader", { name: "Non renseignée (non localisée)" })).toBeVisible();
        expect(screen.getByText("814")).toBeVisible();
    });

    it("surfaces query errors and handles empty results", () => {
        queryHook.mockReturnValue({
            ...queryState,
            data: undefined,
            error: new Error("Connexion indisponible"),
        });
        const { rerender } = render(<SalesRegionMap />);
        expect(screen.getByText("Connexion indisponible")).toBeVisible();

        queryHook.mockReturnValue({
            ...queryState,
            data: { ...resultMetadata, status: "success", table: { columns, rows: [] } },
        });
        rerender(<SalesRegionMap />);
        expect(screen.getByText("Aucune donnée à afficher.")).toBeVisible();
        expect(screen.queryByTestId("region-chart")).not.toBeInTheDocument();
    });
});
