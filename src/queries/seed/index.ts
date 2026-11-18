import vinsDax from "./vins.dax?raw";
import stocksDax from "./stocks.dax?raw";
import promotionsDax from "./promotions.dax?raw";

/** Raw DAX used to seed the local cellar store from the Fabric semantic model. */
export const seedQueries = {
    connection: "vinsurvin",
    vins: vinsDax,
    stocks: stocksDax,
    promotions: promotionsDax,
};
