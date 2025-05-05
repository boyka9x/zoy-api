let SHOP_BUILDING = [];

export const ShopBuilder = {
    get: () => SHOP_BUILDING,
    add: (id) => {
        SHOP_BUILDING.push(id);
    },
    remove: (id) => {
        SHOP_BUILDING = SHOP_BUILDING.filter((item) => item !== id);
    },
    reset: () => {
        SHOP_BUILDING = [];
    },
    isBuilding: (id) => {
        return SHOP_BUILDING.includes(id);
    },
}